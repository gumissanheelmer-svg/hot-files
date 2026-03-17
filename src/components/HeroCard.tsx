import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import heroBanner from "@/assets/hero-banner.jpg";

interface HeroCardProps {
  dmLink?: string;
}

const FALLBACK_DM_LINK = "https://wa.me/258000000000?text=Hello%20I%20want%20to%20buy%20this%20product";

function buildHeroDmUrl(rawLink: string): string {
  let link = rawLink.trim();
  if (!link) return FALLBACK_DM_LINK;
  if (!link.startsWith("https://") && !link.startsWith("http://")) link = `https://${link}`;
  const message = `Hello, I want to buy the VIP ALL ACCESS pack for $150`;
  try {
    const url = new URL(link);
    if (url.hostname.includes("wa.me")) { url.searchParams.set("text", message); return url.toString(); }
    if (url.hostname.includes("t.me")) return `${url.origin}${url.pathname}?text=${encodeURIComponent(message)}`;
    return link;
  } catch { return FALLBACK_DM_LINK; }
}

const HeroCard = ({ dmLink = "" }: HeroCardProps) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 56 });
  const [clicking, setClicking] = useState(false);

  const handleDmClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (clicking) return;
    setClicking(true);
    try { window.open(buildHeroDmUrl(dmLink), "_blank", "noopener,noreferrer"); }
    catch { toast({ title: "Unable to open DM. Please try again.", variant: "destructive" }); }
    setTimeout(() => setClicking(false), 1000);
  }, [clicking, dmLink]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return { minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card-surface overflow-hidden">
      {/* Timer bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <span className="text-sm font-semibold tabular-nums text-primary">
          ⏳ {timeLeft.minutes}:{String(timeLeft.seconds).padStart(2, "0")} left
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          ⚡ ONLY 8 ALL-ACCESS SPOTS
        </span>
      </div>

      {/* Live buyers */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50">
        <div className="flex items-center gap-2">
          <span className="pulse-dot" />
          <span className="text-success text-xs font-bold">84 BUYING NOW</span>
        </div>
        <span className="text-xs text-muted-foreground">👥 1,240+ sold</span>
      </div>

      {/* Banner image */}
      <div className="relative">
        <img src={heroBanner} alt="Premium digital assets bundle" className="w-full h-48 object-cover" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <span className="badge-gold">🏆 VIP ALL ACCESS</span>

        <ul className="space-y-1.5 text-sm">
          <li className="text-foreground">✅ All Premium Template Packs</li>
          <li className="text-foreground">✅ 20TB+ total · daily updates</li>
          <li className="text-foreground">🎁 BONUS: 50+ premium packs below INCLUDED</li>
        </ul>

        <div className="flex items-center gap-3">
          <span className="price-old">$300</span>
          <span className="price-current">$150</span>
          <span className="badge-discount">SAVE $150</span>
        </div>

        <button className="btn-pay">💳 PAY $150 – PAYPAL</button>
        <button className="btn-secondary-action">SUPPORT / SEND PROOF</button>
      </div>
    </div>
  );
};

export default HeroCard;
