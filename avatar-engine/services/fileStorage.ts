import fs from "fs/promises";
import path from "path";

const AVATAR_DIR = path.join(process.cwd(), "public", "avatars");

export async function saveAvatar(userId: string, data: Buffer): Promise<string> {
  await fs.mkdir(AVATAR_DIR, { recursive: true });
  const filePath = path.join(AVATAR_DIR, `${userId}.png`);
  await fs.writeFile(filePath, data);
  return `/avatars/${userId}.png`;
}

