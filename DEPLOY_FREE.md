# Deploy ODTED for free — Vercel + Render + Supabase

Total cost: **$0/month**. Cold start on the backend after 15 min idle (Render free tier).

---

## 1. Push to GitHub

In Emergent: click **Save to GitHub** → connect `rahuldec` account → repo name `odted-new` → push.

---

## 2. Deploy backend on Render (FastAPI)

1. Go to https://render.com → Sign up with GitHub.
2. Click **New +** → **Web Service** → Connect repo `rahuldec/odted-new`.
3. Settings:
   - **Name**: `odted-backend`
   - **Region**: Singapore (closest to you / your users)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Plan**: **Free**
4. Add **Environment Variables** (click "Advanced"):
   ```
   SUPABASE_URL=https://rlenfsigkfxppxkskqks.supabase.co
   SUPABASE_SERVICE_KEY=<paste the service_role key you gave earlier>
   SUPABASE_ANON_KEY=<paste the anon key>
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=rahul-ranger
   CORS_ORIGINS=*
   ```
5. Click **Create Web Service**. Wait 3–5 min.
6. Copy the live URL — it'll look like `https://odted-backend.onrender.com`.

---

## 3. Deploy frontend on Vercel (React)

1. Go to https://vercel.com → Sign up with GitHub.
2. Click **Add New… → Project** → Import `rahuldec/odted-new`.
3. Settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`
   - **Install Command**: `yarn install`
4. Add **Environment Variables**:
   ```
   REACT_APP_BACKEND_URL=https://odted-backend.onrender.com
   REACT_APP_SUPABASE_URL=https://rlenfsigkfxppxkskqks.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=<paste anon key>
   REACT_APP_SHEET_ID=1gWH0Gi6aG0MdMcNA-ieJX4vlOJD6s1HfKSEFo6I92ig
   REACT_APP_ADMIN_USERNAME=admin
   REACT_APP_ADMIN_DEFAULT_PASSWORD=rahul-ranger
   ```
5. Click **Deploy**. Wait 2 min.
6. Copy the live URL — e.g. `https://odted-new.vercel.app`. **Done!**

---

## 4. (Optional) Lock CORS

Once Vercel URL is known, go back to Render → Environment → set:
```
CORS_ORIGINS=https://odted-new.vercel.app
```
Save (Render redeploys automatically). Only your Vercel site can call the backend.

---

## Notes / Caveats

- **Cold start**: Render free tier sleeps after 15 min of inactivity. First request after sleep takes ~30s. To keep it warm, add a free uptime monitor (e.g. https://uptimerobot.com hitting `/api/` every 5 min).
- **GitHub auto-deploys**: Both Vercel and Render auto-redeploy on every push to `main`. So future code changes you push from Emergent will go live automatically.
- **Don't commit `.env` files** — they're already in `.gitignore`. Set values in each platform's dashboard.

---

## Live URL hierarchy
- Frontend: `https://odted-new.vercel.app` (the one you share)
- Backend: `https://odted-backend.onrender.com/api/`
- DB / Auth: Supabase
