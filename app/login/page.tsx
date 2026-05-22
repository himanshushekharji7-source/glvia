"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (!email.trim() || !password) {
      setErrorMessage("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    // Check if Firebase Auth is correctly configured
    if (!auth) {
      setErrorMessage("Firebase configuration is missing or invalid. Please configure the keys in the .env file and build/restart the server.");
      setIsLoading(false);
      return;
    }

    try {
      let user;
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        user = userCredential.user;

        // Save profile metadata locally
        const userProfile = {
          id: user.uid,
          firstName: fullName.split(" ")[0] || "User",
          lastName: fullName.split(" ").slice(1).join(" ") || "",
          email: user.email || email.trim(),
          phoneNumber: "",
          role: "customer",
          walletBalance: 250,
        };
        localStorage.setItem("glvia_user_profile", JSON.stringify(userProfile));
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        user = userCredential.user;

        // Fetch profile or set default
        const userProfile = {
          id: user.uid,
          firstName: user.displayName?.split(" ")[0] || "User",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
          email: user.email || email.trim(),
          phoneNumber: user.phoneNumber || "",
          role: "customer",
          walletBalance: 250,
        };
        localStorage.setItem("glvia_user_profile", JSON.stringify(userProfile));
      }

      // Save user session token
      localStorage.setItem("token", user.uid);

      // Redirect to home/dashboard
      router.push("/");
    } catch (error: any) {
      console.error("Error with Email authentication:", error);
      let friendlyMessage = "Failed to authenticate. Please check details and try again.";
      if (error.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already in use. Please log in instead.";
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        friendlyMessage = "Incorrect email or password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/weak-password") {
        friendlyMessage = "Password should be at least 6 characters long.";
      }
      setErrorMessage(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address to reset password.");
      return;
    }
    setErrorMessage("");
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert("Password reset email sent! Please check your inbox.");
    } catch (err: any) {
      console.error("Error sending reset email:", err);
      let friendlyMessage = "Failed to send reset email. Please try again.";
      if (err.code === "auth/invalid-email") {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/user-not-found") {
        friendlyMessage = "No user found with this email.";
      }
      setErrorMessage(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);

    if (!auth) {
      setErrorMessage("Firebase configuration is missing or invalid. Please configure the keys in the .env file and build/restart the server.");
      setIsLoading(false);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user session token
      localStorage.setItem("token", user.uid);

      // Create/Get profile
      const userProfile = {
        id: user.uid,
        firstName: user.displayName?.split(" ")[0] || "User",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: "customer",
        walletBalance: 250,
      };
      localStorage.setItem("glvia_user_profile", JSON.stringify(userProfile));

      // Redirect to home/dashboard
      router.push("/");
    } catch (error: any) {
      console.error("Error with Google Sign-In:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        setErrorMessage(error.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface-card flex flex-col">
      {/* Top Gradient Header */}
      <div
        className="relative h-[260px] flex flex-col items-center justify-end pb-8"
        style={{ background: "var(--gradient-primary)" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute top-20 right-12 w-16 h-16 rounded-full bg-white/5" />
        <div className="absolute bottom-16 left-16 w-10 h-10 rounded-full bg-white/8" />

        {/* Logo */}
        <div className="relative z-10 text-center animate-fadeInUp">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
            <span className="material-icons-round text-[32px] text-white">
              auto_awesome
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            glvia
          </h1>
          <p className="text-white/70 text-sm mt-1.5">
            {isSignUp ? "Create your account" : "Welcome back to glvia"}
          </p>
        </div>

        {/* Curved bottom */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 430 40" fill="none" className="w-full">
            <path d="M0 40V20C0 20 100 0 215 0C330 0 430 20 430 20V40H0Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 px-6 pt-2 pb-8 animate-fadeInUp" style={{ animationDelay: "150ms" }}>
        {/* Tab Switcher */}
        <div className="tab-bar mb-6">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMessage(""); }}
            className={`tab-item ${!isSignUp ? "active" : ""}`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMessage(""); }}
            className={`tab-item ${isSignUp ? "active" : ""}`}
          >
            Sign Up
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3.5 bg-error/10 text-error text-xs font-semibold rounded-2xl">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isSignUp}
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">
              Email Address
            </label>
            <input
              type="email"
              placeholder="hello@example.com"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                tabIndex={-1}
              >
                <span className="material-icons-round text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-primary hover:underline"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full mt-6 py-4 text-base disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <span>{isSignUp ? "Create Account" : "Log In"}</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-strong"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-surface-card px-3 text-text-tertiary font-semibold">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold rounded-2xl hover:bg-surface-dim hover:text-text-primary border border-border-strong transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-text-tertiary mt-8">
          By continuing, you agree to our{" "}
          <span className="text-primary font-medium">Terms of Service</span> and{" "}
          <span className="text-primary font-medium">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
