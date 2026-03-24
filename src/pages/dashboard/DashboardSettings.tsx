import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Store, Send, Palette, ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Context { userId: string | null; }

const COLOR_PRESETS = [
  { label: "Purple", value: "#6C3BFF" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Red", value: "#EF4444" },
  { label: "Green", value: "#22C55E" },
];

export default function DashboardSettings() {
  const { userId } = useOutletContext<Context>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    store_name: "",
    store_slug: "",
    telegram_link: "",
    primary_color: "#6C3BFF",
    logo_url: "",
  });

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      if (data) {
        setForm({
          store_name: data.store_name || "",
          store_slug: data.store_slug || "",
          telegram_link: data.telegram_link || "",
          primary_color: data.primary_color || "#6C3BFF",
          logo_url: data.logo_url || "",
        });
      }
      setLoading(false);
    };
    fetch();
  }, [userId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: "Max 2MB", variant: "destructive" }); return; }
    setUploadingLogo(true);
    const fileName = `${userId}-logo-${Date.now()}`;
    const { error } = await supabase.storage.from("product-thumbnails").upload(fileName, file);
    if (error) { toast({ title: "Upload error", variant: "destructive" }); setUploadingLogo(false); return; }
    const { data: urlData } = supabase.storage.from("product-thumbnails").getPublicUrl(fileName);
    setForm((prev) => ({ ...prev, logo_url: urlData.publicUrl }));
    setUploadingLogo(false);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      store_name: form.store_name,
      store_slug: form.store_slug,
      telegram_link: form.telegram_link,
      primary_color: form.primary_color,
      logo_url: form.logo_url || null,
    }).eq("id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved!" });
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your store</p>
      </div>

      {!form.telegram_link && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
          ⚠️ Telegram link not configured. Customers can't contact you.
        </div>
      )}

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Store className="w-5 h-5 text-primary" /> Store Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} className="bg-input border-border/50" placeholder="My Awesome Store" />
            </div>
            <div className="space-y-2">
              <Label>Store URL Slug</Label>
              <Input value={form.store_slug} onChange={(e) => setForm({ ...form, store_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} className="bg-input border-border/50" placeholder="my-store" />
              <p className="text-xs text-muted-foreground">/store/{form.store_slug || "..."}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Telegram Contact</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Telegram Username or Link</Label>
            <Input value={form.telegram_link} onChange={(e) => setForm({ ...form, telegram_link: e.target.value })} className="bg-input border-border/50" placeholder="https://t.me/username" />
            <p className="text-xs text-muted-foreground">Used on all "Contact on Telegram" buttons in your store.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Store Customization</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              {COLOR_PRESETS.map((c) => (
                <button key={c.value} onClick={() => setForm({ ...form, primary_color: c.value })}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${form.primary_color === c.value ? "border-foreground scale-110" : "border-border/50"}`}
                  style={{ background: c.value }} title={c.label} />
              ))}
              <Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                className="w-10 h-10 p-0 border-border/50 cursor-pointer" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Store Logo</Label>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            {form.logo_url ? (
              <div className="space-y-2">
                <img src={form.logo_url} alt="Logo" className="w-20 h-20 rounded-lg object-cover" />
                <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, logo_url: "" })} className="gap-1.5 text-destructive"><X className="w-3.5 h-3.5" /> Remove</Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo} className="border-dashed gap-2">
                {uploadingLogo ? "Uploading..." : <><ImageIcon className="w-4 h-4" /> Upload Logo</>}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full bg-primary hover:bg-primary/90 gap-2">
        <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
