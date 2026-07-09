+-----------------------------------------------------------------------+
| **TM LABS**                                                           |
|                                                                       |
| **Project Management Platform**                                       |
|                                                                       |
| Product Requirements Document --- v2.0                                |
|                                                                       |
| *Built on the existing reporting dashboard codebase*                  |
+-----------------------------------------------------------------------+

  ----------------- ----------------- ----------------------- -------------------
  **Version**       **Status**        **Stack**               **Prepared For**

  v2.0              Agent Hand-off    Next.js 14 + Supabase   Antigravity Agent
  ----------------- ----------------- ----------------------- -------------------

*Infrastructure: Next.js 14 · Supabase · Resend · Netlify · exceljs · Recharts*

**Table of Contents**

  ----- -----------------------------------------------------------------
  01    What This Document Is

  02    What Already Exists --- Codebase Audit

  03    What Is Being Added --- Scope of New Work

  04    Architecture --- How New Fits Into Existing

  05    Database Schema --- New Supabase Tables

  06    Authentication --- Extending the Existing OTP System

  07    Role-Based Access Control

  08    Feature: Workspace & Project Hierarchy

  09    Feature: Task Management

  10    Feature: Subtasks & Dependencies

  11    Feature: Comments & Attachments

  12    Feature: Views --- List, Kanban, Calendar

  13    Feature: My Tasks --- Staff Home View

  14    Feature: Team Member Management

  15    Feature: Notifications via Resend

  16    Reporting Dashboard --- Migration from ClickUp to Supabase

  17    ClickUp Data Migration Plan

  18    Environment Variables --- Updated Full List

  19    Non-Functional Requirements

  20    Acceptance Criteria

  21    Implementation Phases

  22    Risks & Mitigations
  ----- -----------------------------------------------------------------

  -----------------------------------------------------------------------
  **01 What This Document Is**

  -----------------------------------------------------------------------

This is v2.0 of the TM Labs PM Platform PRD. It supersedes v1.0. It has been rewritten using the actual codebase documentation for the existing reporting dashboard so that the agent building it has accurate context about the current state of the system before being asked to extend it.

**The Core Goal**

The existing dashboard is a read-only reporting interface that reads from ClickUp. The goal is to transform it into a full project management platform --- so that TM Labs can stop paying for ClickUp entirely. The new platform must:

-   Let Product Managers create and manage projects, tasks, and team members from within the same application

-   Let Staff see and update only their own assigned tasks

-   Let Stakeholders continue using the existing reporting dashboard --- unchanged

-   Replace ClickUp as the data source by storing all task and project data in Supabase

-   Migrate all existing ClickUp data into Supabase so no work history is lost

**What This Document Is Not**

-   It is not a rewrite of the reporting dashboard --- the existing UI stays exactly as it is

-   It is not a new application --- it extends the existing Next.js codebase

-   It is not a redesign --- the existing design system, tokens, and component patterns are used for all new features

+-----------------------------------------------------------------------+
| **02 What Already Exists --- Codebase Audit**                         |
|                                                                       |
| Read this before touching anything                                    |
+-----------------------------------------------------------------------+

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  *AGENT INSTRUCTION: Everything described in this section already exists and is working in production. Do not rewrite, replace, or refactor any of it. Build new features alongside what is here, not on top of a rewrite.*

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Framework & Architecture**

-   Next.js 14/15 with App Router --- all routing follows the app/ directory structure

-   Feature-Sliced Design (FSD) + Domain-Driven Design (DDD) --- features/ contains standalone modules, shared/ contains reusable infrastructure

-   Serverless/Edge-compatible --- no long-running server processes

**Authentication (Already Built --- Do Not Replace)**

-   Passwordless OTP login --- 6-digit code, 5-minute expiry

-   Domain-restricted: only \@takeoutmedia.xyz and \@tmlabs.xyz emails can log in

-   OTP delivery: nodemailer (SMTP) in production; console/mock mode in dev

-   Session: HMAC-SHA256 signed token, stored as HTTP-only cookie (session_token), 7-day expiry

-   Middleware in proxy.ts (symlinked/imported into middleware.ts) --- protects all routes

-   The role system for PM / Staff / Stakeholder must integrate with this existing session system --- do not replace it

**Database (Hybrid --- Already Exists)**

-   db.ts acts as an orchestrator: uses Supabase when configured, falls back to db/db.json in dev

-   Supabase currently has two tables: otps (OTP codes) and logs (session audit log)

-   All new PM platform tables must be added to this same Supabase project

-   The hybrid db pattern should be respected --- new tables can have Supabase-only implementations since they are not needed in dev mock mode

**Existing Dashboard Pages**

  ------------------ --------------------------------------------------------------------- -----------------------------------------
  **Route**          **Page**                                                              **Current Data Source**

  /                  Executive Overview --- 8 KPI cards, 4 Recharts charts                 ClickUp API via /api/clickup proxy

  /reporting         Reporting Center --- period filters, delivery metrics, Excel export   ClickUp API via /api/clickup proxy

  /team              Team Performance --- workload charts, member cards                    ClickUp API via /api/clickup proxy

  /projects          Project Health --- progress bars, risk categorization, Gantt chart    ClickUp API via /api/clickup proxy

  /login             OTP login screen                                                      Supabase (otps table) or db.json

  /design-system     Design token showcase --- auto-parsed from CSS files                  CSS files (server-side fs.readFileSync)

  /docs              Architecture docs viewer                                              Static markdown
  ------------------ --------------------------------------------------------------------- -----------------------------------------

**Existing Data Layer**

-   shared/api/clickup.ts --- ClickUp client wrapper, routes all calls through /api/clickup proxy

-   shared/context/ClickUpContext.tsx --- React Context holding all task data, computed flags (overdue, blocked, spillover), deduplication, 60-second auto-sync

-   shared/utils/userMapping.ts --- maps deactivated ClickUp user IDs to active profiles

-   shared/utils/excelReport.ts --- Excel export using exceljs, canvas-drawn bar chart injected as PNG

-   shared/hooks/useFilteredTasks.ts --- shared filtering hook used across all dashboard views

**Design System**

-   3-layer CSS token system: primitives (colors.css) → semantics (semantics.css) → component styles

-   Brand: dark theme always-on, neon pink #FF3396 to purple #6633FF gradients, glassmorphism cards

-   All new PM platform UI must use the same CSS variables --- no inline styles, no new color values

-   Recharts for all charts --- already installed and in use

  -----------------------------------------------------------------------
  **03 What Is Being Added --- Scope of New Work**

  -----------------------------------------------------------------------

  --------------------------------------------------------------------------------------------------------
  *This is the complete list of new code to be written. Everything else in the application stays as-is.*

  --------------------------------------------------------------------------------------------------------

