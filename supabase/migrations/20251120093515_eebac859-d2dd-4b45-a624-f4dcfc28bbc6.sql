-- Create table for tracking uploaded files
CREATE TABLE IF NOT EXISTS meew_cloud_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  file_size BIGINT,
  mime_type TEXT,
  category TEXT,
  public_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE meew_cloud_files ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all files
CREATE POLICY "Authenticated users can read files"
  ON meew_cloud_files
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Authenticated users can insert files
CREATE POLICY "Authenticated users can insert files"
  ON meew_cloud_files
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can delete files
CREATE POLICY "Authenticated users can delete files"
  ON meew_cloud_files
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX idx_meew_cloud_files_category ON meew_cloud_files(category);
CREATE INDEX idx_meew_cloud_files_uploaded_by ON meew_cloud_files(uploaded_by);
CREATE INDEX idx_meew_cloud_files_created_at ON meew_cloud_files(created_at DESC);