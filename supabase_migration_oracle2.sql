-- SQL Migration for Oracle 2.0 Persistence
-- Run this in your Supabase SQL Editor

-- Create the oracle_sessions table
CREATE TABLE IF NOT EXISTS oracle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled Project',
  messages JSONB DEFAULT '[]'::jsonb,
  assets JSONB DEFAULT '[]'::jsonb,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE oracle_sessions ENABLE ROW LEVEL SECURITY;

-- Create Policies for Data Privacy
-- Users can only see and edit their own projects

CREATE POLICY "Users can view their own oracle projects"
ON oracle_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own oracle projects"
ON oracle_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own oracle projects"
ON oracle_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oracle projects"
ON oracle_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_oracle_sessions_user_id ON oracle_sessions(user_id);
