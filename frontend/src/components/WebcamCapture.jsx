import { useRef, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import { FaCamera, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaFingerprint, FaEye } from 'react-icons/fa'
import { useSpeech } from '../utils/useSpeech'
import Tooltip from './Tooltip'

export default function WebcamCapture({ onCapture, detectionType, loading = false }) {
    const webcamRef = useRef(null)
    const [isReady, setIsReady] = useState(false)
    const [countdown, setCountdown] = useState(null)
    const [livenessMode, setLivenessMode] = useState(false)
    const [livenessChallenge, setLivenessChallenge] = useState(null)
    const [livenessStatus, setLivenessStatus] = useState(null) // 'verifying', 'success', 'fail'

    const { speak } = useSpeech()

    const [qualityMetrics, setQualityMetrics] = useState({
        brightness: 'checking',
        blur: 'checking',
        distance: 'checking'
    })

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: 'user'
    }

    // Announce mode on mount
    useEffect(() => {
        if (isReady) {
            const msg = detectionType === 'eye'
                ? "Face aligned. Ready for iris scan."
                : "Place your thumb on the scanner.";
            speak(msg);
        }
    }, [isReady, detectionType, speak]);

    // Check image quality periodically
    useEffect(() => {
        if (!isReady || countdown !== null) return

        const interval = setInterval(() => {
            checkImageQuality()
        }, 500)

        return () => clearInterval(interval)
    }, [isReady, countdown])

    const checkImageQuality = () => {
        if (!webcamRef.current) return

        const video = webcamRef.current.video
        if (!video) return

        // Create canvas to analyze frame
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Check brightness
        let totalBrightness = 0
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            totalBrightness += (r + g + b) / 3
        }
        const avgBrightness = totalBrightness / (data.length / 4)

        let brightnessStatus = 'good'
        if (avgBrightness < 60) brightnessStatus = 'dark'
        else if (avgBrightness > 200) brightnessStatus = 'bright'

        // Simple blur detection using edge detection
        let edgeCount = 0
        for (let i = 0; i < data.length - 4; i += 4) {
            const diff = Math.abs(data[i] - data[i + 4])
            if (diff > 30) edgeCount++
        }
        const edgeRatio = edgeCount / (data.length / 4)
        const blurStatus = edgeRatio > 0.1 ? 'good' : 'blurry'

        // Distance check (based on face size approximation)
        const centerBrightness = getCenterRegionBrightness(data, canvas.width, canvas.height)
        let distanceStatus = 'good'
        if (centerBrightness < 50) distanceStatus = 'far'
        else if (centerBrightness > 220) distanceStatus = 'close'

        setQualityMetrics({
            brightness: brightnessStatus,
            blur: blurStatus,
            distance: distanceStatus
        })
    }

    const getCenterRegionBrightness = (data, width, height) => {
        const centerX = Math.floor(width / 2)
        const centerY = Math.floor(height / 2)
        const regionSize = 50

        let total = 0
        let count = 0

        for (let y = centerY - regionSize; y < centerY + regionSize; y++) {
            for (let x = centerX - regionSize; x < centerX + regionSize; x++) {
                const i = (y * width + x) * 4
                if (i >= 0 && i < data.length) {
                    total += (data[i] + data[i + 1] + data[i + 2]) / 3
                    count++
                }
            }
        }

        return count > 0 ? total / count : 0
    }

    // Liveness Logic
    const startLivenessCheck = async () => {
        if (!webcamRef.current) return

        // Skip liveness for fingerprint (thumb)
        if (detectionType !== 'eye') {
            handleCapture()
            return
        }

        speak("Security Check initiated. Please follow the instructions.")
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/liveness/challenge`)
            const data = await res.json()
            setLivenessChallenge(data.challenge)
            setLivenessMode(true)
            setLivenessStatus(null)

            // Announce challenge
            setTimeout(() => {
                if (data.challenge === 'LOOK_LEFT') speak("Please turn your head to the left.")
                else if (data.challenge === 'LOOK_RIGHT') speak("Please turn your head to the right.")
                else if (data.challenge === 'CENTER') speak("Please look steadily at the camera.")
            }, 500)

        } catch (e) {
            console.error("Liveness init failed", e)
            handleCapture() // Fallback
        }
    }

    const verifyLivenessAction = async () => {
        setLivenessStatus('verifying')
        const imageSrc = webcamRef.current.getScreenshot()

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/liveness/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageSrc, challenge: livenessChallenge })
            })
            const result = await res.json()

            if (result.verified) {
                setLivenessMode(false)
                speak("Verification successful. Capturing now.")
                handleCapture() // Proceed to actual capture
            } else {
                setLivenessStatus('fail')
                speak("Verification failed. Please try again.")
                alert(`Liveness Check Failed: ${result.message}`)
                setLivenessMode(false)
            }
        } catch (e) {
            console.error("Liveness verify error", e)
            setLivenessMode(false)
        }
    }

    const handleCapture = () => {
        if (!webcamRef.current) return

        // Check if quality is acceptable
        const hasIssues = qualityMetrics.brightness !== 'good' ||
            qualityMetrics.blur !== 'good' ||
            qualityMetrics.distance !== 'good'

        if (hasIssues) {
            const proceed = window.confirm(
                'Image quality is not optimal. Do you want to capture anyway?'
            )
            if (!proceed) return
        }

        // Start countdown
        setCountdown(3)
        // speak("Three... Two... One...") // Optional, might clash with interval
        const countInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countInterval)
                    captureImage()
                    return null
                }
                return prev - 1
            })
        }, 1000)
    }

    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot()
        if (imageSrc) {
            // Play sound effect could go here
            onCapture(imageSrc)
        }
    }

    const getQualityIcon = (status) => {
        if (status === 'good') return <FaCheckCircle className="text-green-400" />
        if (status === 'checking') return <FaSpinner className="text-yellow-400 animate-spin" />
        return <FaExclamationTriangle className="text-yellow-400" />
    }

    const getQualityMessage = () => {
        const messages = []

        if (qualityMetrics.brightness === 'dark') {
            messages.push('⚠️ Too dark - increase lighting')
        } else if (qualityMetrics.brightness === 'bright') {
            messages.push('⚠️ Too bright - reduce lighting')
        }

        if (qualityMetrics.blur === 'blurry') {
            messages.push('⚠️ Image is blurry - hold steady')
        }

        if (qualityMetrics.distance === 'far') {
            messages.push('⚠️ Move closer to camera')
        } else if (qualityMetrics.distance === 'close') {
            messages.push('⚠️ Move back from camera')
        }

        if (messages.length === 0) {
            return detectionType === 'eye'
                ? '✅ Face aligned - ready for mesh analysis!'
                : '✅ Fingerprint clear - ready to scan!'
        }

        return messages.join(' • ')
    }

    const isQualityGood = qualityMetrics.brightness === 'good' &&
        qualityMetrics.blur === 'good' &&
        qualityMetrics.distance === 'good'

    return (
        <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/50 bg-black group">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMedia={() => setIsReady(true)}
                    className="w-full opacity-90 group-hover:opacity-100 transition-opacity"
                />

                {/* Scanning Overlay */}
                {isReady && (
                    <div className="scan-overlay pointer-events-none">
                        {/* Detection Frame */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {detectionType === 'eye' ? (
                                <div className="relative">
                                    {/* Face Mesh Simulation Overlay */}
                                    <div className="w-64 h-64 border border-cyan-400/30 rounded-full animate-pulse-slow absolute -top-8 -left-8"></div>
                                    <div className="w-48 h-48 border border-cyan-400/50 rounded-full animate-pulse-slow absolute top-0 left-0"></div>

                                    {/* Central Eye Focus */}
                                    <div className="w-64 h-32 border-2 border-cyan-400 rounded-lg relative overflow-hidden bg-cyan-900/10">
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

                                        {/* Scanning Grid */}
                                        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                                        <div className="scan-line-horizontal"></div>
                                    </div>
                                    <p className="text-cyan-400 text-xs text-center mt-2 font-mono">FaceMesh Tracking Active</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="w-48 h-64 border-2 border-green-400 rounded-lg relative overflow-hidden bg-green-900/10">
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400"></div>
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400"></div>
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400"></div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400"></div>
                                        <div className="scan-line-vertical"></div>
                                    </div>
                                    <p className="text-green-400 text-xs text-center mt-2 font-mono">Ridge Detection Active</p>
                                </div>
                            )}
                        </div>

                        {/* Countdown */}
                        {countdown && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                                <div className="text-9xl font-bold text-white animate-ping-once">
                                    {countdown}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
                        <FaSpinner className="text-4xl text-cyan-400 animate-spin" />
                        <p className="text-cyan-400 mt-4 ml-2">Initializing Camera...</p>
                    </div>
                )}
            </div>

            {/* Quality Indicators */}
            {isReady && !countdown && !livenessMode && (
                <div className={`glass-card p-4 border-l-4 ${isQualityGood ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                            {getQualityIcon(qualityMetrics.brightness)}
                            <span className="text-xs uppercase tracking-wider text-white/70">Lighting</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {getQualityIcon(qualityMetrics.blur)}
                            <span className="text-xs uppercase tracking-wider text-white/70">Clarity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {getQualityIcon(qualityMetrics.distance)}
                            <span className="text-xs uppercase tracking-wider text-white/70">Distance</span>
                        </div>
                    </div>
                    <div className="text-sm text-center font-medium py-1 bg-white/5 rounded">
                        {getQualityMessage()}
                    </div>
                </div>
            )}

            {/* Liveness Challenge Overlay */}
            {livenessMode && (
                <div className="glass-card p-6 border-2 border-cyan-500 text-center animate-bounce-in">
                    <h3 className="text-xl font-bold text-cyan-400 mb-2 flex items-center justify-center gap-2">
                        Security Check 🛡️
                        <Tooltip text="We need to verify you are a real person. Follow the movement instructions on screen." />
                    </h3>
                    <p className="text-white mb-4 text-lg">
                        {livenessChallenge === 'LOOK_LEFT' && "⬅️ Turn your head LEFT"}
                        {livenessChallenge === 'LOOK_RIGHT' && "➡️ Turn your head RIGHT"}
                        {livenessChallenge === 'CENTER' && "😐 Look Straight Ahead"}
                    </p>

                    {livenessStatus === 'verifying' ? (
                        <div className="flex items-center justify-center gap-2 text-yellow-400">
                            <FaSpinner className="animate-spin" /> Verifying Action...
                        </div>
                    ) : (
                        <button
                            onClick={verifyLivenessAction}
                            className="btn-primary w-full py-3"
                        >
                            I'm doing it! (Verify)
                        </button>
                    )}
                </div>
            )}

            {/* Capture Button */}
            {!livenessMode && (
                <button
                    onClick={startLivenessCheck}
                    disabled={!isReady || loading || countdown !== null}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isQualityGood
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-3">
                            <FaSpinner className="animate-spin text-xl" />
                            <span>Analyzing Biometrics...</span>
                        </div>
                    ) : countdown !== null ? (
                        <span className="animate-pulse">Capturing in {countdown}...</span>
                    ) : (
                        <div className="flex items-center justify-center gap-3">
                            {detectionType === 'eye' ? <FaEye className="text-xl" /> : <FaFingerprint className="text-xl" />}
                            <span>Capture {detectionType === 'eye' ? 'Eye' : 'Thumb'} Scan</span>
                        </div>
                    )}
                </button>
            )}
        </div>
    )
}

