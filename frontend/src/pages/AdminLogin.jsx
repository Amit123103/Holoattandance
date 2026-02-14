import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaUserShield } from 'react-icons/fa'
import api from '../api/axiosConfig'

export default function AdminLogin() {
    const navigate = useNavigate()
    const [credentials, setCredentials] = useState({ username: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/api/admin/login', credentials)

            if (response.data.success) {
                localStorage.setItem('adminToken', response.data.access_token)
                localStorage.setItem('refreshToken', response.data.refresh_token)
                navigate('/admin/dashboard')
            } else {
                setError('Invalid credentials')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <button
                    onClick={() => navigate('/')}
                    className="btn-secondary mb-8"
                >
                    <FaArrowLeft className="inline mr-2" />
                    Back to Home
                </button>

                <div className="glass-card p-8">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 
                          flex items-center justify-center">
                            <FaUserShield className="text-4xl" />
                        </div>
                        <h1 className="text-3xl font-bold">Admin Login</h1>
                        <p className="text-white/60 mt-2">Access the admin dashboard</p>
                    </div>

                    {error && (
                        <div className="glass-card p-4 mb-6 border-red-500 bg-red-500/10">
                            <p className="text-red-400 text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                className="input-field w-full"
                                placeholder="Enter username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                className="input-field w-full"
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
