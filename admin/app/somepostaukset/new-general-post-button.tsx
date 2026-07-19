"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { createGeneralPost, type SocialPlatform } from "./actions";

export function NewGeneralPostButton({ siteId }: { siteId: string }) {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const [targetDate, setTargetDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [fb, setFb] = useState(true);
  const [ig, setIg] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const platforms: SocialPlatform[] = [];
    if (fb) platforms.push("facebook");
    if (ig) platforms.push("instagram");

    startTransition(async () => {
      const res = await createGeneralPost({ siteId, brief, targetDate, platforms });
      if (!res.ok) setError(res.error);
      else {
        setOpen(false);
        setBrief("");
      }
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Uusi yleinen postaus
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uusi yleinen postaus</DialogTitle>
            <DialogDescription>
              Kirjoita raakamuistiinpano — Claude muotoilee siitä valmiin
              some-tekstin Tietoniekan äänensävyllä.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="brief">Muistiinpano</Label>
              <Textarea
                id="brief"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={4}
                placeholder="esim. muistuta että uusi urheilu-kategoria julkaistiin tänään"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="target_date">Kohdepäivä</Label>
              <Input
                id="target_date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={fb}
                  onChange={(e) => setFb(e.target.checked)}
                  className="h-4 w-4"
                />
                Facebook
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  checked={ig}
                  onChange={(e) => setIg(e.target.checked)}
                  className="h-4 w-4"
                />
                Instagram
              </label>
            </div>

            {error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Peruuta
                </Button>
              </DialogClose>
              <Button type="submit" disabled={pending || !brief.trim() || (!fb && !ig)}>
                {pending ? "Luodaan…" : "Luo postaus"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
