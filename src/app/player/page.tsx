"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase";
import Sidebar from "@/components/Sidebar";
import LoginModal from "@/components/LoginModal";
import type { Book } from "@/components/types";

function SearchBooksLink({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="book-detail-toolbar">
      <Link href="/for-you#book-search" className="book-detail-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.2 4.2" />
        </svg>
        <span>Search for books</span>
      </Link>
      {isAuthenticated && <span className="account-avatar" aria-label="Your account">G</span>}
    </header>
  );
}

export default function PlayerPage() {
  const pathname = usePathname();
  const bookId = pathname.split("/").filter(Boolean).at(-1);
  const [book, setBook] = useState<Pick<Book, "title" | "author" | "summary" | "subscriptionRequired"> | null>(null);
  const [loading, setLoading] = useState(Boolean(bookId && bookId !== "player"));
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30); // Mock starting percentage
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsAuthenticated(Boolean(firebaseUser || localStorage.getItem("summarist_guest")));
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!bookId || bookId === "player") {
      return;
    }

    const controller = new AbortController();

    const fetchBook = async () => {
      try {
        const response = await fetch(`/api/books?id=${encodeURIComponent(bookId)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Book details could not be loaded");
        }

        const data = await response.json();
        const result = Array.isArray(data) ? data[0] : data.book ?? data;
        if (result?.title && result?.summary) {
          setBook(result);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Book details fetch failed:", error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchBook();
    return () => controller.abort();
  }, [bookId]);

  if (loading || !authChecked) {
    return (
      <div className="book-detail-shell">
        <Sidebar />
        <main className="book-detail-main">
          <div className="book-detail-content">
            <SearchBooksLink isAuthenticated={isAuthenticated} />
            <p className="py-12 text-center text-sm text-gray-500">Loading book summary...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="book-detail-shell">
        <Sidebar />
        <main className="book-detail-main">
          <div className="book-detail-content">
            <SearchBooksLink isAuthenticated={false} />
            <section className="settings-login-panel player-login-panel">
              <Image
                src="https://summarist.vercel.app/_next/static/media/login.e313e580.png"
                alt=""
                width={460}
                height={317}
                priority
              />
              <p>Log in to listen to this title.</p>
              <button type="button" onClick={() => setLoginOpen(true)}>Login</button>
            </section>
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

  if (!book) {
    return (
      <div className="book-detail-shell">
        <Sidebar />
        <main className="book-detail-main">
          <div className="book-detail-content">
            <SearchBooksLink isAuthenticated={isAuthenticated} />
            <section className="book-not-found">
              <h1>Book summary not found</h1>
              <Link href="/for-you">Browse books <span aria-hidden="true">→</span></Link>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="book-detail-shell">
      <Sidebar />
      <main className="book-detail-main">
        <div className="book-detail-content player-page-content">
          <SearchBooksLink isAuthenticated={isAuthenticated} />
          <article className="player-reading-content">
            <button
              onClick={() => router.push("/for-you")}
              className="text-sm font-bold text-gray-500 hover:text-[#032b41] transition mb-8 inline-block"
            >
              &larr; Back to Dashboard
            </button>

            <header className="mb-6 border-b border-gray-100 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-[#032b41] tracking-tight">{book.title}</h1>
                  <p className="text-gray-500 font-medium text-sm mt-1">Written by {book.author}</p>
                </div>
                {book.subscriptionRequired && (
                  <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    premium
                  </span>
                )}
              </div>
            </header>

            <article className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line font-normal">
                {book.summary}
              </p>
            </article>
          </article>
        </div>
      </main>

      <footer className="player-control-panel fixed bottom-0 right-0 bg-[#032b41] text-white p-6 border-t border-gray-800 z-50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-sm tracking-tight text-white">{book.title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
          </div>

          <div className="flex items-center gap-6">
            <button type="button" aria-label="Previous chapter" className="text-xl text-gray-400 hover:text-white transition">⏮️</button>
            <button
              type="button"
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full bg-[#11d683] text-[#032b41] text-xl font-bold flex items-center justify-center shadow-md hover:scale-105 transition transform active:scale-95"
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button type="button" aria-label="Next chapter" className="text-xl text-gray-400 hover:text-white transition">⏭️</button>
          </div>

          <div className="w-full sm:w-64 flex items-center gap-3 text-xs font-mono text-gray-300">
            <span>0:45</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#11d683]"
            />
            <span>3:15</span>
          </div>
        </div>
      </footer>
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    </div>
  );
}
