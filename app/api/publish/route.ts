import { NextResponse } from 'next/server';
import { fetchCloudinaryAssets } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey = process.env.BLOTATO_API_KEY;
    const platform = body.platform || 'instagram'; // 'instagram' | 'youtube' | 'twitter' | 'pinterest'

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

    // Determine account ID based on platform
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
      
      // Fetch boards if available
      let boardId = body.boardId || process.env.BLOTATO_PINTEREST_BOARD_ID;
      if (!boardId) {
        try {
          const boardsRes = await fetch(`https://backend.blotato.com/v2/users/me/accounts/${accountId}/subaccounts`, {
            headers: { 'blotato-api-key': apiKey.trim() }
          });
          const boardsData = await boardsRes.json();
          if (boardsData.items && boardsData.items.length > 0) {
            boardId = boardsData.items[0].id;
          }
        } catch (e) {
          console.warn('Could not auto-fetch Pinterest board ID:', e);
        }
      }

      targetConfig = {
        targetType: 'pinterest',
        title: 'DesiDreams Aesthetic Collection',
        link: 'https://desidreams.fun',
        ...(boardId ? { boardId } : {}),
      };
    } else {
      // Instagram
      targetConfig = {
        targetType: 'instagram',
        firstComment: '✨ Instant Access: https://desidreams.fun (Direct Link)',
      };
    }

    const payload = {
      post: {
        accountId: accountId,
        content: {
          text: targetItem.caption,
          mediaUrls: [targetItem.secureUrl],
          platform: platform === 'x' ? 'twitter' : platform,
        },
        target: targetConfig,
      },
    };

    // Official Blotato v2 API endpoint
    const blotatoResponse = await fetch('https://backend.blotato.com/v2/posts', {
      method: 'POST',
      headers: {
        'blotato-api-key': apiKey.trim(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await blotatoResponse.json();

    if (!blotatoResponse.ok) {
      return NextResponse.json({
        success: false,
        error: result.message || JSON.stringify(result),
        raw: result,
      }, { status: blotatoResponse.status });
    }

    return NextResponse.json({
      success: true,
      platform,
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
