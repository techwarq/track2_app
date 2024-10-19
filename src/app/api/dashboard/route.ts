import { NextResponse } from "next/server";
import axios from "axios";
import { redis, connectToRedis } from '@/app/lib/redis';
import { prisma } from '@/app/lib/prisma';



interface GithubRepo {
  id: number;
  name: string;
  owner: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    
  };
  full_name: string;
  default_branch: string;
}

export const GET = async (req: Request) => {

  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  await connectToRedis();

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

   
    const cacheKey = `githubRepos:${userId}`;
    const cachedRepos = await redis.get(cacheKey);

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
      owner: repo.owner.login,  
      full_name: repo.full_name,
      default_branch: repo.default_branch,
    }));

    
    await redis.set(cacheKey, JSON.stringify(repos), {
      EX: 3600, 
    });

    return NextResponse.json(repos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); 
  }
};
