// SEO-erä A4 (2.10.2026): ISR 5 min. Sisältö on sivu.tsx:ssä; parametrilliset pyynnöt ohjataan
// middlewaressa dynaamiseen /suodatettu/kokoelma/luonto-reittiin.
import Sivu, { generateMetadata } from "./sivu";

export { generateMetadata };
export const revalidate = 300;

export default function Page() {
  return Sivu({ searchParams: Promise.resolve({}) });
}
