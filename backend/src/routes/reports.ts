import { Router } from 'express'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// Get dashboard stats
router.get('/dashboard/stats', async (req: AuthRequest, res) => {
  try {
    const contactsResult = await global.db
      .prepare('SELECT COUNT(*) as count FROM contacts WHERE user_id = ?')
      .get(req.userId) as any

    const dealsResult = await global.db
      .prepare(
        'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM deals WHERE user_id = ? AND closed_date IS NULL'
      )
      .get(req.userId) as any

    const activitiesResult = await global.db
      .prepare('SELECT COUNT(*) as pending FROM activities WHERE user_id = ? AND status = ?')
      .get(req.userId, 'pending') as any

    res.json({
      contacts: parseInt(contactsResult.count),
      activeDeals: parseInt(dealsResult.count),
      dealValue: parseFloat(dealsResult.total),
      pendingActivities: parseInt(activitiesResult.pending),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

// Get sales pipeline report
router.get('/sales/pipeline', async (req: AuthRequest, res) => {
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
    console.error('Error fetching pipeline report:', error)
    res.status(500).json({ error: 'Failed to fetch pipeline report' })
  }
})

// Get sales forecast
router.get('/sales/forecast', async (req: AuthRequest, res) => {
  try {
    const result = await global.db
      .prepare(
        `SELECT
        stage,
        COUNT(*) as deal_count,
        COALESCE(SUM(amount * probability / 100), 0) as weighted_value
       FROM deals
       WHERE user_id = ? AND closed_date IS NULL
       GROUP BY stage
       ORDER BY stage`
      )
      .all(req.userId) as any[]

    const totalWeightedValue = result.reduce((sum, row) => sum + parseFloat(row.weighted_value), 0)

    res.json({
      byStage: result,
      totalWeightedValue: totalWeightedValue,
    })
  } catch (error) {
    console.error('Error fetching forecast:', error)
    res.status(500).json({ error: 'Failed to fetch forecast' })
  }
})

// Get activity summary
router.get('/activities/summary', async (req: AuthRequest, res) => {
  try {
    const result = await global.db
      .prepare(
        `SELECT
        type,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
       FROM activities
       WHERE user_id = ?
       GROUP BY type
       ORDER BY count DESC`
      )
      .all(req.userId)
    res.json(result)
  } catch (error) {
    console.error('Error fetching activity summary:', error)
    res.status(500).json({ error: 'Failed to fetch activity summary' })
  }
})

// Get conversion rates
router.get('/sales/conversion-rates', async (req: AuthRequest, res) => {
  try {
    const result = await global.db
      .prepare(
        `SELECT
        stage,
        COUNT(*) as total_deals,
        SUM(CASE WHEN closed_reason = 'won' THEN 1 ELSE 0 END) as won_deals,
        ROUND(100.0 * SUM(CASE WHEN closed_reason = 'won' THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
       FROM deals
       WHERE user_id = ? AND closed_date IS NOT NULL
       GROUP BY stage
       ORDER BY conversion_rate DESC`
      )
      .all(req.userId)
    res.json(result)
  } catch (error) {
    console.error('Error fetching conversion rates:', error)
    res.status(500).json({ error: 'Failed to fetch conversion rates' })
  }
})

// Get monthly revenue
router.get('/revenue/monthly', async (req: AuthRequest, res) => {
  try {
    const result = await global.db
      .prepare(
        `SELECT
        DATE(closed_date) as month,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(*) as deal_count
       FROM deals
       WHERE user_id = ? AND closed_date IS NOT NULL AND closed_reason = 'won'
       GROUP BY DATE(closed_date)
       ORDER BY closed_date DESC
       LIMIT 12`
      )
      .all(req.userId)
    res.json(result)
  } catch (error) {
    console.error('Error fetching revenue:', error)
    res.status(500).json({ error: 'Failed to fetch revenue' })
  }
})

export default router
