-- Update the default role for new signups who don't have an invitation
-- If a person signs up independently, they should be an Admin by default.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'admin', 'active');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update the table level default for consistency
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'admin';
