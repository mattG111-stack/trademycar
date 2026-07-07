# How to put TradeMyCar online (no coding needed)

You'll do three things: put the code on GitHub, deploy it on Railway,
and point your domain at it. About 30 minutes, ~US$5/month.

## Step 1 — Put the code on GitHub (the file storage devs use)

1. Go to **github.com** and sign up (free).
2. Click the **+** (top right) → **New repository**. Name it
   `trademycar`, set it to **Private**, click **Create repository**.
3. On the new repo page click **"uploading an existing file"**.
4. On your computer, open the unzipped `trademycar` folder, select
   EVERYTHING inside it, and drag it into the GitHub upload box.
   Wait for it to finish, then click **Commit changes**.

## Step 2 — Deploy on Railway

1. Go to **railway.com** and sign up **with your GitHub account**.
2. Click **New Project** → **Deploy from GitHub repo** → pick
   `trademycar`. It builds automatically (takes a few minutes).
3. Add the storage disk (IMPORTANT — this is where your leads and
   photos live): right-click the service → **Attach Volume** →
   set the mount path to **/app/data**.
4. Add your settings: open the service → **Variables** tab → add:
   - `ADMIN_PASSWORD` → the password for your /admin dashboard
   - later, when you have them: `INQUIRY_EMAIL`, `SMTP_HOST`,
     `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (email), and
     `PLATE_LOOKUP_API_URL`, `PLATE_LOOKUP_API_KEY` (plate lookup)
5. **Settings** tab → **Networking** → **Generate Domain**. You now
   have a live URL like `trademycar-production.up.railway.app` —
   open it and check the site works. Your dashboard is at
   `/admin` (username `admin`, password = what you set above).

## Step 3 — Connect trademycar.co.nz

1. In Railway: **Settings → Networking → Custom Domain** → enter
   `www.trademycar.co.nz`. Railway shows you a CNAME record.
2. Log in to wherever you bought the domain, open its DNS settings,
   and add that CNAME record exactly as shown.
3. Wait up to an hour. HTTPS (the padlock) is automatic.

## Updating the site later

Upload the changed files to the same GitHub repo (same drag-and-drop)
→ Railway redeploys automatically.

## One safety net

In Railway, open the volume and enable **backups** so your leads and
photos are snapshotted. Do this once and forget about it.
