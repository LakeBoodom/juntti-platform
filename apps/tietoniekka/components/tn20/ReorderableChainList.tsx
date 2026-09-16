"use client";
// TIETOKETJU: IKÄJÄRJESTYS — ReorderableChainList.
//
// Järjestämismoottori: raahaus (hiiri + kosketus, pointer events) JA
// tap-to-place, hallittu autoscroll reunoilla, näppäimistötuki (nuolet,
// Home/End) ja ruudunlukijan live-region-ilmoitukset siirroista.
//
// TAP_TO_PLACE_MEKANISMI: valinta + kohdepaikan napautus (slot-highlight) —
// kokeiluvaihe, voidaan vaihtaa (esim. numerovalintaan tai nuolivalintaan)
// jos käyttäjätestaus osoittaa sen selkeämmäksi. Napauta korttia (tai sen
// kahvaa lyhyesti, ilman raahausta) valitaksesi se; kaikki muut kortit
// korostuvat kohdepaikkoina (slot-highlight); napauta kohdetta siirtääksesi
// valitun kortin sille paikalle. Napauta valittua uudelleen perataksesi.
//
// Raahauksen tekniikka: valittu kortti saa näkymättömäksi jäävän paikkavarauksen
// normaalissa virtauksessa (jotta muut rivit asettuvat oikeaan kohtaan), ja
// erillinen "aave" (position: fixed) seuraa sormea/hiirtä suoraan. Muiden
// rivien siirtymä animoidaan FLIP-tekniikalla (mittaa ennen/jälkeen, animoi
// erotus) — state-muutoksen kesto 220ms, easing cubic-bezier(.2,.8,.2,1)
// (design-speksin liikeajat).
//
// Ei ulkoista dnd-riippuvuutta (esim. @dnd-kit) — päätös perusteltu lopun
// yhteenvedossa: pieni, täysin kontrolloitu pointer-pohjainen toteutus on
// tässä laajuudessa kevyempi ja helpompi tehdä esteettömäksi (näppäimistö +
// live-region) kuin yleiskäyttöisen kirjaston päälle rakentaminen.

import { useCallback, useEffect, useRef, useState } from "react";
import { RankingCard, type RankingCardPerson, type RankingCardState } from "./RankingCard";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const EDGE_ZONE = 88; // px viewportin reunasta, jolloin autoscroll käynnistyy
const MAX_SCROLL_SPEED = 16; // px / frame lähimpänä reunaa
const TAP_MOVE_THRESHOLD = 6; // px — tätä pienempi liike pointerdown→up tulkitaan napautukseksi

