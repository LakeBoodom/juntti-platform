// Aihesivujen lähderivi (erä B4): "Kuva: Wikimedia Commons" + "Lue lisää: Wikipedia ↗".
export default function LahdeRivi({ kuva, wikipedia }: { kuva?: string | null; wikipedia?: string | null }) {
  if (!kuva && !wikipedia) return null;
  return (
    <p className="hub-lahde">
      {kuva && <span>Kuva: {kuva}</span>}
      {wikipedia && (
        <a href={wikipedia} target="_blank" rel="noopener noreferrer">
          Lue lisää: Wikipedia ↗
        </a>
      )}
    </p>
  );
}
