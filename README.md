# CRM System - Fullstack Application

En modernt byggt CRM-system för små team med **React + TypeScript frontend**, **Node.js + Express backend**, och **PostgreSQL databas**.

## 🎯 Funktioner

- **👥 Kontakthantering** - Lagra och organisera alla kundkontakter
- **💼 Försäljningspipeline** - Visuell pipeline med drag-and-drop för deal-faser
- **✓ Aktiviteter** - Spåra möten, samtal, email och uppgifter
- **📊 Rapporter & Analys** - Dashboard med nyckeltal och försäljningsprognos
- **🔐 Användarhantering** - Secure login med JWT-baserad autentisering

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** - Databas
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Redis** - Caching (optional)

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Router** - Routing
- **Vite** - Build tool

### DevOps
- **Docker & Docker Compose** - Containerization
- **PostgreSQL 15** - Database

## 📋 Förutsättningar

- Docker & Docker Compose (rekommenderat)
- Eller: Node.js 18+, PostgreSQL 14+, npm/yarn

## 🚀 Installation & Startup

### Option 1: Med Docker (Rekommenderat)

```bash
# Klona projektet
cd crm-system

# Starta alla tjänster
docker-compose up -d

# Vänta på att PostgreSQL startar (~10 sekunder)
sleep 10

# Installera dependencies och starta backend
cd backend
npm install
npm run dev

# I ett nytt terminal-fönster, starta frontend
cd frontend
npm install
npm run dev
```

Öppna http://localhost:3000 i din webbläsare.

### Option 2: Manuell Installation

**Backend:**
```bash
cd backend

# Skapa .env file
cp .env.example .env

# Installera dependencies
npm install

# Starta PostgreSQL (via din favorit databas-verktyg)
# Kör sedan schema.sql i din databas

# Starta backend
npm run dev
# Server kommer att köra på http://localhost:5000
```

**Frontend:**
```bash
cd frontend

# Installera dependencies
npm install

# Starta dev server
npm run dev
# App kommer att öppnas på http://localhost:3000
```

## 📁 Projektstruktur

```
crm-system/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── middleware/
│   │   │   └── auth.ts        # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.ts        # Auth endpoints
│   │   │   ├── contacts.ts    # Contacts CRUD
│   │   │   ├── deals.ts       # Deals/Pipeline
│   │   │   ├── activities.ts  # Activities
│   │   │   └── reports.ts     # Analytics
│   │   └── database/
│   │       └── schema.sql     # Database schema
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/             # React pages
│   │   ├── components/        # Reusable components
│   │   ├── api/              # API client & services
│   │   ├── store/            # Zustand stores
│   │   └── App.tsx           # Main app
│   ├── index.html
│   └── package.json
└── docker-compose.yml
```

## 🔑 Test Användare

Registrera dig själv eller använd dessa credentials om du lägger till dem:

```
Email: test@example.com
Password: password123
```

## 🔗 API Endpoints

### Auth
- `POST /api/auth/register` - Registrera ny användare
- `POST /api/auth/login` - Logga in

### Contacts
- `GET /api/contacts` - Hämta alla kontakter
- `POST /api/contacts` - Skapa ny kontakt
- `PUT /api/contacts/:id` - Uppdatera kontakt
- `DELETE /api/contacts/:id` - Radera kontakt

### Deals
- `GET /api/deals` - Hämta alla deals
- `GET /api/deals/pipeline/summary` - Pipeline summary
- `POST /api/deals` - Skapa ny deal
- `PUT /api/deals/:id` - Uppdatera deal
- `DELETE /api/deals/:id` - Radera deal

### Activities
- `GET /api/activities` - Hämta alla aktiviteter
- `GET /api/activities/upcoming/today` - Idag's aktiviteter
- `POST /api/activities` - Skapa ny aktivitet
- `PUT /api/activities/:id` - Uppdatera aktivitet
- `DELETE /api/activities/:id` - Radera aktivitet

### Reports
- `GET /api/reports/dashboard/stats` - Dashboard-statistik
- `GET /api/reports/sales/pipeline` - Pipeline-rapport
- `GET /api/reports/sales/forecast` - Försäljningsprognos
- `GET /api/reports/sales/conversion-rates` - Konverteringsgrader
- `GET /api/reports/revenue/monthly` - Månadlig intäkt

## 🔒 Säkerhet

- JWT-baserad autentisering
- Lösenord hashas med bcrypt
- SQL-injections förebyggs med parameterized queries
- CORS konfigurerat för development

**För produktion, uppdatera:**
- `JWT_SECRET` i .env
- `CORS` origin
- Database credentials
- SSL/TLS certificates

## 🚀 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Output går till frontend/dist
```

### Build Backend
```bash
cd backend
npm run build
# Output går till backend/dist
```

### Docker Production Build
```bash
docker build -f backend/Dockerfile -t crm-backend:latest .
docker build -f frontend/Dockerfile -t crm-frontend:latest .
```

## 📊 Kommande Features

- [ ] Export till CSV/Excel
- [ ] Email notifications
- [ ] Custom deal stages
- [ ] Team collaboration
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Integration med Calendars (Google/Outlook)
- [ ] Bulk operations
- [ ] Custom fields

## 🐛 Felsökning

### PostgreSQL connection error
```bash
# Kontrollera om PostgreSQL körs
docker ps | grep postgres

# Se logs
docker logs crm_postgres
```

### Frontend connection error
```bash
# Kontrollera om backend körs på port 5000
curl http://localhost:5000/api/health

# Kontrollera frontend .env
# Saknas VITE_API_BASE? Lägg till i frontend/.env
```

### Database reset
```bash
docker-compose down -v
docker-compose up -d
```

## 📞 Support

För frågor eller issues, öppna en GitHub issue eller kontakta support.

## 📄 License

MIT License - Se LICENSE file för detaljer.

---

**Lycka till med ditt CRM-system!** 🎉
