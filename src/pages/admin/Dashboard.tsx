import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Activity,
} from "lucide-react";

interface Metrics {
  salesToday: number;
  revenueToday: number;
  totalOrders: number;
  totalProducts: number;
}

interface RecentSale {
  id: string;
  customer_name: string;
  product_title: string;
  price: number;
  created_at: string;
}

const MetricCard = ({
  title,
  value,
  icon: Icon,
  prefix = "",
}: {
  title: string;
  value: string | number;
  icon: any;
  prefix?: string;
}) => (
  <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">
        {prefix}{value}
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    salesToday: 0,
    revenueToday: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split("T")[0];

      const [salesRes, productsRes, recentRes] = await Promise.all([
        supabase.from("sales").select("*"),
        supabase.from("admin_products").select("id"),
        supabase.from("sales").select("*").order("created_at", { ascending: false }).limit(10),
      ]);

      const allSales = salesRes.data || [];
      const todaySales = allSales.filter((s) => s.created_at.startsWith(today));
      const confirmedToday = todaySales.filter((s) => s.status === "confirmed");

      setMetrics({
        salesToday: confirmedToday.length,
        revenueToday: confirmedToday.reduce((sum, s) => sum + Number(s.price), 0),
        totalOrders: allSales.length,
        totalProducts: productsRes.data?.length || 0,
      });

      setRecentSales(recentRes.data || []);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your marketplace</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Sales Today" value={metrics.salesToday} icon={ShoppingCart} />
        <MetricCard title="Revenue Today" value={metrics.revenueToday.toFixed(2)} icon={DollarSign} prefix="$" />
        <MetricCard title="Total Orders" value={metrics.totalOrders} icon={TrendingUp} />
        <MetricCard title="Total Products" value={metrics.totalProducts} icon={Package} />
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                >
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{sale.customer_name}</span>{" "}
                      purchased{" "}
                      <span className="text-primary font-medium">{sale.product_title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">${Number(sale.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
