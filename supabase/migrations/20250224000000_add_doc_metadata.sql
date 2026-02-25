-- Migration: Add metadata column to documents table
-- Date: 2024-02-24

alter table public.documents
add column if not exists metadata jsonb default '{}'::jsonb;

-- Update RLS to ensure metadata is included (it should be by default with select *)
-- No changes needed to policies since they use select * and insert/update are open.
