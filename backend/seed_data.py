"""Demo platforma uchun boshlang'ich ma'lumotlar (o'zbek tilida)."""

CATEGORIES = [
    {"name": "Dasturlash", "slug": "dasturlash", "icon": "code", "color": "#6366f1",
     "description": "Web, mobil va backend dasturlash asoslari"},
    {"name": "Dizayn", "slug": "dizayn", "icon": "palette", "color": "#ec4899",
     "description": "UI/UX, grafik va motion dizayn"},
    {"name": "Marketing", "slug": "marketing", "icon": "megaphone", "color": "#f97316",
     "description": "SMM, target va brending strategiyalari"},
    {"name": "Biznes", "slug": "biznes", "icon": "briefcase", "color": "#10b981",
     "description": "Tadbirkorlik, boshqaruv va moliya"},
    {"name": "Tillar", "slug": "tillar", "icon": "globe", "color": "#06b6d4",
     "description": "Ingliz tili va boshqa xorijiy tillar"},
    {"name": "Ma'lumotlar", "slug": "malumotlar", "icon": "chart", "color": "#8b5cf6",
     "description": "Data analitika, SQL va sun'iy intellekt"},
    {"name": "Video & Motion", "slug": "video", "icon": "video", "color": "#ef4444",
     "description": "Video montaj va animatsiya"},
    {"name": "Shaxsiy rivojlanish", "slug": "shaxsiy", "icon": "sparkles", "color": "#eab308",
     "description": "Soft skills, karyera va liderlik"},
]

INSTRUCTORS = [
    {"name": "Aziz Karimov", "email": "aziz@bilimnova.uz", "title": "Senior Software Engineer @ Uzum",
     "bio": "8 yillik tajribaga ega dasturchi. 40 dan ortiq loyihada ishtirok etgan, 12 000+ o'quvchiga Python va JavaScript o'rgatgan.",
     "avatar_color": "#6366f1"},
    {"name": "Malika Yusupova", "email": "malika@bilimnova.uz", "title": "Product Designer @ Payme",
     "bio": "Figma va design systemlar bo'yicha mutaxassis. Fintech mahsulotlari uchun interfeyslar yaratadi va 5 yildan beri dizayn o'rgatadi.",
     "avatar_color": "#ec4899"},
    {"name": "Sardor Toshpulatov", "email": "sardor@bilimnova.uz", "title": "Marketing Lead & Strategist",
     "bio": "Target reklama va brending bo'yicha maslahatchi. 60+ brend bilan ishlagan, reklama byudjetlarini samarali boshqarish bo'yicha mutaxassis.",
     "avatar_color": "#f97316"},
    {"name": "Nilufar Rashidova", "email": "nilufar@bilimnova.uz", "title": "IELTS 8.5 · Til o'qituvchisi",
     "bio": "10 yillik tajribaga ega ingliz tili o'qituvchisi. 1 500 dan ortiq o'quvchini xalqaro imtihonlarga tayyorlagan.",
     "avatar_color": "#06b6d4"},
    {"name": "Jasur Abdullayev", "email": "jasur@bilimnova.uz", "title": "Data Scientist @ TBC Bank",
     "bio": "Ma'lumotlar tahlili va machine learning bo'yicha mutaxassis. Bank sektorida prognozlash modellarini yaratadi.",
     "avatar_color": "#8b5cf6"},
    {"name": "Kamola Nazarova", "email": "kamola@bilimnova.uz", "title": "Motion Designer & Video Editor",
     "bio": "Premiere Pro va After Effects bo'yicha professional. Reklama roliklari va YouTube kontenti uchun montaj qiladi.",
     "avatar_color": "#ef4444"},
    {"name": "Bekzod Ismoilov", "email": "bekzod@bilimnova.uz", "title": "Startup Founder & Mentor",
     "bio": "Ikki marta startup asoschisi. Mahsulotni noldan bozorga olib chiqish va jamoa qurish bo'yicha mentor.",
     "avatar_color": "#10b981"},
    {"name": "Doston Rahimov", "email": "doston@bilimnova.uz", "title": "Mobile Engineer @ Flutter",
     "bio": "Flutter va Dart bo'yicha mutaxassis. App Store va Play Market'da 1 milliondan ortiq yuklab olingan ilovalar muallifi.",
     "avatar_color": "#14b8a6"},
]

STUDENTS = [
    "Dilshod Karimov", "Shahnoza Islomova", "Javohir Tursunov", "Madina Rahimova",
    "Bobur Aliyev", "Zilola Ergasheva", "Sanjar Yuldashev", "Nodira Qodirova",
    "Rustam Xolmatov", "Gulnora Saidova", "Timur Mirzayev", "Kamila Abdullayeva",
    "Ulug'bek Sharipov", "Sevinch Umarova", "Farrux Nosirov", "Aziza Hamidova",
    "Otabek Sattorov", "Dildora Nazarova", "Sardor Mahmudov", "Mohira Jalilova",
    "Islom Rustamov", "Zarina Tosheva", "Anvar Sobirov", "Laylo Mirzayeva",
]

