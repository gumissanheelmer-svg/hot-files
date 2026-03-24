import { useEffect, useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { DollarSign, BarChart3 } from "lucide-react";

interface Context { userId: string | null; }

const revenueConfig: ChartConfig = { revenue: { label: "Revenue", color: "hsl(var(--primary))" } };
const salesConfig: ChartConfig = { sales: { label: "Sales", color: "hsl(var(--primary))" } };

export default function DashboardAnalytics() {
  const { userId } = useOutletContext<Context>();
  const [sales, setSales] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase.from("sales").select("*").eq("user_id", userId).then(({ data }) => setSales(data || []));
  }, [userId]);

  const revenueByDay = useMemo(() => {
    const days: { date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en", { weekday: "short", day: "numeric" });
      const total = sales.filter(s => s.created_at.startsWith(key) && s.status === "confirmed").reduce((sum, s) => sum + Number(s.price), 0);
      days.push({ date: label, revenue: total });
    }
    return days;
  }, [sales]);

  const salesByDay = useMemo(() => {
    const days: { date: string; sales: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en", { weekday: "short", day: "numeric" });
      days.push({ date: label, sales: sales.filter(s => s.created_at.startsWith(key)).length });
    }
    return days;
  }, [sales]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Your store performance</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" />Revenue (7 days)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={revenueConfig} className="h-[220px] w-full">
              <AreaChart data={revenueByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />Sales (7 days)</CardTitle></CardHeader>
          <CardContent>
            <ChartContainer config={salesConfig} className="h-[220px] w-full">
              <BarChart data={salesByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
