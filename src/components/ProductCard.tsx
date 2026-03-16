import { CheckCircle } from "lucide-react";

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
}: ProductCardProps) => {
  return (
    <div className="card-surface overflow-hidden">
      <img src={image} alt={title} className="w-full h-40 object-cover" />
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

        <button className="btn-pay">💳 PAY ${salePrice}</button>

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
