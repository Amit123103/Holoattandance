import { useState, useEffect } from 'react'
import { FaDownload, FaTimes } from 'react-icons/fa'

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e)
            // Update UI to notify the user they can add to home screen
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-gray-900 border border-cyan-500/50 p-4 rounded-xl shadow-2xl z-50 animate-bounce-in">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-cyan-400 font-bold text-lg mb-1">Install App</h3>
                    <p className="text-gray-300 text-sm mb-3">
                        Install Holo Auth for faster access and offline mode.
                    </p>
                    <button
                        onClick={handleInstallClick}
                        className="btn-primary py-2 px-4 text-sm w-full"
                    >
                        <FaDownload className="inline mr-2" />
                        Add to Home Screen
                    </button>
                </div>
                <button
                    onClick={() => setShowPrompt(false)}
                    className="text-gray-500 hover:text-white ml-3"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
    )
}
