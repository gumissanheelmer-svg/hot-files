import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X, Eye, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Sale {
  id: string;
  customer_name: string;
  customer_email: string | null;
  product_title: string;
  price: number;
  payment_proof_url: string | null;
  status: string;
  created_at: string;
}

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSales = async () => {
    const { data } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });
    setSales((data as Sale[]) || []);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("sales").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    const label = status === "confirmed" ? "confirmada" : "rejeitada";
    toast({ title: `Venda ${label}` });
    fetchSales();
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Confirmado";
      case "rejected": return "Rejeitado";
      default: return "Pendente";
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-400 border-0";
      case "rejected": return "bg-red-500/10 text-red-400 border-0";
      default: return "bg-yellow-500/10 text-yellow-400 border-0";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Vendas</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie e confirme pagamentos</p>
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Comprovante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhuma venda ainda.</p>
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id} className="border-border/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">{sale.customer_name}</p>
                        {sale.customer_email && (
                          <p className="text-xs text-muted-foreground">{sale.customer_email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{sale.product_title}</TableCell>
                    <TableCell className="font-medium text-foreground">${Number(sale.price).toFixed(2)}</TableCell>
                    <TableCell>
                      {sale.payment_proof_url ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setProofUrl(sale.payment_proof_url)}
                          className="gap-1 text-primary hover:bg-primary/10"
                        >
                          <Eye className="w-3 h-3" /> Ver
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sem comprovante</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sale.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColor(sale.status)}>{statusLabel(sale.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.status === "pending" && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(sale.id, "confirmed")}
                            className="h-8 w-8 hover:bg-green-500/10 hover:text-green-400"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(sale.id, "rejected")}
                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!proofUrl} onOpenChange={() => setProofUrl(null)}>
        <DialogContent className="bg-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle>Comprovante de Pagamento</DialogTitle>
          </DialogHeader>
          {proofUrl && (
            <img src={proofUrl} alt="Comprovante" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
