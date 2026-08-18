"""
Sync Cloudinary Assets to Instagram Queue
Reads all videos & images from the specified Cloudinary folder ('desi dreams sober'),
generates high-converting captions with website CTAs, and populates the database queue.
"""

import os
import json
import urllib.parse
from dotenv import load_dotenv
import cloudinary
import cloudinary.api
import cloudinary.search
from supabase import create_client, Client

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

FOLDER_NAME = os.getenv("CLOUDINARY_FOLDER", "desi dreams sober")
WEBSITE_URL = os.getenv("WEBSITE_URL", "https://desidreams.fun")
CTA_TRIGGER = os.getenv("CTA_COMMENT_TRIGGER", "ACCESS")

# Standard rotating captions & hooks for high engagement
CAPTION_TEMPLATES = [
    "✨ Dream aesthetic moments you don't want to miss.",
    "🌟 Bringing you the finest vibes everyday.",
    "💫 Pure aesthetic inspiration for your daily feed.",
    "🔥 Unlocking the ultimate collection. Don't wait.",
    "💎 Exclusively crafted for the true dreamers."
]

HASHTAGS = "#desidreams #aesthetic #reelsindia #trending #viralreels #dailyinspiration #explorepage"

def fetch_cloudinary_media(folder_name: str):
    """Fetches all images and videos inside the specified Cloudinary folder."""
    print(f"🔍 Searching Cloudinary folder: '{folder_name}'...")
    
    media_items = []
    
    # Cloudinary search expression supports folder prefix search
    # Handles folder names with spaces
    expression = f'folder:"{folder_name}" OR folder:"{folder_name}/*"'
    
    try:
        # Search both images and videos
        result = cloudinary.search.Search()\
            .expression(expression)\
            .sort_by('public_id', 'asc')\
            .max_results(500)\
            .execute()
        
        resources = result.get('resources', [])
        print(f"✅ Found {len(resources)} assets in Cloudinary.")
        
        for idx, item in enumerate(resources):
            res_type = item.get('resource_type') # 'video' or 'image'
            media_type = 'REEL' if res_type == 'video' else 'IMAGE'
            secure_url = item.get('secure_url')
            public_id = item.get('public_id')
            
            # Select rotating caption template
            template = CAPTION_TEMPLATES[idx % len(CAPTION_TEMPLATES)]
            caption = f"{template}\n\n👉 Comment '{CTA_TRIGGER}' or visit {WEBSITE_URL} (Link in bio)\n\n{HASHTAGS}"
            
            media_items.append({
                "public_id": public_id,
                "media_url": secure_url,
                "media_type": media_type,
                "caption": caption,
                "status": "pending"
            })
            
        return media_items
        
    except Exception as e:
        print(f"❌ Error fetching from Cloudinary: {e}")
        return []

def save_to_supabase(items):
    """Saves media items into Supabase queue table."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or "your-project" in supabase_url:
        print("⚠️ Supabase credentials not set. Saving queue to local file 'queue.json' instead.")
        with open("queue.json", "w") as f:
            json.dump(items, f, indent=2)
        print(f"📁 Saved {len(items)} items to 'queue.json'.")
        return

    supabase: Client = create_client(supabase_url, supabase_key)
    print(f"📤 Uploading {len(items)} items to Supabase 'instagram_queue' table...")
    
    for item in items:
        # Check if already in queue to avoid duplicates
        existing = supabase.table("instagram_queue").select("id").eq("media_url", item["media_url"]).execute()
        if not existing.data:
            supabase.table("instagram_queue").insert({
                "media_url": item["media_url"],
                "media_type": item["media_type"],
                "caption": item["caption"],
                "status": "pending"
            }).execute()
            print(f"  + Queued [{item['media_type']}]: {item['public_id']}")
        else:
            print(f"  - Already exists: {item['public_id']}")

if __name__ == "__main__":
    items = fetch_cloudinary_media(FOLDER_NAME)
    if items:
        save_to_supabase(items)
