# BilimNova — Onlayn o'quv kurslari platformasi

BilimNova — O'zbek tilidagi to'liq ishlaydigan onlayn ta'lim platformasi. Sayt boshqaruv paneli, video darslar, progress kuzatuvi, sharhlar va foydalanuvchi profillari bilan birga keladi.

## Texnologiyalar

- **Backend:** Python 3.11+ standart kutubxonasi (`http.server`, `sqlite3`, `hashlib`, `hmac`)
- **Ma'lumotlar bazasi:** SQLite (WAL rejimi)
- **Frontend:** Vanilla JavaScript (ES modules), hash-router SPA, o'z SVG ikonkalari
- **Dizayn:** Zamonaviy CSS design system, light/dark mavzu, to'liq responsive
- **Tashqi bog'liqliklar:** yo'q — npm yoki pip o'rnatish shart emas

## Ishga tushirish

```bash
python server.py
```

yoki Windows'da `start.cmd` faylini ikki marta bosing.

Server standart holatda `http://localhost:8000` manzilida ishga tushadi. Agar port band bo'lsa, u avtomatik ravishda 8019 gacha keyingi bo'sh portni tanlaydi. Portni qo'lda belgilash:

```bash
set PORT=8080
python server.py
```

## Demo hisoblar

| Rol | Email | Parol |
| --- | --- | --- |
| Administrator | `admin@bilimnova.uz` | `Admin123!` |
| O'quvchi | `student@bilimnova.uz` | `Student123!` |

Qolgan demo o'quvchilar: `student02@bilimnova.uz` … `student25@bilimnova.uz`, parol `Student123!`.
O'qituvchilar: `aziz@bilimnova.uz`, `malika@bilimnova.uz`, `sardor@bilimnova.uz`, `nilufar@bilimnova.uz`,
`jasur@bilimnova.uz`, `kamola@bilimnova.uz`, `bekzod@bilimnova.uz`, `doston@bilimnova.uz` — parol `Teacher123!`.

## Asosiy imkoniyatlar

### O'quvchilar uchun
- Kurslar katalogi: qidiruv, kategoriya, daraja, narx bo'yicha filtr va saralash
- Kurs sahifasi: dastur, bepul preview darslar, o'qituvchi profili, sharh va reytinglar
- Kursga yozilish va shaxsiy kabinet
- Video darslar pleyeri: darslar orasida o'tish, progress, yakunlash belgisi
- Haftalik faollik grafigi, davom ettirish ro'yxati, tavsiyalar
- Profilni tahrirlash va parolni o'zgartirish
- Sharh qoldirish va reyting berish

### Administrator uchun
- Boshqaruv paneli: umumiy statistika, oylik dinamika, kategoriyalar kesimi
- Kurslar CRUD: yaratish, tahrirlash, e'lon qilish/qoralama, o'chirish
- Darslar CRUD: tartib, davomiylik, preview holati, video va matn
- Foydalanuvchilar ro'yxati va qidiruv
- Kursga yozilishlar ro'yxati va progress

### Umumiy
- Ro'yxatdan o'tish va tizimga kirish (PBKDF2 parol xeshi, HMAC imzolangan HttpOnly cookie)
- Light/dark mavzu (tanlov `localStorage`da saqlanadi)
- Mobil va planshet uchun moslashgan interfeys
- Toast bildirishnomalar, modal oynalar, skeleton-loaderlar
- 404 sahifa va xatoliklarni qayta urinish

## Loyiha tuzilishi

```
.
├── server.py              # HTTP server va statik fayllar
├── backend/
│   ├── auth.py            # Parol xeshi, tokenlar, sessiya
│   ├── db.py              # SQLite sxema va demo ma'lumotlar
│   ├── http_utils.py      # Request/Response yordamchilari va router
│   ├── routes.py          # Barcha API endpointlar
│   └── seed_data.py       # Kurslar, mentorlar, sharhlar (o'zbekcha)
├── public/
│   ├── index.html         # SPA kirish nuqtasi
│   ├── css/styles.css     # Design system
│   └── js/
│       ├── app.js         # Hash-router
│       ├── api.js         # Fetch klient
│       ├── store.js       # Global holat
│       ├── icons.js       # SVG ikonkalar
│       ├── ui.js          # UI komponentlar
│       └── pages/         # Sahifalar
└── data/bilimnova.db      # SQLite baza (birinchi ishga tushishda yaratiladi)
```

## API endpointlar (asosiy)

| Metod | Yo'l | Tavsif |
| --- | --- | --- |
| POST | `/api/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/auth/login` | Kirish |
| POST | `/api/auth/logout` | Chiqish |
| GET | `/api/auth/me` | Joriy foydalanuvchi |
| GET | `/api/home` | Bosh sahifa ma'lumotlari |
| GET | `/api/categories` | Kategoriyalar |
| GET | `/api/courses` | Kurslar (qidiruv/filtr/sahifa) |
| GET | `/api/courses/:id` | Kurs tafsiloti |
| POST | `/api/courses/:id/enroll` | Kursga yozilish |
| GET | `/api/courses/:id/learn` | Pleyer ma'lumotlari |
| POST | `/api/lessons/:id/complete` | Darsni yakunlash |
| GET/POST | `/api/courses/:id/reviews` | Sharhlar |
| GET | `/api/my/courses`, `/api/my/stats` | Kabinet ma'lumotlari |
| PATCH | `/api/profile` | Profilni yangilash |
| POST | `/api/profile/password` | Parolni o'zgartirish |
| GET | `/api/admin/overview` | Admin statistikasi |
| GET/POST | `/api/admin/courses` | Kurslar boshqaruvi |
| PATCH/DELETE | `/api/admin/courses/:id` | Kursni tahrirlash/o'chirish |
| GET/POST | `/api/admin/courses/:id/lessons` | Darslar boshqaruvi |
| PATCH/DELETE | `/api/admin/lessons/:id` | Darsni tahrirlash/o'chirish |
| GET | `/api/admin/users` | Foydalanuvchilar |
| GET | `/api/admin/enrollments` | Yozilishlar |

## Ma'lumotlar bazasini yangilash

Demo ma'lumotlarni qaytadan yaratish uchun serverni to'xtatib, `data/bilimnova.db` faylini o'chiring va serverni qayta ishga tushiring. Baza avtomatik qayta yaratiladi va to'ldiriladi.

## Eslatma

Bu loyiha demo/ta'lim maqsadida yaratilgan. To'lov tizimi simulyatsiya qilingan: kursga yozilish bepul va darhol amalga oshiriladi. Video darslar uchun ochiq demo videolar ishlatilgan.
