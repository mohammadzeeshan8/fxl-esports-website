create table if not exists contact_messages(
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, discord text,
  inquiry_type text not null check (inquiry_type in ('General Inquiries','Tournaments & Scrims','Recruitment','Partnerships & Sponsorships')),
  subject text not null, message text not null,
  status text not null default 'New' check (status in ('New','Read','Replied','Archived')),
  created_at timestamptz not null default now());
create index on contact_messages(status, created_at desc);
-- RLS on, no policies: the public/anon key can do nothing. Only the server's service-role key can access this table.
alter table contact_messages enable row level security;
