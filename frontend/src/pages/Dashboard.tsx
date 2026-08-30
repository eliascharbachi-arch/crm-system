import { useEffect, useState } from 'react'
import { reportsAPI, dealsAPI } from '../api/services'
import { sv } from '../localization/sv'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [pipeline, setPipeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pipelineRes] = await Promise.all([
          reportsAPI.getDashboardStats(),
          reportsAPI.getSalesPipeline(),
        ])
        setStats(statsRes.data)
        setPipeline(pipelineRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="text-center py-12">{sv.common.loading}</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{sv.dashboard.title}</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-semibold">{sv.dashboard.stats.contacts}</div>
          <div className="text-3xl font-bold text-blue-600">{stats?.contacts || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-semibold">{sv.dashboard.stats.activeDeals}</div>
          <div className="text-3xl font-bold text-green-600">{stats?.activeDeals || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-semibold">{sv.dashboard.stats.dealValue}</div>
          <div className="text-3xl font-bold text-purple-600">{stats?.dealValue.toLocaleString()} SEK</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-semibold">{sv.dashboard.stats.pendingActivities}</div>
          <div className="text-3xl font-bold text-orange-600">{stats?.pendingActivities || 0}</div>
        </div>
      </div>

      {/* Sales Pipeline */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">{sv.reports.salesPipeline}</h2>
        <div className="space-y-4">
          {pipeline.map((stage) => (
            <div key={stage.stage} className="flex items-center gap-4">
              <div className="w-24">{stage.stage}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-8">
                <div
                  className="bg-blue-600 h-full rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ width: `${Math.min((stage.total_amount / 100000) * 100, 100)}%` }}
                >
                  {stage.deal_count}
                </div>
              </div>
              <div className="w-32 text-right">{stage.total_amount.toLocaleString()} SEK</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
