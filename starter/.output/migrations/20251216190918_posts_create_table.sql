-- Create postss table
CREATE TABLE IF NOT EXISTS postss (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  authorId TEXT NOT NULL,
  published INTEGER DEFAULT false,
  publishedAt TEXT,
  tags TEXT DEFAULT '[]',
  views INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (authorId) REFERENCES authorss(id)
);