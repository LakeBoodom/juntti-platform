"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { closePublicationNow, archivePublication, deletePublication } from "../actions";
import type { PublicationRow } from "@/lib/diggaa";

const FORMAT_NAMES: Record<string, string> = {
  duel: "Duel",
  swipe_deck: "Swipe-kierros",
  knockout: "Knockout",
};

const STATE_STYLES: Record<string, string> = {
  live: "bg-green-100 text-green-800",
  tulossa: "bg-blue-100 text-blue-800",
  "päättynyt": "bg-gray-200 text-gray-600",
  luonnos: "bg-yellow-100 text-yellow-800",
  arkistoitu: "bg-gray-100 text-gray-400",
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString("fi-FI", {
    timeZone: "Europe/Helsinki",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PublicationRowItem({ pub, state }: { pub: PublicationRow; state: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATE_STYLES[state] ?? ""}`}>
        {state}
      </span>
      <span className="w-28 shrink-0 text-xs text-muted-foreground">
        {FORMAT_NAMES[pub.content_type] ?? pub.content_type}
      </span>
      <span className="flex-1 truncate text-sm font-medium">{pub.title}</span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {fmtTime(pub.opens_at)} → {fmtTime(pub.closes_at)}
      </span>
      <div className="flex shrink-0 gap-1">
        {state === "live" && (
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => startTransition(async () => void (await closePublicationNow(pub.id)))}
          >
            Sulje nyt
          </Button>
        )}
        {(state === "päättynyt" || state === "luonnos") && (
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => startTransition(async () => void (await archivePublication(pub.id)))}
          >
            Arkistoi
          </Button>
        )}
        {(state === "tulossa" || state === "luonnos") && (
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => startTransition(async () => void (await deletePublication(pub.id)))}
          >
            Poista
          </Button>
        )}
      </div>
    </div>
  );
}
