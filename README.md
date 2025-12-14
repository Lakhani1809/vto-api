# Virtual Try-On (VTO) API

Apply clothing and accessories to avatar images using Gemini Flash AI with Supabase integration.

## API Endpoints

### POST `/api/vto`

Apply clothing to an avatar image (direct file upload).

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `avatar` (required): Avatar image file
  - `upperwear` (optional): Top/shirt image
  - `lowerwear` (optional): Pants/skirt image
  - `dress` (optional): Full dress (overrides upperwear + lowerwear)
  - `layering` (optional): Jacket/hoodie image
  - `footwear` (optional): Shoes/footwear image
  - `accessory`, `accessory_0`, `accessory_1`, etc. (optional): Multiple accessory images

**Response:**
```json
{
  "success": true,
  "image": "base64_encoded_image",
  "dataUrl": "data:image/png;base64,..."
}
```

### POST `/api/vto-supabase`

Apply clothing to a user's avatar from Supabase.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `user_id` (required): User ID from `user_profiles` table
  - `upperwear` or `upperwear_url` (optional): Top/shirt image or URL
  - `lowerwear` or `lowerwear_url` (optional): Pants/skirt image or URL
  - `dress` or `dress_url` (optional): Full dress (overrides upperwear + lowerwear)
  - `layering` or `layering_url` (optional): Jacket/hoodie image or URL
  - `footwear` or `footwear_url` (optional): Shoes/footwear image or URL
  - `accessory_0`, `accessory_1`, etc. or `accessory_url_0`, `accessory_url_1`, etc. (optional): Multiple accessory images or URLs

**Response:**
```json
{
  "success": true,
  "message": "VTO generated successfully",
  "image": "base64_encoded_image",
  "dataUrl": "data:image/png;base64,...",
  "downloadUrl": "https://your-supabase-url.supabase.co/storage/v1/object/public/VTO-images/user-id/vto-uuid.png",
  "userId": "user-id"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message"
}
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   
   Create a `.env.local` file with the following variables:
   ```bash
   # Gemini API Key for AI image generation
   GEMINI_API_KEY=your_gemini_api_key_here

   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

   # VTO Output Storage Bucket Name (in Supabase Storage)
   VTO_STORAGE_BUCKET=VTO-images
   ```

3. **Set up Supabase**
   
   - Create a `user_profiles` table with columns:
     - `id` (UUID, primary key)
     - `avatar_image_url` (text, stores the avatar image URL)
   
   - Create a storage bucket named `VTO-images`
   - Make the bucket public for download URLs to work

4. **Run locally**
   ```bash
   npm run dev
   ```
   Then open http://localhost:3000

## Test UI

- Visit http://localhost:3000/vto-test
- Enter a valid `user_id` from your `user_profiles` table
- Upload clothing items (upperwear, lowerwear, dress, layering, footwear, accessories)
- Click "Generate VTO"
- Download the result or copy the download URL

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VTO_STORAGE_BUCKET`
3. Railway will auto-detect Next.js and deploy
4. Your APIs will be available at:
   - `https://your-app.up.railway.app/api/vto`
   - `https://your-app.up.railway.app/api/vto-supabase`

## Notes

- Uses Gemini Flash (`gemini-2.5-flash-image`) via `@google/generative-ai`
- VTO results are stored in Supabase Storage with downloadable URLs
- CORS enabled for API access from any origin
- VTO preserves avatar identity exactly (face, skin tone, body shape)
- Clothing, footwear, and accessories are applied exactly as uploaded
- Supports multiple accessories per request
- Both file uploads and URL inputs supported for garments
