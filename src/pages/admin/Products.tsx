import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BenefitsEditor from "@/components/admin/BenefitsEditor";

interface Product {
  id: string;
  title: string;
  category: string;
  thumbnail_url: string | null;
  tags: string[];
  file_count: string | null;
  file_size: string | null;
  original_price: number;
  discount_percentage: number;
  sale_price: number;
  stock: number | null;
  status: string;
  description: string | null;
  payment_link: string | null;
  support_link: string | null;
  benefits: string[] | null;
}

const emptyForm = {
  title: "",
  category: "UI Kits",
  description: "",
  thumbnail_url: "",
  tags: "",
  file_count: "",
  file_size: "",
  original_price: 0,
  discount_percentage: 0,
  stock: "",
  payment_link: "",
  support_link: "",
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("admin_products")
      .select("*")
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const calculatedPrice = form.original_price * (1 - form.discount_percentage / 100);

  const handleSave = async () => {
    const payload = {
      title: form.title,
      category: form.category,
      description: form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      file_count: form.file_count || null,
      file_size: form.file_size || null,
      original_price: form.original_price,
      discount_percentage: form.discount_percentage,
      stock: form.stock ? parseInt(form.stock) : null,
      payment_link: form.payment_link || null,
      support_link: form.support_link || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("admin_products").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("admin_products").insert(payload));
    }

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editingId ? "Produto atualizado" : "Produto criado" });
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchProducts();
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      category: p.category,
      description: p.description || "",
      thumbnail_url: p.thumbnail_url || "",
      tags: (p.tags || []).join(", "),
      file_count: p.file_count || "",
      file_size: p.file_size || "",
      original_price: p.original_price,
      discount_percentage: p.discount_percentage,
      stock: p.stock?.toString() || "",
      payment_link: p.payment_link || "",
      support_link: p.support_link || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("admin_products").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Produto excluído" });
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os produtos do marketplace</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/50 max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Produto" : "Criar Novo Produto"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título do Produto</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-input border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-input border-border/50" placeholder="UI Kits, Templates, Fotos..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL da Thumbnail</Label>
                <Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} className="bg-input border-border/50" />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-input border-border/50" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Arquivos Incluídos</Label>
                  <Input value={form.file_count} onChange={(e) => setForm({ ...form, file_count: e.target.value })} className="bg-input border-border/50" placeholder="228 ARQUIVOS" />
                </div>
                <div className="space-y-2">
                  <Label>Tamanho Total</Label>
                  <Input value={form.file_size} onChange={(e) => setForm({ ...form, file_size: e.target.value })} className="bg-input border-border/50" placeholder="12.45 GB" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Preço Original ($)</Label>
                  <Input type="number" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })} className="bg-input border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label>Desconto (%)</Label>
                  <Input type="number" value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: parseInt(e.target.value) || 0 })} className="bg-input border-border/50" />
                </div>
                <div className="space-y-2">
                  <Label>Preço Final</Label>
                  <div className="h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center px-3 text-primary font-bold">
                    ${calculatedPrice.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tags (separadas por vírgula)</Label>
                  <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="bg-input border-border/50" placeholder="UI Kit, Dashboard, Figma" />
                </div>
                <div className="space-y-2">
                  <Label>Estoque (opcional)</Label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="bg-input border-border/50" placeholder="Vazio = ilimitado" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link de Pagamento</Label>
                  <Input value={form.payment_link} onChange={(e) => setForm({ ...form, payment_link: e.target.value })} className="bg-input border-border/50" placeholder="https://stripe.com/..." />
                </div>
                <div className="space-y-2">
                  <Label>Link de Suporte</Label>
                  <Input value={form.support_link} onChange={(e) => setForm({ ...form, support_link: e.target.value })} className="bg-input border-border/50" placeholder="https://t.me/suporte" />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 mt-2">
                {editingId ? "Atualizar Produto" : "Criar Produto"}
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
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhum produto ainda. Crie o primeiro produto.</p>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id} className="border-border/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.thumbnail_url ? (
                          <img src={p.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-foreground text-sm">{p.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.category}</TableCell>
                    <TableCell className="text-foreground font-medium">${Number(p.sale_price).toFixed(2)}</TableCell>
                    <TableCell>
                      {p.discount_percentage > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                          -{p.discount_percentage}%
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {p.stock !== null ? `${p.stock} restantes` : "∞"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.status === "active" ? "default" : "secondary"} className={p.status === "active" ? "bg-green-500/10 text-green-400 border-0" : ""}>
                        {p.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
