-- 1. Create inclusions table
CREATE TABLE IF NOT EXISTS public.inclusions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create exclusions table
CREATE TABLE IF NOT EXISTS public.exclusions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security
ALTER TABLE public.inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exclusions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Note: Check if they exist first to avoid errors
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read/write for authenticated users' AND tablename = 'inclusions') THEN
        CREATE POLICY "Enable read/write for authenticated users" ON public.inclusions FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read/write for authenticated users' AND tablename = 'exclusions') THEN
        CREATE POLICY "Enable read/write for authenticated users" ON public.exclusions FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;
