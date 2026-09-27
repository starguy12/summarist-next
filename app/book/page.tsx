"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Book } from "@/components/types";

export default function BookSummaryPage() {
  const pathname = usePathname();
  const bookId = pathname.split("/").filter(Boolean).at(-1);
  const [book, setBook] = useState<Pick<Book, "title" | "author" | "summary" | "subscriptionRequired"> | null>(null);
  const [loading, setLoading] = useState(Boolean(bookId && bookId !== "book"));
  const router = useRouter();

  useEffect(() => {
    if (!bookId || bookId === "book") {
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
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <button onClick={() => router.push("/for-you")} className="text-sm font-semibold text-gray-500 hover:text-[#032b41] transition mb-6 block">
          &larr; Back to Dashboard
        </button>

        <header className="border-b border-gray-100 pb-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#032b41] mb-2">{book.title}</h1>
              <p className="text-gray-500 font-medium">By {book.author}</p>
            </div>
            {book.subscriptionRequired && (
              <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                premium
              </span>
            )}
          </div>
        </header>

        <article className="prose max-w-none">
          <h3 className="text-lg font-bold text-[#032b41] mb-4">Core Summary Insights</h3>
          <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">{book.summary}</p>
        </article>
      </div>
    </div>
  );
}
