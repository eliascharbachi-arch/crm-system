import { useEffect, useState } from 'react'
import { dealsAPI, contactsAPI } from '../api/services'
import { sv } from '../localization/sv'

const stages = ['lead', 'negotiation', 'proposal', 'won', 'lost']

const stageNames: { [key: string]: string } = {
  lead: sv.deals.stages.lead,
  negotiation: sv.deals.stages.negotiation,
  proposal: sv.deals.stages.proposal,
  won: sv.deals.stages.closed_won,
  lost: sv.deals.stages.closed_lost,
}

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    contactId: '',
    title: '',
    amount: '',
    stage: 'lead',
    probability: '50',
    expectedCloseDate: '',
  })

  const fetchDeals = async () => {
    try {
      const [dealsRes, contactsRes] = await Promise.all([
        dealsAPI.getAll(),
        contactsAPI.getAll(),
      ])
      setDeals(dealsRes.data)
      setContacts(contactsRes.data)
    } catch (error) {
      console.error('Error fetching deals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await dealsAPI.update(editingId, formData)
      } else {
        await dealsAPI.create(formData)
      }
      setFormData({
        contactId: '',
        title: '',
        amount: '',
        stage: 'lead',
        probability: '50',
        expectedCloseDate: '',
      })
      setShowForm(false)
      setEditingId(null)
      fetchDeals()
    } catch (error) {
      console.error('Error saving deal:', error)
    }
  }

  const handleEdit = (deal: any) => {
    setFormData({
      contactId: deal.contact_id || '',
      title: deal.title || '',
      amount: deal.amount || '',
      stage: deal.stage || 'lead',
      probability: deal.probability?.toString() || '50',
      expectedCloseDate: deal.expected_close_date || '',
    })
    setEditingId(deal.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setFormData({
      contactId: '',
      title: '',
      amount: '',
      stage: 'lead',
      probability: '50',
      expectedCloseDate: '',
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleStageChange = async (dealId: string, newStage: string) => {
    try {
      await dealsAPI.update(dealId, { stage: newStage })
      fetchDeals()
    } catch (error) {
      console.error('Error updating deal:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(sv.deals.delete_confirm)) {
      try {
        await dealsAPI.delete(id)
        fetchDeals()
      } catch (error) {
        console.error('Error deleting deal:', error)
      }
    }
  }

  if (loading) return <div className="text-center py-12">{sv.common.loading}</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{sv.deals.title}</h1>
        <button
          onClick={() => {
            if (showForm) handleCancel()
            else setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {showForm ? sv.common.cancel : sv.deals.addDeal}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-2 gap-4">
          <select
            value={formData.contactId}
            onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
            className="border rounded px-3 py-2"
            required
          >
            <option value="">{sv.deals.contact}</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder={sv.deals.title_label}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="number"
            placeholder={sv.deals.amount}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <select
            value={formData.stage}
            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
            className="border rounded px-3 py-2"
          >
            {stages.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder={sv.deals.probability}
            value={formData.probability}
            onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
            className="border rounded px-3 py-2"
            min="0"
            max="100"
          />
          <input
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
            className="border rounded px-3 py-2"
            title={sv.deals.expectedCloseDate}
          />
          <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700">
            {editingId ? sv.deals.edit : sv.deals.save}
          </button>
        </form>
      )}

      {/* Pipeline View */}
      <div className="grid grid-cols-5 gap-4">
        {stages.map((stage) => (
          <div key={stage} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold mb-4 text-sm">{stageNames[stage].toUpperCase()}</h3>
            <div className="space-y-3">
              {deals
                .filter((d) => d.stage === stage)
                .map((deal) => (
                  <div key={deal.id} className="bg-white p-3 rounded shadow hover:shadow-md transition">
                    <p className="font-semibold text-sm">{deal.title}</p>
                    <p className="text-xs text-gray-600">{deal.amount?.toLocaleString()} SEK</p>
                    <div className="mt-2 space-y-2">
                      <select
                        value={stage}
                        onChange={(e) => handleStageChange(deal.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1 w-full"
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(deal)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex-1"
                        >
                          {sv.deals.edit}
                        </button>
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
