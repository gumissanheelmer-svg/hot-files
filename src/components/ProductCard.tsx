import { CheckCircle } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  title: string;
  image: string;
  discount: string;
  bought: number;
  left: number;
  tags: string[];
  fileCount?: string;
  fileSize?: string;
  originalPrice: number;
  salePrice: number;
  benefits?: string[];
  dmLink?: string;
  videoUrl?: string;
}

const ProductCard = ({
  title,
  image,
  discount,
  bought,
  left,
  tags,
  fileCount,
  fileSize,
  originalPrice,
  salePrice,
  benefits,
  dmLink,
  videoUrl,
}: ProductCardProps) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="card-surface overflow-hidden">
      <div className="relative">
        {showVideo && videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-40 object-cover bg-black"
          />
        ) : (
          <img src={image} alt={title} className="w-full h-40 object-cover" />
        )}
        {videoUrl && !showVideo && (
          <button
            onClick={() => setShowVideo(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          <span className="badge-discount">{discount}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>🔥 {bought} bought</span>
          <span className="text-primary font-semibold">📦 only {left} left</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-1 rounded-md bg-secondary text-xs text-secondary-foreground font-medium">
              {tag}
            </span>
          ))}
        </div>

        {benefits && benefits.length > 0 && (
          <div className="space-y-1">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-bold text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        )}

        {(fileCount || fileSize) && (
          <div className="flex gap-4 text-xs text-muted-foreground tabular-nums">
            {fileCount && <span>📁 {fileCount}</span>}
            {fileSize && <span>💾 {fileSize}</span>}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="price-old">${originalPrice}</span>
          <span className="text-2xl font-black text-primary">${salePrice}</span>
        </div>

        {dmLink && (
          <a
            href={dmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[hsl(255,62%,55%)] to-[hsl(280,60%,55%)] hover:from-[hsl(255,62%,62%)] hover:to-[hsl(280,60%,62%)] shadow-[0_0_20px_hsl(255_62%_62%/0.3)] hover:shadow-[0_0_30px_hsl(255_62%_62%/0.5)] transition-all duration-300"
          >
            💬 Get Instant Access — DM Me Now
          </a>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
