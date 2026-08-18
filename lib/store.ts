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

// Default caption templates
const CAPTION_HOOKS = [
  "✨ Aesthetic dreams you don't want to miss.",
  "🌟 Bringing you the finest vibes everyday.",
  "💫 Pure aesthetic inspiration for your daily feed.",
  "🔥 Unlocking the ultimate collection. Don't miss out.",
  "💎 Exclusively crafted for the true dreamers."
];

const HASHTAGS = "#desidreams #aesthetic #reelsindia #trending #viralreels #dailyinspiration #explorepage";

export async function fetchCloudinaryAssets(folderName = 'desi dreams sober'): Promise<MediaItem[]> {
  const mediaItems: MediaItem[] = [];

  try {
    // Search both the specific folder and any matching tags/ids
    const expression = `folder:"${folderName}" OR folder:"${folderName}/*" OR public_id:desi_dreams*`;
    
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
        folder: item.folder || folderName,
        createdAt: item.created_at || new Date().toISOString(),
      });
    });

    return mediaItems;
  } catch (error) {
    console.error('Error querying Cloudinary:', error);
    throw error;
  }
}
