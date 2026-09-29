"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/app/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import LoginModal from "@/components/LoginModal";

export default function SettingsPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const guest = localStorage.getItem("summarist_guest");

      if (guest) {
        setUserName(guest);
        setUserEmail("guest@summarist.com");
        setIsPremium(localStorage.getItem("summarist_premium") === "true");
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        setUserName(firebaseUser.displayName || "Summarist Member");
        setUserEmail(firebaseUser.email);
        setIsPremium(true);
        setLoading(false);
      } else {
        setUserName(null);
        setUserEmail(null);
        setIsPremium(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#032b41]"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell settings-shell">
      <Sidebar />

      <main className="dashboard-main settings-main">
        <div className="dashboard-content settings-content">
          <header className="book-detail-toolbar settings-toolbar">
            <Link href="/for-you#book-search" className="book-detail-search">
              <span>Search for books</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.2 4.2" />
              </svg>
            </Link>
          </header>

          <header className="settings-header">
            <h1>Settings</h1>
          </header>

          {userName ? (
            <div className="settings-account-content">
              <section className="settings-plan-section">
                <h2>Your Subscription Plan</h2>
                <div className="settings-plan-row">
                  <div>
                    <p className="settings-plan-name">{isPremium ? "Summarist Premium" : "Free Plan"}</p>
                    <p className="settings-plan-description">
                      {isPremium ? "Unlimited access to all book insights and text audio." : "Upgrade to unlock full audio capabilities."}
                    </p>
                  </div>
                  {!isPremium && (
                    <button type="button" onClick={() => router.push("/choose-plan")} className="settings-upgrade-button">
                      Upgrade to Premium <span aria-hidden="true">→</span>
                    </button>
                  )}
                </div>
              </section>

              <section className="settings-account-section">
                <h2>Account Details</h2>
                <dl>
                  <div><dt>User Name</dt><dd>{userName}</dd></div>
                  <div><dt>Email Address</dt><dd>{userEmail}</dd></div>
                </dl>
              </section>
            </div>
          ) : (
            <section className="settings-login-panel">
              <Image
                src="https://summarist.vercel.app/_next/static/media/login.e313e580.png"
                alt=""
                width={460}
                height={317}
                priority
              />
              <p>Log in to your account to see your details.</p>
              <button type="button" onClick={() => setLoginOpen(true)}>Login</button>
            </section>
          )}
          </div>
      </main>
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={() => setLoginOpen(false)}
      />
    </div>
  );
}
