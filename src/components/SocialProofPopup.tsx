import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const NAMES = [
  "Gabriel", "Lucas", "Emma", "Oliver", "Sophia",
  "Daniel", "Noah", "Ava", "James", "Isabella",
  "Mateo", "Chloe", "Liam", "Mia", "Ethan",
  "Yuki", "Arjun", "Fatima", "Chen", "Amara",
];

const PRODUCTS = [
  { name: "Aurora Dashboard UI Kit", price: 49 },
  { name: "Figma Startup Landing Page", price: 39 },
  { name: "SaaS UI Kit Pro", price: 59 },
  { name: "Icon Mega Pack 3000+", price: 29 },
  { name: "Motion Graphics Bundle", price: 79 },
  { name: "Premium Font Collection", price: 45 },
  { name: "Stock Photo Lifestyle Pack", price: 35 },
  { name: "After Effects Templates", price: 69 },
  { name: "Sound FX Pro Bundle", price: 55 },
  { name: "Mobile UI Component Kit", price: 42 },
];

const TIMES = ["just now", "1 minute ago", "2 minutes ago", "3 minutes ago", "5 minutes ago"];
const ACTIONS = ["purchased", "bought", "just grabbed"];
const AVATARS_COLORS = [
  "hsl(255 62% 62%)", "hsl(340 70% 55%)", "hsl(200 80% 50%)",
  "hsl(160 60% 45%)", "hsl(30 80% 55%)", "hsl(280 60% 55%)",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateNotification() {
  const name = randomFrom(NAMES);
  const product = randomFrom(PRODUCTS);
  const time = randomFrom(TIMES);
  const action = randomFrom(ACTIONS);
  const color = randomFrom(AVATARS_COLORS);
  return { name, product, time, action, avatarColor: color, id: Date.now() };
}

const SocialProofPopup = () => {
  const [notification, setNotification] = useState<ReturnType<typeof generateNotification> | null>(null);
  const [visible, setVisible] = useState(false);
  const isPaused = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const showTimer = useRef<ReturnType<typeof setTimeout>>();

  const hideNotification = useCallback(() => {
    setVisible(false);
    // Schedule next
    const delay = 2000;
    showTimer.current = setTimeout(() => {
      setNotification(generateNotification());
      setVisible(true);
    }, delay);
  }, []);

  const startHideTimer = useCallback(() => {
    hideTimer.current = setTimeout(() => {
      if (!isPaused.current) hideNotification();
    }, 3000);
  }, [hideNotification]);

  // Initial show
  useEffect(() => {
    const initial = 2000;
    showTimer.current = setTimeout(() => {
      setNotification(generateNotification());
      setVisible(true);
    }, initial);
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  // When visible changes, manage hide timer
  useEffect(() => {
    if (visible) {
      startHideTimer();
    }
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
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
              className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: notification.avatarColor, color: "#fff" }}
              >
                {notification.name.charAt(0)}
              </div>

              <div className="min-w-0 space-y-1">
                {/* Name + action */}
                <p className="text-[13px] leading-snug text-foreground">
                  <span className="font-semibold">{notification.name}</span>{" "}
                  <span className="text-muted-foreground">{notification.action}</span>
                </p>
                {/* Product */}
                <p className="text-[13px] font-semibold leading-snug" style={{ color: "hsl(255 62% 72%)" }}>
                  {notification.product.name}
                </p>
                {/* Price + time */}
                <p className="text-[11px] tabular-nums text-muted-foreground">
                  ${notification.product.price}.00 • {notification.time}
                </p>
              </div>
            </div>

            {/* Subtle progress bar */}
            {!isPaused.current && (
              <motion.div
                className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full origin-left"
                style={{ background: "hsl(255 62% 62% / 0.4)" }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: "linear" }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofPopup;
