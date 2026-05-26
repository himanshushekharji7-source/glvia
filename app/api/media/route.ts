import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define local directory path for storing uploads (outside the repo to prevent git from wiping it)
const UPLOAD_DIR = process.env.PERSISTENT_STORAGE_DIR || path.join(process.cwd(), "..", "glvia_persistent_uploads");

// Helper to determine media type from filename extension
function getMediaType(filename: string): "image" | "video" | "other" {
  const ext = path.extname(filename).toLowerCase();
  const images = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".tiff"];
  const videos = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
  
  if (images.includes(ext)) return "image";
  if (videos.includes(ext)) return "video";
  return "other";
}

// Ensure the directory exists
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * GET: Retrieve list of uploaded files, sorted by newest first
 */
export async function GET() {
  try {
    ensureUploadDir();
    const files = fs.readdirSync(UPLOAD_DIR);
    
    const mediaList = files
      .filter((file) => {
        // Exclude system files/directories
        return !file.startsWith(".") && fs.statSync(path.join(UPLOAD_DIR, file)).isFile();
      })
      .map((file) => {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          url: `/uploads/media/${file}`,
          size: stats.size,
          createdAt: stats.birthtimeMs || stats.mtimeMs,
          updatedAt: stats.mtimeMs,
          type: getMediaType(file),
        };
      })
      // Newest files first
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return NextResponse.json(mediaList);
  } catch (error: any) {
    console.error("Error reading media folder:", error);
    return NextResponse.json(
      { error: "Failed to read media folder: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Upload a file (image or video)
 */
export async function POST(req: NextRequest) {
  try {
    ensureUploadDir();
    
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const originalName = file.name || "unnamed_file";
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-") // replace non-alphanumeric with dashes
      .replace(/-+/g, "-")        // compress multiple dashes
      .replace(/^-|-$/g, "");     // trim dashes from ends

    // Generate unique file name to avoid overwrite
    const uniqueId = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const uniqueFileName = `${baseName}-${uniqueId}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFileName);

    // Convert file to Buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(filePath, buffer);

    const stats = fs.statSync(filePath);
    return NextResponse.json({
      success: true,
      file: {
        name: uniqueFileName,
        url: `/uploads/media/${uniqueFileName}`,
        size: stats.size,
        createdAt: stats.birthtimeMs || stats.mtimeMs,
        updatedAt: stats.mtimeMs,
        type: getMediaType(uniqueFileName),
      }
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove a file from the server
 */
export async function DELETE(req: NextRequest) {
  try {
    ensureUploadDir();
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("name");

    if (!filename) {
      return NextResponse.json({ error: "Filename parameter 'name' is required" }, { status: 400 });
    }

    // Clean filename to prevent path traversal attack (e.g. "../../../etc/passwd")
    const cleanFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, cleanFilename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true, message: `File ${cleanFilename} deleted successfully` });
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file: " + error.message },
      { status: 500 }
    );
  }
}
