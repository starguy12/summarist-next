"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/app/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "@/components/Sidebar";
import LoginModal from "@/components/LoginModal";
import { Book } from "@/components/types";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.2 4.2" />
    </svg>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={filled ? "is-filled" : ""}>
      <path d="M6.5 4.75A1.75 1.75 0 0 1 8.25 3h7.5a1.75 1.75 0 0 1 1.75 1.75V21l-6-3.8L5.5 21V4.75Z" />
    </svg>
  );
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatSpokenDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes} mins ${remainingSeconds} secs`;
}

function BookCard({
  book,
  isFavorite,
  onToggleFavorite,
}: {
  book: Book;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const [duration, setDuration] = useState<number | null>(null);

  return (
    <article className="book-card">
      <button
        type="button"
        className="book-favorite"
        aria-label={`${isFavorite ? "Remove" : "Add"} ${book.title} ${isFavorite ? "from" : "to"} your library`}
        onClick={() => onToggleFavorite(book.id)}
      >
        <BookmarkIcon filled={isFavorite} />
      </button>
      {book.subscriptionRequired && <span className="book-premium">Premium</span>}
      <Link href={`/book/${book.id}`} className="book-card-link">
        <div className="book-cover-stack">
          <div className="book-premium-slot" aria-hidden="true" />
          <div className="book-cover">
            <Image src={book.imageLink} alt={book.title} fill sizes="196px" />
          </div>
        </div>
        <div className="book-card-copy">
          <h3>{book.title}</h3>
          <p className="book-author">{book.author}</p>
          <p className="book-subtitle">{book.subTitle}</p>
          <div className="book-card-meta">
            <span className="book-duration">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>
              {duration === null ? "00:00" : formatDuration(duration)}
            </span>
            <span className="book-rating">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" /></svg>
              {book.averageRating}
            </span>
          </div>
        </div>
      </Link>
      <audio
        className="book-metadata-audio"
        src={book.audioLink}
        preload="metadata"
        aria-hidden="true"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />
    </article>
  );
}

function BookShelf({
  books,
  loading,
  favorites,
  onToggleFavorite,
}: {
  books: Book[];
  loading: boolean;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="book-rail" aria-label="Loading books">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="book-skeleton" key={index} />
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return <p className="empty-books">No books to show right now.</p>;
  }

  return (
    <div className="book-rail">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          isFavorite={favorites.includes(book.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [suggestedBooks, setSuggestedBooks] = useState<Book[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [resSelected, resRecommended, resSuggested] = await Promise.all([
          fetch("/api/books?status=selected"),
          fetch("/api/books?status=recommended"),
          fetch("/api/books?status=suggested")
        ]);

        const dataSelected = await resSelected.json();
        const dataRecommended = await resRecommended.json();
        const dataSuggested = await resSuggested.json();

        const finalSelected = Array.isArray(dataSelected) ? dataSelected : dataSelected.books || [];
        const finalRecommended = Array.isArray(dataRecommended) ? dataRecommended : dataRecommended.books || dataRecommended || [];
        const finalSuggested = Array.isArray(dataSuggested) ? dataSuggested : dataSuggested.books || dataSuggested || [];

        if (finalSelected.length > 0) {
          setSelectedBook(finalSelected[0]);
        }
        setRecommendedBooks(Array.isArray(finalRecommended) ? finalRecommended : []);
        setSuggestedBooks(Array.isArray(finalSuggested) ? finalSuggested : []);
      } catch (error) {
        console.error("API Fetch Failure Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const guest = typeof window !== "undefined" ? localStorage.getItem("summarist_guest") : null;
      const hasSession = Boolean(firebaseUser || guest);
      if (firebaseUser) {
        setUser(firebaseUser.displayName || "Reader");
      } else {
        setUser(guest ? (guest.includes("@") ? "Guest" : guest) : null);
      }

      if (hasSession) {
        const savedFavs = localStorage.getItem("summarist_favorites");
        if (savedFavs) {
          try {
            const parsedFavorites = JSON.parse(savedFavs);
            setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites.map(String) : []);
          } catch {
            setFavorites([]);
          }
        } else {
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }

      fetchAllData();
    });

    return () => unsubscribe();
  }, []);

  const toggleFavorite = (id: string) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((favId) => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("summarist_favorites", JSON.stringify(updated));
  };

  const allSearchableBooks = [...recommendedBooks, ...suggestedBooks];
  const filteredSearchBooks = allSearchableBooks.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-content">
          <header className="dashboard-toolbar">
            {user && <div className="dashboard-account" aria-label={`Signed in as ${user}`}>
              <span className="account-avatar">{user.charAt(0).toUpperCase()}</span>
              <span>{user}</span>
            </div>}
            <label className="dashboard-search" htmlFor="book-search">
              <input
                id="book-search"
                type="search"
                placeholder="Search for books"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <SearchIcon />
            </label>
          </header>

          {searchQuery.trim() ? (
            <section className="dashboard-section search-results">
              <div className="section-heading">
                <h1>Search results</h1>
                <p>{filteredSearchBooks.length} books</p>
              </div>
              <div className="book-rail search-book-grid">
                {filteredSearchBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isFavorite={favorites.includes(book.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          ) : (
            <>
              <section className="dashboard-section featured-section">
                <div className="section-heading">
                  <h1>Selected just for you</h1>
                </div>
                {loading || !selectedBook ? (
                  <div className="featured-skeleton" aria-label="Loading selected book" />
                ) : (
                  <Link href={`/book/${selectedBook.id}`} className="featured-book">
                    <p className="featured-subtitle">{selectedBook.subTitle}</p>
                    <div className="featured-cover">
                      <Image src={selectedBook.imageLink} alt={selectedBook.title} fill sizes="140px" />
                    </div>
                    <div className="featured-book-copy">
                      <h2>{selectedBook.title}</h2>
                      <p className="featured-author">{selectedBook.author}</p>
                      {selectedDuration !== null && (
                        <div className="featured-duration-wrapper">
                          <span className="featured-duration-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></svg>
                          </span>
                          <p className="featured-duration">{formatSpokenDuration(selectedDuration)}</p>
                        </div>
                      )}
                    </div>
                    <audio
                      className="book-metadata-audio"
                      src={selectedBook.audioLink}
                      preload="metadata"
                      aria-hidden="true"
                      onLoadedMetadata={(event) => setSelectedDuration(event.currentTarget.duration)}
                    />
                  </Link>
                )}
              </section>

              <section className="dashboard-section">
                <div className="section-heading section-heading-with-description">
                  <div>
                    <h2>Recommended For You</h2>
                    <p>We think you’ll like these</p>
                  </div>
                </div>
                <BookShelf books={recommendedBooks} loading={loading} favorites={favorites} onToggleFavorite={toggleFavorite} />
              </section>

              <section className="dashboard-section">
                <div className="section-heading section-heading-with-description">
                  <div>
                    <h2>Suggested Books</h2>
                    <p>Browse those books</p>
                  </div>
                </div>
                <BookShelf books={suggestedBooks} loading={loading} favorites={favorites} onToggleFavorite={toggleFavorite} />
              </section>
            </>
          )}
        </div>
      </main>
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={(identifier) => setUser(identifier.includes("@") ? "Guest" : identifier)}
      />
    </div>
  );
}
