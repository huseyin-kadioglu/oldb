# Railway kurulumu (OLDB backend + Postgres)

Bu rehber **sadece API + veritabanı** içindir. Frontend sonra (Vercel / Cloudflare Pages).

## 0. Önkoşullar

- [ ] [railway.app](https://railway.app) hesabı (GitHub ile giriş kolay)
- [ ] Bu repodaki `oldb-backend` değişiklikleri commit’li (veya Railway “Empty project” + CLI)
- [ ] Gmail app password / JWT **rotate** edilmiş olmalı (canlıya secret koyarken)

Kod tarafı hazır:
- Multi-stage `Dockerfile`
- `PORT` desteği
- Railway `DATABASE_URL` → JDBC çevirici
- Health: `/actuator/health`

---

## 1. Proje oluştur

1. [railway.app/new](https://railway.app/new) → **Empty Project**
2. Project adı: `oldb` (veya istediğin)

## 2. Postgres ekle

1. **+ New** → **Database** → **PostgreSQL**
2. Açılan Postgres servisine gir → **Variables** → `DATABASE_URL` otomatik oluşur
3. Bu değişkeni API servisine **Reference** ile bağlayacağız (adım 4)

## 3. Backend servisi

**Seçenek A — GitHub repo (önerilen)**

1. **+ New** → **GitHub Repo** → `oldb` reposunu seç
2. **Settings → Root Directory** = `oldb-backend`
3. Builder: Dockerfile (`railway.json` zaten var)

**Seçenek B — CLI**

```bash
npm i -g @railway/cli
railway login
cd oldb-backend
railway link   # projeyi seç
railway up
```

## 4. Environment variables (API / **oldb** servisi)

Değişkenler **Postgres’te değil, oldb (API) servisinde** olmalı.

### En güvenilir yöntem (önerilen)

`postgresql://...` Spring’e doğrudan gitmez. JDBC formu kullan:

| Key | Value |
|-----|--------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres.railway.internal:5432/railway` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Postgres şifren |
| `SECURITY_JWT_SECRET_KEY` | uzun rastgele string |
| `APP_FRONTEND_URL` | `http://localhost:3000` |
| `APP_CORS_ORIGINS` | `http://localhost:3000` |

Boş `DATABASE_URL=` satırı varsa **sil**. İstersen ayrıca Variable Reference ile `DATABASE_URL` ekleyebilirsin; asıl çalışan genelde `SPRING_DATASOURCE_*` üçlüsüdür.

Deploy log’da şunu gör: `[oldb-db] DATABASE_URL set=... SPRING_DATASOURCE_URL set=...`  
İkisi de `false` ise değişkenler yanlış serviste demektir.

JWT üretmek (PowerShell):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

## 5. Public URL

1. API servisi → **Settings → Networking → Generate Domain**
2. Çıkan URL’yi kopyala (örn. `https://oldb-api-production.up.railway.app`)
3. Variables’a yaz:
   - `APP_BACKEND_URL=https://...`
   - (FE gelince CORS’u da güncelle)

## 6. Deploy & smoke test

Deploy bitince:

```text
GET https://SENIN-API/actuator/health
→ {"status":"UP"}
```

Local FE ile denemek için `flixly-fe/.env.local`:

```env
REACT_APP_API_URL=https://SENIN-API/
```

FE’yi yeniden başlat (`npm start`). CORS’ta `http://localhost:3000` olmalı.

## 7. Bilinen sınırlar (şimdilik OK)

| Konu | Not |
|------|-----|
| Free tier sleep | ~15 dk idle sonrası uyur; ilk istek yavaş |
| Uploads | Volume yoksa container restart’ta silinir |
| Mail | Hâlâ Gmail; sonraki adım Resend/Brevo |
| Schema | `ddl-auto=update` boş DB’de tabloları oluşturur |

## 8. Sonraki adımlar

1. FE’yi Pages/Vercel’e al → `APP_FRONTEND_URL` + `APP_CORS_ORIGINS` güncelle
2. Mail sağlayıcıya geç
3. İsteğe bağlı: Railway Volume → `/data/uploads`

---

Takıldığın adımı (hesap / Postgres / variables / domain) yaz; birlikte devam ederiz.
