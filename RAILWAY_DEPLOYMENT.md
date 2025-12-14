# Railway Deployment Guide

## Step-by-Step: Deploy Avatar API to Railway

### Prerequisites
- GitHub account with the repository pushed (already done ✅)
- Railway account (sign up at https://railway.app)

---

## Step 1: Create Railway Account & Project

1. **Sign up/Login to Railway**
   - Go to https://railway.app
   - Sign up with GitHub (recommended) or email
   - Complete account setup

2. **Create New Project**
   - Click "New Project" in Railway dashboard
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub account
   - Select repository: `Lakhani1809/avatar_vto`
   - Railway will automatically detect it's a Next.js project

---

## Step 2: Configure Environment Variables

1. **In Railway Dashboard:**
   - Click on your project
   - Go to the "Variables" tab
   - Click "New Variable"

2. **Add Required Variables:**
   ```
   GEMINI_API_KEY = AIzaSyDLis1cmG1Zcjs_Bg23-duoaAIelcQ6F8E
   NODE_ENV = production
   PORT = 3000
   ```

3. **Save Variables**
   - Railway will automatically redeploy when you save

---

## Step 3: Configure Build Settings (Optional)

Railway auto-detects Next.js, but you can verify:

1. **In Railway Dashboard:**
   - Go to your service
   - Click "Settings" tab
   - Verify:
     - **Build Command**: `npm run build` (or leave empty for auto-detect)
     - **Start Command**: `npm start` (or leave empty for auto-detect)
     - **Root Directory**: `/` (root of repo)

---

## Step 4: Deploy

1. **Railway will automatically:**
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build the project (`npm run build`)
   - Start the server (`npm start`)

2. **Monitor Deployment:**
   - Watch the "Deployments" tab for build logs
   - Check for any errors in the logs
   - Deployment typically takes 2-5 minutes

---

## Step 5: Get Your API URL

1. **After successful deployment:**
   - Railway provides a default domain: `your-project-name.up.railway.app`
   - Go to "Settings" → "Domains" to see your URL
   - Or click "Generate Domain" for a custom domain

2. **Your Avatar API endpoint will be:**
   ```
   POST https://your-project-name.up.railway.app/api/avatar
   ```

---

## Step 6: Test the Avatar API

### Using cURL:
```bash
curl -X POST https://your-project-name.up.railway.app/api/avatar \
  -F "image=@/path/to/your/image.jpg" \
  -H "Content-Type: multipart/form-data"
```

### Using JavaScript/Fetch:
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('https://your-project-name.up.railway.app/api/avatar', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.avatarUrl); // e.g., "/avatars/uuid.png"
```

### Expected Response:
```json
{
  "success": true,
  "avatarUrl": "/avatars/123e4567-e89b-12d3-a456-426614174000.png"
}
```

---

## Step 7: Handle File Storage (Important!)

⚠️ **Railway has ephemeral storage** - files in `/public/avatars` will be lost on redeploy.

### Option A: Use Railway Volumes (Recommended for now)
1. In Railway dashboard → Your service → "Volumes" tab
2. Click "Add Volume"
3. Mount path: `/app/public/avatars`
4. This persists files across deployments

### Option B: Use External Storage (Future)
- Consider migrating to:
  - AWS S3
  - Cloudinary
  - Supabase Storage
  - Railway's built-in storage

---

## Step 8: Monitor & Debug

1. **View Logs:**
   - Railway dashboard → "Deployments" → Click on deployment → "View Logs"
   - Or use Railway CLI: `railway logs`

2. **Common Issues:**
   - **Build fails**: Check Node.js version (Railway auto-detects, but you can set in `package.json` engines)
   - **API returns 500**: Check logs for Gemini API errors
   - **Files not persisting**: Use Railway Volumes (see Step 7)

---

## Step 9: Set Up Custom Domain (Optional)

1. In Railway → Settings → Domains
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as instructed
5. Railway will provision SSL automatically

---

## Next Steps: Deploy VTO API

Once Avatar API is working, we'll deploy the VTO functionality in a similar way.

---

## Railway CLI (Optional)

Install Railway CLI for easier management:
```bash
npm i -g @railway/cli
railway login
railway link  # Link to your project
railway up    # Deploy
railway logs  # View logs
```

---

## Cost Considerations

- Railway offers a free tier with $5 credit/month
- Each deployment uses resources
- Monitor usage in Railway dashboard
- Consider upgrading if you exceed free tier

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check deployment logs for specific errors

