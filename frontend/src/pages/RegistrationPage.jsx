import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaEye, FaFingerprint, FaCheckCircle } from 'react-icons/fa'
import WebcamCapture from '../components/WebcamCapture'
import api from '../api/axiosConfig'

export default function RegistrationPage() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: Form, 2: Eye Scan, 3: Thumb Scan, 4: Success
    const [formData, setFormData] = useState({ name: '', regNo: '' })
    const [eyeImage, setEyeImage] = useState(null)
    const [thumbImage, setThumbImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleFormSubmit = (e) => {
        e.preventDefault()
        if (!formData.name || !formData.regNo) {
            setError('Please fill in all fields')
            return
        }
        setError('')
        setStep(2)
    }

    const handleEyeCapture = (imageData) => {
        setEyeImage(imageData)
        setStep(3)
    }

    const handleThumbCapture = async (imageData) => {
        setThumbImage(imageData)
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/api/register', {
                name: formData.name,
                registration_number: formData.regNo,
                eye_image: eyeImage,
                thumb_image: imageData
            })

            if (response.data.success) {
                setStep(4)
            } else {
                setError(response.data.message || 'Registration failed')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to connect to server')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}
                        className="btn-secondary mr-4"
                    >
                        <FaArrowLeft className="inline mr-2" />
                        Back
                    </button>
                    <h1 className="text-4xl font-bold">Student Registration</h1>
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center ${step >= 1 ? 'text-cyan-400' : 'text-white/30'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                            ${step >= 1 ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/30'}`}>
                                1
                            </div>
                            <span className="ml-2 hidden sm:inline">Details</span>
                        </div>
                        <div className={`w-16 h-1 ${step >= 2 ? 'bg-cyan-400' : 'bg-white/30'}`}></div>
                        <div className={`flex items-center ${step >= 2 ? 'text-cyan-400' : 'text-white/30'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                            ${step >= 2 ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/30'}`}>
                                <FaEye />
                            </div>
                            <span className="ml-2 hidden sm:inline">Eye Scan</span>
                        </div>
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-cyan-400' : 'bg-white/30'}`}></div>
                        <div className={`flex items-center ${step >= 3 ? 'text-cyan-400' : 'text-white/30'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                            ${step >= 3 ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/30'}`}>
                                <FaFingerprint />
                            </div>
                            <span className="ml-2 hidden sm:inline">Thumb Scan</span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="glass-card p-4 mb-6 border-red-500 bg-red-500/10">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Step Content */}
                <div className="glass-card p-8">
                    {step === 1 && (
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Student Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field w-full"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Registration Number</label>
                                <input
                                    type="text"
                                    value={formData.regNo}
                                    onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                                    className="input-field w-full"
                                    placeholder="Enter registration number"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full">
                                Continue to Eye Scan
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-center">Eye Scan</h2>
                            <p className="text-white/70 text-center mb-6">
                                Position your face in the frame and move closer for a clear iris scan
                            </p>
                            <WebcamCapture
                                onCapture={handleEyeCapture}
                                detectionType="eye"
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-center">Thumb Scan</h2>
                            <p className="text-white/70 text-center mb-6">
                                Place your thumb close to the camera for fingerprint capture
                            </p>
                            <WebcamCapture
                                onCapture={handleThumbCapture}
                                detectionType="thumb"
                                loading={loading}
                            />
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center py-12">
                            <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-6" />
                            <h2 className="text-3xl font-bold mb-4">Successfully Registered!</h2>
                            <p className="text-white/70 mb-8">
                                {formData.name} has been registered with biometric data
                            </p>
                            <button onClick={() => navigate('/')} className="btn-primary">
                                Return to Home
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
