-- 2.10.2026: Heikki: Kärpät, Lukko ja KalPa näkyviin paremmin visasivun desktop-herossa (pää leikkautui).
-- Kuvat tehty uudelleen (pelaaja pienennettynä vasemmalle, sumea jatke) ja fokus ylös.
update quizzes set hero_focal_x = 0.4, hero_focal_y = 0.15
where slug in ('karpat-tietovisa-legendat', 'rauman-lukko-visa', 'kalpa-niiralan-montun-kovin-tietovisa');
