-- ============================================================================
-- BoardsBuddy - Secure Content Access Migration
-- Date: 2026-10-28
-- 
-- Enforces authentication requirements:
-- 1. Textbooks and PYQ Papers are publicly accessible without authentication.
-- 2. Notes, Short Notes, Chapter-wise PYQs, and PYQ Solutions require user authentication.
-- 3. Storage objects are segregated by folder access rules.
-- 4. Admins retain unrestricted management access.
-- ============================================================================

-- Drop existing broad select policies on public.resources
drop policy if exists "Anyone can view published resources or admin can view all" on public.resources;
drop policy if exists "Public can view published textbooks and pyqs" on public.resources;
drop policy if exists "Authenticated users can view all published resources" on public.resources;
drop policy if exists "Admins can view all resources" on public.resources;

-- 1. Public can view only published textbooks and pyq papers
create policy "Public can view published textbooks and pyqs"
  on public.resources for select
  using (
    is_published = true 
    and type in ('textbook', 'pyq')
  );

-- 2. Authenticated users (free student accounts) can view all published materials
create policy "Authenticated users can view all published resources"
  on public.resources for select
  to authenticated
  using (
    is_published = true
  );

-- 3. Admins can view all resources (published or drafts)
create policy "Admins can view all resources"
  on public.resources for select
  using (
    public.is_admin()
  );

-- 4. Storage Bucket Policies
drop policy if exists "Public Access for Study Materials" on storage.objects;
drop policy if exists "Public read access for textbooks, pyqs and thumbnails" on storage.objects;

-- Public can read chapter thumbnails, textbooks, and full PYQ exam papers
-- Authenticated users and admins can read all materials in study-materials
create policy "Public read access for textbooks, pyqs and thumbnails"
  on storage.objects for select
  using (
    bucket_id = 'chapter-thumbnails'
    or (bucket_id = 'study-materials' and (name like 'textbooks/%' or name like 'pyqs/%'))
    or (bucket_id = 'study-materials' and auth.role() = 'authenticated')
    or public.is_admin()
  );
