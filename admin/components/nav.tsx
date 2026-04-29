import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteSwitcher } from "@/components/site-switcher";
import { listSites, getCurrentSite } from "@/lib/sites";

export async function Nav({ email }: { email?: string | null }) {
  const sites = await listSites();
  const current = await getCurrentSite();

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            Admin
          </Link>
          <Link
            href="/paivan-visa"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Päivän visa
          </Link>
          <Link
            href="/quizzes"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Visat
          </Link>
          <Link
            href="/kuvavisat"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Kuvavisat
          </Link>
          <Link
            href="/celebrities"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Julkkikset
          </Link>
          <Link
            href="/countdowns"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Countdownit
          </Link>
          <Link
            href="/schedule-rules"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Ajastus
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <SiteSwitcher sites={sites} currentSlug={current.slug} />
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
