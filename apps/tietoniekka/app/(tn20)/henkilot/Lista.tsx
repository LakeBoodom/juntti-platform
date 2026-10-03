// Ryhmä-, laji- ja kuukausisivujen yhteinen runko (erä B3): murupolku, H1, chipit, rivit.
import Crumbs, { type CrumbItem } from "@/components/tn20/Crumbs";
import HenkiloRivi, { type HenkiloRiviData } from "@/components/tn20/hub/HenkiloRivi";

export default function Lista({
  murut,
  otsikko,
  lead,
  chipit,
  osiot,
}: {
  murut: CrumbItem[];
  otsikko: string;
  lead: string;
  chipit?: Array<{ nimi: string; href: string; n?: number; on?: boolean }>;
  osiot: Array<{ otsikko?: string; rivit: HenkiloRiviData[] }>;
}) {
  return (
    <main className="hs hk-sivu">
      <Crumbs items={murut} />
      <div className="tn-shell hk-shell">
        <header className="hk-head" style={{ ["--hk-lw" as string]: Math.max(...otsikko.split(/\s+/).map((w) => w.length), 8) }}>
          <h1 className="hk-h1">{otsikko}</h1>
          <p className="hk-lead">{lead}</p>
        </header>
        {chipit && chipit.length > 1 && (
          <nav className="hk-chipit hk-chipit--sivu" aria-label="Rajaa">
            {chipit.map((c) => (
              <a key={c.href} className={c.on ? "hk-chip on" : "hk-chip"} href={c.href} aria-current={c.on ? "page" : undefined}>
                {c.nimi} {c.n !== undefined && <span>{c.n}</span>}
              </a>
            ))}
          </nav>
        )}
        {osiot.map((o, i) => (
          <section key={o.otsikko ?? i} className="hk-kirjain">
            {o.otsikko && <h2 className="hk-kirjain-otsikko">{o.otsikko}</h2>}
            {o.rivit.map((r) => (
              <HenkiloRivi key={r.href} r={r} />
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
