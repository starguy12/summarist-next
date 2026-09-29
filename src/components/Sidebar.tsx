"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/firebase";
import LoginModal from "@/components/LoginModal";

type IconName = "book" | "bookmark" | "spark" | "search" | "settings" | "help" | "logout" | "login";

function SidebarIcon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "book" && <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6" /></>}
      {name === "bookmark" && <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.8L6 21V4.75Z" />}
      {name === "spark" && <><path d="m12 3 1.9 5.8L20 11l-6.1 2.1L12 19l-1.9-5.9L4 11l6.1-2.2L12 3Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></>}
      {name === "search" && <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.2 4.2" /></>}
      {name === "settings" && <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.2.9-1.2 2.1-1.5-.5a7.8 7.8 0 0 1-1.7 1l-.3 1.6h-2.4l-.3-1.6a7.8 7.8 0 0 1-1.7-1l-1.5.5-1.2-2.1 1.2-.9a7.5 7.5 0 0 1 0-2l-1.2-.9 1.2-2.1 1.5.5a7.8 7.8 0 0 1 1.7-1l.3-1.6h2.4l.3 1.6a7.8 7.8 0 0 1 1.7 1l1.5-.5 1.2 2.1-1.2.9a7.5 7.5 0 0 1-.1 1.9Z" transform="translate(-1 -1)" /></>}
      {name === "help" && <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.4 2.4 0 1 1 4.2 1.6c-.9 1-1.9 1.2-1.9 2.9M12 17.2v.1" /></>}
      {name === "logout" && <><path d="M12 4H5v16h7" /><path d="M9 12h11m-4-4 4 4-4 4" /></>}
      {name === "login" && <><path d="M14 5h5v14h-5M10 8l4 4-4 4M14 12H4" /></>}
    </svg>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setHasSession(Boolean(firebaseUser || localStorage.getItem("summarist_guest")));
    });
    return () => unsubscribe();
  }, []);

  const navigate = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem("summarist_guest");
    localStorage.removeItem("summarist_premium");
    await signOut(auth);
    router.push("/");
  };

  const handleLogin = () => {
    setMenuOpen(false);
    setLoginOpen(true);
  };

  const isForYou = pathname === "/dashboard" || pathname === "/for-you";
  const isLibrary = pathname === "/library";
  const isSettings = pathname === "/settings-page" || pathname === "/settings";

  return (
    <>
      <button className="mobile-menu-toggle" type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}>
        <span /><span /><span />
      </button>
      <aside className={`app-sidebar${menuOpen ? " is-open" : ""}`}>
        <button className="sidebar-brand" type="button" onClick={() => navigate("/for-you")} aria-label="Summarist home">
          <span>Summarist</span><span className="brand-period">.</span>
        </button>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <button type="button" onClick={() => navigate("/for-you")} className={`sidebar-link${isForYou ? " is-active" : ""}`} aria-current={isForYou ? "page" : undefined}>
            <SidebarIcon name="book" /><span>For you</span>
          </button>
          <button type="button" onClick={() => navigate("/my-library")} className={`sidebar-link${isLibrary ? " is-active" : ""}`} aria-current={isLibrary ? "page" : undefined}>
            <SidebarIcon name="bookmark" /><span>My Library</span>
          </button>
          <button type="button" className="sidebar-link" disabled aria-disabled="true">
            <SidebarIcon name="spark" /><span>Highlights</span>
          </button>
          <button type="button" onClick={() => navigate("/for-you#book-search")} className="sidebar-link">
            <SidebarIcon name="search" /><span>Search</span>
          </button>
        </nav>

        <div className="sidebar-lower">
          <button type="button" onClick={() => navigate("/settings")} className={`sidebar-link${isSettings ? " is-active" : ""}`} aria-current={isSettings ? "page" : undefined}>
            <SidebarIcon name="settings" /><span>Settings</span>
          </button>
          <button type="button" className="sidebar-link" disabled aria-disabled="true">
            <SidebarIcon name="help" /><span>Help &amp; Support</span>
          </button>
        </div>

        {hasSession ? (
          <button type="button" className="sidebar-logout" onClick={handleLogout}>
            <SidebarIcon name="logout" /><span>Log out</span>
          </button>
        ) : (
          <button type="button" className="sidebar-logout" onClick={handleLogin}>
            <SidebarIcon name="login" /><span>Login</span>
          </button>
        )}
      </aside>
      <button className={`sidebar-overlay${menuOpen ? " is-open" : ""}`} type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onLoginSuccess={() => setHasSession(true)} />
    </>
  );
}
