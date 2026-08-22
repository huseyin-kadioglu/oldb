-- Kapak badge: yalnızca seçili (Nobel ile özdeşleşen) kitaplar
BEGIN;

UPDATE books SET is_won_nobel_prize = false WHERE is_won_nobel_prize = true;

UPDATE books b
SET is_won_nobel_prize = true
FROM authors a
WHERE b.author_id = a.id
  AND (
    (a.name = 'Albert Camus' AND b.title = 'Yabancı')
    OR (a.name = 'Hermann Hesse' AND b.title = 'Boncuk Oyunu')
    OR (a.name = U&'José Saramago' AND b.title = U&'Körlük')
    OR (a.name = 'Orhan Pamuk' AND b.title = U&'Benim Adım Kırmızı')
    OR (a.name = U&'Gabriel García Márquez' AND b.title = U&'Yüzyıllık Yalnızlık')
    OR (a.name = 'Ernest Hemingway' AND b.title = U&'Yaşlı Adam ve Deniz')
  );

COMMIT;

SELECT a.name, b.title, b.is_won_nobel_prize
FROM books b JOIN authors a ON a.id = b.author_id
WHERE b.is_won_nobel_prize
ORDER BY a.name;
