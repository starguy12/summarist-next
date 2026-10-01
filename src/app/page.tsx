"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoginModal from "@/components/LoginModal";

const features = [
  {
    title: "Read or listen",
    description: "Save time by getting the core ideas from the best books.",
    icon: "book",
  },
  {
    title: "Find your next read",
    description: "Explore book lists and personalized recommendations.",
    icon: "idea",
  },
  {
    title: "Briefcasts",
    description: "Gain valuable insights from briefcasts",
    icon: "audio",
  },
] as const;

const memberBenefits = [
  "Enhance your knowledge",
  "Achieve greater success",
  "Improve your health",
  "Develop better parenting skills",
  "Increase happiness",
  "Be the best version of yourself!",
];

const memberStatistics = [
  <><b>significantly increase</b> reading frequency.</>,
  <><b>establish better</b> habits.</>,
  <>have made <b>significant positive</b> change to their lives.</>,
  <><b>report feeling more productive</b> after incorporating the service into their daily routine.</>,
  <>have <b>noticed an improvement</b> in their overall comprehension and retention of information.</>,
  <><b>feel more informed</b> about current events and industry trends since using the platform.</>,
];

const testimonials = [
  {
    name: "Hanna M.",
    quote: "This app has been a game-changer for me! It's saved me so much time and effort in reading and comprehending books. Highly recommend it to all book lovers.",
  },
  {
    name: "David B.",
    quote: "I love this app! It provides concise and accurate summaries of books in a way that is easy to understand. It's also very user-friendly and intuitive.",
  },
  {
    name: "Nathan S.",
    quote: "This app is a great way to get the main takeaways from a book without having to read the entire thing. The summaries are well-written and informative. Definitely worth downloading.",
  },
  {
    name: "Ryan R.",
    quote: "If you're a busy person who loves reading but doesn't have the time to read every book in full, this app is for you! The summaries are thorough and provide a great overview of the book's content.",
  },
];

const footerGroups = [
  { title: "Actions", links: ["Summarist Magazine", "Cancel Subscription", "Help", "Contact us"] },
  { title: "Useful Links", links: ["Pricing", "Summarist Business", "Gift Cards", "Authors & Publishers"] },
  { title: "Company", links: ["About", "Careers", "Partners", "Code of Conduct"] },
  { title: "Other", links: ["Sitemap", "Legal Notice", "Terms of Service", "Privacy Policies"] },
];

