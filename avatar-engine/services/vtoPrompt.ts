export function buildVtoPrompt(): string {
  return `VIRTUAL TRY-ON: Place clothing on avatar.

RULES (STRICT):

1. AVATAR = SACRED
   - Same face, skin tone, body shape, pose, background
   - Change NOTHING about the person

2. CLOTHING = EXACT COPY
   - Replicate garments EXACTLY as uploaded
   - Same color, pattern, texture, silhouette, fabric, fit
   - Same buttons, zippers, pockets, seams, logos
   - NO modifications whatsoever

3. NO STYLING
   - NO tucking shirts
   - NO rolling sleeves  
   - NO cuffing pants
   - NO unbuttoning/buttoning
   - Wear garments EXACTLY as shown in reference

4. OUTPUT
   - ONE image only (no collage/grid)
   - Full body: head to feet visible
   - Same framing as avatar

Result: Avatar's exact face/body + exact copy of uploaded clothes.`;
}
