// Puolueen näyttönimi (katselmus 5.10.2026): vain SDP aukikirjoitetaan, muut kannan nimellä.
export const puolueNimi = (p: string | null | undefined) => (p === "SDP" ? "Sosialidemokraatit" : p ?? null);
