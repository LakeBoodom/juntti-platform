"use client";

import { useState, useTransition } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { generateSocialDraftsForDay, type SocialPlatform } from "./actions";
import type { CalendarDay } from "@/lib/content-calendar";

type PostSummary = { id: string; target_date: string; platform: string; status: string };

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y.slice(2)}`;
}

function weekday(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return ["su", "ma", "ti", "ke", "to", "pe", "la"][date.getDay()];
}

function getAge(birthDate: string): number {
  const [by] = birthDate.split("-").map(Number);
  return new Date().getFullYear() - by;
}

function SomeBadge({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const postedCount = posts.filter((p) => p.status === "posted").length;
  const scheduledCount = posts.filter((p) => p.status === "scheduled").length;

  if (postedCount === posts.length) {
    const platforms = [...new Set(posts.map((p) => p.platform))]
      .map((p) => (p === "facebook" ? "FB" : p === "instagram" ? "IG" : "LI"))
      .join("+");
    return (
      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        Julkaistu {platforms}
      </span>
    );
  }
  if (scheduledCount > 0) {
    return (
      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
        {scheduledCount} ajastettu
      </span>
    );
  }
  if (draftCount > 0) {
    return (
      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
        {draftCount} luonnosta
      </span>
    );
  }
  return <span className="text-xs text-muted-foreground">{posts.length} postausta</span>;
}

export function CalendarRow({
  day,
  siteId,
  posts,
}: {
  day: CalendarDay;
  siteId: string;
  posts: PostSummary[];
}) {
  const [fb, setFb] = useState(true);
  const [ig, setIg] = useState(true);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const hasContent = !!(day.quiz || day.celebrity || day.countdown);

  function handleGenerate() {
    setMessage(null);
    const platforms: SocialPlatform[] = [];
    if (fb) platforms.push("facebook");
    if (ig) platforms.push("instagram");
    if (platforms.length === 0) {
      setMessage("Valitse vähintään yksi alusta");
      return;
    }
    startTransition(async () => {
      const res = await generateSocialDraftsForDay(siteId, day.date, platforms);
      if (!res.ok) setMessage(res.error);
      else setMessage(`Luotu ${res.created} luonnosta`);
    });
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        {formatDate(day.date)}
        <span className="ml-1 text-xs text-muted-foreground">{weekday(day.date)}</span>
      </TableCell>
      <TableCell>
        {day.quiz ? (
          <div>
            <div className="text-sm">{day.quiz.title}</div>
            <div className="text-xs text-muted-foreground">{day.quiz.category}</div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {day.celebrity ? (
          <div>
            <div className="text-sm">{day.celebrity.name}</div>
            <div className="text-xs text-muted-foreground">
              {day.celebrity.role}
              {day.celebrity.death_date ? " · †" : ` · ${getAge(day.celebrity.birth_date)} v`}
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        {day.countdown ? (
          <div>
            <div className="text-sm">
              {day.countdown.emoji ? `${day.countdown.emoji} ` : ""}
              {day.countdown.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {day.countdown.status === "today" ? "Tänään" : "Käynnissä"}
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <SomeBadge posts={posts} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={fb}
                onChange={(e) => setFb(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              FB
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={ig}
                onChange={(e) => setIg(e.target.checked)}
                className="h-3.5 w-3.5"
              />
              IG
            </label>
          </div>
          <Button
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={handleGenerate}
            disabled={pending || !hasContent}
          >
            {pending ? "Luodaan…" : "Luo some"}
          </Button>
          {message && (
            <span className="max-w-[160px] text-right text-[11px] text-muted-foreground">
              {message}
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
