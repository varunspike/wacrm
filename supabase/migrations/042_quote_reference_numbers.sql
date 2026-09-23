begin;
alter table public.price_quotes
  add column reference_number bigint generated always as identity unique;
commit;
