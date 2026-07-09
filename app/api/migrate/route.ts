/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { verifySession } from '@/shared/utils/session';
import { supabaseAdmin } from '@/shared/utils/supabaseAdmin';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const CLICKUP_BASE_URL = 'https://api.clickup.com/api/v2';

// Helper for chunked/batched async operations
async function processInBatches<T, R>(items: T[], batchSize: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate & Authorize (PM role only)
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => c.trim().split('='))
    );
    const sessionToken = cookies['session_token'];

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized. Session missing.' }, { status: 401 });
    }

    const session = await verifySession(sessionToken);
    if (!session || session.role !== 'product_manager') {
      return NextResponse.json({ error: 'Forbidden. PM access required.' }, { status: 403 });
    }

    const { clickupToken: bodyToken } = await request.json().catch(() => ({}));
    const clickupToken = bodyToken || process.env.CLICKUP_API_TOKEN;

    if (!clickupToken) {
      return NextResponse.json({ error: 'ClickUp API Token not found.' }, { status: 400 });
    }

    // ClickUp request helper
    const clickupFetch = async (endpoint: string, retries = 3): Promise<any> => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(`${CLICKUP_BASE_URL}${endpoint}`, {
            headers: {
              'Authorization': clickupToken,
              'Content-Type': 'application/json'
            }
          });
          if (!res.ok) {
            const errText = await res.text();
            const err: any = new Error(`ClickUp Error ${res.status} on ${endpoint}: ${errText}`);
            err.status = res.status;
            throw err;
          }
          return await res.json();
        } catch (err: any) {
          if (err.status && err.status >= 400 && err.status < 500) {
            throw err;
          }
          if (i === retries - 1) throw err;
          log(`ClickUp fetch failed for ${endpoint}. Retrying (${i + 1}/${retries})... Error: ${err.message}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    };

    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(msg);
      logs.push(msg);
    };

    log('Starting ClickUp → Supabase Data Migration...');

    log('Clearing existing database tables...');
    await supabaseAdmin.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('task_dependencies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('task_custom_field_values').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('custom_fields').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('task_tag_links').delete().neq('task_id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('task_assignees').delete().neq('task_id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('statuses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('lists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('folders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('spaces').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('profiles').delete().eq('status', 'deactivated');
    log('Tables cleared.');

    // ───────────────────────────────────────────────────────────────────
    // STEP 1: Fetch ClickUp Workspace & Members
    // ───────────────────────────────────────────────────────────────────
    const teamsData = await clickupFetch('/team');
    if (!teamsData.teams || teamsData.teams.length === 0) {
      throw new Error('No ClickUp Workspace found.');
    }
    const clickupTeam = teamsData.teams[0];
    const clickupTeamId = clickupTeam.id;
    log(`Found ClickUp Workspace: ${clickupTeam.name} (id: ${clickupTeamId})`);

    const clickupMembers = clickupTeam.members || [];
    log(`Found ${clickupMembers.length} workspace members in ClickUp.`);

    // ClickUp User ID -> Supabase Profile ID mapping
    const userMap: Record<string, string> = {};

    const jwtSecret = process.env.JWT_SECRET || 'tm-labs-task-tracker-default-jwt-secret-key-32-chars-long';

    // Migrate members to profiles
    for (const member of clickupMembers) {
      const u = member.user;
      if (!u || !u.email) continue;

      const email = u.email.toLowerCase().trim();
      const password = crypto.createHmac('sha256', jwtSecret).update(email).digest('hex');

      log(`Migrating member: ${u.username} (${email})...`);

      // 1. Check if profile already exists to preserve UUID
      let authUserUuid = crypto.randomUUID();
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        authUserUuid = existingProfile.id;
      }

      // Determine role: owner is product_manager, others are staff (can be promoted later)
      const role = (u.role === 1 || u.role_key === 'owner' || email === 'info@tmlabs.xyz' || email === 'operations@tmlabs.xyz') 
        ? 'product_manager' 
        : 'staff';

      // Upsert profile
      const { error: profileErr } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authUserUuid,
          email,
          full_name: u.username,
          role,
          status: 'active',
        }, { onConflict: 'email' });

      if (profileErr) {
        log(`Failed to upsert profile for ${email}: ${profileErr.message}`);
      } else {
        userMap[String(u.id)] = authUserUuid;
      }
    }

    // ───────────────────────────────────────────────────────────────────
    // STEP 2: Fetch Spaces, Folders, and Lists (Hierarchy)
    // ───────────────────────────────────────────────────────────────────
    const spacesData = await clickupFetch(`/team/${clickupTeamId}/space`);
    const clickupSpaces = spacesData.spaces || [];
    log(`Fetched ${clickupSpaces.length} Spaces from ClickUp.`);

    const spaceMap: Record<string, string> = {};
    const folderMap: Record<string, string> = {};
    const listMap: Record<string, string> = {};
    const statusMap: Record<string, string> = {}; // key: "list_id:status_name" -> status_uuid

    for (const space of clickupSpaces) {
      log(`Migrating Space: ${space.name}...`);
      const { data: spaceData, error: spaceErr } = await supabaseAdmin
        .from('spaces')
        .insert({
          name: space.name,
          color: space.color || '#6633FF',
          icon: '📁',
          clickup_id: space.id,
        })
        .select()
        .single();

      if (spaceErr) {
        log(`Error migrating Space ${space.name}: ${spaceErr.message}`);
        continue;
      }
      spaceMap[space.id] = spaceData.id;

      // Fetch Folders for this space
      const foldersData = await clickupFetch(`/space/${space.id}/folder`);
      const folders = foldersData.folders || [];
      for (const folder of folders) {
        log(`Migrating Folder: ${folder.name} inside Space: ${space.name}...`);
        const { data: folderData, error: folderErr } = await supabaseAdmin
          .from('folders')
          .insert({
            space_id: spaceMap[space.id],
            name: folder.name,
            color: folder.color || null,
            clickup_id: folder.id,
          })
          .select()
          .single();

        if (folderErr) {
          log(`Error migrating Folder ${folder.name}: ${folderErr.message}`);
          continue;
        }
        folderMap[folder.id] = folderData.id;

        // Migrate lists in this folder
        const lists = folder.lists || [];
        for (const list of lists) {
          log(`Migrating List: ${list.name} in Folder: ${folder.name}...`);
          const { data: listData, error: listErr } = await supabaseAdmin
            .from('lists')
            .insert({
              space_id: spaceMap[space.id],
              folder_id: folderMap[folder.id],
              name: list.name,
              color: list.color || null,
              clickup_id: list.id,
            })
            .select()
            .single();

          if (listErr) {
            log(`Error migrating List ${list.name}: ${listErr.message}`);
            continue;
          }
          listMap[list.id] = listData.id;

          // Migrate List custom statuses
          const listStatuses = list.statuses || [];
          for (let idx = 0; idx < listStatuses.length; idx++) {
            const st = listStatuses[idx];
            // Map type
            let stType = 'in_progress';
            if (st.type === 'open') stType = 'open';
            else if (st.type === 'closed' || st.type === 'done' || st.status === 'complete') stType = 'closed';
            else if (st.status.toLowerCase().includes('review')) stType = 'review';
            else if (st.status.toLowerCase().includes('blocked')) stType = 'blocked';

            const { data: statusData, error: statusErr } = await supabaseAdmin
              .from('statuses')
              .insert({
                list_id: listMap[list.id],
                name: st.status,
                color: st.color || '#cccccc',
                type: stType,
                position: idx,
              })
              .select()
              .single();

            if (statusErr) {
              log(`Error migrating status ${st.status}: ${statusErr.message}`);
            } else {
              statusMap[`${list.id}:${st.status}`] = statusData.id;
            }
          }
        }
      }

      // Fetch folderless lists for this space
      const folderlessListData = await clickupFetch(`/space/${space.id}/list`);
      const folderlessLists = folderlessListData.lists || [];
      for (const list of folderlessLists) {
        log(`Migrating Folderless List: ${list.name} inside Space: ${space.name}...`);
        const { data: listData, error: listErr } = await supabaseAdmin
          .from('lists')
          .insert({
            space_id: spaceMap[space.id],
            folder_id: null,
            name: list.name,
            color: list.color || null,
            clickup_id: list.id,
          })
          .select()
          .single();

        if (listErr) {
          log(`Error migrating Folderless List ${list.name}: ${listErr.message}`);
          continue;
        }
        listMap[list.id] = listData.id;

        // Migrate custom statuses
        const listStatuses = list.statuses || [];
        for (let idx = 0; idx < listStatuses.length; idx++) {
          const st = listStatuses[idx];
          let stType = 'in_progress';
          if (st.type === 'open') stType = 'open';
          else if (st.type === 'closed' || st.type === 'done' || st.status === 'complete') stType = 'closed';
          else if (st.status.toLowerCase().includes('review')) stType = 'review';
          else if (st.status.toLowerCase().includes('blocked')) stType = 'blocked';

          const { data: statusData, error: statusErr } = await supabaseAdmin
            .from('statuses')
            .insert({
              list_id: listMap[list.id],
              name: st.status,
              color: st.color || '#cccccc',
              type: stType,
              position: idx,
            })
            .select()
            .single();

          if (statusErr) {
            log(`Error migrating status ${st.status}: ${statusErr.message}`);
          } else {
            statusMap[`${list.id}:${st.status}`] = statusData.id;
          }
        }
      }
    }

    // ───────────────────────────────────────────────────────────────────
    // STEP 3: Fetch all Tasks & Subtasks
    // ───────────────────────────────────────────────────────────────────
    log('Fetching all ClickUp Tasks...');
    let page = 0;
    const clickupTasks: any[] = [];
    while (true) {
      const data = await clickupFetch(`/team/${clickupTeamId}/task?page=${page}&subtasks=true&include_closed=true`);
      if (!data.tasks || data.tasks.length === 0) break;
      clickupTasks.push(...data.tasks);
      log(`Fetched page ${page} of tasks. Total so far: ${clickupTasks.length}`);
      if (data.tasks.length < 100) break;
      page++;
      if (page > 30) break; // safety guard
    }

    log(`Total Tasks fetched: ${clickupTasks.length}`);

    // Resolve Deactivated Users (Historical Assignees)
    for (const task of clickupTasks) {
      const assignees = task.assignees || [];
      for (const asn of assignees) {
        if (!asn.email) continue;
        const asnEmail = asn.email.toLowerCase().trim();
        const asnIdStr = String(asn.id);

        if (!userMap[asnIdStr]) {
          log(`Found legacy assignee not in team list: ${asn.username} (${asnEmail}). Provisioning as deactivated...`);
          let deactivatedUserUuid = crypto.randomUUID();
          
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', asnEmail)
            .maybeSingle();

          if (existingProfile) {
            deactivatedUserUuid = existingProfile.id;
          }

          // Insert deactivated profile
          const { error: profileErr } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: deactivatedUserUuid,
              email: asnEmail,
              full_name: asn.username,
              role: 'staff',
              status: 'deactivated',
            }, { onConflict: 'email' });

          if (profileErr) {
            log(`Failed to create deactivated profile for ${asnEmail}: ${profileErr.message}`);
          } else {
            userMap[asnIdStr] = deactivatedUserUuid;
          }
        }
      }
    }

    // Task clickup_id to Supabase Task UUID mapping
    const taskMap: Record<string, string> = {};

    // Group tasks into top-level tasks and subtasks
    const topLevelTasks = clickupTasks.filter(t => !t.parent);
    const subTasks = clickupTasks.filter(t => t.parent);

    const getOrMigrateList = async (listId: string): Promise<string | null> => {
      if (listMap[listId]) return listMap[listId];
      
      log(`Dynamically migrating missing List: ${listId}...`);
      try {
        const list = await clickupFetch(`/list/${listId}`);
        
        let spaceUuid = null;
        if (list.space) {
          if (!spaceMap[list.space.id]) {
            log(`Dynamically migrating missing Space: ${list.space.id}...`);
            const space = await clickupFetch(`/space/${list.space.id}`);
            const { data: spaceData, error: spaceErr } = await supabaseAdmin
              .from('spaces')
              .insert({
                name: space.name,
                color: space.color || '#6633FF',
                icon: '📁',
                clickup_id: space.id,
              })
              .select()
              .single();
            if (spaceErr) throw spaceErr;
            spaceMap[space.id] = spaceData.id;
          }
          spaceUuid = spaceMap[list.space.id];
        }
        
        let folderUuid = null;
        if (list.folder && !list.folder.hidden) {
          if (!folderMap[list.folder.id]) {
            log(`Dynamically migrating missing Folder: ${list.folder.id}...`);
            const folder = await clickupFetch(`/folder/${list.folder.id}`);
            const { data: folderData, error: folderErr } = await supabaseAdmin
              .from('folders')
              .insert({
                space_id: spaceUuid,
                name: folder.name,
                color: folder.color || null,
                clickup_id: folder.id,
              })
              .select()
              .single();
            if (folderErr) throw folderErr;
            folderMap[folder.id] = folderData.id;
          }
          folderUuid = folderMap[list.folder.id];
        }
        
        const { data: listData, error: listErr } = await supabaseAdmin
          .from('lists')
          .insert({
            space_id: spaceUuid,
            folder_id: folderUuid,
            name: list.name,
            color: list.color || null,
            clickup_id: list.id,
          })
          .select()
          .single();
          
        if (listErr) throw listErr;
        listMap[list.id] = listData.id;
        
        const listStatuses = list.statuses || [];
        for (let idx = 0; idx < listStatuses.length; idx++) {
          const st = listStatuses[idx];
          let stType = 'in_progress';
          if (st.type === 'open') stType = 'open';
          else if (st.type === 'closed' || st.type === 'done' || st.status === 'complete') stType = 'closed';
          else if (st.status.toLowerCase().includes('review')) stType = 'review';
          else if (st.status.toLowerCase().includes('blocked')) stType = 'blocked';

          const { data: statusData, error: statusErr } = await supabaseAdmin
            .from('statuses')
            .insert({
              list_id: listData.id,
              name: st.status,
              color: st.color || '#cccccc',
              type: stType,
              position: idx,
            })
            .select()
            .single();

          if (!statusErr && statusData) {
            statusMap[`${list.id}:${st.status}`] = statusData.id;
          }
        }
        
        return listData.id;
      } catch (err: any) {
        log(`Failed to dynamically migrate list ${listId}: ${err.message}`);
        return null;
      }
    };

    const migrateTaskRecord = async (task: any) => {
      if (!task.list?.id) return null;
      const listUuid = await getOrMigrateList(task.list.id);
      if (!listUuid) {
        log(`Skip task ${task.name} because its list ${task.list?.id} was not migrated.`);
        return null;
      }

      // Resolve status_id
      let resolvedStatusId = statusMap[`${task.list?.id}:${task.status?.status}`];
      if (!resolvedStatusId) {
        // Find default status for this list
        const defaultStatusRes = await supabaseAdmin
          .from('statuses')
          .select('id')
          .eq('list_id', listUuid)
          .order('position', { ascending: true })
          .limit(1);
        resolvedStatusId = defaultStatusRes.data?.[0]?.id || null;
      }

      if (!resolvedStatusId) {
        log(`Skip task ${task.name} because no status could be mapped.`);
        return null;
      }

      const creatorUuid = userMap[String(task.creator?.id)] || null;

      // Insert Task
      const startDateTime = task.start_date ? new Date(parseInt(task.start_date)) : null;
      const dueDateTime = task.due_date ? new Date(parseInt(task.due_date)) : null;
      const closedDateTime = task.date_closed ? new Date(parseInt(task.date_closed)) : null;

      const { data: taskData, error: taskErr } = await supabaseAdmin
        .from('tasks')
        .insert({
          list_id: listUuid,
          parent_task_id: task.parent ? taskMap[task.parent] : null,
          name: task.name,
          description: task.description || task.text_content || '',
          status_id: resolvedStatusId,
          priority: task.priority?.priority || null,
          start_date: startDateTime ? startDateTime.toISOString().split('T')[0] : null,
          due_date: dueDateTime ? dueDateTime.toISOString().split('T')[0] : null,
          date_closed: closedDateTime ? closedDateTime.toISOString() : null,
          time_estimate: task.time_estimate || null,
          time_spent: task.time_spent || 0,
          position: task.orderindex ? parseInt(task.orderindex) : 0,
          created_by: creatorUuid,
          clickup_id: task.id,
        })
        .select()
        .single();

      if (taskErr) {
        log(`Error creating task ${task.name}: ${taskErr.message}`);
        return null;
      }

      taskMap[task.id] = taskData.id;

      // Insert Assignees
      const assignees = task.assignees || [];
      for (const asn of assignees) {
        const userUuid = userMap[String(asn.id)];
        if (userUuid) {
          await supabaseAdmin
            .from('task_assignees')
            .upsert({
              task_id: taskData.id,
              user_id: userUuid,
              assigned_by: creatorUuid
            }, { onConflict: 'task_id,user_id' });
        }
      }

      // Insert Tags
      const tags = task.tags || [];
      for (const tg of tags) {
        // Upsert tag
        const { data: tagData, error: tagErr } = await supabaseAdmin
          .from('task_tags')
          .upsert({
            name: tg.name,
            color: tg.color || '#FF3396',
          }, { onConflict: 'name' })
          .select()
          .single();

        if (!tagErr && tagData) {
          await supabaseAdmin
            .from('task_tag_links')
            .upsert({
              task_id: taskData.id,
              tag_id: tagData.id,
            }, { onConflict: 'task_id,tag_id' });
        }
      }

      // Insert Custom Fields definitions & values
      const customFields = task.custom_fields || [];
      for (const cf of customFields) {
        let fieldType = 'text';
        if (cf.type === 'number') fieldType = 'number';
        else if (cf.type === 'date') fieldType = 'date';
        else if (cf.type === 'checkbox') fieldType = 'checkbox';
        else if (cf.type === 'drop_down') fieldType = 'dropdown';
        else if (cf.type === 'url') fieldType = 'url';

        const { data: cfData, error: cfErr } = await supabaseAdmin
          .from('custom_fields')
          .upsert({
            list_id: listUuid,
            name: cf.name,
            type: fieldType,
            options: cf.type_config || null,
          }, { onConflict: 'list_id,name' })
          .select()
          .single();

        if (!cfErr && cfData && cf.value !== undefined) {
          await supabaseAdmin
            .from('task_custom_field_values')
            .upsert({
              task_id: taskData.id,
              field_id: cfData.id,
              value: { val: cf.value },
            }, { onConflict: 'task_id,field_id' });
        }
      }

      return taskData.id;
    };

    // 1. Migrate all top level tasks first
    log(`Migrating ${topLevelTasks.length} Top-level Tasks...`);
    await processInBatches(topLevelTasks, 15, migrateTaskRecord);

    // 2. Migrate subtasks
    log(`Migrating ${subTasks.length} Subtasks...`);
    await processInBatches(subTasks, 15, migrateTaskRecord);

    // ───────────────────────────────────────────────────────────────────
    // STEP 4: Fetch Task Comments & Dependencies (Parallel with Throttling)
    // ───────────────────────────────────────────────────────────────────
    log('Migrating Task Comments...');
    await processInBatches(clickupTasks, 15, async (task) => {
      const supabaseTaskId = taskMap[task.id];
      if (!supabaseTaskId) return;

      try {
        const commentsData = await clickupFetch(`/task/${task.id}/comment`);
        const comments = commentsData.comments || [];
        for (const c of comments) {
          const authorUuid = userMap[String(c.user?.id)] || null;
          await supabaseAdmin
            .from('comments')
            .insert({
              task_id: supabaseTaskId,
              author_id: authorUuid,
              content: c.comment_text || '',
              created_at: new Date(parseInt(c.date)).toISOString(),
            });
        }
      } catch (err) {
        log(`Failed comments fetch for ${task.id}: ${err}`);
      }
    });

    log('Migrating Task Dependencies...');
    await processInBatches(clickupTasks, 15, async (task) => {
      const supabaseTaskId = taskMap[task.id];
      if (!supabaseTaskId) return;

      try {
        // Query dependencies
        const depData = await clickupFetch(`/task/${task.id}/dependency`);
        const dependencies = depData.dependencies || [];
        for (const dep of dependencies) {
          const depSupId = taskMap[dep.depends_on];
          if (depSupId) {
            await supabaseAdmin
              .from('task_dependencies')
              .insert({
                task_id: supabaseTaskId,
                depends_on_task_id: depSupId,
                type: dep.type === 'blocking' ? 'blocking' : 'waiting_on',
                created_by: userMap[String(dep.creator_id)] || null,
              });
          }
        }
      } catch (err) {
        // ClickUp throws 404/error if dependencies are not enabled or empty
      }
    });

    // ───────────────────────────────────────────────────────────────────
    // STEP 5: Write userMapping.ts to the filesystem
    // ───────────────────────────────────────────────────────────────────
    log('Writing userMapping.ts to files...');
    const mappingFilePath = path.join(process.cwd(), 'shared/utils/userMapping.ts');
    const mappingContent = `// ClickUp User ID -> Supabase Profile UUID mapping
export const userMapping: Record<string, string> = ${JSON.stringify(userMap, null, 2)};

export function mapUser(clickupId: string | number): string | null {
  const idStr = String(clickupId);
  return userMapping[idStr] || null;
}
`;
    await fs.writeFile(mappingFilePath, mappingContent, 'utf-8');

    // ───────────────────────────────────────────────────────────────────
    // STEP 6: Run Integrity Verification Checks
    // ───────────────────────────────────────────────────────────────────
    const { count: supabaseTaskCount } = await supabaseAdmin
      .from('tasks')
      .select('id', { count: 'exact', head: true });

    log(`Integrity Check: ClickUp total tasks = ${clickupTasks.length} vs Supabase migrated tasks = ${supabaseTaskCount}`);

    log('Migration completed successfully.');

    return NextResponse.json({
      success: true,
      logs,
      clickupTasksCount: clickupTasks.length,
      supabaseTasksCount: supabaseTaskCount,
    });
  } catch (error: any) {
    console.error('Migration API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
