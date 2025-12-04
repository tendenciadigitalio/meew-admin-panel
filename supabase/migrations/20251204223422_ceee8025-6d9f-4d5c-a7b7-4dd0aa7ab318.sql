-- Ensure product_images bucket has correct RLS policies for storage
-- First, make sure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('product_images', 'product_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create storage policies for product_images bucket
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product_images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product_images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product_images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product_images' AND auth.role() = 'authenticated');