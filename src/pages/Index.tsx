import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TopBar from "@/components/TopBar";
import HeroCard from "@/components/HeroCard";
import ProductCard from "@/components/ProductCard";
import SocialProofPopup from "@/components/SocialProofPopup";
import { supabase } from "@/integrations/supabase/client";

interface DBProduct {
  id: string;
  title: string;
  thumbnail_url: string | null;
  tags: string[];
  file_count: string | null;
  file_size: string | null;
  original_price: number;
  discount_percentage: number;
  sale_price: number;
  stock: number | null;
  benefits: string[] | null;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("admin_products")
        .select("id, title, thumbnail_url, tags, file_count, file_size, original_price, discount_percentage, sale_price, stock, benefits")
        .eq("status", "active")
        .order("created_at", { ascending: true });
      setProducts((data as DBProduct[]) || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <SocialProofPopup />
      <TopBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <HeroCard />
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                whileHover={{ scale: 1.02 }}
              >
                <ProductCard
                  title={product.title}
                  image={product.thumbnail_url || "/placeholder.svg"}
                  discount={`-${product.discount_percentage}%`}
                  bought={Math.floor(Math.random() * 80) + 20}
                  left={product.stock || 10}
                  tags={product.tags || []}
                  fileCount={product.file_count || undefined}
                  fileSize={product.file_size || undefined}
                  originalPrice={Number(product.original_price)}
                  salePrice={Number(product.sale_price)}
                  benefits={product.benefits || undefined}
                />
              </motion.div>
            ))}
          </div>
        )}

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