function FeatureIcon({ name }: { name: "book" | "idea" | "audio" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === "book" && <><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Z" /><path d="M5 17.5A2.5 2.5 0 0 1 7.5 15H20M9 6h7M9 9h7" /></>}
      {name === "idea" && <><path d="M8.2 14.8a6 6 0 1 1 7.6 0c-.9.7-1.3 1.6-1.4 2.7h-4.8c-.1-1.1-.5-2-1.4-2.7Z" /><path d="M9.5 20h5M10.5 22h3" /></>}
      {name === "audio" && <><path d="M4 13v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="12" width="4" height="7" rx="2" /><rect x="17" y="12" width="4" height="7" rx="2" /><path d="M17 19a5 5 0 0 1-5 3h-1" /></>}
    </svg>
  );
}

function MetricIcon({ name }: { name: "download" | "rating" | "habit" }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      {name === "download" && <><path d="M13 4h14a3 3 0 0 1 3 3v26H10V7a3 3 0 0 1 3-3Z" /><path d="M16 29h8M20 9v12m-5-5 5 5 5-5" /></>}
      {name === "rating" && <><path d="m20 4 4.8 9.7 10.7 1.6-7.8 7.6 1.8 10.7L20 28.5l-9.5 5.1 1.8-10.7-7.8-7.6 10.7-1.6L20 4Z" /></>}
      {name === "habit" && <><path d="M6 33V20m9 13V12m9 21V7m9 26V16" /><path d="m5 13 9-5 8 4 10-7" /></>}
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLoginSuccess = () => {
    setIsModalOpen(false);
    router.push("/for-you");
  };

  return (
    <div className="home-shell">
      <nav className="home-nav" aria-label="Main navigation">
        <div className="home-nav-inner">
          <a className="home-brand" href="/" aria-label="Summarist home">
            <Image
              src="https://summarist.vercel.app/_next/static/media/logo.1b1c490b.png"
              alt="Summarist"
              width={200}
              height={46}
              priority
            />
          </a>
          <div className="home-nav-links">
            <button type="button" onClick={() => setIsModalOpen(true)}>Login</button>
            <a href="#features">About</a>
            <a href="#footer">Contact</a>
            <a href="mailto:support@summarist.com">Help</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="home-hero" id="landing">
          <div className="home-hero-inner">
            <div className="home-hero-copy">
              <h1>Gain more knowledge<br />in less time</h1>
              <p>Great summaries for busy people, individuals who barely have time to read, and even people who don’t like to read.</p>
              <button type="button" onClick={() => setIsModalOpen(true)}>Login</button>
            </div>
            <div className="home-hero-image">
              <Image
                src="https://summarist.vercel.app/_next/static/media/landing.e4787d01.png"
                alt="A person listening to a book summary"
                fill
                priority
                sizes="(max-width: 720px) 0px, 400px"
              />
            </div>
          </div>
        </section>

        <section className="home-features" id="features">
          <div className="home-content-width">
            <h2 className="home-section-heading">Understand books in few minutes</h2>
            <div className="home-feature-grid">
              {features.map((feature) => (
                <article className="home-feature" key={feature.title}>
                  <div className="home-feature-icon"><FeatureIcon name={feature.icon} /></div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>

            <div className="home-statistics">
              <div className="home-benefit-grid">
                {memberBenefits.map((benefit, index) => (
                  <div className={`home-benefit${index === 0 ? " is-active" : ""}`} key={benefit}>{benefit}</div>
                ))}
              </div>
              <div className="home-stat-row">
                {memberStatistics.slice(0, 3).map((copy, index) => (
                  <article className="home-stat" key={index}>
                    <strong>{["93%", "96%", "90%"][index]}</strong>
                    <p>{index === 2 ? copy : <>of Summarist members {copy}</>}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="home-statistics home-statistics-second">
              <div className="home-stat-row">
                {memberStatistics.slice(3).map((copy, index) => (
                  <article className="home-stat" key={index}>
                    <strong>{["91%", "94%", "88%"][index]}</strong>
                    <p>of Summarist members {copy}</p>
                  </article>
                ))}
              </div>
              <div className="home-benefit-grid">
                {memberBenefits.map((benefit) => <div className="home-benefit" key={benefit}>{benefit.replace("Enhance", "Expand").replace("Achieve greater success", "Accomplish your goals").replace("Improve your health", "Strengthen your vitality").replace("Develop better parenting skills", "Become a better caregiver").replace("Increase happiness", "Improve your mood").replace("Be the best version of yourself!", "Maximize your abilities")}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="home-reviews" id="reviews">
          <div className="home-content-width">
            <h2 className="home-section-heading">What our members say</h2>
            <div className="home-review-grid">
              {testimonials.map((review) => (
                <article className="home-review" key={review.name}>
                  <div className="home-review-header">
                    <h3>{review.name}</h3>
                    <div className="home-stars" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }, (_, index) => <span key={index} aria-hidden="true">★</span>)}
                    </div>
                  </div>
                  <p>{review.quote}</p>
                </article>
              ))}
            </div>
            <div className="home-reviews-login">
              <button type="button" onClick={() => setIsModalOpen(true)}>Login</button>
            </div>
          </div>
        </section>

        <section className="home-numbers" id="numbers">
          <div className="home-content-width">
            <h2 className="home-section-heading">Start growing with Summarist now</h2>
            <div className="home-metric-grid">
              <article className="home-metric">
                <MetricIcon name="download" />
                <strong>3 Million</strong>
                <p>Downloads on all platforms</p>
              </article>
              <article className="home-metric">
                <div className="home-platform-stars" aria-label="5 platform ratings">
                  {Array.from({ length: 5 }, (_, index) => <span key={index} aria-hidden="true">★</span>)}
                </div>
                <strong>4.5 Stars</strong>
                <p>Average ratings on iOS and Google Play</p>
              </article>
              <article className="home-metric">
                <MetricIcon name="habit" />
                <strong>97%</strong>
                <p>Of Summarist members create a better reading habit</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer" id="footer">
        <div className="home-content-width">
          <div className="home-footer-grid">
            {footerGroups.map((group) => (
              <section className="home-footer-group" key={group.title}>
                <h2>{group.title}</h2>
                <ul>{group.links.map((link) => <li key={link}><a href={link === "Pricing" ? "/choose-plan" : "#footer"}>{link}</a></li>)}</ul>
              </section>
            ))}
          </div>
          <p className="home-copyright">Copyright © 2023 Summarist.</p>
        </div>
      </footer>

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}