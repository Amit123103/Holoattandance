import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSignOutAlt, FaUsers, FaClipboardList, FaDownload, FaEye, FaFingerprint, FaSearch, FaChevronLeft, FaChevronRight, FaChartBar, FaCloudUploadAlt } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import { useNetwork } from '../context/NetworkContext'
import api from '../api/axiosConfig'
import CSVUpload from '../components/CSVUpload'
import LiveActivityFeed from '../components/LiveActivityFeed'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const { pendingCount, isOnline } = useNetwork()
    const [activeTab, setActiveTab] = useState('students')
    const [students, setStudents] = useState([])
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
    const [showModal, setShowModal] = useState(false)

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        const token = localStorage.getItem('adminToken')
        if (!token) {
            navigate('/admin/login')
            return
        }
        fetchData()
    }, [activeTab])

    // Reset pagination when tab changes
    useEffect(() => {
        setCurrentPage(1)
        setSearchTerm('')
        setDateFrom('')
        setDateTo('')
    }, [activeTab])

    const fetchData = async () => {
        setLoading(true)

        try {
            if (activeTab === 'students') {
                const response = await api.get('/api/admin/students')
                setStudents(response.data.students || [])
            } else {
                const response = await api.get('/api/admin/attendance')
                setAttendance(response.data.attendance || [])
            }
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('refreshToken')
        navigate('/')
    }

    const handleExport = async () => {
        try {
            const response = await api.get('/api/admin/attendance/export', {
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `attendance_${new Date().toISOString().split('T')[0]}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error('Export failed:', err)
        }
    }

    const viewStudentDetails = (student) => {
        setSelectedStudent(student)
        setShowModal(true)
    }

    // Filter and search logic
    const getFilteredStudents = () => {
        return students.filter(student => {
            const matchesSearch = searchTerm === '' ||
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
            return matchesSearch
        })
    }

    const getFilteredAttendance = () => {
        return attendance.filter(record => {
            const matchesSearch = searchTerm === '' ||
                record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.registration_number.toLowerCase().includes(searchTerm.toLowerCase())

            const recordDate = new Date(record.timestamp).toISOString().split('T')[0]
            const matchesDateFrom = dateFrom === '' || recordDate >= dateFrom
            const matchesDateTo = dateTo === '' || recordDate <= dateTo

            return matchesSearch && matchesDateFrom && matchesDateTo
        })
    }

    // Pagination logic
    const getPaginatedData = (data) => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return data.slice(startIndex, endIndex)
    }

    const getTotalPages = (data) => {
        return Math.ceil(data.length / itemsPerPage)
    }

    const filteredStudents = getFilteredStudents()
    const filteredAttendance = getFilteredAttendance()
    const paginatedStudents = getPaginatedData(filteredStudents)
    const paginatedAttendance = getPaginatedData(filteredAttendance)

    const Pagination = ({ totalPages }) => {
        if (totalPages <= 1) return null

        return (
            <div className="flex items-center justify-center gap-2 mt-6">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronLeft />
                </button>

                <span className="px-4 py-2">
                    {t('showing')} {currentPage} {t('of')} {totalPages}
                </span>

                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronRight />
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 id="dashboard-title" className="text-4xl font-bold">{t('dashboard')}</h1>
                    <div className="flex gap-3">
                        {pendingCount > 0 && (
                            <div className="bg-yellow-500/20 text-yellow-100 px-4 py-2 rounded-lg flex items-center gap-2 border border-yellow-500/50 animate-pulse">
                                <FaCloudUploadAlt />
                                {pendingCount} Pending Sync
                            </div>
                        )}
                        <button
                            id="analytics-btn"
                            onClick={() => navigate('/admin/analytics')}
                            className="btn-primary"
                        >
                            <FaChartBar className="inline mr-2" />
                            {t('analytics')}
                        </button>
                        <button onClick={handleLogout} className="btn-secondary">
                            <FaSignOutAlt className="inline mr-2" />
                            {t('logout')}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 mb-8">
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'students'
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                    >
                        <FaUsers className="inline mr-2" />
                        {t('student_records')}
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'attendance'
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                    >
                        <FaClipboardList className="inline mr-2" />
                        {t('attendance_logs')}
                    </button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Panel (3 cols) */}
                    <div className="lg:col-span-3">
                        <div className="glass-card p-6">
                            {activeTab === 'students' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">{t('registered_students')}</h2>
                                        <div id="csv-upload-btn">
                                            <CSVUpload onUploadComplete={fetchData} />
                                        </div>
                                    </div>

                                    {/* Search Bar */}
                                    <div className="mb-6">
                                        <div className="relative">
                                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                                            <input
                                                type="text"
                                                placeholder={t('search_placeholder')}
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value)
                                                    setCurrentPage(1)
                                                }}
                                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-400"
                                            />
                                        </div>
                                        <p className="text-sm text-white/50 mt-2">
                                            {t('showing')} {filteredStudents.length} {t('of')} {students.length} {t('records')}
                                        </p>
                                    </div>

                                    {loading ? (
                                        <p className="text-center text-white/70 py-12">Loading...</p>
                                    ) : filteredStudents.length === 0 ? (
                                        <p className="text-center text-white/70 py-12">
                                            {searchTerm ? 'No students found matching your search' : t('no_students')}
                                        </p>
                                    ) : (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-white/20">
                                                            <th className="text-left py-3 px-4">{t('name')}</th>
                                                            <th className="text-left py-3 px-4">{t('reg_no')}</th>
                                                            <th className="text-left py-3 px-4">{t('reg_date')}</th>
                                                            <th className="text-left py-3 px-4">{t('actions')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedStudents.map((student) => (
                                                            <tr key={student.id} className="border-b border-white/10 hover:bg-white/5">
                                                                <td className="py-3 px-4">{student.name}</td>
                                                                <td className="py-3 px-4">{student.registration_number}</td>
                                                                <td className="py-3 px-4">
                                                                    {new Date(student.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <button
                                                                        onClick={() => viewStudentDetails(student)}
                                                                        className="text-cyan-400 hover:text-cyan-300"
                                                                    >
                                                                        {t('view_details')}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <Pagination totalPages={getTotalPages(filteredStudents)} />
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'attendance' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold">{t('attendance_logs')}</h2>
                                        <button onClick={handleExport} className="btn-primary">
                                            <FaDownload className="inline mr-2" />
                                            {t('export_excel')}
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                                        <div className="relative">
                                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                                            <input
                                                type="text"
                                                placeholder={t('search_placeholder')}
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value)
                                                    setCurrentPage(1)
                                                }}
                                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-400"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => {
                                                    setDateFrom(e.target.value)
                                                    setCurrentPage(1)
                                                }}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-400"
                                                placeholder={t('from_date')}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => {
                                                    setDateTo(e.target.value)
                                                    setCurrentPage(1)
                                                }}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-400"
                                                placeholder={t('to_date')}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/50 mb-4">
                                        {t('showing')} {filteredAttendance.length} {t('of')} {attendance.length} {t('records')}
                                    </p>

                                    {loading ? (
                                        <p className="text-center text-white/70 py-12">Loading...</p>
                                    ) : filteredAttendance.length === 0 ? (
                                        <p className="text-center text-white/70 py-12">
                                            {searchTerm || dateFrom || dateTo ? 'No records found matching your filters' : t('no_records')}
                                        </p>
                                    ) : (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="border-b border-white/20">
                                                            <th className="text-left py-3 px-4">{t('name')}</th>
                                                            <th className="text-left py-3 px-4">{t('reg_no')}</th>
                                                            <th className="text-left py-3 px-4">{t('date_time')}</th>
                                                            <th className="text-left py-3 px-4">{t('status')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {paginatedAttendance.map((record) => (
                                                            <tr key={record.id} className="border-b border-white/10 hover:bg-white/5">
                                                                <td className="py-3 px-4">{record.student_name}</td>
                                                                <td className="py-3 px-4">{record.registration_number}</td>
                                                                <td className="py-3 px-4">
                                                                    {new Date(record.timestamp).toLocaleString()}
                                                                </td>
                                                                <td className="py-3 px-4">
                                                                    <span className={`px-3 py-1 rounded-full text-sm ${record.verification_status === 'success'
                                                                        ? 'bg-green-500/20 text-green-400'
                                                                        : 'bg-red-500/20 text-red-400'
                                                                        }`}>
                                                                        {record.verification_status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <Pagination totalPages={getTotalPages(filteredAttendance)} />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Side Panel (1 col) */}
                    <div className="lg:col-span-1" id="live-feed-panel">
                        <LiveActivityFeed />
                    </div>
                </div>
            </div>

            {/* Student Details Modal */}
            {showModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
                    onClick={() => setShowModal(false)}>
                    <div className="glass-card p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-6">Student Details</h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <span className="text-white/70">Name:</span>{' '}
                                <span className="font-semibold">{selectedStudent.name}</span>
                            </div>
                            <div>
                                <span className="text-white/70">Registration Number:</span>{' '}
                                <span className="font-semibold">{selectedStudent.registration_number}</span>
                            </div>
                            <div>
                                <span className="text-white/70">Registration Date:</span>{' '}
                                <span className="font-semibold">
                                    {new Date(selectedStudent.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center">
                                    <FaEye className="mr-2 text-cyan-400" />
                                    Eye Scan
                                </h3>
                                {selectedStudent.eye_image_path ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${selectedStudent.eye_image_path}`}
                                        alt="Eye scan"
                                        className="w-full rounded-lg border border-white/20"
                                    />
                                ) : (
                                    <p className="text-white/50">No image available</p>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center">
                                    <FaFingerprint className="mr-2 text-cyan-400" />
                                    Thumb Scan
                                </h3>
                                {selectedStudent.thumb_image_path ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${selectedStudent.thumb_image_path}`}
                                        alt="Thumb scan"
                                        className="w-full rounded-lg border border-white/20"
                                    />
                                ) : (
                                    <p className="text-white/50">No image available</p>
                                )}
                            </div>
                        </div>

                        <button onClick={() => setShowModal(false)} className="btn-primary w-full">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
