import { NextResponse } from 'next/server';
import { fetchCloudinaryAssets, MediaItem } from '@/lib/store';

export const dynamic = 'force-dynamic';

async function publishToSinglePlatform(item: MediaItem, platform: string, apiKey: string) {
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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = process.env.BLOTATO_API_KEY;
    const platform = body.platform || 'all'; // 'all' | 'instagram' | 'youtube' | 'twitter' | 'pinterest'

    let targetItem = body.item;
    if (!targetItem) {
      const assets = await fetchCloudinaryAssets();
      if (assets.length === 0) {
        return NextResponse.json({ success: false, message: 'No assets found in Cloudinary folder' }, { status: 400 });
      }
      targetItem = assets[0];
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        warning: 'BLOTATO_API_KEY is missing. Please configure it in your environment.',
      }, { status: 400 });
    }

    if (platform === 'all') {
      const platformsToPost = targetItem.mediaType === 'REEL'
        ? ['instagram', 'youtube', 'twitter', 'pinterest']
        : ['instagram', 'twitter', 'pinterest'];

      const publishResults = await Promise.all(
        platformsToPost.map(p => publishToSinglePlatform(targetItem, p, apiKey))
      );

      const successful = publishResults.filter(r => r.ok);
      return NextResponse.json({
        success: successful.length > 0,
        publishedPlatforms: successful.map(s => s.platform),
        results: publishResults,
        item: targetItem,
      });
    }

    // Single platform
    const singleResult = await publishToSinglePlatform(targetItem, platform, apiKey);
    if (!singleResult.ok) {
      return NextResponse.json({
        success: false,
        error: singleResult.result.message || JSON.stringify(singleResult.result),
        raw: singleResult.result,
      }, { status: singleResult.status });
    }

    return NextResponse.json({
      success: true,
      platform,
      publishedItem: targetItem,
      blotatoResult: singleResult.result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to publish' },
      { status: 500 }
    );
  }
}
