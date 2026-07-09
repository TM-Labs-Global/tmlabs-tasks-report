-- TM Labs PM Platform v2.0 Schema Definition
-- Run this script in the Supabase SQL Editor.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
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

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper security definer function to avoid recursive RLS checks on profiles
CREATE OR REPLACE FUNCTION public.is_pm(user_id uuid)
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'product_manager'
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Spaces Table
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

-- 3. Folders Table
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

-- 4. Lists Table
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

-- 5. Statuses Table
CREATE TABLE IF NOT EXISTS public.statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  type text NOT NULL CHECK (type IN ('open', 'in_progress', 'review', 'closed', 'blocked')),
  position integer DEFAULT 0 NOT NULL
);

ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;

-- 6. Tasks Table
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

-- 7. Task Assignees Table
CREATE TABLE IF NOT EXISTS public.task_assignees (
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_by uuid REFERENCES public.profiles(id),
  assigned_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (task_id, user_id)
);

ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;

-- 8. Task Tags Table
CREATE TABLE IF NOT EXISTS public.task_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL,
  created_by uuid REFERENCES public.profiles(id)
);

ALTER TABLE public.task_tags ENABLE ROW LEVEL SECURITY;

-- 9. Task Tag Links Table
CREATE TABLE IF NOT EXISTS public.task_tag_links (
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  tag_id uuid REFERENCES public.task_tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (task_id, tag_id)
);

ALTER TABLE public.task_tag_links ENABLE ROW LEVEL SECURITY;

-- 10. Task Dependencies Table
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  depends_on_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('blocking', 'waiting_on')),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- 11. Custom Fields Table
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('text', 'number', 'date', 'checkbox', 'dropdown', 'url')),
  options jsonb,
  position integer DEFAULT 0 NOT NULL
);

ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

-- 12. Task Custom Field Values Table
CREATE TABLE IF NOT EXISTS public.task_custom_field_values (
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  field_id uuid REFERENCES public.custom_fields(id) ON DELETE CASCADE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (task_id, field_id)
);

ALTER TABLE public.task_custom_field_values ENABLE ROW LEVEL SECURITY;

-- 13. Comments Table
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

-- 14. Attachments Table
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

-- 15. Notifications Table
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

-- 16. Task History Table
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
-- ROW LEVEL SECURITY (RLS) POLICIES
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
CREATE POLICY select_tasks ON public.tasks
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = id AND user_id = auth.uid())
  );

CREATE POLICY insert_tasks ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (public.is_pm(auth.uid()));

CREATE POLICY update_tasks ON public.tasks
  FOR UPDATE TO authenticated USING (
    public.is_pm(auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = id AND user_id = auth.uid())
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
CREATE POLICY select_task_dependencies ON public.task_dependencies
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = task_id AND user_id = auth.uid())
  );

CREATE POLICY manage_task_dependencies ON public.task_dependencies
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 11. Custom Fields Policies
CREATE POLICY select_custom_fields ON public.custom_fields
  FOR SELECT TO authenticated USING (true);

CREATE POLICY manage_custom_fields ON public.custom_fields
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 12. Task Custom Field Values Policies
CREATE POLICY select_task_custom_field_values ON public.task_custom_field_values
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = task_id AND user_id = auth.uid())
  );

CREATE POLICY manage_task_custom_field_values ON public.task_custom_field_values
  FOR ALL TO authenticated USING (public.is_pm(auth.uid()));

-- 13. Comments Policies
CREATE POLICY select_comments ON public.comments
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = task_id AND user_id = auth.uid())
  );

CREATE POLICY insert_comments ON public.comments
  FOR INSERT TO authenticated WITH CHECK (
    public.is_pm(auth.uid()) OR 
    (EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = task_id AND user_id = auth.uid()) AND author_id = auth.uid())
  );

CREATE POLICY update_comments ON public.comments
  FOR UPDATE TO authenticated USING (author_id = auth.uid());

CREATE POLICY delete_comments ON public.comments
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.is_pm(auth.uid()));

-- 14. Attachments Policies
CREATE POLICY select_attachments ON public.attachments
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = task_id AND user_id = auth.uid())
  );

CREATE POLICY insert_attachments ON public.attachments
  FOR INSERT TO authenticated WITH CHECK (
    public.is_pm(auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = task_id AND user_id = auth.uid())
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
CREATE POLICY select_task_history ON public.task_history
  FOR SELECT TO authenticated USING (
    public.is_pm(auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = task_id AND user_id = auth.uid())
  );


-- ───────────────────────────────────────────────────────────────────────
-- ENABLE REALTIME ON TABLES
-- ───────────────────────────────────────────────────────────────────────
-- Add the tables to the Supabase Realtime publication (supabase_realtime)

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
