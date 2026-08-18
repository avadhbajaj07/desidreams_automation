import { NextResponse } from 'next/server';
import { fetchCloudinaryAssets, MediaItem } from '@/lib/store';

export const dynamic = 'force-dynamic';

// Schedule start date (5 days from setup: Aug 24, 2026)
const SCHEDULE_START_DATE = process.env.SCHEDULE_START_DATE || '2026-08-24T00:00:00Z';

async function publishToPlatform(item: MediaItem, platform: string, apiKey: string) {
  let accountId = process.env.BLOTATO_INSTAGRAM_ACCOUNT_ID || '65790';
  let targetConfig: any = { targetType: 'instagram' };

  if (platform === 'youtube') {
    accountId = process.env.BLOTATO_YOUTUBE_ACCOUNT_ID || '47058';
    targetConfig = {
      targetType: 'youtube',
      title: 'DesiDreams Aesthetic Vibes ✨',
      privacyStatus: 'public',
      shouldNotifySubscribers: true,
    };
  } else if (platform === 'twitter' || platform === 'x') {
    accountId = process.env.BLOTATO_X_ACCOUNT_ID || '24443';
    targetConfig = {
      targetType: 'twitter',
    };
  } else if (platform === 'pinterest') {
    accountId = process.env.BLOTATO_PINTEREST_ACCOUNT_ID || '9234';
    targetConfig = {
      targetType: 'pinterest',
      title: 'DesiDreams Aesthetic Collection',
      link: 'https://desidreams.fun',
    };
  } else {
    // Instagram
    accountId = process.env.BLOTATO_INSTAGRAM_ACCOUNT_ID || '65790';
    targetConfig = {
      targetType: 'instagram',
      firstComment: '✨ Instant Access: https://desidreams.fun (Direct Link)',
    };
  }

  const payload = {
    post: {
      accountId,
      content: {
        text: item.caption,
        mediaUrls: [item.secureUrl],
        platform: platform === 'x' ? 'twitter' : platform,
      },
      target: targetConfig,
    },
  };

  const res = await fetch('https://backend.blotato.com/v2/posts', {
    method: 'POST',
    headers: {
      'blotato-api-key': apiKey.trim(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  return { platform, ok: res.ok, status: res.status, result };
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.BLOTATO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'BLOTATO_API_KEY is missing.' });
    }

    // Check 5-day start delay
    const now = new Date();
    const startDate = new Date(SCHEDULE_START_DATE);
    if (now < startDate) {
      return NextResponse.json({
        success: true,
        message: `Scheduled delay active. Auto-publishing starts after 5 days (${startDate.toDateString()} at 5:00 PM IST).`,
        currentDate: now.toISOString(),
        startDate: startDate.toISOString(),
      });
    }

    const assets = await fetchCloudinaryAssets();
    if (assets.length === 0) {
      return NextResponse.json({ message: 'No media found in Cloudinary' });
    }

    // Prefer videos / reels for all-platform publishing
    const nextItem = assets.find(a => a.mediaType === 'REEL') || assets[0];

    const platformsToPublish = nextItem.mediaType === 'REEL'
      ? ['instagram', 'youtube', 'twitter', 'pinterest']
      : ['instagram', 'twitter', 'pinterest'];

    const publishResults = await Promise.all(
      platformsToPublish.map(p => publishToPlatform(nextItem, p, apiKey))
    );

    return NextResponse.json({
      success: true,
      executedAt: new Date().toISOString(),
      item: nextItem,
      platforms: platformsToPublish,
      results: publishResults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
