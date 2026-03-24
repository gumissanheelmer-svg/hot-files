import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";

interface Context { userId: string | null; }

export default function DashboardHome() {
  const { userId } = useOutletContext<Context>();
  const [sales, setSales] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      const [salesRes, productsRes] = await Promise.all([
        supabase.from("sales").select("*").eq("user_id", userId),
        supabase.from("admin_products").select("id").eq("user_id", userId),
      ]);
      setSales(salesRes.data || []);
      setTotalProducts(productsRes.data?.length || 0);
    };
    fetchData();
  }, [userId]);

  const today = new Date().toISOString().split("T")[0];
  const confirmedToday = sales.filter((s) => s.created_at.startsWith(today) && s.status === "confirmed");
  const revenueToday = confirmedToday.reduce((sum, s) => sum + Number(s.price), 0);

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
    [sales]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Sales Today", value: confirmedToday.length, icon: ShoppingCart },
          { title: "Revenue Today", value: `$${revenueToday.toFixed(2)}`, icon: DollarSign },
          { title: "Total Orders", value: sales.length, icon: TrendingUp },
          { title: "Total Products", value: totalProducts, icon: Package },
        ].map((m) => (
          <Card key={m.title} className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{m.title}</CardTitle>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <m.icon className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSales.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No sales yet.</p>
          ) : (
            <div className="space-y-2">
              {recentSales.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{s.product_title}</p>
                  </div>
                  <span className="text-sm font-bold text-foreground">${Number(s.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
