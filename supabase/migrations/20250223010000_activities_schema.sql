-- Migration: Create activities table
-- Date: 2025-02-23

create table if not exists public.activities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  location text,
  price numeric not null default 0,
  status text check (status in ('active', 'inactive')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activities enable row level security;

-- RLS Policies
create policy "Enable read access for authenticated users" on public.activities
  for select to authenticated using (true);

create policy "Enable insert for authenticated users" on public.activities
  for insert to authenticated with check (true);

create policy "Enable update for authenticated users" on public.activities
  for update to authenticated using (true);

create policy "Enable delete for authenticated users" on public.activities
  for delete to authenticated using (true);

-- Add update trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_activities_updated_at
  before update on public.activities
  for each row
  execute function public.handle_updated_at();
