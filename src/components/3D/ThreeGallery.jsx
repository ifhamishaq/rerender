import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';

// --- RICH JOURNEY DATA WITH MEDIA ---
export const JOURNEY_MILESTONES = [
    { 
        id: 0, year: "2018", title: "THE FIRST SPARK", 
        desc: "Fascinated by tech and games. Built a Snake game by following YouTube tutorials, igniting a lifelong passion for code.", 
        skills: ["HTML5", "JavaScript Engine", "Game Loops"],
        media: "/journey/first spark.gif", z: 0 
    },
    { 
        id: 1, year: "2019", title: "DIRECTOR'S CUT", 
        desc: "Stepped into the world of video editing at 12 years old using Kinemaster and PowerDirector on a phone. The edits were rough, but the vision was born.", 
        skills: ["Mobile Editing", "Kinemaster", "Timeline Sequencing"],
        media: "/journey/director.gif", z: -60 
    },
    { 
        id: 2, year: "2020", title: "MOBILE 3D PIONEER", 
        desc: "Ventured into 3D animation without a PC. Relied entirely on a smartphone and Prisma 3D to bring imagination to life, while honing edits in CapCut.", 
        skills: ["Prisma 3D", "Spatial Animation", "CapCut Pro"],
        media: "/journey/mobile.gif", z: -120 
    },
    { 
        id: 3, year: "2020 - 2024", title: "THE GRIND", 
        desc: "Spent years coding, designing, and learning software engineering on limited hardware (a phone and an old laptop), mastering the fundamentals.", 
        skills: ["Performance Coding", "UI/UX Foundations", "Hardware Constraints"],
        media: "/journey/grind.gif", z: -180 
    },
    { 
        id: 4, year: "EARLY 2025", title: "THE ARSENAL", 
        desc: "Acquired a first gaming rig. Transitioned to Blender for high-end 3D rendering and professional-grade editing software, unlocking new ceilings.", 
        skills: ["Blender 3D", "Raytracing", "High-End Rendering"],
        media: "/journey/arsenal.gif", z: -240 
    },
    { 
        id: 5, year: "PRESENT", title: "AGENCY LEVEL", 
        desc: "Executing highly praised website designs, premium video editing, and graphic design for financial creators and active Discord clients.", 
        skills: ["React Architecture", "Client Relations", "Full-Stack Design"],
        media: "/journey/agency.gif", z: -300 
    }
];

// --- CONTROLS ---
const useRailControls = (numCheckpoints) => {
    const [targetIndex, setTargetIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.repeat) return; 
            if (e.code === 'KeyW' || e.code === 'ArrowUp') {
                setTargetIndex(prev => Math.min(prev + 1, numCheckpoints - 1));
            } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                setTargetIndex(prev => Math.max(prev - 1, 0));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [numCheckpoints]);

    return targetIndex;
};

// --- HIGH PERFORMANCE SCENERY ---
const LushEnvironment = () => {
    return (
        <group>
            <mesh position={[0, 0.01, -150]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[14, 400]} />
                <meshLambertMaterial color="#222" />
            </mesh>
            <mesh position={[0, 0.02, -150]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.3, 400]} />
                <meshBasicMaterial color="#FFF" opacity={0.5} transparent />
            </mesh>
            <mesh position={[0, 0, -150]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[250, 400]} />
                <meshLambertMaterial color="#2d4a22" />
            </mesh>
        </group>
    );
};

