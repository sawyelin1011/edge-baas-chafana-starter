-- Create commentss table
CREATE TABLE IF NOT EXISTS commentss (
  id TEXT PRIMARY KEY,
  postId TEXT NOT NULL,
  authorEmail TEXT NOT NULL,
  authorName TEXT NOT NULL,
  content TEXT NOT NULL,
  approved INTEGER DEFAULT false,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (postId) REFERENCES postss(id)
);