import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { CheckCircle, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import StoreTimeline from "@/components/store/StoreTimeline";

function ensureHttps(url: string): string {
  const t = url.trim();
  if (!t) return "";
  if (t.startsWith("https://") || t.startsWith("http://")) return t;
  return `https://${t}`;
}

function buildTelegramUrl(link: string, title: string, price: number): string {
  const url = ensureHttps(link);
  if (!url) return "#";
  const msg = encodeURIComponent(`Hello, I want to buy "${title}" from your store.`);
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("t.me")) return `${parsed.origin}${parsed.pathname}?text=${msg}`;
    return url;
  } catch { return url; }
}

interface StoreProfile {
  store_name: string;
  telegram_link: string;
  primary_color: string;
  logo_url: string | null;
  id: string;
  timeline_enabled: boolean;
  timeline_mode: string;
  timeline_show_timestamps: boolean;
  timeline_show_views: boolean;
}

export default function StorePage() {
  const { slug } = useParams();
  const [profile, setProfile] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: prof } = await supabase.from("profiles").select("*").eq("store_slug", slug).single();
      if (!prof) { setNotFound(true); setLoading(false); return; }
      setProfile(prof as any);

      const { data: prods } = await supabase.from("admin_products").select("*")
        .eq("user_id", prof.id).eq("status", "active").order("created_at", { ascending: true });
      setProducts(prods || []);
      setLoading(false);
    };
    fetch();
  }, [slug]);

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Store Not Found</h1>
        <p className="text-muted-foreground">This store doesn't exist.</p>
      </div>
    </div>
  );

  const color = profile?.primary_color || "#6C3BFF";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-center h-12 gap-3">
            {profile?.logo_url && <img src={profile.logo_url} alt="" className="w-6 h-6 rounded-md object-cover" />}
            <h1 className="text-sm font-semibold tracking-tight" style={{ color }}>
              {profile?.store_name || "Store"}
            </h1>
          </div>
          <div className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-9 pr-4 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <motion.div className="text-center space-y-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-black tracking-tight" style={{ color }}>{profile?.store_name || "Store"}</h2>
          <p className="text-sm text-muted-foreground">Digital Products Store</p>
        </motion.div>

        {profile?.timeline_enabled && profile?.id && (
          <StoreTimeline
            userId={profile.id}
            color={color}
            telegramLink={profile.telegram_link || ""}
            mode={profile.timeline_mode as "stories" | "feed"}
            showTimestamps={profile.timeline_show_timestamps}
            showViews={profile.timeline_show_views}
          />
        )}

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No products available.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((product, index) => (
              <StoreProductCard key={product.id} product={product} color={color} telegramLink={profile?.telegram_link || ""} index={index} />
            ))}
          </div>
        )}

        <footer className="text-center py-8">
          <p className="text-xs text-muted-foreground">Powered by Premium Files Marketplace</p>
        </footer>
      </main>
    </div>
  );
}

function StoreProductCard({ product, color, telegramLink, index }: { product: any; color: string; telegramLink: string; index: number }) {
  const [clicking, setClicking] = useState(false);
  const salePrice = product.sale_price || product.original_price * (1 - product.discount_percentage / 100);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (clicking) return;
    setClicking(true);
    const url = buildTelegramUrl(telegramLink, product.title, salePrice);
    if (url === "#") { toast({ title: "Seller hasn't configured Telegram contact", variant: "destructive" }); }
    else { try { window.open(url, "_blank", "noopener,noreferrer"); } catch { toast({ title: "Unable to open link", variant: "destructive" }); } }
    setTimeout(() => setClicking(false), 1000);
  }, [clicking, telegramLink, product.title, salePrice]);

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }} className="card-surface overflow-hidden">
      <div className="relative">
        <img src={product.thumbnail_url || "/placeholder.svg"} alt={product.title} className="w-full h-40 object-cover" />
        {product.discount_percentage > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-bold text-white" style={{ background: color }}>
            -{product.discount_percentage}%
          </span>
        )}
      </div>
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground">{product.title}</h3>
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag: string) => (
              <span key={tag} className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground font-medium">{tag}</span>
            ))}
          </div>
        )}
        {product.benefits?.length > 0 && (
          <div className="space-y-1">
            {product.benefits.map((b: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                <span className="text-xs font-bold text-foreground">{b}</span>
              </div>
            ))}
          </div>
        )}
        {(product.file_count || product.file_size) && (
          <div className="flex gap-4 text-xs text-muted-foreground">
            {product.file_count && <span>📁 {product.file_count}</span>}
            {product.file_size && <span>💾 {product.file_size}</span>}
          </div>
        )}
        <div className="flex items-center gap-3">
          {product.discount_percentage > 0 && <span className="line-through text-muted-foreground text-sm">${product.original_price}</span>}
          <span className="text-2xl font-black" style={{ color }}>${salePrice.toFixed(2)}</span>
        </div>
        <button onClick={handleClick} disabled={clicking}
          className="block w-full text-center py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 disabled:opacity-70"
          style={{ background: color, boxShadow: `0 0 20px ${color}40` }}>
          {clicking ? "Opening..." : "💬 Contact on Telegram"}
        </button>
      </div>
    </motion.div>
  );
}
