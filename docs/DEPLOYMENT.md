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
MAIL_HOST=...
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

Frontend build:

```bash
REACT_APP_API_URL=https://api-test.oldb.app npm run build
```

### Prod sunucusu

```bash
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://<host>:5432/oldb_prod
DATABASE_USER=...
DATABASE_PASSWORD=...
JWT_SECRET_KEY=...   # test ile AYNI OLMAMALI
APP_BACKEND_URL=https://api.oldb.app
APP_FRONTEND_URL=https://oldb.app
APP_CORS_ALLOWED_ORIGINS=https://oldb.app
DDL_AUTO=validate    # prod profili varsayılan validate
MAIL_ENABLED=true
```

Frontend build:

```bash
npm run build
# .env.production içindeki REACT_APP_API_URL kullanılır
```

## Güvenlik notları

- `application-local.properties` commit edilmez; şablon: `application-local.properties.example`
- `/send-email` yalnızca `local` profilde açık
- Prod’da `spring.jpa.hibernate.ddl-auto=validate` — şema Flyway/Liquibase veya manuel migration ile yönetilmeli
- Test ve prod JWT secret’ları farklı olmalı

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
