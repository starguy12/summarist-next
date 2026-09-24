"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MOCK_BOOKS = [
  { id: 1, title: "Atomic Habits", author: "James Clear", duration: "12 min", rating: "4.8", category: "Productivity" },
  { id: 2, title: "The Lean Startup", author: "Eric Ries", duration: "14 min", rating: "4.5", category: "Business" },
  { id: 3, title: "Thinking, Fast and Slow", author: "Daniel Kahneman", duration: "18 min", rating: "4.7", category: "Psychology" },
  { id: 4, title: "Deep Work", author: "Cal Newport", duration: "11 min", rating: "4.6", category: "Productivity" },
  { id: 5, title: "Zero to One", author: "Peter Thiel", duration: "13 min", rating: "4.4", category: "Business" },
  { id: 6, title: "The Power of Habit", author: "Charles Duhigg", duration: "15 min", rating: "4.6", category: "Psychology" },
];

export default function MyLibraryPage() {
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const router = useRouter();

  // Load favorites from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("summarist_favorites");
    if (saved) {
      setSavedIds(JSON.parse(saved));
    }
  }, []);

  // Filter out only the books that have been saved by the user
  const savedBooks = MOCK_BOOKS.filter((book) => savedIds.includes(book.id));

  const handleRemoveFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents clicking the card from opening the book page
    const updatedIds = savedIds.filter((savedId) => savedId !== id);
    setSavedIds(updatedIds);
    localStorage.setItem("summarist_favorites", JSON.stringify(updatedIds));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#032b41] text-white flex flex-col justify-between p-6 hidden md:flex">
        <div className="space-y-8">
          <div className="text-2xl font-black tracking-tight">Summarist<span className="text-[#11d683]">.</span></div>
          <nav className="space-y-4">
            <button onClick={() => router.push("/for-you")} className="w-full text-left hover:bg-[#043854] text-gray-300 hover:text-white px-4 py-3 rounded-lg font-medium transition">📖 For You</button>
            <button className="w-full text-left bg-[#043854] text-[#11d683] px-4 py-3 rounded-lg font-bold transition">🔖 My Library</button>
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8 border-b border-gray-200 pb-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#032b41]">My Library</h1>
            <p className="text-sm text-gray-500 mt-1">Your bookmarked and saved summaries.</p>
          </div>
          <button onClick={() => router.push("/for-you")} className="text-sm font-bold text-blue-600 hover:underline">
            Browse More Books &rarr;
          </button>
        </header>

        {savedBooks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 p-8">
            <span className="text-4xl block mb-4">🔖</span>
            <h3 className="text-lg font-bold text-gray-700">Your Library is Empty</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mt-1 mb-6">When you browse summaries, bookmark them to see them neatly grouped right here.</p>
            <button onClick={() => router.push("/for-you")} className="bg-[#032b41] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-opacity-90 transition">Explore Recommended Books</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedBooks.map((book) => (
              <div 
                key={book.id} 
                onClick={() => router.push(`/player/${book.id}`)}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between cursor-pointer relative"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3 inline-block">{book.category}</span>
                    <button 
                      onClick={(e) => handleRemoveFavorite(book.id, e)}
                      className="text-gray-400 hover:text-red-500 font-bold transition text-sm p-1"
                      title="Remove from favorites"
                    >
                      🗑️
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
        )}
      </main>
    </div>
  );
}
