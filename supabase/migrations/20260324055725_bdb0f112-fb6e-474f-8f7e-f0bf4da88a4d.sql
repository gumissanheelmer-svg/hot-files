
-- Timeline posts table
CREATE TABLE public.timeline_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text,
  video_url text,
  title text,
  caption text NOT NULL DEFAULT '',
  has_cta boolean NOT NULL DEFAULT false,
  views_count integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  auto_delete_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add timeline settings to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timeline_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS timeline_mode text NOT NULL DEFAULT 'stories',
  ADD COLUMN IF NOT EXISTS timeline_auto_delete text NOT NULL DEFAULT 'never',
  ADD COLUMN IF NOT EXISTS timeline_show_timestamps boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS timeline_show_views boolean NOT NULL DEFAULT true;

-- RLS
ALTER TABLE public.timeline_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view timeline posts" ON public.timeline_posts
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users can manage own timeline posts" ON public.timeline_posts
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins can manage all timeline posts" ON public.timeline_posts
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'super_admin')) WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Trigger for updated_at
CREATE TRIGGER update_timeline_posts_updated_at
  BEFORE UPDATE ON public.timeline_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.timeline_posts;

-- Storage bucket for timeline media
INSERT INTO storage.buckets (id, name, public) VALUES ('timeline-media', 'timeline-media', true);

CREATE POLICY "Anyone can view timeline media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'timeline-media');

CREATE POLICY "Authenticated users can upload timeline media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'timeline-media');

CREATE POLICY "Users can delete own timeline media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'timeline-media' AND (auth.uid()::text = (storage.foldername(name))[1]));
