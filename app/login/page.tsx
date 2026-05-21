"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogin, useRegister } from "../lib/hooks";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      if (isLogin) {
        await loginMutation.mutateAsync({ email, password });
        router.push("/");
      } else {
        const [firstName, ...lastNames] = fullName.split(" ");
        await registerMutation.mutateAsync({
          firstName: firstName || "",
          lastName: lastNames.join(" ") || " ",
          email,
          password,
        });
        router.push("/verify");
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-dvh bg-surface-card flex flex-col">
      {/* Top Gradient */}
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
            LuxeSalon
          </h1>
          <p className="text-white/70 text-sm mt-1.5">
            {isLogin ? "Welcome back to beauty." : "Start your beauty journey."}
          </p>
        </div>

        {/* Curved bottom */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 430 40" fill="none" className="w-full">
            <path d="M0 40V20C0 20 100 0 215 0C330 0 430 20 430 20V40H0Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 px-6 pt-2 pb-8 animate-fadeInUp" style={{ animationDelay: "150ms" }}>
        {/* Tab Switcher */}
        <div className="tab-bar mb-6">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setErrorMessage(""); }}
            className={`tab-item ${isLogin ? "active" : ""}`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setErrorMessage(""); }}
            className={`tab-item ${!isLogin ? "active" : ""}`}
          >
            Sign Up
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-error/10 text-error text-xs font-semibold rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Input Fields */}
        <div className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
              >
                <span className="material-icons-round text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {isLogin && (
          <div className="flex justify-end mt-2.5">
            <button type="button" className="text-xs font-semibold text-primary hover:underline">
              Forgot Password?
            </button>
          </div>
        )}

        {/* CTA */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-primary w-full mt-6 py-4 text-base disabled:opacity-70 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            isLogin ? "Log In" : "Create Account"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border-strong" />
          <span className="text-xs text-text-tertiary font-medium">or continue with</span>
          <div className="flex-1 h-px bg-border-strong" />
        </div>

        {/* Social Buttons */}
        <div className="flex gap-3">
          <button className="btn-secondary flex-1 py-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button className="btn-secondary flex-1 py-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-tertiary mt-8">
          By continuing, you agree to our{" "}
          <span className="text-primary font-medium">Terms of Service</span> and{" "}
          <span className="text-primary font-medium">Privacy Policy</span>
        </p>
      </form>
    </div>
  );
}
