import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUsers, FaCalendarCheck, FaChartLine, FaClock, FaArrowLeft } from 'react-icons/fa'
import api from '../api/axiosConfig'
import AttendanceTrendChart from '../components/AttendanceTrendChart'
import HourlyDistributionChart from '../components/HourlyDistributionChart'
import StatisticsCard from '../components/StatisticsCard'

export default function AnalyticsDashboard() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [overview, setOverview] = useState(null)
    const [trendData, setTrendData] = useState(null)
    const [hourlyData, setHourlyData] = useState(null)
    const [trendDays, setTrendDays] = useState(7)

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            navigate('/admin/login')
            return
        }
        fetchAnalytics()
    }, [trendDays])

    const fetchAnalytics = async () => {
        setLoading(true)
        const token = localStorage.getItem('adminToken')

        try {
            // Fetch all analytics data
            const [overviewRes, trendRes, hourlyRes] = await Promise.all([
                api.get('/api/admin/analytics/overview'),
                api.get(`/api/admin/analytics/attendance-trend?days=${trendDays}`),
                api.get('/api/admin/analytics/hourly-distribution')
            ])

            setOverview(overviewRes.data)
            setTrendData(trendRes.data)
            setHourlyData(hourlyRes.data)
        } catch (err) {
            console.error('Failed to fetch analytics:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading analytics...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="btn-secondary"
                        >
                            <FaArrowLeft className="inline mr-2" />
                            Back
                        </button>
                        <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
                    </div>
                </div>

                {/* Statistics Cards */}
                {overview && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatisticsCard
                            icon={FaUsers}
                            title="Total Students"
                            value={overview.total_students}
                            subtitle="Registered"
                            color="cyan"
                        />
                        <StatisticsCard
                            icon={FaCalendarCheck}
                            title="Today's Attendance"
                            value={overview.attendance_today}
                            subtitle={`${overview.attendance_rate_today}% attendance rate`}
                            color="green"
                        />
                        <StatisticsCard
                            icon={FaChartLine}
                            title="This Week"
                            value={overview.attendance_week}
                            subtitle="Total attendance"
                            color="purple"
                        />
                        <StatisticsCard
                            icon={FaClock}
                            title="This Month"
                            value={overview.attendance_month}
                            subtitle="Total attendance"
                            color="orange"
                        />
                    </div>
                )}

                {/* Trend Period Selector */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTrendDays(7)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${trendDays === 7
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                    >
                        Last 7 Days
                    </button>
                    <button
                        onClick={() => setTrendDays(14)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${trendDays === 14
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                    >
                        Last 14 Days
                    </button>
                    <button
                        onClick={() => setTrendDays(30)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${trendDays === 30
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                    >
                        Last 30 Days
                    </button>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {trendData && (
                        <AttendanceTrendChart
                            data={trendData}
                            title={`Attendance Trend (Last ${trendDays} Days)`}
                        />
                    )}
                    {hourlyData && (
                        <HourlyDistributionChart
                            data={hourlyData}
                            title="Attendance by Hour"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
