-- Henkilö + kysymys -kortit 5p ja 5q (24.9.2026).
alter table ig_julkaisut drop constraint ig_julkaisut_pohja_check;
alter table ig_julkaisut add constraint ig_julkaisut_pohja_check check (pohja = any (array[
  'V-A','V-B','V-C','V-D','V-E','S-A','S-B','S-C','S-D',
  '4a','4b','4c','4d','4e','4f','4g','4h','4i','4j','4l','4m','4n','4o','4p','4q','4r',
  '5a','5b','5d','5n','5f','5h','5i','5m','5p','5q'
]));
