-- Erä B / design v0.3 (3.10.2026): kutsumanimen elatiivi pelihyllyn otsikkoon ("Pelaa Kimistä") ja
-- visan tulosnäkymän linkkiin ("Lue lisää Kimistä"). Cowork täyttää kaikki 380; tyhjänä koodi
-- käyttää koko nimeä ("Pelaa: Kimi Räikkönen") eikä koskaan generoi taivutusmuotoa.
alter table celebrities add column if not exists nimi_elatiivi text;
comment on column celebrities.nimi_elatiivi is 'Kutsumanimen elatiivi pelihyllyn otsikkoon ("Pelaa Kimistä") ja linkkiin "Lue lisää Kimistä". Tyhjä → koko nimi ("Pelaa: Kimi Räikkönen"); koodi ei koskaan generoi muotoa.';
