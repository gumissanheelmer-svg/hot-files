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
        <button className="btn-secondary-action">SUPPORT / SEND PROOF</button>
      </div>
    </div>
  );
};

export default ProductCard;
