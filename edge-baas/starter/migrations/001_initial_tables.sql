-- Initial database schema for Edge-BaaS projects
-- This will be replaced with generated migrations

-- Example: Create a posts table
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  authorId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (authorId) REFERENCES authors(id)
);

-- Example: Create an authors table  
CREATE TABLE IF NOT EXISTS authors (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Example indexes
CREATE INDEX IF NOT EXISTS idx_posts_authorId ON posts(authorId);
CREATE INDEX IF NOT EXISTS idx_posts_createdAt ON posts(createdAt);