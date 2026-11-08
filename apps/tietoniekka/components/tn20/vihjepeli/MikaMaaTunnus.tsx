// MIKÄ MAA? -TUNNUS (CD-paketti v0.2, 0g "Kohdistin + sanamerkki", Heikki 7.11.2026). Keksitty maa (siemen 11), joten tunnus
// ei vihjaa mihinkään oikeaan maahan eikä vanhene. Maan painopiste on kohdistimen keskellä ja kysymysmerkki maan sisällä.
// Isona sanamerkin kanssa (aloitussivu), ikonina ilman nimeä (Karttapelit-kortti). Geometria laskettu CD:n fictLand(11)-funktiolla.

export const MAA = "M272.7 140.9L271.0 142.7L268.9 144.3L266.6 145.9L265.1 147.3L264.5 148.9L261.8 150.1L260.9 151.4L259.3 152.6L256.4 153.4L255.0 154.5L253.9 155.6L253.0 156.8L251.7 157.7L250.8 158.9L248.3 159.2L247.9 160.6L246.5 161.3L244.9 162.0L244.7 163.6L244.0 164.8L243.5 166.4L242.6 167.7L243.3 170.6L243.0 172.8L242.9 175.5L244.0 180.1L244.1 183.8L242.5 185.6L241.2 188.0L240.2 191.4L237.7 192.2L235.5 193.7L232.9 194.4L230.4 195.4L227.3 194.4L225.1 196.6L222.4 197.5L219.6 197.7L216.8 198.2L214.0 199.6L211.0 202.4L208.0 202.5L204.8 203.1L201.8 202.8L198.4 203.5L195.0 204.2L192.1 203.1L188.0 204.8L184.8 204.2L180.5 205.6L176.4 206.2L172.1 206.6L169.4 204.5L166.6 202.8L164.7 199.9L163.9 196.1L162.1 193.5L162.5 189.1L162.0 185.9L163.0 181.7L162.3 179.1L162.2 176.3L160.1 174.9L160.3 172.1L158.9 170.3L156.2 169.2L154.8 167.4L154.8 165.0L153.2 163.3L152.3 161.3L149.8 159.8L148.7 157.9L147.7 155.8L146.5 153.8L143.2 152.1L142.3 150.0L141.2 147.8L140.7 145.5L139.9 143.2L141.8 140.9L140.3 138.6L143.1 136.4L144.0 134.2L145.7 132.2L146.3 130.1L144.5 127.5L144.8 125.3L144.6 122.8L145.7 120.7L145.2 118.1L146.6 116.0L148.4 114.1L151.5 112.9L156.3 112.6L160.3 112.2L164.5 112.1L168.4 112.1L172.4 112.4L173.9 111.2L176.2 110.6L177.4 109.2L179.7 108.7L182.3 108.7L184.0 107.8L184.8 105.9L186.0 104.3L188.4 104.4L189.1 101.8L191.1 101.1L191.9 98.2L193.3 96.0L195.3 94.8L196.8 92.0L198.5 89.2L200.9 88.2L203.4 87.3L206.2 88.3L208.8 87.9L211.5 89.9L214.0 91.4L216.5 91.1L218.8 91.8L221.3 91.9L224.2 89.6L227.1 88.1L230.2 87.1L232.9 87.3L236.6 85.4L240.3 83.9L243.3 84.3L246.7 84.2L249.8 84.7L252.2 86.3L256.2 85.8L259.8 86.1L263.0 87.0L267.9 86.2L270.6 87.9L274.6 88.4L280.5 87.7L284.2 89.0L289.4 89.3L295.6 89.4L302.5 89.4L309.7 89.7L313.8 91.9L318.8 94.0L322.0 96.9L321.1 101.4L318.7 106.2L315.2 111.0L309.5 116.1L304.9 120.4L301.3 124.1L295.9 127.8L291.3 131.1L287.2 133.9L281.6 136.6L277.1 138.9Z M140.3 124.4L138.6 125.5L138.6 126.8L137.4 127.7L136.9 129.5L135.2 130.7L132.8 131.5L130.6 130.3L129.1 129.0L128.3 127.6L128.4 126.2L126.8 125.5L125.1 124.4L123.2 122.6L124.9 121.1L126.3 119.7L129.4 120.2L131.2 120.0L132.8 119.8L134.7 119.5L137.2 119.0L139.1 119.9L140.7 121.2L141.7 122.7Z";
const T = {"cx":220,"cy":138,"r1":112,"r2":78,"ty1":4,"ty2":32,"ty3":244,"ty4":272,"rx1":86,"rx2":114,"rx3":326,"rx4":354,"ry":152};

export default function MikaMaaTunnus({ sanamerkki = false, className }: { sanamerkki?: boolean; className?: string }) {
  const viiva = { stroke: "#B4532A", strokeWidth: 5, strokeLinecap: "round" as const };
  return (
    <svg
      className={className}
      viewBox={sanamerkki ? "0 0 440 352" : "0 -6 440 290"}
      role="img"
      aria-label={sanamerkki ? "Mikä maa? -tunnus: keksitty maa kohdistimen keskellä" : "Keksitty maa kohdistimen keskellä"}
    >
      <circle cx={T.cx} cy={T.cy} r={T.r1} fill="none" stroke="#C9BEA6" strokeWidth={2} strokeDasharray="6 8" />
      <circle cx={T.cx} cy={T.cy} r={T.r2} fill="none" stroke="#C9BEA6" strokeWidth={2} strokeDasharray="6 8" />
      <path d={MAA} fill="#0E3A5C" stroke="#0E3A5C" strokeWidth={2} strokeLinejoin="round" fillRule="evenodd" />
      <line x1={T.cx} y1={T.ty1} x2={T.cx} y2={T.ty2} {...viiva} />
      <line x1={T.cx} y1={T.ty3} x2={T.cx} y2={T.ty4} {...viiva} />
      <line x1={T.rx1} y1={T.cy} x2={T.rx2} y2={T.cy} {...viiva} />
      <line x1={T.rx3} y1={T.cy} x2={T.rx4} y2={T.cy} {...viiva} />
      <circle cx={T.cx} cy={T.cy} r={26} fill="#B4532A" stroke="#F2EDE2" strokeWidth={5} />
      <text x={T.cx} y={T.ry} textAnchor="middle" fontFamily="Archivo Variable, Archivo, sans-serif" fontWeight={900} fontSize={34} fill="#fff">?</text>
      {sanamerkki && (
        <text x={220} y={330} textAnchor="middle" fontFamily="Archivo Variable, Archivo, sans-serif" fontWeight={900} fontSize={58} letterSpacing={-1} fill="#0E3A5C" style={{ fontVariationSettings: "\"wdth\" 70" }}>
          MIKÄ MAA<tspan fill="#B4532A">?</tspan>
        </text>
      )}
    </svg>
  );
}
