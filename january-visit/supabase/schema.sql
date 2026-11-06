-- ============================================================
-- JANUARY VISIT - supabase/schema.sql
-- ============================================================
-- This file builds the whole shared backend in one go:
--   1. The tables (the "spreadsheets")
--   2. Row Level Security (who's allowed to see and change what)
--   3. The private bucket for photos and videos
--   4. Live updates (realtime)
--
-- HOW TO USE IT: Supabase dashboard -> SQL Editor -> New query ->
-- paste this whole file -> Run. It's safe to run more than once
-- ("if not exists" / "or replace" everywhere).
--
-- WHAT IS SQL? "Structured Query Language", the language almost
-- every database speaks. You describe WHAT you want ("make a table
-- with these columns", "give me every post, newest first") and the
-- database works out HOW. It's been around since the 1970s, and
-- Instagram, Spotify, banks and airlines all still use it.
--
-- Lines starting with -- are comments, like // in JavaScript.
-- ============================================================


-- ============================================================
-- PART 1: Tables
-- ============================================================
-- A table is like a spreadsheet: COLUMNS are the fields (name,
-- text, date) and ROWS are the individual records. Unlike a
-- spreadsheet, every column has a fixed TYPE (text, number,
-- date...) and RULES ("can't be empty", "max 120 characters").
-- The database refuses anything that breaks the rules, so bad data
-- can't sneak in even if there's a bug in our JavaScript.


-- ------------------------------------------------------------
-- members: the guest list
-- ------------------------------------------------------------
-- Only people whose email is in here can use the shared features.
-- YOU (Billy) add rows to it in the dashboard: see PART 5.
--
-- We use the EMAIL as the key (not an account id) so you can add
-- friends to the guest list BEFORE they've ever signed in.
create table if not exists public.members (
  -- "primary key" = the column that uniquely identifies each row,
  -- like a passport number. No two members can share an email.
  email        text primary key check (email = lower(email)),
  display_name text not null check (length(display_name) between 1 and 40),
  -- timestamptz = a date + time + time zone. default now() fills it
  -- in automatically when a row is added.
  created_at   timestamptz not null default now()
);


-- ------------------------------------------------------------
-- Helper functions: "who's asking?" and "are they on the list?"
-- ------------------------------------------------------------
-- auth.jwt() is provided by Supabase. When someone signs in they get
-- a "JWT", a signed digital ticket that says who they are, and it's
-- sent along with every request. These helpers read the email out of it.
create or replace function public.my_email()
returns text
language sql stable
as $$
  select lower(auth.jwt() ->> 'email')
$$;

-- "security definer" means this function runs with the permissions of
-- whoever CREATED it (you, the admin), not the person calling it. That
-- lets it peek at the members table even though members are only
-- allowed to see it once they're on the list. Without this, the check
-- would need to read members to decide whether you can read
-- members: a chicken-and-egg problem.
create or replace function public.is_member()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.members where email = public.my_email())
$$;


-- ------------------------------------------------------------
-- ideas: the Ideas board
-- ------------------------------------------------------------
create table if not exists public.ideas (
  -- "generated always as identity" = the database numbers each new
  -- row for us (1, 2, 3...), so ids are always unique.
  id           bigint generated always as identity primary key,
  text         text not null check (length(trim(text)) between 1 and 120),
  -- Who added it. "references members(email)" is a FOREIGN KEY: it
  -- must match an email that exists in members. The database
  -- guarantees an idea can never point at a person who isn't there.
  -- default my_email() fills it in from the sign-in ticket, so the app
  -- can't pretend to be someone else. Starter ideas have no author (null).
  author_email text references public.members(email) on delete cascade
                    default public.my_email(),
  created_at   timestamptz not null default now()
);


-- ------------------------------------------------------------
-- idea_hearts: one row per (idea, person) heart
-- ------------------------------------------------------------
-- Why a separate table instead of a "hearts" number on each idea?
--   - A COMBINED primary key (idea_id + member_email) makes it
--     impossible to heart the same idea twice. The database itself
--     enforces "one heart per person".
--   - We can show WHO hearted it ("♥ 3 · Sam, Alex, Billy").
--   - Two people hearting at the same moment can't overwrite each
--     other's count.
-- The count is simply "how many rows does this idea have?"
create table if not exists public.idea_hearts (
  -- "on delete cascade": if the idea is deleted, its hearts go too.
  idea_id      bigint not null references public.ideas(id) on delete cascade,
  member_email text   not null references public.members(email) on delete cascade
                      default public.my_email(),
  created_at   timestamptz not null default now(),
  primary key (idea_id, member_email)
);


-- ------------------------------------------------------------
-- posts: the shared feed (text, photo or short video)
-- ------------------------------------------------------------
-- The photo/video FILE lives in Storage (PART 3). This table only
-- stores WHERE the file is (media_path), like a library catalogue
-- card that says which shelf a book is on. Databases are built for
-- small, structured data, not big files.
create table if not exists public.posts (
  id           bigint generated always as identity primary key,
  author_email text not null references public.members(email) on delete cascade
                    default public.my_email(),
  caption      text check (caption is null or length(caption) <= 1000),
  media_path   text,
  media_type   text check (media_type in ('photo', 'video')),
  created_at   timestamptz not null default now(),
  -- A post must have SOMETHING: a caption, a file, or both...
  check (caption is not null or media_path is not null),
  -- ...and a file always needs a type, while no file means no type.
  check ((media_path is null) = (media_type is null))
);

-- An INDEX is like the index at the back of a book: it lets the
-- database jump straight to "newest posts" instead of reading every
-- row. Our feed always asks for newest first, so this keeps it fast.
create index if not exists posts_created_at_idx on public.posts (created_at desc);


-- ============================================================
-- PART 2: Row Level Security (RLS)
-- ============================================================
-- THE BIG IDEA: the app's code (including the "anon key") is public.
-- Anyone can read it from the website and send requests straight to
-- Supabase, skipping our app entirely. So the database itself has to
-- be the bouncer.
--
-- With RLS turned on, every table starts as "nobody can do
-- anything". Each POLICY then lets one specific thing through, e.g.
-- "members can read ideas". Supabase checks the policies on EVERY
-- request, row by row, no matter where the request comes from.
--
-- Analogy: a guest list at a club door. It doesn't matter how you
-- got to the door. If your name isn't on the list, you're not
-- getting in.
alter table public.members     enable row level security;
alter table public.ideas       enable row level security;
alter table public.idea_hearts enable row level security;
alter table public.posts       enable row level security;

-- "drop policy if exists" first, so re-running this file replaces
-- the policies instead of erroring because they already exist.

-- members: members can see the guest list (to show names).
-- Nobody can add, change or remove members from the app. Only you, in
-- the dashboard (the dashboard uses an admin key that skips RLS).
drop policy if exists "members can read the guest list" on public.members;
create policy "members can read the guest list" on public.members
  for select to authenticated
  using (public.is_member());

-- ideas
drop policy if exists "members can read ideas" on public.ideas;
create policy "members can read ideas" on public.ideas
  for select to authenticated
  using (public.is_member());

-- "with check" = a rule the NEW row must pass. Here: you must be a
-- member, and the idea must be in YOUR name (no posting as someone else).
drop policy if exists "members can add ideas as themselves" on public.ideas;
create policy "members can add ideas as themselves" on public.ideas
  for insert to authenticated
  with check (public.is_member() and author_email = public.my_email());

drop policy if exists "people can delete their own ideas" on public.ideas;
create policy "people can delete their own ideas" on public.ideas
  for delete to authenticated
  using (author_email = public.my_email());

-- idea_hearts
drop policy if exists "members can read hearts" on public.idea_hearts;
create policy "members can read hearts" on public.idea_hearts
  for select to authenticated
  using (public.is_member());

drop policy if exists "members can heart as themselves" on public.idea_hearts;
create policy "members can heart as themselves" on public.idea_hearts
  for insert to authenticated
  with check (public.is_member() and member_email = public.my_email());

drop policy if exists "people can remove their own hearts" on public.idea_hearts;
create policy "people can remove their own hearts" on public.idea_hearts
  for delete to authenticated
  using (member_email = public.my_email());

-- posts
drop policy if exists "members can read posts" on public.posts;
create policy "members can read posts" on public.posts
  for select to authenticated
  using (public.is_member());

drop policy if exists "members can post as themselves" on public.posts;
create policy "members can post as themselves" on public.posts
  for insert to authenticated
  with check (public.is_member() and author_email = public.my_email());

drop policy if exists "people can delete their own posts" on public.posts;
create policy "people can delete their own posts" on public.posts
  for delete to authenticated
  using (author_email = public.my_email());

-- Notice what's MISSING: there are no "update" policies, so nobody can
-- edit anything after posting (delete and re-post instead). And there
-- are no policies "to anon" (signed-out visitors), so they get nothing.

-- Let the app ask "am I on the guest list?" (to show a friendly
-- message instead of an empty screen).
grant execute on function public.is_member() to authenticated;


-- ============================================================
-- PART 3: Storage, the private "media" bucket for photos/videos
-- ============================================================
-- A bucket is like a shared drive folder. public = false means files
-- can't be opened with a plain link. The app asks for a "signed URL",
-- a temporary link that expires after an hour, and only members are
-- allowed to get one (policies below).
--
-- file_size_limit: 50 MB (52428800 bytes = 50 x 1024 x 1024), the
-- free plan's maximum. allowed_mime_types: only these kinds of file
-- can be uploaded. A "MIME type" is a file's official kind label,
-- e.g. image/jpeg.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', false, 52428800,
  array['image/jpeg', 'image/png', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Files are stored at  posts/<your user id>/<file name>.
-- storage.foldername(name) splits a path into its folders, so for
-- "posts/abc-123/photo.jpg" it gives ['posts', 'abc-123'].
-- [1] is the first folder and [2] the second (SQL counts from 1, not 0!).

drop policy if exists "members can view media" on storage.objects;
create policy "members can view media" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_member());

drop policy if exists "members can upload to their own folder" on storage.objects;
create policy "members can upload to their own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and public.is_member()
    and (storage.foldername(name))[1] = 'posts'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "people can delete their own media" on storage.objects;
create policy "people can delete their own media" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[2] = auth.uid()::text
  );


