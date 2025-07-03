'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useArcadeGitHub } from '@/hooks/useArcadeGitHub';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  private: boolean;
  html_url: string;
  stargazers_count: number;
  language?: string;
}

export function GitHubIntegration() {
  const { data: session } = useSession();
  const { 
    authorizeGitHub, 
    waitForAuth, 
    starRepository, 
    listRepositories, 
    createRepository,
    isLoading, 
    error,
    clearError 
  } = useArcadeGitHub();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRepo, setNewRepo] = useState({
    name: '',
    description: '',
    private: false,
    auto_init: true,
  });

  useEffect(() => {
    if (session && !isAuthorized) {
      handleAuthorization();
    }
  }, [session]);

  const handleAuthorization = async () => {
    const authResult = await authorizeGitHub();
    
    if (authResult?.status === 'pending') {
      setAuthUrl(authResult.authUrl);
      // Wait for user to authorize
      const success = await waitForAuth(authResult.authId);
      if (success) {
        setIsAuthorized(true);
        setAuthUrl(null);
        loadRepositories();
      }
    } else if (authResult?.status === 'completed') {
      setIsAuthorized(true);
      loadRepositories();
    }
  };

  const loadRepositories = async () => {
    const result = await listRepositories();
    if (result?.success) {
      setRepositories(result.data || []);
    }
  };

  const handleStarRepo = async (owner: string, name: string) => {
    const result = await starRepository(owner, name, true);
    if (result?.success) {
      // Refresh repositories to update star count
      loadRepositories();
    }
  };

  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRepo.name.trim()) {
      return;
    }

    const result = await createRepository(newRepo);
    if (result?.success) {
      setShowCreateForm(false);
      setNewRepo({ name: '', description: '', private: false, auto_init: true });
      loadRepositories();
    }
  };

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please sign in to access GitHub integration</p>
      </div>
    );
  }

  if (authUrl) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-normal mb-4 uppercase tracking-wider">
          GitHub Authorization Required
        </h3>
        <p className="text-gray-600 mb-6">
          Click the link below to authorize GitHub access:
        </p>
        <a
          href={authUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="swarm-button-primary inline-block"
        >
          Authorize GitHub
        </a>
        <p className="text-sm text-gray-500 mt-4">
          Return to this page after authorization is complete.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading GitHub integration...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={clearError}
          className="swarm-button-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light tracking-wider uppercase">
          GitHub Integration
        </h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="swarm-button-primary"
        >
          {showCreateForm ? 'Cancel' : 'Create Repository'}
        </button>
      </div>

      {/* Create Repository Form */}
      {showCreateForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-normal mb-4 uppercase tracking-wider">
            Create New Repository
          </h3>
          <form onSubmit={handleCreateRepo} className="space-y-4">
            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">
                Repository Name
              </label>
              <input
                type="text"
                value={newRepo.name}
                onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={newRepo.description}
                onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newRepo.private}
                  onChange={(e) => setNewRepo({ ...newRepo, private: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm uppercase tracking-wider">Private</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newRepo.auto_init}
                  onChange={(e) => setNewRepo({ ...newRepo, auto_init: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm uppercase tracking-wider">Initialize with README</span>
              </label>
            </div>
            <button
              type="submit"
              className="swarm-button-primary"
              disabled={isLoading}
            >
              Create Repository
            </button>
          </form>
        </div>
      )}

      {/* Repositories List */}
      <div className="space-y-4">
        <h3 className="text-lg font-normal uppercase tracking-wider">
          Your Repositories
        </h3>
        
        {repositories.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>No repositories found</p>
            <button
              onClick={loadRepositories}
              className="mt-4 text-sm underline hover:no-underline"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {repo.name}
                      </a>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {repo.full_name}
                    </p>
                    {repo.description && (
                      <p className="text-gray-700 mt-2">{repo.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      {repo.language && (
                        <span className="flex items-center">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                          {repo.language}
                        </span>
                      )}
                      <span>{repo.stargazers_count} stars</span>
                      <span className="text-xs uppercase tracking-wider">
                        {repo.private ? 'Private' : 'Public'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStarRepo(repo.full_name.split('/')[0], repo.name)}
                    className="ml-4 px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                    disabled={isLoading}
                  >
                    ⭐ Star
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}