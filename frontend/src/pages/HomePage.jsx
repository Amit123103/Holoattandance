import { Link } from 'react-router-dom'
import { FaUserPlus, FaFingerprint, FaUserShield } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

export default function HomePage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-6xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {t('welcome')}
                    </h1>
                    <p className="text-xl text-white/70">
                        {t('secure_tracking')}
                    </p>
                </div>

                {/* Main Options */}
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Student Registration */}
                    <Link to="/register" className="group">
                        <div className="glass-card p-8 h-full flex flex-col items-center justify-center text-center 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/50">
                            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 
                            flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <FaUserPlus className="text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">{t('student_registration')}</h2>
                            <p className="text-white/60">
                                {t('register_desc')}
                            </p>
                        </div>
                    </Link>

                    {/* Mark Attendance */}
                    <Link to="/attendance" className="group">
                        <div className="glass-card p-8 h-full flex flex-col items-center justify-center text-center 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-green-500/50">
                            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 
                            flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <FaFingerprint className="text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">{t('mark_attendance')}</h2>
                            <p className="text-white/60">
                                {t('attendance_desc')}
                            </p>
                        </div>
                    </Link>

                    {/* Admin Login */}
                    <Link to="/admin/login" className="group">
                        <div className="glass-card p-8 h-full flex flex-col items-center justify-center text-center 
                          transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50">
                            <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 
                            flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <FaUserShield className="text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">{t('admin_panel')}</h2>
                            <p className="text-white/60">
                                {t('admin_desc')}
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-white/50">
                    <p className="text-sm">
                        {t('powered_by')}
                    </p>
                </div>
            </div>
        </div>
    )
}
