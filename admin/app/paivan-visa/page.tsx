import Link from "next/link";
import { Cake, Flower2 } from "lucide-react";
import { supabaseFromCookies } from "@/lib/supabase-server";
import { Nav } from "@/components/nav";
import { getCurrentSite } from "@/lib/sites";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { haePaivat, helsinkiTanaan, lisaaPaivia, paivaTeksti, type Paiva } from "@/lib/paivan-visa";
import { DayRow, Merkit } from "./day-row";
import { Mittaus } from "./mittaus";

// PÄIVÄN VISA -ADMIN (toteutusohje 19.9.2026, luku 8)
//   Lista: päivät eteenpäin, visa, kokoelma, intro, automaattimerkintä, sankari
//          ja varoitukset. Muokkaus omalla päiväsivulla (/paivan-visa/[paiva]).
//   Viikko: 7 päivää rinnakkain — kategoriatoisto ja puuttuvat introt
//          yhdellä silmäyksellä.
// Päivät Suomen aikaan (aiemmin UTC).

export const dynamic = "force-dynamic";

const DEFAULT_DAYS_AHEAD = 30;
const MAX_DAYS_AHEAD = 365;
const PRESETS = [14, 30, 60, 90, 180, 365] as const;

/** Viikon maanantai (ISO) annetulle päivälle. */
function maanantai(iso: string) {
  const vp = new Date(`${iso}T00:00:00Z`).getUTCDay(); // 0 = su
  return lisaaPaivia(iso, vp === 0 ? -6 : 1 - vp);
}

export default async function PaivanVisaPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; nakyma?: string; viikko?: string }>;
}) {
  const sp = await searchParams;
  const sb = await supabaseFromCookies();
  const { data: { user } } = await sb.auth.getUser();
  const site = await getCurrentSite();
  const tanaan = helsinkiTanaan();
  const viikkoNakyma = sp.nakyma === "viikko";

  const requested = Number(sp.days);
  const DAYS_AHEAD = Number.isFinite(requested) && requested > 0
    ? Math.min(MAX_DAYS_AHEAD, Math.max(7, Math.floor(requested)))
    : DEFAULT_DAYS_AHEAD;

  const viikonAlku = maanantai(sp.viikko && /^\d{4}-\d{2}-\d{2}$/.test(sp.viikko) ? sp.viikko : tanaan);
  const alku = viikkoNakyma ? viikonAlku : tanaan;
  const loppu = viikkoNakyma ? lisaaPaivia(viikonAlku, 6) : lisaaPaivia(tanaan, DAYS_AHEAD - 1);
  const { paivat } = await haePaivat(site.id, alku, loppu);

  const taytetty = paivat.filter((p) => p.saanto && !p.saanto.auto_filled).length;
  const auto = paivat.filter((p) => p.saanto?.auto_filled).length;
  const introja = paivat.filter((p) => p.saanto?.intro_text).length;
  const varoituksia = paivat.filter((p) => p.varoitukset.length).length;

  const nappi = (aktiivinen: boolean) =>
    aktiivinen
      ? "rounded-md bg-foreground text-background px-3 py-1 text-sm font-medium"
      : "rounded-md border px-3 py-1 text-sm hover:bg-muted";

  return (
    <>
      <Nav email={user?.email} />
      <main className={`mx-auto space-y-6 px-4 py-8 ${viikkoNakyma ? "max-w-7xl" : "max-w-5xl"}`}>
        <div>
          <h1 className="text-2xl font-semibold">Päivän visa</h1>
          <p className="text-sm text-muted-foreground">
            Etusivun suurin nosto. Päivät, joille toimitus ei ole valinnut visaa, täyttää
            automaatti (yöajo 7 päivää eteenpäin). Päivän sankari lasketaan syntymäpäivistä
            eikä sitä ajasteta. Site: <strong>{site.name}</strong>.
          </p>
          <p className="mt-1 text-sm">
            <span className="font-medium">{taytetty}</span> toimitettua ·{" "}
            <span className="font-medium">{auto}</span> automaattivalintaa ·{" "}
            <span className="font-medium">{introja}</span> introa ·{" "}
            <span className={varoituksia ? "font-medium text-amber-700" : "font-medium"}>{varoituksia}</span> päivää varoituksin
            {" "}({paivat.length} päivää näkymässä)
          </p>
        </div>

        <Mittaus tanaan={tanaan} />

        <div className="flex flex-wrap items-center gap-2">
          <a href="/paivan-visa" className={nappi(!viikkoNakyma)}>Lista</a>
          <a href="/paivan-visa?nakyma=viikko" className={nappi(viikkoNakyma)}>Viikko</a>
          <span className="mx-2 h-5 w-px bg-border" />
          {viikkoNakyma ? (
            <>
              <a href={`?nakyma=viikko&viikko=${lisaaPaivia(viikonAlku, -7)}`} className={nappi(false)}>← Edellinen</a>
              <a href="?nakyma=viikko" className={nappi(false)}>Tämä viikko</a>
              <a href={`?nakyma=viikko&viikko=${lisaaPaivia(viikonAlku, 7)}`} className={nappi(false)}>Seuraava →</a>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">Näytä:</span>
              {PRESETS.map((d) => (
                <a key={d} href={`?days=${d}`} className={nappi(DAYS_AHEAD === d)}>
                  {d === 365 ? "1 vuosi" : `${d} päivää`}
                </a>
              ))}
            </>
          )}
        </div>

        {viikkoNakyma ? (
          <Viikko paivat={paivat} tanaan={tanaan} />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Päivä</TableHead>
                  <TableHead>Päivän visa</TableHead>
                  <TableHead className="w-[130px]">Kokoelma</TableHead>
                  <TableHead className="w-[190px]">Päivän sankari</TableHead>
                  <TableHead className="w-[150px] text-right">Toiminnot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paivat.map((p) => (
                  <DayRow key={p.iso} paiva={p} siteId={site.id} tanaan={tanaan} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </>
  );
}

function Viikko({ paivat, tanaan }: { paivat: Paiva[]; tanaan: string }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {paivat.map((p) => {
        const { lyhyt, vp } = paivaTeksti(p.iso);
        return (
          <Link
            key={p.iso}
            href={`/paivan-visa/${p.iso}`}
            className={`flex min-h-[210px] flex-col gap-2 rounded-lg border p-3 hover:bg-muted/50 ${
              p.iso === tanaan ? "border-amber-400 bg-amber-50/40" : ""
            } ${p.varoitukset.length ? "ring-1 ring-amber-300" : ""}`}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold">{vp} {lyhyt}</span>
              {p.iso === tanaan && <span className="text-[11px] font-medium text-amber-700">tänään</span>}
            </div>
            {p.visa ? (
              <>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">{p.visa.kokoelma ?? "—"}</span>
                <span className="text-sm font-medium leading-snug">{p.visa.title}</span>
              </>
            ) : (
              <span className="text-sm italic text-muted-foreground">Automaatti valitsee</span>
            )}
            <div className="mt-auto flex flex-col gap-1.5">
              <Merkit paiva={p} />
              {p.sankari && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  {p.sankari.death_date ? <Flower2 className="h-3 w-3" /> : <Cake className="h-3 w-3" />}
                  {p.sankari.name}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
