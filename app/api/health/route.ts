import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const envCheck = {
    SUPABASE_URL: process.env.SUPABASE_URL ? "SET" : "NOT SET",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "NOT SET",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "SET" : "NOT SET",
    VTO_STORAGE_BUCKET: process.env.VTO_STORAGE_BUCKET || "NOT SET (using default)",
    NODE_ENV: process.env.NODE_ENV || "NOT SET",
    // Show first few chars of URL to verify it's correct
    SUPABASE_URL_PREFIX: process.env.SUPABASE_URL?.substring(0, 35) || "N/A",
  };

  const allSet = 
    process.env.SUPABASE_URL && 
    process.env.SUPABASE_SERVICE_ROLE_KEY && 
    process.env.GEMINI_API_KEY;

  return NextResponse.json({
    status: allSet ? "healthy" : "missing_config",
    environment: envCheck,
    timestamp: new Date().toISOString(),
  });
}

