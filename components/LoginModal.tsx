"use client";

import React, { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userEmail: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  // Handle standard Email/Password Login
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(email || "user@example.com");
    onClose();
  };

  // Handle Google Login
  const handleGoogleLogin = () => {
    onLoginSuccess("Google User");
    onClose();
  };

  // Handle Guest Login
  const handleGuestLogin = () => {
    onLoginSuccess("Guest User");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Modal Container Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl transition-all">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
        >
          &times;
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#032b41]">
            {authMode === "login" ? "Log in to Summarist" : "Create your account"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {authMode === "login" ? "Access your book summaries instantly." : "Start growing with Summarist today."}
          </p>
        </div>

        {/* 1. GOOGLE LOGIN BUTTON */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg shadow-sm transition duration-200 mb-4"
        >
          {/* Simple Mock Google Icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Log in with Google
        </button>

        {/* Divider line */}
        <div className="flex items-center my-4 text-xs text-gray-400 uppercase tracking-wider before:content-[''] before:flex-1 before:border-b before:border-gray-200 before:mr-3 after:content-[''] after:flex-1 after:border-b after:border-gray-200 after:ml-3">
          or
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition"
              required={authMode === "login"}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black transition"
              required={authMode === "login"}
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#032b41] hover:bg-[#043854] text-white font-semibold py-3 rounded-lg shadow-md transition duration-200"
          >
            {authMode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        {/* 2. GUEST LOGIN LINK */}
        <div className="mt-4 text-center">
          <button 
            onClick={handleGuestLogin}
            type="button" 
            className="w-full bg-gray-100 hover:bg-gray-200 text-[#032b41] font-semibold py-3 rounded-lg transition duration-200"
          >
            Log in as a Guest
          </button>
        </div>

        {/* Interactive View Toggles */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {authMode === "login" ? (
            <div>
              Don't have an account?{" "}
              <button 
                onClick={() => setAuthMode("signup")} 
                className="hover:underline text-blue-600 font-bold"
              >
                Sign up
              </button>
            </div>
          ) : (
            <div>
              Already have an account?{" "}
              <button 
                onClick={() => setAuthMode("login")} 
                className="hover:underline text-blue-600 font-bold"
              >
                Log in
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
