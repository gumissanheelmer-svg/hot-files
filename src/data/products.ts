import packUikit from "@/assets/pack-uikit.jpg";
import packPhotos from "@/assets/pack-photos.jpg";
import packIcons from "@/assets/pack-icons.jpg";
import packFonts from "@/assets/pack-fonts.jpg";
import packVideo from "@/assets/pack-video.jpg";
import packAudio from "@/assets/pack-audio.jpg";

export interface Product {
  title: string;
  image: string;
  discount: string;
  bought: number;
  left: number;
  tags: string[];
  fileCount: string;
  fileSize: string;
  originalPrice: number;
  salePrice: number;
}

export const products: Product[] = [
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
