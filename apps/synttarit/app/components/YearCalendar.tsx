"use client";

import { useState } from "react";
import Link from "next/link";
import { getAge, getMonthNameFi } from "../../lib/utils";
import type { CelebrityData } from "../../lib/queries";

interface Props {
  celebrities: CelebrityData[];
  today: Date;
}

export default function YearCalendar({ celebrities, today }: Props) {
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const [openMonth, setOpenMonth] = useState<number>(currentMonth);

  // Ryhmittele kuukausittain
  const byMonth: Record<number, CelebrityData[]> = {};
  for (let m = 1; m <= 12; m++) byMonth[m] = [];
  for (const c of celebrities) {
    const d = new Date(c.birth_date);
    const m = d.getMonth() + 1;
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(c);
  }

  function isToday(c: CelebrityData) {
    const d = new Date(c.birth_date);
    return d.getMonth() + 1 === currentMonth && d.getDate() === currentDay;
  }

  function isThisWeek(c: CelebrityData) {
    const d = new Date(c.birth_date);
    const bm = d.getMonth() + 1;
    const bd = d.getDate();
    const todayVal = currentMonth * 100 + currentDay;
    const cVal = bm * 100 + bd;
    const diff = cVal - todayVal;
    return diff > 0 && diff <= 7;
  }

  return (
    <div className="calendar-section">
      <p className="section-title">Synttärit koko vuonna</p>

      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
        const cels = byMonth[month] ?? [];
        const isOpen = openMonth === month;
        const monthName = getMonthNameFi(month);

        return (
          <div className="month-accordion" key={month}>
            <button
              className={`month-header ${isOpen ? "open" : ""}`}
              onClick={() => setOpenMonth(isOpen ? 0 : month)}
            >
              <span>{monthName}</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {isOpen ? "▲" : `${cels.length} henkilöä ▼`}
              </span>
            </button>

            {/* Suljettu: pilleri-preview */}
            {!isOpen && cels.length > 0 && (
              <div className="month-pills">
                {cels.slice(0, 5).map((c) => (
                  <span className="name-pill" key={c.id}>{c.name}</span>
                ))}
                {cels.length > 5 && (
                  <span className="name-pill">+{cels.length - 5} muuta</span>
                )}
              </div>
            )}

            {/* Avoin: koko lista */}
            {isOpen && (
              <div className="month-rows">
                {cels.length === 0 && (
                  <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "8px 0" }}>
                    Ei julkkiksia tällä kuulla vielä.
                  </p>
                )}
                {cels.map((c) => {
                  const d = new Date(c.birth_date);
                  const day = d.getDate();
                  const today_ = isToday(c);
                  const thisWeek = !today_ && isThisWeek(c);

                  return (
                    <Link
                      href={`/${c.slug ?? c.id}`}
                      className={`month-row ${today_ ? "row-today" : thisWeek ? "row-this-week" : ""}`}
                      key={c.id}
                    >
                      <span className="month-row-day">{day}.</span>
                      <span className="month-row-name">{c.name}</span>
                      <span className="month-row-age">{getAge(c.birth_date)} v</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