**New Routes (app/ directory)**

  ----------------------- ---------------------------------------------- --------------------------
  **Route**               **Purpose**                                    **Who Sees It**

  /workspace              Project hierarchy --- Spaces, Folders, Lists   PM only

  /workspace/\[listId\]   List view for a specific List                  PM only

  /tasks/new              Create new task (full form)                    PM only

  /tasks/\[taskId\]       Task detail page (full screen)                 PM + assigned Staff

  /mytasks                Personal task view --- staff home              Staff + PM

  /calendar               Calendar view of tasks                         Staff (own) + PM (all)

  /members                Team member management                         PM only

  /settings               User profile + notification preferences        All roles
  ----------------------- ---------------------------------------------- --------------------------

**New Feature Modules (features/ directory)**

-   features/workspace/ --- Space, Folder, List management UI and hooks

-   features/tasks/ --- Task creation, editing, detail panel, status board

-   features/mytasks/ --- Personal task list view for Staff

-   features/calendar/ --- Calendar view component

-   features/members/ --- Team member list, invite, role management

-   features/settings/ --- Profile editing, notification preferences

**New Shared Infrastructure (shared/ directory)**

-   shared/api/supabase.ts --- Supabase client (replaces ClickUp client for PM data)

-   shared/context/WorkspaceContext.tsx --- React Context for PM platform data (projects, tasks, members)

-   shared/context/AuthContext.tsx --- extends session with role information

-   shared/utils/notifications.ts --- Resend email dispatch helpers

**New API Routes (app/api/ directory)**

-   app/api/tasks/ --- CRUD operations for tasks

-   app/api/workspace/ --- CRUD for spaces, folders, lists, statuses

-   app/api/members/ --- invite, update role, deactivate

-   app/api/notifications/ --- trigger Resend emails

-   app/api/migrate/ --- one-time ClickUp migration endpoint (authenticated, PM only)

**What Is NOT Being Built**

-   Mobile app or mobile-optimised layout (desktop-first)

-   Gantt chart for new tasks (existing Gantt on /projects stays; new tasks use Calendar)

-   Automations, Sprints, Docs/Wikis, Forms, third-party integrations

-   New design system --- all new UI uses existing tokens and components

  -----------------------------------------------------------------------
  **04 Architecture --- How New Fits Into Existing**

  -----------------------------------------------------------------------

**Two Parallel Data Contexts**

The application will run two React Contexts in parallel from layout.tsx:

-   ClickUpContext (existing) --- continues to serve the four reporting dashboard pages until migration is complete. After migration, this context is re-pointed to Supabase (see Section 16).

-   WorkspaceContext (new) --- serves all PM platform pages. Reads from and writes to Supabase directly.

**Navigation Update**

The existing sidebar navigation must be extended with new PM section links. Role-gating determines which links each user sees:

  --------------------------------- ---------------- ---------------- -----------------
  **Nav Item**                      **Staff**        **PM**           **Stakeholder**

  / --- Executive Overview          ❌               ✅               ✅

  /reporting --- Reporting Center   ❌               ✅               ✅

  /team --- Team Performance        ❌               ✅               ❌

  /projects --- Project Health      ❌               ✅               ❌

  ── NEW SECTION ──                 --               --               --

  /mytasks --- My Tasks             ✅               ✅               ❌

  /workspace --- Projects & Tasks   ❌               ✅               ❌

  /calendar --- Calendar            ✅ own           ✅ all           ❌

  /members --- Team Members         ❌               ✅               ❌

  /settings --- Settings            ✅               ✅               ✅
  --------------------------------- ---------------- ---------------- -----------------

**Session & Role Extension**

The existing HMAC session token contains the user\'s email. To add roles, the session payload must be extended to include a role field:

// Extended session payload { email: \"ross@takeoutmedia.xyz\", role: \"product_manager\", // NEW --- pulled from profiles table on login iat: 1234567890 }

On OTP verification, after the session is issued, the server queries the profiles table for the user\'s role and includes it in the session payload. The session cookie is re-issued with this extended payload. Middleware reads role from the session to enforce route protection.

**API Route Pattern for PM Features**

All new PM API routes follow the same proxy pattern as the existing codebase --- they are Next.js API route handlers in app/api/. They read the session_token cookie, verify the HMAC signature, extract role, and enforce access before performing Supabase operations.

