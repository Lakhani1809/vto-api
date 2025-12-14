import { NextRequest, NextResponse } from "next/server";
import { runAvatarGeneration } from "@/avatar-engine/services/geminiClient";

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Image file is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const generatedBuffer = await runAvatarGeneration(inputBuffer);
    
    // Return image as base64 for Railway (ephemeral storage)
    const base64Image = generatedBuffer.toString("base64");
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json(
      { 
        success: true, 
        image: base64Image,
        dataUrl: dataUrl 
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Avatar generation failed", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        success: false, 
        message: process.env.NODE_ENV === "production" 
          ? "Internal server error" 
          : errorMessage 
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

