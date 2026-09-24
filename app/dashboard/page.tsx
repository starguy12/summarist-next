"use client";

import Sidebar from "@/components/Sidebar";
import React, { useState, useEffect } from "react";
import { auth } from "@/app/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]); // Track favorited IDs
  const router = useRouter();

  useEffect(() => {
    const guest = localStorage.getItem("summarist_guest");
    const savedFavs = localStorage.getItem("summarist_favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    if (guest) {
      setUser(guest);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser.displayName || firebaseUser.email);
        setLoading(false);
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem("summarist_guest");
    await signOut(auth);
    router.push("/");
  };

  // Add/Remove item from bookmarks arrays
  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid card click navigation trigger
    let updated: number[];
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("summarist_favorites", JSON.stringify(updated));
  };

  const filteredBooks = MOCK_BOOKS.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* 1. Reusable Sidebar Component Wrapper */}
      <Sidebar />

      {/* 
        Replacing the old sidebar markup with the new Sidebar component.
        Keeping the old code below for reference:
        
        <aside className="w-64 bg-[#032b41] text-white flex flex-col justify-between p-6 hidden md:flex">
          <div className="space-y-8">
            <div className="text-2xl font-black tracking-tight">Summarist<span className="text-[#11d683]">.</span></div>
            <nav className="space-y-4">
              <button className="w-full text-left bg-[#043854] text-[#11d683] px-4 py-3 rounded-lg font-bold transition">📖 For You</button>
              <button onClick={() => router.push("/my-library")} className="w-full text-left hover:bg-[#043854] text-gray-300 hover:text-white px-4 py-3 rounded-lg font-medium transition">🔖 My Library</button>
              <button onClick={() => router.push("/settings")} className="w-full text-left hover:bg-[#043854] text-gray-300 hover:text-white px-4 py-3 rounded-lg font-medium transition">⚙️ Settings</button>
            </nav>
          </div>
          <button onClick={handleLogout} className="w-full bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/30 font-semibold py-3 rounded-lg transition duration-200">Logout</button>
        </aside> 
      */}

    


      

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#032b41]">For You</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome, <span className="font-bold text-gray-700">{user}</span>!</p>
          </div>
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">🔍</span>
            <input type="text" placeholder="Search by title or author..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black" />
          </div>
        </header>

        <h3 className="text-lg font-bold text-[#032b41] mb-6">{searchQuery ? `Search Results (${filteredBooks.length})` : "Recommended Summaries"}</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div 
              key={book.id} 
              onClick={() => router.push(`/book/${book.id}`)}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between cursor-pointer transform hover:-translate-y-0.5"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3 inline-block">{book.category}</span>
                  {/* INTERACTIVE FAVORITE TRIGGER ICON */}
                  <button 
                    onClick={(e) => toggleFavorite(book.id, e)} 
                    className="text-xl p-1 -mt-1 hover:scale-110 transition duration-150"
                    title={favorites.includes(book.id) ? "Remove from Library" : "Bookmark to Library"}
                  >
                    {favorites.includes(book.id) ? "🔖" : "🫥"}
                  </button>
                </div>
                <h4 className="font-black text-lg text-[#032b41] leading-snug">{book.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{book.author}</p>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
                <div>⏱️ {book.duration}</div>
                <div className="text-amber-500">⭐ <span className="text-gray-700 font-bold">{book.rating}</span></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
