// Social share placeholders — wired as Phase 5 work. Clicking alerts for now
// so the UI layout matches the mockup but doesn't fire real shares.
"use client";

export function ShareRow({ label = "Jaa tulos" }: { label?: string }) {
  const stub = () => alert("Jakotoiminto tulossa pian");
  return (
    <div className="share-row">
      <button className="share-main" onClick={stub}>
        📊 {label}
      </button>
      <button className="share-icon wa" onClick={stub} aria-label="WhatsApp">
        💬
      </button>
      <button className="share-icon fb" onClick={stub} aria-label="Facebook">
        f
      </button>
      <button className="share-icon ms" onClick={stub} aria-label="Messenger">
        m
      </button>
    </div>
  );
}

export function ShareRowCompact({ label }: { label: string }) {
  const stub = () => alert("Jakotoiminto tulossa pian");
  return (
    <div
      className="share-row"
      style={{
        padding: "14px 0 0",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        marginTop: 12,
      }}
    >
      <button className="share-main" onClick={stub}>
        📊 {label}
      </button>
      <button className="share-icon wa" onClick={stub} aria-label="WhatsApp">
        💬
      </button>
      <button className="share-icon fb" onClick={stub} aria-label="Facebook">
        f
      </button>
    </div>
  );
}