const AppleForest = () => {
    const treeCount = 300; 
    const { leaves, trunks } = useMemo(() => {
        const l = new Float32Array(treeCount * 16);
        const tr = new Float32Array(treeCount * 16);
        const temp = new THREE.Object3D();
        
        for (let i = 0; i < treeCount; i++) {
            const sign = Math.random() > 0.5 ? 1 : -1;
            const x = sign * (12 + Math.random() * 30);
            const z = 20 - Math.random() * 380;
            const scale = 0.8 + Math.random() * 1.2; 
            
            temp.position.set(x, 1 * scale, z);
            temp.scale.set(scale, scale, scale);
            temp.rotation.set(0, Math.random() * Math.PI, 0);
            temp.updateMatrix();
            temp.matrix.toArray(tr, i * 16);
            
            temp.position.set(x, 4.0 * scale, z);
            temp.scale.set(scale, scale * 1.1, scale);
            temp.updateMatrix();
            temp.matrix.toArray(l, i * 16);
        }
        return { leaves: l, trunks: tr };
    }, []);

    return (
        <group>
            <instancedMesh args={[new THREE.CylinderGeometry(0.3, 0.4, 3, 6), new THREE.MeshLambertMaterial({ color: '#3d2817' }), treeCount]}>
                <instancedBufferAttribute attach="instanceMatrix" args={[trunks, 16]} />
            </instancedMesh>
            <instancedMesh args={[new THREE.SphereGeometry(2.5, 8, 8), new THREE.MeshLambertMaterial({ color: '#3a7a3a' }), treeCount]}>
                <instancedBufferAttribute attach="instanceMatrix" args={[leaves, 16]} />
            </instancedMesh>
        </group>
    );
};

const Mountains = () => {
    const mountCount = 20; 
    const { mounts } = useMemo(() => {
        const m = new Float32Array(mountCount * 16);
        const temp = new THREE.Object3D();
        for (let i = 0; i < mountCount; i++) {
            const sign = Math.random() > 0.5 ? 1 : -1;
            const x = sign * (70 + Math.random() * 40);
            const z = 50 - Math.random() * 450;
            const scaleX = 40 + Math.random() * 40;
            const scaleY = 15 + Math.random() * 20; 
            const scaleZ = 40 + Math.random() * 40;
            
            temp.position.set(x, scaleY / 2 - 5, z);
            temp.scale.set(scaleX, scaleY, scaleZ);
            temp.updateMatrix();
            temp.matrix.toArray(m, i * 16);
        }
        return { mounts: m };
    }, []);

    return (
        <instancedMesh args={[new THREE.SphereGeometry(1, 16, 8), new THREE.MeshLambertMaterial({ color: '#25421d' }), mountCount]}>
            <instancedBufferAttribute attach="instanceMatrix" args={[mounts, 16]} />
        </instancedMesh>
    );
}

// --- OPTIMIZED DIEGETIC HTML LAYERS ---
function InteractiveWaypoint({ data, isActiveNode, onOpenModal }) {
    return (
        <group position={[0, 0.1, data.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[2.5, 3.2, 24]} />
                <meshBasicMaterial color="#FFF" transparent opacity={0.6} />
            </mesh>
            
            {isActiveNode && (
                <Html position={[0, 4.5, 0]} center transform sprite zIndexRange={[100, 0]}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onOpenModal(data)}
                        style={{
                            // Perfectly adapts to light/dark mode root CSS variables
                            backgroundColor: 'var(--theme-bg)', 
                            padding: '1.5rem 3rem',
                            borderRadius: '16px',
                            border: '1px solid var(--theme-accent)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            boxShadow: '0 20px 50px rgba(57, 255, 20, 0.15)',
                            pointerEvents: 'auto',
                        }}
                    >
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--theme-accent)', letterSpacing: '0.2em', fontWeight: 600 }}>/// {data.year}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 900, color: 'var(--theme-text)', marginTop: '0.5rem', whiteSpace: 'nowrap', lineHeight: 1 }}>
                            EXPLORE PHASE
                        </span>
                    </motion.div>
                </Html>
            )}
        </group>
    );
}

