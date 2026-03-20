-- Migration: Add currency and exchange_rate to documents
-- Date: 2025-03-20

ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'KSH',
ADD COLUMN IF NOT EXISTS exchange_rate numeric DEFAULT 1;

-- No need for complex data migration as existing records are KSH (rate 1)
