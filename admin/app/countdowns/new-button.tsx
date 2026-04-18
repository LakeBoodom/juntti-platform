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
import { CountdownForm } from "./countdown-form";

export function NewCountdownButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Lisää
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uusi countdown</DialogTitle>
            <DialogDescription>
              Esim. Vappu, MM-kisat, Joulu.
            </DialogDescription>
          </DialogHeader>
          <CountdownForm onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
