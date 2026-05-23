"use client";

import { useState } from "react";
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
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const executeAuth = async (signUpMode: boolean) => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!email.trim() || !password) {
      setErrorMessage("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    if (signUpMode && !fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      setIsLoading(false);
      return;
    }

    if (!auth) {
      setErrorMessage("Firebase configuration is missing or invalid. Please configure the keys in the .env file.");
      setIsLoading(false);
      return;
    }

    try {
      let user;
      if (signUpMode) {
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

      if (signUpMode) {
        // Redirect to email verification page
        router.push(`/verify?type=email&email=${encodeURIComponent(email.trim())}`);
      } else {
        // Redirect to home/dashboard
        router.push("/");
      }
    } catch (error: any) {
      console.error("Error with authentication:", error);
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
    setSuccessMessage("");
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage("Password reset link sent! Check your inbox.");
      // Redirect to verification screen with reset type
      setTimeout(() => {
        router.push(`/verify?type=reset&email=${encodeURIComponent(email.trim())}`);
      }, 1500);
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
    setSuccessMessage("");
    setIsLoading(true);

    if (!auth) {
      setErrorMessage("Firebase configuration is missing or invalid.");
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
    <div className="min-h-dvh bg-surface-card flex flex-col select-none overflow-x-hidden">
      {/* Top Gradient Header */}
      <div className="relative h-[240px] flex flex-col items-center justify-end pb-7 bg-gradient-to-br from-[#ec4899] via-[#b546cc] to-[#8b5cf6] overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/10 blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        <div className="absolute bottom-8 left-1/4 w-12 h-12 rounded-full bg-white/10 blur-sm" />

        {/* Brand/Logo Content */}
        <div className="relative z-10 text-center flex flex-col items-center">
          {/* Glassmorphic Icon Box */}
          <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center mb-3 shadow-[0_8px_32px_rgba(139,92,246,0.2)]">
            <span 
              className={`material-icons-round text-[30px] text-white transition-all duration-500 transform ${
                isSignUp ? "rotate-[360deg] scale-110" : "rotate-0 scale-100"
              }`}
            >
              {isSignUp ? "person_add" : "lock"}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
            glvia
          </h1>
          <p className="text-white/80 text-[13px] mt-1 font-medium transition-all duration-300">
            {isSignUp ? "Create a premium account" : "Welcome back to your beauty space"}
          </p>
        </div>

        {/* Soft Wave Bottom Divider */}
        <div className="absolute -bottom-1 left-0 right-0 z-0">
          <svg viewBox="0 0 430 40" fill="none" className="w-full h-8">
            <path d="M0 40V20C60 10 130 0 215 0C300 0 370 10 430 20V40H0Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 px-6 pt-1 pb-8 flex flex-col">
        
        {/* Modern Sliding Switcher */}
        <div className="relative flex bg-surface-dim p-1.5 rounded-2xl w-full mb-6 mt-2 border border-border/40 shadow-inner">
          <div 
            className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.06)] transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
            style={{ transform: isSignUp ? "translateX(100%)" : "translateX(0%)" }}
          />
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMessage(""); setSuccessMessage(""); }}
            className={`relative z-10 flex-1 py-2.5 text-center text-[13.5px] font-bold transition-colors duration-300 ${!isSignUp ? "text-text-primary" : "text-text-secondary"}`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMessage(""); setSuccessMessage(""); }}
            className={`relative z-10 flex-1 py-2.5 text-center text-[13.5px] font-bold transition-colors duration-300 ${isSignUp ? "text-text-primary" : "text-text-secondary"}`}
          >
            Sign Up
          </button>
        </div>

        {/* Notification banners */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-error/10 text-error text-[12px] font-bold rounded-2xl border border-error/10 animate-scaleIn flex items-center gap-2">
            <span className="material-icons-round text-[16px]">error_outline</span>
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3.5 bg-success/10 text-success text-[12px] font-bold rounded-2xl border border-success/10 animate-scaleIn flex items-center gap-2">
            <span className="material-icons-round text-[16px]">check_circle_outline</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Slider Wrapper */}
        <div className="w-full overflow-hidden flex-1 flex flex-col justify-start">
          <div 
            className="flex w-[200%] transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
            style={{ transform: isSignUp ? "translateX(-50%)" : "translateX(0%)" }}
          >
            {/* ── LOG IN FORM ── */}
            <div 
              className="w-1/2 pr-3 flex-shrink-0 transition-opacity duration-300 flex flex-col justify-between"
              style={{ opacity: isSignUp ? 0 : 1, pointerEvents: isSignUp ? "none" : "auto" }}
            >
              <form 
                onSubmit={(e) => { e.preventDefault(); executeAuth(false); }} 
                className="space-y-4"
              >
                {/* Email Input */}
                <div className="group">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block transition-colors group-focus-within:text-[#ec4899]">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-icons-round absolute left-4 text-[19px] text-text-tertiary transition-colors group-focus-within:text-[#ec4899]">
                      mail
                    </span>
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className="input pl-11 focus:bg-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={!isSignUp}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block transition-colors group-focus-within:text-[#ec4899]">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-icons-round absolute left-4 text-[19px] text-text-tertiary transition-colors group-focus-within:text-[#ec4899]">
                      lock
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="input pl-11 pr-12 focus:bg-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={!isSignUp}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-text-tertiary hover:text-text-secondary transition-colors"
                      tabIndex={-1}
                    >
                      <span className="material-icons-round text-[19px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[12px] font-bold text-[#ec4899] hover:text-[#db2777] hover:underline transition-colors"
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Log In Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-[#ec4899] to-[#8b5cf6] text-white font-bold text-[14.5px] shadow-[0_6px_20px_-3px_rgba(236,72,153,0.35)] active:scale-[0.98] disabled:opacity-75 transition-all duration-300 flex items-center justify-center gap-2 hover:brightness-105"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Log In</span>
                  )}
                </button>
              </form>
            </div>

            {/* ── SIGN UP FORM ── */}
            <div 
              className="w-1/2 pl-3 flex-shrink-0 transition-opacity duration-300 flex flex-col justify-between"
              style={{ opacity: isSignUp ? 1 : 0, pointerEvents: isSignUp ? "auto" : "none" }}
            >
              <form 
                onSubmit={(e) => { e.preventDefault(); executeAuth(true); }} 
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div className="group">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block transition-colors group-focus-within:text-[#8b5cf6]">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-icons-round absolute left-4 text-[19px] text-text-tertiary transition-colors group-focus-within:text-[#8b5cf6]">
                      person
                    </span>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input pl-11 focus:bg-white"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="group">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block transition-colors group-focus-within:text-[#8b5cf6]">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-icons-round absolute left-4 text-[19px] text-text-tertiary transition-colors group-focus-within:text-[#8b5cf6]">
                      mail
                    </span>
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className="input pl-11 focus:bg-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={isSignUp}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <label className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block transition-colors group-focus-within:text-[#8b5cf6]">
                    Create Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-icons-round absolute left-4 text-[19px] text-text-tertiary transition-colors group-focus-within:text-[#8b5cf6]">
                      lock
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="input pl-11 pr-12 focus:bg-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={isSignUp}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-text-tertiary hover:text-text-secondary transition-colors"
                      tabIndex={-1}
                    >
                      <span className="material-icons-round text-[19px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Sign Up Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] text-white font-bold text-[14.5px] shadow-[0_6px_20px_-3px_rgba(139,92,246,0.35)] active:scale-[0.98] disabled:opacity-75 transition-all duration-300 flex items-center justify-center gap-2 hover:brightness-105"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Sign Up</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Social Authentication */}
        <div className="mt-8">
          {/* Divider */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-strong"></div>
            </div>
            <span className="relative z-10 px-4 bg-white text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
              Or Connect With
            </span>
          </div>

          {/* Social Row */}
          <div className="grid grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="py-3 px-4 flex items-center justify-center gap-2 text-[13px] font-bold rounded-2xl border border-border-strong hover:bg-surface-dim active:scale-[0.97] transition-all duration-200"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
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
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Apple Sign-In is configured for iOS apps. Please use Google or Email on Web.")}
              disabled={isLoading}
              className="py-3 px-4 flex items-center justify-center gap-2 text-[13px] font-bold rounded-2xl border border-border-strong hover:bg-surface-dim active:scale-[0.97] transition-all duration-200"
            >
              <svg className="w-4.5 h-4.5 fill-text-primary" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.3 16.73 4.2 9.77 8.35 9.5c1.4.08 2.22.75 3.06.75.84 0 1.94-.83 3.51-.67 1.66.17 2.92.83 3.6 2.04-3.25 1.9-2.73 6.06.27 7.25-.66 1.48-1.57 2.76-1.74 3.41zM12.03 8.25c-.21-2.9 2.15-4.97 4.74-5.25.32 3.12-2.43 5.48-4.74 5.25z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Footer Policy Notes */}
        <p className="text-center text-[11px] text-text-tertiary mt-8 leading-normal">
          By continuing, you agree to glvia's{" "}
          <span className="text-[#ec4899] font-semibold hover:underline cursor-pointer">Terms of Service</span>
          {" "}and{" "}
          <span className="text-[#ec4899] font-semibold hover:underline cursor-pointer">Privacy Policy</span>
        </p>

      </div>
    </div>
  );
}
