import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
 
// Server-only secret key configuration
const ADMIN_2FA_SECRET = process.env.ADMIN_2FA_SECRET || "a_very_secure_random_server_secret_key_142857";
 
// Initialize server-side Supabase client
const supabaseUrl = process.env.SUPABASE_URL || "https://lrahbavlcjlnkjjqvuwx.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
 
// Cryptographic token helpers
function generateSessionToken(email: string): string {
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  const payload = `${email}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", ADMIN_2FA_SECRET).update(payload).digest("hex");
  return `${payload}:${signature}`;
}
 
function verifySessionToken(token: string): { valid: boolean; email?: string } {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return { valid: false };
    const [email, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    
    // Verify Expiration
    if (Date.now() > expiresAt) return { valid: false };
    
    // Verify Email Constraint (Production hardcoded fallback to brandfasion7@gmail.com)
    const allowedAdminEmail = process.env.ADMIN_EMAIL || "brandfasion7@gmail.com";
    if (email.toLowerCase().trim() !== allowedAdminEmail.toLowerCase().trim()) {
      return { valid: false };
    }
    
    // Verify HMAC Signature
    const payload = `${email}:${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", ADMIN_2FA_SECRET).update(payload).digest("hex");
    if (signature !== expectedSignature) return { valid: false };
    
    return { valid: true, email };
  } catch (err) {
    return { valid: false };
  }
}
 
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
 
    // Fallback securely to brandfasion7@gmail.com
    const allowedAdminEmail = process.env.ADMIN_EMAIL || "brandfasion7@gmail.com";
 
    // -------------------------------------------------------------
    // ACTION 1: CHALLENGE (Get authorized admin phone number)
    // -------------------------------------------------------------
    if (action === "challenge") {
      const { email } = body;
      
      if (!email || email.toLowerCase().trim() !== allowedAdminEmail.toLowerCase().trim()) {
        return NextResponse.json(
          { error: "Access Denied: Email address is not authorized for Admin access." },
          { status: 403 }
        );
      }
 
      // Fetch authorized phone number directly from admin_users table
      const { data, error } = await supabase
        .from("admin_users")
        .select("phone")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();
 
      if (error) {
        console.error("Supabase query error:", error);
      }
 
      // Secure phone mapping: Read from DB, fallback to env keys, fallback to help support number
      let rawPhone = data?.phone || process.env.Mobile_number || process.env.ADMIN_PHONE || "+918004642110";
      let adminPhone = rawPhone.trim().replace(/\s+/g, "");
      
      // Auto-format to E.164 standard for Indian mobile numbers
      if (/^\d{10}$/.test(adminPhone)) {
        adminPhone = `+91${adminPhone}`;
      } else if (adminPhone.startsWith("91") && adminPhone.length === 12) {
        adminPhone = `+${adminPhone}`;
      } else if (!adminPhone.startsWith("+")) {
        adminPhone = `+91${adminPhone}`;
      }
      
      const cleanPhone = adminPhone;
      const maskedPhone = cleanPhone.length > 6 
        ? `${cleanPhone.slice(0, 3)} ****** ${cleanPhone.slice(-4)}`
        : cleanPhone;
 
      return NextResponse.json({
        success: true,
        adminPhone: cleanPhone,
        maskedPhone
      });
    }
 
    // -------------------------------------------------------------
    // ACTION 2: VERIFY-SUCCESS (Issue signed HttpOnly Cookie)
    // -------------------------------------------------------------
    if (action === "verify-success") {
      const { email, firebaseUid } = body;
 
      if (!email || email.toLowerCase().trim() !== allowedAdminEmail.toLowerCase().trim() || !firebaseUid) {
        return NextResponse.json(
          { error: "Access Denied: Invalid credentials or session token." },
          { status: 403 }
        );
      }
 
      // Generate stateless Cryptographically Signed Session Token
      const token = generateSessionToken(email);
 
      // Store in HttpOnly Secure SameSite=Strict Cookie
      const cookieStore = await cookies();
      cookieStore.set({
        name: "admin_2fa_session",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7200, // 2 hours
        path: "/",
      });
 
      return NextResponse.json({
        success: true,
        token // Return token for fallback sessionStorage UI state convenience
      });
    }
 
    // -------------------------------------------------------------
    // ACTION 3: VERIFY-SESSION (Verify cookie token server-side)
    // -------------------------------------------------------------
    if (action === "verify-session") {
      const { token } = body; // fallback if cookie is missing
 
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get("admin_2fa_session")?.value;
      const verifyToken = sessionCookie || token;
 
      if (!verifyToken) {
        return NextResponse.json({ valid: false, error: "No active session found" });
      }
 
      const result = verifySessionToken(verifyToken);
      if (result.valid) {
        return NextResponse.json({ valid: true, email: result.email });
      } else {
        // Clear corrupt or expired cookie
        cookieStore.delete("admin_2fa_session");
        return NextResponse.json({ valid: false, error: "Invalid or expired session" });
      }
    }
 
    // -------------------------------------------------------------
    // ACTION 4: LOGOUT (Clear Cookie)
    // -------------------------------------------------------------
    if (action === "logout") {
      const cookieStore = await cookies();
      cookieStore.delete("admin_2fa_session");
      return NextResponse.json({ success: true });
    }
 
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("2FA API Route error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
