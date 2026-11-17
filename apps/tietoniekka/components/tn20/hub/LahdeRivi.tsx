// Aihesivujen lähderivi (erä B4): "Lue lisää: Wikipedia ↗". Kuvan lähde ei näy tässä (kuvalähdebrief 17.11.2026):
// tekijä ja lisenssi ovat vain sivulla /kuvien-lahteet, johon alatunniste linkittää.
export default function LahdeRivi({ wikipedia }: { wikipedia?: string | null }) {
  if (!wikipedia) return null;
  return (
    <p className="hub-lahde">
      <a href={wikipedia} target="_blank" rel="noopener noreferrer">
        Lue lisää: Wikipedia ↗
      </a>
    </p>
  );
}