COURSES = [
    {
        "title": "Python asoslari: noldan dasturchigacha",
        "slug": "python-asoslari",
        "summary": "Hech qanday tajribasiz Python o'rganing va birinchi real loyihangizni yarating.",
        "description": (
            "Python — bugungi kunda eng talabgir dasturlash tillaridan biri. Ushbu kursda siz mutlaqo noldan "
            "boshlab, tilning asosiy tushunchalarini amaliy mashqlar orqali o'zlashtirasiz.\n\n"
            "Har bir dars qisqa nazariya va kuchli amaliyotdan iborat. Kurs oxirida siz mustaqil ravishda "
            "kichik dastur yozish, fayllar bilan ishlash va kodni tartibli tashkil qilishni bilasiz."
        ),
        "category": "dasturlash", "instructor": "Aziz Karimov", "level": "Boshlang'ich",
        "price": 490000, "old_price": 790000, "icon": "terminal", "accent": "#6366f1",
        "base_students": 1280, "featured": True, "created_days_ago": 150,
        "outcomes": [
            "Python sintaksisi va ish muhitini sozlash",
            "O'zgaruvchilar, shartlar va tsikllar bilan ishlash",
            "Funksiyalar va obyektga yo'naltirilgan dasturlash",
            "Fayllar, xatoliklar va modullar bilan ishlash",
            "Yakuniy mini-loyihani mustaqil yozish",
        ],
        "lessons": [
            ("Python bilan tanishuv", 14, "Python nima uchun mashhur? Tilning imkoniyatlari va qo'llanish sohalari bilan tanishamiz.", True),
            ("O'rnatish va birinchi dastur", 18, "Python va VS Code'ni o'rnatamiz, terminalda birinchi 'Hello, world!' dasturini ishga tushiramiz.", True),
            ("O'zgaruvchilar va ma'lumot turlari", 24, "int, float, str va bool turlari, o'zgaruvchi yaratish qoidalari va type() funksiyasi.", False),
            ("Shartli operatorlar", 22, "if, elif va else yordamida dastur oqimini boshqarishni o'rganamiz.", False),
            ("Tsikllar: for va while", 26, "Takrorlanuvchi amallarni avtomatlashtirish, range() va break/continue.", False),
            ("Funksiyalar va parametrlar", 28, "Kodni qayta ishlatish, argumentlar, qaytariladigan qiymatlar va lambda.", False),
            ("Ro'yxatlar, lug'atlar, to'plamlar", 30, "Ma'lumotlar tuzilmalari bilan amaliy ishlash va metodlar.", False),
            ("Fayllar bilan ishlash", 25, "Matn va JSON fayllarni o'qish, yozish va xavfsiz boshqarish.", False),
            ("Xatoliklarni boshqarish", 20, "try/except yordamida dasturni barqaror qilish.", False),
            ("Modullar va paketlar", 22, "O'z modullaringizni yaratish va pip orqali kutubxonalar o'rnatish.", False),
            ("OOP asoslari", 32, "Klasslar, obyektlar, meros olish va inkapsulyatsiya.", False),
            ("Mini-loyiha: kalkulyator", 35, "O'rgangan bilimlarni birlashtirib, to'liq ishlaydigan kalkulyator yaratamiz.", False),
        ],
    },
    {
        "title": "Full Stack JavaScript: React + Node.js",
        "slug": "full-stack-javascript",
        "summary": "Zamonaviy web ilovalar yaratish: React frontend va Node.js backend.",
        "description": (
            "Bu kurs sizni junior full stack dasturchi darajasiga olib chiqadi. React bilan interaktiv interfeyslar, "
            "Node.js va Express bilan esa ishonchli API yaratishni o'rganasiz.\n\n"
            "Kurs davomida REST API, autentifikatsiya, ma'lumotlar bazasi va deploy jarayonlarini amalda qo'llaysiz. "
            "Yakunda portfolioga qo'shish uchun to'liq MERN loyihangiz bo'ladi."
        ),
        "category": "dasturlash", "instructor": "Aziz Karimov", "level": "O'rta",
        "price": 890000, "old_price": 1290000, "icon": "code", "accent": "#0ea5e9",
        "base_students": 940, "featured": True, "created_days_ago": 90,
        "outcomes": [
            "React komponentlar, props va state",
            "Hooks va zamonaviy React patternlari",
            "Node.js va Express bilan REST API",
            "JWT autentifikatsiya va xavfsizlik",
            "Loyihani serverga joylashtirish (deploy)",
        ],
        "lessons": [
            ("Kurs roadmapi va muhit", 16, "Full stack arxitekturasi, kerakli vositalar va kurs rejasi.", True),
            ("JavaScript ES6+ asoslari", 34, "Arrow function, destructuring, spread va modullar.", True),
            ("React birinchi qadamlar", 28, "JSX, komponentlar va loyiha strukturasi.", False),
            ("Props, state va eventlar", 30, "Ma'lumotlarni komponentlar orasida uzatish.", False),
            ("Hooks: useState va useEffect", 34, "Zamonaviy React'ning asosiy hooklari.", False),
            ("Routing va sahifalar", 26, "React Router bilan ko'p sahifali ilova qurish.", False),
            ("Node.js va Express", 32, "Birinchi server va REST endpointlar.", False),
            ("Ma'lumotlar bazasi: MongoDB", 36, "CRUD operatsiyalar va Mongoose modellari.", False),
            ("Autentifikatsiya va JWT", 30, "Ro'yxatdan o'tish, kirish va himoyalangan endpointlar.", False),
            ("Frontend va backend integratsiyasi", 28, "API bilan ishlash va xatoliklarni boshqarish.", False),
            ("Test va debugging", 24, "Postman, DevTools va asosiy testlar.", False),
            ("Yakuniy loyiha va deploy", 40, "To'liq ilovani yig'ish va internetga chiqarish.", False),
        ],
    },
    {
        "title": "UI/UX dizayn: Figma bilan professional interfeys",
        "slug": "ui-ux-dizayn-figma",
        "summary": "Foydalanuvchini o'ziga rom etadigan interfeyslarni Figma'da loyihalash.",
        "description": (
            "Dizayn — bu shunchaki chiroyli rasm emas, balki foydalanuvchi muammosini hal qilish san'ati. "
            "Kursda tadqiqotdan tortib prototipgacha bo'lgan to'liq UI/UX jarayonini o'rganasiz.\n\n"
            "Figma'ning professional imkoniyatlari, design system, auto layout va komponentlar yordamida "
            "portfolioga munosib uchta real loyiha yaratasiz."
        ),
        "category": "dizayn", "instructor": "Malika Yusupova", "level": "Boshlang'ich",
        "price": 590000, "old_price": 850000, "icon": "palette", "accent": "#ec4899",
        "base_students": 1560, "featured": True, "created_days_ago": 200,
        "outcomes": [
            "UX tadqiqot va foydalanuvchi intervyulari",
            "Wireframe va information architecture",
            "Figma'da professional darajadagi dizayn",
            "Design system va komponentlar",
            "Interaktiv prototip yaratish",
        ],
        "lessons": [
            ("UI va UX farqi", 15, "Dizayn turlari, rollar va jarayon haqida umumiy tushuncha.", True),
            ("Figma interfeysi", 25, "Asboblar paneli, frame'lar va asosiy shortcutlar.", True),
            ("Foydalanuvchi tadqiqoti", 28, "Intervyu o'tkazish va insightlarni tahlil qilish.", False),
            ("Wireframe va struktura", 26, "Past aniqlikdagi maketlar va foydalanuvchi yo'li.", False),
            ("Tipografiya va rang", 30, "Shrift juftliklari, kontrast va rang psixologiyasi.", False),
            ("Auto layout va komponentlar", 34, "Responsive dizayn va qayta ishlatiladigan komponentlar.", False),
            ("Design system yaratish", 32, "Tokenlar, variantlar va jamoada ishlash qoidalari.", False),
            ("Prototip va animatsiya", 28, "Smart animate yordamida jonli prototip.", False),
            ("Mobile app dizayni", 36, "iOS va Android uchun ilova interfeysi.", False),
            ("Portfolio loyihasini yakunlash", 30, "Ishni taqdim etish va case study yozish.", False),
        ],
    },
    {
        "title": "Ingliz tili: 0 dan Intermediate gacha",
        "slug": "ingliz-tili-0-intermediate",
        "summary": "Kundalik muloqot va ish uchun ingliz tilini tizimli o'rganing.",
        "description": (
            "Ingliz tilini noldan boshlab, Intermediate darajasigacha olib chiqadigan amaliy kurs. "
            "Grammatika, so'z boyligi, talaffuz va tinglab tushunish ustida har kuni 20 daqiqa ishlaymiz.\n\n"
            "Darslar real hayotiy vaziyatlar asosida qurilgan: ish suhbati, sayohat, prezentatsiya va kundalik suhbatlar."
        ),
        "category": "tillar", "instructor": "Nilufar Rashidova", "level": "Boshlang'ich",
        "price": 390000, "old_price": 590000, "icon": "globe", "accent": "#06b6d4",
        "base_students": 2140, "featured": True, "created_days_ago": 260,
        "outcomes": [
            "Asosiy grammatik qoliplar va zamonlar",
            "1000+ eng ko'p ishlatiladigan so'zlar",
            "To'g'ri talaffuz va tinglab tushunish",
            "Kundalik suhbat va ish yozishmalari",
            "IELTS'ga tayyorgarlik asoslari",
        ],
        "lessons": [
            ("Kurs va metodika bilan tanishuv", 12, "O'quv rejasi, maqsad qo'yish va samarali o'rganish usullari.", True),
            ("Alifbo va talaffuz", 24, "Ingliz alifbosi, tovushlar va transkripsiya.", True),
            ("Salomlashish va tanishuv", 20, "Kundalik iboralar va o'zini tanishtirish.", False),
            ("To be fe'li va olmoshlar", 25, "Asosiy fe'l, shaxs olmoshlari va savol shakllari.", False),
            ("Present Simple", 28, "Oddiy hozirgi zamon va kundalik harakatlar.", False),
            ("Otlar, artikllar, ko'plik", 26, "a/an/the qoidalari va sanaladigan otlar.", False),
            ("Past Simple", 30, "O'tgan zamondagi voqealar va irregular fe'llar.", False),
            ("So'z boyligini oshirish", 22, "Samarali lug'at yodlash texnikasi.", False),
            ("Ish suhbati uchun ingliz tili", 32, "O'zingizni tanishtirish va savollarga javob berish.", False),
            ("Yakuniy test va keyingi qadamlar", 20, "Bilimni tekshirish va o'rganishni davom ettirish rejasi.", False),
        ],
    },
    {
        "title": "Instagram & Facebook target reklamalari",
        "slug": "instagram-facebook-target",
        "summary": "Reklama byudjetini to'g'ri sarflab, sotuvlarni bir necha barobar oshiring.",
        "description": (
            "Meta reklama platformasida professional darajada ishlashni o'rganing. Auditoriyani to'g'ri tanlash, "
            "kreativ yaratish, A/B test o'tkazish va natijalarni tahlil qilish — barchasi amaliy misollarda.\n\n"
            "Kurs davomida real brend uchun reklama kampaniyasini noldan sozlab, natijalarini tahlil qilasiz."
        ),
        "category": "marketing", "instructor": "Sardor Toshpulatov", "level": "O'rta",
        "price": 450000, "old_price": 650000, "icon": "megaphone", "accent": "#f97316",
        "base_students": 760, "featured": False, "created_days_ago": 75,
        "outcomes": [
            "Meta Ads Manager'ni to'liq sozlash",
            "Auditoriya va retargeting strategiyalari",
            "Kreativlar va reklama matnlari",
            "A/B test va byudjet optimizatsiyasi",
            "ROAS va natijalarni tahlil qilish",
        ],
        "lessons": [
            ("Meta reklama ekotizimi", 18, "Facebook, Instagram va Audience Network imkoniyatlari.", True),
            ("Business Manager sozlash", 22, "Sahifa, katalog va to'lov usullarini ulash.", True),
            ("Auditoriyani aniqlash", 28, "Core, custom va lookalike auditoriyalar.", False),
            ("Kampaniya tuzilishi", 26, "CBO va ABO strategiyalari, maqsad tanlash.", False),
            ("Reklama kreativlari", 30, "Rasm, video va matn yozish qoidalari.", False),
            ("A/B testlar", 24, "To'g'ri test o'tkazish va xulosalar chiqarish.", False),
            ("Retargeting va voronka", 26, "Issiq auditoriya bilan ishlash.", False),
            ("Byudjet va ROAS tahlili", 28, "Xarajatni optimallashtirish va hisobotlar.", False),
        ],
    },
    {
        "title": "Ma'lumotlar tahlili: Excel, SQL va Power BI",
        "slug": "malumotlar-tahlili",
        "summary": "Ma'lumotlardan qaror qabul qilish uchun foydali xulosalar chiqaring.",
        "description": (
            "Zamonaviy biznes ma'lumotlarga tayanadi. Bu kursda Excel'ning ilg'or funksiyalaridan boshlab, "
            "SQL so'rovlari va Power BI dashboardlarigacha bo'lgan to'liq analitika yo'lini bosib o'tasiz.\n\n"
            "Har bir modul real biznes ma'lumotlari bilan ishlashni o'z ichiga oladi va yakunda portfolio uchun "
            "to'liq tahliliy hisobot tayyorlaysiz."
        ),
        "category": "malumotlar", "instructor": "Jasur Abdullayev", "level": "O'rta",
        "price": 690000, "old_price": 990000, "icon": "chart", "accent": "#8b5cf6",
        "base_students": 1120, "featured": True, "created_days_ago": 130,
        "outcomes": [
            "Excel'da pivot jadvallar va formulalar",
            "SQL bilan ma'lumotlarni so'rash",
            "Ma'lumotlarni tozalash va tayyorlash",
            "Power BI'da interaktiv dashboard",
            "Biznes uchun insightlar yaratish",
        ],
        "lessons": [
            ("Analitika va ma'lumot turlari", 15, "Data-driven yondashuv va tahlil jarayoni.", True),
            ("Excel asoslari va formulalar", 32, "VLOOKUP, IF, SUMIF va boshqa muhim funksiyalar.", True),
            ("Pivot jadvallar", 28, "Katta jadvallarni tez umumlashtirish.", False),
            ("Ma'lumotlarni tozalash", 30, "Bo'sh qiymatlar, dublikatlar va formatlash.", False),
            ("SQL: SELECT va filtrlash", 34, "WHERE, ORDER BY, LIMIT bilan so'rovlar.", False),
            ("SQL: JOIN va agregatsiya", 36, "Jadvallarni birlashtirish va GROUP BY.", False),
            ("Power BI bilan tanishuv", 30, "Ma'lumot importi va vizualizatsiya turlari.", False),
            ("DAX asoslari", 28, "Hisoblanuvchi ustunlar va o'lchovlar.", False),
            ("Dashboard dizayni", 32, "Samarali va tushunarli hisobot yaratish.", False),
            ("Yakuniy loyiha", 36, "Real ma'lumotlar asosida to'liq tahlil.", False),
        ],
    },
    {
        "title": "Video montaj: Premiere Pro va After Effects",
        "slug": "video-montaj",
        "summary": "Professional videolar yaratish va dinamik animatsiyalar qo'shish.",
        "description": (
            "YouTube, reklama va ijtimoiy tarmoqlar uchun sifatli video kontent yaratishni o'rganing. "
            "Premiere Pro'da montaj, rang bilan ishlash va ovoz, After Effects'da esa motion grafika asoslari.\n\n"
            "Kursda siz 3 ta real loyiha ustida ishlaysiz: vlog, reklama roligi va animatsiyalangan intro."
        ),
        "category": "video", "instructor": "Kamola Nazarova", "level": "Boshlang'ich",
        "price": 520000, "old_price": 720000, "icon": "video", "accent": "#ef4444",
        "base_students": 680, "featured": False, "created_days_ago": 160,
        "outcomes": [
            "Premiere Pro'da professional montaj",
            "Rang korreksiya va color grading",
            "Ovozni tozalash va mikslash",
            "After Effects'da motion grafika",
            "Eksport va platformalar uchun formatlash",
        ],
        "lessons": [
            ("Montaj olamiga kirish", 16, "Video ishlab chiqarish bosqichlari va vositalar.", True),
            ("Premiere Pro interfeysi", 26, "Loyiha sozlash, panellar va import.", True),
            ("Kesish va ketma-ketlik", 30, "Asosiy montaj, J/L cut va ritm.", False),
            ("O'tishlar va effektlar", 24, "To'g'ri o'tishlardan foydalanish.", False),
            ("Rang bilan ishlash", 32, "Lumetri Color va color grading.", False),
            ("Ovoz va musiqa", 26, "Shovqinni tozalash va audio balans.", False),
            ("Motion grafika asoslari", 34, "Keyframe va animatsiya prinsiplari.", False),
            ("Titri va infografika", 28, "Matn animatsiyalari va ma'lumot vizuallari.", False),
            ("Yakuniy loyiha va eksport", 36, "Videoni tayyorlash va turli formatlarda saqlash.", False),
        ],
    },
    {
        "title": "Startup asoslari: g'oyadan biznesgacha",
        "slug": "startup-asoslari",
        "summary": "G'oyani tekshirish, jamoa qurish va mahsulotni bozorga olib chiqish.",
        "description": (
            "Startup qurish — bu tasodif emas, balki tizimli jarayon. Kursda g'oyani validatsiya qilishdan "
            "tortib, investorlar bilan uchrashuvgacha bo'lgan barcha bosqichlarni o'rganasiz.\n\n"
            "Lean Startup metodologiyasi, MVP yaratish, mijoz bilan suhbat va moliyaviy rejalashtirish bo'yicha "
            "amaliy bilimlarga ega bo'lasiz."
        ),
        "category": "biznes", "instructor": "Bekzod Ismoilov", "level": "O'rta",
        "price": 750000, "old_price": 1050000, "icon": "rocket", "accent": "#10b981",
        "base_students": 540, "featured": False, "created_days_ago": 110,
        "outcomes": [
            "G'oyani tekshirish va mijoz intervyulari",
            "MVP yaratish va tez test qilish",
            "Biznes modeli va unit economics",
            "Jamoa qurish va boshqaruv",
            "Pitch deck va investorlar bilan ishlash",
        ],
        "lessons": [
            ("Startup nima va nima emas", 18, "Startup tushunchasi va muvaffaqiyat omillari.", True),
            ("Muammoni topish", 24, "Mijoz og'rig'ini aniqlash va intervyu o'tkazish.", True),
            ("G'oyani validatsiya qilish", 28, "Farazlarni tekshirish va xulosa chiqarish.", False),
            ("MVP yaratish", 32, "Eng kichik ishlaydigan mahsulotni tez chiqarish.", False),
            ("Biznes modeli", 30, "Daromad modeli va unit economics.", False),
            ("Jamoa va madaniyat", 26, "Birinchi xodimlar va kompaniya qadriyatlari.", False),
            ("Moliyaviy rejalashtirish", 28, "Xarajatlar, runway va prognozlar.", False),
            ("Investorlar va pitch", 34, "Pitch deck tuzish va muzokaralar.", False),
        ],
    },
    {
        "title": "Sun'iy intellekt va Machine Learning",
        "slug": "suniy-intellekt-machine-learning",
        "summary": "Python va scikit-learn yordamida AI modellarini yaratishni o'rganing.",
        "description": (
            "Sun'iy intellekt texnologiyalari biznesning barcha sohalariga kirib bormoqda. Bu kursda "
            "machine learning'ning asosiy algoritmlari, ma'lumot tayyorlash va model baholashni o'rganasiz.\n\n"
            "Kurs yakunida real ma'lumotlar asosida bashorat qiluvchi model yaratib, uni API sifatida taqdim etasiz."
        ),
        "category": "malumotlar", "instructor": "Jasur Abdullayev", "level": "Yuqori",
        "price": 990000, "old_price": 1490000, "icon": "brain", "accent": "#7c3aed",
        "base_students": 620, "featured": False, "created_days_ago": 60,
        "outcomes": [
            "NumPy va Pandas bilan ma'lumot tayyorlash",
            "Regressiya va klassifikatsiya modellari",
            "Model baholash va optimallashtirish",
            "Neyron tarmoqlar asoslari",
            "Modelni API sifatida joylashtirish",
        ],
        "lessons": [
            ("AI va ML landshafti", 18, "Sun'iy intellekt turlari va qo'llanish sohalari.", True),
            ("NumPy bilan ishlash", 30, "Massivlar va vektor operatsiyalari.", True),
            ("Pandas va data tayyorlash", 34, "DataFrame, tozalash va feature engineering.", False),
            ("Regressiya modellari", 32, "Linear va polynomial regressiya.", False),
            ("Klassifikatsiya", 34, "Logistic regression, KNN va decision tree.", False),
            ("Model baholash", 28, "Train/test split, cross-validation va metrikalar.", False),
            ("Ansambl usullari", 30, "Random Forest va Gradient Boosting.", False),
            ("Neyron tarmoqlar asoslari", 36, "Perceptron va backpropagation.", False),
            ("Modelni saqlash va API", 28, "Pickle, FastAPI va deploy.", False),
            ("Yakuniy ML loyiha", 40, "To'liq loyiha: ma'lumotdan modelgacha.", False),
        ],
    },
    {
        "title": "Grafik dizayn: Photoshop va Illustrator",
        "slug": "grafik-dizayn",
        "summary": "Brending, banner va ijtimoiy tarmoq vizuallarini professional yaratish.",
        "description": (
            "Grafik dizayn bo'yicha to'liq amaliy kurs. Photoshop'da rasm bilan ishlash va Illustrator'da "
            "vektor grafika, logotip hamda brend identifikatsiyasini yaratishni o'rganasiz.\n\n"
            "Kursda siz real mijozlar uchun 5 ta loyihani bajarib, kuchli portfolio yig'asiz."
        ),
        "category": "dizayn", "instructor": "Malika Yusupova", "level": "Boshlang'ich",
        "price": 480000, "old_price": 690000, "icon": "brush", "accent": "#f43f5e",
        "base_students": 890, "featured": False, "created_days_ago": 220,
        "outcomes": [
            "Photoshop'da professional retush",
            "Illustrator'da vektor grafika",
            "Logotip va brend identifikatsiyasi",
            "SMM uchun vizual kontent",
            "Chop etish uchun maket tayyorlash",
        ],
        "lessons": [
            ("Dizayn asoslari", 18, "Kompozitsiya, balans va vizual ierarxiya.", True),
            ("Photoshop interfeysi", 26, "Layerlar, maskalar va smart obyektlar.", True),
            ("Rasm bilan ishlash", 30, "Retush, rang va yorug'lik bilan ishlash.", False),
            ("Illustrator asoslari", 28, "Vektor, Path va Pen Tool.", False),
            ("Logotip yaratish", 34, "Konsepsiyadan tayyor logotipgacha.", False),
            ("Brend identifikatsiyasi", 32, "Ranglar, shriftlar va brand guide.", False),
            ("SMM vizuallari", 26, "Postlar, stories va reklama bannerlari.", False),
            ("Chop etish va PDF", 22, "Poligrafiya uchun fayl tayyorlash.", False),
            ("Portfolio loyihasi", 30, "Yakuniy ishni taqdimotga tayyorlash.", False),
        ],
    },
    {
        "title": "Karyera va CV: orzu ishingizni qo'lga kiriting",
        "slug": "karyera-va-cv",
        "summary": "Kuchli CV yozish, ish suhbati va karyera rejasini tuzish — bepul kurs.",
        "description": (
            "Bu bepul kurs ish qidiruvchilar uchun amaliy qo'llanma. ATX tizimlaridan o'tadigan CV yozish, "
            "LinkedIn profilini to'g'ri sozlash va ish suhbatida ishonchli javob berishni o'rganasiz.\n\n"
            "Darslar qisqa va aniq — har birini 20 daqiqada o'zlashtirib, darhol amalda qo'llashingiz mumkin."
        ),
        "category": "shaxsiy", "instructor": "Bekzod Ismoilov", "level": "Boshlang'ich",
        "price": 0, "old_price": 0, "icon": "sparkles", "accent": "#eab308",
        "base_students": 3450, "featured": False, "created_days_ago": 300,
        "outcomes": [
            "ATX tizimidan o'tadigan CV yozish",
            "LinkedIn profilini optimallashtirish",
            "Ish suhbatiga tayyorgarlik",
            "Maosh muzokarasi asoslari",
            "Karyera rejasini tuzish",
        ],
        "lessons": [
            ("Karyera strategiyasi", 14, "Maqsad qo'yish va ish qidiruv rejasi.", True),
            ("CV strukturasi", 24, "Bo'limlar, format va asosiy xatolar.", True),
            ("ATX filtrlari", 20, "Kalit so'zlar va avtomatik saralash tizimlari.", False),
            ("LinkedIn profil", 22, "Optimallashtirish va networking.", False),
            ("Ish suhbati", 26, "STAR metodi va tayyor javoblar.", False),
            ("Maosh muzokarasi", 18, "Taklifni to'g'ri baholash va kelishish.", False),
        ],
    },
    {
        "title": "Flutter bilan mobil ilova yaratish",
        "slug": "flutter-mobil-ilova",
        "summary": "Bitta koddan iOS va Android uchun chiroyli ilova yarating.",
        "description": (
            "Flutter yordamida tez va sifatli mobil ilovalar yaratishni o'rganing. Dart tili asoslaridan "
            "boshlab, state management, API bilan ishlash va Play Market'ga chiqarishgacha bo'lgan jarayon.\n\n"
            "Kursda siz real ilova yaratasiz: onlayn kurslar katalogi va foydalanuvchi profili bilan."
        ),
        "category": "dasturlash", "instructor": "Doston Rahimov", "level": "O'rta",
        "price": 820000, "old_price": 1150000, "icon": "phone", "accent": "#14b8a6",
        "base_students": 730, "featured": False, "created_days_ago": 85,
        "outcomes": [
            "Dart tili va Flutter asoslari",
            "Responsive UI va widgetlar",
            "State management (Provider/Bloc)",
            "REST API bilan integratsiya",
            "Ilovani do'konga chiqarish",
        ],
        "lessons": [
            ("Flutter ekotizimi", 16, "Mobil dasturlash va Flutter afzalliklari.", True),
            ("Dart asoslari", 30, "O'zgaruvchilar, funksiyalar va klasslar.", True),
            ("Widget tushunchasi", 26, "Stateless va Stateful widgetlar.", False),
            ("Layout va dizayn", 32, "Row, Column, Stack va responsive layout.", False),
            ("Navigatsiya", 24, "Sahifalar va route boshqaruvi.", False),
            ("State management", 34, "Provider bilan holatni boshqarish.", False),
            ("API bilan ishlash", 30, "http paketi va JSON parsing.", False),
            ("Mahalliy saqlash", 24, "Shared preferences va ma'lumotlar bazasi.", False),
            ("Test va optimizatsiya", 26, "Debugging va performance.", False),
            ("Ilovani chiqarish", 32, "Signing, build va store'ga joylash.", False),
        ],
    },
    {
        "title": "SMM va kontent marketing",
        "slug": "smm-kontent-marketing",
        "summary": "Ijtimoiy tarmoqlarda brendni o'stirish va sotuvga olib keluvchi kontent.",
        "description": (
            "SMM — bu shunchaki post joylash emas. Kursda kontent strategiyasi, kontent-reja, umumiy tonallik "
            "va auditoriya bilan muloqot qilishni o'rganasiz.\n\n"
            "Instagram, Telegram va TikTok platformalari uchun samarali kontent yaratish, reels va stories "
            "bilan ishlash bo'yicha amaliy ko'nikmalar hosil qilasiz."
        ),
        "category": "marketing", "instructor": "Sardor Toshpulatov", "level": "Boshlang'ich",
        "price": 340000, "old_price": 490000, "icon": "megaphone", "accent": "#fb7185",
        "base_students": 1980, "featured": False, "created_days_ago": 180,
        "outcomes": [
            "Kontent strategiyasi va kontent-reja",
            "Instagram, Telegram va TikTok",
            "Reels va stories bilan ishlash",
            "Nusxachilik (copywriting) asoslari",
            "Analitika va natijalarni o'lchash",
        ],
        "lessons": [
            ("SMM landshafti", 15, "Platformalar, formatlar va trendlar.", True),
            ("Auditoriyani o'rganish", 24, "Persona yaratish va raqobatchilarni tahlil qilish.", True),
            ("Kontent strategiyasi", 30, "Maqsadlar, tonallik va kontent-reja.", False),
            ("Copywriting asoslari", 28, "Sarlavhalar va sotuvchi matnlar.", False),
            ("Reels va video kontent", 30, "Idea, skript va montaj.", False),
            ("Stories va muloqot", 22, "Auditoriya bilan aloqa va savdo.", False),
            ("Telegram kanal yuritish", 24, "Kontent va o'sish strategiyasi.", False),
            ("Analitika va hisobot", 26, "Metrikalar va samaradorlikni o'lchash.", False),
        ],
    },
]

