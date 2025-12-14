import { NextRequest, NextResponse } from "next/server";
import { runVtoGeneration } from "@/avatar-engine/services/vtoClient";
import {
  getUserProfile,
  getAvatarImageBuffer,
  uploadVtoOutput,
} from "@/avatar-engine/services/supabaseClient";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

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

async function urlToImage(url: string): Promise<ImageInput | undefined> {
  if (!url) return undefined;
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";
    return { data: Buffer.from(arrayBuffer), mimeType: contentType };
  } catch {
    return undefined;
  }
}

async function normalizeAvatarToPng(image: ImageInput): Promise<ImageInput> {
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

    // Get user_id - required
    const userId = formData.get("user_id");
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, message: "user_id is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch user profile from Supabase
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return NextResponse.json(
        { success: false, message: `User not found with id: ${userId}` },
        { status: 404, headers: corsHeaders }
      );
    }

    if (!userProfile.avatar_image_url) {
      return NextResponse.json(
        {
          success: false,
          message: "User does not have an avatar image. Please generate one first.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch avatar image from Supabase storage
    let avatarImage: ImageInput | undefined;
    try {
      const avatarBuffer = await getAvatarImageBuffer(userProfile.avatar_image_url);
      avatarImage = { data: avatarBuffer, mimeType: "image/png" };
    } catch (err) {
      console.error("Failed to fetch avatar image:", err);
      return NextResponse.json(
        { success: false, message: "Failed to fetch avatar image from storage" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Get garment images from form data
    // Support both file uploads and URLs
    const upperwearFile = formData.get("upperwear");
    const upperwearUrl = formData.get("upperwear_url");
    const lowerwearFile = formData.get("lowerwear");
    const lowerwearUrl = formData.get("lowerwear_url");
    const dressFile = formData.get("dress");
    const dressUrl = formData.get("dress_url");
    const layeringFile = formData.get("layering");
    const layeringUrl = formData.get("layering_url");
    const footwearFile = formData.get("footwear");
    const footwearUrl = formData.get("footwear_url");

    // Handle multiple accessories
    const accessoryFiles: File[] = [];
    const accessoryUrls: string[] = [];
    
    // Get all accessory files (accessory, accessory_1, accessory_2, etc.)
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("accessory") && !key.includes("url") && value instanceof File) {
        accessoryFiles.push(value);
      }
      if (key.startsWith("accessory") && key.includes("url") && typeof value === "string") {
        accessoryUrls.push(value);
      }
    }

    // Process images - prefer file uploads over URLs
    const upperwear =
      (upperwearFile instanceof File ? await fileToImage(upperwearFile) : null) ||
      (typeof upperwearUrl === "string" ? await urlToImage(upperwearUrl) : undefined);
    
    const lowerwear =
      (lowerwearFile instanceof File ? await fileToImage(lowerwearFile) : null) ||
      (typeof lowerwearUrl === "string" ? await urlToImage(lowerwearUrl) : undefined);
    
    const dress =
      (dressFile instanceof File ? await fileToImage(dressFile) : null) ||
      (typeof dressUrl === "string" ? await urlToImage(dressUrl) : undefined);
    
    const layering =
      (layeringFile instanceof File ? await fileToImage(layeringFile) : null) ||
      (typeof layeringUrl === "string" ? await urlToImage(layeringUrl) : undefined);
    
    const footwear =
      (footwearFile instanceof File ? await fileToImage(footwearFile) : null) ||
      (typeof footwearUrl === "string" ? await urlToImage(footwearUrl) : undefined);

    // Process accessories
    const accessories: ImageInput[] = [];
    for (const file of accessoryFiles) {
      const img = await fileToImage(file);
      if (img) accessories.push(img);
    }
    for (const url of accessoryUrls) {
      const img = await urlToImage(url);
      if (img) accessories.push(img);
    }

    // Normalize avatar
    const normalizedAvatar = await normalizeAvatarToPng(avatarImage);

    // Normalize garments
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

    // Check if at least one garment is provided
    const hasGarment =
      Boolean(dress) ||
      Boolean(upperwear) ||
      Boolean(lowerwear) ||
      Boolean(layering) ||
      Boolean(footwear) ||
      accessories.length > 0;

    if (!hasGarment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "At least one garment image is required (upperwear, lowerwear, dress, layering, footwear, or accessories)",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const useDress = Boolean(dress);

    console.log("VTO generation starting for user:", userId);
    console.log("Garments:", {
      upperwear: Boolean(upperwear),
      lowerwear: Boolean(lowerwear),
      dress: Boolean(dress),
      layering: Boolean(layering),
      footwear: Boolean(footwear),
      accessories: accessories.length,
    });

    // Run VTO generation
    const outputBuffer = await runVtoGeneration({
      avatar: normalizedAvatar,
      upperwear: useDress ? undefined : upperwearPng,
      lowerwear: useDress ? undefined : lowerwearPng,
      dress: dressPng || undefined,
      layering: layeringPng,
      footwear: footwearPng,
      accessories: accessoriesPng.length > 0 ? accessoriesPng : undefined,
    });

    // Generate unique filename
    const outputFilename = `vto-${uuidv4()}.png`;

    // Upload to Supabase storage
    let downloadUrl: string;
    try {
      downloadUrl = await uploadVtoOutput(outputBuffer, userId, outputFilename);
    } catch (err) {
      console.error("Failed to upload VTO output:", err);
      // Fallback to base64 if upload fails
      const base64 = outputBuffer.toString("base64");
      return NextResponse.json(
        {
          success: true,
          message: "VTO generated successfully (storage upload failed, returning base64)",
          image: base64,
          dataUrl: `data:image/png;base64,${base64}`,
          downloadUrl: null,
        },
        { headers: corsHeaders }
      );
    }

    // Return success response with both base64 and download URL
    const base64 = outputBuffer.toString("base64");

    return NextResponse.json(
      {
        success: true,
        message: "VTO generated successfully",
        image: base64,
        dataUrl: `data:image/png;base64,${base64}`,
        downloadUrl: downloadUrl,
        userId: userId,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("VTO generation failed", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : errorMessage,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

