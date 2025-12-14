import { NextRequest, NextResponse } from "next/server";
import { runVtoGeneration } from "@/avatar-engine/services/vtoClient";
import sharp from "sharp";

export const runtime = "nodejs";

// CORS headers for API access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

type ImageInput = { data: Buffer; mimeType?: string };

async function fileToImage(file: File | null): Promise<ImageInput | undefined> {
  if (!file) return undefined;
  const arrayBuffer = await file.arrayBuffer();
  return { data: Buffer.from(arrayBuffer), mimeType: file.type || "image/png" };
}

async function normalizeAvatarToPng(image: ImageInput): Promise<ImageInput> {
  // Convert to PNG and add a small white border to reduce accidental cropping
  const pngBuffer = await sharp(image.data)
    .extend({
      top: 24,
      bottom: 24,
      left: 12,
      right: 12,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();
  return { data: pngBuffer, mimeType: "image/png" };
}

async function normalizeGarmentToPng(
  image: ImageInput | undefined
): Promise<ImageInput | undefined> {
  if (!image) return undefined;
  const pngBuffer = await sharp(image.data).png().toBuffer();
  return { data: pngBuffer, mimeType: "image/png" };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const avatarFile = formData.get("avatar");
    if (!(avatarFile instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Avatar image is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const upperwearFile = formData.get("upperwear");
    const lowerwearFile = formData.get("lowerwear");
    const dressFile = formData.get("dress");
    const layeringFile = formData.get("layering");
    const footwearFile = formData.get("footwear");

    // Handle multiple accessories
    const accessoryFiles: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("accessory") && value instanceof File) {
        accessoryFiles.push(value);
      }
    }

    const avatar = await fileToImage(avatarFile);
    if (!avatar || avatar.data.length === 0) {
      return NextResponse.json(
        { success: false, message: "Avatar image is empty or unreadable" },
        { status: 400, headers: corsHeaders }
      );
    }
    console.log("VTO avatar received", {
      mime: avatar.mimeType,
      size: avatar.data.length,
    });
    const normalizedAvatar = await normalizeAvatarToPng(avatar);
    const upperwear = await fileToImage(
      upperwearFile instanceof File ? upperwearFile : null
    );
    const lowerwear = await fileToImage(
      lowerwearFile instanceof File ? lowerwearFile : null
    );
    const dress = await fileToImage(dressFile instanceof File ? dressFile : null);
    const layering = await fileToImage(
      layeringFile instanceof File ? layeringFile : null
    );
    const footwear = await fileToImage(
      footwearFile instanceof File ? footwearFile : null
    );

    // Process accessories
    const accessories: ImageInput[] = [];
    for (const file of accessoryFiles) {
      const img = await fileToImage(file);
      if (img) accessories.push(img);
    }

    const upperwearPng = await normalizeGarmentToPng(upperwear);
    const lowerwearPng = await normalizeGarmentToPng(lowerwear);
    const dressPng = await normalizeGarmentToPng(dress);
    const layeringPng = await normalizeGarmentToPng(layering);
    const footwearPng = await normalizeGarmentToPng(footwear);

    const accessoriesPng: ImageInput[] = [];
    for (const acc of accessories) {
      const normalized = await normalizeGarmentToPng(acc);
      if (normalized) accessoriesPng.push(normalized);
    }

    const hasGarment =
      Boolean(dress) ||
      Boolean(upperwear) ||
      Boolean(lowerwear) ||
      Boolean(layering) ||
      Boolean(footwear) ||
      accessories.length > 0;

    if (!hasGarment) {
      return NextResponse.json(
        { success: false, message: "At least one garment image is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const useDress = Boolean(dress);

    const outputBuffer = await runVtoGeneration({
      avatar: normalizedAvatar,
      upperwear: useDress ? undefined : upperwearPng,
      lowerwear: useDress ? undefined : lowerwearPng,
      dress: dressPng || undefined,
      layering: layeringPng,
      footwear: footwearPng,
      accessories: accessoriesPng.length > 0 ? accessoriesPng : undefined,
    });

    const base64 = outputBuffer.toString("base64");

    return NextResponse.json(
      {
        success: true,
        image: base64,
        dataUrl: `data:image/png;base64,${base64}`,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("VTO generation failed", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

