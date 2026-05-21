"use client";

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
          <div className="hero-photo-placeholder">
            <i className="ti ti-confetti hero-photo-icon" aria-hidden="true" />
          </div>
        )}
      </Link>

      <div className="hero-content">
        <div className="hero-pill">
          <i className="ti ti-cake" style={{ fontSize: 9 }} aria-hidden="true" />
          Päivän pääsankari
        </div>

        <div className="hero-nameline">
          <Link href={`/${celebrity.slug ?? celebrity.id}`} className="hero-name">
            {celebrity.name}
          </Link>
          <div className="hero-age-chip">
            <div className="hero-age-n">{age}</div>
            <div className="hero-age-l">vuotta</div>
          </div>
        </div>

        <div className="hero-role">{celebrity.role}</div>

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
