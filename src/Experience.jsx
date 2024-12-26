import { OrbitControls, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  CylinderCollider,
  InstancedRigidBodies,
  Physics,
  RigidBody,
} from "@react-three/rapier";
import { Perf } from "r3f-perf";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";

export default function Experience() {
  const [hitSound] = useState(() => new Audio("./hit.mp3"));
  const twisterRef = useRef();
  const cubeRef = useRef();
  const hamburger = useGLTF("./hamburger.glb");

  const cubeJump = () => {
    const mass = cubeRef.current.mass();
    cubeRef.current.applyImpulse({ x: 0, y: 5 * mass, z: 0 });
    cubeRef.current.applyTorqueImpulse({
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5,
    });
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const eulerRotation = new THREE.Euler(0, time * 3, 0);
    const quaternionRotation = new THREE.Quaternion();
    quaternionRotation.setFromEuler(eulerRotation);
    twisterRef.current?.setNextKinematicRotation(quaternionRotation);

    const angle = time * 0.5;
    const x = Math.cos(angle) * 2;
    const z = Math.sin(angle) * 2;
    twisterRef.current?.setNextKinematicTranslation({ x, y: -0.8, z });
  });

  const collisionEnter = () => {
    // hitSound.currentTime = 0;
    // hitSound.volume = Math.random();
    // hitSound.play();
  };

  const CUBE_COUNT = 100;

  //   useEffect(() => {
  //     for (let i = 0; i < CUBE_COUNT; i++) {
  //       const matrix = new THREE.Matrix4();
  //       matrix.compose(
  //         new THREE.Vector3(i * 2, 0, 0),
  //         new THREE.Quaternion(),
  //         new THREE.Vector3(1, 1, 1)
  //       );
  //       cubesRef.current.setMatrixAt(i, matrix);
  //     }
  //   }, []);

  const instances = useMemo(() => {
    const instances = [];

    for (let i = 0; i < CUBE_COUNT; i++) {
      instances.push({
        key: `instance_${i}`,
        position: [
          (Math.random() - 0.5) * 0.8,
          6 + i * 0.2,
          (Math.random() - 0.5) * 0.8,
        ],
        rotation: [Math.random(), Math.random(), Math.random()],
      });
    }

    return instances;
  }, []);

  return (
    <>
      <Perf position="top-left" />

      <OrbitControls makeDefault />

      <directionalLight
        castShadow
        position={[1, 2, 3]}
        intensity={4.5}
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={1.5} />

      <Physics debug gravity={[0, -9.81, 0]}>
        <RigidBody colliders="ball">
          <mesh castShadow position={[-1.5, 2, 0]}>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
          </mesh>
        </RigidBody>

        <RigidBody
          ref={cubeRef}
          colliders={false}
          position={[1.5, 2, 0]}
          friction={0.7}
        >
          <CuboidCollider mass={0.5} args={[0.5, 0.5, 0.5]} />
          <mesh castShadow onClick={cubeJump}>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
          </mesh>
        </RigidBody>

        <RigidBody
          ref={twisterRef}
          position={[0, -0.8, 0]}
          friction={0}
          type="kinematicPosition"
          onCollisionEnter={collisionEnter}
          onCollisionExit={() => console.log("exit")}
          onSleep={() => console.log("sleep")}
          onWake={() => console.log("wake")}
        >
          <mesh castShadow scale={[0.4, 0.4, 3]}>
            <boxGeometry />
            <meshStandardMaterial color="red" />
          </mesh>
        </RigidBody>

        <RigidBody type="fixed" restitution={1} friction={0.7}>
          <mesh receiveShadow position-y={-1.25}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshStandardMaterial color="greenyellow" />
          </mesh>
        </RigidBody>

        <RigidBody colliders={false} position={[0, 4, 0]}>
          <primitive object={hamburger.scene} scale={0.25} />
          <CylinderCollider args={[0.5, 1.4]} />
        </RigidBody>

        <RigidBody type="fixed">
          <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, 5.25]} />
          <CuboidCollider args={[5, 2, 0.5]} position={[0, 1, -5.25]} />
          <CuboidCollider args={[0.5, 2, 5]} position={[5.25, 1, 0]} />
          <CuboidCollider args={[0.5, 2, 5]} position={[-5.25, 1, 0]} />
        </RigidBody>

        <InstancedRigidBodies instances={instances}>
          <instancedMesh args={[null, null, CUBE_COUNT]}>
            <boxGeometry />
            <meshStandardMaterial color="tomato" />
          </instancedMesh>
        </InstancedRigidBodies>
      </Physics>
    </>
  );
}
