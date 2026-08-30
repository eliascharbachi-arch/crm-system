import { Router } from 'express'
import { AuthRequest } from '../middleware/auth'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Get all deals
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { stage, contactId } = req.query
    let query = 'SELECT * FROM deals WHERE user_id = ?'
    const params: any[] = [req.userId]

    if (stage) {
      query += ` AND stage = ?`
      params.push(stage)
    }
    if (contactId) {
      query += ` AND contact_id = ?`
      params.push(contactId)
    }

    query += ' ORDER BY created_at DESC'

    const result = await global.db.prepare(query).all(...params)
    res.json(result)
  } catch (error) {
    console.error('Error fetching deals:', error)
    res.status(500).json({ error: 'Failed to fetch deals' })
  }
})

// Get pipeline summary
router.get('/pipeline/summary', async (req: AuthRequest, res) => {
  try {
    const result = await global.db
      .prepare(
        `SELECT
        stage,
        COUNT(*) as deal_count,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as avg_amount,
        COALESCE(AVG(probability), 0) as avg_probability
       FROM deals
       WHERE user_id = ? AND closed_date IS NULL
       GROUP BY stage
       ORDER BY stage`
      )
      .all(req.userId)
    res.json(result)
  } catch (error) {
    console.error('Error fetching pipeline:', error)
    res.status(500).json({ error: 'Failed to fetch pipeline' })
  }
})

// Get single deal
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await global.db
      .prepare('SELECT * FROM deals WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId)
    if (!result) {
      return res.status(404).json({ error: 'Deal not found' })
    }
    res.json(result)
  } catch (error) {
    console.error('Error fetching deal:', error)
    res.status(500).json({ error: 'Failed to fetch deal' })
  }
})

// Create deal
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      contactId,
      title,
      description,
      amount,
      currency,
      stage,
      probability,
      expectedCloseDate,
      priority,
    } = req.body

    if (!contactId || !title) {
      return res.status(400).json({ error: 'Contact ID and title are required' })
    }

    const dealId = uuidv4()
    await global.db
      .prepare(
        `INSERT INTO deals (
        id, user_id, contact_id, title, description, amount, currency,
        stage, probability, expected_close_date, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        dealId,
        req.userId,
        contactId,
        title,
        description || null,
        amount || null,
        currency || 'SEK',
        stage || 'lead',
        probability || 50,
        expectedCloseDate || null,
        priority || 'normal'
      )

    const result = await global.db.prepare('SELECT * FROM deals WHERE id = ?').get(dealId)
    res.status(201).json(result)
  } catch (error) {
    console.error('Error creating deal:', error)
    res.status(500).json({ error: 'Failed to create deal' })
  }
})

// Update deal
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const {
      title,
      description,
      amount,
      stage,
      probability,
      expectedCloseDate,
      closedDate,
      closedReason,
      priority,
    } = req.body

    await global.db
      .prepare(
        `UPDATE deals SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        amount = COALESCE(?, amount),
        stage = COALESCE(?, stage),
        probability = COALESCE(?, probability),
        expected_close_date = COALESCE(?, expected_close_date),
        closed_date = COALESCE(?, closed_date),
        closed_reason = COALESCE(?, closed_reason),
        priority = COALESCE(?, priority),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
      )
      .run(
        title,
        description,
        amount,
        stage,
        probability,
        expectedCloseDate,
        closedDate,
        closedReason,
        priority,
        req.params.id,
        req.userId
      )

    const result = await global.db.prepare('SELECT * FROM deals WHERE id = ?').get(req.params.id)
    if (!result) {
      return res.status(404).json({ error: 'Deal not found' })
    }
    res.json(result)
  } catch (error) {
    console.error('Error updating deal:', error)
    res.status(500).json({ error: 'Failed to update deal' })
  }
})

// Delete deal
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const deal = await global.db
      .prepare('SELECT * FROM deals WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId)
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' })
    }

    await global.db.prepare('DELETE FROM deals WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)

    res.json({ message: 'Deal deleted', deal })
  } catch (error) {
    console.error('Error deleting deal:', error)
    res.status(500).json({ error: 'Failed to delete deal' })
  }
})

export default router
