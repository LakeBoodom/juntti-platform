import { supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await supabaseFromCookies();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold">Tervetuloa</h1>
          <p className="text-sm text-muted-foreground">
            Sisällönhallinnan aloitussivu. Valitse taulu sivupalkista.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/quizzes"
            className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="text-sm text-muted-foreground">Tauluja</div>
            <div className="text-lg font-medium">Visat</div>
            <div className="text-xs text-muted-foreground">
              AI-generointi + muokkaus
            </div>
          </Link>
          <Link
            href="/countdowns"
            className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="text-sm text-muted-foreground">Tauluja</div>
            <div className="text-lg font-medium">Countdownit</div>
            <div className="text-xs text-muted-foreground">
              Merkkipäivät ja juhlat
            </div>
          </Link>
          <Link
            href="/celebrities"
            className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <div className="text-sm text-muted-foreground">Tauluja</div>
            <div className="text-lg font-medium">Julkkikset</div>
            <div className="text-xs text-muted-foreground">
              Synttärisankarit + AI-visat
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
