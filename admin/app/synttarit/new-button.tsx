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
import { SynttaritCelebrityForm } from "./celebrity-form";

export function NewSynttaritButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" /> Uusi synttärisankari
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Uusi synttärisankari</DialogTitle>
            <DialogDescription>
              Lisää julkkis synttärit.com-sivustolle. Hän näkyy syntymäpäivänään.
            </DialogDescription>
          </DialogHeader>
          <SynttaritCelebrityForm onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
