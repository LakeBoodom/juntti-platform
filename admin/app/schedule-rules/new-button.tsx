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
import { RuleForm, type ContentOptionsMap } from "./rule-form";

export function NewRuleButton({
  siteId,
  contentOptions,
}: {
  siteId: string;
  contentOptions: ContentOptionsMap;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Lisää sääntö
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uusi ajastussääntö</DialogTitle>
            <DialogDescription>
              Valitse mikä sisältö näytetään ja millä logiikalla.
            </DialogDescription>
          </DialogHeader>
          <RuleForm
            onDone={() => setOpen(false)}
            siteId={siteId}
            contentOptions={contentOptions}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