export interface ReorderableChainListProps<T extends RankingCardPerson> {
  items: T[];
  onReorder: (next: T[]) => void;
  disabled?: boolean;
  /** Käytetään paljastus-/tulosnäkymässä RankingCardin tilan/päivämäärän välittämiseen id:n mukaan. */
  cardState?: Map<string, RankingCardState>;
  revealedDates?: Map<string, string>;
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function ReorderableChainList<T extends RankingCardPerson>({
  items,
  onReorder,
  disabled,
  cardState,
  revealedDates,
}: ReorderableChainListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const ghostRef = useRef<HTMLDivElement>(null);
  const prevRectsRef = useRef<Map<string, DOMRect> | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const [dragId, setDragId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Viimeisin items-taulukko refinä — rAF-silmukka (tick) ei saa lukea items-propia
  // suoraan suljetusta closuresta, koska se jäisi "jumiin" siihen renderöintiin jolloin
  // raahaus käynnistyi (stale closure -bugi). Ref pysyy samana oliona koko ajan.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Muuttuva raahaustila pidetään refissä (ei re-renderiä joka pointermovella).
  const dragRef = useRef<{
    id: string;
    pointerId: number;
    startY: number;
    startIndex: number;
    grabOffsetY: number;
    left: number;
    width: number;
    height: number;
    moved: boolean;
    lastClientY: number;
    rafId: number | null;
  } | null>(null);

  const setRowRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) rowRefs.current.set(id, el);
    else rowRefs.current.delete(id);
  }, []);

  function captureRects() {
    const map = new Map<string, DOMRect>();
    for (const [id, el] of rowRefs.current) map.set(id, el.getBoundingClientRect());
    return map;
  }

  // FLIP: kun items-järjestys muuttuu, animoi ei-raahatut rivit uuteen kohtaansa.
  useEffect(() => {
    const prev = prevRectsRef.current;
    prevRectsRef.current = null;
    if (!prev) return;
    for (const [id, el] of rowRefs.current) {
      if (id === dragId) continue;
      const before = prev.get(id);
      if (!before) continue;
      const after = el.getBoundingClientRect();
      const delta = before.top - after.top;
      if (Math.abs(delta) < 0.5) continue;
      if (reducedMotion) continue;
      el.style.transition = "none";
      el.style.transform = `translateY(${delta}px)`;
      // Pakota reflow ennen transitionin asettamista, jotta selain ei yhdistä niitä.
      void el.getBoundingClientRect();
      el.style.transition = "transform 220ms cubic-bezier(.2,.8,.2,1)";
      el.style.transform = "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const commitReorder = useCallback(
    (next: T[], movedId: string, toIndex: number) => {
      prevRectsRef.current = captureRects();
      onReorder(next);
      const person = next.find((p) => p.id === movedId);
      if (person) setAnnouncement(`${person.name} siirrettiin paikalle ${toIndex + 1} / ${next.length}.`);
    },
    [onReorder],
  );

  function handleCardActivate(id: string) {
    if (disabled) return;
    if (selectedId === null) {
      setSelectedId(id);
      const person = items.find((p) => p.id === id);
      if (person) setAnnouncement(`${person.name} valittu. Napauta kohdepaikkaa siirtääksesi, tai napauta uudelleen peruaksesi.`);
      return;
    }
    if (selectedId === id) {
      setSelectedId(null);
      setAnnouncement("Valinta peruttu.");
      return;
    }
    const fromIndex = items.findIndex((p) => p.id === selectedId);
    const toIndex = items.findIndex((p) => p.id === id);
    if (fromIndex === -1 || toIndex === -1) {
      setSelectedId(null);
      return;
    }
    const next = arrayMove(items, fromIndex, toIndex);
    commitReorder(next, selectedId, toIndex);
    setSelectedId(null);
  }

  // ---- Näppäimistö: nuolet siirtävät fokusoitua korttia, Home/End ääripäihin ----
  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, id: string) {
    if (disabled) return;
    const currentIndex = items.findIndex((p) => p.id === id);
    if (currentIndex === -1) return;
    let toIndex: number | null = null;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") toIndex = Math.max(0, currentIndex - 1);
    else if (e.key === "ArrowDown" || e.key === "ArrowRight") toIndex = Math.min(items.length - 1, currentIndex + 1);
    else if (e.key === "Home") toIndex = 0;
    else if (e.key === "End") toIndex = items.length - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardActivate(id);
      return;
    }
    if (toIndex === null || toIndex === currentIndex) return;
    e.preventDefault();
    const next = arrayMove(items, currentIndex, toIndex);
    commitReorder(next, id, toIndex);
  }

  // ---- Raahaus: pointer events (hiiri + kosketus) ----
  function stopDragLoop() {
    const ds = dragRef.current;
    if (ds?.rafId) cancelAnimationFrame(ds.rafId);
  }

  function endDrag() {
    stopDragLoop();
    dragRef.current = null;
    setDragId(null);
  }

  function tick() {
    const ds = dragRef.current;
    if (!ds) return;

    // Autoscroll ikkunan reunoilla.
    const vh = window.innerHeight;
    let scrollDelta = 0;
    if (ds.lastClientY < EDGE_ZONE) {
      scrollDelta = -MAX_SCROLL_SPEED * (1 - ds.lastClientY / EDGE_ZONE);
    } else if (ds.lastClientY > vh - EDGE_ZONE) {
      scrollDelta = MAX_SCROLL_SPEED * (1 - (vh - ds.lastClientY) / EDGE_ZONE);
    }
    if (scrollDelta !== 0) window.scrollBy(0, scrollDelta);

    // Aaveen sijainti (fixed, seuraa sormea/hiirtä suoraan).
    if (ghostRef.current) {
      const top = ds.lastClientY - ds.grabOffsetY;
      ghostRef.current.style.transform = `translate3d(0, ${top}px, 0)`;
    }

    // Uusi indeksi muiden rivien keskipisteiden perusteella. HUOM: luetaan
    // itemsRef.current (ei suljettua `items`-propia) ja ds.id (ei state-dragId:tä),
    // koska tick() kutsuu itseään rekursiivisesti requestAnimationFramen kautta ja
    // säilyttää siksi SAMAN closuren koko raahauksen ajan — ilman refejä se jäisi
    // "jumiin" siihen renderöintiin, jolloin raahaus käynnistyi (stale closure).
    const order = itemsRef.current;
    const currentIndex = order.findIndex((p) => p.id === ds.id);
    if (currentIndex !== -1) {
      let newIndex = currentIndex;
      const pointerMid = ds.lastClientY;
      order.forEach((p, i) => {
        if (p.id === ds.id) return;
        const el = rowRefs.current.get(p.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (i < currentIndex && pointerMid < mid) newIndex = Math.min(newIndex, i);
        if (i > currentIndex && pointerMid > mid) newIndex = Math.max(newIndex, i);
      });
      if (newIndex !== currentIndex) {
        const next = arrayMove(order, currentIndex, newIndex);
        commitReorder(next, ds.id, newIndex);
      }
    }

    ds.rafId = requestAnimationFrame(tick);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLButtonElement>, id: string) {
    if (disabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const row = rowRefs.current.get(id);
    if (!row) return;
    const rect = row.getBoundingClientRect();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Safari < 13 fallback: raahaus toimii silti, vain pointer capture puuttuu.
    }
    dragRef.current = {
      id,
      pointerId: e.pointerId,
      startY: e.clientY,
      startIndex: itemsRef.current.findIndex((p) => p.id === id),
      grabOffsetY: e.clientY - rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      moved: false,
      lastClientY: e.clientY,
      rafId: null,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLButtonElement>, id: string) {
    const ds = dragRef.current;
    if (!ds || ds.pointerId !== e.pointerId || disabled) return;
    ds.lastClientY = e.clientY;
    if (!ds.moved && Math.abs(e.clientY - ds.startY) > TAP_MOVE_THRESHOLD) {
      ds.moved = true;
      setDragId(id);
      ds.rafId = requestAnimationFrame(tick);
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLButtonElement>, id: string) {
    const ds = dragRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    e.stopPropagation();
    const wasDrag = ds.moved;
    endDrag();
    if (!wasDrag && !disabled) {
      handleCardActivate(id);
    }
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLButtonElement>) {
    const ds = dragRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    endDrag();
  }

  useEffect(() => () => stopDragLoop(), []);

  const draggedItem = dragId ? items.find((p) => p.id === dragId) ?? null : null;
  const draggedIndex = draggedItem ? items.findIndex((p) => p.id === dragId) : -1;

  return (
    <div className={`tk-chainlist${disabled ? " tk-chainlist--disabled" : ""}`} ref={listRef}>
      <div aria-live="polite" className="tk-sr-only">{announcement}</div>
      {items.map((person, index) => {
        const isDragging = person.id === dragId;
        const isSelected = person.id === selectedId;
        const isTarget = selectedId !== null && !isSelected;
        const explicitState = cardState?.get(person.id);
        const state: RankingCardState = explicitState ?? (isDragging ? "dragging" : isSelected ? "selected" : isTarget ? "target" : "idle");
        return (
          <RankingCard
            key={person.id}
            ref={(el) => setRowRef(person.id, el)}
            person={person}
            position={index + 1}
            state={state}
            revealedDate={revealedDates?.get(person.id) ?? null}
            grabbed={isSelected || isDragging}
            ariaLabel={`${person.name}, paikka ${index + 1} / ${items.length}`}
            onActivate={() => handleCardActivate(person.id)}
            className={isDragging ? "tk-rcard--ghost-source" : undefined}
            handleProps={{
              onPointerDown: (e) => handlePointerDown(e, person.id),
              onPointerMove: (e) => handlePointerMove(e, person.id),
              onPointerUp: (e) => handlePointerUp(e, person.id),
              onPointerCancel: handlePointerCancel,
              onClick: (e) => e.stopPropagation(),
              onKeyDown: (e) => handleKeyDown(e, person.id),
              disabled,
            }}
          />
        );
      })}

      {draggedItem && draggedIndex !== -1 && dragRef.current && (
        <div
          ref={ghostRef}
          className="tk-rcard-ghost"
          style={{
            position: "fixed",
            top: 0,
            left: dragRef.current.left,
            width: dragRef.current.width,
            zIndex: 60,
            pointerEvents: "none",
          }}
        >
          <RankingCard person={draggedItem} position={draggedIndex + 1} state="dragging" readOnly />
        </div>
      )}
    </div>
  );
}
