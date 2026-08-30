import { useEffect, useState } from 'react'
import { reportsAPI } from '../api/services'
import { format } from 'date-fns'
import { sv } from '../localization/sv'

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null)
  const [pipeline, setPipeline] = useState<any[]>([])
  const [forecast, setForecast] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [conversionRates, setConversionRates] = useState<any[]>([])
  const [revenue, setRevenue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          statsRes,
          pipelineRes,
          forecastRes,
          activitiesRes,
          conversionRes,
          revenueRes,
        ] = await Promise.all([
          reportsAPI.getDashboardStats(),
          reportsAPI.getSalesPipeline(),
          reportsAPI.getSalesForecast(),
          reportsAPI.getActivitySummary(),
          reportsAPI.getConversionRates(),
          reportsAPI.getMonthlyRevenue(),
        ])
        setStats(statsRes.data)
        setPipeline(pipelineRes.data)
        setForecast(forecastRes.data)
        setActivities(activitiesRes.data)
        setConversionRates(conversionRes.data)
        setRevenue(revenueRes.data)
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="text-center py-12">{sv.common.loading}</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{sv.reports.title}</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-semibold">{sv.dashboard.stats.contacts}</div>
          <div className="text-3xl font-bold text-blue-600">{stats?.contacts}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-semibold">{sv.dashboard.stats.activeDeals}</div>
          <div className="text-3xl font-bold text-green-600">{stats?.activeDeals}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-semibold">{sv.dashboard.stats.dealValue}</div>
          <div className="text-3xl font-bold text-purple-600">
            {(stats?.dealValue || 0).toLocaleString()} SEK
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm font-semibold">{sv.dashboard.stats.pendingActivities}</div>
          <div className="text-3xl font-bold text-orange-600">{stats?.pendingActivities}</div>
        </div>
      </div>

      {/* Sales Pipeline Summary */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">{sv.reports.salesPipeline}</h2>
          <div className="space-y-4">
            {pipeline.map((stage) => (
              <div key={stage.stage} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{stage.stage}</p>
                  <p className="text-sm text-gray-600">{stage.deal_count} {sv.reports.dealCount}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{stage.total_amount.toLocaleString()} SEK</p>
                  <p className="text-sm text-gray-600">{sv.reports.avgAmount}: {stage.avg_amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">{sv.reports.salesForecast}</h2>
          <p className="text-2xl font-bold text-blue-600 mb-6">
            {sv.reports.avgProbability}: {forecast?.totalWeightedValue.toLocaleString()} SEK
          </p>
          <div className="space-y-4">
            {forecast?.byStage.map((stage: any) => (
              <div key={stage.stage} className="flex justify-between items-center">
                <p className="font-semibold">{stage.stage}</p>
                <p className="text-lg text-green-600">{stage.weighted_value.toLocaleString()} SEK</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">{sv.reports.activitySummary}</h2>
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.type} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{activity.type}</p>
                  <p className="text-sm text-gray-600">
                    {activity.completed} {sv.common.update} {activity.count} {sv.reports.completedActivities}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{activity.count} {sv.common.confirm}</p>
                  <p className="text-sm text-green-600">
                    {((activity.completed / activity.count) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">{sv.reports.conversionRates}</h2>
          <div className="space-y-3">
            {conversionRates.map((rate) => (
              <div key={rate.stage} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{rate.stage}</p>
                  <p className="text-sm text-gray-600">{rate.total_deals} {sv.reports.dealCount}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{rate.won_deals} {sv.deals.stages.closed_won}</p>
                  <p className="text-lg text-green-600">{rate.conversion_rate}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">{sv.reports.monthlyRevenue}</h2>
        <div className="space-y-4">
          {revenue.map((month) => (
            <div key={month.month} className="flex items-center gap-4">
              <div className="w-32">
                {month.month ? format(new Date(month.month), 'MMM yyyy') : 'N/A'}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-8">
                <div
                  className="bg-green-600 h-full rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{
                    width: `${Math.min(
                      (month.revenue / Math.max(...revenue.map((r) => r.revenue), 1)) * 100,
                      100
                    )}%`,
                  }}
                >
                  {month.revenue > 0 && month.revenue.toLocaleString()}
                </div>
              </div>
              <div className="w-32 text-right">
                <p className="font-semibold">{month.revenue.toLocaleString()} SEK</p>
                <p className="text-sm text-gray-600">{month.deal_count} {sv.reports.dealCount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
