-- 1.10.2026: Tampereen ja Stadin derbyvisoille oikeat valokuvat AI-kuvien tilalle (Heikki valitsi T1 + S2).
-- Lähteet kirjattu lib/kuvalahteet.ts:ään. Fokus 0.5 → teksti oikealle, mobiilissa molemmat joukkueet näkyvät.
update quizzes
set hero_image = '/20/jaakiekko/jk-derby-manse-2021.webp',
    hero_focal_x = 0.5,
    hero_focal_y = 0.55,
    hero_alt = 'Aloitus Nokia Arenan avausottelussa Tappara–Ilves 3.12.2021. Kuva: kallerna / Wikimedia Commons, CC BY-SA 4.0'
where slug = 'sm-liiga-tampereen-derby-ilves-tappara';

update quizzes
set hero_image = '/20/jaakiekko/jk-derby-stadi-1971.webp',
    hero_focal_x = 0.5,
    hero_focal_y = 0.5,
    hero_alt = 'Jokereiden Timo Sutinen HIFK:ta vastaan vuonna 1971. Kuva: Heikki Wegelius / Wikimedia Commons, public domain'
where slug = 'sm-liiga-stadin-derby-hifk-jokerit';
