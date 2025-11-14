import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  performSearch,
  saveSearchHistory,
  SearchQuery,
} from '@/lib/admin/search';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      model,
      query,
      fields,
      operators,
      limit,
      offset,
    }: SearchQuery & { model: 'user' | 'task' | 'completion' | 'campaign' } =
      body;

    if (!model || !query) {
      return NextResponse.json(
        { error: 'Model and query are required' },
        { status: 400 }
      );
    }

    // Perform search
    const searchResults = await performSearch(model, {
      query,
      fields,
      operators,
      limit,
      offset,
    });

    // Save to search history
    await saveSearchHistory(
      session.user.id,
      query,
      searchResults.total
    );

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
