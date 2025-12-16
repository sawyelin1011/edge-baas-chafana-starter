-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  userId TEXT NOT NULL,
  published INTEGER DEFAULT false,
  publishedAt TEXT,
  tags TEXT DEFAULT '[]',
  viewCount INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);