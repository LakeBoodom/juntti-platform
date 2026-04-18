"use client";

import { useEffect, useState } from "react";

const COOKIE_KEY = "juntti-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const stored = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${COOKIE_KEY}=`));
    if (!stored) setVisible(true);
  }, []);

  function persist(value: "accept" | "decline") {
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `${COOKIE_KEY}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/95 p-4 shadow-2xl backdrop-blur">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-ink-muted">
          Käytämme vain tarpeellisia evästeitä pelikokemuksesi tallentamiseen
          (esim. putki). Ei mainoksia eikä seurantaa.{" "}
          <a href="/tietosuoja" className="text-brand underline">
            Lue lisää
          </a>
        </p>
        <div className="flex gap-2 sm:ml-auto">
          <button
            onClick={() => persist("decline")}
            className="rounded-full border border-ink/10 px-4 py-2 text-sm text-ink-muted hover:bg-ink/5"
          >
            Vain tarpeelliset
          </button>
          <button
            onClick={() => persist("accept")}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Selvä
          </button>
        </div>
      </div>
    </div>
  );
}
