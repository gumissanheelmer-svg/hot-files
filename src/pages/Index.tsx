import { useState } from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/TopBar";
import HeroCard from "@/components/HeroCard";
import ProductCard from "@/components/ProductCard";
import SocialProofPopup from "@/components/SocialProofPopup";

import packUikit from "@/assets/pack-uikit.jpg";
import packPhotos from "@/assets/pack-photos.jpg";
import packIcons from "@/assets/pack-icons.jpg";
import packFonts from "@/assets/pack-fonts.jpg";
import packVideo from "@/assets/pack-video.jpg";
import packAudio from "@/assets/pack-audio.jpg";

const products = [
  {
    title: "UI KIT MEGA PACK 🎨",
    image: packUikit,
    discount: "-50%",
    bought: 42,
    left: 9,
    tags: ["DASHBOARDS", "MOBILE UI", "WEB TEMPLATES"],
    fileCount: "228 FILES",
    fileSize: "12.45 GB",
    originalPrice: 80,
    salePrice: 40,
  },
  {
    title: "STOCK PHOTO BUNDLE 📸",
    image: packPhotos,
    discount: "-50%",
    bought: 28,
    left: 14,
    tags: ["HIGH RES", "LIFESTYLE", "NATURE"],
    fileCount: "1,500+ PHOTOS",
    fileSize: "8.2 GB",
    originalPrice: 80,
    salePrice: 40,
  },
  {
    title: "ICON & ILLUSTRATION SET ✨",
    image: packIcons,
    discount: "-50%",
    bought: 56,
    left: 6,
    tags: ["SVG", "PNG", "FIGMA"],
    fileCount: "3,000+ ICONS",
    fileSize: "2.1 GB",
    originalPrice: 190,
    salePrice: 95,
  },
  {
    title: "PREMIUM FONTS COLLECTION 🔤",
    image: packFonts,
    discount: "-50%",
    bought: 67,
    left: 11,
    tags: ["DISPLAY", "SERIF", "SANS-SERIF"],
    fileCount: "120 FONT FAMILIES",
    fileSize: "1.8 GB",
    originalPrice: 120,
    salePrice: 60,
  },
  {
    title: "VIDEO TEMPLATES PACK 🎬",
    image: packVideo,
    discount: "-60%",
    bought: 34,
    left: 8,
    tags: ["AFTER EFFECTS", "PREMIERE", "TRANSITIONS"],
    fileCount: "450+ TEMPLATES",
    fileSize: "15.3 GB",
    originalPrice: 200,
    salePrice: 80,
  },
  {
    title: "SOUND FX & MUSIC 🎵",
    image: packAudio,
    discount: "-50%",
    bought: 89,
    left: 5,
    tags: ["SFX", "LOOPS", "AMBIENT"],
    fileCount: "2,000+ TRACKS",
    fileSize: "6.7 GB",
    originalPrice: 150,
    salePrice: 75,
  },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <SocialProofPopup />
      <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <motion.div
          className="text-center space-y-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-black text-primary tracking-tight">PREMIUM FILES</h2>
          <p className="text-sm text-muted-foreground">
            🔥 ALL VIP PACKS INCLUDED • LIFETIME • 20TB+
          </p>
        </motion.div>

        {/* Hero VIP Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <HeroCard />
        </motion.div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover={{ scale: 1.02 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center py-8 space-y-2">
          <p className="text-xs text-muted-foreground">
            All transactions are encrypted and secure.
          </p>
          <p className="text-xs text-muted-foreground">
            © 2026 Premium Files. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
