'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { cn } from "@/lib/utils";
import { fetchChangelog, Summarization } from '../../actions/backend';

const badgeColors = [
  'bg-purple-700',
  'bg-green-700',
  'bg-yellow-500',
  'bg-red-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
];

function DevlogsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const repo = searchParams.get('repo');

  const [changelogs, setChangelogs] = useState<Summarization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !repo) {
        setError('Missing userId or repo');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const [owner, repoName] = repo.split('/');
        const changelog = await fetchChangelog(owner, repoName, userId);
        
        setChangelogs(changelog);
        setError(null);
      } catch (error) {
        console.error('Error fetching changelog:', error);
        setError('An unexpected error occurred while fetching the changelog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, repo]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img
          src="/assets/Bat Png.png"
          alt="Loading Bat"
          className="w-32 h-32 animate-spinner transform-gpu"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-8">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
        <p className="mt-4">
          Please check the console for more details and ensure your backend is running correctly.
        </p>
      </div>
    );
  }

  return (
    <main className="text-white min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-mono font-bold text-white mb-4">
          Changelog for <span className='text-blue-500'>{repo}</span>
        </h1>
        <p className="mb-4">User ID: {userId}</p>
        {changelogs.length === 0 ? (
          <p className="text-yellow-500">No changelog entries found. This could be due to an empty repository or an issue with the changelog generation process.</p>
        ) : (
          changelogs.map((entry, index) => (
            <Card key={index} className="flex items-start justify-start pt-3 mb-4 bg-gray-800 border-gray-700 text-white border-gray-700 rounded-lg shadow-lg overflow-hidden">
              <div className="flex grow flex-col justify-between">
                <div className="flex items-start p-3 py-0">
                  <div className="flex grow flex-wrap items-center gap-x-2 pb-1">
                    <CardTitle className="text-xl font-bold text-foreground text-white">
                      {entry.name}
                    </CardTitle>
                  </div>
                </div>
                <CardContent className="p-3 pt-0">
                  <p className="mb-2 text-md text-cyan-600">{entry.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {entry.tags.map((tag, tagIndex) => (
                      <Badge 
                        key={tagIndex} 
                        className={cn(
                          "text-xs font-semibold px-2 py-1 rounded-full",
                          badgeColors[tagIndex % badgeColors.length],
                          "text-white"
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}

export default function Devlogs() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-8">Loading...</div>}>
      <DevlogsContent />
    </Suspense>
  );
}