// --- PLAYER VEHICLE (ON RAILS) ---
function Car({ setActiveNode, targetIndex }) {
    const carRef = useRef();
    const activeNodeRef = useRef(null);
    const idealCameraOffset = useRef(new THREE.Vector3(12, 10, 12)); 
    const tempCameraPos = useRef(new THREE.Vector3());

    useFrame((state, delta) => {
        if (!carRef.current) return;

        const targetZ = JOURNEY_MILESTONES[targetIndex].z;
        const currentZ = carRef.current.position.z;
        
        const moveLerpSpeed = 0.08; 
        carRef.current.position.z = THREE.MathUtils.lerp(currentZ, targetZ, moveLerpSpeed);

        const distanceToTarget = Math.abs(currentZ - targetZ);
        if (distanceToTarget < 1.0) {
            if (activeNodeRef.current !== targetIndex) {
                activeNodeRef.current = targetIndex;
                setActiveNode(targetIndex); 
            }
        } else {
            if (activeNodeRef.current !== null) {
                activeNodeRef.current = null;
                setActiveNode(null);
            }
        }

        tempCameraPos.current.copy(carRef.current.position).add(idealCameraOffset.current);
        const cameraLerpSpeed = 0.03;
        state.camera.position.lerp(tempCameraPos.current, cameraLerpSpeed);
        
        const lookTarget = new THREE.Vector3().copy(carRef.current.position).add(new THREE.Vector3(0, 0, -5));
        const currentLookAt = new THREE.Vector3(0, 0, -1).applyQuaternion(state.camera.quaternion).add(state.camera.position);
        currentLookAt.lerp(lookTarget, 0.08);
        state.camera.lookAt(currentLookAt);
    });

    return (
        <group ref={carRef}>
            <group rotation={[0, Math.PI, 0]}>
                <mesh position={[0, 0.6, 0]}>
                    <boxGeometry args={[1.8, 0.6, 4.0]} />
                    <meshLambertMaterial color="#EEEEEE" />
                </mesh>
                <mesh position={[0, 1.0, -0.4]} rotation={[-0.1, 0, 0]}>
                    <boxGeometry args={[1.6, 0.4, 2.0]} />
                    <meshLambertMaterial color="#111" />
                </mesh>
                <mesh position={[-0.7, 0.6, 2.01]}>
                    <planeGeometry args={[0.4, 0.15]} />
                    <meshBasicMaterial color="#FFF" />
                </mesh>
                <mesh position={[0.7, 0.6, 2.01]}>
                    <planeGeometry args={[0.4, 0.15]} />
                    <meshBasicMaterial color="#FFF" />
                </mesh>
                <mesh position={[-0.7, 0.6, -2.01]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[0.4, 0.15]} />
                    <meshBasicMaterial color="red" />
                </mesh>
                <mesh position={[0.7, 0.6, -2.01]} rotation={[0, Math.PI, 0]}>
                    <planeGeometry args={[0.4, 0.15]} />
                    <meshBasicMaterial color="red" />
                </mesh>
            </group>
        </group>
    );
}

