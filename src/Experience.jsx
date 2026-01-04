import { Text, Html, ContactShadows, PresentationControls, Float, Environment, useGLTF } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

export default function Experience() {
    const backgroundColor = '#22212a'
    const lightColor = '#bebebe'
    const lightIntensity = 130

    // Ping Dot Configuration
    const pingDotX = 0.01
    const pingDotY = 0.59
    const pingDotZ = 0.8
    const pingDotRotX = -1.3
    const pingDotRotY = 0
    const pingDotRotZ = 0
    const pingDotColor = '#52c774'
    const pingDotScale = 2.5

    const computer = useGLTF('/models/macbook_model.gltf')
    const { camera, gl } = useThree()
    const [isZoomed, setIsZoomed] = useState(false)
    const [isLaptopOpen, setIsLaptopOpen] = useState(false)
    const [isFullyOpened, setIsFullyOpened] = useState(false)
    const [iframeOpacity, setIframeOpacity] = useState(0)
    const [currentLightIntensity, setCurrentLightIntensity] = useState(0)
    const [showPingDot, setShowPingDot] = useState(false)
    const [isMusicPlaying, setIsMusicPlaying] = useState(false)
    const [hoveringMusic, setHoveringMusic] = useState(false)
    const screenRef = useRef()
    const audioRef = useRef(new Audio('/sounds/elevator.mp3'))

    useEffect(() => {
        audioRef.current.loop = true
        audioRef.current.volume = 0.3
        return () => {
            audioRef.current.pause()
        }
    }, [])

    useEffect(() => {
        if (isMusicPlaying) {
            audioRef.current.play().catch(e => console.log("Audio play failed:", e))
        } else {
            audioRef.current.pause()
        }
    }, [isMusicPlaying])

    const closedAngle = 3.04
    const openAngle = 1.31

    const defaultPosX = -2.0
    const defaultPosY = 0
    const defaultPosZ = 5.3
    const defaultRotX = 0
    const defaultRotY = -0.4
    const defaultRotZ = 0

    const zoomedPosX = 0
    const zoomedPosY = 0.2
    const zoomedPosZ = 2.5
    const zoomedRotX = 0
    const zoomedRotY = 0
    const zoomedRotZ = 0

    const transitionSpeed = 2

    const [currentLightColor, setCurrentLightColor] = useState(lightColor)

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'portfolioColorUpdate') {
                setCurrentLightColor(event.data.color)
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    useEffect(() => {
        if (computer.scene) {
            computer.scene.traverse((child) => {
                if (child.name.toLowerCase().includes('screen') ||
                    child.name.toLowerCase().includes('display') ||
                    child.name === 'Top') {
                    screenRef.current = child
                    child.rotation.x = closedAngle
                }

                if (child.isMesh && (
                    child.name.toLowerCase().includes('camera') ||
                    child.name.toLowerCase().includes('webcam') ||
                    child.name.toLowerCase().includes('lens') ||
                    child.name.toLowerCase().includes('ring')
                )) {
                    child.visible = false
                }
            })

            setTimeout(() => {
                setIsLaptopOpen(true)
            }, 500)
        }
    }, [computer, closedAngle])

    useEffect(() => {
        if (isFullyOpened && !isZoomed) {
            const timer = setTimeout(() => {
                setShowPingDot(true)
            }, 500)

            return () => clearTimeout(timer)
        } else {
            setShowPingDot(false)
        }
    }, [isFullyOpened, isZoomed])

    const targetPosition = useRef(new THREE.Vector3(defaultPosX, defaultPosY, defaultPosZ))
    const targetRotation = useRef(new THREE.Euler(defaultRotX, defaultRotY, defaultRotZ))

    useFrame((state, delta) => {
        const targetPos = isZoomed
            ? new THREE.Vector3(zoomedPosX, zoomedPosY, zoomedPosZ)
            : new THREE.Vector3(defaultPosX, defaultPosY, defaultPosZ)

        const targetRot = isZoomed
            ? new THREE.Euler(zoomedRotX, zoomedRotY, zoomedRotZ)
            : new THREE.Euler(defaultRotX, defaultRotY, defaultRotZ)

        camera.position.lerp(targetPos, delta * transitionSpeed)

        const currentQuat = camera.quaternion.clone()
        const targetQuat = new THREE.Quaternion().setFromEuler(targetRot)
        camera.quaternion.slerp(targetQuat, delta * transitionSpeed)

        if (screenRef.current) {
            const targetRotation = isLaptopOpen ? openAngle : closedAngle
            screenRef.current.rotation.x = THREE.MathUtils.lerp(
                screenRef.current.rotation.x,
                targetRotation,
                delta * 2.5
            )

            const threshold = 0.05
            if (isLaptopOpen && Math.abs(screenRef.current.rotation.x - openAngle) < threshold) {
                if (!isFullyOpened) setIsFullyOpened(true)
            } else {
                if (isFullyOpened) setIsFullyOpened(false)
            }
        }

        const targetOpacity = isFullyOpened ? 1 : 0
        setIframeOpacity(prev => THREE.MathUtils.lerp(prev, targetOpacity, delta * 5))

        const targetLightIntensity = isFullyOpened ? lightIntensity : 0
        setCurrentLightIntensity(prev => THREE.MathUtils.lerp(prev, targetLightIntensity, delta * 5))
    })

    const handleModelClick = (e) => {
        e.stopPropagation()
        if (hoveringMusic) return
        setIsZoomed(true)
    }

    const handleBackgroundClick = () => {
        setIsZoomed(false)
    }

    return <>

        <color args={[backgroundColor]} attach="background" />

        <Environment preset="city" />

        <mesh onClick={handleBackgroundClick} position={[0, 0, -5]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>

        <PresentationControls
            global
            rotation={[0.13, 0.1, 0]}
            polar={[- 0.4, 0.2]}
            azimuth={[- 1, 0.75]}
            damping={0.1}
            snap
            enabled={!isZoomed}
        >
            <Float rotationIntensity={0.4} >
                <rectAreaLight
                    width={2.5}
                    height={1.65}
                    intensity={currentLightIntensity}
                    color={currentLightColor}
                    rotation={[- 0.1, Math.PI, 0]}
                    position={[0, 0.55, - 1.15]}
                />

                <primitive
                    object={computer.scene}
                    position-y={- 1.2}
                    onClick={handleModelClick}
                >
                    <Html
                        transform
                        wrapperClass="htmlScreen"
                        distanceFactor={1.17}
                        position={[0, 1.56, - 1.4]}
                        rotation-x={- 0.256}
                    >
                        <div style={{
                            opacity: iframeOpacity,
                            pointerEvents: iframeOpacity > 0.5 ? 'auto' : 'none',
                            position: 'relative'
                        }}>
                            <iframe src="/portfolio.html" />

                            <div
                                onMouseEnter={() => setHoveringMusic(true)}
                                onMouseLeave={() => setHoveringMusic(false)}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsMusicPlaying(!isMusicPlaying)
                                }}
                                style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    right: '20px',
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    transition: 'all 0.3s ease',
                                    transform: hoveringMusic ? 'scale(1.1)' : 'scale(1)',
                                    zIndex: 1000
                                }}
                            >
                                {isMusicPlaying ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                        <line x1="23" y1="9" x2="17" y2="15"></line>
                                        <line x1="17" y1="9" x2="23" y2="15"></line>
                                    </svg>
                                )}
                            </div>
                        </div>
                    </Html>

                    <Html
                        transform
                        center
                        distanceFactor={1.17}
                        position={[pingDotX, pingDotY, pingDotZ]}
                        rotation-x={pingDotRotX}
                        rotation-y={pingDotRotY}
                        rotation-z={pingDotRotZ}
                        style={{
                            opacity: showPingDot ? 1 : 0,
                            pointerEvents: 'none',
                            transition: 'opacity 0.5s ease'
                        }}
                    >
                        <div
                            className="ping-dot"
                            style={{
                                '--dot-color': pingDotColor,
                                transform: `scale(${pingDotScale})`
                            }}
                        ></div>
                    </Html>
                </primitive>

                <Text
                    font="./bangers-v20-latin-regular.woff"
                    fontSize={0.8}
                    position={[2.5, 0.5, 0.5]}
                    rotation-y={- 1.25}
                    maxWidth={3}
                >
                    Hey 👋🏻 I'm Akash
                </Text>
            </Float>
        </PresentationControls>

        <ContactShadows
            position-y={- 1.4}
            opacity={0.4}
            scale={5}
            blur={2.4}
        />

    </>
}