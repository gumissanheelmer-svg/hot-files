import { useEffect, useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Trash2, GripVertical, ImageIcon, Video, Eye, Clock, X, Pencil,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Context { userId: string | null; }

interface TimelinePost {
  id: string;
  image_url: string | null;
  video_url: string | null;
  title: string | null;
  caption: string;
  has_cta: boolean;
  views_count: number;
  sort_order: number;
  created_at: string;
}

export default function DashboardTimeline() {
  const { userId } = useOutletContext<Context>();
  const { toast } = useToast();
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    caption: "",
    has_cta: false,
    image_url: "",
    video_url: "",
  });

  const fetchPosts = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("timeline_posts")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true });
    setPosts((data as TimelinePost[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [userId]);

  const resetForm = () => {
    setForm({ title: "", caption: "", has_cta: false, image_url: "", video_url: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Max 10MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("timeline-media").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("timeline-media").getPublicUrl(path);
    const isVideo = file.type.startsWith("video/");
    setForm((prev) => ({
      ...prev,
      [isVideo ? "video_url" : "image_url"]: urlData.publicUrl,
      [isVideo ? "image_url" : "video_url"]: "",
    }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!userId || !form.caption.trim()) {
      toast({ title: "Caption is required", variant: "destructive" });
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("timeline_posts")
        .update({
          title: form.title || null,
          caption: form.caption,
          has_cta: form.has_cta,
          image_url: form.image_url || null,
          video_url: form.video_url || null,
        })
        .eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Post updated!" });
    } else {
      const { error } = await supabase.from("timeline_posts").insert({
        user_id: userId,
        title: form.title || null,
        caption: form.caption,
        has_cta: form.has_cta,
        image_url: form.image_url || null,
        video_url: form.video_url || null,
        sort_order: posts.length,
      });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Post created!" });
    }
    resetForm();
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("timeline_posts").delete().eq("id", id);
    toast({ title: "Post deleted" });
    fetchPosts();
  };

  const handleEdit = (post: TimelinePost) => {
    setForm({
      title: post.title || "",
      caption: post.caption,
      has_cta: post.has_cta,
      image_url: post.image_url || "",
      video_url: post.video_url || "",
    });
    setEditingId(post.id);
    setShowForm(true);
  };

  const movePost = async (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= posts.length) return;
    const updated = [...posts];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setPosts(updated);
    await Promise.all(
      updated.map((p, i) =>
        supabase.from("timeline_posts").update({ sort_order: i }).eq("id", p.id)
      )
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Timeline</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your store updates & posts</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? "Edit Post" : "Create Post"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title (optional)</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="🔥 New content available" className="bg-input border-border/50" />
            </div>
            <div className="space-y-2">
              <Label>Caption *</Label>
              <Textarea value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })}
                placeholder="Write your update..." className="bg-input border-border/50" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Media</Label>
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
              {form.image_url || form.video_url ? (
                <div className="relative inline-block">
                  {form.image_url ? (
                    <img src={form.image_url} alt="" className="w-32 h-32 rounded-lg object-cover" />
                  ) : (
                    <video src={form.video_url} className="w-32 h-32 rounded-lg object-cover" />
                  )}
                  <button onClick={() => setForm({ ...form, image_url: "", video_url: "" })}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="border-dashed gap-2">
                  {uploading ? "Uploading..." : <><ImageIcon className="w-4 h-4" /> Upload Image / Video</>}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.has_cta} onCheckedChange={(v) => setForm({ ...form, has_cta: v })} />
              <Label>Show "Contact on Telegram" button</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2">
                {editingId ? "Update" : "Create"} Post
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No timeline posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, index) => (
            <Card key={post.id} className="bg-card/50 border-border/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button onClick={() => movePost(index, -1)} disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-20">
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>
                  {(post.image_url || post.video_url) && (
                    <div className="shrink-0">
                      {post.image_url ? (
                        <img src={post.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                          <Video className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {post.title && <p className="font-bold text-sm text-foreground">{post.title}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.caption}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views_count}</span>
                      <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                      {post.has_cta && <span className="text-primary font-medium">CTA</span>}
                    </div>
                  </div>
                  <div className="flex items-start gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(post)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
