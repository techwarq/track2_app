import {  NextResponse } from 'next/server';
import { redis, connectToRedis } from '@/app/lib/redis';
import { prisma } from '@/app/lib/prisma';

import { repositories } from '@/const';
import axios from 'axios';




// Function to fetch the last commit for a repository
const fetchLastCommit = async (owner: string, name: string) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${name}/commits`);
    if (response.data && response.data.length > 0) {
      return response.data[0]; // Get the most recent commit
    }
    return null;
  } catch (error) {
    console.error(`Error fetching commits for ${owner}/${name}:`, error);
    return null;
  }
};

// Save repository details to the database
const saveRepoDetails = async (owner: string, name: string) => {
  const repoFullName = `${owner}/${name}`;
  const repo = await prisma.repo.upsert({
    where: { fullName: repoFullName },
    update: {},
    create: { fullName: repoFullName },
  });
  return repo.id;
};

export async function GET() {
    await connectToRedis();
  try {
    const repoDetails = await Promise.all(
      repositories.map(async (repo) => {
        const cacheKey = `repoDetails:${repo.owner}/${repo.name}`;
        
        // Check cache first
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          console.log('Returning cached data for:', cacheKey);
          return JSON.parse(cachedData); // Return cached data if available
        }

        const repoId = await saveRepoDetails(repo.owner, repo.name);
        const lastCommit = await fetchLastCommit(repo.owner, repo.name);

        // Prepare the response
        const lastUpdate = lastCommit ? new Date(lastCommit.commit.author.date) : null;
        const timeAgo = lastUpdate ? calculateTimeAgo(lastUpdate) : 'Unknown';

        const repoDetail = {
          owner: repo.owner,
          name: repo.name,
          id: repoId,
          lastUpdate: lastUpdate ? lastUpdate.toLocaleString() : 'No updates',
          timeAgo,
        };

        // Cache the result
        await redis.set(cacheKey, JSON.stringify(repoDetail), {
          EX: 3600, // Cache expiration time in seconds (1 hour)
        });

        return repoDetail;
      })
    );

    return NextResponse.json(repoDetails);
  } catch (error) {
    console.error('Error saving repos:', error);
    return NextResponse.json({ error: 'Failed to fetch and save repositories' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to calculate time ago
const calculateTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} years ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} months ago`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} days ago`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} hours ago`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} minutes ago`;
  return `${seconds} seconds ago`;
};
