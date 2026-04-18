import Link from "next/link";
import { brand } from "@/config/brand";

export const metadata = { title: `Yhteys — ${brand.name}` };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 pb-24 pt-6">
      <Link href="/" className="text-sm text-ink-muted underline">
        ← Etusivulle
      </Link>
      <h1 className="text-2xl font-bold">Yhteys</h1>
      <p className="text-sm text-ink-muted">
        {brand.name} on pienen tiimin tekemä. Voit ottaa yhteyttä sähköpostitse:
      </p>
      <p className="font-mono text-sm">hei@{brand.url.replace(/^https?:\/\//, "")}</p>
      <p className="text-sm text-ink-muted">
        Kerromme mielellämme lisää ideasta ja otamme vastaan palautteen.
      </p>
    </main>
  );
}
