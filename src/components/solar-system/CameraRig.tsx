import { useEffect, useMemo, useRef, type ElementRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { bodyById } from '../../data/celestialBodies';
import { useSolarStore } from '../../stores/useSolarStore';
import type { Vector3Tuple } from '../../types/celestial';
import { getBodyPosition, getFocusCameraPosition } from '../../utils/orbits';
import { getOverviewCameraPosition } from '../../utils/scale';

const toVector3 = (tuple: Vector3Tuple): THREE.Vector3 => new THREE.Vector3(tuple[0], tuple[1], tuple[2]);

interface CameraFlight {
  elapsed: number;
  duration: number;
  fromCamera: THREE.Vector3;
  toCamera: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
}

const easeOutCubic = (value: number): number => 1 - Math.pow(1 - value, 3);

export function CameraRig() {
  const controlsRef = useRef<ElementRef<typeof OrbitControls> | null>(null);
  const flightRef = useRef<CameraFlight | null>(null);
  const lastCameraSyncRef = useRef(0);

  const { camera } = useThree();
  const selectedBodyId = useSolarStore((state) => state.selectedBodyId);
  const followBodyId = useSolarStore((state) => state.followBodyId);
  const scaleMode = useSolarStore((state) => state.scaleMode);
  const resetCameraRequest = useSolarStore((state) => state.resetCameraRequest);

  const overviewPosition = useMemo(() => toVector3(getOverviewCameraPosition(scaleMode)), [scaleMode]);

  useEffect(() => {
    const { simulatedDays } = useSolarStore.getState();
    const currentTarget = controlsRef.current?.target.clone() ?? new THREE.Vector3(0, 0, 0);
    let target = new THREE.Vector3(0, 0, 0);
    let desiredCamera = overviewPosition.clone();

    if (selectedBodyId && bodyById[selectedBodyId]) {
      const body = bodyById[selectedBodyId];
      target = toVector3(getBodyPosition(body, simulatedDays, scaleMode));
      desiredCamera = toVector3(getFocusCameraPosition(body, simulatedDays, scaleMode));
    }

    flightRef.current = {
      elapsed: 0,
      duration: 1.15,
      fromCamera: camera.position.clone(),
      toCamera: desiredCamera,
      fromTarget: currentTarget,
      toTarget: target,
    };
  }, [camera, overviewPosition, resetCameraRequest, scaleMode, selectedBodyId]);

  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    const { simulatedDays, setCameraPosition } = useSolarStore.getState();

    if (flightRef.current) {
      const flight = flightRef.current;
      flight.elapsed += delta;
      const progress = Math.min(1, flight.elapsed / flight.duration);
      const eased = easeOutCubic(progress);
      camera.position.lerpVectors(flight.fromCamera, flight.toCamera, eased);
      controls.target.lerpVectors(flight.fromTarget, flight.toTarget, eased);
      controls.update();

      if (progress >= 1) {
        flightRef.current = null;
      }
    } else if (followBodyId && bodyById[followBodyId]) {
      const previousTarget = controls.target.clone();
      const cameraOffset = camera.position.clone().sub(previousTarget);
      const body = bodyById[followBodyId];
      const target = toVector3(getBodyPosition(body, simulatedDays, scaleMode));
      const damping = 1 - Math.pow(0.001, delta);
      controls.target.lerp(target, damping);
      camera.position.copy(controls.target).add(cameraOffset);
      controls.update();
    } else {
      controls.update();
    }

    if (state.clock.elapsedTime - lastCameraSyncRef.current > 0.2) {
      lastCameraSyncRef.current = state.clock.elapsedTime;
      setCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.76}
      panSpeed={0.72}
      zoomSpeed={0.9}
      enablePan
      enableRotate
      enableZoom
      minDistance={scaleMode === 'educational' ? 2 : 4}
      maxDistance={scaleMode === 'educational' ? 135 : 720}
      maxPolarAngle={Math.PI * 0.94}
      minPolarAngle={0.08}
      makeDefault
    />
  );
}
