-- Create inclusions table
CREATE TABLE IF NOT EXISTS public.inclusions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create exclusions table
CREATE TABLE IF NOT EXISTS public.exclusions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exclusions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read/write for authenticated users" ON public.inclusions FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable read/write for authenticated users" ON public.exclusions FOR ALL TO authenticated USING (true);
