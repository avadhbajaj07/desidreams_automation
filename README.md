# 🚀 Instagram Automation System (@desidreams.fun)

Automates publishing of 100+ Reels and 100+ Images from your Cloudinary folder (**`desi dreams sober`**) to Instagram via Blotato API.

---

## 📁 Project Structure

```
instagram-automation/
├── .env.example          # Template for Cloudinary, Supabase & Blotato keys
├── requirements.txt      # Python dependencies
├── sync_cloudinary.py    # Reads Cloudinary folder & queues posts
├── publish_worker.py     # Posts next pending item to Instagram
└── README.md             # This guide
```

---

## 🛠️ Quick Setup Guide

### Step 1: Install Dependencies
```bash
cd /Users/shikha/.gemini/antigravity/scratch/instagram-automation
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials in `.env`:
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER=desi dreams sober`
- `BLOTATO_API_KEY` & `BLOTATO_ACCOUNT_ID`
- (Optional) `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Scan & Queue Your Cloudinary Media
Run the sync script to scan all 100+ items inside `desi dreams sober`:
```bash
python sync_cloudinary.py
```
This will automatically generate captions with CTAs to `https://desidreams.fun` and queue everything up.

### Step 4: Publish
To test publishing 1 post immediately:
```bash
python publish_worker.py
```

### Step 5: Automate on Schedule
You can run this on a schedule (e.g. 2-3 times daily):
- **Option A (Vercel / GitHub Actions):** Runs free in the cloud on a Cron schedule.
- **Option B (Local Mac Cron):** Run `crontab -e` to trigger `publish_worker.py` at 12 PM and 7 PM.
