import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NAMES = [
  "Gabriel", "Lucas", "Emma", "Oliver", "Sophia",
  "Daniel", "Noah", "Ava", "James", "Isabella",
  "Mateo", "Chloe", "Liam", "Mia", "Ethan",
  "Yuki", "Arjun", "Fatima", "Chen", "Amara",
];

const TIMES = ["just now", "1 minute ago", "2 minutes ago", "3 minutes ago", "5 minutes ago"];
const ACTIONS = ["purchased", "bought", "just grabbed"];
const AVATAR_COLORS = [
  "hsl(255 62% 62%)", "hsl(340 70% 55%)", "hsl(200 80% 50%)",
  "hsl(160 60% 45%)", "hsl(30 80% 55%)", "hsl(280 60% 55%)",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface DBProduct {
  title: string;
  thumbnail_url: string | null;
  sale_price: number;
}

const SocialProofPopup = () => {
  const [dbProducts, setDbProducts] = useState<DBProduct[]>([]);
  const [notification, setNotification] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const isPaused = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const showTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("admin_products")
        .select("title, thumbnail_url, sale_price")
        .eq("status", "active");
      if (data && data.length > 0) {
        setDbProducts(data as DBProduct[]);
      }
    };
    fetchProducts();
  }, []);

  const generateNotification = useCallback(() => {
    if (dbProducts.length === 0) return null;
    const product = randomFrom(dbProducts);
    return {
      name: randomFrom(NAMES),
      productTitle: product.title,
      productImage: product.thumbnail_url || "/placeholder.svg",
      price: Number(product.sale_price),
      time: randomFrom(TIMES),
      action: randomFrom(ACTIONS),
      avatarColor: randomFrom(AVATAR_COLORS),
      id: Date.now(),
    };
  }, [dbProducts]);

  const hideNotification = useCallback(() => {
    setVisible(false);
    showTimer.current = setTimeout(() => {
      const n = generateNotification();
      if (n) {
        setNotification(n);
        setVisible(true);
      }
    }, 2000);
  }, [generateNotification]);

  const startHideTimer = useCallback(() => {
    hideTimer.current = setTimeout(() => {
      if (!isPaused.current) hideNotification();
    }, 3000);
  }, [hideNotification]);

  useEffect(() => {
    if (dbProducts.length === 0) return;
    showTimer.current = setTimeout(() => {
      const n = generateNotification();
      if (n) {
        setNotification(n);
        setVisible(true);
      }
    }, 2000);
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, [dbProducts, generateNotification]);

  useEffect(() => {
    if (visible) startHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [visible, startHideTimer]);

  const handleMouseEnter = () => {
    isPaused.current = true;
    clearTimeout(hideTimer.current);
  };

  const handleMouseLeave = () => {
    isPaused.current = false;
    startHideTimer();
  };

  const handleDismiss = () => {
    clearTimeout(hideTimer.current);
    hideNotification();
  };

  return (
    <AnimatePresence>
      {visible && notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="fixed bottom-5 left-5 z-[100] w-[320px] max-sm:left-[5%] max-sm:w-[90%] max-sm:bottom-4 cursor-pointer"
          onClick={handleDismiss}
        >
          <div
            className="relative rounded-2xl p-4 pr-10"
            style={{
              background: "#141414",
              boxShadow: "0 0 0 1px hsl(255 62% 62% / 0.2), 0 0 20px hsl(255 62% 62% / 0.1), 0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
              className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3">
              <img
                src={notification.productImage}
                alt={notification.productTitle}
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />

              <div className="min-w-0 space-y-1">
                <p className="text-[13px] leading-snug text-foreground">
                  <span className="font-semibold">{notification.name}</span>{" "}
                  <span className="text-muted-foreground">{notification.action}</span>
                </p>
                <p className="text-[13px] font-semibold leading-snug" style={{ color: "hsl(255 62% 72%)" }}>
                  {notification.productTitle}
                </p>
                <p className="text-[11px] tabular-nums text-muted-foreground">
                  ${notification.price}.00 • {notification.time}
                </p>
              </div>
            </div>

            {!isPaused.current && (
              <motion.div
                className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full origin-left"
                style={{ background: "hsl(255 62% 62% / 0.4)" }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 3, ease: "linear" }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofPopup;
