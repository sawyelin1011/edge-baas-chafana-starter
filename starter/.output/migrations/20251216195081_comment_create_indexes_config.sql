-- Create indexes for comments table
CREATE INDEX IF NOT EXISTS idx_comments_postId ON comments (postId);
CREATE INDEX IF NOT EXISTS idx_comments_userId ON comments (userId);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments (approved);