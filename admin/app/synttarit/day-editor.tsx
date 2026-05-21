"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { setCelebrityPriority, Priority } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SynttaritCelebrityForm } from "./celebrity-form";

type Celebrity = {
  id: string;
  name: string;
  birth_date: string;
  death_date: string | null;
  role: string;
  bio_short: string | null;
  image_url: string | null;
  wikipedia_url?: string | null;
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
  if (priority <= 10)
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

function PlatformBadge({ platform }: { platform: string }) {
  if (platform === "both")
    return (
      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-700">
        S+T
      </span>
    );
  return null;
}

function VoteStats({
  awareness,
}: {
  awareness?: VoteRow;
}) {
  if (!awareness)
    return <span className="text-xs text-muted-foreground">Ei ääniä tänään</span>;

  const total = awareness.total_count;
  const pL = total ? Math.round((awareness.legenda_count / total) * 100) : 0;
  const pT = total ? Math.round((awareness.tuttu_count / total) * 100) : 0;
  const pN = total ? Math.round((awareness.ei_tunnista_count / total) * 100) : 0;

  return (
    <div className="mt-1 text-xs text-muted-foreground">
      <span className="font-medium">{total} ääntä:</span>
      <span className="ml-1 text-pink-600">⭐ {pL}%</span>
      <span className="ml-1 text-yellow-600">😊 {pT}%</span>
      <span className="ml-1">😐 {pN}%</span>
    </div>
  );
}

function CelebrityCard({
  celebrity,
  awareness,
}: {
  celebrity: Celebrity;
  awareness?: VoteRow;
}) {
  const [isPending, startTransition] = useTransition();
  const [localPriority, setLocalPriority] = useState(celebrity.priority);
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  function setPriority(priority: Priority, isHero: boolean) {
    setLocalPriority(priority);
    startTransition(async () => {
      await setCelebrityPriority(celebrity.id, priority, isHero);
    });
  }

  const birthYear = celebrity.birth_date.split("-")[0];
  const age = celebrity.death_date ? null : getAge(celebrity.birth_date);

  return (
    <>
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{celebrity.name}</span>
            <PriorityBadge priority={localPriority} />
            <PlatformBadge platform={celebrity.platform} />
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
          <VoteStats awareness={awareness} />
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
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-3 text-xs"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Muokkaa: {celebrity.name}</DialogTitle>
          </DialogHeader>
          <SynttaritCelebrityForm
            initial={{
              id: celebrity.id,
              name: celebrity.name,
              birth_date: celebrity.birth_date,
              death_date: celebrity.death_date,
              role: celebrity.role,
              bio_short: celebrity.bio_short,
              image_url: celebrity.image_url,
              wikipedia_url: celebrity.wikipedia_url ?? null,
              platform: celebrity.platform as "synttarit" | "both",
            }}
            onDone={() => {
              setEditOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
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
      <div className="flex items-center gap-3 flex-wrap">
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
          Ei julkkiksia tälle päivälle. Lisää heitä yllä olevasta napista.
        </div>
      )}

      {/* Celebrity cards */}
      <div className="space-y-3">
        {sorted.map((c) => (
          <CelebrityCard
            key={c.id}
            celebrity={c}
            awareness={votesByIdAndType[`${c.id}:awareness`]}
          />
        ))}
      </div>
    </div>
  );
}
