-- Migration: Add currency_config to agency_settings
-- Date: 2025-03-20

ALTER TABLE public.agency_settings ADD COLUMN IF NOT EXISTS currency_config jsonb DEFAULT '[]'::jsonb;

-- Update RLS if needed (already has open access for authenticated users in same agency)
-- Multi-tenant logic was applied in previous migration 20250318000000_multi_tenancy.sql
