import { NextResponse } from 'next/server';
import { fetchCloudinaryAssets } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const assets = await fetchCloudinaryAssets();
    return NextResponse.json({
      success: true,
      totalCount: assets.length,
      imagesCount: assets.filter(a => a.mediaType === 'IMAGE').length,
      reelsCount: assets.filter(a => a.mediaType === 'REEL').length,
      items: assets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch media assets' },
      { status: 500 }
    );
  }
}
