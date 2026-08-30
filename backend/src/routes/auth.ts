import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Check if user exists
    const userExists = await global.db.prepare('SELECT id FROM users WHERE email = ?').get(email)
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    // Create user
    await global.db.prepare(
      'INSERT INTO users (id, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, email, hashedPassword, firstName || '', lastName || '')

    // Generate token
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d',
    })

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, firstName, lastName },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Get user
    const user = await global.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d',
    })

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
