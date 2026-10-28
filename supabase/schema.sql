-- ============================================================================
-- BoardsBuddy - Complete Database Schema & Seed Data
-- Target Database: Supabase PostgreSQL
-- ============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";

-- 2. Clean Existing Tables (if re-running setup)
drop table if exists public.bookmarks cascade;
drop table if exists public.student_progress cascade;
drop table if exists public.resources cascade;
drop table if exists public.chapters cascade;
drop table if exists public.subjects cascade;
drop table if exists public.classes cascade;
drop table if exists public.boards cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.profiles cascade;

-- ============================================================================
-- 3. Core Tables
-- ============================================================================

-- A. Profiles (User Account Details)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  avatar_url text,
  selected_board text default 'Maharashtra State Board',
  selected_class text default 'Class 10',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- B. User Roles (Explicit Role Management)
create table public.user_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'student')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, role)
);

-- C. Boards Table
create table public.boards (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  code text not null unique,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- D. Classes Table
create table public.classes (
  id uuid default uuid_generate_v4() primary key,
  board_id uuid references public.boards(id) on delete cascade not null,
  name text not null,
  code text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (board_id, code)
);

-- E. Subjects Table
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  board_id uuid references public.boards(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  name text not null,
  code text not null,
  icon text default 'book',
  color text default '#4f46e5',
  description text,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (class_id, code)
);

-- F. Chapters Table
create table public.chapters (
  id uuid default uuid_generate_v4() primary key,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  chapter_number integer not null,
  title text not null,
  description text,
  thumbnail_url text,
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (subject_id, chapter_number)
);

-- G. Resources Table (TextBooks, Notes, Short Notes, PYQs, Chapterwise PYQs, Solutions)
create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  type text not null check (type in ('textbook', 'notes', 'short_notes', 'pyq', 'chapterwise_pyq', 'pyq_solution')),
  board_id uuid references public.boards(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  chapter_id uuid references public.chapters(id) on delete cascade,
  title text not null,
  description text,
  file_url text,
  external_url text,
  content_text text,
  year integer,
  marks integer,
  topic text,
  is_published boolean default false,
  allow_download boolean default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- H. Bookmarks Table
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  resource_id uuid references public.resources(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, resource_id)
);

-- I. Student Progress Table
create table public.student_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  chapter_id uuid references public.chapters(id) on delete cascade not null,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  last_accessed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, chapter_id)
);

-- ============================================================================
-- 4. Indexes for High Performance
-- ============================================================================
create index idx_classes_board on public.classes(board_id);
create index idx_subjects_class on public.subjects(class_id);
create index idx_chapters_subject on public.chapters(subject_id);
create index idx_resources_lookup on public.resources(type, subject_id, chapter_id, is_published);
create index idx_resources_year on public.resources(year);
create index idx_user_roles_user on public.user_roles(user_id);
create index idx_bookmarks_user on public.bookmarks(user_id);
create index idx_student_progress_user on public.student_progress(user_id);

-- ============================================================================
-- 5. Helper Functions & Triggers
-- ============================================================================

-- Security Definer function to safely check if caller is an admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- Trigger to automatically create profile and default student role on user sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'student')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 6. Row Level Security (RLS) Policies
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.boards enable row level security;
alter table public.classes enable row level security;
alter table public.subjects enable row level security;
alter table public.chapters enable row level security;
alter table public.resources enable row level security;
alter table public.bookmarks enable row level security;
alter table public.student_progress enable row level security;

-- Profiles Policies
create policy "Users can view own profile or admin can view all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- User Roles Policies (Only admins can view/manage roles, students can view own role)
create policy "Users can view own role or admin can view all"
  on public.user_roles for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Only admin can insert user roles"
  on public.user_roles for insert
  with check (public.is_admin());

create policy "Only admin can update user roles"
  on public.user_roles for update
  using (public.is_admin());

