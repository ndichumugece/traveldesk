-- Migration: Nest seasonal pricing within room types
-- Date: 2025-02-27

-- 1. Add room_type_id to seasonal_pricing
alter table public.seasonal_pricing
  add column if not exists room_type_id uuid references public.room_types(id) on delete cascade;

-- 2. Make property_id nullable if it was meant to be property-wide, 
-- but since we are nesting it in room types, room_type_id will be the primary link.
-- We keep property_id for now to avoid breaking existing data if any, 
-- but new ones will primarily use room_type_id.

comment on column public.seasonal_pricing.room_type_id is 'The specific room type this seasonal pricing applies to';