-- ============================================================
-- PART 4: Realtime (live updates)
-- ============================================================
-- Adding a table to the "supabase_realtime" publication tells
-- Supabase to announce every new or deleted row to apps that are
-- listening, like a group chat pinging everyone. It still respects
-- RLS: you only hear about rows you're allowed to see.
--
-- The do-block only adds each table if it isn't already added, so
-- re-running this file doesn't error.
do $$
declare
  t text;
begin
  foreach t in array array['ideas', 'idea_hearts', 'posts'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end
$$;


-- ============================================================
-- PART 5: Starter data ✏️ (edit before running!)
-- ============================================================
-- The guest list. Use the EXACT emails people will sign in with, in
-- lowercase. You can add more later with the same kind of line, or in
-- Table Editor -> members -> Insert row.
--
-- "on conflict do nothing" = if that email is already there, skip it
-- (so re-running the file doesn't error).
insert into public.members (email, display_name) values
  ('billyccavell@gmail.com', 'Billy')
  -- TODO: add your friends, e.g.
  -- , ('friend.one@example.com', 'Friend One')
  -- , ('friend.two@example.com', 'Friend Two')
on conflict (email) do nothing;

-- The starter ideas (the same ones as data.js), added only if the
-- board is empty, so re-running doesn't create duplicates.
insert into public.ideas (text, author_email)
select starter.text, null
from (values
  ('Go ice skating ⛸️'),
  ('Karaoke night 🎤'),
  ('Cook a big dinner together 🍝'),
  ('Museum day 🖼️'),
  ('Movie marathon in pyjamas 🍿')
) as starter(text)
where not exists (select 1 from public.ideas);
