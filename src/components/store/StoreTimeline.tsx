import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Eye, X } from "lucide-react";

interface TimelinePost {
  id: string;
  image_url: string | null;
  video_url: string | null;
  title: string | null;
  caption: string;
  has_cta: boolean;
  views_count: number;
  created_at: string;
}

interface Props {
  userId: string;
  color: string;
  telegramLink: string;
  mode: "stories" | "feed";
  showTimestamps: boolean;
  showViews: boolean;
}

function buildCtaUrl(link: string): string {
  const t = link.trim();
  if (!t) return "#";
  if (t.startsWith("https://") || t.startsWith("http://")) return t;
  return `https://${t}`;
}

export default function StoreTimeline({ userId, color, telegramLink, mode, showTimestamps, showViews }: Props) {
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<TimelinePost | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("timeline_posts")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true });
      setPosts((data as TimelinePost[]) || []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  const incrementViews = async (postId: string) => {
    await supabase.rpc("increment_timeline_views" as any, { post_id: postId }).catch(() => {});
  };

  if (loading || posts.length === 0) return null;

  if (mode === "stories") {
    return (
      <>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
          {posts.map((post, i) => (
            <motion.button
              key={post.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { setSelectedStory(post); incrementViews(post.id); }}
              className="shrink-0 flex flex-col items-center gap-1.5 group"
            >
              <div className="w-16 h-16 rounded-full p-[2.5px]" style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-background p-[2px]">
                  {post.image_url ? (
                    <img src={post.image_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : post.video_url ? (
                    <video src={post.video_url} className="w-full h-full rounded-full object-cover" muted />
                  ) : (
                    <div className="w-full h-full rounded-full flex items-center justify-center text-lg" style={{ background: `${color}20` }}>
                      🔥
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground max-w-[64px] truncate">
                {post.title || post.caption.slice(0, 12)}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Story Viewer Modal */}
        {selectedStory && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setSelectedStory(null)}>
            <div className="relative max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelectedStory(null)}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>

              <div className="rounded-2xl overflow-hidden bg-card">
                {selectedStory.image_url && (
                  <img src={selectedStory.image_url} alt="" className="w-full max-h-[60vh] object-cover" />
                )}
                {selectedStory.video_url && (
                  <video src={selectedStory.video_url} className="w-full max-h-[60vh] object-cover" controls autoPlay muted />
                )}
                <div className="p-4 space-y-2">
                  {selectedStory.title && (
                    <h3 className="font-bold text-foreground">{selectedStory.title}</h3>
                  )}
                  <p className="text-sm text-muted-foreground">{selectedStory.caption}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {showViews && (
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{selectedStory.views_count}</span>
                    )}
                    {showTimestamps && (
                      <span>{formatDistanceToNow(new Date(selectedStory.created_at), { addSuffix: true })}</span>
                    )}
                  </div>
                  {selectedStory.has_cta && telegramLink && (
                    <a href={buildCtaUrl(telegramLink)} target="_blank" rel="noopener noreferrer"
                      className="block w-full text-center py-2.5 rounded-xl font-bold text-sm text-white mt-2"
                      style={{ background: color, boxShadow: `0 0 20px ${color}40` }}>
                      💬 Contact on Telegram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // FEED MODE
  return (
    <div className="space-y-3">
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="rounded-xl overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm"
          style={{ boxShadow: `0 0 15px ${color}10` }}
          onViewportEnter={() => incrementViews(post.id)}
        >
          {post.image_url && (
            <img src={post.image_url} alt="" className="w-full max-h-64 object-cover" loading="lazy" />
          )}
          {post.video_url && (
            <video src={post.video_url} className="w-full max-h-64 object-cover" controls muted preload="metadata" />
          )}
          <div className="p-4 space-y-2">
            {post.title && <h3 className="font-bold text-sm text-foreground">{post.title}</h3>}
            <p className="text-sm text-muted-foreground">{post.caption}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {showViews && (
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views_count}</span>
              )}
              {showTimestamps && (
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              )}
            </div>
            {post.has_cta && telegramLink && (
              <a href={buildCtaUrl(telegramLink)} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center py-2.5 rounded-xl font-bold text-sm text-white mt-1"
                style={{ background: color, boxShadow: `0 0 20px ${color}40` }}>
                💬 Contact on Telegram
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
