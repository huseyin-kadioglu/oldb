# -*- coding: utf-8 -*-
"""Generate UTF-8-safe SQL seed for Sabahattin Ali."""
from pathlib import Path


def u_escape(s: str) -> str:
    out = []
    for ch in s:
        o = ord(ch)
        if ch == "'":
            out.append("''")
        elif o < 128:
            out.append(ch)
        else:
            out.append(f"\\{o:04X}")
    return "U&'" + "".join(out) + "'"


AUTHOR = {
    "name": "Sabahattin Ali",
    "country": "Türkiye",
    "birth_year": 1907,
    "death_year": 1948,
    "portrait": "https://ui-avatars.com/api/?name=Sabahattin+Ali&background=1a1a1a&color=d4af37&size=256",
    "description": (
        "Sabahattin Ali (1907–1948), Türk edebiyatının önde gelen öykü ve roman yazarlarındandır. "
        "Toplumsal gerçekçilik, bireysel yalnızlık ve adalet arayışını sade, güçlü bir dille işler. "
        "Kürk Mantolu Madonna ve İçimizdeki Şeytan başlıca eserleri arasındadır."
    ),
}

BOOKS = [
    {
        "title": "Kürk Mantolu Madonna",
        "original_title": "Kürk Mantolu Madonna",
        "year": 1943,
        "pages": 160,
        "genres": "Klasik, Kurgu, Romantik",
        "cover": "https://covers.openlibrary.org/b/isbn/9789753638029-L.jpg",
        "description": (
            "Kürk Mantolu Madonna; Raif Efendi'nin Berlin'de tanıştığı Maria Puder'e duyduğu "
            "sessiz ve derin aşkı anlatır. Sabahattin Ali, yalnızlık, kaçırılmış mutluluk ve "
            "sıradan bir hayatın içinde gizlenen büyük duyguları sade bir dille işler."
        ),
    },
    {
        "title": "İçimizdeki Şeytan",
        "original_title": "İçimizdeki Şeytan",
        "year": 1940,
        "pages": 272,
        "genres": "Klasik, Kurgu, Psikolojik",
        "cover": "https://covers.openlibrary.org/b/isbn/9789753638036-L.jpg",
        "description": (
            "İçimizdeki Şeytan; genç aydın Ömer'in idealler, aşk ve toplumsal baskı arasında "
            "sıkışmasını anlatır. Sabahattin Ali, bireyin içindeki çelişkiyi ve dönemin entelektüel "
            "iklimini keskin bir gözlemle yansıtır."
        ),
    },
    {
        "title": "Kuyucaklı Yusuf",
        "original_title": "Kuyucaklı Yusuf",
        "year": 1937,
        "pages": 224,
        "genres": "Klasik, Kurgu, Drama",
        "cover": "https://covers.openlibrary.org/b/isbn/9789753638012-L.jpg",
        "description": (
            "Kuyucaklı Yusuf; Anadolu taşrasında geçen bir yetimlik, adalet ve aşk romanıdır. "
            "Yusuf'un sert kaderi, feodal düzenin baskısı ve bireysel direniş üzerinden anlatılır."
        ),
    },
    {
        "title": "Değirmen",
        "original_title": "Değirmen",
        "year": 1935,
        "pages": 160,
        "genres": "Klasik, Kurgu, Öykü",
        "cover": "https://covers.openlibrary.org/b/isbn/9789750802911-L.jpg",
        "description": (
            "Değirmen; Sabahattin Ali'nin erken dönem öykülerini bir araya getirir. "
            "Köy ve taşra hayatından kesitlerle yoksulluk, haksızlık ve insan hallerini "
            "kısa, çarpıcı anlatımlarla işler."
        ),
    },
    {
        "title": "Kağnı",
        "original_title": "Kağnı",
        "year": 1936,
        "pages": 128,
        "genres": "Klasik, Kurgu, Öykü",
        "cover": "https://covers.openlibrary.org/b/isbn/9789750802928-L.jpg",
        "description": (
            "Kağnı; Anadolu insanının gündelik mücadelesini ve toplumsal eşitsizliği "
            "öykü formunda anlatır. Sabahattin Ali'nin sade üslubu, güçlü gözlemle birleşir."
        ),
    },
    {
        "title": "Ses",
        "original_title": "Ses",
        "year": 1937,
        "pages": 144,
        "genres": "Klasik, Kurgu, Öykü",
        "cover": "https://covers.openlibrary.org/b/isbn/9789750802935-L.jpg",
        "description": (
            "Ses; Sabahattin Ali'nin öykücülüğünü pekiştiren bir derlemedir. "
            "Bireysel yalnızlık, sınıfsal gerilim ve gündelik hayatın kırılganlıkları "
            "kısa anlatılarda yankılanır."
        ),
    },
    {
        "title": "Yeni Dünya",
        "original_title": "Yeni Dünya",
        "year": 1943,
        "pages": 176,
        "genres": "Klasik, Kurgu, Öykü",
        "cover": "https://covers.openlibrary.org/b/isbn/9789753638043-L.jpg",
        "description": (
            "Yeni Dünya; savaş ve toplumsal değişim döneminin izlerini taşıyan öykülerden oluşur. "
            "Sabahattin Ali, umut ile hayal kırıklığını aynı düzlemde tutarak insanı merkeze alır."
        ),
    },
    {
        "title": "Sırça Köşk",
        "original_title": "Sırça Köşk",
        "year": 1947,
        "pages": 192,
        "genres": "Klasik, Kurgu, Öykü",
        "cover": "https://covers.openlibrary.org/b/isbn/9789753638050-L.jpg",
        "description": (
            "Sırça Köşk; Sabahattin Ali'nin alegorik ve eleştirel anlatılarının öne çıktığı "
            "son dönem öykü kitabıdır. İktidar, korku ve özgürlük temaları masalsı bir dilde işlenir."
        ),
    },
]