create policy "Only admin can delete user roles"
  on public.user_roles for delete
  using (public.is_admin());

-- Boards Policies (Anyone can view active boards; only admin can modify)
create policy "Anyone can view active boards"
  on public.boards for select
  using (is_active = true or public.is_admin());

create policy "Admin can insert boards"
  on public.boards for insert with check (public.is_admin());

create policy "Admin can update boards"
  on public.boards for update using (public.is_admin());

create policy "Admin can delete boards"
  on public.boards for delete using (public.is_admin());

-- Classes Policies
create policy "Anyone can view active classes"
  on public.classes for select
  using (is_active = true or public.is_admin());

create policy "Admin can insert classes"
  on public.classes for insert with check (public.is_admin());

create policy "Admin can update classes"
  on public.classes for update using (public.is_admin());

create policy "Admin can delete classes"
  on public.classes for delete using (public.is_admin());

-- Subjects Policies
create policy "Anyone can view active subjects"
  on public.subjects for select
  using (is_active = true or public.is_admin());

create policy "Admin can insert subjects"
  on public.subjects for insert with check (public.is_admin());

create policy "Admin can update subjects"
  on public.subjects for update using (public.is_admin());

create policy "Admin can delete subjects"
  on public.subjects for delete using (public.is_admin());

-- Chapters Policies
create policy "Anyone can view active chapters"
  on public.chapters for select
  using (is_active = true or public.is_admin());

create policy "Admin can insert chapters"
  on public.chapters for insert with check (public.is_admin());

create policy "Admin can update chapters"
  on public.chapters for update using (public.is_admin());

create policy "Admin can delete chapters"
  on public.chapters for delete using (public.is_admin());

-- Resources Policies
-- 1. Unauthenticated public can only view published textbooks and pyq papers
create policy "Public can view published textbooks and pyqs"
  on public.resources for select
  using (
    is_published = true 
    and type in ('textbook', 'pyq')
  );

-- 2. Authenticated students can view all published resources (notes, short notes, pyqs, solutions)
create policy "Authenticated users can view all published resources"
  on public.resources for select
  to authenticated
  using (
    is_published = true
  );

-- 3. Admins can view all resources
create policy "Admins can view all resources"
  on public.resources for select
  using (
    public.is_admin()
  );

create policy "Admin can insert resources"
  on public.resources for insert with check (public.is_admin());

create policy "Admin can update resources"
  on public.resources for update using (public.is_admin());

create policy "Admin can delete resources"
  on public.resources for delete using (public.is_admin());