+-----------------------------------------------------------------------+
| **05 Database Schema --- New Supabase Tables**                        |
|                                                                       |
| Add these to the existing Supabase project alongside otps and logs    |
+-----------------------------------------------------------------------+

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  *AGENT INSTRUCTION: The existing Supabase project already has two tables: otps and logs. Do not modify those. Add all tables below as new tables. Enable Row Level Security (RLS) on every new table. Enable Supabase Realtime on: tasks, task_assignees, comments, notifications.*

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  ---------------------------------------------------------------------------------------------------------- --------------- ---------------------------------------------------------------------------------------------------------------
  **profiles**                                                                                                               

  *One row per authenticated user. Extends the existing OTP/session auth system.*                                            

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK --- matches Supabase auth user id (or generated on first OTP login)

  email                                                                                                      text            Unique --- matches the email used for OTP login

  full_name                                                                                                  text            Display name

  avatar_url                                                                                                 text            Supabase Storage URL or null

  role                                                                                                       text            \'staff\' \| \'product_manager\' \| \'stakeholder\'

  status                                                                                                     text            \'active\' \| \'deactivated\'

  timezone                                                                                                   text            e.g. Africa/Lagos --- default UTC

  notification_preferences                                                                                   jsonb           Per-type email toggle preferences

  created_at                                                                                                 timestamptz     Auto

  updated_at                                                                                                 timestamptz     Auto

                                                                                                                             

  **spaces**                                                                                                                 

  *Top-level groupings within the workspace (equivalent to ClickUp Spaces).*                                                 

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  name                                                                                                       text            Space name

  color                                                                                                      text            Hex color for sidebar indicator

  icon                                                                                                       text            Emoji or icon identifier

  position                                                                                                   integer         Sort order in sidebar

  created_by                                                                                                 uuid            FK → profiles.id

  created_at                                                                                                 timestamptz     Auto

  clickup_id                                                                                                 text            Preserved from ClickUp migration --- nullable

                                                                                                                             

  **folders**                                                                                                                

  *Optional grouping layer inside a Space.*                                                                                  

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  space_id                                                                                                   uuid            FK → spaces.id

  name                                                                                                       text            

  color                                                                                                      text            Hex color --- nullable

  position                                                                                                   integer         Sort order within space

  created_by                                                                                                 uuid            FK → profiles.id

  created_at                                                                                                 timestamptz     Auto

  clickup_id                                                                                                 text            From migration --- nullable

                                                                                                                             

  **lists**                                                                                                                  

  *Task containers. Can sit inside a folder or directly under a space (folderless).*                                         

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  space_id                                                                                                   uuid            FK → spaces.id

  folder_id                                                                                                  uuid            FK → folders.id --- NULL means folderless list

  name                                                                                                       text            

  color                                                                                                      text            Nullable

  position                                                                                                   integer         Sort order

  created_by                                                                                                 uuid            FK → profiles.id

  created_at                                                                                                 timestamptz     Auto

  clickup_id                                                                                                 text            From migration --- nullable

                                                                                                                             

  **statuses**                                                                                                               

  *Custom status definitions per list. Each list has its own set.*                                                           

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  list_id                                                                                                    uuid            FK → lists.id

  name                                                                                                       text            Status label e.g. \'In Review\'

  color                                                                                                      text            Hex color

  type                                                                                                       text            \'open\' \| \'in_progress\' \| \'review\' \| \'closed\' \| \'blocked\'

  position                                                                                                   integer         Display order within the list

                                                                                                                             

  **tasks**                                                                                                                  

  *Core task record. Parent tasks and subtasks are both stored here --- differentiated by parent_task_id.*                   

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  list_id                                                                                                    uuid            FK → lists.id

  parent_task_id                                                                                             uuid            FK → tasks.id --- NULL means top-level task

  name                                                                                                       text            Task title

  description                                                                                                text            Rich text / markdown

  status_id                                                                                                  uuid            FK → statuses.id

  priority                                                                                                   text            \'urgent\' \| \'high\' \| \'normal\' \| \'low\' --- nullable

  start_date                                                                                                 date            Nullable

  due_date                                                                                                   date            Nullable

  date_closed                                                                                                timestamptz     Set when status.type = \'closed\'

  time_estimate                                                                                              integer         Milliseconds --- nullable

  time_spent                                                                                                 integer         Milliseconds --- sum of time_entries

  position                                                                                                   integer         Sort order within list + status group

  is_archived                                                                                                boolean         Default false

  created_by                                                                                                 uuid            FK → profiles.id

  created_at                                                                                                 timestamptz     Auto

  updated_at                                                                                                 timestamptz     Auto --- drives Supabase Realtime events

  clickup_id                                                                                                 text            Preserved from migration for traceability --- nullable

                                                                                                                             

  **task_assignees**                                                                                                         

  *Many-to-many join --- tasks can have multiple assignees.*                                                                 

  **Column**                                                                                                 **Type**        **Notes**

  task_id                                                                                                    uuid            FK → tasks.id

  user_id                                                                                                    uuid            FK → profiles.id

  assigned_by                                                                                                uuid            FK → profiles.id

  assigned_at                                                                                                timestamptz     Auto

                                                                                                                             

  **task_tags**                                                                                                              

  *Workspace-level tag definitions.*                                                                                         

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  name                                                                                                       text            Tag label

  color                                                                                                      text            Hex color

  created_by                                                                                                 uuid            FK → profiles.id

                                                                                                                             

  **task_tag_links**                                                                                                         

  *Join table --- task to tag.*                                                                                              

  **Column**                                                                                                 **Type**        **Notes**

  task_id                                                                                                    uuid            FK → tasks.id

  tag_id                                                                                                     uuid            FK → task_tags.id

                                                                                                                             

  **task_dependencies**                                                                                                      

  *Blocking and waiting-on relationships.*                                                                                   

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  task_id                                                                                                    uuid            The task that is waiting

  depends_on_task_id                                                                                         uuid            The task that must finish first

  type                                                                                                       text            \'blocking\' \| \'waiting_on\'

  created_by                                                                                                 uuid            FK → profiles.id

  created_at                                                                                                 timestamptz     Auto

                                                                                                                             

  **custom_fields**                                                                                                          

  *Custom field definitions per list.*                                                                                       

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  list_id                                                                                                    uuid            FK → lists.id

  name                                                                                                       text            Field label

  type                                                                                                       text            \'text\' \| \'number\' \| \'date\' \| \'checkbox\' \| \'dropdown\' \| \'url\'

  options                                                                                                    jsonb           For dropdown: \[{label, color}\]

  position                                                                                                   integer         Display order

                                                                                                                             

  **task_custom_field_values**                                                                                               

  *Values for each custom field on each task.*                                                                               

  **Column**                                                                                                 **Type**        **Notes**

  task_id                                                                                                    uuid            FK → tasks.id

  field_id                                                                                                   uuid            FK → custom_fields.id

  value                                                                                                      jsonb           Stores any type value

  updated_at                                                                                                 timestamptz     Auto

                                                                                                                             

  **comments**                                                                                                               

  *Task-level comments with \@mention support.*                                                                              

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  task_id                                                                                                    uuid            FK → tasks.id

  author_id                                                                                                  uuid            FK → profiles.id

  content                                                                                                    text            Markdown text

  mentions                                                                                                   uuid\[\]        Array of mentioned profile IDs

  edited_at                                                                                                  timestamptz     Set if comment was edited --- nullable

  created_at                                                                                                 timestamptz     Auto

                                                                                                                             

  **attachments**                                                                                                            

  *Files attached to tasks --- stored in Supabase Storage.*                                                                  

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  task_id                                                                                                    uuid            FK → tasks.id

  uploaded_by                                                                                                uuid            FK → profiles.id

  file_name                                                                                                  text            Original filename

  file_size                                                                                                  integer         Bytes

  mime_type                                                                                                  text            e.g. image/png

  storage_path                                                                                               text            Supabase Storage bucket path

  created_at                                                                                                 timestamptz     Auto

                                                                                                                             

  **notifications**                                                                                                          

  *In-app notification log per user.*                                                                                        

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  user_id                                                                                                    uuid            FK → profiles.id --- recipient

  type                                                                                                       text            \'assigned\' \| \'mentioned\' \| \'due_soon\' \| \'status_changed\' \| \'comment\' \| \'dependency_resolved\'

  task_id                                                                                                    uuid            FK → tasks.id

  actor_id                                                                                                   uuid            FK → profiles.id --- who triggered it

  message                                                                                                    text            Human-readable notification text

  is_read                                                                                                    boolean         Default false

  created_at                                                                                                 timestamptz     Auto

                                                                                                                             

  **task_history**                                                                                                           

  *Immutable audit log of all changes to tasks.*                                                                             

  **Column**                                                                                                 **Type**        **Notes**

  id                                                                                                         uuid            PK

  task_id                                                                                                    uuid            FK → tasks.id

  changed_by                                                                                                 uuid            FK → profiles.id

  field                                                                                                      text            Which field changed

  old_value                                                                                                  jsonb           Previous value

  new_value                                                                                                  jsonb           New value

  changed_at                                                                                                 timestamptz     Auto

                                                                                                                             
  ---------------------------------------------------------------------------------------------------------- --------------- ---------------------------------------------------------------------------------------------------------------

**SQL for Existing Tables Reference (Do Not Re-create)**

\-- Already exists --- do not recreate CREATE TABLE public.otps ( email text PRIMARY KEY, code text NOT NULL, expires_at bigint NOT NULL ); CREATE TABLE public.logs ( id uuid PRIMARY KEY, email text NOT NULL, login_time timestamp with time zone NOT NULL, logout_time timestamp with time zone );

  -----------------------------------------------------------------------
  **06 Authentication --- Extending the Existing OTP System**

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  *The OTP flow, HMAC session, nodemailer SMTP, and proxy.ts middleware all stay exactly as built. The only change is adding role resolution on successful OTP verification.*

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**What Changes in the Auth Flow**

