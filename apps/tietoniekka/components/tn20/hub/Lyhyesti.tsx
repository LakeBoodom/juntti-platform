// Aihesivujen Lyhyesti-lohko (erä B4): 0–3 riviä "NIMIÖ · arvo". Tyhjänä ei renderöidy lainkaan.
export default function Lyhyesti({ rivit }: { rivit: Array<{ label: string; value: string }> }) {
  if (!rivit.length) return null;
  return (
    <section className="hub-lyhyesti" aria-label="Lyhyesti">
      <div className="hub-lyhyesti-otsikko">Lyhyesti</div>
      <dl>
        {rivit.map((r) => (
          <div key={r.label} className="hub-lyhyesti-rivi">
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
