"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cleanupDemoData } from "./actions";

export function CleanupButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await cleanupDemoData();
            setMessage(
              res.ok
                ? `Poistettu ${res.removed} demo-sessiota.`
                : `Virhe: ${res.error}`,
            );
          })
        }
      >
        {pending ? "Poistetaan…" : "Poista Knockout-demodata"}
      </Button>
      {message && <span className="text-xs text-muted-foreground">{message}</span>}
    </div>
  );
}
