-- Urheilu (Heikki 21.11.2026): Talviurheilu-osio yhdeksälle talvilajien visalle. Lajitagit (alppihiihto, ampumahiihto,
-- maastohiihto, makihyppy, yhdistetty, talviolympialaiset) säilyvät; osio tulee talviurheilu-tagista. Darts-visoilla on jo
-- darts-tagi. Visat ovat luonnoksia, kunnes ne julkaistaan erikseen.
update public.quizzes q set section_tags = array(select distinct unnest(coalesce(q.section_tags, '{}') || array['talviurheilu']))
where q.slug in (
  'yhdistetyn-hiihdon-suomalaissankarit-visa',
  'suomalaiset-talviolympiahetket-visa',
  'ampumahiihdon-legendat-visa',
  'suomalaiset-alppihiihtajat-visa',
  'alppihiihdon-legendat-visa',
  'neljan-maen-turnaus-visa',
  'makihypyn-suomalaislegendat-visa',
  'maastohiihdon-tahdet-visa',
  'suomalaiset-hiihtajat-olympialaisissa-visa'
);
