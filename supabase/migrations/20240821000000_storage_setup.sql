-- Insert a new bucket for brand assets
insert into storage.buckets (id, name, public)
values ('brand_assets', 'brand_assets', true)
on conflict (id) do nothing;

-- Enable public read access for anyone
create policy "brand_assets_public_read"
on storage.objects for select
to public
using (bucket_id = 'brand_assets');

-- Enable authenticated uploads
create policy "brand_assets_auth_insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'brand_assets');

-- Enable authenticated updates (if they want to overwrite a file)
create policy "brand_assets_auth_update"
on storage.objects for update
to authenticated
using (bucket_id = 'brand_assets');

-- Enable authenticated deletes (if they want to remove a file)
create policy "brand_assets_auth_delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'brand_assets');
