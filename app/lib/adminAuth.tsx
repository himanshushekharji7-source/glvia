"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";
import { auth, googleProvider } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from "firebase/auth";

const formatAuthError = (err: any): string => {
  const code = err?.code || "";
  const message = err?.message || "";
  
  if (code === "auth/invalid-credential" || message.includes("invalid-credential")) {
    return "Invalid email or password. If you registered using Google, please sign in with Google.";
  }
  if (code === "auth/user-not-found" || message.includes("user-not-found")) {
    return "No account found with this email.";
  }
  if (code === "auth/wrong-password" || message.includes("wrong-password")) {
    return "Incorrect password. Please try again.";
  }
  if (code === "auth/invalid-email" || message.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code === "auth/too-many-requests" || message.includes("too-many-requests")) {
    return "Too many failed login attempts. Please try again later.";
  }
  if (code === "auth/user-disabled" || message.includes("user-disabled")) {
    return "This account has been disabled.";
  }
  
  return message || "An error occurred during authentication.";
};

interface AdminUser {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
  role: string;
  salon_id?: string | null;
  approval_status: string;
  has_pin: boolean;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string, securityPin?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isSalonOwner: boolean;
  isAdmin: boolean;
  isPinVerified: boolean;
  verifyPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  setupPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  refreshAdminProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  isLoading: true,
  loginWithEmail: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  logout: async () => {},
  isAuthenticated: false,
  isSalonOwner: false,
  isAdmin: false,
  isPinVerified: false,
  verifyPin: async () => ({ success: false }),
  setupPin: async () => ({ success: false }),
  refreshAdminProfile: async () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinVerified, setIsPinVerified] = useState(false);

  // Load initial PIN verification status from sessionStorage on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const verified = sessionStorage.getItem("admin_pin_verified") === "true";
      setIsPinVerified(verified);
    }
  }, []);

  // Sync Firebase Auth with Supabase admin_users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // 1. First try to find by firebase_uid
          let { data, error } = await supabase
            .from("admin_users")
            .select("id, firebase_uid, email, name, role, salon_id, approval_status, security_pin_hash")
            .eq("firebase_uid", firebaseUser.uid)
            .maybeSingle();

          // 2. If not found by firebase_uid, try finding by email to link legacy accounts
          if (!data && firebaseUser.email) {
            const { data: emailData, error: emailError } = await supabase
              .from("admin_users")
              .select("id, firebase_uid, email, name, role, salon_id, approval_status, security_pin_hash")
              .eq("email", firebaseUser.email)
              .maybeSingle();
              
            if (emailData) {
               if (!emailData.firebase_uid) {
                 // Link the account!
                 await supabase
                   .from("admin_users")
                   .update({ firebase_uid: firebaseUser.uid })
                   .eq("id", emailData.id);
                   
                 data = { ...emailData, firebase_uid: firebaseUser.uid };
               } else if (emailData.firebase_uid === firebaseUser.uid) {
                 // Already linked, possibly by concurrent login function
                 data = emailData;
               }
            }
          }

          if (!data) {
            console.warn("User authenticated in Firebase but no admin_users record found.");
            setAdmin(null);
          } else if (data.approval_status === "rejected" || data.approval_status === "suspended") {
            console.warn("User account is rejected or suspended.");
            setAdmin(null);
          } else {
            setAdmin({
              id: data.id,
              firebase_uid: data.firebase_uid,
              email: data.email,
              name: data.name,
              role: data.role,
              salon_id: data.salon_id ?? null,
              approval_status: data.approval_status,
              has_pin: !!data.security_pin_hash,
            });

            // If not super_admin, we don't need PIN verification.
            if (data.role !== "super_admin") {
              setIsPinVerified(true);
            }
          }
        } catch (err) {
          console.error("Error fetching admin profile:", err);
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshAdminProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const { data } = await supabase
        .from("admin_users")
        .select("id, firebase_uid, email, name, role, salon_id, approval_status, security_pin_hash")
        .eq("firebase_uid", auth.currentUser.uid)
        .maybeSingle();

      if (data) {
        setAdmin({
          id: data.id,
          firebase_uid: data.firebase_uid,
          email: data.email,
          name: data.name,
          role: data.role,
          salon_id: data.salon_id ?? null,
          approval_status: data.approval_status,
          has_pin: !!data.security_pin_hash,
        });

        if (data.role !== "super_admin") {
          setIsPinVerified(true);
        }
      }
    } catch (err) {
      console.error("Error refreshing admin profile:", err);
    }
  };

  const loginWithEmail = async (email: string, password: string, securityPin?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      let { data } = await supabase
        .from("admin_users")
        .select("id, firebase_uid, email, role, approval_status, security_pin_hash")
        .eq("firebase_uid", userCredential.user.uid)
        .maybeSingle();

      if (!data) {
        const { data: emailData } = await supabase
          .from("admin_users")
          .select("id, firebase_uid, email, role, approval_status, security_pin_hash")
          .eq("email", email)
          .maybeSingle();
          
        if (emailData) {
           if (!emailData.firebase_uid) {
             await supabase.from("admin_users").update({ firebase_uid: userCredential.user.uid }).eq("id", emailData.id);
             data = { ...emailData, firebase_uid: userCredential.user.uid };
           } else if (emailData.firebase_uid === userCredential.user.uid) {
             data = emailData;
           }
        }
      }

      if (!data) {
        await firebaseSignOut(auth);
        return { success: false, error: "No admin or salon owner account found for this email." };
      }
      
      if (data.approval_status === "rejected" || data.approval_status === "suspended") {
        await firebaseSignOut(auth);
        return { success: false, error: "Your account has been " + data.approval_status + " by an administrator." };
      }

      // Check role constraint: Only super_admin and salon_owner are allowed
      const allowedRoles = ["salon_owner", "super_admin"];
      if (!allowedRoles.includes(data.role)) {
        await firebaseSignOut(auth);
        return { success: false, error: "Unauthorized role access." };
      }

      // Check Security PIN for super_admin if already set up
      if (data.role === "super_admin" && data.security_pin_hash) {
        if (!securityPin) {
          await firebaseSignOut(auth);
          return { success: false, error: "Security PIN is required for Super Admin." };
        }
        
        // Verify PIN via RPC
        const { data: pinValid, error: pinError } = await supabase.rpc("verify_admin_pin", {
          input_email: data.email,
          input_pin: securityPin
        });

        if (pinError || !pinValid) {
          await firebaseSignOut(auth);
          return { success: false, error: "Incorrect Security PIN." };
        }

        // Correct PIN
        setIsPinVerified(true);
        sessionStorage.setItem("admin_pin_verified", "true");
      } else if (data.role === "super_admin" && !data.security_pin_hash) {
        // Super admin logging in for the first time, bypass PIN entry on login form (it will force setup inside)
        setIsPinVerified(false);
      } else {
        // Salon Owner doesn't need PIN
        setIsPinVerified(true);
      }

      return { success: true };
    } catch (err: any) {
      console.error("Email Login error:", err);
      return { success: false, error: formatAuthError(err) };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      let { data } = await supabase
        .from("admin_users")
        .select("id, firebase_uid, email, role, approval_status, security_pin_hash")
        .eq("firebase_uid", result.user.uid)
        .maybeSingle();

      if (!data && result.user.email) {
        const { data: emailData } = await supabase
          .from("admin_users")
          .select("id, firebase_uid, email, role, approval_status, security_pin_hash")
          .eq("email", result.user.email)
          .maybeSingle();
          
        if (emailData) {
           if (!emailData.firebase_uid) {
             await supabase.from("admin_users").update({ firebase_uid: result.user.uid }).eq("id", emailData.id);
             data = { ...emailData, firebase_uid: result.user.uid };
           } else if (emailData.firebase_uid === result.user.uid) {
             data = emailData;
           }
        }
      }

      if (!data) {
        await firebaseSignOut(auth);
        return { success: false, error: "No account found for this Google account." };
      }
      
      if (data.approval_status === "rejected" || data.approval_status === "suspended") {
        await firebaseSignOut(auth);
        return { success: false, error: "Your account has been " + data.approval_status + " by an administrator." };
      }

      const allowedRoles = ["salon_owner", "super_admin"];
      if (!allowedRoles.includes(data.role)) {
        await firebaseSignOut(auth);
        return { success: false, error: "Unauthorized role access." };
      }

      if (data.role === "super_admin") {
        // Force PIN verification on the session unlock screen or redirect to PIN setup
        setIsPinVerified(false);
      } else {
        setIsPinVerified(true);
      }

      return { success: true };
    } catch (err: any) {
      console.error("Google Login error:", err);
      return { success: false, error: formatAuthError(err) };
    }
  };

  const verifyPin = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    if (!admin) return { success: false, error: "Not logged in" };
    try {
      const { data: pinValid, error } = await supabase.rpc("verify_admin_pin", {
        input_email: admin.email,
        input_pin: pin
      });

      if (error) throw error;
      
      if (pinValid === true) {
        setIsPinVerified(true);
        sessionStorage.setItem("admin_pin_verified", "true");
        return { success: true };
      } else {
        return { success: false, error: "Incorrect Security PIN" };
      }
    } catch (err: any) {
      console.error("PIN verification error:", err);
      return { success: false, error: err.message || "Failed to verify PIN" };
    }
  };

  const setupPin = async (pin: string): Promise<{ success: boolean; error?: string }> => {
    if (!admin) return { success: false, error: "Not logged in" };
    try {
      const { data, error } = await supabase.rpc("setup_admin_pin", {
        input_email: admin.email,
        new_pin: pin
      });

      if (error) throw error;

      if (data === true) {
        setIsPinVerified(true);
        sessionStorage.setItem("admin_pin_verified", "true");
        await refreshAdminProfile();
        return { success: true };
      } else {
        return { success: false, error: "Failed to set up PIN. It might already be set up." };
      }
    } catch (err: any) {
      console.error("PIN setup error:", err);
      return { success: false, error: err.message || "Failed to set up PIN" };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await firebaseSignOut(auth);
    setAdmin(null);
    setIsPinVerified(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_pin_verified");
    }
    setIsLoading(false);
  };

  const isSalonOwner = admin?.role === "salon_owner";
  const isAdmin = admin?.role === "super_admin";

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        loginWithEmail,
        loginWithGoogle,
        logout,
        isAuthenticated: !!admin,
        isSalonOwner,
        isAdmin,
        isPinVerified,
        verifyPin,
        setupPin,
        refreshAdminProfile,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
