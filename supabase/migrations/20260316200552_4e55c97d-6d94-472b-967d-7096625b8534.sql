
ALTER TABLE public.admin_products ADD COLUMN video_url text DEFAULT NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('product-videos', 'product-videos', true, 52428800);

CREATE POLICY "Anyone can view product videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-videos');

CREATE POLICY "Admins can upload product videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-videos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete product videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-videos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
