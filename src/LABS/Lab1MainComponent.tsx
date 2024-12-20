import React, { useState, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from "three";
import CornerText from "../shared/2dText";
import ChatComponent from "../Assisstant/alltogether";
import CircularTherm from "../labComponents/circularTherm/ThermometerMainComponent";
import SmallKnob from "../labComponents/SmallKnob/smallKnob";
import Box from "../labComponents/Box/box";
import VVR from "../labComponents/VariableVoltageRegulator/mainframe";
import BigKnob from "../labComponents/BigKnob/bigKnob";
import Grid from "./grid";
import RaycastingComponent from "../raycaster/lab1Raycaster";
import LightSwitch from "../miscellaneous/switchAndCasing";
import DVM from "../labComponents/DigitalVoltmeter/digitalVoltmeter.tsx";
import TriangleButton from "../labComponents/Buttons/triangleButton.tsx";
import { FrontFaceContextProvider } from "../contexts/frontFaceContext.tsx";
import { useFrontFaceContext } from "../hooks/useFrontFaceContext.tsx";
import { useHelper } from "@react-three/drei";

interface CameraProps {
  xN: number;
  yN: number;
  zN: number;
}

const Camera: React.FC<CameraProps> = ({ xN, yN, zN }) => {
  const frameCounter = useRef(0); // Counter for frames
  const interval = 60; // Check visibility every 60 frames (~1 second at 60 FPS)

  const { isFrontFaceVisible, setFrontFaceVisibility } = useFrontFaceContext();

  useFrame(({ camera }) => {
    frameCounter.current += 1;

    if (frameCounter.current >= interval) {
      const isCameraBehind = camera.position.z < 0;

      if (isCameraBehind && !isFrontFaceVisible) {
        setFrontFaceVisibility(true);
        console.log("Camera is behind: Dial is updating", isFrontFaceVisible);
      } else if (!isCameraBehind && isFrontFaceVisible) {
        setFrontFaceVisibility(false);
        console.log("Camera is in front: Dial is not updating", isFrontFaceVisible);
      }

      frameCounter.current = 0; // Reset the frame counter after 1 second
    }
  });

  return (
    <PerspectiveCamera
      makeDefault
      position={[xN, yN, zN]}
      fov={75}
      aspect={window.innerWidth / window.innerHeight}
      near={0.1}
      far={1000}
    />
  );
};

const GraphPaperComponent: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 50, z: 80 });
  const [key, setKey] = useState(0);
  const [reversedString, setReversedString] = useState<string | null>(null);

  const lightRef = useRef<THREE.DirectionalLight | null>(null);
  
  const handleStubMessageClick = () => {
    setPosition({ x: 10, y: 10, z: 10 });
    setKey((prev) => prev + 1);
  };

  const fetchWiperAngleFromBackend = () => Math.random() * 2 * Math.PI;

  return (
    <Suspense fallback={<CornerText position="top-left" text="Loading Project" />}>
      <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <CornerText position="top-left" text="Photoelectric Effects" />
        <ChatComponent onMessageClicked={handleStubMessageClick} />
        {reversedString && (
          <div style={{ position: "absolute", top: 0, left: 0, color: "white" }}>
            {`Reversed: ${reversedString}`}
          </div>
        )}

        <Canvas
          gl={{ antialias: true }}
          onCreated={({ gl, scene }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.7; // Reduce exposure for less intensity
            scene.environmentIntensity = 0.5; // Reduce environment lighting
          }}
        >
          {/* Raycasting Component */}
          <RaycastingComponent />

          {/* Camera and Thermometer */}
          <FrontFaceContextProvider>
            <Camera key={key} xN={position.x} yN={position.y} zN={position.z} />
            <CircularTherm wiperAngle={fetchWiperAngleFromBackend} position={[0, 8, 0]} />
          </FrontFaceContextProvider>

          {/* Ambient Light */}
          <ambientLight intensity={1} />
          <Environment files="/environment/neon_photostudio_2k.hdr" background />
          

          {/* Grid */}
          <Grid />

          {/* Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.1}
            rotateSpeed={0.4}
            zoomSpeed={0.5}
            mouseButtons={{ MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
          />

          {/* Components */}
          <VVR position={[10, 8, 0]} />
          <DVM scale={2} rotationY={Math.PI} voltage={() => 0} position={[10, 25, 0]} />
          <SmallKnob type="lab1smallknob" name="smallKnob" position={[-10, 5, 0]} rotation={[Math.PI, 0, 0]} />
          <SmallKnob type="lab1smallknob" name="smallKnob" position={[-22, 5, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <BigKnob position={[-35, 5, 0]} rotation={[0, 0, 0]} />
          <Box position={[-35, 10, 0]} rotation={[Math.PI, 0, 0]} />
          <LightSwitch position={[-20, 20, 0]} scale={[0.5, 0.5, 0.5]} />
          <TriangleButton position={[-20, 20, 0]} />
        </Canvas>
      </div>
    </Suspense>
  );
};

export default GraphPaperComponent;
