"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const search = useSearchParams();
  const error = search.get("error");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "sending" }
    | { kind: "sent"; email: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "sending" });
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) setStatus({ kind: "error", message: error.message });
    else setStatus({ kind: "sent", email });
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Kirjaudu sisään sähköpostilinkillä.
          </p>
        </div>

        {error === "forbidden" && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            Tunnuksella ei ole pääsyä admin-työkaluun.
          </div>
        )}

        {status.kind === "sent" ? (
          <div className="rounded-md border bg-muted/40 p-4 text-sm">
            Lähetin kirjautumislinkin osoitteeseen <b>{status.email}</b>.
            Avaa sähköposti, klikkaa linkki — palaat tänne kirjautuneena.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Sähköposti</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status.kind === "sending"}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={status.kind === "sending" || !email}
            >
              {status.kind === "sending" ? "Lähetetään…" : "Lähetä linkki"}
            </Button>
            {status.kind === "error" && (
              <p className="text-sm text-destructive">{status.message}</p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
