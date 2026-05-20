"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCelebrityPriority, Priority } from "./actions";
import { Button } from "@/components/ui/button";

type Celebrity = {
  id: string;
  name: string;
  birth_date: string;
  death_date: string | null;
  role: string;
  bio_short: string | null;
  image_url: string | null;
  priority: number;
  is_hero: boolean;
  platform: string;
  site_id: string | null;
};

type VoteRow = {
  celebrity_id: string;
  question_type: string;
  vote_date: string;
  ei_tunnista_count: number;
  tuttu_count: number;
  legenda_count: number;
  ei_uppoa_count: number;
  ihan_ok_count: number;
  rakastan_count: number;
  total_count: number;
};

type Props = {
  selectedDate: string;
  celebrities: Celebrity[];
  votesByIdAndType: Record<string, VoteRow>;
};

function getAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
}

function PriorityBadge({ priority }: { priority: number }) {
  if (priority === 1)
    return (
      <span className="rounded bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-700">
        Hero
      </span>
    );
  if (priority <= 4)
    return (
      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
        Lista
      </span>
    );
  if (priority === 99)
    return (
      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
        Piilotettu
      </span>
    );
  return (
    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
      Normaali
    </span>
  );
}

function VoteStats({
  awareness,
  favorability,
}: {
  awareness?: VoteRow;
  favorability?: VoteRow;
}) {
  if (!awareness && !favorability)
    return (
      <span className="text-xs text-muted-foreground">Ei ääni� tänään</span>
    );

  return (
    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
      {awareness && (
        <div>
          <span className="font-medium">Tunnettuus</span> ({awareness.total_count}):
          <span className="ml-1">ei {awareness.ei_tunnista_count}</span>
          <span className="ml-1">· tuttu {awareness.tuttu_count}</span>
          <span className="ml-1">· legenda {awareness.legenda_count}</span>
        </div>
      )}
      {favorability && (
        <div>
          <span className="font-medium">Suosio</span> ({favorability.total_count}):
          <span className="ml-1">ei uppoa {favorability.ei_uppoa_count}</span>
          <span className="ml-1">· ok {favorability.ihan_ok_count}</span>
          <span className="ml-1">· rakastan {favorability.rakastan_count}</span>
        </div>
      )}
    </div>
  );
}

function CelebrityCard({
  celebrity,
  awareness,
  favorability,
}: {
  celebrity: Celebrity;
  awareness?: VoteRow;
  favorability?: VoteRow;
}) {
  const [isPending, startTransition] = useTransition();
  const [localPriority, setLocalPriority] = useState(celebrity.priority);

  function setPriority(priority: Priority, isHero: boolean) {
    setLocalPriority(priority);
    startTransition(async () => {
      await setCelebrityPriority(celebrity.id, priority, isHero);
    });
  }

  const birthYear = celebrity.birth_date.split("-")[0];
  const age = celebrity.death_date ? null : getAge(celebrity.birth_date);

  return (
    <div
      className={`flex items-start gap-4 rounded-lg border p-4 transition-opacity ${isPending ? "opacity-60" : ""}`}
    >
      {/* Avatar */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
        {celebrity.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={celebrity.image_url}
            alt={celebrity.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
            {celebrity.name[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{celebrity.name}</span>
          <PriorityBadge priority={localPriority} />
        </div>
        <div className="text-sm text-muted-foreground">
          {celebrity.role} · s. {birthYear}
          {age !== null ? ` · ${age} v` : " · †"}
        </div>
        {celebrity.bio_short && (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {celebrity.bio_short}
          </p>
        )}
        <VoteStats awareness={awareness} favorability={favorability} />
      </div>

      {/* Controls */}
      <div className="flex shrink-0 flex-col gap-1.5">
        <Button
          size="sm"
          variant={localPriority === 1 ? "default" : "outline"}
          className="h-7 px-3 text-xs"
          onClick={() => setPriority(1, true)}
          disabled={isPending}
        >
          Hero
        </Button>
        <Button
          size="sm"
          variant={localPriority === 2 ? "default" : "outline"}
          className="h-7 px-3 text-xs"
          onClick={() => setPriority(2, false)}
          disabled={isPending}
        >
          Lista
        </Button>
        <Button
          size="sm"
          variant={localPriority === 99 ? "destructive" : "outline"}
          className="h-7 px-3 text-xs"
          onClick={() => setPriority(99, false)}
          disabled={isPending}
        >
          Piilota
        </Button>
      </div>
    </div>
  );
}

export function SynttaritDayEditor({
  selectedDate,
  celebrities,
  votesByIdAndType,
}: Props) {
  const router = useRouter();

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    router.push(`/synttarit?date=${e.target.value}`);
  }

  // Sort: hero first, then lista, then normaali, then piilotettu
  const sorted = [...celebrities].sort((a, b) => {
    const pa = a.priority === 99 ? 1000 : a.priority;
    const pb = b.priority === 99 ? 1000 : b.priority;
    return pa - pb;
  });

  const heroCount = celebrities.filter((c) => c.priority === 1).length;
  const listaCount = celebrities.filter(
    (c) => c.priority > 1 && c.priority < 99
  ).length;
  const piilotCount = celebrities.filter((c) => c.priority === 99).length;

  return (
    <div className="space-y-4">
      {/* Date picker */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Päivä:</label>
        <input
          type="date"
          defaultValue={selectedDate}
          onChange={handleDateChange}
          className="rounded-md border bg-background px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <span className="text-sm text-muted-foreground">
          {celebrities.length} julkkista —{" "}
          <span className="text-pink-600">{heroCount} hero</span>,{" "}
          {listaCount} listalla, {piilotCount} piilotettu
        </span>
      </div>

      {/* Empty state */}
      {celebrities.length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Ei julkkiksia tälle päivälle. Lisää heitä Julkkikset-osiosta tai aja
          Wikipedia-skripti ensin.
        </div>
      )}

      {/* Celebrity cards */}
      <div className="space-y-3">
        {sorted.map((c) => (
          <CelebrityCard
            key={c.id}
            celebrity={c}
            awareness={votesByIdAndType[`${c.id}:awareness`]}
            favorability={votesByIdAndType[`${c.id}:favorability`]}
          />
        ))}
      </div>
    </div>
  );
}
