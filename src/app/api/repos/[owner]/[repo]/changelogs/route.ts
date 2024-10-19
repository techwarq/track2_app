import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { summarizePullRequests } from '../../../../../aisum';
import { createClient } from 'redis';

const prisma = new PrismaClient();
const redisClient = createClient({ url: process.env.REDIS_URL });



// Type definition for GitHub PR
interface GitHubPullRequest {
  title: string;
  body: string | null;
  closed_at: string | null;
}

export async function GET(req: NextRequest, { params }: { params: { owner: string; repo: string } }) {
  const { owner, repo } = params;
  await redisClient.connect();

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Owner or repo parameter missing' }, { status: 400 });
  }

  const cacheKey = `pullRequests:${owner}/${repo}`;
  
  try {
    // Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data');
      return NextResponse.json(JSON.parse(cachedData));
    }

    // Find or create repo in the database
    const repoFullName = `${owner}/${repo}`;
    let repoRecord = await prisma.repo.findUnique({ where: { fullName: repoFullName } });

    if (!repoRecord) {
      repoRecord = await prisma.repo.upsert({
        where: { fullName: repoFullName },
        update: {},
        create: { fullName: repoFullName },
      });
    }

    // Fetch recent PRs (last 24 hours) from the database
    const recentPRs = await prisma.pullRequest.findMany({
      where: {
        repoId: repoRecord?.id || 0,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    let pullRequests: GitHubPullRequest[] = [];
    if (recentPRs.length === 0) {
      // Fetch from GitHub if no recent PRs
      const response = await axios.get<GitHubPullRequest[]>(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        params: { state: 'closed', per_page: 5 },
      });
      pullRequests = response.data;

      // Save PRs to the database
      await Promise.all(
        pullRequests.map(async (pr) =>
          prisma.pullRequest.create({
            data: {
              title: pr.title,
              description: pr.body || 'No description',
              repoId: repoRecord?.id || 0,
              closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
            },
          })
        )
      );
    } else {
      pullRequests = recentPRs.map(pr => ({
        title: pr.title,
        body: pr.description,
        closed_at: pr.closedAt?.toISOString() || null,
      }));
    }

    // Summarize pull requests using AI
    if (repoRecord?.id) {
      const summarizedPullRequests = await summarizePullRequests(repoRecord.id);

      // Cache the result
      await redisClient.set(cacheKey, JSON.stringify(summarizedPullRequests), {
        EX: 3600, // Cache expiration time in seconds (1 hour)
      });

      return NextResponse.json(summarizedPullRequests);
    }

    return NextResponse.json({ error: 'Repo record not found' }, { status: 500 });
  } catch (error) {
    console.error('Error fetching pull requests:', error);
    return NextResponse.json({ error: 'Error fetching PRs' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
