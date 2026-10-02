// SEO-erä A4 (2.10.2026): ISR 5 min. Sisältö on sivu.tsx:ssä; suodatinparametrilliset pyynnöt
// (?suodata=, ?laji=, ?sarja=) ohjataan middlewaressa dynaamiseen /suodatettu/kokoelma/<x>-reittiin.
import Sivu, { generateMetadata } from "./sivu";

export { generateMetadata };
export const revalidate = 300;

export default function Page({ params }: { params: Promise<{ collection: string }> }) {
  return Sivu({ params, searchParams: Promise.resolve({}) });
}
