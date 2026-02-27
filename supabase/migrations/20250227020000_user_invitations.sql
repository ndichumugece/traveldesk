-- Create user_invitations table
create table public.user_invitations (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  role text check (role in ('admin', 'staff')) not null,
  status text check (status in ('pending', 'active')) default 'pending',
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_invitations enable row level security;

-- Policies for user_invitations
create policy "Admins can manage invitations"
  on public.user_invitations
  for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Users can view pending invitations"
  on public.user_invitations
  for select
  to authenticated
  using (true);

-- Function to handle new user role assignment from invitation
create or replace function public.handle_invited_user()
returns trigger as $$
declare
  invitation_role text;
begin
  -- Check if there's a pending invitation for this user's email
  select role into invitation_role
  from public.user_invitations
  where email = new.email
  and status = 'pending';

  if found then
    -- Update the new profile with the invited role
    update public.profiles
    set role = invitation_role,
        status = 'active'
    where id = new.id;

    -- Mark invitation as active
    update public.user_invitations
    set status = 'active'
    where email = new.email;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to run after profile creation
create trigger on_profile_created_assignment
  after insert on public.profiles
  for each row execute function public.handle_invited_user();
