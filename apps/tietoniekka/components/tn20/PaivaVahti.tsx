"use client";
// SEO-erä A4: ks. app/api/etusivu-paiva/route.ts. Jos etusivun välimuistiversio on eiliseltä
// (Helsingin aikaa), pyydetään tuore versio ja ladataan sivu kerran uudelleen.
import { useEffect } from "react";

export function PaivaVahti({ pvm }: { pvm: string }) {
  useEffect(() => {
    const tanaan = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(new Date());
    if (tanaan <= pvm) return;
    const avain = `tn-paivavahti-${tanaan}`;
    try {
      if (sessionStorage.getItem(avain)) return;
      sessionStorage.setItem(avain, "1");
    } catch {
      return;
    }
    fetch("/api/etusivu-paiva", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pvm }) })
      .then(() => setTimeout(() => window.location.reload(), 1500))
      .catch(() => {});
  }, [pvm]);
  return null;
}
