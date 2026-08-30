import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { db, initializeDatabase } from './database/init'
import authRoutes from './routes/auth'
import contactRoutes from './routes/contacts'
import dealRoutes from './routes/deals'
import activityRoutes from './routes/activities'
import reportRoutes from './routes/reports'
import { authenticateToken } from './middleware/auth'

dotenv.config()

// Make db available globally
declare global {
  var db: any
}
global.db = db

const app: Express = express()
const port = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(cors())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/contacts', authenticateToken, contactRoutes)
app.use('/api/deals', authenticateToken, dealRoutes)
app.use('/api/activities', authenticateToken, activityRoutes)
app.use('/api/reports', authenticateToken, reportRoutes)

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', database: 'sqlite', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  })
})

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase()

    app.listen(port, () => {
      console.log(`🚀 CRM Backend running on http://localhost:${port}`)
      console.log(`📊 Using SQLite Database (sql.js)`)
      console.log(`✅ Ready to use!`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