One step is added after successful OTP verification in the existing /api/auth/verify handler:

1.  OTP verified (existing --- unchanged)

2.  NEW: Query profiles table for this email --- SELECT role FROM profiles WHERE email = \$email

3.  NEW: If no profile row exists (first login after invite), INSERT a profiles row with the role assigned during invitation

4.  NEW: Include role in HMAC session payload: { email, role, iat }

5.  Issue session_token cookie (existing --- unchanged, now includes role)

**Domain Restriction Update**

The existing domain restriction (@takeoutmedia.xyz and \@tmlabs.xyz) remains. Stakeholders with external email domains must be invited using an internal alias or the domain list must be extended by the PM in environment config. Document this limitation clearly.

**Middleware Route Rules Update**

proxy.ts (middleware) must be updated to enforce role-based route protection in addition to the existing session check:

  ------------------------------ --------------------------- --------------------------- ---------------------------
  **Route Pattern**              **Staff**                   **PM**                      **Stakeholder**

  /mytasks                       ✅ Allow                    ✅ Allow                    ❌ Redirect /login

  /workspace/\*                  ❌ Redirect /mytasks        ✅ Allow                    ❌ Redirect /login

  /members                       ❌ Redirect /mytasks        ✅ Allow                    ❌ Redirect /login

  /calendar                      ✅ Allow                    ✅ Allow                    ❌ Redirect /login

  /reporting, /team, /projects   ❌ Redirect /mytasks        ✅ Allow                    ✅ Allow

  / (overview)                   ❌ Redirect /mytasks        ✅ Allow                    ✅ Allow

  /settings                      ✅ Allow                    ✅ Allow                    ✅ Allow

  /login                         Redirect if session valid   Redirect if session valid   Redirect if session valid
  ------------------------------ --------------------------- --------------------------- ---------------------------

  -----------------------------------------------------------------------
  **07 Role-Based Access Control --- Complete Matrix**

  -----------------------------------------------------------------------

  --------------------------------------- ------------ ------------ -----------------
  **Permission / Action**                 **Staff**    **PM**       **Stakeholder**

  View Executive Overview (/)             ❌           ✅           ✅

  View Reporting Center (/reporting)      ❌           ✅           ✅

  View Team Performance (/team)           ❌           ✅           ❌

  View Project Health (/projects)         ❌           ✅           ❌

  Export Excel reports                    ❌           ✅           ✅

  View My Tasks (/mytasks)                ✅           ✅           ❌

  Update status of own task               ✅           ✅           ❌

  Add comments to own task                ✅           ✅           ❌

  Upload attachment to own task           ✅           ✅           ❌

  View task detail (assigned tasks)       ✅           ✅           ❌

  View all tasks (any project)            ❌           ✅           ❌

  Create tasks                            ❌           ✅           ❌

  Edit all task fields                    ❌           ✅           ❌

  Delete tasks                            ❌           ✅           ❌

  Assign/unassign team members to tasks   ❌           ✅           ❌

  Create/edit Spaces, Folders, Lists      ❌           ✅           ❌

  Manage statuses per List                ❌           ✅           ❌

  Create custom fields                    ❌           ✅           ❌

  View Calendar (own tasks only)          ✅           ❌           ❌

  View Calendar (all tasks)               ❌           ✅           ❌

  View /members --- team member list      ❌           ✅           ❌

  Invite new team members                 ❌           ✅           ❌

  Change member roles                     ❌           ✅           ❌

  Deactivate members                      ❌           ✅           ❌

  Edit own profile + notification prefs   ✅           ✅           ✅
  --------------------------------------- ------------ ------------ -----------------

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  *Supabase RLS must enforce all of the above at the database level. Frontend role-gating is UX-only --- it is not security. An authenticated user must never be able to retrieve data they are not permitted to see, even by calling Supabase directly from the browser console.*

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**RLS Policy Summary**

-   tasks: staff SELECT only rows where profiles.id is in task_assignees for that task

-   tasks: product_manager SELECT/INSERT/UPDATE/DELETE all rows

-   tasks: stakeholder NO access

-   comments: staff SELECT/INSERT on tasks they are assigned to only

-   attachments: storage bucket policy mirrors task assignment RLS

-   spaces, folders, lists, statuses: staff SELECT only; PM full access

-   notifications: users SELECT/UPDATE own rows only

-   profiles: all authenticated users SELECT all (needed for \@mention, assignment dropdowns)

-   profiles: users UPDATE own row only; PM can UPDATE role and status fields on any row

  -----------------------------------------------------------------------
  **08 Feature: Workspace & Project Hierarchy**

  -----------------------------------------------------------------------

**Hierarchy**

  ----------------------------------------------------------------------------------------------------------------------------------------------------
  *Workspace → Space → Folder (optional) → List → Task → Subtask (3 levels). This mirrors the ClickUp structure precisely so migration is lossless.*

  ----------------------------------------------------------------------------------------------------------------------------------------------------

**Sidebar --- Updated Behaviour**

-   The existing left navigation sidebar is extended --- not replaced

-   A new \'WORKSPACE\' section appears in the sidebar below the existing reporting nav items

-   Staff: sidebar workspace section shows only Spaces/Lists containing their assigned tasks

-   PM: sidebar shows full workspace hierarchy with expand/collapse per Space and Folder

-   Each List shows open task count (grey) and overdue task count (red badge)

-   Drag-and-drop reorder of Spaces, Folders, and Lists (PM only)

**Spaces**

-   PM creates a Space with: name, color (hex picker), icon (emoji)

-   Space appears immediately in sidebar, ordered by position

-   Rename and delete available via right-click context menu or settings icon

-   Deleting a Space soft-archives all children --- confirmation modal required

**Folders**

-   Optional layer. PM can create a Folder inside any Space.

-   Folders collapsible in sidebar

-   Lists can exist inside a Folder or directly under a Space (folderless)

**Lists**

-   PM creates a List inside a Folder or directly under a Space

-   Each List has its own custom status set --- default on creation: To Do, In Progress, In Review, Blocked, Done

-   PM can add, rename, reorder, and delete statuses in List Settings

-   Deleting a status requires all tasks in that status to be moved first (enforced in UI)

-   Opening a List renders the List View (Section 12)

  -----------------------------------------------------------------------
  **09 Feature: Task Management**

  -----------------------------------------------------------------------

**Task Creation (PM only)**

-   Inline: press Enter at the bottom of a list view to create a task with just a name

-   Full form: \'+ New Task\' button opens a side panel with all fields

-   Required: name only. All other fields optional at creation.

