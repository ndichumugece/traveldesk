-- Migration: Add flexible seasonal pricing (Percentage vs Fixed)
-- Date: 2025-02-27

-- 1. Add pricing_type and fixed price columns to seasonal_pricing
alter table public.seasonal_pricing
  add column if not exists pricing_type text check (pricing_type in ('percentage', 'fixed')) default 'percentage',
  add column if not exists price_sgl numeric,
  add column if not exists price_dbl numeric,
  add column if not exists price_twn numeric,
  add column if not exists price_tpl numeric,
  add column if not exists price_quad numeric;

comment on column public.seasonal_pricing.pricing_type is 'Whether this season uses a percentage markup or fixed prices';
comment on column public.seasonal_pricing.price_sgl is 'Fixed price for single occupancy during this season';
comment on column public.seasonal_pricing.price_dbl is 'Fixed price for double occupancy during this season';
comment on column public.seasonal_pricing.price_twn is 'Fixed price for twin occupancy during this season';
comment on column public.seasonal_pricing.price_tpl is 'Fixed price for triple occupancy during this season';
comment on column public.seasonal_pricing.price_quad is 'Fixed price for quad occupancy during this season';
