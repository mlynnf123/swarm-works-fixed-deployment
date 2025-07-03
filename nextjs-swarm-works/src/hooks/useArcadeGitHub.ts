'use client'

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function useArcadeGitHub() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorizeGitHub = async () => {
    if (!session) {
      setError('Please sign in first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/arcade/github/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to authorize GitHub');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const waitForAuth = async (authId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/arcade/github/wait-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authId }),
      });

      if (!response.ok) {
        throw new Error('Failed to wait for authorization');
      }

      const result = await response.json();
      return result.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization wait failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const starRepository = async (owner: string, name: string, starred: boolean = true) => {
    if (!session) {
      setError('Please sign in first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/arcade/github/star', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ owner, name, starred }),
      });

      if (!response.ok) {
        throw new Error('Failed to star repository');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Star operation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const listRepositories = async () => {
    if (!session) {
      setError('Please sign in first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/arcade/github/repositories');

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createRepository = async (repositoryData: {
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
  }) => {
    if (!session) {
      setError('Please sign in first');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/arcade/github/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(repositoryData),
      });

      if (!response.ok) {
        throw new Error('Failed to create repository');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Repository creation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    authorizeGitHub,
    waitForAuth,
    starRepository,
    listRepositories,
    createRepository,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}