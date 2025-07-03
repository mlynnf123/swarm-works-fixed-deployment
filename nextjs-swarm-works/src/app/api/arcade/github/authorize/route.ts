import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { arcadeGitHub } from '@/lib/arcade';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use user email as userId for Arcade
    const userId = user.email || user.id;
    
    const authResult = await arcadeGitHub.authorizeGitHub(userId);
    
    return NextResponse.json(authResult);
  } catch (error) {
    console.error('GitHub authorization error:', error);
    return NextResponse.json(
      { error: 'Failed to authorize GitHub access' },
      { status: 500 }
    );
  }
}