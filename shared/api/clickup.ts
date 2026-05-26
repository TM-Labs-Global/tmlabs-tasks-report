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
 * Fetches all tasks for a team with pagination support.
 * Pagination loops until the API returns fewer than 100 tasks.
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
    
    if (!data.tasks || data.tasks.length === 0) break;
    
    allTasks = [...allTasks, ...data.tasks];
    
    // ClickUp returns up to 100 tasks per page. 
    // If the returned list contains fewer than 100 tasks, we have reached the last page.
    if (data.tasks.length < 100) {
      isLastPage = true;
    }
    
    page++;
    
    // Safety guard to prevent infinite loops
    if (page > 50) break; 
  }

  return allTasks;
}

/**
 * Fetches all tasks for a specific list with pagination support.
 * Pagination loops until the API returns fewer than 100 tasks.
 */
export async function getListTasks(listId: string, token: string) {
  let page = 0;
  let allTasks: any[] = [];
  let isLastPage = false;

  while (!isLastPage) {
    const data = await proxyFetch(
      `/list/${listId}/task?page=${page}&subtasks=true&include_closed=true`,
      token
    );
    
    if (!data.tasks || data.tasks.length === 0) break;
    
    allTasks = [...allTasks, ...data.tasks];
    
    if (data.tasks.length < 100) {
      isLastPage = true;
    }
    
    page++;
    
    if (page > 50) break;
  }

  return allTasks;
}

/**
 * Fetches spaces, folders, and lists to build the project hierarchy.
 * Fetches both Folder Lists and folderless Space Lists for every Space in parallel.
 */
export async function getWorkspaceHierarchy(teamId: string, token: string) {
  const spaceData = await proxyFetch(`/team/${teamId}/space`, token);
  const spaces = spaceData.spaces || [];

  const detailedSpaces = await Promise.all(
    spaces.map(async (space: any) => {
      try {
        // Fetch folders (each folder includes its lists in the .lists property)
        const folderData = await proxyFetch(`/space/${space.id}/folder`, token);
        const folders = folderData.folders || [];

        // Fetch folderless lists for the space
        const folderlessListData = await proxyFetch(`/space/${space.id}/list`, token);
        const folderlessLists = folderlessListData.lists || [];

        return {
          ...space,
          folders: folders.map((folder: any) => ({
            ...folder,
            lists: folder.lists || []
          })),
          folderlessLists
        };
      } catch (err) {
        console.error(`Error fetching hierarchy for space ${space.id}:`, err);
        return {
          ...space,
          folders: [],
          folderlessLists: []
        };
      }
    })
  );

  return detailedSpaces;
}
