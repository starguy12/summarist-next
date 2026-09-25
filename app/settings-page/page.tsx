"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/app/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const guest = localStorage.getItem("summarist_guest");
    return guest ? "guest@summarist.com" : null;
  });
  const [userName, setUserName] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("summarist_guest");
  });
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("summarist_premium") === "true";
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("summarist_guest") === null;
  });
  const router = useRouter();

  useEffect(() => {
    const guest = typeof window !== "undefined" ? localStorage.getItem("summarist_guest") : null;

    if (guest) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUserName(firebaseUser.displayName || "Summarist Member");
        setUserEmail(firebaseUser.email);
        setIsPremium(true);
        setLoading(false);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032b41]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR NAVIGATION - Handled perfectly by our unified component */}
      <Sidebar />

      {/* MAIN SETTINGS INTERFACE */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8 border-b border-gray-200 pb-5">
          <h1 className="text-2xl md:text-3xl font-black text-[#032b41]">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account credentials and plan settings.</p>
        </header>

        <div className="max-w-2xl space-y-6">
          {/* Subscription Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-[#032b41] mb-2">Your Subscription Plan</h3>
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-xl font-extrabold text-gray-800">
                  {isPremium ? "Summarist Premium ✨" : "Free Plan"}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {isPremium ? "Unlimited access to all book insights and text audio." : "Upgrade to unlock full audio capabilities."}
                </p>
              </div>
              {!isPremium && (
                <button
                  onClick={() => router.push("/choose-plan")}
                  className="bg-[#11d683] hover:bg-[#0fbe74] text-[#032b41] text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition"
                >
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>

          {/* User Details Account Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#032b41] border-b border-gray-100 pb-2">Account Details</h3>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">User Name</label>
              <p className="text-base font-semibold text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">{userName}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
              <p className="text-base font-semibold text-gray-800 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">{userEmail}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
