import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define local directory path for storing uploads
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

// Ensure the base directory exists
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// Helper to recursively fetch files with their relative paths
function getFilesRecursively(dir: string, baseDir: string = UPLOAD_DIR): any[] {
  let results: any[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath, baseDir));
    } else {
      if (!file.startsWith(".")) {
        const relativePath = path.relative(baseDir, filePath);
        const urlPath = relativePath.replace(/\\/g, "/");
        results.push({
          name: file,
          url: `/uploads/media/${urlPath}`,
          size: stat.size,
          createdAt: stat.birthtimeMs || stat.mtimeMs,
          updatedAt: stat.mtimeMs,
          type: getMediaType(file),
          relativePath: urlPath,
        });
      }
    }
  });
  return results;
}

/**
 * GET: Retrieve list of uploaded files, sorted by newest first (across all subdirectories)
 */
export async function GET(req: NextRequest) {
  try {
    ensureUploadDir();
    
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const folder = searchParams.get("folder");
    
    let mediaList = getFilesRecursively(UPLOAD_DIR);
    
    // Enforce isolation security logic: Only Super Admins / Admins can see all global uploads.
    // Salon owners & customers can only see their own uploaded media (scoped by folder prefix).
    if (role !== "super-admin" && role !== "admin") {
      if (folder) {
        // Sanitize folder query input to match system standards
        const safeFolder = folder
          .replace(/\\/g, "/")
          .split("/")
          .map(segment => segment.replace(/[^a-zA-Z0-9_-]/g, ""))
          .filter(Boolean)
          .join("/");
          
        if (safeFolder) {
          mediaList = mediaList.filter(file => file.relativePath.startsWith(safeFolder + "/"));
        } else {
          mediaList = [];
        }
      } else {
        mediaList = [];
      }
    }

    // Sort: newest first
    mediaList.sort((a, b) => b.updatedAt - a.updatedAt);

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
 * POST: Upload a file to a specific organized subfolder (e.g. salons/[salon_id], admin, banners, services)
 */
export async function POST(req: NextRequest) {
  try {
    ensureUploadDir();
    
    const { searchParams } = new URL(req.url);
    const formData = await req.formData();
    
    const file = formData.get("file") as File | null;
    const queryFolder = searchParams.get("folder");
    const formFolder = formData.get("folder") as string | null;
    const folder = queryFolder || formFolder || "other";
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Explicit path injection block
    if (folder.includes("..") || folder.includes(".") || folder.includes("\\")) {
      return NextResponse.json({ error: "Access Denied: Unsafe directory path parameter" }, { status: 400 });
    }

    // Sanitize folder path to prevent directory traversal
    const safeFolder = folder
      .replace(/\\/g, "/")
      .split("/")
      .map(segment => segment.replace(/[^a-zA-Z0-9_-]/g, ""))
      .filter(Boolean)
      .join("/");

    // Strict validation for support tickets uploads namespace
    const isSupportTicket = safeFolder.startsWith("support-tickets");
    if (isSupportTicket) {
      // Validate folder pattern matches support-tickets/YYYY/MM strictly
      const folderPattern = /^support-tickets\/\d{4}\/\d{2}$/;
      if (!folderPattern.test(safeFolder)) {
        return NextResponse.json({ error: "Access Denied: Support ticket uploads must strictly match /uploads/support-tickets/YYYY/MM/ structure" }, { status: 400 });
      }
    }

    const originalName = file.name || "unnamed_file";
    const ext = path.extname(originalName).toLowerCase();
    const mime = file.type.toLowerCase();

    // Whitelist check for extensions and MIME types
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

    // Validate BOTH extension and MIME type
    if (!allowedExtensions.includes(ext) || !allowedMimes.includes(mime)) {
      return NextResponse.json({ error: "Upload Rejected: File format is unsupported. Allowed formats: JPG, JPEG, PNG, PDF" }, { status: 400 });
    }

    // Max 5MB hard limit validation
    const maxLimitBytes = 5 * 1024 * 1024;
    if (file.size > maxLimitBytes) {
      return NextResponse.json({ error: "Upload Rejected: File size exceeds the 5MB maximum limit" }, { status: 400 });
    }

    const targetDir = path.join(UPLOAD_DIR, safeFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate unique hashed filename to avoid conflicts and prevent leakage
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 10);
    const uniqueFileName = isSupportTicket
      ? `glvia-ticket-${timestamp}-${randomHex}${ext}`
      : `${path.basename(originalName, ext).toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")}-${timestamp}${ext}`;

    const filePath = path.join(targetDir, uniqueFileName);

    // Convert file to Buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(filePath, buffer);

    const relativePath = path.relative(UPLOAD_DIR, filePath).replace(/\\/g, "/");
    const stats = fs.statSync(filePath);

    // Format output URL dynamically
    const returnUrl = isSupportTicket
      ? `/uploads/${relativePath}` // Returns /uploads/support-tickets/YYYY/MM/glvia-ticket-[ts]-[hex].ext
      : (safeFolder.startsWith("category-images")
          ? `/uploads/${relativePath}` // Returns /uploads/category-images/...
          : `/uploads/media/${relativePath}`);

    return NextResponse.json({
      success: true,
      file: {
        name: uniqueFileName,
        url: returnUrl,
        size: stats.size,
        createdAt: stats.birthtimeMs || stats.mtimeMs,
        updatedAt: stats.mtimeMs,
        type: getMediaType(uniqueFileName),
        relativePath: relativePath,
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
 * DELETE: Remove a file from the server (only allowed for Super Admin or admin roles)
 */
export async function DELETE(req: NextRequest) {
  try {
    ensureUploadDir();
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("name");
    const role = searchParams.get("role");

    // Critical permission constraint: Only super-admin or admin can delete files
    if (role !== "super-admin" && role !== "admin") {
      return NextResponse.json(
        { error: "Access Denied: Only Super Admins can permanently delete files from the media library." },
        { status: 403 }
      );
    }

    if (!filename) {
      return NextResponse.json({ error: "Filename parameter 'name' is required" }, { status: 400 });
    }

    // Clean and validate filename relative path to prevent traversal attacks
    const cleanFilename = filename.replace(/\\/g, "/");
    if (cleanFilename.split("/").some(segment => segment === ".." || segment === ".")) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

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
