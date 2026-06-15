export interface GitHubRepo {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  url: string;
  updatedAt: string;
}

export interface GitHubEvent {
  id: string;
  type: string;
  repoName: string;
  commitMessage?: string;
  date: string;
}

export async function fetchGitHubData(username: string): Promise<{
  repos: GitHubRepo[];
  events: GitHubEvent[];
  stats: { stars: number; reposCount: number };
}> {
  if (!username) {
    throw new Error("用户名为空");
  }

  // 1. Fetch repos
  const reposUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`;
  const eventsUrl = `https://api.github.com/users/${username}/events?per_page=20`;

  let repos: GitHubRepo[] = [];
  let events: GitHubEvent[] = [];
  let totalStars = 0;

  try {
    const reposRes = await fetch(reposUrl);
    if (reposRes.ok) {
      const reposData = await reposRes.json();
      if (Array.isArray(reposData)) {
        repos = reposData.map((item: any) => {
          totalStars += item.stargazers_count || 0;
          return {
            name: item.name,
            description: item.description || "暂无描述",
            stars: item.stargazers_count || 0,
            forks: item.forks_count || 0,
            language: item.language || "Other",
            url: item.html_url,
            updatedAt: new Date(item.updated_at).toLocaleDateString("zh-CN")
          };
        });
      }
    } else {
      console.warn("GitHub Repos API rate limited or failed:", reposRes.status);
    }
  } catch (err) {
    console.error("Error fetching repos:", err);
  }

  try {
    const eventsRes = await fetch(eventsUrl);
    if (eventsRes.ok) {
      const eventsData = await eventsRes.json();
      if (Array.isArray(eventsData)) {
        // Filter out PushEvents or commits
        const pushEvents = eventsData
          .filter((evt: any) => evt.type === "PushEvent" && evt.payload?.commits?.length > 0)
          .slice(0, 5);

        events = pushEvents.flatMap((evt: any) => {
          const commits = evt.payload.commits || [];
          return commits.map((c: any) => ({
            id: c.sha || Math.random().toString(),
            type: "Push",
            repoName: evt.repo?.name?.split("/")[1] || evt.repo?.name || "仓库",
            commitMessage: c.message || "提交代码修改",
            date: new Date(evt.created_at).toLocaleDateString("zh-CN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          }));
        });
      }
    }
  } catch (err) {
    console.error("Error fetching events:", err);
  }

  return {
    repos,
    events,
    stats: {
      stars: totalStars,
      reposCount: repos.length || 10
    }
  };
}
