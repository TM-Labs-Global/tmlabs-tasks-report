/**
 * Mapping configuration and utility functions to associate deactivated ClickUp accounts
 * with their active counterparts.
 */

// Mapping of deactivated ClickUp User IDs to active ClickUp User IDs
const USER_ID_MAPPING: Record<string, string> = {
  '106698158': '106718586', // El-Roy Wisdom (Old) -> El-Roy Wisdom (New)
  '106698577': '106718770', // John Uguru (Old) -> John Uguru (New)
};

// Mapping of deactivated ClickUp emails to active ClickUp User IDs
const USER_EMAIL_MAPPING: Record<string, string> = {
  'el-roy.wisdom@tmlabs.xyz': '106718586',
  'johnuguru@tmlabs.xyz': '106718770',
  'j.uguru@tmlabs.xyz': '106718770',
};

// Predefined active user details as a fallback if not found in active workspace members
const ACTIVE_USER_DETAILS: Record<string, { id: number; username: string; email: string; initials: string; color?: string }> = {
  '106718586': {
    id: 106718586,
    username: 'El-Roy Wisdom',
    email: 'el-roy.wisdom@takeoutmedia.xyz',
    initials: 'EW',
    color: '#7b68ee',
  },
  '106718770': {
    id: 106718770,
    username: 'John Uguru',
    email: 'aadd83cd-884c-423a-81d6-36f3348a6320@takeoutmediang.onmicrosoft.com',
    initials: 'JU',
    color: '#82b1ff',
  },
};

/**
 * Maps a ClickUp assignee object (from a task) to its active counterpart if deactivated.
 */
export function mapAssignee(assignee: any, teamMembers: any[] = []): any {
  if (!assignee) return assignee;

  const idStr = String(assignee.id);
  const emailStr = String(assignee.email || '').toLowerCase().trim();

  // Determine if the assignee needs to be mapped to a new active user ID
  let targetActiveId = USER_ID_MAPPING[idStr];
  if (!targetActiveId && emailStr) {
    targetActiveId = USER_EMAIL_MAPPING[emailStr];
  }

  // If no mapping is needed, return the assignee as-is
  if (!targetActiveId) {
    return assignee;
  }

  // Try to find the active user's full details from the active workspace members list
  const activeMember = teamMembers.find(
    (m: any) => m?.user && String(m.user.id) === targetActiveId
  );

  if (activeMember?.user) {
    return {
      ...assignee,
      ...activeMember.user,
      id: Number(activeMember.user.id), // Ensure consistent numeric ID representation
    };
  }

  // Fallback to predefined details if not found in the fetched members list
  const fallbackDetails = ACTIVE_USER_DETAILS[targetActiveId];
  if (fallbackDetails) {
    return {
      ...assignee,
      ...fallbackDetails,
    };
  }

  return assignee;
}

/**
 * Maps a list of task assignees to their active counterparts and deduplicates them.
 */
export function mapAssignees(assignees: any[] | undefined, teamMembers: any[] = []): any[] {
  if (!assignees || !Array.isArray(assignees)) return [];

  const mappedList = assignees.map(a => mapAssignee(a, teamMembers));

  // Deduplicate by mapped User ID to handle tasks assigned to both old and new accounts
  const uniqueList: any[] = [];
  const seenIds = new Set<string>();

  for (const assignee of mappedList) {
    const idStr = String(assignee.id);
    if (!seenIds.has(idStr)) {
      seenIds.add(idStr);
      uniqueList.push(assignee);
    }
  }

  return uniqueList;
}
