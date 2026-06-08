-- ============================================================
-- Mannequin Care — Supabase Storage Setup
-- Run this ONCE in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Create buckets (public so URLs work without signed URLs) ──

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true,
   5242880,  -- 5 MB
   ARRAY['image/jpeg','image/png','image/webp','image/gif']),

  ('blog-images', 'blog-images', true,
   5242880,
   ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO UPDATE
  SET public            = EXCLUDED.public,
      file_size_limit   = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;


-- ── 2. Storage RLS policies ──────────────────────────────────

-- product-images: admins/staff can upload, update and delete
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING    (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- product-images: anyone (including anonymous) can read
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'product-images');


-- blog-images: admins/staff can upload, update and delete
CREATE POLICY "Admins can upload blog images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

CREATE POLICY "Admins can update blog images"
  ON storage.objects FOR UPDATE TO authenticated
  USING    (bucket_id = 'blog-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

CREATE POLICY "Admins can delete blog images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_admin());

-- blog-images: anyone can read
CREATE POLICY "Public can view blog images"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'blog-images');
