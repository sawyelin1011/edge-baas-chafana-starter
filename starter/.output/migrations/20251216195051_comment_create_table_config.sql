-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  postId TEXT NOT NULL,
  userId TEXT NOT NULL,
  content TEXT NOT NULL,
  approved INTEGER DEFAULT false,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  FOREIGN KEY (postId) REFERENCES posts(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);