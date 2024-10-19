import { NextRequest, NextResponse } from 'next/server';
import { redis, connectToRedis } from '@/app/lib/redis';
import { prisma } from '@/app/lib/prisma';

import axios from 'axios';
import { summarizePullRequests } from '../../../../../aisum';




interface GitHubPullRequest {
  title: string;
  body: string | null;
  closed_at: string | null;
}

export async function GET(req: NextRequest, { params }: { params: { owner: string; repo: string } }) {
  const { owner, repo } = params;
  await connectToRedis();

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Owner or repo parameter missing' }, { status: 400 });
  }

  const cacheKey = `pullRequests:${owner}/${repo}`;
  
  try {
   
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data');
      return NextResponse.json(JSON.parse(cachedData));
    }

    
    const repoFullName = `${owner}/${repo}`;
    let repoRecord = await prisma.repo.findUnique({ where: { fullName: repoFullName } });

    if (!repoRecord) {
      repoRecord = await prisma.repo.upsert({
        where: { fullName: repoFullName },
        update: {},
        create: { fullName: repoFullName },
      });
    }

    
    const recentPRs = await prisma.pullRequest.findMany({
      where: {
        repoId: repoRecord?.id || 0,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });

    let pullRequests: GitHubPullRequest[] = [];
    if (recentPRs.length === 0) {
     
      const response = await axios.get<GitHubPullRequest[]>(`https://api.github.com/repos/${owner}/${repo}/pulls?state=closed`, {
        params: { state: 'closed', per_page: 5 },
      });
      pullRequests = response.data;

      
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

   
    if (repoRecord?.id) {
      const summarizedPullRequests = await summarizePullRequests(repoRecord.id);

      
      await redis.set(cacheKey, JSON.stringify(summarizedPullRequests), {
        EX: 3600, 
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
