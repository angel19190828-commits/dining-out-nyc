/*
 * Adapted from React Bits FluidGlass (JS-CSS registry variant).
 * The registry's demo-owned Canvas and ScrollControls were removed so this lens
 * can live inside the single React Three Fiber canvas used by the data story.
 * https://reactbits.dev/components/fluid-glass
 */
/* eslint-disable react/no-unknown-property */
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, useGLTF } from '@react-three/drei';
import { easing } from 'maath';
import { COLORS } from '@/palette';
import { publicUrl } from '@/publicUrl';

const LENS_MODEL_URL = publicUrl('assets/3d/lens.glb');

export default function FluidGlass({
  active = false,
  mode = 'lens',
  lensProps = {},
  target = [0, 1, 0],
  onLensMove
}) {
  const ref = useRef();
  const { nodes } = useGLTF(LENS_MODEL_URL);
  const {
    scale = 0.25,
    ior = 1.15,
    thickness = 5,
    chromaticAberration = 0.1,
    anisotropy = 0.01
  } = lensProps;

  useEffect(() => {
    if (active) onLensMove?.(target);
  }, [active, onLensMove, target]);

  useFrame((_, delta) => {
    if (!active || !ref.current) return;
    easing.damp3(ref.current.position, target, 0.12, delta);
  });

  if (!active || mode !== 'lens' || !nodes.Cylinder?.geometry) return null;

  return (
    <group ref={ref} position={target}>
      <pointLight color={COLORS.paperLight} intensity={1.2} distance={3} position={[0, 1.2, 0]} />
      <mesh
        scale={scale}
        rotation-x={Math.PI / 2}
        geometry={nodes.Cylinder.geometry}
        raycast={() => null}
        renderOrder={5}>
        <MeshTransmissionMaterial
          transmission={1}
          roughness={0.02}
          samples={4}
          resolution={256}
          backside
          ior={ior}
          thickness={thickness}
          anisotropy={anisotropy}
          chromaticAberration={chromaticAberration}
        />
      </mesh>
      <mesh rotation-x={Math.PI / 2} raycast={() => null} renderOrder={6}>
        <torusGeometry args={[0.58, 0.018, 8, 64]} />
        <meshBasicMaterial color={COLORS.coral} transparent opacity={0.72} depthTest={false} />
      </mesh>
    </group>
  );
}

useGLTF.preload(LENS_MODEL_URL);
