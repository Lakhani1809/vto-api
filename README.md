# Virtual Try-On (VTO) API

Apply clothing and accessories to avatar images using Gemini Flash. This API includes both Avatar Generation and Virtual Try-On functionality.

## API Endpoints

### POST `/api/avatar`

Generate an avatar from a full-body photo.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `image` (image file)

**Response:**
```json
{
  "success": true,
  "image": "base64_encoded_image",
  "dataUrl": "data:image/png;base64,..."
}
```

### POST `/api/vto`

Apply clothing to an avatar image.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `avatar` (required): Avatar image file
  - `upperwear` (optional): Top/shirt image
  - `lowerwear` (optional): Pants/skirt image
  - `dress` (optional): Full dress (overrides upperwear + lowerwear)
  - `layering` (optional): Jacket/hoodie image
  - `accessory` (optional): Accessory image

**Response:**
```json
{
  "success": true,
  "image": "base64_encoded_image"
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
   ```bash
   cp .env.local.example .env.local
   # Set GEMINI_API_KEY in .env.local
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Then open http://localhost:3000

## Test UI

- Visit http://localhost:3000/avatar-test
- Generate an avatar first (optional, or upload your own)
- Upload clothing items (upperwear, lowerwear, dress, layering, accessory)
- Click "Generate VTO" to apply clothing to the avatar
- The result is returned as base64 and displayed in the UI

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variable: `GEMINI_API_KEY`
3. Railway will auto-detect Next.js and deploy
4. Your APIs will be available at:
   - `https://your-app.up.railway.app/api/avatar`
   - `https://your-app.up.railway.app/api/vto`

## Notes

- Uses Gemini Flash (`gemini-2.5-flash-image`) via `@google/generative-ai`
- Images are returned as base64 (no file storage required)
- CORS enabled for API access
- VTO preserves avatar identity exactly (face, skin tone, body shape)
- Clothing is applied exactly as uploaded (no styling modifications)
