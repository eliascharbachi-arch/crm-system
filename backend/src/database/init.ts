import initSqlJs, { Database } from 'sql.js'
import fs from 'fs'
import path from 'path'

const dbPath = path.join(__dirname, '../../crm.db')

let dbInstance: Database | null = null
let SQL: any = null

// Function to save database to file
export function saveDatabase() {
  if (dbInstance) {
    const data = dbInstance.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(dbPath, buffer)
  }
}

// Function to load or create database
async function loadDatabase(): Promise<Database> {
  if (!SQL) {
    SQL = await initSqlJs()
  }

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    return new SQL.Database(buffer)
  } else {
    return new SQL.Database()
  }
}

// Initialize database with lazy loading wrapper
class DatabaseWrapper {
  private _db: Database | null = null
  private initPromise: Promise<Database> | null = null

  async ensureInitialized(): Promise<Database> {
    if (this._db) return this._db
    if (this.initPromise) return this.initPromise

    this.initPromise = loadDatabase()
    this._db = await this.initPromise
    return this._db
  }

  prepare(sql: string) {
    return {
      get: async (...params: any[]) => {
        const db = await this.ensureInitialized()
        try {
          const stmt = db.prepare(sql)
          stmt.bind(params)
          if (stmt.step()) {
            const result = stmt.getAsObject()
            stmt.free()
            return result
          }
          stmt.free()
          return null
        } catch (error) {
          console.error('Database error:', error, 'SQL:', sql)
          throw error
        }
      },
      all: async (...params: any[]) => {
        const db = await this.ensureInitialized()
        try {
          const stmt = db.prepare(sql)
          stmt.bind(params)
          const results = []
          while (stmt.step()) {
            results.push(stmt.getAsObject())
          }
          stmt.free()
          return results
        } catch (error) {
          console.error('Database error:', error, 'SQL:', sql)
          throw error
        }
      },
      run: async (...params: any[]) => {
        const db = await this.ensureInitialized()
        try {
          const stmt = db.prepare(sql)
          stmt.bind(params)
          stmt.step()
          stmt.free()
          saveDatabase()
          return { changes: db.getRowsModified() }
        } catch (error) {
          console.error('Database error:', error, 'SQL:', sql)
          throw error
        }
      },
    }
  }
}

export const db = new DatabaseWrapper()

export async function initializeDatabase() {
  const database = await db.ensureInitialized()

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      job_title TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT,
      notes TEXT,
      source TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      contact_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      amount DECIMAL,
      currency TEXT DEFAULT 'SEK',
      stage TEXT DEFAULT 'lead',
      probability DECIMAL DEFAULT 50,
      expected_close_date DATE,
      closed_date DATE,
      closed_reason TEXT,
      priority TEXT DEFAULT 'normal',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      contact_id TEXT,
      deal_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      due_date DATETIME,
      completed_at DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deal_stages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_assignments (
      id TEXT PRIMARY KEY,
      activity_id TEXT NOT NULL,
      assigned_to_user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
    CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);
    CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
    CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
    CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
    CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON activities(contact_id);
    CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON activities(deal_id);
    CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
  `

  const statements = createTableSQL.split(';').filter(s => s.trim())
  for (const statement of statements) {
    if (statement.trim()) {
      const stmt = database.prepare(statement)
      stmt.step()
      stmt.free()
    }
  }

  console.log('✅ Database initialized successfully')
}
