"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Book } from "@/components/types";

export default function PlayerPage() {
  const pathname = usePathname();
  const bookId = pathname.split("/").filter(Boolean).at(-1);
  const [book, setBook] = useState<Pick<Book, "title" | "author" | "summary"> | null>(null);
  const [loading, setLoading] = useState(Boolean(bookId && bookId !== "player"));
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30); // Mock starting percentage
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-600">Loading book summary...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h2 className="text-xl font-bold text-gray-800">Book Summary Not Found</h2>
        <button onClick={() => router.push("/for-you")} className="mt-4 text-blue-600 font-bold hover:underline">
          &larr; Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-gray-800">
      {/* MAIN TEXT SCROLLABLE REGION */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 overflow-y-auto pb-32">
        <button
          onClick={() => router.push("/for-you")}
          className="text-sm font-bold text-gray-500 hover:text-[#032b41] transition mb-8 inline-block"
        >
          &larr; Back to Dashboard
        </button>

        <header className="mb-6 border-b border-gray-100 pb-4">
          <h1 className="text-3xl font-black text-[#032b41] tracking-tight">{book.title}</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Written by {book.author}</p>
        </header>

        <article className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line font-normal">
            {book.summary}
          </p>
        </article>
      </main>

      {/* AUDIO STICKY CONTROLLER PANEL */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#032b41] text-white p-6 border-t border-gray-800 z-50">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Metadata Display */}
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-sm tracking-tight text-white">{book.title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
          </div>

          {/* Interactive Audio Controls */}
          <div className="flex items-center gap-6">
            <button className="text-xl text-gray-400 hover:text-white transition">⏮️</button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full bg-[#11d683] text-[#032b41] text-xl font-bold flex items-center justify-center shadow-md hover:scale-105 transition transform active:scale-95"
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button className="text-xl text-gray-400 hover:text-white transition">⏭️</button>
          </div>

          {/* Audio Slider Control Rail */}
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
    </div>
  );
}
