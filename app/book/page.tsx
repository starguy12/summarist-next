"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Expanded database containing summaries
const BOOK_DATABASE: Record<string, { title: string; author: string; summary: string }> = {
  "1": {
    title: "Atomic Habits",
    author: "James Clear",
    summary: "An atomic habit is a regular practice or routine that is not only small and easy to do but is also the source of incredible power. Bad habits repeat themselves again and again not because you don't want to change, but because you have the wrong system for change. To build better habits, use the Four Laws of Behavior Change: Make it obvious, make it attractive, make it easy, and make it satisfying."
  },
  "2": {
    title: "The Lean Startup",
    author: "Eric Ries",
    summary: "Most startups fail. But many of those failures are preventable. The Lean Startup approach fosters companies that are both more capital efficient and that leverage human creativity more effectively. It is about launching a minimum viable product (MVP), measuring how customers respond, and learning whether to pivot or persevere."
  },
  "3": {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    summary: "Two systems drive the way we think. System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical. Understanding how these two frameworks battle for control over our decisions can help us avoid cognitive biases and make better personal and professional choices."
  }
};

export default function BookSummaryPage() {
  const [bookId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const pathSegments = window.location.pathname.split("/");
    return pathSegments[pathSegments.length - 1] || null;
  });
  const router = useRouter();

  const book = bookId ? BOOK_DATABASE[bookId] : null;

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
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <button onClick={() => router.push("/for-you")} className="text-sm font-semibold text-gray-500 hover:text-[#032b41] transition mb-6 block">
          &larr; Back to Dashboard
        </button>

        <header className="border-b border-gray-100 pb-6 mb-6">
          <h1 className="text-3xl font-black text-[#032b41] mb-2">{book.title}</h1>
          <p className="text-gray-500 font-medium">By {book.author}</p>
        </header>

        <article className="prose max-w-none">
          <h3 className="text-lg font-bold text-[#032b41] mb-4">Core Summary Insights</h3>
          <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">{book.summary}</p>
        </article>
      </div>
    </div>
  );
}
