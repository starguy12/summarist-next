"use client";

import React, { useEffect, useRef, useState } from "react";
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

function formatPlaybackTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

type PlayerBook = Pick<Book, "title" | "author" | "audioLink" | "imageLink">;

function PlayerTrackIdentity({ book }: { book: PlayerBook }) {
  return (
    <div className="player-track-identity">
      <div className="player-track-cover">
        <Image src={book.imageLink} alt="" fill sizes="48px" priority />
      </div>
      <div className="player-track-copy">
        <h4>{book.title}</h4>
        <p>{book.author}</p>
      </div>
    </div>
  );
}

function PlayerController({
  book,
  canPlay,
  onRequireLogin,
}: {
  book: PlayerBook;
  canPlay: boolean;
  onRequireLogin: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const togglePlayback = async () => {
    if (!canPlay) {
      onRequireLogin();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        setPlaybackError(null);
        await audio.play();
      } catch {
        setIsPlaying(false);
        setPlaybackError("Audio could not be played. Please try again.");
      }
    } else {
      audio.pause();
    }
  };

  const seekTo = (time: number) => {
    if (!canPlay) {
      onRequireLogin();
      return;
    }
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = Math.max(0, Math.min(time, duration || time));
    setCurrentTime(audio.currentTime);
  };

  return (
    <footer className="player-control-panel fixed bottom-0 right-0 bg-[#032b41] text-white border-t border-gray-800 z-50">
      <div className="player-controller-layout">
        <PlayerTrackIdentity book={book} />

        <div className="player-controls">
          <button
            type="button"
            aria-label="Rewind 10 seconds"
            onClick={() => seekTo(currentTime - 10)}
            disabled={canPlay && !duration}
            className="player-skip-button"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6 4 12l6 6M20 6l-6 6 6 6" /></svg>
          </button>
          <button
            type="button"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            onClick={togglePlayback}
            disabled={canPlay && !book.audioLink}
            className="player-play-button"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {isPlaying ? <path d="M7 5h4v14H7zM15 5h4v14h-4z" /> : <path d="M7 4.8a1 1 0 0 1 1.5-.86l10 7.2a1.05 1.05 0 0 1 0 1.72l-10 7.2A1 1 0 0 1 7 19.2V4.8Z" />}
            </svg>
          </button>
          <button
            type="button"
            aria-label="Forward 10 seconds"
            onClick={() => seekTo(currentTime + 10)}
            disabled={canPlay && !duration}
            className="player-skip-button"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6 6 6-6 6M4 6l6 6-6 6" /></svg>
          </button>
        </div>

        <div className="player-progress">
          <span>{formatPlaybackTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            disabled={canPlay && !duration}
            aria-label="Seek audio"
            onChange={(event) => seekTo(Number(event.target.value))}
          />
          <span>{formatPlaybackTime(duration)}</span>
        </div>
      </div>
      {playbackError && <p role="status" className="mt-2 text-center text-xs text-red-200">{playbackError}</p>}
      <audio
        ref={audioRef}
        className="book-metadata-audio"
        src={book.audioLink}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setPlaybackError("Audio could not be loaded. Please try again.");
        }}
      />
    </footer>
  );
}

export default function PlayerPage() {
  const pathname = usePathname();
  const bookId = pathname.split("/").filter(Boolean).at(-1);
  const [book, setBook] = useState<Pick<Book, "title" | "author" | "summary" | "subscriptionRequired" | "audioLink" | "imageLink"> | null>(null);
  const [loading, setLoading] = useState(Boolean(bookId && bookId !== "player"));
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
        {book && (
          <PlayerController book={book} canPlay={false} onRequireLogin={() => setLoginOpen(true)} />
        )}
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

      <PlayerController book={book} canPlay onRequireLogin={() => setLoginOpen(true)} />
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => setIsAuthenticated(true)}
      />
    </div>
  );
}
