import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'qtah71h2',
  api_key: process.env.CLOUDINARY_API_KEY || '655978192581396',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'y5LJaadFIgsux9ihpfy7AxwTOc0',
  secure: true,
});

export interface MediaItem {
  id: string;
  publicId: string;
  secureUrl: string;
  mediaType: 'REEL' | 'IMAGE';
  caption: string;
  status: 'pending' | 'posted' | 'failed';
  folder?: string;
  createdAt: string;
  postedAt?: string;
  blotatoPostId?: string;
}

// Engaging rotating hooks
const CAPTION_HOOKS = [
  "✨ Dream aesthetic vibes you can't miss.",
  "🌟 Bringing you the finest exclusive vibes.",
  "💫 Pure aesthetic inspiration for your daily feed.",
  "🔥 Unlocking the ultimate collection. Check it out.",
  "💎 Exclusively crafted moments for true dreamers."
];

// STRICT LIMIT: Exactly 5 targeted hashtags
const HASHTAGS = "#desidreams #aesthetic #reelsindia #trending #viralreels";

export async function fetchCloudinaryAssets(): Promise<MediaItem[]> {
  const mediaItems: MediaItem[] = [];

  try {
    // Search images and videos across all DesiDreams folders and prefixes
    const expression = 'public_id:dreams_desi* OR public_id:desi_dreams* OR folder:"desi dreams sober" OR folder:"desi_dreams_video" OR folder:"desi_dreams_fun"';
    
    const result = await cloudinary.search
      .expression(expression)
      .sort_by('public_id', 'asc')
      .max_results(500)
      .execute();

    const resources = result.resources || [];
    const websiteUrl = process.env.WEBSITE_URL || 'https://desidreams.fun';
    const ctaTrigger = process.env.CTA_COMMENT_TRIGGER || 'ACCESS';

    resources.forEach((item: any, idx: number) => {
      const isVideo = item.resource_type === 'video';
      const hook = CAPTION_HOOKS[idx % CAPTION_HOOKS.length];
      const caption = `${hook}\n\n👉 Comment "${ctaTrigger}" or visit ${websiteUrl} (Link in bio)\n\n${HASHTAGS}`;

      mediaItems.push({
        id: item.asset_id || item.public_id,
        publicId: item.public_id,
        secureUrl: item.secure_url,
        mediaType: isVideo ? 'REEL' : 'IMAGE',
        caption: caption,
        status: 'pending',
        folder: item.folder || 'desidreams',
        createdAt: item.created_at || new Date().toISOString(),
      });
    });

    return mediaItems;
  } catch (error) {
    console.error('Error querying Cloudinary:', error);
    throw error;
  }
}
