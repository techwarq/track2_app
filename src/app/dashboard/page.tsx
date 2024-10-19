"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { fetchProjects, Project } from '../actions/backend'; // Adjust the import path to your backend.ts file
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Dashboard() {
  const [repos, setRepos] = useState<Project[]>([]); // Use Project[] type here
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userIdParam = params.get('userId');
    if (userIdParam) {
      setUserId(userIdParam);
      fetchRepos(userIdParam); // Pass userIdParam here
    } else {
      setError('No userId found in URL.');
    }
  }, []);

  const fetchRepos = async (userId: string) => {
    try {
      const projects = await fetchProjects(userId); // You can modify this function to accept userId if needed
      setRepos(projects); // Set repos state to the fetched projects
      setError(null);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setError('Failed to fetch repositories. Please try again later.');
      setRepos([]);
    }
  };

  const handleRepoSelect = (repo: string) => {
    if (!userId) {
      setError('No userId available. Please refresh the page or re-authenticate.');
      return;
    }
    // Navigate to the new route with selected repo
    router.push(`/dashboard/devlogs?repo=${encodeURIComponent(repo)}&userId=${encodeURIComponent(userId)}`);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl text-white font-bold mb-4">Developer Dashboard</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {repos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {repos.map((repo) => (
            <Card key={repo.repo} className="cursor-pointer bg-gray-700 border-gray-700" onClick={() => handleRepoSelect(repo.repo)}>
              <CardHeader>
                <CardTitle className='text-white'>{repo.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white">Owner: {repo.owner}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No repositories found. Please check your connection and try again.</p>
      )}
    </main>
  );
}
