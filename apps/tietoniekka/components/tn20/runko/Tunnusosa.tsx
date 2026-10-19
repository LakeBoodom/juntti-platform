// V4 TUNNUSOSA asetuksesta (runko §3): kokoelman asetus nimeää tunnusosan (signature), runko piirtää sen.
// Vaiheessa 2 toteutettu sijoitusnauha; aikajana, vuosikiekko, laskuri ja synttärit siirtyvät vaiheessa 3.
import type { Kokoelma } from "@/lib/kokoelmat/tyypit";
import Sijoitusnauha from "./Sijoitusnauha";

export default function Tunnusosa({ k }: { k: Kokoelma }) {
  switch (k.signature) {
    case "sijoitusnauha":
      return <Sijoitusnauha />;
    default:
      return null;
  }
}
