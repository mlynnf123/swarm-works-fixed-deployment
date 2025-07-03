import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { arcadeGitHub } from '@/lib/arcade';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.email || user.id;
    const username = user.username || user.name;
    
    if (!username) {
      return NextResponse.json({ error: 'Username not found' }, { status: 400 });
    }

    const result = await arcadeGitHub.listUserRepositories(userId, username);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('List repositories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.email || user.id;
    const repositoryData = await request.json();
    
    const result = await arcadeGitHub.createRepository(userId, repositoryData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Create repository error:', error);
    return NextResponse.json(
      { error: 'Failed to create repository' },
      { status: 500 }
    );
  }
}