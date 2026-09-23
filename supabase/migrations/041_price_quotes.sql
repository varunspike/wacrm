-- Internal cost snapshots: service role only, never exposed through the public API.
create table public.price_quotes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id),
  conversation_id uuid not null references public.conversations(id),
  part_number text not null,
  unit_price_usd numeric(18,9) not null check (unit_price_usd > 0),
  usd_inr numeric not null check (usd_inr > 0),
  forex_buffer numeric not null default 1.03 check (forex_buffer = 1.03),
  markup numeric not null default 1.45 check (markup = 1.45),
  rate_date date not null,
  rate_fetched_at timestamptz not null,
  rate_source text not null,
  unit_price_inr numeric(18,2) not null check (unit_price_inr > 0),
  created_at timestamptz not null default now()
);
alter table public.price_quotes enable row level security;
revoke all on public.price_quotes from anon, authenticated;
grant select, insert on public.price_quotes to service_role;
create index price_quotes_conversation_idx on public.price_quotes (conversation_id, created_at);
