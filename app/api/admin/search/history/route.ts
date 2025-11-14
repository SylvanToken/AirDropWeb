import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryEntry,
} from '@/lib/admin/search';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    const history = await getSearchHistory(session.user.id, limit);

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Get search history error:', error);
    return NextResponse.json(
      { error: 'Failed to get search history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const entryId = searchParams.get('id');

    if (entryId) {
      // Delete specific entry
      const success = await deleteSearchHistoryEntry(entryId, session.user.id);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to delete entry' },
          { status: 500 }
        );
      }
    } else {
      // Clear all history
      await clearSearchHistory(session.user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete search history error:', error);
    return NextResponse.json(
      { error: 'Failed to delete search history' },
      { status: 500 }
    );
  }
}
