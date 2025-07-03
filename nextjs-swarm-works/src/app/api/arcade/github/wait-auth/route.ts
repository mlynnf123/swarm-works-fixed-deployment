import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { arcadeGitHub } from '@/lib/arcade';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { authId } = await request.json();
    
    if (!authId) {
      return NextResponse.json({ error: 'Auth ID is required' }, { status: 400 });
    }

    const success = await arcadeGitHub.waitForGitHubAuth(authId);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('GitHub auth wait error:', error);
    return NextResponse.json(
      { error: 'Failed to wait for GitHub authorization' },
      { status: 500 }
    );
  }
}