-- Bookmarks Policies
create policy "Users can manage own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Student Progress Policies
create policy "Users can manage own progress"
  on public.student_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- 7. Supabase Storage Setup (Run in SQL editor or create via dashboard)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('study-materials', 'study-materials', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('chapter-thumbnails', 'chapter-thumbnails', true)
on conflict (id) do update set public = true;

-- Storage Policies
drop policy if exists "Public Access for Study Materials" on storage.objects;
drop policy if exists "Public read access for textbooks, pyqs and thumbnails" on storage.objects;

create policy "Public read access for textbooks, pyqs and thumbnails"
  on storage.objects for select
  using (
    bucket_id = 'chapter-thumbnails'
    or (bucket_id = 'study-materials' and (name like 'textbooks/%' or name like 'pyqs/%'))
    or (bucket_id = 'study-materials' and auth.role() = 'authenticated')
    or public.is_admin()
  );

drop policy if exists "Admin Upload to Study Materials" on storage.objects;
create policy "Admin Upload to Study Materials"
  on storage.objects for insert
  with check (bucket_id in ('study-materials', 'chapter-thumbnails') and public.is_admin());

drop policy if exists "Admin Delete from Study Materials" on storage.objects;
create policy "Admin Delete from Study Materials"
  on storage.objects for delete
  using (bucket_id in ('study-materials', 'chapter-thumbnails') and public.is_admin());

-- ============================================================================
-- 8. Seed Data: Maharashtra State Board, Class 10 (Maths & Science)
-- ============================================================================

-- Boards
insert into public.boards (id, name, code, description, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'Maharashtra State Board', 'MSBSHSE', 'Maharashtra State Board of Secondary and Higher Secondary Education (SSC)', true),
  ('22222222-2222-2222-2222-222222222222', 'CBSE', 'CBSE', 'Central Board of Secondary Education (Coming Soon)', false)
on conflict (name) do nothing;

-- Classes
insert into public.classes (id, board_id, name, code, is_active)
values
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Class 10 (SSC)', '10', true),
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Class 9', '9', false)
on conflict (board_id, code) do nothing;

-- Subjects
insert into public.subjects (id, board_id, class_id, name, code, icon, color, description, is_active, display_order)
values
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Mathematics Part 1 (Algebra)', 'MATH1', 'calculator', '#4f46e5', 'Linear Equations, Quadratic Equations, Arithmetic Progression, Financial Planning, Probability & Statistics.', true, 1),
  ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Mathematics Part 2 (Geometry)', 'MATH2', 'shapes', '#0891b2', 'Similarity, Pythagoras Theorem, Circle, Geometric Constructions, Coordinate Geometry, Trigonometry, Mensuration.', true, 2),
  ('a3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Science & Technology Part 1', 'SCI1', 'atom', '#2563eb', 'Physics and Chemistry: Gravitation, Periodic Classification, Chemical Reactions, Electric Current, Heat, Lenses.', true, 3),
  ('a4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Science & Technology Part 2', 'SCI2', 'dna', '#059669', 'Biology and Environmental Science: Heredity and Evolution, Life Processes, Environmental Management, Biotechnology.', true, 4)
on conflict (class_id, code) do nothing;

-- Chapters: Mathematics Part 1 (Algebra)
insert into public.chapters (id, subject_id, chapter_number, title, description, display_order)
values
  ('c1010000-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 1, 'Linear Equations in Two Variables', 'Simultaneous equations, Graphical method, Cramer''s rule, and applications.', 1),
  ('c1010000-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', 2, 'Quadratic Equations', 'Standard form, Factorization, Completing square, Formula method, Nature of roots.', 2),
  ('c1010000-0000-0000-0000-000000000003', 'a1111111-1111-1111-1111-111111111111', 3, 'Arithmetic Progression', 'Sequence, nth term of an A.P., Sum of first n terms, Word problems.', 3),
  ('c1010000-0000-0000-0000-000000000004', 'a1111111-1111-1111-1111-111111111111', 4, 'Financial Planning', 'GST, CGST, SGST, Tax invoice, Share market, Mutual funds, SIP.', 4),
  ('c1010000-0000-0000-0000-000000000005', 'a1111111-1111-1111-1111-111111111111', 5, 'Probability', 'Random experiments, Sample space, Events, Probability of an event.', 5),
  ('c1010000-0000-0000-0000-000000000006', 'a1111111-1111-1111-1111-111111111111', 6, 'Statistics', 'Measures of central tendency (Mean, Median, Mode), Histogram, Frequency polygon, Pie diagram.', 6)
on conflict (subject_id, chapter_number) do nothing;

-- Chapters: Mathematics Part 2 (Geometry)
insert into public.chapters (id, subject_id, chapter_number, title, description, display_order)
values
  ('c2010000-0000-0000-0000-000000000001', 'a2222222-2222-2222-2222-222222222222', 1, 'Similarity', 'Ratio of areas of two triangles, Basic Proportionality Theorem, Tests of similarity.', 1),
  ('c2010000-0000-0000-0000-000000000002', 'a2222222-2222-2222-2222-222222222222', 2, 'Pythagoras Theorem', 'Geometric mean theorem, Pythagoras theorem proof and converse, Apollonius theorem.', 2),
  ('c2010000-0000-0000-0000-000000000003', 'a2222222-2222-2222-2222-222222222222', 3, 'Circle', 'Tangent theorem, Inscribed angle theorem, Cyclic quadrilateral, Tangent-secant theorem.', 3),
  ('c2010000-0000-0000-0000-000000000004', 'a2222222-2222-2222-2222-222222222222', 4, 'Geometric Constructions', 'Construction of similar triangles, Construction of tangents to a circle.', 4),
  ('c2010000-0000-0000-0000-000000000005', 'a2222222-2222-2222-2222-222222222222', 5, 'Coordinate Geometry', 'Distance formula, Section formula, Midpoint formula, Slope of a line.', 5),
  ('c2010000-0000-0000-0000-000000000006', 'a2222222-2222-2222-2222-222222222222', 6, 'Trigonometry', 'Trigonometric ratios, Identities, Heights and Distances with angle of elevation and depression.', 6),
  ('c2010000-0000-0000-0000-000000000007', 'a2222222-2222-2222-2222-222222222222', 7, 'Mensuration', 'Area and volume of cylinder, cone, sphere, frustum, sector of circle.', 7)
on conflict (subject_id, chapter_number) do nothing;

-- Chapters: Science & Technology Part 1
insert into public.chapters (id, subject_id, chapter_number, title, description, display_order)
values
  ('c3010000-0000-0000-0000-000000000001', 'a3333333-3333-3333-3333-333333333333', 1, 'Gravitation', 'Kepler''s laws, Newton''s universal law of gravitation, Acceleration due to gravity (g), Free fall, Escape velocity.', 1),
  ('c3010000-0000-0000-0000-000000000002', 'a3333333-3333-3333-3333-333333333333', 2, 'Periodic Classification of Elements', 'Dobereiner''s Triads, Newlands'' Octaves, Mendeleev''s Periodic Table, Modern Periodic Table, Periodic trends.', 2),
  ('c3010000-0000-0000-0000-000000000003', 'a3333333-3333-3333-3333-333333333333', 3, 'Chemical Reactions and Equations', 'Types of chemical reactions, Balancing equations, Oxidation and reduction, Corrosion and rancidity.', 3),
  ('c3010000-0000-0000-0000-000000000004', 'a3333333-3333-3333-3333-333333333333', 4, 'Effects of Electric Current', 'Heating effect, Joule''s law, Magnetic effect, Right hand thumb rule, Fleming''s rules, Electric motor & generator.', 4),
  ('c3010000-0000-0000-0000-000000000005', 'a3333333-3333-3333-3333-333333333333', 5, 'Heat', 'Latent heat, Anomalous behavior of water, Dew point, Humidity, Specific heat capacity, Calorimeter.', 5),
  ('c3010000-0000-0000-0000-000000000006', 'a3333333-3333-3333-3333-333333333333', 6, 'Refraction of Light', 'Laws of refraction, Refractive index, Total internal reflection, Mirage, Twinkling of stars, Dispersion.', 6),
  ('c3010000-0000-0000-0000-000000000007', 'a3333333-3333-3333-3333-333333333333', 7, 'Lenses', 'Convex & concave lenses, Ray diagrams, Lens formula, Magnification, Power of lens, Human eye & defects.', 7),
  ('c3010000-0000-0000-0000-000000000008', 'a3333333-3333-3333-3333-333333333333', 8, 'Metallurgy', 'Physical & chemical properties of metals/non-metals, Reactivity series, Extraction of metals, Corrosion prevention.', 8),
  ('c3010000-0000-0000-0000-000000000009', 'a3333333-3333-3333-3333-333333333333', 9, 'Carbon Compounds', 'Covalent bonds, Hydrocarbons, Functional groups, Homologous series, Nomenclature, Reactions of ethanol & ethanoic acid.', 9),
  ('c3010000-0000-0000-0000-000000000010', 'a3333333-3333-3333-3333-333333333333', 10, 'Space Missions', 'Artificial satellites, Satellite orbits, Satellite launch vehicles, Space missions to Moon, Mars, Space debris.', 10)
on conflict (subject_id, chapter_number) do nothing;

-- Chapters: Science & Technology Part 2
insert into public.chapters (id, subject_id, chapter_number, title, description, display_order)
values
  ('c4010000-0000-0000-0000-000000000001', 'a4444444-4444-4444-4444-444444444444', 1, 'Heredity and Evolution', 'Transcription, Translation, Translocation, Evolution, Evidences of evolution, Darwin''s & Lamarckism theory, Human evolution.', 1),
  ('c4010000-0000-0000-0000-000000000002', 'a4444444-4444-4444-4444-444444444444', 2, 'Life Processes in Living Organisms Part 1', 'Cellular respiration (Glycolysis, Krebs cycle, ETC), Energy from nutrients, Cell division (Mitosis & Meiosis).', 2),
  ('c4010000-0000-0000-0000-000000000003', 'a4444444-4444-4444-4444-444444444444', 3, 'Life Processes in Living Organisms Part 2', 'Asexual & sexual reproduction, Human reproductive system, Menstrual cycle, Reproductive health, Population explosion.', 3),
  ('c4010000-0000-0000-0000-000000000004', 'a4444444-4444-4444-4444-444444444444', 4, 'Environmental Management', 'Ecosystem, Environmental conservation & biodiversity, Hotspots, Sacred groves, Disaster management.', 4),
  ('c4010000-0000-0000-0000-000000000005', 'a4444444-4444-4444-4444-444444444444', 5, 'Towards Green Energy', 'Energy generation from thermal, nuclear, solar, hydro, and wind; Environmental problems and green solutions.', 5)
on conflict (subject_id, chapter_number) do nothing;

-- Sample Resources: Textbooks
insert into public.resources (type, board_id, class_id, subject_id, title, description, file_url, is_published, allow_download)
values
  ('textbook', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Mathematics Part 1 (Algebra) - Official Textbook', 'Maharashtra State Bureau of Textbook Production and Curriculum Research, Balbharati official Class 10 textbook.', 'https://cart.ebalbharati.in/BalBooks/ebooks/1003020101.pdf', true, true),
  ('textbook', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'Mathematics Part 2 (Geometry) - Official Textbook', 'Official Balbharati Class 10 Geometry textbook covering all 7 chapters with practice sets.', 'https://cart.ebalbharati.in/BalBooks/ebooks/1003020102.pdf', true, true),
  ('textbook', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Science & Technology Part 1 - Official Textbook', 'Physics & Chemistry textbook by Balbharati covering 10 chapters, diagrams, and experiments.', 'https://cart.ebalbharati.in/BalBooks/ebooks/1003020103.pdf', true, true),
  ('textbook', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'Science & Technology Part 2 - Official Textbook', 'Biology & Environmental Management textbook by Balbharati with labeled figures and review questions.', 'https://cart.ebalbharati.in/BalBooks/ebooks/1003020104.pdf', true, true);

-- Sample Resources: Notes
insert into public.resources (type, board_id, class_id, subject_id, chapter_id, title, description, content_text, is_published, allow_download)
values
  ('notes', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'c1010000-0000-0000-0000-000000000001',
   'Comprehensive Notes: Linear Equations in Two Variables',
   'Detailed theoretical concepts, Cramer''s rule derivations, elimination method steps, and solved examples for Board Exams.',
   '# Chapter 1: Linear Equations in Two Variables\n\n## 1. Definition\nAn equation which contains two variables and the degree of each term containing variable is **one** is called a **Linear Equation in Two Variables**.\n\nGeneral Form:\n`ax + by + c = 0` where `a, b, c` are real numbers and `a ≠ 0, b ≠ 0` simultaneously.\n\n### Examples:\n- `4x + 3y = 12` is a linear equation in two variables.\n- `3x² - 7y = 13` is NOT a linear equation because the degree of x is 2.\n- `√2x - √5y = 16` is a linear equation in two variables.\n\n## 2. Methods of Solving Simultaneous Linear Equations\n\n### Method 1: Elimination by Equating Coefficients\n1. Multiply one or both equations so that coefficients of one variable become equal or opposite.\n2. Add or subtract to eliminate that variable.\n3. Solve for the remaining single variable.\n4. Substitute back into either original equation to find the second variable.\n\n### Method 2: Determinant Method (Cramer''s Rule)\nFor the system:\n`a₁x + b₁y = c₁`\n`a₂x + b₂y = c₂`\n\n1. Calculate Determinant `D = | a₁  b₁ | = (a₁b₂ - a₂b₁)`\n                       `| a₂  b₂ |`\n2. Calculate `Dx = | c₁  b₁ | = (c₁b₂ - c₂b₁)`\n                  `| c₂  b₂ |`\n3. Calculate `Dy = | a₁  c₁ | = (a₁c₂ - a₂c₁)`\n                  `| a₂  c₂ |`\n4. Solutions:\n   **x = Dx / D** and **y = Dy / D** (provided `D ≠ 0`).\n\n### Important Board Exam Tip:\nIf `D = 0` and `Dx = 0, Dy = 0`, the system has infinitely many solutions (coincident lines). If `D = 0` and `Dx ≠ 0` or `Dy ≠ 0`, the system has no solution (parallel lines).',
   true, true),

  ('notes', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c3010000-0000-0000-0000-000000000001',
   'Comprehensive Notes: Gravitation',
   'Kepler''s Three Laws, Newton''s Law of Gravitation, value of g at different altitudes, free fall equations and escape velocity.',
   '# Chapter 1: Gravitation\n\n## 1. Kepler''s Laws of Planetary Motion\n- **First Law (Law of Orbits):** The orbit of a planet is an ellipse with the Sun at one of the foci.\n- **Second Law (Law of Areas):** The line joining the planet and the Sun sweeps equal areas in equal intervals of time.\n- **Third Law (Law of Periods):** The square of its period of revolution around the Sun is directly proportional to the cube of the mean distance of a planet from the Sun (`T² ∝ r³` or `T² / r³ = constant`).\n\n## 2. Newton''s Universal Law of Gravitation\nEvery object in the Universe attracts every other object with a definite force. This force is:\n1. Directly proportional to the product of their masses (`m₁m₂`).\n2. Inversely proportional to the square of the distance between them (`r²`).\n\nFormula:\n`F = G · (m₁ · m₂) / r²`\n\nWhere:\n- `G` is the Universal Gravitational Constant: **`6.673 × 10⁻¹¹ N·m²/kg²`**\n- S.I. unit of G: **`N·m²/kg²`**\n\n## 3. Acceleration Due to Gravity (g)\n`g = (G · M) / R²`\nOn the surface of the Earth: `g ≈ 9.8 m/s²` (maximum at poles ~9.832 m/s², minimum at equator ~9.78 m/s²).\n\n### Variation of g:\n1. **With altitude (height):** Decreases as height increases.\n2. **With depth:** Decreases as depth inside Earth increases, becoming zero at the center of the Earth.\n3. **Difference between Mass and Weight:**\n   - **Mass:** Amount of matter present in object. Scalar quantity, S.I. unit `kg`, constant everywhere.\n   - **Weight:** Force with which Earth attracts object (`W = m · g`). Vector quantity, S.I. unit `Newton (N)`, changes with location.',
   true, true);

-- Sample Resources: Short Notes (Quick Formula Sheets)
insert into public.resources (type, board_id, class_id, subject_id, chapter_id, title, description, content_text, is_published, allow_download)
values
  ('short_notes', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'c1010000-0000-0000-0000-000000000001',
   'Quick Revision & Formulas: Linear Equations',
   '1-page formula sheet: Standard form, Cramer''s determinants, conditions for consistency.',
   '### ⚡ Fast Revision Sheet: Linear Equations\n\n1. **Standard Form:** `ax + by + c = 0` (a, b ≠ 0)\n2. **Cramer''s Determinants:**\n   - `D = a₁b₂ - a₂b₁`\n   - `Dx = c₁b₂ - c₂b₁`\n   - `Dy = a₁c₂ - a₂c₁`\n   - `x = Dx / D`, `y = Dy / D`\n3. **Nature of Solutions:**\n   - `a₁/a₂ ≠ b₁/b₂` ➔ Unique Solution (Intersecting lines)\n   - `a₁/a₂ = b₁/b₂ = c₁/c₂` ➔ Infinitely many solutions (Coincident lines)\n   - `a₁/a₂ = b₁/b₂ ≠ c₁/c₂` ➔ No solution (Parallel lines)\n4. **Speed Tip for MCQ:** For equations like `ax + by = c` and `bx + ay = d`, first add both equations once, then subtract them once to easily find `x + y` and `x - y`!',
   true, true),

  ('short_notes', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'c1010000-0000-0000-0000-000000000002',
   'Quick Revision & Formulas: Quadratic Equations',
   'Discriminant conditions, roots formula, sum and product of roots.',
   '### ⚡ Fast Revision Sheet: Quadratic Equations\n\n1. **Standard Form:** `ax² + bx + c = 0` (`a ≠ 0`)\n2. **Quadratic Formula:** `x = (-b ± √(b² - 4ac)) / (2a)`\n3. **Discriminant (Δ):** `Δ = b² - 4ac`\n   - If `Δ > 0` ➔ Real and Unequal roots\n   - If `Δ = 0` ➔ Real and Equal roots (`x = -b / (2a)`)\n   - If `Δ < 0` ➔ Roots are not real (Imaginary)\n4. **Relation between roots (α, β) and coefficients:**\n   - Sum of roots: `α + β = -b / a`\n   - Product of roots: `α · β = c / a`\n   - To form equation: `x² - (α + β)x + (α · β) = 0`',
   true, true);

-- Sample Resources: Year-wise PYQ Papers (Page 7)
insert into public.resources (type, board_id, class_id, subject_id, title, description, year, is_published, allow_download)
values
  ('pyq', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Mathematics Part 1 (Algebra) - March 2024 Question Paper', 'Official Maharashtra Board SSC March 2024 Examination Paper. Total Marks: 40. Time: 2 Hours.', 2024, true, true),
  ('pyq', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Mathematics Part 1 (Algebra) - March 2023 Question Paper', 'Official SSC Board Question Paper with complete sections Q.1(A) to Q.5. Total Marks: 40.', 2023, true, true),
  ('pyq', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Mathematics Part 1 (Algebra) - March 2022 Question Paper', 'Official Board Question Paper March 2022.', 2022, true, true),
  ('pyq', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Science & Technology Part 1 - March 2024 Question Paper', 'Official SSC Board March 2024 Physics & Chemistry paper with MCQs, conceptual questions and numericals.', 2024, true, true),
  ('pyq', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Science & Technology Part 1 - March 2023 Question Paper', 'Official SSC Board March 2023 Question paper.', 2023, true, true);

-- Sample Resources: Chapterwise PYQs (Page 8)
insert into public.resources (type, board_id, class_id, subject_id, chapter_id, title, description, content_text, year, marks, topic, is_published, allow_download)
values
  ('chapterwise_pyq', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'c1010000-0000-0000-0000-000000000001',
   'Find the value of determinant: | 4  3 | / | 2  7 |',
   'Board Exam question on determinant evaluation.',
   'Evaluate the determinant `| 4   3 |`\n                       `| 2   7 |`',
   2023, 1, 'Determinants', true, true),

  ('chapterwise_pyq', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'c1010000-0000-0000-0000-000000000001',
   'Solve the simultaneous equations using Cramer''s rule: 3x - 4y = 10, 4x + 3y = 5',
   'Frequent 3-mark board examination question.',
   'Solve by Cramer''s rule:\n`3x - 4y = 10`\n`4x + 3y = 5`\nShow all steps for D, Dx, Dy.',
   2024, 3, 'Cramer''s Rule', true, true),

  ('chapterwise_pyq', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c3010000-0000-0000-0000-000000000001',
   'State Kepler''s three laws of planetary motion with a neat labeled diagram.',
   'Classic 3-mark question appearing consistently across 2020, 2022, 2024 board exams.',
   'State Kepler''s three laws of planetary motion. Draw an elliptical orbit diagram showing the sun at one focus and equal areas swept.',
   2024, 3, 'Kepler''s Laws', true, true);

-- Sample Resources: PYQ Solutions (Page 9)
insert into public.resources (type, board_id, class_id, subject_id, chapter_id, title, description, content_text, year, marks, topic, is_published, allow_download)
values
  ('pyq_solution', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'c1010000-0000-0000-0000-000000000001',
   'Solution: Solve 3x - 4y = 10 and 4x + 3y = 5 using Cramer''s Rule (March 2024)',
   'Detailed step-by-step working, determinant calculations and final answer.',
   '### Problem Statement:\nSolve by Cramer''s Rule:\n1) `3x - 4y = 10`\n2) `4x + 3y = 5`\n\n---\n\n### Step-by-Step Solution:\n\n**Step 1: Identify coefficients**\nHere:\n`a₁ = 3, b₁ = -4, c₁ = 10`\n`a₂ = 4, b₂ = 3,  c₂ = 5`\n\n**Step 2: Find Determinant D**\n`D = | 3  -4 | = (3 × 3) - (4 × -4) = 9 - (-16) = 9 + 16 = 25`\n`  | 4   3 |`\nSince `D ≠ 0`, a unique solution exists.\n\n**Step 3: Find Determinant Dx**\n`Dx = | 10  -4 | = (10 × 3) - (5 × -4) = 30 - (-20) = 30 + 20 = 50`\n`   |  5   3 |`\n\n**Step 4: Find Determinant Dy**\n`Dy = | 3  10 | = (3 × 5) - (4 × 10) = 15 - 40 = -25`\n`   | 4   5 |`\n\n**Step 5: Apply Cramer''s Rule**\n`x = Dx / D = 50 / 25 = 2`\n`y = Dy / D = -25 / 25 = -1`\n\n---\n\n### Final Answer:\n**`(x, y) = (2, -1)` is the solution of the given simultaneous equations.**',
   2024, 3, 'Cramer''s Rule', true, true),

  ('pyq_solution', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'c3010000-0000-0000-0000-000000000001',
   'Solution: State Kepler''s three laws of planetary motion (March 2024)',
   'Board exam standard model answer with marks distribution rubric.',
   '### Model Answer (3 Marks):\n\n**1. Kepler''s First Law (Law of Orbits) [1 Mark]:**\nThe orbit of a planet is an ellipse with the Sun at one of the foci.\n\n**2. Kepler''s Second Law (Law of Areas) [1 Mark]:**\nThe straight line joining the planet and the Sun sweeps equal areas in equal intervals of time.\n*(If time taken from A to B is equal to time taken from C to D, then Area ASB = Area CSD)*.\n\n**3. Kepler''s Third Law (Law of Periods) [1 Mark]:**\nThe square of its period of revolution around the Sun is directly proportional to the cube of the mean distance of a planet from the Sun.\n- Mathematical expression: `T² ∝ r³`\n- Hence, `T² / r³ = Constant (K)`\n\nWhere:\n- `T` = Time period of revolution of the planet\n- `r` = Mean distance of the planet from the Sun.',
   2024, 3, 'Kepler''s Laws', true, true);
