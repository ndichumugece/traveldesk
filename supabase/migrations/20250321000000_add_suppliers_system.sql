-- Migration: Add Suppliers System
-- Created: 2025-03-21

-- 1. Create Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    contact_email text,
    contact_phone text,
    address text,
    description text,
    status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add supplier_id to Units
DO $$ 
BEGIN 
    -- Add to properties
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'supplier_id') THEN
        ALTER TABLE public.properties ADD COLUMN supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;
    END IF;

    -- Add to activities
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'supplier_id') THEN
        ALTER TABLE public.activities ADD COLUMN supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;
    END IF;

    -- Add to transports
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transports' AND column_name = 'supplier_id') THEN
        ALTER TABLE public.transports ADD COLUMN supplier_id uuid REFERENCES public.suppliers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- 4. Apply Multi-tenant RLS
-- Use the helper function created in 20250318000000_multi_tenancy.sql if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'apply_multi_tenant_rls') THEN
        PERFORM public.apply_multi_tenant_rls('suppliers');
    ELSE
        -- Fallback if function doesn't exist
        CREATE POLICY "Multi-tenant read access" ON public.suppliers FOR SELECT TO authenticated USING (agency_id = (SELECT agency_id FROM public.profiles WHERE id = auth.uid()));
        CREATE POLICY "Multi-tenant insert access" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (agency_id = (SELECT agency_id FROM public.profiles WHERE id = auth.uid()));
        CREATE POLICY "Multi-tenant update access" ON public.suppliers FOR UPDATE TO authenticated USING (agency_id = (SELECT agency_id FROM public.profiles WHERE id = auth.uid())) WITH CHECK (agency_id = (SELECT agency_id FROM public.profiles WHERE id = auth.uid()));
        CREATE POLICY "Multi-tenant delete access" ON public.suppliers FOR DELETE TO authenticated USING (agency_id = (SELECT agency_id FROM public.profiles WHERE id = auth.uid()));
    END IF;
END $$;

-- 5. Update Trigger for updated_at
CREATE TRIGGER set_suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
