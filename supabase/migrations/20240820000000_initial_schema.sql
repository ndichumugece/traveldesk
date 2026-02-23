-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (Tied to Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role text check (role in ('admin', 'staff')) default 'staff',
  status text check (status in ('active', 'pending')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Properties
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  location text not null,
  base_price numeric not null,
  rooms integer default 0,
  status text check (status in ('active', 'inactive')) default 'active',
  amenities text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Room Types
create table public.room_types (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  name text not null,
  capacity integer default 2,
  price_modifier numeric default 0, -- Amount added to base price
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Seasonal Pricing
create table public.seasonal_pricing (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  name text not null,
  start_date date not null,
  end_date date not null,
  markup_percentage numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Documents (Quotations, Invoices, Vouchers)
create table public.documents (
  id uuid default uuid_generate_v4() primary key,
  reference text not null unique,
  type text check (type in ('Quotation', 'Invoice', 'Voucher')) not null,
  client_name text not null,
  client_email text not null,
  amount numeric not null,
  status text check (status in ('pending', 'confirmed', 'paid', 'cancelled')) default 'pending',
  issue_date date not null,
  line_items jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Agency Settings
create table public.agency_settings (
  id uuid default uuid_generate_v4() primary key,
  legal_name text default 'TravelDesk Agency',
  support_email text,
  phone text,
  address text,
  tax_id text,
  primary_color text default '#4F46E5',
  logo_url text,
  default_footer_note text,
  default_terms text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert a default row for settings
insert into public.agency_settings (legal_name) values ('TravelDesk Agency');

-- RLS Policies (Row Level Security)
-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.room_types enable row level security;
alter table public.seasonal_pricing enable row level security;
alter table public.documents enable row level security;
alter table public.agency_settings enable row level security;

-- Example Policies:
-- 1. Profiles: Users can read all profiles (if logged in), but only update their own.
create policy "Enable read access for authenticated users" on public.profiles for select to authenticated using (true);
create policy "Enable update for users based on email" on public.profiles for update to authenticated using (auth.uid() = id);

-- 2. Properties/Rooms/Seasons: Authenticated users can view everything. Admins can mutate.
create policy "Enable read access for authenticated users" on public.properties for select to authenticated using (true);
create policy "Enable insert for authenticated users" on public.properties for insert to authenticated with check (true);
create policy "Enable update for authenticated users" on public.properties for update to authenticated using (true);
create policy "Enable delete for authenticated users" on public.properties for delete to authenticated using (true);

-- Repeat open policies for development speed (can be restricted via role later)
create policy "Enable read/write for authenticated users" on public.room_types for all to authenticated using (true);
create policy "Enable read/write for authenticated users" on public.seasonal_pricing for all to authenticated using (true);
create policy "Enable read/write for authenticated users" on public.documents for all to authenticated using (true);
create policy "Enable read/write for authenticated users" on public.agency_settings for all to authenticated using (true);
