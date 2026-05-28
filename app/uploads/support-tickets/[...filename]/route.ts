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
  if (!filename || filename.length === 0) {
    return new NextResponse("File not found", { status: 404 });
  }

  // Prevent path traversal attacks (ensure no segment is '..' or '.')
  if (filename.some(segment => segment === ".." || segment === ".")) {
    return new NextResponse("Invalid file path", { status: 400 });
  }

  const cleanFilename = filename[filename.length - 1];
  const ext = path.extname(cleanFilename).toLowerCase();
  
  // Whitelist extensions strictly
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
  if (!allowedExtensions.includes(ext)) {
    return new NextResponse("Forbidden: File format not supported for support tickets", { status: 403 });
  }

  const filePath = path.join(getUploadDir(), "support-tickets", ...filename);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("File not found", { status: 404 });
  }

  return serveFile(filePath, cleanFilename);
}

function serveFile(filePath: string, filename: string) {
  const stat = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  const ext = path.extname(filename).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".pdf") contentType = "application/pdf";

  const res = new NextResponse(fileBuffer);
  res.headers.set("Content-Type", contentType);
  res.headers.set("Content-Length", stat.size.toString());
  res.headers.set("Cache-Control", "public, max-age=31536000, immutable"); // High performance caching
  
  return res;
}
