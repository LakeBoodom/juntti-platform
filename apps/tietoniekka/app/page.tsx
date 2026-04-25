import { brand } from "@/config/brand";

// Placeholder etusivu — korvataan migroidulla index.html-rakenteella
// design_brief.md:n mukaisesti seuraavassa työvaiheessa.
export default function HomePage() {
  return (
    <main className="placeholder">
      <h1>{brand.name}</h1>
      <p>Sivusto pystytetään uuteen ilmeeseen — tarkista pian uudelleen.</p>
    </main>
  );
}
