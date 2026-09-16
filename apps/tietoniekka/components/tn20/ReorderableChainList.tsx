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
// TARTUNTA-ALUE — LIVE-QA-LÖYDÖS (kriittinen, 2026-09-16, Heikki): raahaus
// toimi vain oikean reunan 40×40px kahvasta, eikä kortin muusta osasta saanut
// otetta lainkaan. Mobiilissa tämä tuntui tahmealta myös siksi, että
// .tk-rcard esti selaimen oman vierityksen (touch-action: none) KOKO kortin
// alueelta — kortin keskeltä pyyhkäisy ei siis raahannut eikä vierittänyt,
// vaan näytti jumiutuneelta. Korjattu kahdella yhteen kuuluvalla muutoksella:
//   1. Samat pointer-käsittelijät annetaan koko kortille (RankingCardin
//      dragProps), joten ote lähtee mistä tahansa kortin kohdasta. Kahva jää
//      näkyväksi affordanssiksi ja näppäimistöreitiksi.
//   2. .tk-rcard--draggable saa touch-action: pan-y (ei none), joten sormella
//      pyyhkäisy kortin päältä vierittää sivua normaalisti. Raahaus aktivoituu
//      kosketuksella vasta pitkästä painalluksesta (TOUCH_LONG_PRESS_MS) —
//      sama ele kuin mobiilikäyttöjärjestelmien omissa järjestyslistoissa.
//      Aktivoituessa kiinnitetään ei-passiivinen touchmove-kuuntelija joka
//      preventDefaultaa: selain ei ole vielä ehtinyt aloittaa vieritystä
//      (sormi ei ole liikkunut), joten vieritys estyy raahauksen ajaksi
//      vaikka touch-action sallisi sen. Hiirellä/kynällä raahaus alkaa heti
//      liikkeestä kuten ennen (ei pitkää painallusta).
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
const TOUCH_LONG_PRESS_MS = 180; // kosketus kortin rungosta: pito ennen kuin raahaus aktivoituu

/** Moduulitasoinen (vakaa referenssi add/removeEventListenerille): estää selaimen
    oman vierityksen raahauksen ajaksi. Kiinnitetään vain kun raahaus on aktiivinen. */
