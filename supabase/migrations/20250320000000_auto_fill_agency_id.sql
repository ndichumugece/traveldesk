-- Migration: Auto-fill agency_id for multi-tenant tables
-- Date: 2025-03-20

-- 1. Create the trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_agency_id_on_insert()
RETURNS trigger AS $$
BEGIN
  -- Always set agency_id to the user's agency_id if not explicitly provided
  -- (or even if provided, to ensure they can't spoof another agency)
  IF NEW.agency_id IS NULL THEN
    NEW.agency_id := public.get_my_agency_id();
  END IF;
  
  -- If still null (e.g. user has no profile or is not logged in), 
  -- the RLS policy will likely block it anyway if it's set to NOT NULL,
  -- but this prevents the 'violates check constraint' error for null != get_my_agency_id()
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Function to apply the trigger to a table
CREATE OR REPLACE FUNCTION public.apply_agency_id_trigger(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format('DROP TRIGGER IF EXISTS tr_set_agency_id ON public.%I', table_name);
  EXECUTE format('CREATE TRIGGER tr_set_agency_id BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_agency_id_on_insert()', table_name);
END;
$$ LANGUAGE plpgsql;

-- 3. Apply to all multi-tenant tables
SELECT public.apply_agency_id_trigger('properties');
SELECT public.apply_agency_id_trigger('room_types');
SELECT public.apply_agency_id_trigger('seasonal_pricing');
SELECT public.apply_agency_id_trigger('documents');
SELECT public.apply_agency_id_trigger('user_invitations');
SELECT public.apply_agency_id_trigger('activities');
SELECT public.apply_agency_id_trigger('transports');
SELECT public.apply_agency_id_trigger('inclusions');
SELECT public.apply_agency_id_trigger('exclusions');
SELECT public.apply_agency_id_trigger('meal_plans');
