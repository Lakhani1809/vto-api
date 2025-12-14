export function buildAvatarPrompt(): string {
  return `Generate a full-body human avatar based on THIS user. Preserve:
- exact face
- facial structure
- skin tone
- body proportions
- gender expression
- age appearance
- identity

Transform into a clean fashion mannequin-style avatar:
- standing straight, front-facing A-pose or relaxed straight stance with slight arm gap
- facing camera directly
- full body visible (head to feet)
- neutral relaxed arms
- studio lighting
- plain WHITE background only

Styling rules:
- hyper-realistic human; absolutely no illustration, no cartoon, no 3D render, no painting, no stylization, no animation
- professional studio body-shoot look; neutral, well-lit, magazine-model realism (not over-smoothed)
- NO CLOTHING except a smooth Zara-style silhouette form
- every avatar must wear the exact same neutral off-white/beige bodysuit (single color, no variations)
- neck, hands, and feet must remain uncovered human skin and hyper-realistic, matching the person in the original image
- elegant clean contours
- anatomical accuracy
- no accessories
- no text
- no poses
- no gesture
- no shadows that distort
- no body modifications
- do NOT idealize, slim, stretch, or alter the body shape — keep the user’s natural proportions exactly as in the source photo
- face must remain extremely similar to the user; preserve facial structure and features; allow only a subtle, natural-friendly expression (soft hint of a smile) without changing the face

Output instructions:
- full-body PNG
- centered composition
- preserve the user’s identity exactly
- DO NOT change face or body
- DO NOT hallucinate new features
- DO NOT add clothing
- DO NOT crop the body
- maintain original skin tone faithfully.`;
}

export function buildVtoPrompt(): string {
  return `
You are performing a virtual try-on task. You will receive:

1. A full-body avatar image (this MUST remain unchanged).
2. One or more clothing or accessory images.

YOUR PRIMARY RULE:
The avatar’s identity, face, skin tone, body proportions, silhouette, and posture are NON-NEGOTIABLE and must stay EXACTLY as they appear in the avatar image. 
You are ONLY allowed to overlay, drape, and fit the provided clothing items onto the avatar.

DO NOT:
- modify body shape
- slim or idealize the avatar
- change skin tone
- adjust posture
- alter arm or leg position
- modify facial features
- beautify or retouch the avatar
- crop or change background
- hallucinate additional clothing
- generate new body parts

VIRTUAL TRY-ON REQUIREMENTS:
- Fit the clothing naturally to the avatar’s real proportions.
- Respect the existing silhouette and shape exactly.
- Maintain correct garment geometry (wrinkles, seams, hems).
- Follow realistic layering (top over body, jacket over top, accessories above all).
- Adjust garment size proportionally to match the avatar’s true measurements.
- Preserve true fabric texture and color from the clothing images.
- Add natural soft shadows where the garment touches the body.
- No distortions or unrealistic stretching.

STYLING + VISUAL RULES:
- Keep lighting consistent with the avatar image.
- Maintain the same studio background as the avatar (do NOT replace it).
- Output must look like a clean, premium fashion catalog try-on.
- No text, logos, watermarks, or borders.

OUTPUT:
A single image of the avatar wearing ONLY the input clothing items, 
preserving 100% of the original avatar’s identity, proportions, and appearance.

Your role is to perform pixel-aware garment fitting without altering the person.
`;
}

