import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Context { userId: string | null; }

export default function DashboardSales() {
  const { userId } = useOutletContext<Context>();
  const [sales, setSales] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchSales = async () => {
    if (!userId) return;
    const { data } = await supabase.from("sales").select("*")
      .eq("user_id", userId).order("created_at", { ascending: false });
    setSales(data || []);
  };

  useEffect(() => { fetchSales(); }, [userId]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("sales").update({ status }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: `Sale ${status}` }); fetchSales();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your orders</p>
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30">
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No sales yet.</p>
                  </TableCell>
                </TableRow>
              ) : sales.map((s) => (
                <TableRow key={s.id} className="border-border/30">
                  <TableCell className="font-medium text-foreground text-sm">{s.customer_name}</TableCell>
                  <TableCell className="text-sm">{s.product_title}</TableCell>
                  <TableCell className="font-medium">${Number(s.price).toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={s.status === "confirmed" ? "bg-green-500/10 text-green-400 border-0" : s.status === "rejected" ? "bg-red-500/10 text-red-400 border-0" : "bg-yellow-500/10 text-yellow-400 border-0"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {s.status === "pending" && (
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => updateStatus(s.id, "confirmed")} className="h-8 w-8 hover:bg-green-500/10 hover:text-green-400"><Check className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => updateStatus(s.id, "rejected")} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400"><X className="w-4 h-4" /></Button>
                      </div>
                    )}
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
