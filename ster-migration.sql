-- Run once in the Supabase SQL editor before deploying sterradar.nl.
create table if not exists sterradar_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  event text not null default 'pageview',
  path text,
  query text,
  referrer text,
  user_agent text,
  ip text,
  code text
);

-- RLS on with no policies: only the service key (used server-side) can read/write.
alter table sterradar_events enable row level security;

create index if not exists sterradar_events_created_at_idx on sterradar_events (created_at desc);
