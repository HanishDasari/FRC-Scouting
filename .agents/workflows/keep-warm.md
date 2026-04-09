---
description: Prevent Render Free Tier from Sleeping
---

Render's free tier services go to sleep after 15 minutes of inactivity. This leads to slow "spin-up" times (60s+) for the next user. To prevent this, follow these steps to set up a "Keep-Warm" ping.

### 1. Identify your Health Endpoint
The app now has a lightweight health check at:
`https://your-app-name.onrender.com/api/health`

### 2. Set up a pinger (Recommended: Cron-job.org)
1. Go to [cron-job.org](https://cron-job.org) and create a free account.
2. Click **"Create Cronjob"**.
3. **Title**: `FRC Scouting Keep-Warm`
4. **URL**: `https://your-app-name.onrender.com/api/health` (Replace with your actual Render URL).
5. **Execution schedule**: Every **14 minutes** (Render sleeps after 15m).
6. **Save**.

### 3. Alternative: UptimeRobot
1. Go to [UptimeRobot.com](https://uptimerobot.com).
2. Create a **New Monitor**.
3. **Monitor Type**: HTTP(s).
4. **Friendly Name**: `FRC Scouting`.
5. **URL (or IP)**: `https://your-app-name.onrender.com/api/health`.
6. **Monitoring Interval**: Every 5 minutes.

### 4. Update Render Settings (Optional but Recommended)
1. Go to your Render Dashboard.
2. Select your Web Service.
3. Go to **Settings**.
4. Find **Health Check Path**.
5. Change it from `/` to `/api/health`.
6. Click **Save Changes**.

This ensures Render uses the fastest possible endpoint to verify your app is running.
