"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/app/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

// Mock Data for the Book Summaries
const MOCK_BOOKS = [
  { id: 1, title: "Atomic Habits", author: "James Clear", duration: "12 min", rating: "4.8", category: "Productivity" },
  { id: 2, title: "The Lean Startup", author: "Eric Ries", duration: "14 min", rating: "4.5", category: "Business" },
  { id: 3, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", duration: "18 min", rating: "4.7", category: "Psychology" },
  { id: 4, title: "Deep Work", author: "Cal Newport", duration: "11 min", rating: "4.6", category: "Productivity" },
  { id: 5, title: "Zero to One", author: "Peter Thiel", duration: "13 min", rating: "4.4", category: "Business" },
  { id: 6, title: "The Power of Habit", author: "Charles Duhigg", duration: "15 min", rating: "4.6", category: "Psychology" },
];

export default function DashboardPage() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Listen for the Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser.displayName || firebaseUser.email);
        setLoading(false);
      } else {
        // If no user is logged in, redirect them back to the landing page safely
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032b41]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#032b41] text-white flex flex-col justify-between p-6 hidden md:flex">
        <div className="space-y-8">
          <div className="text-2xl font-black tracking-tight">
            Summarist<span className="text-[#11d683]">.</span>
          </div>
          <nav className="space-y-4">
            <button className="w-full text-left bg-[#043854] text-[#11d683] px-4 py-3 rounded-lg font-bold transition">
              📖 For You
            </button>
            <button className="w-full text-left hover:bg-[#043854] text-gray-300 hover:text-white px-4 py-3 rounded-lg font-medium transition">
              🔖 My Library
            </button>
            <button className="w-full text-left hover:bg-[#043854] text-gray-300 hover:text-white px-4 py-3 rounded-lg font-medium transition">
              🔍 Search
            </button>
          </nav>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 font-semibold py-3 rounded-lg transition duration-200"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#032b41]">For You</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back, <span className="font-bold text-gray-700">{user}</span>!</p>
          </div>
          {/* Mobile visible logout */}
          <button onClick={handleLogout} className="md:hidden bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg">
            Logout
          </button>
        </header>

        {/* Selected Daily Highlight Banner */}
        <div className="bg-[#fffdf4] border border-[#f3ebc6] rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Daily Add</span>
            <h2 className="text-xl md:text-2xl font-black text-[#032b41]">Can't Hurt Me</h2>
            <p className="text-sm text-gray-600 leading-relaxed">Master Your Mind and Defy the Odds by David Goggins. Learn how to push past your mental limitations and uncover your true capabilities.</p>
          </div>
          <button className="bg-[#032b41] hover:bg-[#043854] text-white font-bold px-6 py-3 rounded-xl shadow-md transition whitespace-nowrap">
            ⚡ Read Summary
          </button>
        </div>

        {/* Book Grid Layout */}
        <h3 className="text-lg font-bold text-[#032b41] mb-6">Recommended Summaries</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_BOOKS.map((book) => (
            <div key={book.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3 inline-block">{book.category}</span>
                <h4 className="font-black text-lg text-[#032b41] leading-snug">{book.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{book.author}</p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1">⏱️ {book.duration}</div>
                <div className="flex items-center gap-1 text-amber-500">⭐ <span className="text-gray-700 font-bold">{book.rating}</span></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
