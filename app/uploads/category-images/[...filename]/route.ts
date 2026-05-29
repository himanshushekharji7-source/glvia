import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getUploadDir() {
  return process.env.PERSISTENT_STORAGE_DIR || path.join(process.cwd(), "..", "glvia_persistent_uploads");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  const { filename } = await params;
  if (!filename || filename.length === 0) return new NextResponse("File not found", { status: 404 });

  // Prevent path traversal attacks (ensure no segment is '..' or '.')
  if (filename.some(segment => segment === ".." || segment === ".")) {
    return new NextResponse("Invalid file path", { status: 400 });
  }

  const filePath = path.join(getUploadDir(), "category-images", ...filename);

  if (!fs.existsSync(filePath)) {
    // Check in original public/uploads/category-images for backward compatibility (root level only)
    const cleanFilename = filename[filename.length - 1];
    const oldFilePath = path.join(process.cwd(), "public", "uploads", "category-images", cleanFilename);
    if (!fs.existsSync(oldFilePath)) {
      return new NextResponse("File not found", { status: 404 });
    }
    return serveFile(oldFilePath, cleanFilename);
  }

  return serveFile(filePath, filename[filename.length - 1]);
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

  const res = new NextResponse(fileBuffer);
  res.headers.set("Content-Type", contentType);
  res.headers.set("Content-Length", stat.size.toString());
  res.headers.set("Cache-Control", "public, max-age=86400"); // Cache for 1 day
  
  return res;
}
