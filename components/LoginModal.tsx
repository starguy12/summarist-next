"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/app/firebase";
import { signInWithPopup } from "firebase/auth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userEmail: string) => void;
}

// Simulated User Database for Mock Registration Data
const DUMMY_REGISTERED_USERS = [
  { email: "guest@gmail.com", password: "guest123" }
];

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Track validation error strings
  const router = useRouter();

  if (!isOpen) return null;

  // Form Validation & Submission Framework
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null); // Clear older validation warnings

    // 1. Universal Email Validation Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Invalid email format. Please provide a real address structure.");
      return;
    }

    // 2. SIGN UP / REGISTRATION VALIDATIONS
    if (authMode === "signup") {
      if (password.length < 6) {
        setErrorMsg("Short password! Your credentials must be at least 6 characters long.");
        return;
      }
      
      // Simulate successful registration by adding credentials locally
      DUMMY_REGISTERED_USERS.push({ email, password });
      alert("Account created successfully! Switching to Login view.");
      setAuthMode("login");
      setPassword("");
      return;
    }

    // 3. LOGIN VALIDATIONS
    if (authMode === "login") {
      const foundUser = DUMMY_REGISTERED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        setErrorMsg("User not found! This email is not registered in our database.");
        return;
      }

      if (foundUser.password !== password) {
        setErrorMsg("Incorrect password. Please verify your credentials and try again.");
        return;
      }

      // Successful matching login
      localStorage.setItem("summarist_guest", foundUser.email);
      onLoginSuccess(foundUser.email);
      onClose();
      router.push("/for-you");
    }
  };

  // Google Login Route
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user && user.email) {
        onLoginSuccess(user.displayName || user.email);
        onClose();
        router.push("/for-you");
      }
    } catch (error) {
      console.error("Google Auth Error:", error);
    }
  };

  // Hardcoded Guest Shortcut Trigger (Recruiter Quick Entry)
  const handleGuestLogin = () => {
    localStorage.setItem("summarist_guest", "guest@gmail.com");
    onLoginSuccess("guest@gmail.com");
    onClose();
    router.push("/for-you");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl transition-all border border-gray-100">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
        
        {/* Dynamic Title Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-[#032b41]">
            {authMode === "login" ? "Log in to Summarist" : "Create your account"}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {authMode === "login" ? "Access your book summaries instantly." : "Start growing with Summarist today."}
          </p>
        </div>

        {/* GOOGLE SIGN IN */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-lg shadow-sm transition duration-200 mb-4 text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Log in with Google
        </button>

        <div className="flex items-center my-4 text-xs text-gray-400 uppercase tracking-wider before:content-[''] before:flex-1 before:border-b before:border-gray-200 before:mr-3 after:content-[''] after:flex-1 after:border-b after:border-gray-200 after:ml-3">or</div>

        {/* BEHAVIOR: DYNAMIC VALIDATION ERROR ALERTS */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 mb-4 animate-in fade-in slide-in-from-top-1 duration-150">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* INPUT FORMS */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Email Address</label>
            <input 
              type="text" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="example@mail.com" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm transition" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black text-sm transition" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-[#032b41] hover:bg-[#043854] text-white font-bold py-3 rounded-lg shadow-md transition duration-200 text-sm">
            {authMode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        {/* RECRUITER INSTANT GUEST PORTAL ENTRY */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <button onClick={handleGuestLogin} type="button" className="w-full bg-[#11d683] hover:bg-[#0fbe74] text-[#032b41] font-black py-3 rounded-lg shadow-sm transition duration-200 text-sm">
            ⚡ Quick Recruiter Guest Login
          </button>
          <p className="text-[10px] text-gray-400 mt-2">Auto-fills fallback profile: <span className="font-bold">guest@gmail.com</span> / <span className="font-bold">guest123</span></p>
        </div>

        {/* MODE TOGGLES */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {authMode === "login" ? (
            <div>Don't have an account? <button onClick={() => { setAuthMode("signup"); setErrorMsg(null); }} className="hover:underline text-blue-600 font-bold">Sign up</button></div>
          ) : (
            <div>Already have an account? <button onClick={() => { setAuthMode("login"); setErrorMsg(null); }} className="hover:underline text-blue-600 font-bold">Log in</button></div>
          )}
        </div>
      </div>
    </div>
  );
}
