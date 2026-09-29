"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase";
import Sidebar from "@/components/Sidebar";
import LoginModal from "@/components/LoginModal";
import type { Book } from "@/components/types";

export default function MyLibraryPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const loadBooks = async () => {
      try {
        const responses = await Promise.all([
          fetch("/api/books?status=selected", { signal: controller.signal }),
          fetch("/api/books?status=recommended", { signal: controller.signal }),
          fetch("/api/books?status=suggested", { signal: controller.signal }),
        ]);
        const groups = await Promise.all(responses.map((response) => response.json()));
        const results = groups.flatMap((data) => Array.isArray(data) ? data : data.books || []);
        setBooks(results);
      } catch (error) {
        if (!controller.signal.aborted) console.error("Library books could not be loaded:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const hasSession = Boolean(firebaseUser || localStorage.getItem("summarist_guest"));
      setIsAuthenticated(hasSession);

      if (!hasSession) {
        setSavedIds([]);
        setLoading(false);
        return;
      }

      try {
        const saved = JSON.parse(localStorage.getItem("summarist_favorites") || "[]");
        setSavedIds(Array.isArray(saved) ? saved.map(String) : []);
      } catch {
        setSavedIds([]);
      }

      void loadBooks();
    });

    return () => {
      unsubscribe();
      controller.abort();
    };
  }, []);

  const savedBooks = books.filter((book) => savedIds.includes(book.id));

  const handleRemoveFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedIds = savedIds.filter((savedId) => savedId !== id);
    setSavedIds(updatedIds);
    localStorage.setItem("summarist_favorites", JSON.stringify(updatedIds));
  };

  return (
    <div className="dashboard-shell library-shell">
      <Sidebar />

      <main className="dashboard-main library-main">
        <div className="dashboard-content library-content">
          <header className="book-detail-toolbar library-toolbar">
            <Link href="/for-you#book-search" className="book-detail-search">
              <span>Search for books</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.2 4.2" />
              </svg>
            </Link>
          </header>

          <header className="library-page-header">
            <div>
              <h1>My Library</h1>
              <p>Your bookmarked and saved summaries.</p>
            </div>
            <button type="button" onClick={() => router.push("/for-you")}>
              Browse More Books <span aria-hidden="true">→</span>
            </button>
          </header>

          {loading ? (
            <p className="py-12 text-center text-sm text-gray-500">Loading your library...</p>
          ) : !isAuthenticated ? (
            <section className="settings-login-panel library-login-panel">
              <p>Log in to see your saved books.</p>
              <button type="button" onClick={() => setLoginOpen(true)}>Login</button>
            </section>
          ) : savedBooks.length === 0 ? (
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
                  onClick={() => router.push(`/book/${book.id}`)}
                  className="bg-white p-5 rounded border border-gray-200 shadow-sm hover:shadow-md transition duration-200 flex gap-4 cursor-pointer relative"
                >
                  <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded bg-gray-100">
                    <Image src={book.imageLink} alt={book.title} fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="font-bold leading-snug text-[#032b41]">{book.title}</h2>
                        <p className="mt-1 truncate text-sm text-gray-500">{book.author}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => handleRemoveFavorite(book.id, event)}
                        className="shrink-0 p-1 text-gray-500 transition hover:text-[#08774f]"
                        aria-label={`Remove ${book.title} from your library`}
                        title="Remove from library"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.7]"><path d="M6.5 4.75A1.75 1.75 0 0 1 8.25 3h7.5a1.75 1.75 0 0 1 1.75 1.75V21l-6-3.8L5.5 21V4.75Z" /></svg>
                      </button>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{book.subTitle}</p>
                    <div className="mt-auto flex items-center justify-between pt-3 text-xs text-gray-500">
                      <span>{book.keyIdeas} key ideas</span>
                      <span className="font-semibold text-gray-700"><span className="text-amber-500">★</span> {book.averageRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    </div>
  );
}