function blockTouchScroll(e: TouchEvent) {
  if (e.cancelable) e.preventDefault();
}

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
    pointerType: string;
    /** true = tartunta kahvasta: raahaus alkaa heti liikkeestä, ei pitkää painallusta. */
    immediate: boolean;
    startX: number;
    startY: number;
    startIndex: number;
    grabOffsetY: number;
    left: number;
    width: number;
    height: number;
    /** Raahaus on todella käynnissä (aave näkyvissä, rAF-silmukka pyörii). */
    active: boolean;
    /** Sormi/hiiri liikkui yli napautuskynnyksen — napautustulkinta perutaan. */
    moved: boolean;
    lastClientY: number;
    rafId: number | null;
    longPressId: ReturnType<typeof setTimeout> | null;
    captureEl: HTMLElement | null;
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

  // ---- Raahaus: pointer events (hiiri + kosketus), tartunta koko kortista ----
  function stopDragLoop() {
    const ds = dragRef.current;
    if (ds?.rafId) cancelAnimationFrame(ds.rafId);
    if (ds?.longPressId) clearTimeout(ds.longPressId);
  }

  function endDrag() {
    const ds = dragRef.current;
    stopDragLoop();
    if (ds?.captureEl) {
      try {
        if (ds.captureEl.hasPointerCapture(ds.pointerId)) ds.captureEl.releasePointerCapture(ds.pointerId);
      } catch {
        // Ei estä mitään — capture vapautuu joka tapauksessa pointerin päättyessä.
      }
    }
    document.removeEventListener("touchmove", blockTouchScroll);
    dragRef.current = null;
    setDragId(null);
  }

  /** Raahaus käyntiin: aave näkyviin, selaimen vieritys pois, rAF-silmukka päälle. */
  function activateDrag() {
    const ds = dragRef.current;
    if (!ds || ds.active || disabled) return;
    if (ds.longPressId) {
      clearTimeout(ds.longPressId);
      ds.longPressId = null;
    }
    ds.active = true;
    ds.moved = true;
    // Ei-passiivinen: estää vierityksen alkamisen raahauksen ajaksi (ks. tiedoston
    // alun TARTUNTA-ALUE-kommentti). Autoscroll hoidetaan itse tickissä.
    document.addEventListener("touchmove", blockTouchScroll, { passive: false });
    setDragId(ds.id);
    ds.rafId = requestAnimationFrame(tick);
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

  function handlePointerDown(e: React.PointerEvent<HTMLElement>, id: string, immediate = false) {
    if (disabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Toinen sormi kesken raahauksen: ei aloiteta rinnakkaista raahausta.
    if (dragRef.current) return;
    const row = rowRefs.current.get(id);
    if (!row) return;
    const rect = row.getBoundingClientRect();
    const captureEl = e.currentTarget as HTMLElement;
    try {
      captureEl.setPointerCapture(e.pointerId);
    } catch {
      // Safari < 13 fallback: raahaus toimii silti, vain pointer capture puuttuu.
    }
    dragRef.current = {
      id,
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      immediate,
      startX: e.clientX,
      startY: e.clientY,
      startIndex: itemsRef.current.findIndex((p) => p.id === id),
      grabOffsetY: e.clientY - rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      active: false,
      moved: false,
      lastClientY: e.clientY,
      rafId: null,
      longPressId: null,
      captureEl,
    };
    // Kosketus kortin rungosta: pitkä painallus aktivoi raahauksen, jotta lyhyt
    // pyyhkäisy jää selaimen vieritykseksi (touch-action: pan-y).
    if (!immediate && e.pointerType === "touch") {
      dragRef.current.longPressId = setTimeout(() => activateDrag(), TOUCH_LONG_PRESS_MS);
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    const ds = dragRef.current;
    if (!ds || ds.pointerId !== e.pointerId || disabled) return;
    ds.lastClientY = e.clientY;
    if (ds.active) return;
    const travel = Math.max(Math.abs(e.clientY - ds.startY), Math.abs(e.clientX - ds.startX));
    if (travel <= TAP_MOVE_THRESHOLD) return;
    if (ds.immediate || ds.pointerType !== "touch") {
      activateDrag();
    } else {
      // Sormi liikkui ennen pitkän painalluksen laukeamista → ele on sivun vieritys:
      // luovutaan raahausaikeesta (ja pointer capturesta) kokonaan.
      endDrag();
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLElement>, id: string) {
    const ds = dragRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    e.stopPropagation();
    const wasDrag = ds.active;
    const wasMove = ds.moved;
    endDrag();
    if (!wasDrag && !wasMove && !disabled) {
      handleCardActivate(id);
    }
  }

  function handlePointerCancel(e: React.PointerEvent<HTMLElement>) {
    const ds = dragRef.current;
    if (!ds || ds.pointerId !== e.pointerId) return;
    endDrag();
  }

  useEffect(
    () => () => {
      stopDragLoop();
      document.removeEventListener("touchmove", blockTouchScroll);
    },
    [],
  );

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
            dragProps={{
              onPointerDown: (e) => handlePointerDown(e, person.id),
              onPointerMove: handlePointerMove,
              onPointerUp: (e) => handlePointerUp(e, person.id),
              onPointerCancel: handlePointerCancel,
              // Napautus käsitellään pointerupissa (handlePointerUp) — ilman tätä
              // sama napautus laukaisisi vielä kortin onClickin ja valinta
              // kumoutuisi heti (valitse → peru samalla napautuksella).
              onClick: undefined,
            }}
            handleProps={{
              // Kahvasta raahaus alkaa heti liikkeestä myös kosketuksella
              // (kahvalla on touch-action: none, joten se ei koskaan vieritä).
              // stopPropagation: sama ele ei saa käynnistyä toiseen kertaan
              // kortin juuren käsittelijästä.
              onPointerDown: (e) => {
                e.stopPropagation();
                handlePointerDown(e, person.id, true);
              },
              onPointerMove: (e) => {
                e.stopPropagation();
                handlePointerMove(e);
              },
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
