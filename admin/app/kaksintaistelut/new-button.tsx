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
import { EntityForm, type Def } from "./entity-form";

export function NewEntityButton({ defs }: { defs: Def[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Lisää entiteetti
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uusi entiteetti</DialogTitle>
            <DialogDescription>
              Valitse laji ensin — lomake näyttää vain sen lajin attribuutit.
            </DialogDescription>
          </DialogHeader>
          <EntityForm defs={defs} onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
