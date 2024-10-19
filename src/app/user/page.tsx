'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MoreVertical, GitBranch } from 'lucide-react';
import { fetchRepos } from '../actions/backend';
import Link from 'next/link';

interface Repository {
  owner: string;
  name: string;
}

interface Project {
  name: string;
  owner: string;
  repo: string;
  lastUpdate?: string;
  timeAgo?: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link href={`/changelogs?owner=${project.owner}&repo=${project.name}`} passHref>
      <div className=" bg-gray-800 rounded-lg p-4 flex flex-col cursor-pointer">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
            <span className="font-semibold">{project.name}</span>
          </div>
          <button className="text-gray-400 hover:text-white">
            <MoreVertical size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-2">{`${project.owner}/${project.name}`}</p>
        <div className="flex items-center text-sm text-gray-400 mt-auto">
          <span>{project.lastUpdate || 'No updates'}</span>
          <span className="mx-1">·</span>
          <span>{project.timeAgo || 'Unknown'}</span>
          <GitBranch size={14} className="ml-1" />
          <span className="ml-1">main</span>
        </div>
      </div>
    </Link>
  );
};

const User: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const repos: Repository[] = await fetchRepos();
        const projectsData = repos.map((repo) => ({
          name: repo.name,
          owner: repo.owner,
          repo: `${repo.owner}/${repo.name}`,
        }));
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img
          src="assets/Bat Png.png" // Update this with the correct path to your bat image
          alt="Loading Bat"
          className="w-32 h-32 animate-spinner transform-gpu"
        />
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <button className="bg-white text-black px-4 py-2 rounded-md flex items-center">
            <Plus size={20} className="mr-2" />
            Add New...
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default User;
