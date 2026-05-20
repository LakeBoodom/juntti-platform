"use client";


import { useState } from "react";
import Link from "next/link";
import { getAge } from "../../lib/utils";
import type { CelebrityData } from "../../lib/queries";
import VoteWidget from "./VoteWidget";

interface Props {
  celebrity: CelebrityData;
  todayStr: string;
}

export default function HeroCard({ celebrity, todayStr }: Props) {
  const age = getAge(celebrity.birth_date);

  return (
    <div className="hero-card">
      <Link href={`/${celebrity.slug ?? celebrity.id}`} style={{ display: "block", textDecoration: "none" }}>
        {celebrity.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={celebrity.image_url}
            alt={celebrity.name}
            className="hero-photo"
          />
        ) : (
          <div className="hero-photo-placeholder">🎂</div>
        )}
      </Link>

      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="pill">🎂 Päivän pääsankari</span>
        </div>

        <Link href={`/${celebrity.slug ?? celebrity.id}`} style={{ textDecoration: "none" }}>
          <h1 className="hero-name">
            {celebrity.name}
            <span className="age-chip">{age} v</span>
          </h1>
          <p className="hero-meta">{celebrity.role}</p>
        </Link>

        {/* Äänestys */}
        <VoteWidget
          celebrityId={celebrity.id}
          celebrityName={celebrity.name}
          todayStr={todayStr}
          age={age}
        />
      </div>
    </div>
  );
}
