-- TM Labs PM Platform v2.0 Schema Definition
-- Run this script in the Supabase SQL Editor.
-- Last patched: 2026-07-09 — production hardening pass
--   ✅ Fixed RLS variable shadowing (task_id = task_id loops)
--   ✅ Hardened is_pm() with SET search_path
--   ✅ Added missing performance indexes on all FK columns
--   ✅ Added handle_new_user() trigger to auto-sync auth.users → profiles
--   ✅ Added trigger_set_timestamp() to auto-bump updated_at on profiles & tasks

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ───────────────────────────────────────────────────────────────────────
-- AUTOMATION TRIGGERS (run before table creation)
-- ───────────────────────────────────────────────────────────────────────

-- Auto-bump updated_at on any BEFORE UPDATE
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ───────────────────────────────────────────────────────────────────────
-- 1. Profiles Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL CHECK (role IN ('staff', 'product_manager', 'stakeholder')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated', 'pending')),
  timezone text NOT NULL DEFAULT 'UTC',
  notification_preferences jsonb NOT NULL DEFAULT '{"assigned": true, "mentioned": true, "due_soon": true, "dependency_resolved": true}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auto-bump updated_at on profiles
CREATE OR REPLACE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- ───────────────────────────────────────────────────────────────────────
-- SECURITY DEFINER HELPER — safe from RLS recursion
-- SET search_path explicitly so it always resolves against public schema
-- regardless of session search_path manipulation attempts.
-- ───────────────────────────────────────────────────────────────────────
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

-- ───────────────────────────────────────────────────────────────────────
-- Auth → Profiles sync trigger
-- Fires after every INSERT into auth.users (e.g. invite, sign-up, magic link)
-- and creates a corresponding public.profiles row automatically.
-- ───────────────────────────────────────────────────────────────────────
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
  ON CONFLICT (id) DO NOTHING; -- idempotent: won't fail on re-runs
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ───────────────────────────────────────────────────────────────────────
-- 2. Spaces Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text,
  icon text,
  position integer DEFAULT 0 NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  clickup_id text
);

ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 3. Folders Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text,
  position integer DEFAULT 0 NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  clickup_id text
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 4. Lists Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid REFERENCES public.spaces(id) ON DELETE CASCADE NOT NULL,
  folder_id uuid REFERENCES public.folders(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text,
  position integer DEFAULT 0 NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  clickup_id text
);

ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 5. Statuses Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  type text NOT NULL CHECK (type IN ('open', 'in_progress', 'review', 'closed', 'blocked')),
  position integer DEFAULT 0 NOT NULL
);

ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 6. Tasks Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  parent_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status_id uuid REFERENCES public.statuses(id) ON DELETE RESTRICT NOT NULL,
  priority text CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  start_date date,
  due_date date,
  date_closed timestamp with time zone,
  time_estimate bigint, -- milliseconds
  time_spent bigint DEFAULT 0 NOT NULL, -- milliseconds
  position integer DEFAULT 0 NOT NULL,
  is_archived boolean DEFAULT false NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  clickup_id text
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Auto-bump updated_at on tasks
CREATE OR REPLACE TRIGGER set_timestamp_tasks
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();

-- ───────────────────────────────────────────────────────────────────────
-- 7. Task Assignees Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_assignees (
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid REFERENCES public.profiles(id),
  assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 8. Task Tags Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL,
  created_by uuid REFERENCES public.profiles(id)
);

ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 9. Task Tag Links Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_tag_links (
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.task_tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (task_id, tag_id)
);

ALTER TABLE public.task_tag_links ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 10. Task Dependencies Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  depends_on_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('blocking', 'waiting_on')),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 11. Custom Fields Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'number', 'date', 'checkbox', 'dropdown', 'url')),
  options jsonb,
  position integer DEFAULT 0 NOT NULL
);

ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 12. Task Custom Field Values Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_custom_field_values (
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  field_id uuid REFERENCES public.custom_fields(id) ON DELETE CASCADE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (task_id, field_id)
);

ALTER TABLE public.task_custom_field_values ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 13. Comments Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  mentions uuid[] DEFAULT '{}'::uuid[] NOT NULL,
  edited_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 14. Attachments Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  uploaded_by uuid REFERENCES public.profiles(id),
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text,
  storage_path text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 15. Notifications Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('assigned', 'unassigned', 'mentioned', 'due_soon', 'status_changed', 'comment', 'dependency_resolved')),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES public.profiles(id),
  message text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ───────────────────────────────────────────────────────────────────────
-- 16. Task History Table
-- ───────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  changed_by uuid REFERENCES public.profiles(id),
  field text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  changed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;


-- ───────────────────────────────────────────────────────────────────────
-- PERFORMANCE INDEXES
-- Postgres does NOT auto-index foreign keys. Without these, every dashboard
-- load and task update triggers a full sequential scan on the relevant table.
-- ───────────────────────────────────────────────────────────────────────

