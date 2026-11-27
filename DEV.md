# OLDB — tek workspace’te çalıştırma

## Project mi, workspace mi?

**Tek workspace / tek clone daha sağlıklı.**  
Mobil ve web aynı API + aynı PostgreSQL’i kullanıyor. İki ayrı “Project” veya dağınık `oldb-src` / `oldb-mobile` kopyaları senkronu bozar.

Önerilen klasör (Windows örneği):

```text
Desktop/dev/oldb/          ← git clone (bu repo)
  oldb-backend/            ← API + DB
  flixly-fe/               ← web
  oldb-mobile/             ← Expo
  docker-compose.yml
```

İsimler: repo klasörüne `oldb` de; mobil uygulama yolu `oldb/oldb-mobile`.

## Dummy login (paylaşılan DB)

Backend açılınca seed edilir:

- Email: `huseyinavnikadioglu@gmail.com`
- Password: `test`

## Windows (CMD) — şimdi kullan

```bat
cd %USERPROFILE%\Desktop\dev
if not exist oldb git clone https://github.com/huseyin-kadioglu/oldb.git oldb
cd oldb
git fetch
git checkout cursor/oldb-mobile-foundation-f343
git pull

docker compose up -d

cd oldb-backend
start cmd /k mvnw spring-boot:run

cd ..\oldb-mobile
copy /Y .env.example .env
notepad .env
```

`.env` içinde (iPhone için PC IP’n):

```text
EXPO_PUBLIC_API_URL=http://192.168.1.102:8080
```

```bat
npx expo start --lan --port 8082
```

Expo Go → `exp://192.168.1.102:8082` → mail/şifre ile giriş.

Eski `Desktop\dev\oldb-src` ve ayrı `oldb-mobile` kopyasını kullanma; karışıklık yaratır. Tek `oldb` klonu yeterli.

## Bu Cloud workspace

Zaten doğru layout:

- `/workspace/oldb-backend`
- `/workspace/oldb-mobile`
- `/workspace/flixly-fe`
