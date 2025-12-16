-- Create indexes for authorss table
CREATE UNIQUE INDEX IF NOT EXISTS idx_authorss_email ON authorss (email);
CREATE INDEX IF NOT EXISTS idx_authorss_active ON authorss (active);