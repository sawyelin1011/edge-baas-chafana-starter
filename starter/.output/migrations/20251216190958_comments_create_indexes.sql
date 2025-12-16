-- Create indexes for commentss table
CREATE INDEX IF NOT EXISTS idx_commentss_postId ON commentss (postId);
CREATE INDEX IF NOT EXISTS idx_commentss_approved ON commentss (approved);