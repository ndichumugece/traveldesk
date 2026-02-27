-- Promote David Mugece to admin to fix categorization mismatch
-- The typo in the original invite was mugecedavid@gmail.com, but the account is mugechedavid@gmail.com

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'mugechedavid@gmail.com';
