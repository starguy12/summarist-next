"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Track logged in user status (null means logged out)
  const [user, setUser] = useState<string | null>(null);

  // Function called when a user logs in successfully (via Email, Google, or Guest)
  const handleLoginSuccess = (userIdentifier: string) => {
    setUser(userIdentifier);
    router.push("/dashboard"); // <-- This pushes the user to the dashboard screen!
  };

  // Function called when a user logs out
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <main className="min-h-screen bg-white text-gray-800 font-sans">
      {/* 1. NAVIGATION BAR */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black text-[#032b41] tracking-tight flex items-center gap-2">
            <span className="text-[#032b41] font-bold text-2xl tracking-normal">Summarist</span>
            <span className="text-[#11d683] text-3xl font-black -ml-1">.</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 font-medium text-gray-600">
            <a href="#about" className="hover:text-[#032b41] transition">About</a>
            <a href="#contact" className="hover:text-[#032b41] transition">Contact</a>

            {/* 3. CONDITIONAL LOGIN/LOGOUT NAVBAR BUTTON */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-500">Hi, {user}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-5 py-2.5 rounded-lg hover:bg-red-600 font-semibold transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#032b41] text-white px-5 py-2.5 rounded-lg hover:bg-opacity-90 font-semibold transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <header className="max-w-4xl mx-auto text-center px-6 py-20 md:py-28">
        <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full inline-block mb-4 uppercase tracking-wider">
          Gain more knowledge in less time
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-[#032b41] leading-tight tracking-tight mb-6">
          Great summaries for <br />
          <span className="text-[#11d683]">{user ? user : "busy people"}</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Designed for individuals who barely have time to read, and even people who do not like to read. Save time by getting the core ideas from the best books.
        </p>

        {!user && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#11d683] hover:bg-[#0fbe74] text-[#032b41] text-lg font-bold px-10 py-4 rounded-xl shadow-lg shadow-green-100 transition active:scale-95"
          >
            Understand books in few minutes
          </button>
        )}
      </header>

      {/* DYNAMIC MODAL CONTAINER */}
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </main>
  );
}
