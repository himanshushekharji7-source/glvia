"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Email/Password states
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Initialize reCAPTCHA verifier on component mount
    if (typeof window !== "undefined" && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {
              // reCAPTCHA solved, will trigger signIn
            },
            "expired-callback": () => {
              setErrorMessage("reCAPTCHA expired. Please try again.");
            },
          }
        );
      } catch (err: any) {
        console.error("Error initializing recaptcha:", err);
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (e) {
          // Ignore clean-up error if container not found
        }
      }
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (!phoneNumber.trim()) {
      setErrorMessage("Please enter a valid phone number.");
      setIsLoading(false);
      return;
    }

    // Check if Firebase Auth is correctly configured
    if (!auth) {
      setErrorMessage("Firebase configuration is missing or invalid. Please configure the keys in the .env file and build/restart the server.");
      setIsLoading(false);
      return;
    }

    // Format phone number with country code (+91 for India by default if not provided)
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith("+")) {
      if (formattedPhone.length === 10) {
        formattedPhone = "+91" + formattedPhone;
      } else {
        setErrorMessage("Please enter 10-digit mobile number or specify country code (e.g. +91...)");
        setIsLoading(false);
        return;
      }
    }

    try {
      // Dynamically initialize RecaptchaVerifier on submission if not already initialized
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {
              // reCAPTCHA solved
            },
            "expired-callback": () => {
              setErrorMessage("reCAPTCHA expired. Please try again.");
            },
          }
        );
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );

      setConfirmationResult(confirmation);
      setStep("otp");
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      setErrorMessage(error.message || "Failed to send OTP. Please check the number and try again.");
      
      // Reset reCAPTCHA on failure
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        } catch (e) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (!otp.trim() || otp.length < 6) {
      setErrorMessage("Please enter a valid 6-digit OTP code.");
      setIsLoading(false);
      return;
    }

    if (!confirmationResult) {
      setErrorMessage("No active login request found. Please request OTP again.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await confirmationResult.confirm(otp.trim());
      const user = result.user;

      // Save user login session token
      localStorage.setItem("token", user.uid);
      
      // Save metadata locally to mimic user profiles
      const userProfile = {
        id: user.uid,
        firstName: isSignUp ? fullName.split(" ")[0] || "User" : "User",
        lastName: isSignUp ? fullName.split(" ").slice(1).join(" ") || "" : "",
        email: user.email || `${user.phoneNumber}@glvia.com`,
        phoneNumber: user.phoneNumber || phoneNumber,
        role: "customer",
        walletBalance: 250,
      };
      localStorage.setItem("glvia_user_profile", JSON.stringify(userProfile));

      // Redirect to home/dashboard
      router.push("/");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Invalid OTP code. Please enter the correct code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    if (!auth) {
      setErrorMessage("Firebase configuration is missing or invalid. Please configure the keys in the .env file and build/restart the server.");
      setIsLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMessage("Please enter your full name.");
          setIsLoading(false);
          return;
        }

        // Create user in Firebase
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = result.user;

        // Update profile display name
        try {
          await updateProfile(user, { displayName: fullName.trim() });
        } catch (updateErr) {
          console.warn("Failed to update profile display name:", updateErr);
        }

        // Save session
        localStorage.setItem("token", user.uid);
        const userProfile = {
          id: user.uid,
          firstName: fullName.trim().split(" ")[0] || "User",
          lastName: fullName.trim().split(" ").slice(1).join(" ") || "",
          email: user.email || email.trim(),
          phoneNumber: "",
          role: "customer",
          walletBalance: 250,
        };
        localStorage.setItem("glvia_user_profile", JSON.stringify(userProfile));
      } else {
        // Log In
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        const user = result.user;

        // Save session
        localStorage.setItem("token", user.uid);
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

      // Redirect to home/dashboard
      router.push("/");
    } catch (error: any) {
      console.error("Error with Email authentication:", error);
      let friendlyMessage = "Failed to authenticate. Please check details and try again.";
      if (error.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already in use. Please log in instead.";
      } else if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
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

  return (
    <div className="min-h-dvh bg-surface-card flex flex-col">
      {/* Top Gradient Header */}
      <div
        className="relative h-[280px] flex flex-col items-center justify-end pb-8"
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

      {/* Hidden container required by Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {/* Form Content */}
      <div className="flex-1 px-6 pt-2 pb-8 animate-fadeInUp" style={{ animationDelay: "150ms" }}>
        {/* Tab Switcher */}
        {step === "phone" && (
          <div className="tab-bar mb-4">
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
        )}

        {/* Login Method Switcher */}
        {step === "phone" && (
          <div className="tab-bar mb-6">
            <button
              type="button"
              onClick={() => { setLoginMethod("phone"); setErrorMessage(""); }}
              className={`tab-item ${loginMethod === "phone" ? "active" : ""}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="material-icons-round text-[16px]">phone_iphone</span>
                Mobile OTP
              </span>
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod("email"); setErrorMessage(""); }}
              className={`tab-item ${loginMethod === "email" ? "active" : ""}`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <span className="material-icons-round text-[16px]">mail_outline</span>
                Email & Pass
              </span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3.5 bg-error/10 text-error text-xs font-semibold rounded-2xl">
            {errorMessage}
          </div>
        )}

        {loginMethod === "email" && step === "phone" ? (
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
        ) : step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary font-semibold">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="input pl-12"
                  value={phoneNumber.startsWith("+91") ? phoneNumber.slice(3) : phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPhoneNumber(val);
                  }}
                  maxLength={10}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-6 py-4 text-base disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <span>Send Verification OTP</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                className="input text-center tracking-[0.5em] font-mono text-lg font-bold"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setOtp(val);
                }}
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-6 py-4 text-base disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying OTP...</span>
                </>
              ) : (
                <span>Verify & Sign In</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setErrorMessage("");
              }}
              className="w-full text-xs text-text-secondary hover:text-primary font-semibold transition-colors text-center mt-3 block"
            >
              Change Mobile Number
            </button>
          </form>
        )}

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

