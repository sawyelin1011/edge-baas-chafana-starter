-- Create authorss table
CREATE TABLE IF NOT EXISTS authorss (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  active INTEGER DEFAULT true,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);