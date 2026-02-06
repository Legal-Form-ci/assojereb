-- Create storage bucket for news media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news-media',
  'news-media',
  true,
  524288000, -- 500MB for videos
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
);

-- Create RLS policies for news media bucket
CREATE POLICY "Public can view news media"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-media');

CREATE POLICY "Admins can upload news media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'news-media' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can update news media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'news-media' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can delete news media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'news-media' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Add media_urls column to news table for multiple images/videos
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS media_urls jsonb DEFAULT '[]'::jsonb;