def main() -> None:
    lines = [
        "-- Sabahattin Ali katalog seed (Türkçe)",
        "-- Yükleme:",
        "--   docker cp oldb-backend/scripts/seed_sabahattin_ali.sql my_postgres:/tmp/seed_sabahattin_ali.sql",
        "--   docker exec my_postgres psql -U myuser -d mydatabase -f /tmp/seed_sabahattin_ali.sql",
        "",
        "BEGIN;",
        "",
        "-- Yazar (yoksa ekle)",
        "INSERT INTO authors (name, country, birth_year, death_year, portrait, description)",
        "SELECT",
        f"  {u_escape(AUTHOR['name'])},",
        f"  {u_escape(AUTHOR['country'])},",
        f"  {AUTHOR['birth_year']},",
        f"  {AUTHOR['death_year']},",
        f"  {u_escape(AUTHOR['portrait'])},",
        f"  {u_escape(AUTHOR['description'])}",
        f"WHERE NOT EXISTS (SELECT 1 FROM authors WHERE lower(trim(name)) = lower(trim({u_escape(AUTHOR['name'])})));",
        "",
        "UPDATE authors SET",
        f"  country = {u_escape(AUTHOR['country'])},",
        f"  birth_year = {AUTHOR['birth_year']},",
        f"  death_year = {AUTHOR['death_year']},",
        f"  portrait = COALESCE(NULLIF(TRIM(portrait), ''), {u_escape(AUTHOR['portrait'])}),",
        f"  description = {u_escape(AUTHOR['description'])}",
        f"WHERE lower(trim(name)) = lower(trim({u_escape(AUTHOR['name'])}));",
        "",
    ]

    for b in BOOKS:
        lines.extend(
            [
                "INSERT INTO books (",
                "  id, title, original_title, author_id, publication_year, page_count,",
                "  description, genres, language, cover_url,",
                "  is_won_nobel_prize, editor_choice, weekly_pick, new_release,",
                "  created_at, updated_at, created_by, updated_by",
                ")",
                "SELECT nextval('book_id_seq'),",
                f"  {u_escape(b['title'])},",
                f"  {u_escape(b['original_title'])},",
                "  a.id,",
                f"  {b['year']},",
                f"  {b['pages']},",
                f"  {u_escape(b['description'])},",
                f"  {u_escape(b['genres'])},",
                "  'tur',",
                f"  {u_escape(b['cover'])},",
                "  false, false, false, false,",
                "  NOW(), NOW(), 'seed', 'seed'",
                "FROM authors a",
                f"WHERE lower(trim(a.name)) = lower(trim({u_escape(AUTHOR['name'])}))",
                "  AND NOT EXISTS (",
                "    SELECT 1 FROM books b",
                "    WHERE b.author_id = a.id",
                f"      AND lower(trim(b.title)) = lower(trim({u_escape(b['title'])}))",
                "  );",
                "",
            ]
        )

    lines.extend(
        [
            "COMMIT;",
            "",
            "SELECT a.id AS author_id, a.name, COUNT(b.id) AS book_count",
            "FROM authors a LEFT JOIN books b ON b.author_id = a.id",
            f"WHERE lower(trim(a.name)) = lower(trim({u_escape(AUTHOR['name'])}))",
            "GROUP BY a.id, a.name;",
            "",
            "SELECT b.id, b.title, b.publication_year, b.genres, length(b.description) AS desc_len",
            "FROM books b JOIN authors a ON a.id = b.author_id",
            f"WHERE lower(trim(a.name)) = lower(trim({u_escape(AUTHOR['name'])}))",
            "ORDER BY b.publication_year DESC, b.title;",
        ]
    )

    out = Path(__file__).with_name("seed_sabahattin_ali.sql")
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
