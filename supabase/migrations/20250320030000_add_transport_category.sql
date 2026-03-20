-- Migration: Add category to transports
-- Date: 2025-03-20

ALTER TABLE public.transports 
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('Road', 'Train', 'Flight')) DEFAULT 'Road';

COMMENT ON COLUMN public.transports.category IS 'High-level category of the transport service';
