# OLDB — Canlıya Alma İlerleme Planı

## Fazlar

### Faz 1 — Config & güvenlik (şimdi)
- [x] Ortam değişkenleri (`application.properties` + `application-prod.properties`)
- [x] Frontend/Backend public URL, CORS, aktivasyon linki, mail from
- [x] FE `REACT_APP_API_URL`
- [x] Secrets’ı repo dışına (`application-local.properties`, `.env`)
- [ ] Gmail app password + JWT secret **rotate** (manuel — sen)

### Faz 2 — Deploy hazırlığı
- [ ] Railway: Postgres + backend (`RAILWAY.md`)
- [ ] FE: Cloudflare Pages / Vercel (`REACT_APP_API_URL=https://api...`)
- [ ] Mail: Resend/Brevo (Gmail yerine) — domain veya sandbox
- [ ] Upload: persistent disk veya object storage

### Faz 3 — Sertleştirme
- [ ] Flyway migration; prod’da `ddl-auto=validate`
- [ ] Actuator sadece `/actuator/health`
- [ ] Staging ortamı (opsiyonel)
- [ ] Backup + smoke test checklist

## Local çalışma

```bash
# Backend secrets (git’e girmez) — örnekten kopyala
cp oldb-backend/src/main/resources/application-local.properties.example \
   oldb-backend/src/main/resources/application-local.properties

# Frontend (opsiyonel)
cp flixly-fe/.env.example flixly-fe/.env.local
```

`application.properties` otomatik olarak `optional:classpath:application-local.properties` yükler.
Prod’da: `SPRING_PROFILES_ACTIVE=prod` + platform env vars (bkz. kök `.env.example`).

## Railway / Render notu

`docker-compose.yml` olduğu gibi deploy edilmez. Parçala:
1. Managed Postgres
2. Backend (Dockerfile / jar) + env
3. Frontend ayrı static host
