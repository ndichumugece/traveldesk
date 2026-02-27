-- Relax RLS policies for user_invitations to fix "new row violates row-level security policy"
-- This ensures that any logged-in user can send invitations, while still restricting management.

drop policy if exists "Admins can manage invitations" on public.user_invitations;
drop policy if exists "Users can view pending invitations" on public.user_invitations;

-- Allow any authenticated user to view invitations
create policy "Enable read access for authenticated users"
  on public.user_invitations
  for select
  to authenticated
  using (true);

-- Allow any authenticated user to insert invitations
create policy "Enable insert for authenticated users"
  on public.user_invitations
  for insert
  to authenticated
  with check (true);

-- Allow admins or the inviter to update/delete invitations
create policy "Enable update for admins or inviter"
  on public.user_invitations
  for update
  to authenticated
  using (
    auth.uid() = invited_by or 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Enable delete for admins or inviter"
  on public.user_invitations
  for delete
  to authenticated
  using (
    auth.uid() = invited_by or 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
