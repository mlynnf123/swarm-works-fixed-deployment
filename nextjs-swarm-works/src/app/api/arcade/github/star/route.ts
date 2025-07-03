import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { arcadeGitHub } from '@/lib/arcade';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.email || user.id;
    const { owner, name, starred } = await request.json();
    
    if (!owner || !name) {
      return NextResponse.json({ error: 'Owner and name are required' }, { status: 400 });
    }

    const result = starred 
      ? await arcadeGitHub.starRepository(userId, owner, name)
      : await arcadeGitHub.unstarRepository(userId, owner, name);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Star repository error:', error);
    return NextResponse.json(
      { error: 'Failed to star/unstar repository' },
      { status: 500 }
    );
  }
}