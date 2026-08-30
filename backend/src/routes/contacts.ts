import { Router } from 'express'
import { AuthRequest } from '../middleware/auth'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Get all contacts
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await global.db
      .prepare('SELECT * FROM contacts WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.userId)
    res.json(result)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    res.status(500).json({ error: 'Failed to fetch contacts' })
  }
})

// Get single contact
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const result = await global.db
      .prepare('SELECT * FROM contacts WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId)
    if (!result) {
      return res.status(404).json({ error: 'Contact not found' })
    }
    res.json(result)
  } catch (error) {
    console.error('Error fetching contact:', error)
    res.status(500).json({ error: 'Failed to fetch contact' })
  }
})

// Create contact
router.post('/', async (req: AuthRequest, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      address,
      city,
      state,
      postalCode,
      country,
      notes,
      source,
    } = req.body

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' })
    }

    const contactId = uuidv4()
    await global.db
      .prepare(
        `INSERT INTO contacts (
        id, user_id, first_name, last_name, email, phone, company,
        job_title, address, city, state, postal_code, country, notes, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        contactId,
        req.userId,
        firstName,
        lastName,
        email || null,
        phone || null,
        company || null,
        jobTitle || null,
        address || null,
        city || null,
        state || null,
        postalCode || null,
        country || null,
        notes || null,
        source || 'manual'
      )

    const result = await global.db.prepare('SELECT * FROM contacts WHERE id = ?').get(contactId)
    res.status(201).json(result)
  } catch (error) {
    console.error('Error creating contact:', error)
    res.status(500).json({ error: 'Failed to create contact' })
  }
})

// Update contact
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, phone, company, jobTitle, address, city, state, postalCode, country, notes, status } = req.body

    await global.db
      .prepare(
        `UPDATE contacts SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        company = COALESCE(?, company),
        job_title = COALESCE(?, job_title),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        postal_code = COALESCE(?, postal_code),
        country = COALESCE(?, country),
        notes = COALESCE(?, notes),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
      )
      .run(firstName, lastName, email, phone, company, jobTitle, address, city, state, postalCode, country, notes, status, req.params.id, req.userId)

    const result = await global.db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id)
    if (!result) {
      return res.status(404).json({ error: 'Contact not found' })
    }
    res.json(result)
  } catch (error) {
    console.error('Error updating contact:', error)
    res.status(500).json({ error: 'Failed to update contact' })
  }
})

// Delete contact
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const contact = await global.db
      .prepare('SELECT * FROM contacts WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId)
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    await global.db.prepare('DELETE FROM contacts WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)

    res.json({ message: 'Contact deleted', contact })
  } catch (error) {
    console.error('Error deleting contact:', error)
    res.status(500).json({ error: 'Failed to delete contact' })
  }
})

export default router
