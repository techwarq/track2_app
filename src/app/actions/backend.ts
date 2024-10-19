import axios from 'axios';




export interface Repository {
  owner: string;
  name: string;
}

export interface Project {
  name: string;
  owner: string;
  repo: string;
  lastUpdate?: string;
  timeAgo?: string;
}

export interface Summarization {
  name: string;
  description: string;
  tags: string[];
}

  
export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: Date;
}

export const fetchProjects = async (userId: string): Promise<Project[]> => {
  try {
    const response = await axios.get(`/api/dashboard?userId=${userId}`);
    return response.data.map((repo: Repository) => ({
      name: repo.name,
      owner: repo.owner,
      repo: `${repo.owner}/${repo.name}`,
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
};


export const fetchCommitsAndSummarize = async (
  owner: string,
  repo: string,
  userId: string
): Promise<{ commits: Commit[]; summaries: Summarization[] }> => {
  try {
    const repoFullName = `${owner}/${repo}`;

    // Fetch commits
    const commitsResponse = await axios.get('/api/dashboard/commits/', {
      params: {
        repo: repoFullName,
        userId: userId,
      },
    });
    const commits: Commit[] = commitsResponse.data;

    // Fetch summaries
    const summariesResponse = await axios.get('/api/dashboard/summarize/', {
      params: {
        repo: repoFullName,
        userId: userId,
      },
    });
    const summaries: Summarization[] = summariesResponse.data;

    return {
      commits,
      summaries,
    };
  } catch (error) {
    console.error('Error fetching commits and summaries:', error);
    throw new Error('Failed to fetch commits and summaries');
  }
};

export const fetchChangelog = async (owner: string, repo: string, userId: string): Promise<Summarization[]> => {
  try {
    
    
    // Fetch commits and summaries to ensure they are up-to-date
    const { summaries } = await fetchCommitsAndSummarize(owner, repo, userId);
    
    // Return the fetched summaries directly
    return Array.isArray(summaries) ? summaries : [];// No need to fetch changelog from another API
  } catch (error) {
    console.error('Error fetching changelog:', error);
    throw new Error('Failed to fetch changelog');
  }
};


export const fetchRepos = async (): Promise<Repository[]> => {
  try {
    // Since you have the repositories defined statically, you may not need to fetch them from an API.
    // If you're fetching from an API, this is where you would do it:
    const response = await axios.get('/api/repos');
    
    // Log the response to see its structure
    console.log('Fetched repositories response:', response.data);
    
    // Map the fetched data to the Repository interface format
    return response.data.map((repo: {
      timeAgo: number;
      lastUpdate: number; owner: string; name: string 
}) => ({
      owner: repo.owner,
      name: repo.name,
      lastUpdate: repo.lastUpdate, // Include lastUpdate
      timeAgo: repo.timeAgo,
    }));
  } catch (error) {
    console.error('Error fetching repositories:', error);
    throw new Error('Failed to fetch repositories');
  }
};

export const fetchPullRequestSum = async (owner: string, repo: string): Promise< Summarization[] > => {
  try {
    // Construct the URL using the owner and repo parameters
    const response = await axios.get(`/api/repos/${owner}/${repo}/changelogs`);
    
    // Assuming the response contains the summarized pull requests
    return response.data;
  } catch (error) {
    console.error('Error fetching pull request summaries:', error);
    throw new Error('Failed to fetch pull request summaries');
  }
};
