import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function HourlyDistributionChart({ data, title = "Hourly Distribution" }) {
    if (!data || data.labels.length === 0) {
        return (
            <div className="glass-card p-6 text-center">
                <p className="text-white/50">No data available</p>
            </div>
        )
    }

    // Transform data for Recharts
    const chartData = data.labels.map((label, index) => ({
        hour: label,
        count: data.data[index]
    }))

    // Filter out hours with zero attendance for cleaner visualization
    const filteredData = chartData.filter(item => item.count > 0)

    return (
        <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredData.length > 0 ? filteredData : chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="hour"
                        stroke="rgba(255,255,255,0.7)"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.7)"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px'
                        }}
                    />
                    <Legend />
                    <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                        name="Attendance Count"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
