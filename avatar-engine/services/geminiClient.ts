import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildAvatarPrompt } from "./avatarPrompt";

const MODEL_NAME = "gemini-2.5-flash-image";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  return new GoogleGenerativeAI(apiKey);
}

export async function runAvatarGeneration(
  inputImageBuffer: Buffer
): Promise<Buffer> {
  const prompt = buildAvatarPrompt();
  const base64Image = inputImageBuffer.toString("base64");

  const client = getClient();
  const model = client.getGenerativeModel({ model: MODEL_NAME });

  const imagePart = {
    inlineData: {
      data: base64Image,
      // Default to png; Gemini accepts common image mime types.
      mimeType: "image/png",
    },
  };

  // Retry up to 3 times on transient errors (e.g., 500)
  let result;
  let lastError: any;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      result = await model.generateContent([prompt, imagePart]);
      break;
    } catch (err: any) {
      lastError = err;
      const is500 =
        err?.message?.includes("500") || err?.status === 500 || err?.code === 500;
      if (is500 && attempt < 3) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
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
    throw new Error("Gemini did not return an image");
  }

  return Buffer.from(imageInline.data, "base64");
}

