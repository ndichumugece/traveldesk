-- Add check-in and check-out dates to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS check_in DATE,
ADD COLUMN IF NOT EXISTS check_out DATE;
