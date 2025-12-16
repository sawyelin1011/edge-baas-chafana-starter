-- Create indexes for postss table
CREATE INDEX IF NOT EXISTS idx_postss_authorId ON postss (authorId);
CREATE INDEX IF NOT EXISTS idx_postss_published ON postss (published);
CREATE UNIQUE INDEX IF NOT EXISTS idx_postss_slug ON postss (slug);