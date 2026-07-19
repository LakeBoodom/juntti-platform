import Link from "next/link";
import { supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import {
  getDiggaaSite,
  listAllDiggaaContent,
  listPublications,
  publicationState,
} from "@/lib/diggaa";
import { NewPublicationButton } from "./publication-form";
import { PublicationRowItem } from "./publication-row";

export const dynamic = "force-dynamic";

export default async function DiggaaAjastusPage() {
  const sbUser = await supabaseFromCookies();
  const {
    data: { user },
  } = await sbUser.auth.getUser();

  const site = await getDiggaaSite();
  const [pubs, content] = await Promise.all([
    listPublications(site.id),
    listAllDiggaaContent(site.id),
  ]);
  const now = new Date();

  return (
    <>
      <Nav email={user?.email} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Diggaa · Ajastus</h1>
            <p className="text-sm text-muted-foreground">
              Julkaisu määrää milloin sisältö avautuu ja kuinka kauan äänestys on auki.
              &quot;Live&quot; johdetaan ajoista — mitään ei tarvitse käydä sulkemassa käsin.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/diggaa" className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">
              Kojelauta
            </Link>
            <NewPublicationButton content={content} />
          </div>
        </div>

        <div className="divide-y rounded-md border">
          {pubs.map((p) => (
            <PublicationRowItem key={p.id} pub={p} state={publicationState(p, now)} />
          ))}
          {pubs.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Ei julkaisuja vielä.</p>
          )}
        </div>
      </main>
    </>
  );
}
