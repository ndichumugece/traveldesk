-- Migration: Create transports table
-- Date: 2025-02-23

create table if not exists public.transports (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  vehicle_type text, -- e.g., Sedan, SUV, Van, VIP
  price_per_way numeric not null default 0,
  capacity integer default 4,
  status text check (status in ('active', 'inactive')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transports enable row level security;

-- RLS Policies
create policy "Enable read access for authenticated users" on public.transports
  for select to authenticated using (true);

create policy "Enable insert for authenticated users" on public.transports
  for insert to authenticated with check (true);

create policy "Enable update for authenticated users" on public.transports
  for update to authenticated using (true);

create policy "Enable delete for authenticated users" on public.transports
  for delete to authenticated using (true);

-- Add update trigger for updated_at
create trigger set_transports_updated_at
  before update on public.transports
  for each row
  execute function public.handle_updated_at();
