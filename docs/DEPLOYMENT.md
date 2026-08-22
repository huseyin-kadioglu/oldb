# Test / Prod ortam ayrımı

Bu proje **test** ve **prod** ortamlarını branch ve veritabanı düzeyinde ayırır. Geliştirme test ortamında yapılır; prod’a yalnızca merge request ile geçilir.

## Branch modeli

| Branch | Ortam | Spring profili | Veritabanı |
|--------|--------|----------------|------------|
| `test` | Test (staging) | `test` | `oldb_test` |
| `prod` | Üretim | `prod` | `oldb_prod` |
| `main` | Entegrasyon (isteğe bağlı) | — | — |

**Akış**

1. Özellik geliştirmesini `test` branch’inde yapın (veya `test`’e merge edin).
2. Test ortamına deploy edin; smoke test yapın.
3. `test` → `prod` merge request açın; onay sonrası prod deploy.

`main` branch’i uzun vadede `test` ile hizalanabilir; kritik kural: **prod branch’e doğrudan commit yok**.

## Veritabanı ayrımı (kritik)

Üç ayrı PostgreSQL **database** (aynı instance’ta bile olsa tablolar karışmaz):

| DB adı | Kullanım |
|--------|----------|
| `oldb_local` | Yerel geliştirme (`local` profili) |
| `oldb_test` | Test deploy (`test` profili) |
| `oldb_prod` | Prod deploy (`prod` profili) |

Yerel Docker ilk kurulumda `oldb_test` ve `oldb_prod` oluşturur (`docker/postgres/init/`).

**Eski `mydatabase` verisi varsa** (compose güncellemesi öncesi):

```bash
docker exec -it oldb_postgres psql -U myuser -d postgres -c "CREATE DATABASE oldb_local;"
docker exec -it oldb_postgres psql -U myuser -d postgres -c "CREATE DATABASE oldb_test;"
docker exec -it oldb_postgres psql -U myuser -d postgres -c "CREATE DATABASE oldb_prod;"
# İsteğe bağlı: pg_dump mydatabase | psql -U myuser oldb_local
```

## Yerel geliştirme

```bash
docker compose up -d
# Postgres + Mailpit (http://localhost:8025)

cd oldb-backend
cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
# JWT ve mail bilgilerini düzenleyin

./mvnw spring-boot:run
# Varsayılan profil: local → oldb_local

cd ../flixly-fe
npm install
npm start
# .env.development → REACT_APP_API_URL=http://localhost:8080
```

## Mail (local / test / prod)

Aktivasyon linkleri **ortamın kendi URL’lerine** gider:

| Ortam | Aktivasyon linki tabanı | Giriş yönlendirmesi |
|--------|-------------------------|---------------------|
| local | `APP_BACKEND_URL` → `http://localhost:8080/api/auth/activate?...` | `http://localhost:3000/login` |
| test | `https://api-test.oldb.app/api/auth/activate?...` | `https://test.oldb.app/login` |
| prod | `https://api.oldb.app/api/auth/activate?...` | `https://oldb.app/login` |

### Local — Mailpit

```bash
docker compose up -d mailpit
# Web UI: http://localhost:8025
# SMTP: localhost:1025 (auth yok)
```

`application-local.properties` Mailpit ayarlarını içerir; kayıt sonrası mail Mailpit’te görünür.

### Test — Mailpit (yerel) veya SMTP (sunucu)

Yerelde test profili + Mailpit:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=test
```

Sunucuda gerçek SMTP veya Mailpit sidecar; `MAIL_*` ortam değişkenleri zorunlu. Günlük limit: `MAIL_DAILY_CAP` (varsayılan 100).

### Prod — transactional SMTP

Zorunlu ortam değişkenleri:

```bash
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM=OLDB <noreply@oldb.app>
MAIL_DAILY_CAP=500
```

Uygulama başlarken `ProdEnvironmentValidator` ve `MailEnvironmentValidator` eksik/yanlış yapılandırmayı engeller.

## Test ortamında çalıştırma (yerelde test DB ile)

Backend:

```bash
cd oldb-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=test
# JDBC: jdbc:postgresql://localhost:5432/oldb_test
```

Frontend (test API URL):

```bash
cd flixly-fe
# PowerShell
$env:REACT_APP_API_URL="http://localhost:8080"; npm start
```

## Deploy ortam değişkenleri

### Test sunucusu

```bash
SPRING_PROFILES_ACTIVE=test
DATABASE_URL=jdbc:postgresql://<host>:5432/oldb_test
DATABASE_USER=...
DATABASE_PASSWORD=...
JWT_SECRET_KEY=...
APP_BACKEND_URL=https://api-test.oldb.app
APP_FRONTEND_URL=https://test.oldb.app
APP_CORS_ALLOWED_ORIGINS=https://test.oldb.app
MAIL_ENABLED=true
MAIL_HOST=...          # yerelde Mailpit: localhost:1025
MAIL_PORT=1025
MAIL_SMTP_AUTH=false   # Mailpit için
MAIL_FROM=OLDB Test <noreply@test.oldb.app>
MAIL_DAILY_CAP=100
```

Frontend build:

```bash
REACT_APP_API_URL=https://api-test.oldb.app npm run build
```

### Prod sunucusu

```bash
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://<host>:5432/oldb_prod?sslmode=require
DATABASE_USER=...
DATABASE_PASSWORD=...   # mypassword / password gibi varsayılanlar reddedilir
JWT_SECRET_KEY=...    # en az 32 karakter; test ile AYNI OLMAMALI
APP_BACKEND_URL=https://api.oldb.app
APP_FRONTEND_URL=https://oldb.app
APP_CORS_ALLOWED_ORIGINS=https://oldb.app
MAIL_HOST=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM=OLDB <noreply@oldb.app>
MAIL_DAILY_CAP=500
```

Uygulama başlangıcında doğrulanır:

- `ddl-auto=validate` (şema otomatik değişmez)
- `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`, `JWT_SECRET_KEY` zorunlu
- Zayıf DB şifreleri reddedilir
- JDBC URL’de `sslmode=require` önerilir (yönetilen Postgres)

Frontend build:

```bash
npm run build
# .env.production içindeki REACT_APP_API_URL kullanılır
```

## Güvenlik notları

- `application-local.properties` commit edilmez; şablon: `application-local.properties.example`
- `/send-email` yalnızca `local` profilde açık
- Prod’da `spring.jpa.hibernate.ddl-auto=validate` — şema migration ile yönetilmeli
- Prod `ProdEnvironmentValidator`: zorunlu env, zayıf şifre/JWT reddi, `show-sql=false`
- Test ve prod JWT secret’ları farklı olmalı
- Aktivasyon mailleri ortamın `APP_BACKEND_URL` / `APP_FRONTEND_URL` değerlerini kullanır

## Smoke checklist (test deploy sonrası)

- [ ] `GET /home` yanıt veriyor
- [ ] Kayıt + aktivasyon maili (test mail sağlayıcısı)
- [ ] Giriş + profil sayfası
- [ ] Kitap arama ve detay
- [ ] CORS: FE origin’den API çağrıları başarılı

## MR checklist (test → prod)

- [ ] Test ortamında smoke tamam
- [ ] Prod ortam değişkenleri güncel (URL, DB, JWT)
- [ ] Veritabanı migration gerekiyorsa prod’a uygulandı
- [ ] FE build prod API URL ile yapıldı
