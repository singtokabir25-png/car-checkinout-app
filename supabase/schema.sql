-- =========================================================
-- Car Check-in / Check-out — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- =========================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- Enums
-- ---------------------------------------------------------
create type user_role as enum ('employee', 'customer', 'Depositor');
create type transaction_type as enum ('check_in', 'check_out');
create type transaction_status as enum ('draft', 'completed', 'voided');

-- ---------------------------------------------------------
-- Table: transactions
-- ---------------------------------------------------------
create table if not exists public.transactions (
  id                  uuid primary key default uuid_generate_v4(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- who is performing / party to the check-in
  user_role           user_role not null,
  full_name           text not null,
  contact_phone       text,                     -- required for customer/Depositor, optional for employee
  company             text,                     -- optional, mainly for Depositor

  -- created_by ties the row to the authenticated Supabase user (employee doing data entry)
  created_by          uuid references auth.users(id),

  -- transaction meta
  transaction_type    transaction_type not null,
  transaction_date    date not null default current_date,
  transaction_time    time not null default current_time,
  plate_number         text not null,
  vehicle_make_model  text,
  odometer_km         integer,
  fuel_level          smallint check (fuel_level between 0 and 100),

  -- condition / equipment checklist, stored as jsonb: { "spare_tire": true, "jack": true, ... }
  equipment_checklist jsonb not null default '{}'::jsonb,

  -- items an external party (e.g. Depositor) has left on site, free-form list:
  -- [{ "id": "...", "itemName": "โต๊ะพับ", "quantity": 2, "note": "..." }]
  item_deposits       jsonb not null default '[]'::jsonb,

  notes               text,

  -- media
  inspection_image_urls text[] not null default '{}',   -- Supabase Storage public/signed URLs
  signature_url         text,                            -- Storage URL to the signature PNG

  status              transaction_status not null default 'draft',

  -- for pairing a check-out to its original check-in
  related_transaction_id uuid references public.transactions(id)
);

create index if not exists idx_transactions_plate on public.transactions (plate_number);
create index if not exists idx_transactions_created_at on public.transactions (created_at desc);
create index if not exists idx_transactions_status on public.transactions (status);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------
alter table public.transactions enable row level security;

-- Employees (any authenticated Supabase user in this simple model) can do everything.
-- Adjust this if you introduce a separate `profiles` table with real role checks.
create policy "Authenticated users can read transactions"
  on public.transactions for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can insert transactions"
  on public.transactions for insert
  with check (auth.role() = 'authenticated');

create policy "Authenticated users can update their own transactions"
  on public.transactions for update
  using (auth.role() = 'authenticated');

-- Public/anonymous read access ONLY for sharing a single completed transaction summary
-- (e.g. the LINE share link). Locked to status = 'completed' so drafts stay private.
create policy "Anyone can view a completed transaction summary"
  on public.transactions for select
  using (status = 'completed');

-- ---------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('inspection-images', 'inspection-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('signatures', 'signatures', true)
on conflict (id) do nothing;

-- Allow authenticated uploads
create policy "Authenticated users can upload inspection images"
  on storage.objects for insert
  with check (bucket_id = 'inspection-images' and auth.role() = 'authenticated');

create policy "Public can view inspection images"
  on storage.objects for select
  using (bucket_id = 'inspection-images');

create policy "Authenticated users can upload signatures"
  on storage.objects for insert
  with check (bucket_id = 'signatures' and auth.role() = 'authenticated');

create policy "Public can view signatures"
  on storage.objects for select
  using (bucket_id = 'signatures');
