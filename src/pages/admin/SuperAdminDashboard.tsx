import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Package, DollarSign, ShoppingCart, Trash2, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAll = async () => {
      const [profilesRes, productsRes, salesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("admin_products").select("*").order("created_at", { ascending: false }),
        supabase.from("sales").select("*").order("created_at", { ascending: false }),
      ]);
      setUsers(profilesRes.data || []);
      setProducts(productsRes.data || []);
      setSales(salesRes.data || []);
    };
    fetchAll();
  }, []);

  const totalRevenue = sales.filter(s => s.status === "confirmed").reduce((sum, s) => sum + Number(s.price), 0);

  const deleteProduct = async (id: string) => {
    await supabase.from("admin_products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: "Product removed" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Super Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage the entire platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Users", value: users.length, icon: Users },
          { title: "Total Products", value: products.length, icon: Package },
          { title: "Total Sales", value: sales.length, icon: ShoppingCart },
          { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign },
        ].map(m => (
          <Card key={m.title} className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.title}</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><m.icon className="w-4 h-4 text-primary" /></div>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-foreground">{m.value}</div></CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-base">All Users</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30">
                <TableHead>Name</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Store URL</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id} className="border-border/30">
                  <TableCell className="font-medium text-foreground">{u.full_name || "—"}</TableCell>
                  <TableCell>{u.store_name || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">/store/{u.store_slug}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Products Moderation */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-base">All Products (Moderation)</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => (
                <TableRow key={p.id} className="border-border/30">
                  <TableCell className="font-medium text-foreground text-sm">{p.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                  <TableCell>${Number(p.sale_price || p.original_price).toFixed(2)}</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-primary/10 text-primary border-0">{p.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)} className="h-8 w-8 text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-base">Recent Sales (Global)</CardTitle></CardHeader>
        <CardContent>
          {sales.slice(0, 10).map(s => (
            <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">{s.customer_name} → {s.product_title}</p>
                <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-sm font-bold text-foreground">${Number(s.price).toFixed(2)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
