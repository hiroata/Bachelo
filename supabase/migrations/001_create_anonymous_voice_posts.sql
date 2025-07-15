-- Anonymous voice posts table
CREATE TABLE IF NOT EXISTS public.anonymous_voice_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('female', 'male', 'couple')),
  message TEXT NOT NULL,
  avatar_emoji VARCHAR(10) NOT NULL,
  avatar_color VARCHAR(50) NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  ip_hash VARCHAR(64), -- For spam prevention (hashed IP)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_anonymous_voice_posts_category ON public.anonymous_voice_posts(category);
CREATE INDEX idx_anonymous_voice_posts_created_at ON public.anonymous_voice_posts(created_at DESC);
CREATE INDEX idx_anonymous_voice_posts_is_active ON public.anonymous_voice_posts(is_active);

-- Comments table for anonymous posts
CREATE TABLE IF NOT EXISTS public.anonymous_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.anonymous_voice_posts(id) ON DELETE CASCADE,
  nickname VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  ip_hash VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for comments
CREATE INDEX idx_anonymous_post_comments_post_id ON public.anonymous_post_comments(post_id);

-- Likes table for anonymous posts (using IP hash for uniqueness)
CREATE TABLE IF NOT EXISTS public.anonymous_post_likes (
  post_id UUID NOT NULL REFERENCES public.anonymous_voice_posts(id) ON DELETE CASCADE,
  ip_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, ip_hash)
);

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
CREATE TRIGGER update_anonymous_voice_posts_updated_at BEFORE UPDATE ON public.anonymous_voice_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE public.anonymous_voice_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_post_likes ENABLE ROW LEVEL SECURITY;

-- Policies for anonymous_voice_posts
-- Anyone can read active posts
CREATE POLICY "Anyone can view active posts" ON public.anonymous_voice_posts
  FOR SELECT USING (is_active = true);

-- Anyone can insert posts
CREATE POLICY "Anyone can create posts" ON public.anonymous_voice_posts
  FOR INSERT WITH CHECK (true);

-- Policies for comments
-- Anyone can read comments
CREATE POLICY "Anyone can view comments" ON public.anonymous_post_comments
  FOR SELECT USING (true);

-- Anyone can create comments
CREATE POLICY "Anyone can create comments" ON public.anonymous_post_comments
  FOR INSERT WITH CHECK (true);

-- Policies for likes
-- Anyone can read likes
CREATE POLICY "Anyone can view likes" ON public.anonymous_post_likes
  FOR SELECT USING (true);

-- Anyone can create likes (controlled by unique constraint)
CREATE POLICY "Anyone can create likes" ON public.anonymous_post_likes
  FOR INSERT WITH CHECK (true);

-- Storage bucket for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-posts',
  'voice-posts',
  true,
  10485760, -- 10MB limit
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/aac', 'audio/m4a']
)
ON CONFLICT (id) DO NOTHING;