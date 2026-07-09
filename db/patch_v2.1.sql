-- TM Labs PM Platform — Patch v2.1 (Production Hardening)
-- Run this in the Supabase SQL Editor ONLY if your database was already
-- created with schema.sql v2.0. If you are starting fresh, run schema.sql instead.
-- Safe to re-run (all statements are idempotent).
--
-- Changes applied:
--   1. Hardened is_pm() with SET search_path (blocks search_path injection)
--   2. Added handle_new_user() trigger to sync auth.users → public.profiles
--   3. Added trigger_set_timestamp() to auto-bump updated_at
--   4. Fixed RLS variable shadowing in 6 policies (task_id = task_id → aliased)
--   5. Added 18 performance indexes on all FK columns

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Harden is_pm() — add SET search_path
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_pm(user_id uuid)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'product_manager'
  );
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Auto-update updated_at trigger function
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

CREATE OR REPLACE TRIGGER set_timestamp_tasks
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Auth → Profiles sync trigger
-- ────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, status)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'staff'),
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger (CREATE OR REPLACE not supported on triggers)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Fix RLS variable shadowing — drop and recreate affected policies
-- Affected: tasks, task_dependencies, task_custom_field_values,
--           comments, attachments, task_history
-- ────────────────────────────────────────────────────────────────────────────

-- 4a. Tasks
DROP POLICY IF EXISTS select_tasks ON public.tasks;
DROP POLICY IF EXISTS update_tasks ON public.tasks;

CREATE POLICY select_tasks ON public.tasks
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.tasks.id AND ta.user_id = auth.uid()
    )
  );

CREATE POLICY update_tasks ON public.tasks
  FOR UPDATE TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.tasks.id AND ta.user_id = auth.uid()
    )
  );

-- 4b. Task Dependencies
DROP POLICY IF EXISTS select_task_dependencies ON public.task_dependencies;

CREATE POLICY select_task_dependencies ON public.task_dependencies
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.task_dependencies.task_id AND ta.user_id = auth.uid()
    )
  );

-- 4c. Task Custom Field Values
DROP POLICY IF EXISTS select_task_custom_field_values ON public.task_custom_field_values;

CREATE POLICY select_task_custom_field_values ON public.task_custom_field_values
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.task_custom_field_values.task_id AND ta.user_id = auth.uid()
    )
  );

-- 4d. Comments
DROP POLICY IF EXISTS select_comments ON public.comments;
DROP POLICY IF EXISTS insert_comments ON public.comments;

CREATE POLICY select_comments ON public.comments
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.comments.task_id AND ta.user_id = auth.uid()
    )
  );

CREATE POLICY insert_comments ON public.comments
  FOR INSERT TO authenticated WITH CHECK (
    public.is_pm(auth.uid()) OR
    (
      EXISTS (
        SELECT 1 FROM public.task_assignees ta
        WHERE ta.task_id = public.comments.task_id AND ta.user_id = auth.uid()
      )
      AND author_id = auth.uid()
    )
  );

-- 4e. Attachments
DROP POLICY IF EXISTS select_attachments ON public.attachments;
DROP POLICY IF EXISTS insert_attachments ON public.attachments;

CREATE POLICY select_attachments ON public.attachments
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.attachments.task_id AND ta.user_id = auth.uid()
    )
  );

CREATE POLICY insert_attachments ON public.attachments
  FOR INSERT TO authenticated WITH CHECK (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.attachments.task_id AND ta.user_id = auth.uid()
    )
  );

-- 4f. Task History
DROP POLICY IF EXISTS select_task_history ON public.task_history;

CREATE POLICY select_task_history ON public.task_history
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.task_history.task_id AND ta.user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Performance Indexes
-- ────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tasks_list_id             ON public.tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id           ON public.tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_id           ON public.tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by          ON public.tasks(created_by);

CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id    ON public.task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id    ON public.task_assignees(task_id);

CREATE INDEX IF NOT EXISTS idx_comments_task_id          ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id        ON public.comments(author_id);

CREATE INDEX IF NOT EXISTS idx_attachments_task_id       ON public.attachments(task_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id     ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id     ON public.notifications(task_id);

CREATE INDEX IF NOT EXISTS idx_task_history_task_id      ON public.task_history(task_id);

CREATE INDEX IF NOT EXISTS idx_task_deps_task_id         ON public.task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_depends_on_id   ON public.task_dependencies(depends_on_task_id);

CREATE INDEX IF NOT EXISTS idx_statuses_list_id          ON public.statuses(list_id);

CREATE INDEX IF NOT EXISTS idx_lists_space_id            ON public.lists(space_id);
CREATE INDEX IF NOT EXISTS idx_lists_folder_id           ON public.lists(folder_id);

CREATE INDEX IF NOT EXISTS idx_folders_space_id          ON public.folders(space_id);

-- Done. All patches applied.