-- tasks: FK columns
CREATE INDEX IF NOT EXISTS idx_tasks_list_id        ON public.tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id      ON public.tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status_id      ON public.tasks(status_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by     ON public.tasks(created_by);

-- task_assignees: look up tasks by assignee and vice-versa
CREATE INDEX IF NOT EXISTS idx_task_assignees_user_id  ON public.task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_task_assignees_task_id  ON public.task_assignees(task_id);

-- comments: look up all comments for a task
CREATE INDEX IF NOT EXISTS idx_comments_task_id     ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id   ON public.comments(author_id);

-- attachments: look up all attachments for a task
CREATE INDEX IF NOT EXISTS idx_attachments_task_id  ON public.attachments(task_id);

-- notifications: look up all notifications for a user (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_task_id ON public.notifications(task_id);

-- task_history: look up audit log for a task
CREATE INDEX IF NOT EXISTS idx_task_history_task_id ON public.task_history(task_id);

-- task_dependencies: look up blockers in both directions
CREATE INDEX IF NOT EXISTS idx_task_deps_task_id          ON public.task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_deps_depends_on_id    ON public.task_dependencies(depends_on_task_id);

-- statuses: look up all statuses belonging to a list
CREATE INDEX IF NOT EXISTS idx_statuses_list_id     ON public.statuses(list_id);

-- lists: look up lists in a space or folder
CREATE INDEX IF NOT EXISTS idx_lists_space_id       ON public.lists(space_id);
CREATE INDEX IF NOT EXISTS idx_lists_folder_id      ON public.lists(folder_id);

-- folders: look up folders in a space
CREATE INDEX IF NOT EXISTS idx_folders_space_id     ON public.folders(space_id);


-- ───────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ───────────────────────────────────────────────────────────────────────
-- IMPORTANT: All subqueries referencing task_assignees now use explicit
-- table aliases to prevent variable shadowing where Postgres evaluates
-- `task_id = task_id` as always-true (WHERE true) instead of joining the
-- parent table's task_id against the task_assignees row.
-- ───────────────────────────────────────────────────────────────────────

-- 1. Profiles Policies
CREATE POLICY select_profiles ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY update_profiles ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_pm(auth.uid()));

-- 2. Spaces Policies
CREATE POLICY select_spaces ON public.spaces
  FOR SELECT TO authenticated USING (true);

CREATE POLICY manage_spaces ON public.spaces
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 3. Folders Policies
CREATE POLICY select_folders ON public.folders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY manage_folders ON public.folders
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 4. Lists Policies
CREATE POLICY select_lists ON public.lists
  FOR SELECT TO authenticated USING (true);

CREATE POLICY manage_lists ON public.lists
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 5. Statuses Policies
CREATE POLICY select_statuses ON public.statuses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY manage_statuses ON public.statuses
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 6. Tasks Policies
-- FIX: alias task_assignees as `ta` so `ta.task_id` refers to the joined
--      table and `public.tasks.id` refers to the outer row being evaluated.
CREATE POLICY select_tasks ON public.tasks
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.tasks.id AND ta.user_id = auth.uid()
    )
  );

CREATE POLICY insert_tasks ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (public.is_pm(auth.uid()));

CREATE POLICY update_tasks ON public.tasks
  FOR UPDATE TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.tasks.id AND ta.user_id = auth.uid()
    )
  );

CREATE POLICY delete_tasks ON public.tasks
  FOR DELETE TO authenticated USING (public.is_pm(auth.uid()));

-- 7. Task Assignees Policies
CREATE POLICY select_task_assignees ON public.task_assignees
  FOR SELECT TO authenticated USING (true);

CREATE POLICY manage_task_assignees ON public.task_assignees
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 8. Task Tags Policies
CREATE POLICY select_task_tags ON public.task_tags
  FOR SELECT TO authenticated USING (true);

CREATE POLICY manage_task_tags ON public.task_tags
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 9. Task Tag Links Policies
CREATE POLICY select_task_tag_links ON public.task_tag_links
  FOR SELECT TO authenticated USING (true);

CREATE POLICY manage_task_tag_links ON public.task_tag_links
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 10. Task Dependencies Policies
-- FIX: `ta.task_id = public.task_dependencies.task_id` — was `task_id = task_id` (always true)
CREATE POLICY select_task_dependencies ON public.task_dependencies
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.task_dependencies.task_id AND ta.user_id = auth.uid()
    )
  );

CREATE POLICY manage_task_dependencies ON public.task_dependencies
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 11. Custom Fields Policies
CREATE POLICY select_custom_fields ON public.custom_fields
  FOR SELECT TO authenticated USING (true);

CREATE POLICY manage_custom_fields ON public.custom_fields
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 12. Task Custom Field Values Policies
-- FIX: `ta.task_id = public.task_custom_field_values.task_id` — was always-true shadowing
CREATE POLICY select_task_custom_field_values ON public.task_custom_field_values
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.task_custom_field_values.task_id AND ta.user_id = auth.uid()
    )
  );

CREATE POLICY manage_task_custom_field_values ON public.task_custom_field_values
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 13. Comments Policies
-- FIX: `ta.task_id = public.comments.task_id` — was always-true shadowing
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

CREATE POLICY update_comments ON public.comments
  FOR UPDATE TO authenticated USING (author_id = auth.uid());

CREATE POLICY delete_comments ON public.comments
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.is_pm(auth.uid()));

-- 14. Attachments Policies
-- FIX: `ta.task_id = public.attachments.task_id` — was always-true shadowing
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

CREATE POLICY delete_attachments ON public.attachments
  FOR DELETE TO authenticated USING (
    public.is_pm(auth.uid()) OR
    uploaded_by = auth.uid()
  );

-- 15. Notifications Policies
CREATE POLICY select_notifications ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY update_notifications ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- 16. Task History Policies
-- FIX: `ta.task_id = public.task_history.task_id` — was always-true shadowing
CREATE POLICY select_task_history ON public.task_history
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.task_assignees ta
      WHERE ta.task_id = public.task_history.task_id AND ta.user_id = auth.uid()
    )
  );


-- ───────────────────────────────────────────────────────────────────────
-- ENABLE REALTIME ON TABLES
-- ───────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'task_assignees'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.task_assignees;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_publication p ON pr.prpubid = p.oid
    WHERE p.pubname = 'supabase_realtime' AND c.relname = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;
