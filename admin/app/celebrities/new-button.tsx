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
import { CelebrityForm } from "./celebrity-form";

export function NewCelebrityButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Lisää
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uusi julkkis</DialogTitle>
            <DialogDescription>
              Suomalainen henkilö jonka syntymäpäivänä näytetään trivia.
            </DialogDescription>
          </DialogHeader>
          <CelebrityForm onDone={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