**Task Fields**

  ---------------- -------------------------- --------------------------------------------------------------------------------------------------------------------------------
  **Field**        **Input Type**             **Behaviour**

  Name             Text                       Editable inline in list view and in detail panel

  Description      Rich text (markdown)       Bold, italic, bullets, code, links. Collapsed to 3 lines in detail panel with expand toggle.

  Status           Dropdown                   Options from the List\'s custom statuses. Color-coded badge. Setting a \'closed\' type status auto-sets date_closed timestamp.

  Priority         Dropdown                   Urgent (red) / High (orange) / Normal (blue) / Low (grey). Nullable.

  Assignees        Multi-select user picker   Shows avatars. Only active members shown. Triggers assignment notification on save.

  Start Date       Date picker                Optional. Used in Calendar view and Gantt-style display.

  Due Date         Date picker                Optional. Shown in red if past due and task not closed.

  Time Estimate    Duration input             e.g. 2h 30m. Stored as milliseconds.

  Tags             Multi-select               Workspace-level tags. PM can create inline.

  Custom Fields    Dynamic                    Rendered from the List\'s custom_fields definitions.

  Attachments      File upload                Multiple files. Max 25MB each. Stored in Supabase Storage.
  ---------------- -------------------------- --------------------------------------------------------------------------------------------------------------------------------

**Task Detail Panel**

-   Opens as a right-side slide-over panel --- same glassmorphism card style as existing dashboard

-   All fields editable inline --- no separate edit mode required

-   Bottom section: unified activity feed showing task_history changes and comments in chronological order

-   \'Open full page\' link for distraction-free full-screen task view

-   Quick actions bar: Change Status, Assign, Set Due Date, Set Priority

**Task Actions (PM only unless noted)**

-   Duplicate --- copies all fields, clears assignees and dates, appends \'(copy)\' to name

-   Move to List --- changes list_id; status resets to first status of destination list

-   Archive --- sets is_archived = true, task disappears from default views

-   Delete --- PM only, confirmation modal, cascades to subtasks, comments, attachments

-   Copy link --- copies deep-link URL to the task detail panel

-   Update status --- Staff can do this on their own assigned tasks

**Computed Task Flags --- Matching Existing ClickUpContext Logic**

The existing ClickUpContext.tsx computes overdue, blocked, and spillover flags. The new WorkspaceContext must compute them with identical logic so that once the data source switches to Supabase, the reporting dashboard continues to show the same numbers:

-   overdue: task.due_date \< now AND date_closed IS NULL

-   blocked: status.type = \'blocked\' OR task has an unresolved blocking dependency

-   spillover: task is overdue AND due_date was within the last 7 days (scheduled to finish last week)

-   Deduplication: tasks deduplicated by id --- same as existing uniqueTasksMap logic

  -----------------------------------------------------------------------
  **10 Feature: Subtasks & Dependencies**

  -----------------------------------------------------------------------

**Subtasks**

-   Any task can have subtasks. Subtasks can have subtasks up to 3 levels deep (v1).

-   Subtasks inherit the parent\'s list and space --- stored as tasks with parent_task_id set

-   Each subtask has its own independent: status, assignees, priority, due date

-   Parent task shows a progress indicator: \'X / Y subtasks complete\'

-   Subtasks are a collapsible section in the task detail panel

-   In list view, subtasks toggle visible/hidden under their parent row

-   Staff can see subtasks assigned to them in My Tasks --- same as regular tasks

-   Deleting a parent cascades to delete all subtasks (confirmation required)

**Dependencies**

-   Set from the task detail panel: search any task in the workspace

-   Two types: \'Blocking\' (this task blocks another) and \'Waiting on\' (this task waits for another)

-   Blocked tasks display the existing \'blocked\' badge in all views --- consistent with current dashboard

-   When a blocking task is closed: all waiting tasks receive an in-app notification

-   Circular dependency prevention: system checks on save and rejects cycles

**Rollup to Existing Dashboard**

-   The existing /projects Gantt chart renders start_date to due_date as horizontal bars

-   Subtask tree view on /projects already handles parent-child relationships

-   Once data migrates to Supabase, the /projects page Gantt chart must read from the tasks table using the same parent_task_id structure --- no Gantt UI changes needed

  -----------------------------------------------------------------------
  **11 Feature: Comments & Attachments**

  -----------------------------------------------------------------------

**Comments**

-   Assignees and PM can read and write comments on a task

-   Markdown formatting: bold, italic, inline code, bullets, links

-   \@mention: type @ to trigger user picker --- inserts mention, adds user_id to mentions array, triggers notification

-   Author can edit own comment (edited_at timestamp shown in activity feed)

-   PM can delete any comment; authors can delete their own

-   Comments and task_history changes shown in unified chronological activity feed in task detail panel

**Attachments**

-   Assignees and PM can attach files to tasks

-   Stored in a private Supabase Storage bucket --- not publicly accessible

-   Supabase Storage bucket policy mirrors task RLS: only assignees and PM can access files

-   Accepted types: images (jpg, png, gif, webp), documents (pdf, docx, xlsx), video (mp4)

-   Max 25MB per file for v1

-   Image files: thumbnail preview in task detail panel, click to open lightbox

-   Non-image files: file type icon, name, size, download button

-   Attachment count badge shown on task cards across all views

  -----------------------------------------------------------------------
  **12 Feature: Views --- List, Kanban, Calendar**

  -----------------------------------------------------------------------

**View Selector**

A view toggle at the top of every List page: List \| Board \| Calendar. Selection persists per List in localStorage.

**List View (Default)**

-   Tasks as rows. Default columns: Name, Assignee(s), Status, Priority, Due Date, Tags

-   PM can add Custom Field columns via a column visibility toggle

-   Group by: Status (default), Priority, Assignee, Due Date

-   Sort by: Due Date, Priority, Name, Created, Updated Date

-   Filter by: Status, Priority, Assignee, Tag, Due Date range, Custom Fields

-   Inline edits: click status badge → dropdown; click assignee → user picker; click due date → date picker

-   Overdue row style: due date in red, subtle red left border --- matching existing dashboard card style

-   Blocked row style: \'Blocked\' badge, subtle orange left border

-   Subtask toggle per parent row to expand/collapse inline

-   Drag-and-drop to reorder tasks within a group

**Kanban Board View**

-   Columns = the List\'s custom statuses in defined order

-   Task cards show: name, assignee avatars, priority color tag, due date, attachment count badge

-   Card style: use existing glassmorphism card component from shared/components/

-   Drag-and-drop between columns → updates status in Supabase via optimistic UI

-   Click card → opens task detail panel (same slide-over as list view)

-   \+ button at top of each column → creates task in that status

-   Column header shows task count. Columns can be collapsed to a narrow strip.

-   All filters from list view apply across board columns simultaneously

**Calendar View**

-   Monthly default, toggle to weekly. Accessed at /calendar and as a view within a List.

-   Tasks appear on their due_date as color-coded chips (color = priority)

-   Multi-day tasks (start_date → due_date) appear as spanning bars

