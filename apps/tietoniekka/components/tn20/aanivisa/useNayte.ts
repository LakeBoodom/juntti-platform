"use client";
// Äänivisan näytteen soitto Luonnon kortissa ja etusivun bannerissa (design 2c, 3a–3d): napautus soittaa
// viikon 1. äänen alusta ja sonogrammi pyyhkiytyy esiin soittokohdan mukana (molemmilla toistoilla).
import { useCallback, useEffect, useRef, useState } from "react";

export function useNayte(src: string, jakso: number, tauko: number) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const raf = useRef<number | null>(null);
  const [soi, setSoi] = useState(false);
  const [t, setT] = useState(0);
  const [soitettu, setSoitettu] = useState(false);

  const lopeta = () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
    raf.current = null;
  };
  const seuraa = useCallback(() => {
    if (ref.current) setT(ref.current.currentTime);
    raf.current = requestAnimationFrame(seuraa);
  }, []);

  const toggle = useCallback(() => {
    if (!ref.current) {
      ref.current = new Audio(src);
      ref.current.onended = () => { lopeta(); setSoi(false); setT(jakso); };
    }
    const a = ref.current;
    if (!a.paused) {
      a.pause();
      lopeta();
      setSoi(false);
      return;
    }
    a.currentTime = 0;
    a.play().then(() => {
      setSoi(true);
      setSoitettu(true);
      lopeta();
      raf.current = requestAnimationFrame(seuraa);
    }).catch(() => setSoi(false));
  }, [src, jakso, seuraa]);

  useEffect(() => () => { lopeta(); ref.current?.pause(); }, []);

  // Pyyhkiytyminen: 1. toisto 0…jakso, tauko, 2. toisto pyyhkii saman kuvan uudelleen.
  const p = !soitettu ? 0 : t <= jakso ? t / jakso : t < jakso + tauko ? 1 : Math.min(1, (t - jakso - tauko) / jakso);
  const kesto = jakso * 2 + tauko;
  return { soi, p, t: Math.min(t, kesto), toggle, soitettu };
}
