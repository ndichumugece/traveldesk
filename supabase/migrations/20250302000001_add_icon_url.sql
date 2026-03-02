-- Add icon_url column to inclusions and exclusions tables
ALTER TABLE inclusions ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE exclusions ADD COLUMN IF NOT EXISTS icon_url TEXT;
