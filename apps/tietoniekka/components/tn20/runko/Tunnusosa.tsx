// V4 TUNNUSOSA asetuksesta (runko §3): kokoelman asetus nimeää tunnusosan (signature), runko piirtää sen.
// Sijoitusnauha (Euroviisut, vaihe 2), aikajana (Historia, vaihe 3).
import type { RunkoData } from "@/lib/kokoelmat/data";
import Sijoitusnauha from "./Sijoitusnauha";
import Aikajana from "./Aikajana";

export default function Tunnusosa({ d }: { d: RunkoData }) {
  switch (d.k.signature) {
    case "sijoitusnauha":
      return <Sijoitusnauha />;
    case "aikajana":
      return <Aikajana d={d} />;
    default:
      return null;
  }
}
