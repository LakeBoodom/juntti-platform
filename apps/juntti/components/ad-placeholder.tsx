// Placeholder for a future Google AdSense unit. Renders a subtle striped
// block so the layout reflects real page density. Swap the innards with
// the AdSense <ins> snippet once the account is approved.
export function AdPlaceholder({ label = "Mainospaikka" }: { label?: string }) {
  return (
    <div className="section">
      <div className="ad-slot">
        <div className="ad-slot-inner">
          <div className="lbl">{label}</div>
          <div className="sub">AdSense-yksikkö lisätään myöhemmin</div>
        </div>
      </div>
    </div>
  );
}