-   \'Unscheduled\' sidebar: tasks with no due_date listed separately on the right

-   Drag chip to new date → updates due_date via optimistic UI

-   Click chip → opens task detail panel

-   Staff (/calendar): shows only their assigned tasks

-   PM (/calendar): shows all tasks across all Lists --- full team calendar for sprint planning

-   Filter by: Assignee, Space/Project, Priority, Status

  -----------------------------------------------------------------------
  **13 Feature: My Tasks --- Staff Home View**

  -----------------------------------------------------------------------

My Tasks is the default landing page for Staff after login. It replaces the Executive Overview as their home --- they are redirected here by middleware. PMs can also access it for a personal view.

**Layout --- Four Grouped Sections**

-   Overdue --- due_date in the past, date_closed IS NULL --- red section header

-   Due Today --- due_date = today, date_closed IS NULL --- amber section header

-   Due This Week --- due_date within Mon--Sun of current week (excluding today)

-   Upcoming --- all other open assigned tasks

**Task Row**

-   Name (truncated with tooltip at 60 chars)

-   Project breadcrumb: Space name \> List name

-   Status badge --- color-coded using the List\'s custom status color

-   Priority badge --- color-coded as per task field spec

-   Due date --- red if overdue

-   Click row → opens task detail slide-over panel

**What Staff Can Do in My Tasks**

-   Update task status (their own assigned tasks only)

-   Add comments

-   Upload attachments

-   View all task details including dependencies and history

-   Cannot: change assignees, due dates, priority --- those are PM-only fields

**Filter Bar**

-   Filter by: Space/Project (multi-select), Status, Priority, Due Date range

-   Filters local to My Tasks, do not affect any other view

-   Active filters shown as removable chip tags --- consistent with existing dashboard filter pattern

  -----------------------------------------------------------------------
  **14 Feature: Team Member Management**

  -----------------------------------------------------------------------

Accessible at /members --- PM only. Replaces the existing /team page for PM needs. The existing /team Reporting page (workload charts, member cards) stays as-is for reporting purposes.

**Member List**

-   Table: Full Name, Email, Role, Status (Active/Deactivated), Date Joined

-   Avatar (initials fallback if no photo uploaded)

-   Search by name or email

-   Filter by role

-   \'Pending Invites\' section below active members for unaccepted invitations

**Invite New Member**

-   PM enters email + selects role (staff or stakeholder)

-   PM cannot self-assign a second product_manager via invite --- new PMs are promoted from staff by editing their role

