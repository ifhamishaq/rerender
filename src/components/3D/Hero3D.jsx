import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei';

const FloatingShape = ({ color = "#39FF14" }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (!meshRef.current) return;
        const { x, y } = state.mouse;
        meshRef.current.rotation.x = y * 0.5;
        meshRef.current.rotation.y = x * 0.5;
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
                <MeshDistortMaterial
                    color={color}
                    speed={2}
                    distort={0.3}
                    radius={1}
                />
            </Sphere>
        </Float>
    );
};

const Hero3D = ({ isDarkMode }) => {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: 0.8
        }}>
            <Canvas 
                camera={{ position: [0, 0, 5], fov: 45 }}
                dpr={[1, 2]}
                gl={{ antialias: false, powerPreference: "high-performance" }}
            >
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={2} />
                <FloatingShape color={isDarkMode ? "#39FF14" : "#5227FF"} />
            </Canvas>
        </div>
    );
};

export default Hero3D;
