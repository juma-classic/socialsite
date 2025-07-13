-- SQL script to create social_connections table in Supabase
-- Run this in your Supabase SQL editor

CREATE TABLE social_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  platform_user_id VARCHAR(100) NOT NULL,
  username VARCHAR(100),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, platform)
);

-- Create an index for faster queries
CREATE INDEX idx_social_connections_user_platform ON social_connections(user_id, platform);

-- Enable Row Level Security (RLS)
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only access their own connections
CREATE POLICY "Users can manage their own social connections" ON social_connections
  FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON social_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
