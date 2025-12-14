import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  // Don't cache in production to ensure fresh env vars are read
  if (supabaseClient && process.env.NODE_ENV !== "production") {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Debug logging for Railway
  console.log("Supabase Config Check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey,
    urlPrefix: supabaseUrl?.substring(0, 30),
  });

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Environment variables available:", Object.keys(process.env).filter(k => k.includes("SUPA") || k.includes("GEMINI") || k.includes("VTO")));
    throw new Error(
      "Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseClient;
}

export interface UserProfile {
  id: string;
  avatar_image_url: string | null;
  // Add other fields as needed
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("user_profiles")
    .select("id, avatar_image_url")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

export async function getAvatarImageBuffer(avatarUrl: string): Promise<Buffer> {
  // If it's a Supabase storage URL, we can fetch it directly
  // The URL format is typically: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  
  const response = await fetch(avatarUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch avatar image: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function uploadVtoOutput(
  imageBuffer: Buffer,
  userId: string,
  filename: string
): Promise<string> {
  const supabase = getSupabaseClient();
  const bucketName = process.env.VTO_STORAGE_BUCKET || "VTO-images";
  
  const filePath = `${userId}/${filename}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, imageBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading VTO output:", error);
    throw new Error(`Failed to upload VTO output: ${error.message}`);
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

