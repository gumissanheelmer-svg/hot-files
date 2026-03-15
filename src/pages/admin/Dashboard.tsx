import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";

interface Sale {
  id: string;
  customer_name: string;
  product_title: string;
  price: number;
  status: string;
  created_at: string;
}

const MetricCard = ({
  title,
  value,
  icon: Icon,
  prefix = "",
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  prefix?: string;
  trend?: string;
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
      {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
    </CardContent>
  </Card>
);

const revenueChartConfig: ChartConfig = {
  receita: { label: "Receita", color: "hsl(var(--primary))" },
};

const salesChartConfig: ChartConfig = {
  vendas: { label: "Vendas", color: "hsl(var(--primary))" },
};

const statusChartConfig: ChartConfig = {
  confirmado: { label: "Confirmado", color: "hsl(142 76% 36%)" },
  pendente: { label: "Pendente", color: "hsl(45 93% 47%)" },
  rejeitado: { label: "Rejeitado", color: "hsl(0 84% 60%)" },
};

const PIE_COLORS = ["hsl(142, 76%, 36%)", "hsl(45, 93%, 47%)", "hsl(0, 84%, 60%)"];

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [salesRes, productsRes] = await Promise.all([
        supabase.from("sales").select("*"),
        supabase.from("admin_products").select("id"),
      ]);
      setSales(salesRes.data || []);
      setTotalProducts(productsRes.data?.length || 0);
    };
    fetchData();
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todaySales = sales.filter((s) => s.created_at.startsWith(today));
  const confirmedToday = todaySales.filter((s) => s.status === "confirmed");
  const revenueToday = confirmedToday.reduce((sum, s) => sum + Number(s.price), 0);

  // Last 7 days revenue chart
  const revenueByDay = useMemo(() => {
    const days: { date: string; receita: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
      const daySales = sales.filter(
        (s) => s.created_at.startsWith(key) && s.status === "confirmed"
      );
      const total = daySales.reduce((sum, s) => sum + Number(s.price), 0);
      days.push({ date: label, receita: total });
    }
    return days;
  }, [sales]);

  // Sales count by day (bar chart)
  const salesByDay = useMemo(() => {
    const days: { date: string; vendas: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
      const count = sales.filter((s) => s.created_at.startsWith(key)).length;
      days.push({ date: label, vendas: count });
    }
    return days;
  }, [sales]);

  // Status distribution (pie chart)
  const statusData = useMemo(() => {
    const confirmed = sales.filter((s) => s.status === "confirmed").length;
    const pending = sales.filter((s) => s.status === "pending").length;
    const rejected = sales.filter((s) => s.status === "rejected").length;
    return [
      { name: "Confirmado", value: confirmed },
      { name: "Pendente", value: pending },
      { name: "Rejeitado", value: rejected },
    ].filter((d) => d.value > 0);
  }, [sales]);

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8),
    [sales]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do seu marketplace</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Vendas Hoje" value={confirmedToday.length} icon={ShoppingCart} />
        <MetricCard title="Receita Hoje" value={revenueToday.toFixed(2)} icon={DollarSign} prefix="$" />
        <MetricCard title="Total de Pedidos" value={sales.length} icon={TrendingUp} />
        <MetricCard title="Total de Produtos" value={totalProducts} icon={Package} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Area Chart */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Receita (Últimos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[220px] w-full">
              <AreaChart data={revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Sales Bar Chart */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Vendas (Últimos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={salesChartConfig} className="h-[220px] w-full">
              <BarChart data={salesByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Pie Chart */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Status dos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10">Sem dados ainda.</p>
            ) : (
              <ChartContainer config={statusChartConfig} className="h-[220px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="text-sm text-muted-foreground py-10">Nenhuma atividade recente.</p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between py-1.5 border-b border-border/20 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">
                        <span className="font-medium">{sale.customer_name}</span>{" "}
                        comprou{" "}
                        <span className="text-primary font-medium">{sale.product_title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(sale.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-foreground ml-2 shrink-0">
                      ${Number(sale.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
