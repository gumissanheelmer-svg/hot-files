import { useState, useEffect } from "react";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroCard = () => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 56 });

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
