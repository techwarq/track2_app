import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { createClient } from 'redis';

const prisma = new PrismaClient();
const redisClient = createClient({ url: process.env.REDIS_URL });

 redisClient.connect();

interface GitHubRepo {
  default_branch: string;
}

interface GitHubBranch {
  commit: {
    sha: string;
  };
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
}

export async function GET(req: NextRequest) {
  console.log('Received request for commits');

  const searchParams = req.nextUrl.searchParams;
  const repoParam = searchParams.get('repo'); // The full "owner/repo" string
  const userId = searchParams.get('userId');
  const since = searchParams.get('since') || '2019-05-06T00:00:00Z';

  console.log('Request parameters:', { repoParam, userId, since });

  if (!repoParam || !userId) {
    console.log('Invalid repo or userId:', repoParam, userId);
    return NextResponse.json({ error: 'Invalid repo or userId parameter' }, { status: 400 });
  }

  // Split the repoParam into owner and repo
  const [owner, repo] = repoParam.split('/');
  
  if (!owner || !repo) {
    console.log('Invalid repo format:', repoParam);
    return NextResponse.json({ error: 'Invalid repo format' }, { status: 400 });
  }

  try {
    console.log('Fetching user from database...');
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      console.log('User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check cache first
    const cacheKey = `commits:${owner}/${repo}?since=${since}`;
    const cachedCommits = await redisClient.get(cacheKey);
    if (cachedCommits) {
      console.log('Returning cached commits for:', cacheKey);
      return NextResponse.json(JSON.parse(cachedCommits));
    }

    // Step 1: Fetch repository details to get the default branch
    console.log('Fetching repository details...');
    const repoResponse = await axios.get<GitHubRepo>(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `token ${user.githubToken}`,
        },
      }
    );
    const defaultBranch = repoResponse.data.default_branch;

    // Step 2: Fetch the SHA of the default branch
    console.log('Fetching default branch SHA...');
    const branchResponse = await axios.get<GitHubBranch>(
      `https://api.github.com/repos/${owner}/${repo}/branches/${defaultBranch}`,
      {
        headers: {
          Authorization: `token ${user.githubToken}`,
        },
      }
    );
    const sha = branchResponse.data.commit.sha;

    // Step 3: Fetch commits using the SHA
    console.log('Fetching commits from GitHub...');
    const commitsResponse = await axios.get<GitHubCommit[]>(
      `https://api.github.com/repos/${owner}/${repo}/commits`,
      {
        params: {
          sha: sha,
          per_page: 5,
          since: since,
        },
        headers: {
          Authorization: `token ${user.githubToken}`,
        },
      }
    );

    console.log('Received response from GitHub');
    const commits = commitsResponse.data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: new Date(commit.commit.author.date),
      repoFullName: `${owner}/${repo}`,
    }));

    // Step 4: Save commits in the database
    console.log('Saving commits to database...');
    const upsertPromises = commits.map(commit => 
      prisma.commit.upsert({
        where: { sha: commit.sha },
        update: {},
        create: {
          sha: commit.sha,
          message: commit.message,
          author: commit.author,
          date: commit.date,
          repoFullName: commit.repoFullName,
        },
      })
    );

    // Execute all upsert operations concurrently
    await Promise.all(upsertPromises);

    // Cache the commits for future requests
    await redisClient.set(cacheKey, JSON.stringify(commits), {
      EX: 3600, // Cache expiration time in seconds (1 hour)
    });

    console.log('Sending response...');
    return NextResponse.json(commits);
  } catch (error) {
    console.error('Error fetching commits:', error);
    if (axios.isAxiosError(error)) {
      console.error('GitHub API error:', error.response?.data);
      return NextResponse.json(
        {
          error: 'Failed to fetch commits',
          details: error.response?.data,
        },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch commits' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
