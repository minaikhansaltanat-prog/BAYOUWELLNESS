# BAYOU WELLNESS

Қазақша · Русский · English · 한국어 төрт тілді, алдын ала дайындалған (pre-rendered) статикалық сайт: өнім каталогы, өнім беттері, күтім нұсқаулықтары, B2B серіктестік өтінімі, серіктестер картасы, себет (WhatsApp арқылы тапсырыс). Бағыт: Қазақстан, валюта KZT (₸).

Бастапқы ТЗ: `BAYOU WELLNESS.pdf` (Master Specification V1.0). Дизайн-жүйе: [DESIGN.md](DESIGN.md). Өнім контексті: [PRODUCT.md](PRODUCT.md).

## Жылдам бастау

```bash
npm install          # Node 20+; puppeteer тек скриншоттар үшін
npm run dev          # құрастырады және http://localhost:3000 ашады (файл өзгерсе өзі қайта құрастырады)
npm run build        # dist/ қалтасына дайын сайтты жазады
npm run check        # 4 тілдегі аудармалар толықтығын тексереді
npm run smoke        # (dev сервер қосулы кезде) барлық бет/тіл/өлшемде көлденең скролл, қате, сынық сурет, мәзір, себет тексерісі
```

Құрастыру параметрлері (GitHub Pages үшін жол префиксі):

```bash
SITE_BASE=/BAYOUWELLNESS/ SITE_URL=https://minaikhansaltanat-prog.github.io/BAYOUWELLNESS npm run build
```

## Орналастыру (GitHub Pages)

`.github/workflows/pages.yml` әр `main` push-тан кейін сайтты құрастырып жариялайды. Бір рет қосу керек: репозиторий → **Settings → Pages → Build and deployment → Source: GitHub Actions**. Өз доменіңіз болса, репозиторий айнымалыларында `SITE_BASE` (мысалы `/`) және `SITE_URL` (мысалы `https://bayouwellness.kz`) мәндерін қойыңыз.

## Мазмұнды өзгерту (код жазбай)

| Не өзгерту | Қайда |
|---|---|
| Өнім, **баға**, акция бағасы, қоймадағы мәртебе, құрам, қолдану тәртібі | `content/products.json` (`price`, `salePrice`: сан, `stock`: `in` / `out` / `unknown`; `composition`, `usage`, `precautions`: 4 тілдегі мәтін) |
| Санаттар, көрсету/жасыру | `content/categories.json` (`visible`) |
| Серіктестер картасы | `content/partners.json` (үлгі: `partners.example.json`). Картаға тек `status: "published"`, координаттары және `verifiedAt` күні бар жазбалар түседі |
| Нұсқаулықтар | `content/guides.json` |
| Интерфейс мәтіндері (4 тіл) | `src/i18n/*.mjs` (әр жол: `[кілт, kk, ru, en, ko]`) |
| Байланыс нөмірі, WhatsApp, аналитика ID, Tally форма ID | `content/site.json` |
| Түстер, қаріптер, аралықтар | `src/css/tokens.css` |

Өнім суреттері `Photo/` қалтасында, `npm run images` оларды `public/img/` ішіне WebP етіп оңтайландырады (`tools/optimize-images.py`, Pillow қажет).

## Құрылым

```
src/css        дизайн токендері, компоненттер, беттер
src/js         app.js (барлық беттер), map.js (тек карта беті)
src/templates  беттер шаблондары (HTML жолдары)
src/i18n       4 тілдегі интерфейс мәтіндері
content        өнім, санат, нұсқаулық, серіктес деректері (JSON)
public         қаріптер (өзіміздің серверден), суреттер
tools          аударма тексерушісі, smoke-тест, сурет оңтайландырушы
build.mjs      барлығын dist/ ішіне құрастырады (4 тіл x 22 бет, sitemap.xml, robots.txt, 404)
```

URL құрылымы: `/{kk|ru|en|ko}/…`; корень `/` тілді браузерден немесе сақталған таңдаудан анықтап бағыттайды. Әр бетте `hreflang`, canonical, Open Graph және JSON-LD бар.

## Сыртқы қызметтер

- **B2B өтінім формасы**: Tally (4 тілге 4 форма, ID `content/site.json` ішінде). Өтінімдер Tally кабинетінде сақталады; хабарлама мен экспорт баптауларын Tally ішінде қосыңыз.
- **Карта**: Leaflet + OpenStreetMap плиткалары. Google Maps / 2GIS таңдау ТЗ 5.6 бойынша ашық мәселе; провайдер `src/js/map.js` ішінде бір орында ауыстырылады. Карта істемесе, серіктестер тізімі жұмысын жалғастырады.
- **Аналитика**: оқиғалар `window.dataLayer` арқылы жіберіледі (`view_item`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `b2b_form_start`, `b2b_form_submit`, `partner_map_search`, `partner_marker_select`, `partner_contact_click`, `partner_directions_click`, қосымша `generate_lead`, `whatsapp_click`). GA4 немесе Яндекс.Метрика қосу үшін `content/site.json` ішіндегі `analytics` өрістеріне ID жазыңыз. Дерек қосу үшін `?debug_analytics` параметрін қолданыңыз.

## Қазіргі шектеулер (ТЗ бойынша келесі кезеңдер)

Мынау **әлі жасалған жоқ**: дерекқор (PostgreSQL/Prisma), `/admin` панелі және рөлдер, онлайн төлем мен жеткізу интеграциясы, серверлік баға тексерісі, B2B жеке кабинеті, жазылу (newsletter), тапсырыс мәртебесін тексеру, өнім қалдықтарын автоматты жаңарту. Сайттағы себет браузерде (localStorage) сақталады және тапсырыс WhatsApp арқылы менеджерге жіберіледі; баға мен қолжетімділікті менеджер растайды.

Контентте ойдан қосылмаған деректер: баға, құрам, қолдану тәртібі, серіктестер. Олар `null`/бос күйінде тұр және «ресми құжаттан қосылады» деп көрсетіледі.
