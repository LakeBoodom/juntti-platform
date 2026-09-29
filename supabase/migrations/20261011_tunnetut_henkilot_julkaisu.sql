-- TUNNETUT HENKILÖT (29.9.2026): 48 luonnosta julki (Heikki: "kaikki joissa on valokuva").
-- Tarkistettu ennen julkaisua: kuva latautuu (330 ja 1280 px), 5 kysymystä + teaser,
-- syntymä- ja kuolinpäivät Wikidataa vasten (Jefferson: Wikidatan 2.4.1743 on juliaaninen,
-- kannan 13.4. oikea). Ryhmä ja laji täytetään (Ikäjärjestys-pelin kategoriat).
-- Juntin Depardieu-luonnos (ei teaseria) jätetään ennalleen.

update public.celebrities c set ryhma = v.ryhma, laji = v.laji
from (values
  ('Antonio Vivaldi','artistit','klassinen'), ('Maurice Ravel','artistit','klassinen'),
  ('Thomas Jefferson','poliitikot','politiikka'), ('Elisabeth Rehn','poliitikot','politiikka'),
  ('Pekka Haavisto','poliitikot','politiikka'), ('Jens Stoltenberg','poliitikot','politiikka'),
  ('Alexander Stubb','poliitikot','politiikka'),
  ('Elias Lönnrot','muut','kirjallisuus'), ('Minna Canth','muut','kirjallisuus'), ('Leena Lehtolainen','muut','kirjallisuus'),
  ('Alexander Graham Bell','muut','tiede'), ('Albert Einstein','muut','tiede'),
  ('Vincent van Gogh','muut','kuvataide'), ('Harry Houdini','muut','media'), ('Jeremy Clarkson','muut','media'),
  ('Bernard Arnault','muut','talous'),
  ('Aki Kaurismäki','muut','elokuva'), ('Renny Harlin','muut','elokuva'), ('Quentin Tarantino','muut','elokuva'),
  ('Charlie Chaplin','nayttelijat','nayttelija'), ('William Shatner','nayttelijat','nayttelija'),
  ('Matti Pellonpää','nayttelijat','nayttelija'), ('Jackie Chan','nayttelijat','nayttelija'),
  ('Sharon Stone','nayttelijat','nayttelija'), ('Daniel Craig','nayttelijat','nayttelija'), ('Adrien Brody','nayttelijat','nayttelija'),
  ('Spede Pasanen','nayttelijat','komedia'), ('Heikki Kinnunen','nayttelijat','komedia'), ('Sami Hedberg','nayttelijat','komedia'),
  ('Tapio Rautavaara','artistit','musiikki'), ('Nat King Cole','artistit','musiikki'), ('Reijo Taipale','artistit','musiikki'),
  ('Diana Ross','artistit','musiikki'), ('Elton John','artistit','musiikki'), ('Jenni Vartiainen','artistit','musiikki'),
  ('Justin Bieber','artistit','musiikki'),
  ('Clas Thunberg','urheilijat','talviurheilu'), ('Hannu Manninen','urheilijat','talviurheilu'),
  ('Gordie Howe','urheilijat','jaakiekko'), ('Mikko Koivu','urheilijat','jaakiekko'),
  ('Timo Mäkinen','urheilijat','moottoriurheilu'), ('Juha Kankkunen','urheilijat','moottoriurheilu'),
  ('Ayrton Senna','urheilijat','moottoriurheilu'), ('Carlos Sainz Sr.','urheilijat','moottoriurheilu'),
  ('Jari-Matti Latvala','urheilijat','moottoriurheilu'),
  ('Tiina Lillak','urheilijat','yleisurheilu'), ('Shaquille O''Neal','urheilijat','koripallo'),
  ('Teemu Pukki','urheilijat','jalkapallo')
) as v(nimi, ryhma, laji)
where c.name = v.nimi and c.ryhma is null
  and exists (select 1 from public.quizzes q where q.id = c.trivia_quiz_id and q.status = 'draft' and q.platform = 'tietoniekka');

update public.quizzes set title = 'Elias Lönnrot – kansanrunojen kerääjä'
where slug = 'elias-lonnrot-kansanrunojen-keraaja' and title = 'Elias Lönnrot – kansanrunojen kerääjän syntymäpäivä';

update public.quizzes q set status = 'published', published_at = coalesce(q.published_at, now())
where q.collection = 'tunnetut-henkilot' and q.status = 'draft' and q.platform = 'tietoniekka'
  and exists (select 1 from public.celebrities c where c.trivia_quiz_id = q.id and c.image_url is not null);
