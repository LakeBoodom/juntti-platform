"use client";

import { useState, useTransition } from "react";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CelebrityForm, type CelebrityFormValue } from "./celebrity-form";
import { deleteCelebrity } from "./actions";
import { generateQuizForCelebrity } from "./ai-actions";

const MONTHS = [
  "tammi",
  "helmi",
  "maalis",
  "huhti",
  "touko",
  "kesä",
  "heinä",
  "elo",
  "syys",
  "loka",
  "marras",
  "joulu",
];

function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

type Site = { id: string; slug: string; name: string };

export function CelebrityRow({
  row,
  hasQuiz,
  sites,
  defaultSiteId,
}: {
  row: CelebrityFormValue;
  hasQuiz: boolean;
  sites: Site[];
  defaultSiteId: string;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function doDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteCelebrity(row.id!);
      if (!res.ok) setError(res.error);
      else setDelOpen(false);
    });
  }

  function generate() {
    setError(null);
    startTransition(async () => {
      const res = await generateQuizForCelebrity(row.id!);
      if (!res.ok) setError(res.error);
      else router.push(`/quizzes/${res.quizId}`);
    });
  }

  const platformLabel =
    row.platform === "juntti"
      ? "juntti.com"
      : row.platform === "tietoniekka"
        ? "Tietoniekka.fi"
        : "molemmat";

  return (
    <TableRow>
      <TableCell>
        {row.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.image_url}
            alt={row.name}
            className="h-10 w-10 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted" />
        )}
      </TableCell>
      <TableCell className="font-medium">{row.name}</TableCell>
      <TableCell className="text-muted-foreground">
        {shortDate(row.birth_date)}
      </TableCell>
      <TableCell>{row.role}</TableCell>
      <TableCell>{platformLabel}</TableCell>
      <TableCell>
        {hasQuiz ? (
          <span className="inline-flex items-center rounded-full border border-green-600/30 bg-green-600/10 px-2 py-0.5 text-xs text-green-700">
            Visa valmis
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={generate}
            disabled={pending || hasQuiz}
            title={hasQuiz ? "Visa on jo generoitu" : "Luo visa AI:lla"}
          >
            <Sparkles />
            {pending ? "Generoidaan…" : "Luo visa"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditOpen(true)}
            aria-label="Muokkaa"
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDelOpen(true)}
            aria-label="Poista"
          >
            <Trash2 />
          </Button>
        </div>

        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Muokkaa julkkista</DialogTitle>
              <DialogDescription>
                Muutokset tallentuvat kun klikkaat Tallenna.
              </DialogDescription>
            </DialogHeader>
            <CelebrityForm initial={row} onDone={() => setEditOpen(false)} sites={sites} defaultSiteId={defaultSiteId} />
          </DialogContent>
        </Dialog>

        <Dialog open={delOpen} onOpenChange={setDelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Poistetaanko “{row.name}”?</DialogTitle>
              <DialogDescription>
                Tätä ei voi perua. Jos linkitetty visa on, se jää mutta ilman
                julkkislinkkiä.
              </DialogDescription>
            </DialogHeader>
            {error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDelOpen(false)}>
                Peruuta
              </Button>
              <Button
                variant="destructive"
                onClick={doDelete}
                disabled={pending}
              >
                {pending ? "Poistetaan…" : "Poista"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
