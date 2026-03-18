-- Migration: Add Multi-tenancy Support
-- Date: 2025-03-18

-- 1. Add agency_id to all relevant tables first
DO $$ 
BEGIN
  -- List of tables to add agency_id to
  -- profiles is special as it's the source of the agency_id for RLS
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
  
  ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
  ALTER TABLE public.room_types ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
  ALTER TABLE public.seasonal_pricing ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
  ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
  ALTER TABLE public.user_invitations ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
  ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
  ALTER TABLE public.transports ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
  ALTER TABLE public.inclusions ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
  ALTER TABLE public.exclusions ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
  ALTER TABLE public.meal_plans ADD COLUMN IF NOT EXISTS agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE;
END $$;

-- 2. Create a helper function for RLS
CREATE OR REPLACE FUNCTION public.get_my_agency_id()
RETURNS uuid AS $$
  SELECT agency_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Ensure agency_settings is treated as our Tenant table
-- (Already exists with fields like legal_name, etc.)

-- 4. Backfill existing data
DO $$
DECLARE
  default_agency_id uuid;
BEGIN
  -- Get or create a default agency
  SELECT id INTO default_agency_id FROM public.agency_settings LIMIT 1;
  IF default_agency_id IS NULL THEN
    INSERT INTO public.agency_settings (legal_name) VALUES ('Initial Travel Agency') RETURNING id INTO default_agency_id;
  END IF;

  -- Assign all existing records to the default agency
  UPDATE public.profiles SET agency_id = default_agency_id WHERE agency_id IS NULL;
  UPDATE public.properties SET agency_id = default_agency_id WHERE agency_id IS NULL;
  UPDATE public.room_types SET agency_id = default_agency_id WHERE agency_id IS NULL;
  UPDATE public.seasonal_pricing SET agency_id = default_agency_id WHERE agency_id IS NULL;
  UPDATE public.documents SET agency_id = default_agency_id WHERE agency_id IS NULL;
  UPDATE public.user_invitations SET agency_id = default_agency_id WHERE agency_id IS NULL;
  UPDATE public.activities SET agency_id = default_agency_id WHERE agency_id IS NULL;
  UPDATE public.transports SET agency_id = default_agency_id WHERE agency_id IS NULL;
  UPDATE public.inclusions SET agency_id = default_agency_id WHERE agency_id IS NULL;
  UPDATE public.exclusions SET agency_id = default_agency_id WHERE agency_id IS NULL;
  UPDATE public.meal_plans SET agency_id = default_agency_id WHERE agency_id IS NULL;
END $$;

-- 5. Update RLS policies to be strictly multi-tenant
-- Function to drop and recreate policies for multi-tenancy
CREATE OR REPLACE FUNCTION public.apply_multi_tenant_rls(table_name text)
RETURNS void AS $$
BEGIN
  -- Drop existing overly permissive policies
  EXECUTE format('DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.%I', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.%I', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.%I', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.%I', table_name);
  EXECUTE format('DROP POLICY IF EXISTS "Enable read/write for authenticated users" ON public.%I', table_name);

  -- Create new multi-tenant policies
  EXECUTE format('CREATE POLICY "Multi-tenant read access" ON public.%I FOR SELECT TO authenticated USING (agency_id = public.get_my_agency_id())', table_name);
  EXECUTE format('CREATE POLICY "Multi-tenant insert access" ON public.%I FOR INSERT TO authenticated WITH CHECK (agency_id = public.get_my_agency_id())', table_name);
  EXECUTE format('CREATE POLICY "Multi-tenant update access" ON public.%I FOR UPDATE TO authenticated USING (agency_id = public.get_my_agency_id()) WITH CHECK (agency_id = public.get_my_agency_id())', table_name);
  EXECUTE format('CREATE POLICY "Multi-tenant delete access" ON public.%I FOR DELETE TO authenticated USING (agency_id = public.get_my_agency_id())', table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
SELECT public.apply_multi_tenant_rls('properties');
SELECT public.apply_multi_tenant_rls('room_types');
SELECT public.apply_multi_tenant_rls('seasonal_pricing');
SELECT public.apply_multi_tenant_rls('documents');
SELECT public.apply_multi_tenant_rls('user_invitations');
SELECT public.apply_multi_tenant_rls('activities');
SELECT public.apply_multi_tenant_rls('transports');
SELECT public.apply_multi_tenant_rls('inclusions');
SELECT public.apply_multi_tenant_rls('exclusions');
SELECT public.apply_multi_tenant_rls('meal_plans');

-- Special case for profiles (can read all in same agency, update only own)
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.profiles;
CREATE POLICY "Multi-tenant profiles read" ON public.profiles FOR SELECT TO authenticated USING (agency_id = public.get_my_agency_id());
CREATE POLICY "Multi-tenant profiles update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (agency_id = public.get_my_agency_id());
CREATE POLICY "Multi-tenant profiles delete" ON public.profiles FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.agency_id = public.profiles.agency_id
    )
);

-- Special case for agency_settings (users can read only their own agency settings)
DROP POLICY IF EXISTS "Enable read/write for authenticated users" ON public.agency_settings;
CREATE POLICY "Multi-tenant agency_settings read" ON public.agency_settings FOR SELECT TO authenticated USING (id = public.get_my_agency_id());
CREATE POLICY "Multi-tenant agency_settings update" ON public.agency_settings FOR UPDATE TO authenticated USING (id = public.get_my_agency_id());

-- 6. Update handle_new_user and handle_invited_user triggers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_agency_id uuid;
  invitation_record record;
BEGIN
  -- Check if there's a pending invitation for this user's email
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = new.email
  AND status = 'pending'
  LIMIT 1;

  IF invitation_record.id IS NOT NULL THEN
    -- Join existing agency from invitation
    INSERT INTO public.profiles (id, email, full_name, role, status, agency_id)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', invitation_record.role, 'active', invitation_record.agency_id);
    
    -- Mark invitation as active
    UPDATE public.user_invitations
    SET status = 'active'
    WHERE id = invitation_record.id;
  ELSE
    -- Create a new agency for independent signup
    INSERT INTO public.agency_settings (legal_name)
    VALUES (COALESCE(new.raw_user_meta_data->>'agency_name', 'My New Agency'))
    RETURNING id INTO new_agency_id;

    INSERT INTO public.profiles (id, email, full_name, role, status, agency_id)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'admin', 'active', new_agency_id);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove the secondary handle_invited_user trigger as it's now integrated
DROP TRIGGER IF EXISTS on_profile_created_assignment ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_invited_user();
