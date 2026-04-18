import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Nav({ email }: { email?: string | null }) {
  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            Admin
          </Link>
          <Link
            href="/quizzes"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Visat
          </Link>
          <Link
            href="/countdowns"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Countdownit
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {email && (
            <span className="text-sm text-muted-foreground">{email}</span>
          )}
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm" type="submit">
              Kirjaudu ulos
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
