import { NextResponse } from "next/server";
import axios from "axios";
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();
const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.connect();

interface GithubRepo {
  id: number;
  name: string;
  owner: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    // ... other owner properties
  };
  full_name: string;
  default_branch: string;
}

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId as string, 10) },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check Redis cache for repositories
    const cacheKey = `githubRepos:${userId}`;
    const cachedRepos = await redisClient.get(cacheKey);

    if (cachedRepos) {
      console.log('Returning cached repositories for userId:', userId);
      return NextResponse.json(JSON.parse(cachedRepos));
    }

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${user.githubToken}`,
      },
    });

    const repos = response.data.map((repo: GithubRepo) => ({
      id: repo.id,
      name: repo.name,
      owner: repo.owner.login,  // Extract just the login username from the owner object
      full_name: repo.full_name,
      default_branch: repo.default_branch,
    }));

    // Cache the repositories in Redis
    await redisClient.set(cacheKey, JSON.stringify(repos), {
      EX: 3600, // Cache expiration time in seconds (1 hour)
    });

    return NextResponse.json(repos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Ensure proper disconnection from Prisma
  }
};
