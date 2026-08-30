# CRM System - Deployment Guide (Railway.app)

## Steg 1: Skapa Railway-projekt

1. Gå till https://railway.app
2. Skapa ett nytt konto (eller logga in)
3. Skapa två nya projekt:
   - **Backend**: `crm-backend`
   - **Frontend**: `crm-frontend`

## Steg 2: Deploy Backend

### Setup:
1. I Railway, välj "Deploy from GitHub" eller "Deploy from File"
2. Om du använder GitHub:
   - Skapa ett GitHub-repo
   - Pusha `crm-system/backend` till repo
   - Koppla repo till Railway

3. Om du deployer utan GitHub:
   - Railway kan läsa från en folder direkt

### Environment Variables (STÄLL IN I RAILWAY):
```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-key-here-min-32-tecken
```

### Kommando att köra:
```
npm install && npm run build && npm start
```

## Steg 3: Deploy Frontend

### Setup:
1. Uppdatera `frontend/src/api/client.ts`:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app'

const client = axios.create({
  baseURL: API_BASE_URL,
})
```

2. I Railway, sätt environment variabel:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

3. Deployment kommando:
```
npm install && npm run build
```

4. Sätt Public Path till `dist` (Vite output folder)

## Steg 4: Få dina URLer

Efter deployment får du:
- **Backend URL**: `https://crm-backend-xxxxx.railway.app`
- **Frontend URL**: `https://crm-frontend-xxxxx.railway.app`

## Startsida (Sätt detta i bokmärken):
```
https://crm-frontend-xxxxx.railway.app
```

## Tips:
- Railway ger dig gratis $5/månad, sedan $5/GB RAM/månad
- För 2 användare räcker det väl gott
- Du kan se logs direkt i Railway dashboard
- Om något går fel, kolla "Logs" i Railway

## Video Guide (om du behöver):
- https://www.youtube.com/watch?v=aYvZwPP4lIg (Railway deploy)
