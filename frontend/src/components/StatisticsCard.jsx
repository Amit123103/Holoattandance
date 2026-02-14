export default function StatisticsCard({ icon: Icon, title, value, subtitle, color = "cyan" }) {
    const colorClasses = {
        cyan: "from-cyan-600 to-blue-600",
        green: "from-green-600 to-emerald-600",
        purple: "from-purple-600 to-pink-600",
        orange: "from-orange-600 to-red-600",
        blue: "from-blue-600 to-indigo-600"
    }

    const iconColorClasses = {
        cyan: "text-cyan-400",
        green: "text-green-400",
        purple: "text-purple-400",
        orange: "text-orange-400",
        blue: "text-blue-400"
    }

    return (
        <div className="glass-card p-6 hover:scale-105 transition-transform">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
                    <Icon className="text-2xl text-white" />
                </div>
            </div>
            <h3 className="text-sm text-white/70 mb-1">{title}</h3>
            <p className="text-3xl font-bold mb-1">{value}</p>
            {subtitle && (
                <p className="text-sm text-white/50">{subtitle}</p>
            )}
        </div>
    )
}
