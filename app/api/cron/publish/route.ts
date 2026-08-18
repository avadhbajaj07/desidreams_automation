import { NextResponse } from 'next/server';
import { fetchCloudinaryAssets } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.BLOTATO_API_KEY;
    const accountId = process.env.BLOTATO_INSTAGRAM_ACCOUNT_ID || '65790';

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'Cron executed but BLOTATO_API_KEY is missing.',
      });
    }

    const assets = await fetchCloudinaryAssets();
    if (assets.length === 0) {
      return NextResponse.json({ message: 'No media found in Cloudinary folder' });
    }

    // Pick next item
    const postItem = assets[0];

    const payload = {
      post: {
        accountId: accountId,
        content: {
          text: postItem.caption,
          mediaUrls: [postItem.secureUrl],
          platform: 'instagram',
        },
        target: {
          targetType: 'instagram',
          firstComment: '✨ Instant Access: https://desidreams.fun',
        },
      },
    };

    const blotatoResponse = await fetch('https://backend.blotato.com/v2/posts', {
      method: 'POST',
      headers: {
        'blotato-api-key': apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
