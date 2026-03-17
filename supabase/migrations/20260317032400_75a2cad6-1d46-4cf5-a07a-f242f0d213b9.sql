
insert into storage.buckets (id, name, public) values ('product-thumbnails', 'product-thumbnails', true);

create policy "Admins can upload thumbnails" on storage.objects for insert to authenticated with check (bucket_id = 'product-thumbnails' and public.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can update thumbnails" on storage.objects for update to authenticated using (bucket_id = 'product-thumbnails' and public.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can delete thumbnails" on storage.objects for delete to authenticated using (bucket_id = 'product-thumbnails' and public.has_role(auth.uid(), 'admin'::app_role));
create policy "Anyone can view thumbnails" on storage.objects for select to public using (bucket_id = 'product-thumbnails');
