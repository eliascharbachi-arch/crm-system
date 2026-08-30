import { useEffect, useState } from 'react'
import { activitiesAPI, contactsAPI, dealsAPI } from '../api/services'
import { format } from 'date-fns'
import { sv } from '../localization/sv'

const activityTypes = ['call', 'email', 'meeting', 'task', 'note']

const activityTypeNames: { [key: string]: string } = {
  call: sv.activities.types.call,
  email: sv.activities.types.email,
  meeting: sv.activities.types.meeting,
  task: sv.activities.types.task,
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    contactId: '',
    dealId: '',
    title: '',
    type: 'task',
    dueDate: '',
    description: '',
  })

  const fetchData = async () => {
    try {
      const [activitiesRes, contactsRes, dealsRes] = await Promise.all([
        activitiesAPI.getAll(),
        contactsAPI.getAll(),
        dealsAPI.getAll(),
      ])
      setActivities(activitiesRes.data)
      setContacts(contactsRes.data)
      setDeals(dealsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await activitiesAPI.update(editingId, formData)
      } else {
        await activitiesAPI.create(formData)
      }
      setFormData({
        contactId: '',
        dealId: '',
        title: '',
        type: 'task',
        dueDate: '',
        description: '',
      })
      setShowForm(false)
      setEditingId(null)
      fetchData()
    } catch (error) {
      console.error('Error saving activity:', error)
    }
  }

  const handleEdit = (activity: any) => {
    setFormData({
      contactId: activity.contact_id || '',
      dealId: activity.deal_id || '',
      title: activity.title || '',
      type: activity.type || 'task',
      dueDate: activity.due_date || '',
      description: activity.description || '',
    })
    setEditingId(activity.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setFormData({
      contactId: '',
      dealId: '',
      title: '',
      type: 'task',
      dueDate: '',
      description: '',
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleToggleComplete = async (activity: any) => {
    try {
      await activitiesAPI.update(activity.id, {
        status: activity.status === 'completed' ? 'pending' : 'completed',
        completedAt: activity.status === 'completed' ? null : new Date().toISOString(),
      })
      fetchData()
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(sv.activities.delete_confirm)) {
      try {
        await activitiesAPI.delete(id)
        fetchData()
      } catch (error) {
        console.error('Error deleting activity:', error)
      }
    }
  }

  if (loading) return <div className="text-center py-12">{sv.common.loading}</div>

  const getContactName = (id: string) => {
    const contact = contacts.find((c) => c.id === id)
    return contact ? `${contact.first_name} ${contact.last_name}` : '-'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{sv.activities.title}</h1>
        <button
          onClick={() => {
            if (showForm) handleCancel()
            else setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {showForm ? sv.common.cancel : sv.activities.addActivity}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-2 gap-4">
          <select
            value={formData.contactId}
            onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">{sv.activities.contact} ({sv.common.close})</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>

          <select
            value={formData.dealId}
            onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">{sv.activities.deal} ({sv.common.close})</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder={sv.activities.title_label}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />

          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="border rounded px-3 py-2"
          >
            {activityTypes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="border rounded px-3 py-2"
          />

          <textarea
            placeholder={sv.activities.description}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border rounded px-3 py-2 col-span-2"
            rows={3}
          />

          <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700">
            {editingId ? sv.activities.edit : sv.activities.save}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">{sv.activities.title_label}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">{sv.activities.type}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">{sv.activities.contact}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">{sv.activities.dueDate}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">{sv.activities.status}</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">{sv.activities.actions}</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <tr key={activity.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{activity.title}</td>
                <td className="px-6 py-3">{activityTypeNames[activity.type] || activity.type}</td>
                <td className="px-6 py-3">{getContactName(activity.contact_id)}</td>
                <td className="px-6 py-3">
                  {activity.due_date ? format(new Date(activity.due_date), 'MMM dd, yyyy') : '-'}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      activity.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {activity.status === 'completed' ? sv.activities.statuses.completed : sv.activities.statuses.pending}
                  </span>
                </td>
                <td className="px-6 py-3 space-x-2">
                  <button
                    onClick={() => handleEdit(activity)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {sv.activities.edit}
                  </button>
                  <button
                    onClick={() => handleToggleComplete(activity)}
                    className="text-green-600 hover:text-green-800"
                  >
                    {activity.status === 'completed' ? sv.common.previous : sv.activities.actions}
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    {sv.activities.delete}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
