import { NextResponse } from 'next/server';
import { summarizeCommits } from '@/app/aisum';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();
const redisClient = createClient({ url: process.env.REDIS_URL });



export async function GET(request: Request) {
    await redisClient.connect();
  const { searchParams } = new URL(request.url);
  console.log('Full request URL:', request.url);
  const repoParam = searchParams.get('repo');
  const userId = searchParams.get('userId');

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

    // Check Redis cache for existing summaries
    const cacheKey = `commitSummaries:${repoParam}`;
    const cachedSummaries = await redisClient.get(cacheKey);
    if (cachedSummaries) {
      console.log('Returning cached commit summaries for:', cacheKey);
      return NextResponse.json(JSON.parse(cachedSummaries));
    }

    // Step 1: Check if a summarization for this repo already exists in the database
    console.log('Checking for existing commit summaries...');
    const existingSummaries = await prisma.commitSummary.findMany({
      where: {
        repoFullName: repoParam,
      },
    });

    if (existingSummaries.length > 0) {
      console.log('Found existing commit summaries. Returning them...');
      // Cache the existing summaries for future requests
      await redisClient.set(cacheKey, JSON.stringify(existingSummaries), {
        EX: 3600, // Cache expiration time in seconds (1 hour)
      });
      return NextResponse.json(existingSummaries); // Return existing summaries if they exist
    }

    // Step 2: Fetch commits from the database
    console.log('Fetching commits from database...');
    const commits = await prisma.commit.findMany({
      where: {
        repoFullName: repoParam,
      },
      take: 5,
      orderBy: {
        date: 'asc',
      },
    });

    console.log('Number of commits fetched from the database:', commits.length);

    // Step 3: Format the commits for summarization
    const formattedCommits = commits.map(commit => ({
      sha: commit.sha,
      commit: {
        message: commit.message,
        author: {
          name: commit.author,
          date: commit.date.toISOString(),
        },
      },
    }));

    console.log('Summarizing commits...');
    const summaries = await summarizeCommits(formattedCommits);

    // Step 4: Save the summaries in the database
    const savedSummaries = await Promise.all(summaries.map(async (summary) => {
      const commitSummary = await prisma.commitSummary.create({
        data: {
          repoFullName: repoParam,
          name: summary.name,
          description: summary.description,
          tags: summary.tags || [],
          generatedAt: new Date(),
        },
      });
      console.log('Commit summary saved successfully:', commitSummary);
      return commitSummary;
    }));

    // Cache the newly created summaries
    await redisClient.set(cacheKey, JSON.stringify(savedSummaries), {
      EX: 3600, // Cache expiration time in seconds (1 hour)
    });

    return NextResponse.json(savedSummaries); // Return the saved summaries
  } catch (error) {
    console.error('Error in /api/dashboard/summarize route:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to summarize commits', details: 'Check server logs for more information' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Ensure proper disconnection from Prisma
  }
}
