const BASE_URL = 'https://api.clickup.com/api/v2';

/**
 * Standard fetcher for ClickUp API
 */
async function clickupFetch(endpoint: string, token: string) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.err || `ClickUp API error: ${response.status} at ${endpoint}`);
  }

  return response.json();
}

/**
 * Fetches all teams (workspaces) for the given token
 */
export async function getTeams(token: string) {
  return clickupFetch('/team', token);
}

/**
 * Fetches all members for a specific team
 */
export async function getTeamMembers(teamId: string, token: string) {
  return clickupFetch(`/team/${teamId}/member`, token);
}

/**
 * Fetches all tasks for a team with pagination support
 */
export async function getAllTasks(teamId: string, token: string) {
  let page = 0;
  let allTasks: any[] = [];
  let isLastPage = false;

  while (!isLastPage) {
    const data = await clickupFetch(
      `/team/${teamId}/task?page=${page}&subtasks=true&include_closed=true`,
      token
    );
    
    allTasks = [...allTasks, ...data.tasks];
    isLastPage = data.last_page;
    page++;
    
    // Safety break to prevent infinite loops in development
    if (page > 50) break; 
  }

  return allTasks;
}

/**
 * Fetches spaces, folders, and lists to build the project hierarchy
 */
export async function getWorkspaceHierarchy(teamId: string, token: string) {
  const spacesData = await clickupFetch(`/team/${teamId}/space`, token);
  return spacesData.spaces;
}
