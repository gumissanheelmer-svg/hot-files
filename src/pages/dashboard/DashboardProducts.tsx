import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Package, X, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BenefitsEditor from "@/components/admin/BenefitsEditor";

interface Context { userId: string | null; }

const emptyForm = {
  title: "", category: "Digital Products", description: "", thumbnail_url: "",
  tags: "", file_count: "", file_size: "", original_price: 0,
  discount_percentage: 0, stock: "", benefits: [] as string[],
};

export default function DashboardProducts() {
  const { userId } = useOutletContext<Context>();
  const [products, setProducts] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchProducts = async () => {
    if (!userId) return;
    const { data } = await supabase.from("admin_products").select("*")
      .eq("user_id", userId).order("created_at", { ascending: false });
    setProducts(data || []);
  };

  useEffect(() => { fetchProducts(); }, [userId]);

  const calculatedPrice = form.original_price * (1 - form.discount_percentage / 100);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Max 5MB", variant: "destructive" }); return; }
    setUploadingThumbnail(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-thumbnails").upload(fileName, file);
    if (error) { toast({ title: "Upload error", description: error.message, variant: "destructive" }); setUploadingThumbnail(false); return; }
    const { data: urlData } = supabase.storage.from("product-thumbnails").getPublicUrl(fileName);
    setForm((prev) => ({ ...prev, thumbnail_url: urlData.publicUrl }));
    setUploadingThumbnail(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    const payload = {
      title: form.title, category: form.category, description: form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      file_count: form.file_count || null, file_size: form.file_size || null,
      original_price: form.original_price, discount_percentage: form.discount_percentage,
      stock: form.stock ? parseInt(form.stock) : null,
      benefits: form.benefits.filter(b => b.trim() !== ""),
      user_id: userId,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("admin_products").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("admin_products").insert(payload));
    }

    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: editingId ? "Product updated" : "Product created" });
    setDialogOpen(false); setEditingId(null); setForm(emptyForm); fetchProducts();
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title, category: p.category, description: p.description || "",
      thumbnail_url: p.thumbnail_url || "", tags: (p.tags || []).join(", "),
      file_count: p.file_count || "", file_size: p.file_size || "",
      original_price: p.original_price, discount_percentage: p.discount_percentage,
      stock: p.stock?.toString() || "", benefits: p.benefits || [],
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("admin_products").delete().eq("id", id);
    toast({ title: "Product deleted" }); fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your digital products</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> New Product</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50 max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Product" : "Create Product"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-input border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-input border-border/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Thumbnail (max 5MB)</Label>
                <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                {form.thumbnail_url ? (
                  <div className="space-y-2">
                    <img src={form.thumbnail_url} alt="" className="w-full rounded-lg max-h-48 object-cover" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, thumbnail_url: "" })} className="gap-1.5 text-destructive"><X className="w-3.5 h-3.5" /> Remove</Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" onClick={() => thumbnailInputRef.current?.click()} disabled={uploadingThumbnail} className="w-full border-dashed gap-2">
                    {uploadingThumbnail ? "Uploading..." : <><ImageIcon className="w-4 h-4" /> Select image</>}
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-input border-border/50" rows={3} />
              </div>
              <BenefitsEditor benefits={form.benefits} onChange={(benefits) => setForm({ ...form, benefits })} />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Files Included</Label><Input value={form.file_count} onChange={(e) => setForm({ ...form, file_count: e.target.value })} className="bg-input border-border/50" placeholder="228 FILES" /></div>
                <div className="space-y-2"><Label>Total Size</Label><Input value={form.file_size} onChange={(e) => setForm({ ...form, file_size: e.target.value })} className="bg-input border-border/50" placeholder="12.45 GB" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })} className="bg-input border-border/50" /></div>
                <div className="space-y-2"><Label>Discount (%)</Label><Input type="number" value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: parseInt(e.target.value) || 0 })} className="bg-input border-border/50" /></div>
                <div className="space-y-2"><Label>Final Price</Label><div className="h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center px-3 text-primary font-bold">${calculatedPrice.toFixed(2)}</div></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="bg-input border-border/50" /></div>
                <div className="space-y-2"><Label>Stock (optional)</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="bg-input border-border/50" /></div>
              </div>
              <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 mt-2">
                {editingId ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No products yet. Create your first product.</p>
                  </TableCell>
                </TableRow>
              ) : products.map((p) => (
                <TableRow key={p.id} className="border-border/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.thumbnail_url ? <img src={p.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Package className="w-5 h-5 text-muted-foreground" /></div>}
                      <span className="font-medium text-foreground text-sm">{p.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.category}</TableCell>
                  <TableCell className="text-foreground font-medium">${Number(p.sale_price || p.original_price * (1 - p.discount_percentage / 100)).toFixed(2)}</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-primary/10 text-primary border-0">{p.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
