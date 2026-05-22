"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "./supabase";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  admin: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  isAuthenticated: false,
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? sessionStorage.getItem("glvia_admin") : null;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setAdmin(parsed);
        } catch {
          sessionStorage.removeItem("glvia_admin");
        }
      }
    } catch (err) {
      console.warn("sessionStorage is not accessible:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!email || !password) {
        return { success: false, error: "Email and password are required" };
      }

      // Query Supabase to verify credentials using pgcrypto
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, email, name, role, password_hash")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (error || !data) {
        return { success: false, error: "Invalid email or password" };
      }

      // Verify password using Supabase RPC (pgcrypto)
      const { data: verifyData, error: verifyError } = await supabase
        .rpc("verify_admin_password", {
          input_email: email.toLowerCase().trim(),
          input_password: password,
        });

      if (verifyError || !verifyData) {
        return { success: false, error: "Invalid email or password" };
      }

      const adminUser: AdminUser = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      };

      setAdmin(adminUser);
      sessionStorage.setItem("glvia_admin", JSON.stringify(adminUser));
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Connection error. Please try again." };
    }
  };

  const logout = () => {
    setAdmin(null);
    sessionStorage.removeItem("glvia_admin");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        login,
        logout,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
