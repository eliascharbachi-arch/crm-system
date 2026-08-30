import { Router } from 'express'
import { AuthRequest } from '../middleware/auth'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Get all activities
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { type, status, contactId, dealId } = req.query
    let query = 'SELECT * FROM activities WHERE user_id = ?'
    const params: any[] = [req.userId]

    if (type) {
      query += ` AND type = ?`
      params.push(type)
    }
    if (status) {
      query += ` AND status = ?`
      params.push(status)
    }
    if (contactId) {
      query += ` AND contact_id = ?`
      params.push(contactId)
    }
    if (dealId) {
      query += ` AND deal_id = ?`
      params.push(dealId)
    }

    query += ' ORDER BY due_date ASC'

    const result = await global.db.prepare(query).all(...params)
    res.json(result)
  } catch (error) {
    console.error('Error fetching activities:', error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

// Get upcoming activities
router.get('/upcoming/today', async (req: AuthRequest, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const result = await global.db
      .prepare(
        `SELECT * FROM activities
       WHERE user_id = ? AND status = 'pending'
       AND DATE(due_date) = DATE(?)
       ORDER BY due_date ASC`
      )
      .all(req.userId, today)
    res.json(result)
  } catch (error) {
    console.error('Error fetching today activities:', error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
})

// Get single activity
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await global.db
      .prepare('SELECT * FROM activities WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId)
    if (!result) {
      return res.status(404).json({ error: 'Activity not found' })
    }
    res.json(result)
  } catch (error) {
    console.error('Error fetching activity:', error)
    res.status(500).json({ error: 'Failed to fetch activity' })
  }
})

// Create activity
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { contactId, dealId, title, description, type, dueDate, notes } = req.body

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and type are required' })
    }

    const activityId = uuidv4()
    await global.db
      .prepare(
        `INSERT INTO activities (
        id, user_id, contact_id, deal_id, title, description, type, due_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        activityId,
        req.userId,
        contactId || null,
        dealId || null,
        title,
        description || null,
        type,
        dueDate || null,
        notes || null
      )

    const result = await global.db.prepare('SELECT * FROM activities WHERE id = ?').get(activityId)
    res.status(201).json(result)
  } catch (error) {
    console.error('Error creating activity:', error)
    res.status(500).json({ error: 'Failed to create activity' })
  }
})

// Update activity
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { title, description, type, status, dueDate, completedAt, notes } = req.body

    await global.db
      .prepare(
        `UPDATE activities SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        status = COALESCE(?, status),
        due_date = COALESCE(?, due_date),
        completed_at = COALESCE(?, completed_at),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
      )
      .run(title, description, type, status, dueDate, completedAt, notes, req.params.id, req.userId)

    const result = await global.db.prepare('SELECT * FROM activities WHERE id = ?').get(req.params.id)
    if (!result) {
      return res.status(404).json({ error: 'Activity not found' })
    }
    res.json(result)
  } catch (error) {
    console.error('Error updating activity:', error)
    res.status(500).json({ error: 'Failed to update activity' })
  }
})

// Delete activity
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const activity = await global.db
      .prepare('SELECT * FROM activities WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId)
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' })
    }

    await global.db.prepare('DELETE FROM activities WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)

    res.json({ message: 'Activity deleted', activity })
  } catch (error) {
    console.error('Error deleting activity:', error)
    res.status(500).json({ error: 'Failed to delete activity' })
  }
})

export default router
