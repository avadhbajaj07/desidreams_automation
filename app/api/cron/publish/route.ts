import { NextResponse } from 'next/server';
import { fetchCloudinaryAssets } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If CRON_SECRET is set, verify authorization header
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.BLOTATO_API_KEY;
    const accountId = process.env.BLOTATO_ACCOUNT_ID;

    if (!apiKey || !accountId) {
      console.warn('Blotato credentials not configured for Cron execution.');
      return NextResponse.json({
        success: false,
        message: 'Cron executed but Blotato API key/account ID are not configured yet in environment.',
      });
    }

    const assets = await fetchCloudinaryAssets();
    if (assets.length === 0) {
      return NextResponse.json({ message: 'No media found in Cloudinary folder' });
    }

    // Pick next item
    const postItem = assets[0];

    // Call Blotato API
    const blotatoResponse = await fetch('https://api.blotato.com/v1/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: accountId,
        mediaType: postItem.mediaType,
        mediaUrl: postItem.secureUrl,
        caption: postItem.caption,
        firstComment: '✨ Instant Access: https://desidreams.fun',
      }),
    });

    const result = await blotatoResponse.json();

    return NextResponse.json({
      success: blotatoResponse.ok,
      executedAt: new Date().toISOString(),
      item: postItem,
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
