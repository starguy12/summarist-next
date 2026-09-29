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

type BookDetails = Book & {
  totalRating?: number;
  bookDescription?: string;
  authorDescription?: string;
};

function DetailIcon({ name }: { name: "star" | "clock" | "format" | "ideas" | "read" | "listen" | "bookmark" | "search" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "star" && <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />}
      {name === "clock" && <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>}
      {name === "format" && <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6" /></>}
      {name === "ideas" && <><path d="M9 18h6M10 21h4M8.1 14.5a6 6 0 1 1 7.8 0c-.8.7-1.1 1.4-1.2 2.5h-5.4c-.1-1.1-.4-1.8-1.2-2.5Z" /></>}
      {name === "read" && <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6" /></>}
      {name === "listen" && <><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="12" width="4" height="7" rx="2" /><rect x="17" y="12" width="4" height="7" rx="2" /><path d="M17 19a5 5 0 0 1-5 3h-1" /></>}
      {name === "bookmark" && <path d="M6.5 4.75A1.75 1.75 0 0 1 8.25 3h7.5a1.75 1.75 0 0 1 1.75 1.75V21l-6-3.8L5.5 21V4.75Z" />}
      {name === "search" && <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.2 4.2" /></>}
    </svg>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function BookSummaryPage() {
  const pathname = usePathname();
  const bookId = pathname.split("/").filter(Boolean).at(-1);
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(Boolean(bookId && bookId !== "book"));
  const [duration, setDuration] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!bookId || bookId === "book") {
      return;
    }

    const controller = new AbortController();

    const fetchBook = async () => {
      try {
        setLoading(true);
        setBook(null);
        const response = await fetch(`/api/books?id=${encodeURIComponent(bookId)}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Book details could not be loaded");
        }

        const data = await response.json();
        const result = Array.isArray(data) ? data[0] : data.book ?? data;
        if (result?.title) {
          setBook(result as BookDetails);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const hasSession = Boolean(firebaseUser || localStorage.getItem("summarist_guest"));
      setIsAuthenticated(hasSession);
      if (!hasSession || !bookId) {
        setIsSaved(false);
        return;
      }

      try {
        const savedIds: string[] = JSON.parse(localStorage.getItem("summarist_favorites") || "[]");
        setIsSaved(Array.isArray(savedIds) && savedIds.includes(bookId));
      } catch {
        setIsSaved(false);
      }
    });
    return () => unsubscribe();
  }, [bookId]);

  const toggleSaved = () => {
    if (!bookId) return;
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    let savedIds: string[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem("summarist_favorites") || "[]");
      if (Array.isArray(parsed)) savedIds = parsed.map(String);
    } catch {
      savedIds = [];
    }
    const updated = isSaved ? savedIds.filter((id) => id !== bookId) : [...savedIds, bookId];
    localStorage.setItem("summarist_favorites", JSON.stringify(updated));
    setIsSaved(!isSaved);
  };

  const handleRead = () => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    document.getElementById("book-about")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleListen = () => {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }
    router.push(`/player/${book?.id}`);
  };

  if (loading) {
    return (
      <div className="book-detail-shell">
        <Sidebar />
        <main className="book-detail-main">
          <div className="book-detail-content">
            <div className="book-detail-loading" aria-label="Loading book details">
              <div className="detail-skeleton-cover" />
              <div className="detail-skeleton-copy"><span /><span /><span /><span /></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-shell">
        <Sidebar />
        <main className="book-detail-main">
          <div className="book-detail-content">
            <section className="book-not-found">
              <h1>Book not found</h1>
              <p>We couldn’t load this title. It may have been removed.</p>
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
        <div className="book-detail-content">
          <header className="book-detail-toolbar">
            <Link href="/for-you#book-search" className="book-detail-search">
              <DetailIcon name="search" />
              <span>Search for books</span>
            </Link>
            {isAuthenticated && <span className="account-avatar" aria-label="Your account">G</span>}
          </header>

          <div className="book-detail-layout">
            <article className="book-detail-copy">
              <header className="book-detail-heading">
                {book.subscriptionRequired && <span className="detail-premium">Premium</span>}
                <h1>{book.title}</h1>
                <p className="detail-author">{book.author}</p>
                <p className="detail-subtitle">{book.subTitle}</p>
              </header>

              <div className="book-detail-metrics" aria-label="Book information">
                <div className="detail-metric"><DetailIcon name="star" /><span>{book.averageRating}</span><small>({book.totalRating ?? 0} ratings)</small></div>
                {duration !== null && <div className="detail-metric"><DetailIcon name="clock" /><span>{formatDuration(duration)}</span></div>}
                <div className="detail-metric"><DetailIcon name="format" /><span>{book.type}</span></div>
                <div className="detail-metric"><DetailIcon name="ideas" /><span>{book.keyIdeas} Key ideas</span></div>
              </div>

              <div className="book-detail-actions">
                <button type="button" className="detail-action detail-action-primary" onClick={handleRead}>
                  <DetailIcon name="read" /> Read
                </button>
                <button type="button" className="detail-action detail-action-secondary" onClick={handleListen}>
                  <DetailIcon name="listen" /> Listen
                </button>
              </div>

              <button type="button" className={`detail-save${isSaved ? " is-saved" : ""}`} onClick={toggleSaved} aria-pressed={isSaved}>
                <DetailIcon name="bookmark" />
                {isSaved ? "Added to My Library" : "Add title to My Library"}
              </button>

              <section className="book-about-section" id="book-about">
                <h2>What’s it about?</h2>
                {book.tags.length > 0 && (
                  <div className="book-detail-tags">
                    {book.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                )}
                <p>{book.bookDescription || book.summary}</p>
              </section>

              {book.authorDescription && (
                <section className="book-author-section">
                  <h2>About the author</h2>
                  <p>{book.authorDescription}</p>
                </section>
              )}
            </article>

            <figure className="book-detail-cover">
              <div className="book-detail-cover-frame">
                <Image src={book.imageLink} alt={book.title} fill sizes="(max-width: 720px) 180px, 300px" priority />
              </div>
            </figure>
          </div>
          <audio
            className="book-metadata-audio"
            src={book.audioLink}
            preload="metadata"
            aria-hidden="true"
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          />
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
