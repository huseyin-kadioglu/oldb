-- Nobel: clear book-level flags; author-level prize fields
-- docker cp ... && psql -f ...

BEGIN;

ALTER TABLE authors
  ADD COLUMN IF NOT EXISTS won_nobel_prize boolean NOT NULL DEFAULT false;

ALTER TABLE authors
  ADD COLUMN IF NOT EXISTS nobel_year integer;

-- Kitaplar Nobel almaz; yanlış bayrakları temizle
UPDATE books SET is_won_nobel_prize = false WHERE is_won_nobel_prize = true;

-- Mevcut Nobel yazarları
UPDATE authors SET won_nobel_prize = true, nobel_year = 1957
WHERE lower(trim(name)) = lower(trim('Albert Camus'));

UPDATE authors SET won_nobel_prize = true, nobel_year = 1946
WHERE lower(trim(name)) = lower(trim(U&'Hermann Hesse'));

UPDATE authors SET won_nobel_prize = true, nobel_year = 1998
WHERE lower(trim(name)) = lower(trim(U&'José Saramago'));

COMMIT;

SELECT name, won_nobel_prize, nobel_year FROM authors WHERE won_nobel_prize = true ORDER BY nobel_year;
SELECT COUNT(*) AS books_still_flagged FROM books WHERE is_won_nobel_prize = true;
