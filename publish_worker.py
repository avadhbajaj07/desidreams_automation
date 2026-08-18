"""
Publish Worker
Fetches the next pending post from queue and publishes it via Blotato API to Instagram (@desidreams.fun)
"""

import os
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

BLOTATO_API_KEY = os.getenv("BLOTATO_API_KEY")
BLOTATO_ACCOUNT_ID = os.getenv("BLOTATO_ACCOUNT_ID")
BLOTATO_API_URL = "https://api.blotato.com/v1/posts"

def publish_via_blotato(media_url: str, media_type: str, caption: str):
    """Sends publish request to Blotato API."""
    headers = {
        "Authorization": f"Bearer {BLOTATO_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "accountId": BLOTATO_ACCOUNT_ID,
        "mediaType": media_type,   # "REEL" or "IMAGE"
        "mediaUrl": media_url,     # Cloudinary direct HTTPS CDN URL
        "caption": caption,
        "firstComment": "✨ Instant Access: https://desidreams.fun (Direct Link)"
    }
    
    response = requests.post(BLOTATO_API_URL, json=payload, headers=headers, timeout=60)
    return response

def run_worker():
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # Mode A: Supabase Queue
    if supabase_url and "your-project" not in supabase_url:
        supabase: Client = create_client(supabase_url, supabase_key)
        res = supabase.table("instagram_queue").select("*").eq("status", "pending").order("id", desc=False).limit(1).execute()
        
        if not res.data:
            print("ℹ️ No pending posts in Supabase queue.")
            return
            
        post = res.data[0]
        print(f"🚀 Publishing [{post['media_type']}] ID #{post['id']} to Instagram...")
        
        resp = publish_via_blotato(post["media_url"], post["media_type"], post["caption"])
        
        if resp.status_code in [200, 201]:
            result = resp.json()
            post_id = result.get("id", "success")
            supabase.table("instagram_queue").update({
                "status": "posted",
                "posted_at": datetime.utcnow().isoformat(),
                "blotato_post_id": str(post_id)
            }).eq("id", post["id"]).execute()
            print(f"✅ Published successfully! Blotato Post ID: {post_id}")
        else:
            print(f"❌ Failed to publish: {resp.status_code} - {resp.text}")
            supabase.table("instagram_queue").update({
                "status": "failed",
                "error_log": resp.text
            }).eq("id", post["id"]).execute()

    # Mode B: Local queue.json fallback
    elif os.path.exists("queue.json"):
        with open("queue.json", "r") as f:
            items = json.load(f)
            
        pending_items = [i for i in items if i.get("status") == "pending"]
        if not pending_items:
            print("ℹ️ No pending posts in queue.json.")
            return
            
        post = pending_items[0]
        print(f"🚀 Publishing [{post['media_type']}] {post['public_id']} to Instagram...")
        resp = publish_via_blotato(post["media_url"], post["media_type"], post["caption"])
        
        if resp.status_code in [200, 201]:
            post["status"] = "posted"
            post["posted_at"] = datetime.utcnow().isoformat()
            with open("queue.json", "w") as f:
                json.dump(items, f, indent=2)
            print("✅ Published successfully and updated queue.json!")
        else:
            print(f"❌ Failed to publish: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    run_worker()
