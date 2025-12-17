-- Create indexes for posts table
CREATE INDEX IF NOT EXISTS idx_posts_userId ON posts (userId);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts (published);
CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);