-   On submit: system creates a profile row (status = \'pending\'), sends invite email via Resend using existing SMTP or Resend config

-   Invite email contains: welcome message, their assigned role, and a magic link to set up their access

-   Since the existing auth uses OTP (no passwords), the \'setup\' step is simply their first OTP login --- the invite email explains this

-   Pending invites expire after 48 hours. PM can resend.

**Edit Member**

-   Change role (staff ↔ stakeholder; PM can promote to product_manager)

-   Deactivate --- sets status = \'deactivated\', prevents login, removes from assignment dropdowns

-   Deactivated member\'s tasks are NOT deleted --- historical data preserved

-   Reactivate --- restores login access

-   PM cannot deactivate themselves

**userMapping.ts --- Existing Utility**

The existing shared/utils/userMapping.ts handles mapping of deactivated ClickUp accounts to active ones. After migration this file should be updated to map any legacy ClickUp user IDs found in migrated task data to the correct new profile IDs in Supabase. It does not need to be rewritten --- only updated with the new ID mappings post-migration.

  -----------------------------------------------------------------------
  **15 Feature: Notifications via Resend**

  -----------------------------------------------------------------------

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  *The existing codebase uses nodemailer (SMTP) for OTP delivery. Resend should be used for all new PM notification emails --- it provides better deliverability and template management. Both can coexist: nodemailer for OTP, Resend for PM notifications.*

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Notification Events**

  ------------------------------ ------------ ---------------- --------------------------------
  **Event**                      **In-App**   **Email**        **Who Receives**

  Task assigned to user          ✅           ✅ Resend        Assigned user

  Task unassigned                ✅           ❌               Removed user

  \@mention in comment           ✅           ✅ Resend        Mentioned user(s)

  Task due tomorrow              ✅           ✅ Resend        All assignees

  Blocking dependency resolved   ✅           ✅ Resend        All assignees of waiting task

  Task status changed            ✅           ❌ in-app only   All assignees (not actor)

  New comment on task            ✅           ❌ in-app only   All assignees (not commenter)

  Workspace invite               N/A          ✅ Resend        Invited user

  Task overdue (daily digest)    ✅           ✅ Resend        All assignees of overdue tasks
  ------------------------------ ------------ ---------------- --------------------------------

**In-App Notification Centre**

-   Bell icon in the top navigation bar (existing nav component extended)

-   Unread count badge on bell --- updated via Supabase Realtime subscription on notifications table

-   Dropdown panel: last 20 notifications newest-first, type icon, message, task name, time ago

-   Click notification → navigate to task detail panel, mark as read

-   \'Mark all as read\' button

**Trigger Implementation**

-   Notifications triggered via Next.js API route handlers (not Edge Functions) --- consistent with existing API route pattern

-   app/api/notifications/route.ts --- called internally after task mutations

-   Resend API key added to .env.local (see Section 18)

-   Email templates styled to match TM Labs brand: dark navy, pink #FF3396 --- matching existing excelReport.ts branding

**User Preferences**

-   Stored in profiles.notification_preferences as JSONB

-   Editable in /settings --- toggle on/off per email notification type

-   In-app notifications cannot be disabled

  -----------------------------------------------------------------------
  **16 Reporting Dashboard --- Migration from ClickUp to Supabase**

  -----------------------------------------------------------------------

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  *CRITICAL: The existing reporting dashboard (/, /reporting, /team, /projects) must show identical data after this migration. The UI, charts, and metrics do not change. Only the data source changes --- from ClickUp API to Supabase.*

  -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**Current Data Flow (Existing)**

-   Frontend → shared/api/clickup.ts → /api/clickup proxy → ClickUp API v2

-   Response normalised in ClickUpContext.tsx: deduplication, overdue/blocked/spillover flags, auto-sync every 60s

**New Data Flow (After Migration)**

-   Frontend → shared/api/supabase.ts → Supabase directly (with RLS-enforced access)

-   ClickUpContext.tsx is replaced by WorkspaceContext.tsx --- same shape, same computed flags, same output

-   Auto-sync replaced by Supabase Realtime subscriptions on the tasks table

-   The /api/clickup proxy can be decommissioned after migration is verified

**Query Mapping --- ClickUp API to Supabase**

  ------------------------------------------------------- -------------------------------------------------------------------------------------
  **Was: ClickUp API Call**                               **Now: Supabase Query**

  GET /team/{id}/space                                    SELECT \* FROM spaces

  GET /space/{id}/folder                                  SELECT \* FROM folders WHERE space_id = \$id

  GET /folder/{id}/list                                   SELECT \* FROM lists WHERE folder_id = \$id

  GET /space/{id}/list (folderless)                       SELECT \* FROM lists WHERE space_id = \$id AND folder_id IS NULL

  GET /list/{id}/task?include_closed=true&subtasks=true   SELECT tasks.\*, statuses.\*, profiles.\* FROM tasks JOIN \... WHERE list_id = \$id

  Pagination: page=0,1,2 until \<100 tasks                Supabase .range(0,99), .range(100,199) etc until empty

  GET /task/{id}/dependency                               SELECT \* FROM task_dependencies WHERE task_id = \$id

  GET /team/{id}/member                                   SELECT \* FROM profiles WHERE status = \'active\'

  Deduplication: uniqueTasksMap.set(task.id, task)        Not needed --- Supabase returns unique rows by PK
  ------------------------------------------------------- -------------------------------------------------------------------------------------

**Excel Export --- excelReport.ts**

The existing excelReport.ts uses exceljs and canvas to generate branded Excel reports with a dark navy header (#10024F), pink divider (#FF3396), day-by-day activity tracker (Mon--Fri checkmarks), and a canvas-drawn clustered bar chart embedded as PNG. This file does not change. It consumes the same task data shape --- once WorkspaceContext provides data in the same shape as ClickUpContext did, the Excel export works without modification.

**Computed Fields Parity**

-   overdue: due_date \< now AND date_closed IS NULL --- identical to existing ClickUpContext logic

-   blocked: status.type = \'blocked\' OR unresolved blocking dependency --- identical logic

-   spillover: overdue AND due_date \>= (now - 7 days) --- identical logic

-   Project health scoring: On Track \< 10% late+spillover \| At Risk 10--30% \| Delayed \> 30% --- identical to /projects existing logic

  -----------------------------------------------------------------------
  **17 ClickUp Data Migration Plan**

  -----------------------------------------------------------------------

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  *Migration must result in zero data loss. The clickup_id column on tasks, spaces, folders, and lists preserves the original ClickUp ID for every record, enabling cross-reference and debugging during and after migration.*

  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**What Gets Migrated**

  ---------------------------------- ---------------------------- -------------------------------------------------------------------------
  **ClickUp Entity**                 **Supabase Table**           **Notes**

  Spaces                             spaces                       Name, color preserved. clickup_id stored.

  Folders                            folders                      Hierarchy preserved.

  Lists (in folders)                 lists                        folder_id set.

  Folderless Lists                   lists                        folder_id = NULL.

  Statuses per List                  statuses                     ClickUp status type mapped to internal type enum.

  Tasks (all, include_closed=true)   tasks                        clickup_id stored. status_id resolved.

  Subtasks                           tasks                        parent_task_id set to parent\'s new Supabase ID.

  Task assignees                     task_assignees               ClickUp user matched to profiles.id by email.

  Task dependencies                  task_dependencies            Type mapping: blocking → blocking, waiting_on → waiting_on.

  Tags                               task_tags + task_tag_links   Workspace tags recreated.

  Custom fields                      custom_fields + values       ClickUp field types mapped to internal enum.

  Comments                           comments                     Author matched by email. Mentions array reconstructed.

  Team members                       profiles                     Created as profile rows. Invite sent via Resend for active members.

  Deactivated users                  profiles                     Created with status = deactivated. userMapping.ts updated with new IDs.
  ---------------------------------- ---------------------------- -------------------------------------------------------------------------

**Migration Steps**

6.  Create all new Supabase tables (Section 05) in the existing Supabase project

7.  Create profile rows for all team members. Send invites via Resend. Do not wait for acceptance before migrating tasks.

8.  Run migration via POST /api/migrate --- authenticated endpoint, PM role only

9.  Migration script fetches from ClickUp API using the existing /api/clickup proxy pattern and shared/api/clickup.ts

10. Insert in order: spaces → folders → lists → statuses → tasks (top-level) → tasks (subtasks) → task_assignees → task_dependencies → tags → custom_fields → custom_field_values → comments

11. Update userMapping.ts with ClickUp-ID-to-Supabase-profile-ID mappings for all deactivated users

12. Run integrity checks: COUNT(\*) from Supabase tasks vs ClickUp total task count. Verify all assignee FKs resolve. Verify all dependency FKs resolve.

13. Switch WorkspaceContext data source to Supabase. Verify all four reporting pages show same metrics.

14. Team uses new PM platform for 1 week alongside ClickUp (both active)

15. Cancel ClickUp subscription after 1-week parallel run with zero issues

**Rollback Plan**

-   ClickUp remains active until step 10 --- migration is purely additive

-   If critical issues found: revert ClickUpContext to read from ClickUp API (one line change), fix issues, re-run migration

-   clickup_id on every record enables lookup of original ClickUp data at any point

  -----------------------------------------------------------------------
  **18 Environment Variables --- Updated Full List**

  -----------------------------------------------------------------------

  ----------------------------------------------------------------------------------------------------------------------------
  *This replaces the existing .env.local documentation. All existing variables are preserved. New variables are marked NEW.*

  ----------------------------------------------------------------------------------------------------------------------------

\# ── EXISTING --- do not change ───────────────────────────────────── \# JWT Secret for HMAC session signing JWT_SECRET=your-secure-random-key-32-chars-min \# ClickUp API (keep until migration complete, then optional) CLICKUP_API_TOKEN=pk\_\... \# SMTP for OTP delivery (existing nodemailer config) SMTP_HOST=smtp.yourprovider.com SMTP_PORT=587 SMTP_USER=your-smtp-username SMTP_PASS=your-smtp-password SMTP_FROM=\"TM Labs Dashboard \<no-reply@tmlabs.xyz\>\" \# Supabase (existing --- used for otps and logs tables) SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key \# ── NEW --- add these ─────────────────────────────────────────────── \# Supabase public anon key (for client-side Supabase queries) NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key \# Resend API key (for PM notification emails) RESEND_API_KEY=re\_\... RESEND_FROM=\"TM Labs \<no-reply@tmlabs.xyz\>\" \# Allowed email domains for OTP login (comma-separated, existing logic) ALLOWED_DOMAINS=takeoutmedia.xyz,tmlabs.xyz

  -----------------------------------------------------------------------
  **19 Non-Functional Requirements**

  -----------------------------------------------------------------------

  ---------------- -------------------------------------------- ---------------------------------------------------------------
  **Category**     **Requirement**                              **Target**

  Performance      My Tasks initial load                        \< 2s

  Performance      List view with 200 tasks                     \< 1.5s

  Performance      Kanban board render                          \< 2s

  Performance      Task detail panel open                       \< 500ms

  Performance      Reporting dashboard (post-migration)         Same or faster than current ClickUp-sourced load time

  Realtime         Status change visible across open sessions   \< 3s via Supabase Realtime

  Realtime         New notification in bell                     \< 3s

  Security         RLS on all new tables                        100% --- no exceptions

  Security         Service role key never client-side           Used only in API routes, never in NEXT_PUBLIC vars

  Security         Session cookie                               Existing HTTP-only, secure, HMAC-signed --- unchanged

  Compatibility    Existing dashboard pages                     Zero regression --- same metrics, same UI, same charts

  Compatibility    Design system                                All new UI uses existing CSS token variables only

  Compatibility    Excel export                                 excelReport.ts requires zero changes after data source switch

  Browser          Minimum support                              Chrome 110+, Edge 110+, Firefox 110+

  Scaling          Team size                                    Up to 50 members without architecture changes
  ---------------- -------------------------------------------- ---------------------------------------------------------------

  -----------------------------------------------------------------------
  **20 Acceptance Criteria**

  -----------------------------------------------------------------------

**Existing Dashboard --- Zero Regression**

-   All four reporting pages (/, /reporting, /team, /projects) load without errors after data source switch

-   KPI card values on / match ClickUp values for the same workspace data

-   Excel export from /reporting downloads a correctly formatted file with embedded bar chart

-   Gantt chart on /projects renders correctly for migrated tasks with start_date and due_date

**Authentication & Roles**

-   Staff user logs in via OTP → redirected to /mytasks, cannot access /, /reporting, /workspace, /members

-   PM logs in → lands on /, full nav visible, all features accessible

-   Stakeholder logs in → lands on /reporting, only reporting nav visible

-   Unauthenticated request to any protected route → redirected to /login

-   Supabase query from Staff session returns only their assigned tasks (RLS verified)

**Task Management**

-   PM creates task, assigns to Staff → Staff sees it in /mytasks within 3s (Realtime)

-   Staff updates status → PM sees change in List/Board view within 3s

-   Subtask progress percentage on parent task updates correctly

-   Blocking dependency set → waiting task shows Blocked badge → blocker closed → Blocked badge removed → notification sent

-   Drag task to new Kanban column → status updated in DB → reflected on reload

-   Drag task to new Calendar date → due_date updated in DB

**Notifications**

-   Task assignment email arrives via Resend within 60s

-   \@mention email arrives via Resend within 60s

-   Due-tomorrow reminder email arrives for affected users

-   In-app bell unread count correct and updates without page refresh

**Migration**

-   Task count in Supabase = ClickUp task count (include_closed=true, subtasks=true, all pages)

-   All assignee relationships preserved

-   All dependency relationships preserved

-   Reporting dashboard shows same metrics from Supabase as it showed from ClickUp

  -----------------------------------------------------------------------
  **21 Implementation Phases**

  -----------------------------------------------------------------------

  --------------------- -------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------------------------------------------------------------------------------------
  **Phase**             **Timeline**   **Deliverables**                                                                                                                                                                                      **Exit Criteria**

  0 Foundation          Week 1         New Supabase tables created. RLS policies applied. Realtime enabled. Session extended with role. Middleware updated with role-based routing. profiles table created. WorkspaceContext stub created.   Login works with role. Middleware routes correctly for all three roles. Supabase tables visible in dashboard.

  1 Migration           Week 1--2      Migration script (POST /api/migrate). Full ClickUp data imported. userMapping.ts updated. Integrity checks passed. WorkspaceContext reads from Supabase. Reporting dashboard re-pointed.              Zero data loss confirmed. Reporting dashboard shows same numbers from Supabase as from ClickUp.

  2 Workspace & Tasks   Week 2--3      New routes: /workspace, /tasks/\[id\]. Sidebar extended. Space/Folder/List management. Task CRUD. Task detail slide-over panel. Inline status/assignment edits.                                       PM can create, assign, and manage tasks end-to-end.

  3 Views               Week 3--4      List View (with column filters, inline edits, subtask toggle). Kanban Board (drag-and-drop). Calendar View (monthly+weekly, drag reschedule, unscheduled sidebar).                                    All three views functional for PM. Calendar shows staff-only view for Staff role.

  4 My Tasks            Week 4         Staff home view /mytasks. Four grouped sections. Filter bar. Task detail panel with staff-permitted actions only.                                                                                     Staff user sees only their tasks in correct groups. Cannot access PM features.

  5 Team Members        Week 5         /members page. Invite flow via Resend. Role management. Deactivate/reactivate. Pending invites section.                                                                                               Full invite → first login → role-gated access flow works end-to-end.

  6 Notifications       Week 5--6      All Resend email templates (brand: dark navy + pink). In-app notification centre. All 8 trigger events. User notification preferences in /settings.                                                   All notification types tested. Email arrives within 60s. In-app bell updates in real-time.

  7 UAT & Launch        Week 6         Full UAT with PM and Staff. Regression test of all reporting pages. Bug fixes. 1-week parallel run with ClickUp.                                                                                      All acceptance criteria pass. Team confirms readiness. ClickUp subscription cancelled.
  --------------------- -------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- ---------------------------------------------------------------------------------------------------------------

  -----------------------------------------------------------------------
  **22 Risks & Mitigations**

  -----------------------------------------------------------------------

  ------------------------------------------------------------------- ----------- -------------------------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------
  **Risk**                                                            **Level**   **Impact**                                         **Mitigation**

  Reporting dashboard shows different numbers after Supabase switch   **High**    Team loses trust in dashboard accuracy             Run both ClickUp and Supabase contexts in parallel during migration week. Compare outputs side by side before decommissioning ClickUp context.

  proxy.ts not correctly symlinked to middleware.ts in production     **High**    All routes unprotected --- anyone can access       Document the symlink requirement clearly (already in existing docs). Add a startup check that logs a warning if middleware.ts is not exporting proxy.ts.

  Supabase RLS misconfiguration lets Staff see other users tasks      **High**    Privacy and trust breach                           Write automated tests that authenticate as a Staff user and assert Supabase query returns only their tasks.

  nodemailer OTP + Resend PM emails --- domain config conflict        **Med**     PM notification emails go to spam or fail          Configure Resend on the same domain. Test all email types before go-live.

  ClickUp custom field types don\'t map to internal enum              **Med**     Custom field data lost silently during migration   Log unmapped field types during migration run. Manually review log before confirming migration success.

  Staff domain restriction --- stakeholders have external emails      **Med**     Stakeholders cannot log in                         Extend ALLOWED_DOMAINS env var or set up a tmlabs.xyz alias for external stakeholders before inviting them.

  Existing /design-system page breaks if new CSS variables added      **Low**     Design token showcase shows incomplete tokens      Server-side parser in design-tokens.ts auto-discovers new variables --- this is a feature, not a risk. No action needed.
  ------------------------------------------------------------------- ----------- -------------------------------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------

+--------------------------------------------------------------------------------------------------------+
| **End of Document**                                                                                    |
|                                                                                                        |
| *TM Labs PM Platform PRD v2.0 --- Built from live codebase documentation --- Prepared for Antigravity* |
+--------------------------------------------------------------------------------------------------------+
