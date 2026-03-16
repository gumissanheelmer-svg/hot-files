import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, MessageCircle, Settings as SettingsIcon, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    site_name: "",
    support_link: "",
    currency: "USD",
    enable_discounts: true,
    enable_scarcity: true,
    dm_platform: "telegram",
    dm_link: "",
  });

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (data) {
        setForm({
          site_name: data.site_name || "",
          support_link: data.support_link || "",
          currency: data.currency || "USD",
          enable_discounts: data.enable_discounts ?? true,
          enable_scarcity: data.enable_scarcity ?? true,
          dm_platform: (data as any).dm_platform || "telegram",
          dm_link: (data as any).dm_link || "",
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      site_name: form.site_name,
      support_link: form.support_link,
      currency: form.currency,
      enable_discounts: form.enable_discounts,
      enable_scarcity: form.enable_scarcity,
      dm_platform: form.dm_platform,
      dm_link: form.dm_link,
    } as any).eq("id", 1);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Configurações salvas" });
    }
    setSaving(false);
  };

  const dmPlaceholders: Record<string, string> = {
    telegram: "https://t.me/username",
    whatsapp: "https://wa.me/258XXXXXXXXX",
    instagram: "https://instagram.com/username",
    custom: "https://...",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure o seu marketplace</p>
      </div>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" /> Contato por DM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Plataforma de DM</Label>
            <Select value={form.dm_platform} onValueChange={(v) => setForm({ ...form, dm_platform: v })}>
              <SelectTrigger className="bg-input border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="custom">Link Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Link de DM</Label>
            <Input
              value={form.dm_link}
              onChange={(e) => setForm({ ...form, dm_link: e.target.value })}
              className="bg-input border-border/50"
              placeholder={dmPlaceholders[form.dm_platform] || "https://..."}
            />
            <p className="text-xs text-muted-foreground">
              Este link será usado no botão "DM Me Now" em todos os cards de produto.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" /> Suporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Link do Telegram de Suporte</Label>
            <Input value={form.support_link} onChange={(e) => setForm({ ...form, support_link: e.target.value })} className="bg-input border-border/50" placeholder="https://t.me/suporte" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" /> Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Site</Label>
              <Input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="bg-input border-border/50" />
            </div>
            <div className="space-y-2">
              <Label>Moeda</Label>
              <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="bg-input border-border/50" />
            </div>
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>Ativar Descontos</Label>
            <Switch checked={form.enable_discounts} onCheckedChange={(v) => setForm({ ...form, enable_discounts: v })} />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label>Ativar Mensagens de Escassez</Label>
            <Switch checked={form.enable_scarcity} onCheckedChange={(v) => setForm({ ...form, enable_scarcity: v })} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 gap-2">
        <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  );
}
