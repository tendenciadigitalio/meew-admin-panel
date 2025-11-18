
-- Políticas para el bucket de banners

-- Permitir lectura pública de banners
CREATE POLICY "Public can view banners"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'banners');

-- Permitir a admins subir banners
CREATE POLICY "Admins can upload banners"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'banners' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Permitir a admins actualizar banners
CREATE POLICY "Admins can update banners"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'banners' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Permitir a admins eliminar banners
CREATE POLICY "Admins can delete banners"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'banners' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);
