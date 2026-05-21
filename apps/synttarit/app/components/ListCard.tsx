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
    <div className="list-card">
      <div className="lc-main">
        <Link
          href={`/${celebrity.slug ?? celebrity.id}`}
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flex: 1, minWidth: 0 }}
        >
          <div className="lc-avatar">
            {celebrity.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={celebrity.image_url} alt={celebrity.name} />
            ) : (
              <i className="ti ti-user" aria-hidden="true" />
            )}
          </div>
          <div className="lc-info">
            <div className="lc-nameline">
              <span className="lc-name">{celebrity.name}</span>
              <span className="lc-age">{age} v</span>
            </div>
            <div className="lc-role">{celebrity.role}</div>
          </div>
        </Link>

        {/* Kompaktit äänestysnapit */}
        <VoteWidget
          celebrityId={celebrity.id}
          celebrityName={celebrity.name}
          todayStr={todayStr}
          age={age}
          compact
        />
      </div>

      {/* Tulokset tulevat VoteWidgetin sisältä compact-modessa */}
    </div>
  );
}
