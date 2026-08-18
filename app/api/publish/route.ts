import { NextResponse } from 'next/server';
import { fetchCloudinaryAssets } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = process.env.BLOTATO_API_KEY;
    const accountId = process.env.BLOTATO_ACCOUNT_ID;

    // Check if user requested a specific media item or next in queue
    let targetItem = body.item;

    if (!targetItem) {
      const assets = await fetchCloudinaryAssets();
      if (assets.length === 0) {
        return NextResponse.json({ success: false, message: 'No assets found in Cloudinary folder' }, { status: 400 });
      }
      targetItem = assets[0];
    }

    if (!apiKey || !accountId) {
      return NextResponse.json({
        success: false,
        warning: 'BLOTATO_API_KEY or BLOTATO_ACCOUNT_ID is missing. Please configure it in your environment.',
        itemReadyToPost: targetItem,
      }, { status: 400 });
    }

    // Call Blotato API
    const blotatoResponse = await fetch('https://api.blotato.com/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: accountId,
        mediaType: targetItem.mediaType,
        mediaUrl: targetItem.secureUrl,
        caption: targetItem.caption,
        firstComment: '✨ Full collection: https://desidreams.fun (Direct Link)',
      }),
    });

    const result = await blotatoResponse.json();

    if (!blotatoResponse.ok) {
      return NextResponse.json({
        success: false,
        error: result.message || 'Blotato API error',
        raw: result,
      }, { status: blotatoResponse.status });
    }

    return NextResponse.json({
      success: true,
      publishedItem: targetItem,
      blotatoResult: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to publish' },
      { status: 500 }
    );
  }
}
