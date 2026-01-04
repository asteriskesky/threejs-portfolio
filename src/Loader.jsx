import { useEffect, useState } from 'react'
import './loader.css'

export default function Loader({ progress = 0, isLoading = true }) {
    const [messageIndex, setMessageIndex] = useState(0)

    const messages = [
        "LOADING PORTFOLIO",
        "BOOTING SYSTEM",
        "INITIALIZING WORKSPACE",
        "COMPILING EXPERIENCE",
        "RENDERING PROJECTS",
        "PREPARING SHOWCASE"
    ]

    useEffect(() => {
        // Rotate messages while loading
        if (isLoading) {
            const messageInterval = setInterval(() => {
                setMessageIndex((prev) => (prev + 1) % messages.length)
            }, 800)

            return () => clearInterval(messageInterval)
        }
    }, [isLoading])

    // Show "READY" when loading is complete
    const displayMessage = !isLoading && progress >= 100 ? "READY" : messages[messageIndex]

    return (
        <div className="loader-container">
            {/* Grid background */}
            <div className="loader-grid"></div>

            <div className="loader-content">
                {/* Minimal progress indicator */}
                <div className="loader-bar-wrapper">
                    <div className="loader-label">
                        <span className="loader-message">{displayMessage}</span>
                        <span className="loader-percentage">{Math.floor(progress)}%</span>
                    </div>
                    <div className="loader-bar">
                        <div
                            className="loader-bar-fill"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
