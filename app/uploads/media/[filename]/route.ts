import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Function to get the persistent upload directory
function getUploadDir() {
  return process.env.PERSISTENT_STORAGE_DIR || path.join(process.cwd(), "..", "glvia_persistent_uploads");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename) return new NextResponse("File not found", { status: 404 });

  // Clean filename to prevent path traversal attack (e.g. "../../../etc/passwd")
  const cleanFilename = path.basename(filename);
  const filePath = path.join(getUploadDir(), cleanFilename);

  if (!fs.existsSync(filePath)) {
    // If the file is not found in the persistent directory,
    // check if it exists in the original public/uploads/media directory for backward compatibility
    const oldFilePath = path.join(process.cwd(), "public", "uploads", "media", cleanFilename);
    if (!fs.existsSync(oldFilePath)) {
      return new NextResponse("File not found", { status: 404 });
    }
    return serveFile(oldFilePath, cleanFilename);
  }

  return serveFile(filePath, cleanFilename);
}

function serveFile(filePath: string, filename: string) {
  const stat = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  // Guess content type
  const ext = path.extname(filename).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".webp") contentType = "image/webp";
  else if (ext === ".gif") contentType = "image/gif";
  else if (ext === ".svg") contentType = "image/svg+xml";
  else if (ext === ".mp4") contentType = "video/mp4";
  else if (ext === ".webm") contentType = "video/webm";

  const res = new NextResponse(fileBuffer);
  res.headers.set("Content-Type", contentType);
  res.headers.set("Content-Length", stat.size.toString());
  res.headers.set("Cache-Control", "public, max-age=86400"); // Cache for 1 day
  
  return res;
}
