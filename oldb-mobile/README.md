# OLDB Mobile

Expo (React Native) client for the OLDB reading platform. The existing web app (`flixly-fe`) and Spring Boot API (`oldb-backend`) remain unchanged.

## Stack

- Expo SDK 58 + Expo Router
- TypeScript
- Secure JWT storage (`expo-secure-store`) — no refresh tokens
- i18n: Turkish default, English skeleton
- Brand theme: cream / forest green (independent from web dark theme)

## Tabs

Home · Discover · Library · Profile

## Run with Expo Go (first-time mobile setup)

### 1. Backend

In one terminal:

```bash
# from repo root
docker compose up -d
cd oldb-backend && ./mvnw spring-boot:run
```

API must listen on port `8080`.

### 2. Configure API URL

Copy `.env.example` to `.env` inside `oldb-mobile/`:

| Device | `EXPO_PUBLIC_API_URL` |
|---|---|
| iOS Simulator | `http://localhost:8080` |
| Android Emulator | `http://10.0.2.2:8080` |
| Physical iPhone | `http://YOUR_MAC_LAN_IP:8080` (same Wi‑Fi) |

Find your Mac IP: System Settings → Network, or `ipconfig getifaddr en0`.

### 3. Start Expo (recommended on your Mac)

```bash
cd oldb-mobile
npm install
npx expo start
```

Press `s` if needed until the terminal says **Using Expo Go**.

### 4. Open on your iPhone

1. Install **Expo Go** from the App Store (SDK must match the project — currently Expo SDK 58).
2. Ensure phone and Mac are on the **same Wi‑Fi**.
3. Scan the QR code from the terminal with Camera / Expo Go.
4. Sign in with an activated OLDB account (backend must be running).

If the app cannot reach the API: check firewall, confirm `EXPO_PUBLIC_API_URL`, and restart `npx expo start` after changing `.env`.

### Expo Go checklist

- Project is Expo managed (no custom native modules beyond Expo Go–compatible packages).
- `npx expo-doctor` should report no issues.
- Use `npm run start:tunnel` only if LAN QR does not connect (requires Expo login or `@expo/ngrok`).

## Scripts

- `npm start` — Expo Dev Tools
- `npm run ios` — iOS Simulator (macOS + Xcode)
- `npm run android` — Android emulator
- `npm run web` — web preview (limited)

## Notes

- Staff approval tools stay on the web app only.
- Widgets / affiliate / collections are later stages.
