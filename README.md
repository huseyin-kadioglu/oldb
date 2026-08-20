# Oldb

**Oldb**, kullanıcıların kitap ekleyip takip edebildiği, profiller oluşturabildiği ve kitaplar hakkında detaylı bilgi alabileceği modern bir React tabanlı web uygulamasıdır.

![image](https://github.com/user-attachments/assets/d2a28a74-3c3f-4184-a3e7-949892c2e323)

---

Beğendiklerinizi, favorilerinizi, yarım bıraktırlarınızı ve okumak istediklerinizi yönetibileceğiniz ekranlar;
![image](https://github.com/user-attachments/assets/47e282d3-1d87-4353-8be2-3b340a166ccc)

Ayrıca kullanıcılar kitap ekleyerek community'e destek olabilir, bunun karşılığında destek puanı kazanabilir. Sonrasında bu puanlarla Ünvanlar kazanabilir, yeteri kadar üne kavuştuğunda ise Pro versiyonu ücretsiz kullanabilirler. 
![image](https://github.com/user-attachments/assets/ebec3a7a-6473-4258-8f52-29eb1b1b50b0)


## İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [Token & Oturum Yönetimi](#token--oturum-yönetimi)
- [API](#api)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)

---

## Özellikler

- Kullanıcı kaydı, giriş ve çıkış işlemleri (JWT veya sessionStorage tabanlı token yönetimi)
- Kitapları listeleme, detay görüntüleme
- Kitap arama ve filtreleme
- Kullanıcı profili ve kullanıcı bazlı kitap takibi
- Responsive ve modern tasarım
- Material UI ve Font Awesome entegrasyonu

---

## Teknolojiler

- React 18
- React Router DOM
- Material-UI (MUI)
- Font Awesome
- Backend API (REST veya GraphQL)
- Session Storage tabanlı token yönetimi

---

## Kurulum

### Gereksinimler

- Node.js 18+
- Java 17
- Docker (PostgreSQL)

### Veritabanı

```bash
docker compose up -d
```

Aynı Postgres veritabanında ortamlar şema ile ayrılır (`init-schemas.sql`):

| Profil | Şema | Ne zaman |
|--------|------|----------|
| `local` (varsayılan) | `oldb_local` | Geliştirme |
| `test` | `oldb_test` | Test / staging |
| `prod` | `oldb_prod` | Canlı |

Profil dosyaları: `application-local.properties`, `application-test.properties`, `application-prod.properties`.

### Backend

```bash
cd oldb-backend
./mvnw spring-boot:run
# veya açık profil:
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
SPRING_PROFILES_ACTIVE=test ./mvnw spring-boot:run
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run
```

`prod` için `JWT_SECRET`, `DB_*` / `DATABASE_URL` ve mail ortam değişkenleri zorunludur.

### Frontend

```bash
cd oldb-frontend   # geçiş sürecinde klasör adı flixly-fe olabilir
npm install
npm start
```
