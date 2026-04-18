import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { GeneratorForm } from "./generator-form";

export const dynamic = "force-dynamic";

export default async function NewQuizPage() {
  const sb = await supabaseFromCookies();
  const {
    data: { user },
  } = await sb.auth.getUser();

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Takaisin visoihin
        </Link>
        <div>
          <h1 className="text-2xl font-semibold">Luo AI:lla</h1>
          <p className="text-sm text-muted-foreground">
            Claude Sonnet 4.6 generoi valmiin draftin valinnoista. Voit muokata
            kysymyksiä preview-näkymässä ennen julkaisua.
          </p>
        </div>
        <GeneratorForm />
      </main>
    </>
  );
}
