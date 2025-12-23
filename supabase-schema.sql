-- Create gallery_items table
CREATE TABLE gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access"
  ON gallery_items
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated insert"
  ON gallery_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated update"
  ON gallery_items
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated delete"
  ON gallery_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true);

-- Create storage policy for public read
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'gallery-images');

-- Create storage policy for authenticated upload
CREATE POLICY "Authenticated upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery-images');

-- Create storage policy for authenticated delete
CREATE POLICY "Authenticated delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery-images');
