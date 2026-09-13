create table if not exists public.price_list (
  id bigint generated always as identity primary key,
  source_row integer not null unique,
  item text not null,
  part_number text not null,
  unit_price_usd numeric(18, 9) not null,
  hsn_code text not null,
  country_of_origin text not null,
  created_at timestamptz not null default now()
);

create index if not exists price_list_part_number_idx on public.price_list (part_number);

alter table public.price_list enable row level security;

drop policy if exists "Authenticated users can view the price list" on public.price_list;

create policy "Authenticated users can view the price list"
  on public.price_list
  for select
  to authenticated
  using (true);
