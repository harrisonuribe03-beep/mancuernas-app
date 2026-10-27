import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { ThreeCanvas, useOffthreadVideoTexture, useVideoTexture } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { loadFont } from "@remotion/google-fonts/Barlow";
import {
  AbsoluteFill,
  Easing,
  Html5Video,
  interpolate,
  staticFile,
  useCurrentFrame,
  useDelayRender,
  useRemotionEnvironment,
  useVideoConfig,
} from "remotion";
import { Laptop } from "./Laptop";

const { fontFamily } = loadFont("normal", { weights: ["600"], subsets: ["latin"] });

export type PromoProps = {
  readonly caption: string;
  readonly screenSrc: string;
};

// Luz de estudio para los reflejos del aluminio
const Environment: React.FC = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  }, [gl, scene]);
  return null;
};

// La cámara se mueve muy poco, como un celular en la mano, y se acerca despacio
const Camera: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;

  const az = THREE.MathUtils.degToRad(-21 + Math.sin(frame * 0.021) * 1.1 + Math.sin(frame * 0.0071) * 1.6);
  const el = THREE.MathUtils.degToRad(8 + Math.sin(frame * 0.017 + 1) * 0.5);
  const dist = interpolate(frame, [0, durationInFrames], [1.0, 0.92], {
    easing: Easing.bezier(0.33, 0, 0.67, 1),
  });
  const target = new THREE.Vector3(-0.022, 0.1, -0.04);
  camera.fov = 34;
  camera.position.set(
    target.x + dist * Math.sin(az) * Math.cos(el),
    target.y + dist * Math.sin(el),
    target.z + dist * Math.cos(az) * Math.cos(el),
  );
  camera.rotation.z = THREE.MathUtils.degToRad(Math.sin(frame * 0.013) * 0.35);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
  return null;
};

// Escritorio que se desvanece hacia el fondo y sombra suave bajo el portátil
const Desk: React.FC = () => {
  const { fade, shadow } = useMemo(() => {
    const radial = (stops: [number, string][]) => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d")!;
      const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      stops.forEach(([o, col]) => r.addColorStop(o, col));
      g.fillStyle = r;
      g.fillRect(0, 0, 256, 256);
      return new THREE.CanvasTexture(c);
    };
    return {
      fade: radial([[0, "#fff"], [0.55, "#f4f4f4"], [1, "#000"]]),
      shadow: radial([[0, "rgba(0,0,0,.7)"], [0.6, "rgba(0,0,0,.25)"], [1, "rgba(0,0,0,0)"]]),
    };
  }, []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[2.4, 2.4]} />
        <meshStandardMaterial color="#a9adb2" roughness={0.4} metalness={0} transparent opacity={0.965} alphaMap={fade} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0005, 0.01]}>
        <planeGeometry args={[0.46, 0.34]} />
        <meshBasicMaterial map={shadow} transparent depthWrite={false} />
      </mesh>
    </>
  );
};

const Scene: React.FC<{ screen: THREE.Texture | null }> = ({ screen }) => (
  <>
    <Environment />
    <Camera />
    <ambientLight intensity={0.25} />
    <directionalLight position={[-0.6, 1.2, 0.9]} intensity={1.6} color="#fff4ea" />
    <directionalLight position={[0.8, 0.6, -0.6]} intensity={0.9} color="#dfe6ff" />
    {/* reflejo en el escritorio: copia invertida debajo del piso semitransparente */}
    <group scale={[1, -1, 1]}>
      <Laptop screen={screen} />
    </group>
    <Desk />
    <Laptop screen={screen} />
  </>
);

// Al exportar, el lienzo solo se dibuja cuando cambia el cuadro. La textura del video llega
// después, así que se retiene la captura hasta volver a dibujar con la textura nueva.
const RenderScreen: React.FC<{ src: string }> = ({ src }) => {
  const texture = useOffthreadVideoTexture({ src });
  const frame = useCurrentFrame();
  const advance = useThree((s) => s.advance);
  const { delayRender, continueRender } = useDelayRender();
  const pending = useRef<number | null>(null);

  useLayoutEffect(() => {
    pending.current = delayRender(`Esperando la pantalla del cuadro ${frame}`);
    return () => {
      if (pending.current !== null) continueRender(pending.current);
      pending.current = null;
    };
  }, [frame, delayRender, continueRender]);

  useLayoutEffect(() => {
    if (!texture) return;
    advance(performance.now());
    if (pending.current !== null) continueRender(pending.current);
    pending.current = null;
  }, [texture, advance, continueRender]);

  return <Scene screen={texture} />;
};

const PreviewScreen: React.FC<{ videoRef: React.RefObject<HTMLVideoElement | null> }> = ({ videoRef }) => {
  const texture = useVideoTexture(videoRef);
  return <Scene screen={texture} />;
};

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
      <div
        style={{
          // visible desde el primer cuadro, que es la portada en TikTok
          scale: interpolate(frame, [0, 0.8 * fps], [1.04, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 22,
        }}
      >
        {/* mancuerna de perfil */}
        <svg width="96" height="44" viewBox="0 0 96 44" aria-hidden>
          <rect x="30" y="19" width="36" height="6" rx="2" fill="#eceef0" />
          <rect x="14" y="4" width="10" height="36" rx="3" fill="#d7262d" />
          <rect x="72" y="4" width="10" height="36" rx="3" fill="#d7262d" />
          <rect x="24" y="9" width="7" height="26" rx="2" fill="#2f48d4" />
          <rect x="65" y="9" width="7" height="26" rx="2" fill="#2f48d4" />
          <rect x="6" y="17" width="8" height="10" rx="2" fill="#eceef0" />
          <rect x="82" y="17" width="8" height="10" rx="2" fill="#eceef0" />
        </svg>
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 80,
            lineHeight: 1.05,
            color: "#fff",
            textAlign: "center",
            maxWidth: 900,
            textShadow: "0 2px 18px rgba(0,0,0,.35), 0 1px 3px rgba(0,0,0,.4)",
            letterSpacing: "-0.01em",
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Promo: React.FC<PromoProps> = ({ caption, screenSrc }) => {
  const { width, height } = useVideoConfig();
  const { isRendering } = useRemotionEnvironment();
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = staticFile(screenSrc);

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #c9cbce 0%, #b6b9bd 48%, #9da1a6 100%)" }}>
      {isRendering ? null : <Html5Video ref={videoRef} src={src} style={{ position: "absolute", opacity: 0 }} muted />}
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
        camera={{ fov: 34, near: 0.01, far: 10 }}
      >
        {isRendering ? <RenderScreen src={src} /> : <PreviewScreen videoRef={videoRef} />}
      </ThreeCanvas>
      <Caption text={caption} />
    </AbsoluteFill>
  );
};
