-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  fullName TEXT NOT NULL,
  avatar TEXT,
  active INTEGER DEFAULT true,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);