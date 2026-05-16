/**
 * Standard fetcher that routes through our internal proxy to hide tokens
 */
async function proxyFetch(endpoint: string, token: string) {
  const response = await fetch('/api/clickup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      customToken: token // Still pass the token if the user provided one manually
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `Proxy error: ${response.status}`);
  }

  return data;
}

/**
 * Fetches all teams (workspaces) for the given token
 */
export async function getTeams(token: string) {
  return proxyFetch('/team', token);
}

/**
 * Fetches all members for a specific team
 */
export async function getTeamMembers(teamId: string, token: string) {
  return proxyFetch(`/team/${teamId}/member`, token);
}

/**
 * Fetches all tasks for a team with pagination support
 */
export async function getAllTasks(teamId: string, token: string) {
  let page = 0;
  let allTasks: any[] = [];
  let isLastPage = false;

  while (!isLastPage) {
    const data = await proxyFetch(
      `/team/${teamId}/task?page=${page}&subtasks=true&include_closed=true`,
      token
    );
    
    if (!data.tasks) break;
    
    allTasks = [...allTasks, ...data.tasks];
    isLastPage = data.last_page;
    page++;
    
    if (page > 50) break; 
  }

  return allTasks;
}

/**
 * Fetches spaces, folders, and lists to build the project hierarchy
 */
export async function getWorkspaceHierarchy(teamId: string, token: string) {
  const data = await proxyFetch(`/team/${teamId}/space`, token);
  return data.spaces;
}
