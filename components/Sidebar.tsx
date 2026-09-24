"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/app/firebase";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname(); // This tool tells us which page the user is currently on!

  const handleLogout = async () => {
    localStorage.removeItem("summarist_guest");
    localStorage.removeItem("summarist_premium");
    await signOut(auth);
    router.push("/");
  };

  // A small helper function to highlight the button of the page we are currently looking at
  const getButtonClass = (targetPath: string) => {
    const baseClass = "w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ";
    if (pathname === targetPath) {
      return baseClass + "bg-[#043854] text-[#11d683] font-bold";
    }
    return baseClass + "text-gray-300 hover:bg-[#043854] hover:text-white";
  };

  return (
    <aside className="w-64 bg-[#032b41] text-white flex flex-col justify-between p-6 hidden md:flex shrink-0 min-h-screen">
      <div className="space-y-8">
        {/* LOGO */}
        <div 
          onClick={() => router.push("/for-you")} 
          className="text-2xl font-black tracking-tight cursor-pointer"
        >
          Summarist<span className="text-[#11d683]">.</span>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="space-y-4">
          <button 
            onClick={() => router.push("/for-you")} 
            className={getButtonClass("/dashboard")} // Because /for-you is rewritten to /dashboard under the hood
          >
            📖 For You
          </button>
          
          <button 
            onClick={() => router.push("/my-library")} 
            className={getButtonClass("/library")} // Because /my-library is rewritten to /library under the hood
          >
            🔖 My Library
          </button>
          
          <button 
            onClick={() => router.push("/settings")} 
            className={getButtonClass("/settings-page")} // Because /settings is rewritten to /settings-page under the hood
          >
            ⚙️ Settings
          </button>
          
          <button 
            onClick={() => router.push("/choose-plan")} 
            className="w-full text-left border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-[#032b41] px-4 py-3 rounded-lg font-bold transition flex items-center gap-3"
          >
            ✨ Upgrade Plan
          </button>
        </nav>
      </div>
      
      {/* LOGOUT BUTTON */}
      <button 
        onClick={handleLogout}
        className="w-full bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 font-semibold py-3 rounded-lg transition duration-200"
      >
        Logout
      </button>
    </aside>
  );
}
