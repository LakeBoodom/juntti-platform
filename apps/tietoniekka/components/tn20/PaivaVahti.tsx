"use client";
// SEO-erä A4: ks. app/api/etusivu-paiva/route.ts. Jos etusivun välimuistiversio on eiliseltä
// (Helsingin aikaa), pyydetään tuore versio ja ladataan sivu kerran uudelleen.
import { useEffect } from "react";

export function PaivaVahti({ pvm }: { pvm: string }) {
  useEffect(() => {
    const tanaan = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(new Date());
    if (tanaan <= pvm) return;
    // Enintään kaksi yritystä per päivä (C11, 26.10.2026): uudelleengenerointi voi kestää yli ensimmäisen odotuksen.
    const avain = `tn-paivavahti-${tanaan}`;
    let yritys = 0;
    try {
      yritys = Number(sessionStorage.getItem(avain) ?? "0");
      if (yritys >= 2) return;
      sessionStorage.setItem(avain, String(yritys + 1));
    } catch {
      return;
    }
    fetch("/api/etusivu-paiva", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pvm }) })
      .then(() => setTimeout(() => window.location.reload(), yritys === 0 ? 2500 : 5000))
      .catch(() => {});
  }, [pvm]);
  return null;
}
