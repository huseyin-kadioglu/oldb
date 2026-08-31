# -*- coding: utf-8 -*-
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

books = {
    8: {
        "title": "Ölüler Evinden Anılar",
        "genres": "Klasik, Kurgu Dışı, Anı",
        "description": (
            "Ölüler Evinden Anılar; Dostoyevski'nin sürgün ve hapishane deneyiminden beslenen "
            "yarı otobiyografik bir eserdir. İnsan onuru, ceza ve dayanışmayı sert bir gerçekçilikle anlatır."
        ),
        "original": "Записки из Мёртвого дома",
    },
    2: {
        "description": (
            "Karamazov Kardeşler; baba-oğul ilişkisi, inanç, özgürlük ve sorumluluk üzerine "
            "Dostoyevski'nin en kapsamlı romanıdır. Dimitri, İvan ve Alyoşa'nın yolları, "
            "bir cinayet etrafında ahlaki ve metafizik bir çatışmaya dönüşür."
        ),
        "genres": "Klasik, Kurgu, Felsefe",
        "original": "Братья Карамазовы",
    },
    1: {
        "genres": "Klasik, Kurgu, Psikolojik",
        "original": "Преступление и наказание",
    },
    3: {
        "genres": "Klasik, Kurgu, Drama",
        "original": "Идиот",
    },
    4: {
        "genres": "Klasik, Kurgu, Felsefe",
        "original": "Записки из подполья",
    },
    5: {
        "genres": "Klasik, Kurgu, Psikolojik",
        "original": "Игрок",
    },
}

lines = ["BEGIN;", ""]
# fix id 8
b = books[8]
lines.append(
    "UPDATE books SET\n"
    f"  title = {u_escape(b['title'])},\n"
    f"  original_title = {u_escape(b['original'])},\n"
    f"  genres = {u_escape(b['genres'])},\n"
    f"  description = {u_escape(b['description'])},\n"
    "  language = 'rus',\n"
    "  updated_at = NOW(), updated_by = 'seed'\n"
    "WHERE id = 8;\n"
)
# karamazov
b = books[2]
lines.append(
    "UPDATE books SET\n"
    f"  original_title = {u_escape(b['original'])},\n"
    f"  genres = {u_escape(b['genres'])},\n"
    f"  description = {u_escape(b['description'])},\n"
    "  language = 'rus', page_count = COALESCE(page_count, 1040),\n"
    "  updated_at = NOW(), updated_by = 'seed'\n"
    "WHERE id = 2;\n"
)
for bid in (1, 3, 4, 5):
    b = books[bid]
    lines.append(
        "UPDATE books SET\n"
        f"  original_title = COALESCE(NULLIF(TRIM(original_title), ''), {u_escape(b['original'])}),\n"
        f"  genres = COALESCE(NULLIF(TRIM(genres), ''), {u_escape(b['genres'])}),\n"
        "  language = 'rus',\n"
        "  updated_at = NOW(), updated_by = COALESCE(updated_by, 'seed')\n"
        f"WHERE id = {bid};\n"
    )
lines.append("UPDATE books SET language = 'rus' WHERE author_id = 1;")
lines.append("COMMIT;")
lines.append(
    "SELECT id, title, genres, length(description) AS desc_len "
    "FROM books WHERE author_id = 1 ORDER BY publication_year DESC;"
)

out = Path(r"c:\dev\oldb\oldb-backend\scripts\seed_dostoyevski_fix.sql")
out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
