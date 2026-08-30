# 🚀 Quick Start Guide

## Installation i 5 minuter

### Förutsättningar
- Docker & Docker Compose installerat
- Git
- Terminal/Command Prompt

### Steg 1: Klona/Extrahera projektet
```bash
cd crm-system
```

### Steg 2: Starta Docker services
```bash
docker-compose up -d
```

**Vänta 10 sekunder** på att PostgreSQL startar.

### Steg 3: Starta Backend
```bash
cd backend
npm install
npm run dev
```

✅ Backend är nu redo på `http://localhost:5000`

### Steg 4: Starta Frontend (nytt terminal fönster)
```bash
cd frontend
npm install
npm run dev
```

✅ Frontend öppnas automatiskt på `http://localhost:3000`

## 🎮 Använd CRM:en

1. **Registrera dig**
   - Klicka "Register" på login-sidan
   - Fyll i email och lösenord
   - Klicka "Register"

2. **Lägg till kontakt**
   - Gå till "Contacts"
   - Klicka "Add Contact"
   - Fyll i information
   - Klicka "Save Contact"

3. **Skapa en deal**
   - Gå till "Deals"
   - Klicka "Add Deal"
   - Välj contact, titel, belopp
   - Klicka "Save Deal"

4. **Skapa aktivitet**
   - Gå till "Activities"
   - Klicka "Add Activity"
   - Ange titel, typ, datum
   - Klicka "Save Activity"

5. **Se rapporter**
   - Gå till "Reports"
   - Se sales pipeline, prognos, och revenue

## 📊 Dashboard

Huvudsidan visar:
- 📞 Antal kontakter
- 💼 Aktiva deals och värde
- ✓ Väntande aktiviteter
- 📈 Sales pipeline per fas

## 🔑 Test

Test-data:
- Email: `test@example.com`
- Lösenord: `password123`

(Lägg till denna användare för test)

## ❌ Problem?

### Backend startar inte
```bash
# Kontrollera PostgreSQL
docker ps | grep postgres

# Se error logs
docker logs crm_postgres
```

### Frontend kan inte nå backend
```bash
# Kontrollera backend körs
curl http://localhost:5000/api/health
```

### Vill resettas?
```bash
docker-compose down -v
docker-compose up -d
```

## 📚 Nästa steg

Läs `README.md` för:
- Fullständig API dokumentation
- Projektstruktur
- Production deployment
- Kommande features

## 💡 Tips

- Använd Chrome/Firefox Developer Tools (F12) för debugging
- Check `Terminal` för error messages
- Alla ändringar sparas automatiskt
- Login-token sparas i localStorage

---

**Du är nu redo att använda ditt CRM-system!** 🎉