// --- FULLY ANIMATED HIGH-PERFORMANCE RICH MODAL ---
const DetailModal = ({ data, onClose }) => {
    // Escape key hook
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') onClose(); // Move to auto-close
        };
        if (data) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [data, onClose]);

    return (
        <AnimatePresence>
            {data && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    // Click the background to instantly close
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
                        backgroundColor: 'rgba(5, 5, 5, 0.85)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    }}
                >
                    <motion.div 
                        initial={{ y: 60, scale: 0.95, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 30, scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        // Prevent background click event from firing when clicking the specific modal box
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'var(--theme-bg)', borderRadius: '24px', padding: '3.5rem', border: '1px solid var(--theme-border)',
                            width: '90%', maxWidth: '1000px', boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                            position: 'relative', display: 'flex', flexDirection: 'column', gap: '2rem'
                        }}
                    >
                        <motion.button 
                            whileHover={{ scale: 1.1, backgroundColor: 'var(--theme-text)', color: 'var(--theme-bg)' }} 
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{
                                position: 'absolute', top: '1.5rem', right: '1.5rem', border: 'none',
                                backgroundColor: 'var(--theme-border)', color: 'var(--theme-text)', width: '40px', height: '40px', borderRadius: '20px',
                                cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 'bold', transition: 'all 0.2s'
                            }}
                        >
                            X
                        </motion.button>
                        
                        <header>
                            <h4 style={{ color: 'var(--theme-accent)', fontFamily: 'var(--font-mono)', margin: 0, letterSpacing: '0.15em', fontWeight: 600 }}>[{data.year}]</h4>
                            <h2 style={{ fontFamily: 'var(--font-display)', margin: '0.5rem 0 0 0', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'var(--theme-text)', lineHeight: 1, letterSpacing: '-0.02em' }}>
                                {data.title}
                            </h2>
                        </header>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
                            {/* Rich Media Injection Area */}
                            <div style={{
                                width: '100%', height: '350px', backgroundColor: 'var(--theme-bg)', 
                                borderRadius: '16px', border: '1px solid var(--theme-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden', position: 'relative'
                            }}>
                                {data.isVideo ? (
                                    <video 
                                        src={data.media} autoPlay loop muted playsInline 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                ) : (
                                    <img 
                                        src={data.media} alt={data.title} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                )}
                            </div>
                            
                            {/* Detailed Description and Skills Arsenal */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center' }}>
                                <p style={{ color: 'var(--theme-text)', opacity: 0.85, fontSize: '1.2rem', lineHeight: 1.8, margin: 0 }}>
                                    {data.desc}
                                </p>
                                
                                <div>
                                    <h5 style={{ fontFamily: 'var(--font-mono)', color: 'var(--theme-text)', margin: '0 0 1rem 0', opacity: 0.5, letterSpacing: '0.1em' }}>TECH ARSENAL</h5>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                        {data.skills.map((s, idx) => (
                                            <motion.span 
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.2 + (idx * 0.1), type: 'spring' }}
                                                key={s} 
                                                style={{ 
                                                    padding: '0.6rem 1rem', borderRadius: '8px', 
                                                    border: '1px solid var(--theme-border)', fontSize: '0.85rem', 
                                                    fontFamily: 'var(--font-mono)', color: 'var(--theme-accent)', 
                                                    backgroundColor: 'rgba(57, 255, 20, 0.05)',
                                                    fontWeight: 600
                                                }}
                                            >
                                                {s}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function ThreeGallery() {
    const targetIndex = useRailControls(JOURNEY_MILESTONES.length);
    const [activeCarNodeIndex, setActiveCarNodeIndex] = useState(0); 
    const [openedModalData, setOpenedModalData] = useState(null); 

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#dcecd2', position: 'relative' }}>
            
            <div style={{ position: 'absolute', top: '6vh', left: '5vw', zIndex: 10, color: '#111', pointerEvents: 'none' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 4rem)', margin: '0 0 0.5rem 0', lineHeight: 0.9 }}>
                    THE JOURNEY.
                </h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ padding: '0.4rem 0.8rem', background: '#FFF', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#000' }}>W</div>
                        <div style={{ padding: '0.4rem 0.8rem', background: '#FFF', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#000' }}>S</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', color: '#666', fontSize: '0.8rem', fontWeight: 600 }}>DRIVE TIMELINE</span>
                </div>
            </div>

            <div style={{ position: 'absolute', top: '7vh', right: '5vw', zIndex: 10 }}>
                <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://ifhamishaq.netlify.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                        padding: '1rem 2rem', backgroundColor: '#39FF14', color: '#000',
                        fontFamily: 'var(--font-sans)', fontWeight: 800, textDecoration: 'none',
                        borderRadius: '40px', fontSize: '0.9rem', display: 'flex', alignItems: 'center',
                        gap: '0.5rem', boxShadow: '0 10px 30px rgba(57, 255, 20, 0.2)', pointerEvents: 'auto'
                    }}
                >
                    VIEW REAL PORTFOLIO ↗
                </motion.a>
            </div>

            <DetailModal data={openedModalData} onClose={() => setOpenedModalData(null)} />

            <Canvas camera={{ fov: 40 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
                <Sky distance={45000} sunPosition={[50, 40, 50]} inclination={0.2} azimuth={0.25} turbidity={2} rayleigh={0.5} mieCoefficient={0.005} />
                <ambientLight intensity={0.9} />
                <directionalLight position={[50, 80, 50]} intensity={1.5} />

                <LushEnvironment />
                <AppleForest />
                <Mountains />

                <Car setActiveNode={setActiveCarNodeIndex} targetIndex={targetIndex} />

                {JOURNEY_MILESTONES.map((data, i) => (
                    <InteractiveWaypoint 
                        key={i} 
                        data={data} 
                        isActiveNode={activeCarNodeIndex === i && !openedModalData} 
                        onOpenModal={setOpenedModalData}
                    />
                ))}
            </Canvas>
        </div>
    );
}
