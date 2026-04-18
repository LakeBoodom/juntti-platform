"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { togglePublish, deleteQuiz } from "./actions";

export function QuizActionsBar({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [delOpen, setDelOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function publish(publish: boolean) {
    setError(null);
    startTransition(async () => {
      const res = await togglePublish(id, publish);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteQuiz(id);
      } catch (err: any) {
        // redirect() throws; that's expected on success
        if (err?.digest?.startsWith("NEXT_REDIRECT")) return;
        setError(err?.message ?? "Poisto epäonnistui");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {status === "draft" ? (
        <Button onClick={() => publish(true)} disabled={pending}>
          <Upload /> Julkaise
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={() => publish(false)}
          disabled={pending}
        >
          <Archive /> Palauta draftiksi
        </Button>
      )}
      <Button
        variant="ghost"
        onClick={() => setDelOpen(true)}
        disabled={pending}
      >
        <Trash2 /> Poista
      </Button>
      {error && (
        <span className="text-sm text-destructive">{error}</span>
      )}

      <Dialog open={delOpen} onOpenChange={setDelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Poistetaanko visa?</DialogTitle>
            <DialogDescription>
              Kaikki visan kysymykset poistetaan samalla. Tätä ei voi perua.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelOpen(false)}>
              Peruuta
            </Button>
            <Button variant="destructive" onClick={remove} disabled={pending}>
              {pending ? "Poistetaan…" : "Poista"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
