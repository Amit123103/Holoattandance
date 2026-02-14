import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import WebcamCapture from '../components/WebcamCapture'
import api from '../api/axiosConfig'

export default function AttendancePage() {
    const navigate = useNavigate()
    const [step, setStep] = useState(1) // 1: Eye Scan, 2: Thumb Scan, 3: Result
    const [eyeImage, setEyeImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    const handleEyeCapture = (imageData) => {
        setEyeImage(imageData)
        setStep(2)
    }

    const handleThumbCapture = async (imageData) => {
        setLoading(true)
        setError('')

        try {
            const response = await api.post('/api/verify', {
                eye_image: eyeImage,
                thumb_image: imageData
            })

            setResult(response.data)
            setStep(3)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to connect to server')
            setResult({ success: false })
            setStep(3)
        } finally {
            setLoading(false)
        }
    }

    const resetFlow = () => {
        setStep(1)
        setEyeImage(null)
        setResult(null)
        setError('')
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => step === 1 ? navigate('/') : resetFlow()}
                        className="btn-secondary mr-4"
                    >
                        <FaArrowLeft className="inline mr-2" />
                        {step === 3 ? 'Try Again' : 'Back'}
                    </button>
                    <h1 className="text-4xl font-bold">Mark Attendance</h1>
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className={`flex items-center ${step >= 1 ? 'text-green-400' : 'text-white/30'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                            ${step >= 1 ? 'border-green-400 bg-green-400/20' : 'border-white/30'}`}>
                                1
                            </div>
                            <span className="ml-2 hidden sm:inline">Eye Scan</span>
                        </div>
                        <div className={`w-16 h-1 ${step >= 2 ? 'bg-green-400' : 'bg-white/30'}`}></div>
                        <div className={`flex items-center ${step >= 2 ? 'text-green-400' : 'text-white/30'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                            ${step >= 2 ? 'border-green-400 bg-green-400/20' : 'border-white/30'}`}>
                                2
                            </div>
                            <span className="ml-2 hidden sm:inline">Thumb Scan</span>
                        </div>
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-green-400' : 'bg-white/30'}`}></div>
                        <div className={`flex items-center ${step >= 3 ? 'text-green-400' : 'text-white/30'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                            ${step >= 3 ? 'border-green-400 bg-green-400/20' : 'border-white/30'}`}>
                                3
                            </div>
                            <span className="ml-2 hidden sm:inline">Result</span>
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
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-center">Step 1: Eye Verification</h2>
                            <p className="text-white/70 text-center mb-6">
                                Position your face in the frame for iris scanning
                            </p>
                            <WebcamCapture
                                onCapture={handleEyeCapture}
                                detectionType="eye"
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4 text-center">Step 2: Thumb Verification</h2>
                            <p className="text-white/70 text-center mb-6">
                                Place your thumb close to the camera
                            </p>
                            <WebcamCapture
                                onCapture={handleThumbCapture}
                                detectionType="thumb"
                                loading={loading}
                            />
                        </div>
                    )}

                    {step === 3 && result && (
                        <div className="text-center py-12">
                            {result.success ? (
                                <>
                                    <FaCheckCircle className="text-6xl text-green-400 mx-auto mb-6 animate-pulse-slow" />
                                    <h2 className="text-3xl font-bold mb-4 text-green-400">Attendance Marked Successfully!</h2>
                                    <div className="glass-card p-6 max-w-md mx-auto mb-8">
                                        <p className="text-xl mb-2">
                                            <span className="text-white/70">Name:</span>{' '}
                                            <span className="font-bold">{result.student?.name}</span>
                                        </p>
                                        <p className="text-lg text-white/70">
                                            <span>Reg No:</span>{' '}
                                            <span className="font-semibold">{result.student?.registration_number}</span>
                                        </p>
                                        <p className="text-sm text-white/50 mt-4">
                                            Time: {new Date().toLocaleString()}
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FaTimesCircle className="text-6xl text-red-400 mx-auto mb-6" />
                                    <h2 className="text-3xl font-bold mb-4 text-red-400">Verification Failed</h2>
                                    <p className="text-white/70 mb-8">
                                        Student not registered or biometric data does not match
                                    </p>
                                </>
                            )}

                            <div className="flex gap-4 justify-center">
                                <button onClick={resetFlow} className="btn-secondary">
                                    Mark Another Attendance
                                </button>
                                <button onClick={() => navigate('/')} className="btn-primary">
                                    Return to Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
