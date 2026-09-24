"use client";

import React, { useState, useEffect } from "react";
import { auth } from "@/app/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SkeletonCard from "@/components/SkeletonCard";
import { Book } from "@/components/types";

export default function DashboardPage() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  // 3 Separate State Pools for our 3 APIs
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);

  const router = useRouter();

  useEffect(() => {
    // 1. Session & Favorites Authentication Setup
    const guest = localStorage.getItem("summarist_guest");
    const savedFavs = localStorage.getItem("summarist_favorites");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    if (guest) {
      setUser(guest);
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser.displayName || firebaseUser.email);
      } else if (!guest) {
        router.push("/");
      }
    });

    // 2. FETCH DATA FROM THE 3 DIFFERENT APIS
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const [resSelected, resRecommended, resSuggested] = await Promise.all([
          fetch("https://us-central1-summaristt.cloudfunctions.net/getBooks?status=selected"),
          fetch("https://us-central1-summaristt.cloudfunctions.net/getBooks?status=recommended"),
          fetch("https://us-central1-summaristt.cloudfunctions.net/getBooks?status=suggested")
        ]);

        const dataSelected: Book[] = await resSelected.json();
        const dataRecommended: Book[] = await resRecommended.json();
        const dataSuggested: Book[] = await resSuggested.json();

        if (dataSelected && dataSelected.length > 0) setSelectedBook(dataSelected[0]);
        setRecommendedBooks(dataRecommended);
        setSuggestedBooks(dataSuggested);
      } catch (error) {
        console.error("API Fetch Failure Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    return () => unsubscribe();
  }, [router]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("summarist_favorites", JSON.stringify(updated));
  };

  // Combine recommendations and suggestions for search results filtering
  const allSearchableBooks = [...recommendedBooks, ...suggestedBooks];
  const filteredSearchBooks = allSearchableBooks.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* TOP SEARCH HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#032b41]">For You</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome, <span className="font-bold text-gray-700">{user}</span>!</p>
          </div>
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Search by title or author..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black" 
            />
          </div>
        </header>

        {/* CONDITIONAL RENDER: SEARCH RESULT VIEW VS MAIN PORTAL DASHBOARD */}
        {searchQuery ? (
          <div>
            <h3 className="text-lg font-bold text-[#032b41] mb-6">Search Results ({filteredSearchBooks.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSearchBooks.map((book) => (
                <div key={book.id} onClick={() => router.push(`/player/${book.id}`)} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between h-48">
                  <div>
                    <h4 className="font-black text-lg text-[#032b41] leading-snug">{book.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* ROW 1: LIVE SELECTED HIGHLIGHT BANNER */}
            <div>
              <h3 className="text-lg font-bold text-[#032b41] mb-4">Selected Just For You</h3>
              {loading || !selectedBook ? (
                <div className="h-40 bg-white border border-gray-200 rounded-2xl animate-pulse p-6 space-y-4">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="bg-[#fffdf4] border border-[#f3ebc6] rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="space-y-2 max-w-xl">
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Daily Pick</span>
                    <h2 className="text-xl md:text-2xl font-black text-[#032b41]">{selectedBook.title}</h2>
                    <p className="text-xs font-semibold text-gray-500">By {selectedBook.author}</p>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{selectedBook.subTitle}</p>
                  </div>
                  <button onClick={() => router.push(`/player/${selectedBook.id}`)} className="bg-[#032b41] hover:bg-[#043854] text-white font-bold px-6 py-3 rounded-xl shadow-md transition whitespace-nowrap text-sm">
                    ⚡ Open Audio Player
                  </button>
                </div>
              )}
            </div>

            {/* ROW 2: RECOMMENDED BOOKS APIS */}
            <div>
              <h3 className="text-lg font-bold text-[#032b41] mb-6">Recommended For You</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  recommendedBooks.map((book) => (
                    <div 
                      key={book.id} 
                      onClick={() => router.push(`/player/${book.id}`)}
                      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer h-48"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3 inline-block">
                            {book.tags && book.tags.length > 0 ? book.tags[0] : "Insight"}
                          </span>
                          <button onClick={(e) => toggleFavorite(book.id, e)} className="text-xl p-1 -mt-1 hover:scale-110 transition">
                            {favorites.includes(book.id) ? "🔖" : "🫥"}
                          </button>
                        </div>
                        <h4 className="font-black text-lg text-[#032b41] leading-snug line-clamp-1">{book.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
                        <div>⏱️ {book.keyIdeas} key ideas</div>
                        <div className="text-amber-500">⭐ <span className="text-gray-700 font-bold">{book.averageRating}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ROW 3: SUGGESTED BOOKS APIS */}
            <div>
              <h3 className="text-lg font-bold text-[#032b41] mb-6">Suggested Books</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  suggestedBooks.map((book) => (
                    <div 
                      key={book.id} 
                      onClick={() => router.push(`/player/${book.id}`)}
                      className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer h-48"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full mb-3 inline-block">
                            {book.tags && book.tags.length > 0 ? book.tags[0] : "Suggested"}
                          </span>
                          <button onClick={(e) => toggleFavorite(book.id, e)} className="text-xl p-1 -mt-1 hover:scale-110 transition">
                            {favorites.includes(book.id) ? "🔖" : "🫥"}
                          </button>
                        </div>
                        <h4 className="font-black text-lg text-[#032b41] leading-snug line-clamp-1">{book.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{book.author}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
                        <div>⏱️ {book.keyIdeas} key ideas</div>
                        <div className="text-amber-500">⭐ <span className="text-gray-700 font-bold">{book.averageRating}</span></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}