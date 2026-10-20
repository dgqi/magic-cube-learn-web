import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Cube3D from './Cube3D';
import type { CubeState } from '../../types/cube';

interface CubeSceneProps {
  state: CubeState;
  autoRotate?: boolean;
  animatingMove?: string | null;
  onAnimationComplete?: () => void;
  animationDuration?: number;
}

export default function CubeScene({ state, autoRotate = false, animatingMove, onAnimationComplete, animationDuration = 0.4 }: CubeSceneProps) {
  return (
    <div className="w-full h-full min-h-[300px]" style={{ minHeight: '400px' }}>
      <Canvas camera={{ position: [4, 4, 4], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />
          <Cube3D
            state={state}
            animatingMove={animatingMove}
            onAnimationComplete={onAnimationComplete}
            animationDuration={animationDuration}
          />
          <OrbitControls
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enablePan={false}
            minDistance={3}
            maxDistance={10}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
