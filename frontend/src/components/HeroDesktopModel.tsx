import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function HeroModel({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const groupRef = useRef<THREE.Group | null>(null);
  const { scene } = useGLTF("/models/hero-dantex.glb");
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const targetRotationX = -0.12 - mouse.current.y * 0.18;
    const targetRotationY = -0.55 + mouse.current.x * 0.3;
    const idleY = -1.45 + Math.sin(state.clock.elapsedTime * 0.7) * 0.035;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.045);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.045);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, idleY, 0.04);
  });

  return (
    <group ref={groupRef} position={[0.25, -1.45, 0]} scale={2.3}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  );
}

export function HeroDesktopModel() {
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-[58%] md:block xl:w-[56%] 2xl:w-[54%]">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.15, 9], fov: 24 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[4, 6, 6]} intensity={2.8} color="#dfe8ff" />
          <directionalLight position={[-5, 3, 1]} intensity={1.2} color="#7aa2ff" />
          <spotLight position={[2, 8, 10]} angle={0.28} penumbra={0.9} intensity={34} color="#ffffff" />
          <spotLight position={[7, 2, 3]} angle={0.42} penumbra={1} intensity={14} color="#a7c2ff" />
          <HeroModel mouse={mouseRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/hero-dantex.glb");

export default HeroDesktopModel;
