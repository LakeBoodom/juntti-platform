"use client";
// "Etkö osaa valita? → Arvo teema" (CD 3A): arvotaan selaimessa painettaessa.

export default function ArvoTeema({ polut }: { polut: string[] }) {
  return (
    <div className="tks-arvo">
      <span>Etkö osaa valita?</span>
      <button type="button" onClick={() => location.assign(polut[Math.floor(Math.random() * polut.length)])}>
        Arvo teema
      </button>
    </div>
  );
}
