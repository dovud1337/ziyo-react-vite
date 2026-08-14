-- ZIYO backend schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS where sensible.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users row, holds the display name
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles are publicly readable" on profiles;
create policy "profiles are publicly readable" on profiles
  for select using (true);

drop policy if exists "users can insert their own profile" on profiles;
create policy "users can insert their own profile" on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on profiles;
create policy "users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- courses + curriculum
-- ---------------------------------------------------------------------------
create table if not exists courses (
  id bigint generated always as identity primary key,
  teacher_id uuid not null references profiles (id) on delete cascade,
  teacher_name text not null,
  title text not null,
  category text not null,
  level text not null,
  price numeric not null,
  discount_price numeric,
  description text not null default '',
  tone text not null default 'green',
  created_at timestamptz not null default now()
);

create table if not exists sections (
  id bigint generated always as identity primary key,
  course_id bigint not null references courses (id) on delete cascade,
  title text not null,
  position int not null default 0
);

create table if not exists lessons (
  id bigint generated always as identity primary key,
  section_id bigint not null references sections (id) on delete cascade,
  title text not null,
  type text not null default 'article',
  content text not null default '',
  video_url text,
  position int not null default 0
);

alter table courses enable row level security;
alter table sections enable row level security;
alter table lessons enable row level security;

drop policy if exists "courses are publicly readable" on courses;
create policy "courses are publicly readable" on courses
  for select using (true);
drop policy if exists "teachers can insert their own courses" on courses;
create policy "teachers can insert their own courses" on courses
  for insert with check (auth.uid() = teacher_id);
drop policy if exists "teachers can update their own courses" on courses;
create policy "teachers can update their own courses" on courses
  for update using (auth.uid() = teacher_id);
drop policy if exists "teachers can delete their own courses" on courses;
create policy "teachers can delete their own courses" on courses
  for delete using (auth.uid() = teacher_id);

drop policy if exists "sections are publicly readable" on sections;
create policy "sections are publicly readable" on sections
  for select using (true);
drop policy if exists "teachers manage sections of their courses" on sections;
create policy "teachers manage sections of their courses" on sections
  for insert with check (
    exists (select 1 from courses c where c.id = course_id and c.teacher_id = auth.uid())
  );
drop policy if exists "teachers update sections of their courses" on sections;
create policy "teachers update sections of their courses" on sections
  for update using (
    exists (select 1 from courses c where c.id = course_id and c.teacher_id = auth.uid())
  );
drop policy if exists "teachers delete sections of their courses" on sections;
create policy "teachers delete sections of their courses" on sections
  for delete using (
    exists (select 1 from courses c where c.id = course_id and c.teacher_id = auth.uid())
  );

drop policy if exists "lessons are publicly readable" on lessons;
create policy "lessons are publicly readable" on lessons
  for select using (true);
drop policy if exists "teachers manage lessons of their courses" on lessons;
create policy "teachers manage lessons of their courses" on lessons
  for insert with check (
    exists (
      select 1 from sections s join courses c on c.id = s.course_id
      where s.id = section_id and c.teacher_id = auth.uid()
    )
  );
drop policy if exists "teachers update lessons of their courses" on lessons;
create policy "teachers update lessons of their courses" on lessons
  for update using (
    exists (
      select 1 from sections s join courses c on c.id = s.course_id
      where s.id = section_id and c.teacher_id = auth.uid()
    )
  );
drop policy if exists "teachers delete lessons of their courses" on lessons;
create policy "teachers delete lessons of their courses" on lessons
  for delete using (
    exists (
      select 1 from sections s join courses c on c.id = s.course_id
      where s.id = section_id and c.teacher_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- reviews + Q&A
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id bigint generated always as identity primary key,
  course_id bigint not null references courses (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  text text not null,
  created_at timestamptz not null default now()
);

create table if not exists qna_questions (
  id bigint generated always as identity primary key,
  course_id bigint not null references courses (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  author_name text not null,
  question text not null,
  created_at timestamptz not null default now()
);

create table if not exists qna_replies (
  id bigint generated always as identity primary key,
  question_id bigint not null references qna_questions (id) on delete cascade,
  author_id uuid not null references profiles (id) on delete cascade,
  author_name text not null,
  text text not null,
  created_at timestamptz not null default now()
);

alter table reviews enable row level security;
alter table qna_questions enable row level security;
alter table qna_replies enable row level security;

drop policy if exists "reviews are publicly readable" on reviews;
create policy "reviews are publicly readable" on reviews
  for select using (true);
drop policy if exists "authenticated users can add reviews" on reviews;
create policy "authenticated users can add reviews" on reviews
  for insert with check (auth.uid() = author_id);

drop policy if exists "questions are publicly readable" on qna_questions;
create policy "questions are publicly readable" on qna_questions
  for select using (true);
drop policy if exists "authenticated users can ask questions" on qna_questions;
create policy "authenticated users can ask questions" on qna_questions
  for insert with check (auth.uid() = author_id);

drop policy if exists "replies are publicly readable" on qna_replies;
create policy "replies are publicly readable" on qna_replies
  for select using (true);
drop policy if exists "authenticated users can reply" on qna_replies;
create policy "authenticated users can reply" on qna_replies
  for insert with check (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- per-user state: cart, enrollments, completed lessons, wishlist, subscriptions
-- ---------------------------------------------------------------------------
create table if not exists cart_items (
  user_id uuid not null references profiles (id) on delete cascade,
  course_id bigint not null references courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists enrollments (
  user_id uuid not null references profiles (id) on delete cascade,
  course_id bigint not null references courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table if not exists completed_lessons (
  user_id uuid not null references profiles (id) on delete cascade,
  course_id bigint not null references courses (id) on delete cascade,
  lesson_id bigint not null references lessons (id) on delete cascade,
  primary key (user_id, lesson_id)
);

create table if not exists wishlist_items (
  user_id uuid not null references profiles (id) on delete cascade,
  course_id bigint not null references courses (id) on delete cascade,
  primary key (user_id, course_id)
);

create table if not exists instructor_subscriptions (
  user_id uuid not null references profiles (id) on delete cascade,
  instructor_id uuid not null references profiles (id) on delete cascade,
  primary key (user_id, instructor_id)
);

alter table cart_items enable row level security;
alter table enrollments enable row level security;
alter table completed_lessons enable row level security;
alter table wishlist_items enable row level security;
alter table instructor_subscriptions enable row level security;

drop policy if exists "users manage their own cart" on cart_items;
create policy "users manage their own cart" on cart_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users manage their own enrollments" on enrollments;
create policy "users manage their own enrollments" on enrollments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users manage their own lesson progress" on completed_lessons;
create policy "users manage their own lesson progress" on completed_lessons
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users manage their own wishlist" on wishlist_items;
create policy "users manage their own wishlist" on wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users manage their own subscriptions" on instructor_subscriptions;
create policy "users manage their own subscriptions" on instructor_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
