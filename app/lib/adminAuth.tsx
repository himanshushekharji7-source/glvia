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
          // Fetch the admin user record from Supabase
          const { data, error } = await supabase
            .from("admin_users")
            .select("id, firebase_uid, email, name, role, salon_id, approval_status")
            .eq("firebase_uid", firebaseUser.uid)
            .single();

          if (error || !data) {
            console.warn("User authenticated in Firebase but no admin_users record found.");
            setAdmin(null);
          } else if (data.approval_status !== "approved") {
            console.warn("User account is pending approval or rejected.");
            setAdmin(null);
            // Optionally, you could set a specific state here to show a "Pending Approval" screen
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
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // State is handled by onAuthStateChanged
      return { success: true };
    } catch (err: any) {
      console.error("Email Login error:", err);
      return { success: false, error: err.message || "Invalid email or password" };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err: any) {
      console.error("Google Login error:", err);
      return { success: false, error: err.message || "Google sign-in failed" };
    } finally {
      setIsLoading(false);
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
