-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL CHECK (role IN ('creator', 'client')),
  
  -- Creator-specific fields
  price_per_10sec INTEGER,
  sample_voice_url TEXT,
  tags TEXT[],
  is_accepting_orders BOOLEAN DEFAULT true,
  average_delivery_hours INTEGER DEFAULT 24,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  
  script TEXT NOT NULL CHECK (char_length(script) <= 100),
  notes TEXT,
  price INTEGER NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'recording', 'delivered', 'completed', 'cancelled')),
  
  audio_url TEXT,
  delivered_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '3 days',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) NOT NULL,
  amount INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  creator_amount INTEGER NOT NULL,
  
  payment_provider TEXT NOT NULL,
  payment_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voice posts table (timeline feature)
CREATE TABLE voice_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  
  title TEXT NOT NULL CHECK (char_length(title) <= 30),
  description TEXT CHECK (char_length(description) <= 100),
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds <= 10),
  
  tags TEXT[],
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  is_sample BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post likes table
CREATE TABLE post_likes (
  user_id UUID REFERENCES profiles(id),
  post_id UUID REFERENCES voice_posts(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Post comments table
CREATE TABLE post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES voice_posts(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id),
  following_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Everyone can view, users can update their own
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Orders: Only participants can view
CREATE POLICY "Orders are viewable by participants" 
  ON orders FOR SELECT 
  USING (auth.uid() IN (client_id, creator_id));

CREATE POLICY "Clients can create orders" 
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Creators can update their orders" 
  ON orders FOR UPDATE 
  USING (auth.uid() = creator_id);

-- Transactions: Only order participants can view
CREATE POLICY "Transactions viewable by order participants" 
  ON transactions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = transactions.order_id 
      AND auth.uid() IN (orders.client_id, orders.creator_id)
    )
  );

-- Voice posts: Everyone can view
CREATE POLICY "Voice posts are viewable by everyone" 
  ON voice_posts FOR SELECT 
  USING (true);

CREATE POLICY "Creators can insert own voice posts" 
  ON voice_posts FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own voice posts" 
  ON voice_posts FOR UPDATE 
  USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own voice posts" 
  ON voice_posts FOR DELETE 
  USING (auth.uid() = creator_id);

-- Post likes: Everyone can view and manage their own
CREATE POLICY "Post likes are viewable by everyone" 
  ON post_likes FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage own likes" 
  ON post_likes FOR ALL 
  USING (auth.uid() = user_id);

-- Post comments: Everyone can view
CREATE POLICY "Comments are viewable by everyone" 
  ON post_comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own comments" 
  ON post_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" 
  ON post_comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
  ON post_comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Follows: Everyone can view, users can manage their own
CREATE POLICY "Follows are viewable by everyone" 
  ON follows FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage own follows" 
  ON follows FOR ALL 
  USING (auth.uid() = follower_id);

-- Indexes for performance
CREATE INDEX idx_orders_creator_id ON orders(creator_id);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_voice_posts_creator ON voice_posts(creator_id);
CREATE INDEX idx_voice_posts_created ON voice_posts(created_at DESC);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- Functions

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment play count
CREATE OR REPLACE FUNCTION increment_play_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE voice_posts 
  SET play_count = play_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update like count
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE voice_posts 
    SET like_count = like_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE voice_posts 
    SET like_count = like_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for like count
CREATE TRIGGER update_voice_post_like_count
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_like_count();