"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { KuvavisaForm } from "./kuvavisa-form";
import type { KuvavisaType } from "./actions";

export function NewKuvavisaButton({
  siteId,
  siteSlug,
  defaultType,
}: {
  siteId: string;
  siteSlug: string;
  defaultType: KuvavisaType;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Lisää kuvavisa
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Uusi kuvavisa</DialogTitle>
            <DialogDescription>
              Lataa kuva, kirjoita kysymys + 4 vastausta + valitse oikea.
            </DialogDescription>
          </DialogHeader>
          <KuvavisaForm
            onDone={() => setOpen(false)}
            siteId={siteId}
            siteSlug={siteSlug}
            defaultType={defaultType}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
