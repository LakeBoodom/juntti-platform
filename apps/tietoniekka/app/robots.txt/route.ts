// SEO-erä A10 (2.10.2026): robots.txt route-handlerina (robots.ts ei osaa kommenttirivejä).
// AI-crawlereille eksplisiittiset Allow-säännöt + viittaus llms.txt:hen.
// /esikatselu-sivut ovat noindex-otsakkeella (next.config.mjs); niitä ei estetä tässä, koska
// Disallow estäisi hakukonetta näkemästä noindexiä.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tietoniekka.fi";

export const revalidate = 86400;

const AI_BOTIT = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "OAI-SearchBot"];

export function GET() {
  const ryhma = (ua: string) => [`User-Agent: ${ua}`, "Allow: /", "Disallow: /api/", ""];
  const rivit = [
    `# llms: ${SITE_URL}/llms.txt`,
    "",
    ...ryhma("*"),
    ...AI_BOTIT.flatMap(ryhma),
    `Host: ${SITE_URL}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ];
  return new Response(rivit.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600, s-maxage=86400" },
  });
}
