import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildVtoPrompt } from "./vtoPrompt";

const MODEL_NAME = "gemini-2.5-flash-image";

type VtoImage = { data: Buffer; mimeType?: string };

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

async function normalizeImageToPng(image: VtoImage): Promise<VtoImage> {
  const sharp = (await import("sharp")).default;
  // Preserve original dimensions; only convert to PNG with compression
  const pngBuffer = await sharp(image.data)
    .png({ compressionLevel: 9 })
    .toBuffer();
  return { data: pngBuffer, mimeType: "image/png" };
}

async function toInlinePart(image: VtoImage) {
  const normalized = await normalizeImageToPng(image);
  return {
    inlineData: {
      data: normalized.data.toString("base64"),
      mimeType: normalized.mimeType || "image/png",
    },
  };
}

export async function runVtoGeneration({
  avatar,
  upperwear,
  lowerwear,
  dress,
  layering,
  footwear,
  accessories,
}: {
  avatar: VtoImage;
  upperwear?: VtoImage;
  lowerwear?: VtoImage;
  dress?: VtoImage;
  layering?: VtoImage;
  footwear?: VtoImage;
  accessories?: VtoImage[];
}): Promise<Buffer> {
  if (!avatar) {
    throw new Error("Avatar image is required for VTO");
  }

  const prompt = buildVtoPrompt();
  const client = getClient();
  const model = client.getGenerativeModel({ model: MODEL_NAME });
  console.log("VTO model:", MODEL_NAME);

  const parts: any[] = [];

  // 1. Core instruction - short and direct
  parts.push({
    text: `${prompt}

---
CLOTHING REFERENCES (copy these exactly - same color, pattern, texture, fit, no styling changes):`,
  });

  // 2. Clothing images with minimal labels
  const useDress = Boolean(dress);
  if (useDress && dress) {
    parts.push({ text: "DRESS (exact copy):" });
    parts.push(await toInlinePart(dress));
  } else {
    if (upperwear) {
      parts.push({ text: "TOP (exact copy - no tucking):" });
      parts.push(await toInlinePart(upperwear));
    }
    if (lowerwear) {
      parts.push({ text: "BOTTOM (exact copy - no cuffing/rolling):" });
      parts.push(await toInlinePart(lowerwear));
    }
  }
  if (layering) {
    parts.push({ text: "LAYER (exact copy):" });
    parts.push(await toInlinePart(layering));
  }
  if (footwear) {
    parts.push({ text: "FOOTWEAR (exact copy):" });
    parts.push(await toInlinePart(footwear));
  }
  if (accessories && accessories.length > 0) {
    for (let i = 0; i < accessories.length; i++) {
      parts.push({ text: `ACCESSORY ${i + 1} (exact copy):` });
      parts.push(await toInlinePart(accessories[i]));
    }
  }

  // 3. Avatar - the sacred base
  parts.push({
    text: `---
AVATAR (sacred - preserve exactly):
This person's face, skin tone, body, pose = UNCHANGED.
Full body head-to-feet.`,
  });
  parts.push(await toInlinePart(avatar));

  // 4. Final instruction - concise
  parts.push({
    text: `---
OUTPUT: One image. Same person as avatar. Wearing exact copies of the clothes, footwear, and accessories above.
NO styling changes. NO tucking. NO rolling. NO modifications to garments.
Clothes, footwear, and accessories must match references exactly: color, pattern, texture, silhouette, every detail.`,
  });

  // Retry up to 3 times for transient 500 errors
  let result;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      result = await model.generateContent(parts);
      break;
    } catch (err: any) {
      lastError = err;
      const is500 = err?.message?.includes("500") || err?.status === 500;
      if (is500 && attempt < 3) {
        console.log(`VTO attempt ${attempt} failed with 500, retrying...`);
        await new Promise((r) => setTimeout(r, 1000 * attempt)); // backoff
        continue;
      }
      throw err;
    }
  }
  if (!result) throw lastError;
  const response = await result.response;

  const imageInline = response.candidates
    ?.flatMap((candidate) => candidate.content.parts)
    .find((part) => part.inlineData)?.inlineData;

  if (!imageInline?.data) {
    const redacted = response.candidates?.map((c) => ({
      content: {
        parts: c.content.parts.map((p) =>
          p.inlineData
            ? { inlineData: "<image>" }
            : p.text
            ? { text: p.text }
            : p
        ),
      },
    }));
    console.log("VTO no-image response", JSON.stringify(redacted, null, 2));
    throw new Error("Gemini did not return an image");
  }

  return Buffer.from(imageInline.data, "base64");
}
