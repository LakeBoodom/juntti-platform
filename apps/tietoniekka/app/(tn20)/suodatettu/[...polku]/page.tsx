// SEO-erä A4 (2.10.2026): suodatinparametrillisten hubien dynaaminen versio. Kokoelmasivut ovat
// ISR-sivuja, jotka eivät lue searchParamsia; middleware kirjoittaa esim.
// /kokoelma/luonto?suodata=linnut sisäisesti tähän reittiin (osoite selaimessa ei muutu).
// Canonical tulee alkuperäisen sivun metadatasta (= suodattamaton hub).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Luonto, { generateMetadata as luontoMeta } from "../../kokoelma/luonto/sivu";
import Kulttuuri, { generateMetadata as kulttuuriMeta } from "../../kokoelma/kulttuuri/sivu";
import Jalkapallo, { generateMetadata as jalkapalloMeta } from "../../kokoelma/jalkapallo/sivu";
import Kokoelma, { generateMetadata as kokoelmaMeta } from "../../kokoelma/[collection]/sivu";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | string[] | undefined>>;
type Props = { params: Promise<{ polku: string[] }>; searchParams: SP };

const OMAT: Record<string, { Sivu: (p: { searchParams: SP }) => Promise<React.ReactElement>; meta: () => Promise<Metadata> }> = {
  luonto: { Sivu: Luonto, meta: luontoMeta },
  kulttuuri: { Sivu: Kulttuuri, meta: kulttuuriMeta },
  jalkapallo: { Sivu: Jalkapallo, meta: jalkapalloMeta },
};
/** [collection]-reitin palvelemat hubit (staattiset kansiot varjostavat muut). */
const KOKOELMAHUBIT = new Set(["kuvavisat", "tunnetut-henkilot"]);

async function kohde(params: Props["params"]) {
  const polku = (await params).polku;
  if (polku.length !== 2 || polku[0] !== "kokoelma") return null;
  return polku[1];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const k = await kohde(params);
  if (!k) return {};
  if (OMAT[k]) return OMAT[k].meta();
  if (KOKOELMAHUBIT.has(k)) return kokoelmaMeta({ params: Promise.resolve({ collection: k }) });
  return {};
}

export default async function Suodatettu({ params, searchParams }: Props) {
  const k = await kohde(params);
  if (!k) notFound();
  if (OMAT[k]) return OMAT[k].Sivu({ searchParams });
  if (KOKOELMAHUBIT.has(k)) return Kokoelma({ params: Promise.resolve({ collection: k }), searchParams });
  notFound();
}