# (kurs slug, o'quvchi ismi, reyting, izoh)
REVIEWS = [
    ("python-asoslari", "Dilshod Karimov", 5, "Kurs juda tushunarli. Har bir mavzu amaliy misollar bilan mustahkamlanadi. Endi mustaqil kod yoza olaman!"),
    ("python-asoslari", "Shahnoza Islomova", 5, "Aziz ustozning tushuntirish uslubi zo'r. O'zgaruvchilar va funksiyalar bo'limi ayniqsa foydali bo'ldi."),
    ("python-asoslari", "Javohir Tursunov", 4, "Sifatli kurs, lekin OOP bo'limi biroz tez o'tilgan. Baribir tavsiya qilaman."),
    ("python-asoslari", "Madina Rahimova", 5, "Noldan boshlaganman, 2 oyda mini-loyihani yakunladim. Natijadan juda mamnunman."),
    ("full-stack-javascript", "Bobur Aliyev", 5, "React va Node qismlari juda puxta. Yakuniy loyiha portfoliomga juda mos tushdi."),
    ("full-stack-javascript", "Zilola Ergasheva", 4, "Kurs kuchli, faqat MongoDB o'rniga PostgreSQL bo'lsa yaxshi bo'lardi."),
    ("full-stack-javascript", "Sanjar Yuldashev", 5, "Deploy bo'limi uchun alohida rahmat — birinchi marta saytimni internetga chiqardim."),
    ("ui-ux-dizayn-figma", "Nodira Qodirova", 5, "Malika opa dizaynni nafaqat chiroyli, balki foydali qilishni o'rgatadi. Figma bo'yicha eng yaxshi kurs."),
    ("ui-ux-dizayn-figma", "Rustam Xolmatov", 5, "Design system mavzusi ishimda darhol kerak bo'ldi. Amaliyot juda ko'p."),
    ("ui-ux-dizayn-figma", "Gulnora Saidova", 4, "Ajoyib kurs. Yana batafsil animatsiya darslarini qo'shsangiz."),
    ("ingliz-tili-0-intermediate", "Timur Mirzayev", 5, "Nilufar ustozning talaffuz mashqlari juda samarali. 3 oyda ancha ilgariladim."),
    ("ingliz-tili-0-intermediate", "Kamila Abdullayeva", 5, "Darslar qisqa va tushunarli. Har kuni 20 daqiqa ishlash yetarli."),
    ("ingliz-tili-0-intermediate", "Ulug'bek Sharipov", 4, "Grammatika yaxshi tushuntirilgan, lekin qo'shimcha lug'at materiallari kerak."),
    ("instagram-facebook-target", "Sevinch Umarova", 5, "Kampaniyalarni sozlashni amalda o'rgandim. Birinchi reklamam ROAS 3.4 berdi!"),
    ("instagram-facebook-target", "Farrux Nosirov", 4, "Foydali kurs, ayniqsa retargeting bo'limi. Narxi ham munosib."),
    ("malumotlar-tahlili", "Aziza Hamidova", 5, "Excel va SQL qismlari ishimda juda asqotdi. Power BI dashboardlar chiroyli chiqadi."),
    ("malumotlar-tahlili", "Otabek Sattorov", 5, "Jasur ustoz har bir savolga batafsil javob beradi. Kursdan katta foyda oldim."),
    ("malumotlar-tahlili", "Dildora Nazarova", 4, "Mazmunli kurs. DAX bo'limi yanada kengroq bo'lishi mumkin."),
    ("video-montaj", "Sardor Mahmudov", 5, "Premiere Pro'ni noldan o'rgandim. Birinchi vlogimni montaj qildim!"),
    ("video-montaj", "Mohira Jalilova", 5, "Rang bilan ishlash bo'limi eng yoqqani. Kamola ustoz juda sodda tushuntiradi."),
    ("startup-asoslari", "Islom Rustamov", 5, "G'oyamni tekshirishda bu kurs juda yordam berdi. Investorlar bilan suhbatga tayyorman."),
    ("startup-asoslari", "Zarina Tosheva", 4, "Amaliy bilimlar ko'p. Pitch deck bo'limi ayniqsa foydali."),
    ("suniy-intellekt-machine-learning", "Anvar Sobirov", 5, "ML modellari bo'yicha puxta kurs. Yakuniy loyiha haqiqiy tajriba berdi."),
    ("suniy-intellekt-machine-learning", "Laylo Mirzayeva", 4, "Chuqur kurs, boshlovchilar uchun biroz murakkab bo'lishi mumkin."),
    ("grafik-dizayn", "Shahnoza Islomova", 5, "Photoshop va Illustrator'ni bir kursda o'rgandim. Portfolio uchun 3 ish tayyorladim."),
    ("grafik-dizayn", "Dilshod Karimov", 4, "Yaxshi kurs, ayniqsa logotip yaratish bo'limi. Yana brending misollari kerak."),
    ("karyera-va-cv", "Madina Rahimova", 5, "Bepul bo'lishiga qaramay, eng foydali kurslardan biri. CV'mni yangiladim va suhbatga taklif oldim!"),
    ("karyera-va-cv", "Javohir Tursunov", 5, "LinkedIn bo'limi juda foydali. 2 hafta ichida 3 ta suhbatga taklif oldim."),
    ("karyera-va-cv", "Gulnora Saidova", 4, "Qisqa va aniq. Maosh muzokarasi bo'yicha ko'proq misollar bo'lsa yaxshi."),
    ("flutter-mobil-ilova", "Bobur Aliyev", 5, "Flutter'ni tez o'zlashtirdim. Yakuniy ilova Play Market'ga chiqdi!"),
    ("flutter-mobil-ilova", "Sanjar Yuldashev", 4, "Kurs yaxshi tuzilgan. State management qismi biroz murakkab."),
    ("smm-kontent-marketing", "Nodira Qodirova", 5, "SMM'ni tizimli o'rgandim. Kontent-reja tuzish endi oson."),
    ("smm-kontent-marketing", "Kamila Abdullayeva", 4, "Foydali kurs. Reels bo'yicha amaliy topshiriqlar ko'proq bo'lsa."),
]
