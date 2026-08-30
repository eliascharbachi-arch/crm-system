import client from './client'

// Auth
export const authAPI = {
  register: (email: string, password: string, firstName: string, lastName: string) =>
    client.post('/auth/register', { email, password, firstName, lastName }),
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),
}

// Contacts
export const contactsAPI = {
  getAll: () => client.get('/contacts'),
  getById: (id: string) => client.get(`/contacts/${id}`),
  create: (data: any) => client.post('/contacts', data),
  update: (id: string, data: any) => client.put(`/contacts/${id}`, data),
  delete: (id: string) => client.delete(`/contacts/${id}`),
}

// Deals
export const dealsAPI = {
  getAll: (params?: any) => client.get('/deals', { params }),
  getById: (id: string) => client.get(`/deals/${id}`),
  getPipeline: () => client.get('/deals/pipeline/summary'),
  create: (data: any) => client.post('/deals', data),
  update: (id: string, data: any) => client.put(`/deals/${id}`, data),
  delete: (id: string) => client.delete(`/deals/${id}`),
}

// Activities
export const activitiesAPI = {
  getAll: (params?: any) => client.get('/activities', { params }),
  getById: (id: string) => client.get(`/activities/${id}`),
  getUpcoming: () => client.get('/activities/upcoming/today'),
  create: (data: any) => client.post('/activities', data),
  update: (id: string, data: any) => client.put(`/activities/${id}`, data),
  delete: (id: string) => client.delete(`/activities/${id}`),
}

// Reports
export const reportsAPI = {
  getDashboardStats: () => client.get('/reports/dashboard/stats'),
  getSalesPipeline: () => client.get('/reports/sales/pipeline'),
  getSalesForecast: () => client.get('/reports/sales/forecast'),
  getActivitySummary: () => client.get('/reports/activities/summary'),
  getConversionRates: () => client.get('/reports/sales/conversion-rates'),
  getMonthlyRevenue: () => client.get('/reports/revenue/monthly'),
}
