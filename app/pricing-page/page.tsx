"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<"yearly" | "monthly">("yearly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const router = useRouter();

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate an API call processing payment info securely
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      // Save subscription state locally so the /settings tab updates instantly
      localStorage.setItem("summarist_premium", "true");
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl max-w-md w-full space-y-4">
          <span className="text-5xl block animate-bounce">✨</span>
          <h2 className="text-2xl font-black text-[#032b41]">Payment Successful!</h2>
          <p className="text-gray-600 text-sm">Welcome to Summarist Premium. Your account has been upgraded successfully.</p>
          <button
            onClick={() => router.push("/for-you")}
            className="w-full bg-[#11d683] hover:bg-[#0fbe74] text-[#032b41] font-bold py-3 rounded-xl shadow-md transition duration-150"
          >
            Start Exploring Summaries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans pb-20">
      {/* HEADER HERO */}
      <header className="bg-[#032b41] text-white text-center px-6 py-16 md:py-20 rounded-b-[2.5rem]">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-5xl font-black leading-tight">
            Get unlimited access to <br /> many amazing books
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl mx-auto">
            Turn ordinary moments into amazing learning opportunities with precise collections curated by global industry experts.
          </p>
        </div>
      </header>

      {/* CORE SALES GRID */}
      <main className="max-w-4xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

        {/* LEFT COLUMN: PLAN CHOOOSER & FAQS */}
        <div className="space-y-8">
          <h2 className="text-xl font-black text-[#032b41]">Choose the plan that fits you</h2>

          <div className="space-y-4">
            {/* Yearly Card */}
            <div
              onClick={() => setSelectedPlan("yearly")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${selectedPlan === "yearly" ? "border-[#11d683] bg-green-50/30" : "border-gray-200 bg-white"}`}
            >
              <div>
                <h3 className="font-black text-[#032b41]">Premium Plus Yearly</h3>
                <p className="text-xs text-gray-500 mt-0.5">7-day free trial included</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-[#032b41]">\$99.99</p>
                <p className="text-xs text-gray-400">/ year</p>
              </div>
            </div>

            {/* Monthly Card */}
            <div
              onClick={() => setSelectedPlan("monthly")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${selectedPlan === "monthly" ? "border-[#11d683] bg-green-50/30" : "border-gray-200 bg-white"}`}
            >
              <div>
                <h3 className="font-black text-[#032b41]">Premium Monthly</h3>
                <p className="text-xs text-gray-500 mt-0.5">No trial included</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-[#032b41]">\$9.99</p>
                <p className="text-xs text-gray-400">/ month</p>
              </div>
            </div>
          </div>

          {/* FAQS PANEL */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="font-bold text-sm text-[#032b41]">Frequently Asked Questions</h4>
            <div className="text-xs space-y-3 text-gray-600 leading-relaxed">
              <p><strong>How does the trial work?</strong> Begin your complimentary 7-day trial with an annual plan. Cancel anytime before it ends and you won&apos;t be charged.</p>
              <p><strong>What&apos;s included?</strong> Unrestricted entry to best-selling book insights, high-quality audio formats, and full offline downloads.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIMULATED PAYMENT FORMS */}
        <div className="bg-gray-50 border border-gray-200 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 sticky top-24">
          <div>
            <h3 className="font-black text-lg text-[#032b41]">Complete Payment</h3>
            <p className="text-xs text-gray-500 mt-0.5">Secure mock checkout processing interface.</p>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Cardholder Name</label>
              <input type="text" placeholder="John Doe" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" required />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Card Number</label>
              <input type="text" placeholder="4111 2222 3333 4444" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Expiration</label>
                <input type="text" placeholder="MM/YY" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">CVC</label>
                <input type="text" placeholder="123" className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black" required />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full mt-4 bg-[#032b41] hover:bg-[#043854] text-white font-bold py-3.5 rounded-xl shadow-md transition duration-150 disabled:opacity-50 text-sm"
            >
              {isProcessing ? "Processing Securely..." : `Pay ${selectedPlan === "yearly" ? "$99.99" : "$9.99"}`}
            </button>
          </form>

          <p className="text-[10px] text-center text-gray-400">🛡️ Mock banking sandbox environment. No actual currency will be debited.</p>
        </div>

      </main>
    </div>
  );
}
