"use client";

import Link from "next/link";
import { getAge } from "../../lib/utils";
import type { CelebrityData } from "../../lib/queries";
import VoteWidget from "./VoteWidget";

interface Props {
  celebrity: CelebrityData;
  todayStr: string;
}

export default function ListCard({ celebrity, todayStr }: Props) {
  const age = getAge(celebrity.birth_date);

  return (
    <div className="list-card" style={{ flexDirection: "column", alignItems: "stretch", gap: 0 }}>
      <Link
        href={`/${celebrity.slug ?? celebrity.id}`}
        style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}
      >
        {celebrity.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={celebrity.image_url} alt={celebrity.name} className="avatar" />
        ) : (
          <div className="avatar-placeholder">🎂</div>
        )}
        <div className="list-info">
          <div className="list-name">
            {celebrity.name}
            <span style={{ fontFamily: "Nunito", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>
              {age} v
            </span>
          </div>
          <div className="list-age">{celebrity.role}</div>
        </div>
      </Link>

      {/* Kompakti äänestys */}
      <VoteWidget
        celebrityId={celebrity.id}
        celebrityName={celebrity.name}
        todayStr={todayStr}
        age={age}
        compact
      />
    </div>
  );
}
