-- Migration: Enhance room_types table with industry-standard hotel pricing fields
-- Date: 2025-02-22

alter table public.room_types
  -- Occupancy type (classification for this rate)
  add column if not exists occupancy_type text check (
    occupancy_type in ('SGL', 'DBL', 'TWN', 'TPL', 'Quad', 'Per Room', 'Per Person')
  ) default 'DBL',

  -- Rate type: whether price is charged per room or per person
  add column if not exists rate_type text check (
    rate_type in ('per_room', 'per_person')
  ) default 'per_room',

  -- Individual occupancy prices (nullable — only fill in what applies)
  add column if not exists price_sgl  numeric,   -- Single occupancy (1 adult)
  add column if not exists price_dbl  numeric,   -- Double occupancy (2 adults)
  add column if not exists price_twn  numeric,   -- Twin occupancy (2 adults, 2 beds)
  add column if not exists price_tpl  numeric,   -- Triple occupancy (3 adults)
  add column if not exists price_quad numeric,   -- Quad / Family (4 adults)

  -- Additional charges
  add column if not exists extra_adult_rate numeric default 0,  -- per additional adult beyond base
  add column if not exists child_rate        numeric default 0,  -- per child (age-based)
  add column if not exists infants_free      boolean default true; -- infants stay free

-- Allow price_modifier to remain for backward compatibility, but it's now deprecated
-- in favour of the explicit occupancy pricing columns above.

comment on column public.room_types.occupancy_type  is 'SGL=1 adult, DBL=2 adults, TWN=2 adults 2 beds, TPL=3 adults, Quad=4 adults';
comment on column public.room_types.rate_type       is 'per_room = one price for the room; per_person = price × number of guests';
comment on column public.room_types.extra_adult_rate is 'Charge per additional adult beyond the base occupancy of this room type';
comment on column public.room_types.child_rate      is 'Discounted rate per child sharing the room (usually age 2-11)';
comment on column public.room_types.infants_free    is 'When true, infants (under 2) stay free with no extra bed required';
