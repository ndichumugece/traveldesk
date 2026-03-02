-- Add payment_terms to agency_settings table
ALTER TABLE public.agency_settings 
ADD COLUMN IF NOT EXISTS payment_terms TEXT;
