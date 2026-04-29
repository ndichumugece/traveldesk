-- Migration: Add Booking Comments with @Mentions support
-- Date: 2025-05-21

CREATE TABLE public.booking_comments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id uuid REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    agency_id uuid REFERENCES public.agency_settings(id) ON DELETE CASCADE NOT NULL,
    content text NOT NULL,
    mentions uuid[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.booking_comments ENABLE ROW LEVEL SECURITY;

-- Apply multi-tenant policies using the existing helper function from  multi_tenancy.sql
SELECT public.apply_multi_tenant_rls('booking_comments');

-- Additional granular policies for ownership
DROP POLICY IF EXISTS "Multi-tenant update access" ON public.booking_comments;
DROP POLICY IF EXISTS "Multi-tenant delete access" ON public.booking_comments;

CREATE POLICY "Owners can update own comments" ON public.booking_comments 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id AND agency_id = public.get_my_agency_id()) 
WITH CHECK (auth.uid() = user_id AND agency_id = public.get_my_agency_id());

CREATE POLICY "Owners can delete own comments" ON public.booking_comments 
FOR DELETE TO authenticated 
USING (auth.uid() = user_id AND agency_id = public.get_my_agency_id());

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_booking_comments_booking_id ON public.booking_comments(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_comments_agency_id ON public.booking_comments(agency_id);
