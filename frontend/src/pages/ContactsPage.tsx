import { useEffect, useState } from 'react'
import { contactsAPI } from '../api/services'
import { sv } from '../localization/sv'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })

  const fetchContacts = async () => {
    try {
      const res = await contactsAPI.getAll()
      setContacts(res.data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await contactsAPI.update(editingId, formData)
      } else {
        await contactsAPI.create(formData)
      }
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      })
      setShowForm(false)
      setEditingId(null)
      fetchContacts()
    } catch (error) {
      console.error('Error saving contact:', error)
    }
  }

  const handleEdit = (contact: any) => {
    setFormData({
      firstName: contact.first_name || '',
      lastName: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      jobTitle: contact.job_title || '',
      address: contact.address || '',
      city: contact.city || '',
      state: contact.state || '',
      postalCode: contact.postal_code || '',
      country: contact.country || '',
    })
    setEditingId(contact.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      jobTitle: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(sv.contacts.delete_confirm)) {
      try {
        await contactsAPI.delete(id)
        fetchContacts()
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{sv.contacts.title}</h1>
        <button
          onClick={() => {
            if (showForm) handleCancel()
            else setShowForm(true)
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {showForm ? sv.common.cancel : sv.contacts.addContact}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder={sv.contacts.firstName}
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder={sv.contacts.lastName}
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder={sv.contacts.email}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder={sv.contacts.phone}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder={sv.contacts.company}
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder={sv.contacts.jobTitle}
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder={sv.contacts.address}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder={sv.contacts.city}
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder={sv.contacts.state}
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder={sv.contacts.postalCode}
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder={sv.contacts.country}
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <button type="submit" className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700">
            {editingId ? sv.contacts.edit : sv.contacts.save}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12">{sv.common.loading}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">{sv.common.create}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">{sv.contacts.email}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">{sv.contacts.company}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">{sv.contacts.phone}</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">{sv.contacts.actions}</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{`${contact.first_name} ${contact.last_name}`}</td>
                  <td className="px-6 py-3">{contact.email || '-'}</td>
                  <td className="px-6 py-3">{contact.company || '-'}</td>
                  <td className="px-6 py-3">{contact.phone || '-'}</td>
                  <td className="px-6 py-3 space-x-3">
                    <button
                      onClick={() => handleEdit(contact)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {sv.contacts.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      {sv.contacts.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
