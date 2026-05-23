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

interface AdminUser {
  id: string;
  firebase_uid: string;
  email: string;
  name: string;
  role: string;
  salon_id?: string | null;
  approval_status: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isSalonOwner: boolean;
  isAdmin: boolean;
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
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Firebase Auth with Supabase admin_users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // 1. First try to find by firebase_uid
          let { data, error } = await supabase
            .from("admin_users")
            .select("id, firebase_uid, email, name, role, salon_id, approval_status")
            .eq("firebase_uid", firebaseUser.uid)
            .maybeSingle();

          // 2. If not found by firebase_uid, try finding by email to link legacy accounts
          if (!data && firebaseUser.email) {
            const { data: emailData, error: emailError } = await supabase
              .from("admin_users")
              .select("id, firebase_uid, email, name, role, salon_id, approval_status")
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
            });
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

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      let { data } = await supabase
        .from("admin_users")
        .select("id, firebase_uid, approval_status")
        .eq("firebase_uid", userCredential.user.uid)
        .maybeSingle();

      if (!data) {
        const { data: emailData } = await supabase
          .from("admin_users")
          .select("id, firebase_uid, approval_status")
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
        return { success: false, error: "No salon owner account found for this email. Please register." };
      }
      
      if (data.approval_status === "rejected" || data.approval_status === "suspended") {
        await firebaseSignOut(auth);
        return { success: false, error: "Your account has been " + data.approval_status + " by an administrator." };
      }

      return { success: true };
    } catch (err: any) {
      console.error("Email Login error:", err);
      return { success: false, error: err.message || "Invalid email or password" };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      let { data } = await supabase
        .from("admin_users")
        .select("id, firebase_uid, approval_status")
        .eq("firebase_uid", result.user.uid)
        .maybeSingle();

      if (!data && result.user.email) {
        const { data: emailData } = await supabase
          .from("admin_users")
          .select("id, firebase_uid, approval_status")
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
        return { success: false, error: "No salon owner account found for this Google account. Please register." };
      }
      
      if (data.approval_status === "rejected" || data.approval_status === "suspended") {
        await firebaseSignOut(auth);
        return { success: false, error: "Your account has been " + data.approval_status + " by an administrator." };
      }

      return { success: true };
    } catch (err: any) {
      console.error("Google Login error:", err);
      return { success: false, error: err.message || "Google sign-in failed" };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await firebaseSignOut(auth);
    setAdmin(null);
    setIsLoading(false);
  };

  const isSalonOwner = admin?.role === "salon_owner";
  const isAdmin = admin?.role === "admin" || admin?.role === "super_admin";

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
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
