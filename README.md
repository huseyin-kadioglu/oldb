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

### Ortam ayrımı (test / prod)

Test ve prod **farklı branch** ve **farklı veritabanı** kullanır. Detay: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

| Ortam | Branch | DB | Spring profili |
|-------|--------|-----|----------------|
| Yerel | — | `oldb_local` | `local` |
| Test | `test` | `oldb_test` | `test` |
| Prod | `prod` | `oldb_prod` | `prod` |

### Gereksinimler

- Node.js 18+
- Java 17
- Docker (PostgreSQL)

### Veritabanı

```bash
docker compose up -d
```

İlk kurulumda `oldb_local`, `oldb_test` ve `oldb_prod` veritabanları oluşturulur.

### Backend

```bash
cd oldb-backend
cp src/main/resources/application-local.properties.example src/main/resources/application-local.properties
# JWT ve mail bilgilerini düzenleyin

./mvnw spring-boot:run
```

Test profili ile (test DB):

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=test
```

### Frontend

```bash
cd flixly-fe
npm install
npm start
```
