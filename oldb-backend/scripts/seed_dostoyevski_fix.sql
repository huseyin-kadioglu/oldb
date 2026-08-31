BEGIN;

UPDATE books SET
  title = U&'\00D6l\00FCler Evinden An\0131lar',
  original_title = U&'\0417\0430\043F\0438\0441\043A\0438 \0438\0437 \041C\0451\0440\0442\0432\043E\0433\043E \0434\043E\043C\0430',
  genres = U&'Klasik, Kurgu D\0131\015F\0131, An\0131',
  language = 'rus',
  description = U&'\00D6l\00FCler Evinden An\0131lar; Dostoyevski''nin s\00FCrg\00FCn ve hapishane deneyiminden beslenen yar\0131 otobiyografik bir eserdir. \0130nsan onuru, ceza ve dayan\0131\015Fmay\0131 sert bir ger\00E7ek\00E7ilikle anlat\0131r.',
  updated_at = NOW(),
  updated_by = 'seed'
WHERE id = 8;

UPDATE books SET
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\041F\0440\0435\0441\0442\0443\043F\043B\0435\043D\0438\0435 \0438 \043D\0430\043A\0430\0437\0430\043D\0438\0435'),
  language = 'rus',
  genres = COALESCE(NULLIF(TRIM(genres), ''), 'Klasik, Kurgu, Psikolojik'),
  updated_at = NOW(),
  updated_by = COALESCE(updated_by, 'seed')
WHERE id = 1;

UPDATE books SET
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0411\0440\0430\0442\044C\044F \041A\0430\0440\0430\043C\0430\0437\043E\0432\044B'),
  language = 'rus',
  genres = COALESCE(NULLIF(TRIM(genres), ''), 'Klasik, Kurgu, Felsefe'),
  page_count = COALESCE(page_count, 1040),
  description = U&'Karamazov Karde\015Fler; baba-o\011Ful ili\015Fkisi, inan\00E7, \00F6zg\00FCrl\00FCk ve sorumluluk \00FCzerine Dostoyevski''nin en kapsamlı romanıdır. Dimitri, \0130van ve Alyo\015Fa''nın yolları, bir cinayet etrafında ahlaki ve metafizik bir \00E7atı\015Fmaya d\00F6n\00FC\015F\00FCr.',
  updated_at = NOW(),
  updated_by = 'seed'
WHERE id = 2;

UPDATE books SET
  description = U&'Karamazov Karde\015Fler; baba-o\011Ful ili\015Fkisi, inan\00E7, \00F6zg\00FCrl\00FCk ve sorumluluk \00FCzerine Dostoyevski''nin en kapsamlı romanıdır. Dimitri, \0130van ve Alyo\015Fa''nın yolları, bir cinayet etrafında ahlaki ve metafizik bir \00E7atı\015Fmaya d\00F6n\00FC\015F\00FCr.'
WHERE id = 2 AND length(description) < 10;

UPDATE books SET
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0418\0434\0438\043E\0442'),
  language = 'rus',
  genres = COALESCE(NULLIF(TRIM(genres), ''), 'Klasik, Kurgu, Drama'),
  updated_at = NOW(),
  updated_by = COALESCE(updated_by, 'seed')
WHERE id = 3;

UPDATE books SET
  original_title = COALESCE(NULLIF(TRIM(original_title), ''), U&'\0417\0430\043F\0438\0441\043A\0438 \0438\0437 \043F\043E\0434\043F\043E\043B\044C\044F'),
  language = 'rus',
  genres = COALESCE(NULLIF(TRIM(genres), ''), 'Klasik, Kurgu, Felsefe'),
  updated_at = NOW(),
  updated_by = COALESCE(updated_by, 'seed')
WHERE id = 4;

UPDATE books SET language = 'rus', genres = COALESCE(NULLIF(TRIM(genres), ''), 'Klasik, Kurgu, Psikolojik') WHERE id = 5;
UPDATE books SET language = 'rus' WHERE author_id = 1 AND (language IS NULL OR lower(language) LIKE 'rus%');

-- Force Karamazov description (full ASCII-escaped)
UPDATE books SET description = U&'Karamazov Karde\015Fler; baba-o\011Ful ili\015Fkisi, inan\00E7, \00F6zg\00FCrl\00FCk ve sorumluluk \00FCzerine Dostoyevski''nin en kapsamlı romanıdır. Dimitri, \0130van ve Alyo\015Fa''nın yolları, bir cinayet etrafında ahlaki ve metafizik bir \00E7atı\015Fmaya d\00F6n\00FC\015F\00FCr.'
WHERE id = 2;

COMMIT;

SELECT id, title, genres, length(description) AS desc_len FROM books WHERE author_id = 1 ORDER BY publication_year DESC;
