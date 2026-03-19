"use client";

import { useState, useEffect } from "react";

export default function EmailGate() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    const dismissed = localStorage.getItem("hs-email-dismissed");
    if (!dismissed) {
      setShow(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem("hs-email-dismissed", "true");
    setShow(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setTimeout(dismiss, 2000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-2 border border-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-sans font-semibold text-white">
            Get 13F Filing Alerts
          </h3>
          <button
            onClick={dismiss}
            className="text-gray-500 hover:text-gray-300 transition-colors text-xl leading-none"
            aria-label="Dismiss"
          >
            x
          </button>
        </div>
        <p className="text-sm text-gray-400 mb-4 font-mono">
          Be notified when hedge funds file new 13F holdings reports with the SEC.
        </p>
        {status === "success" ? (
          <p className="text-positive font-mono text-sm">Subscribed. You are in.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-surface border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg text-sm font-mono font-medium transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-negative text-xs font-mono mt-2">
            Something went wrong. Try again.
          </p>
        )}
      </div>
    </div>
  );
}
