import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import Loader from './Loader.jsx'
import { useState, Suspense } from 'react'
import { useProgress } from '@react-three/drei'
import { createPortal } from 'react-dom'
import { Analytics } from '@vercel/analytics/react'

function LoadingManager({ onProgress }) {
    const { progress, active } = useProgress()

    // Send progress updates to parent
    onProgress(progress, active)

    return null
}

function App() {
    const [progress, setProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [showLoader, setShowLoader] = useState(true)

    const handleProgress = (prog, active) => {
        setProgress(prog)
        setIsLoading(active)

        // Hide loader when loading is complete
        if (!active && prog >= 100) {
            setTimeout(() => {
                setShowLoader(false)
            }, 500)
        }
    }

    return (
        <>
            {showLoader && <Loader progress={progress} isLoading={isLoading} />}
            <Canvas
                className="r3f"
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 2000,
                    position: [-3, 1.5, 4]
                }}
            >
                <Suspense fallback={null}>
                    <LoadingManager onProgress={handleProgress} />
                    <Experience />
                </Suspense>
            </Canvas>
            <Analytics />
        </>
    )
}

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(<App />)