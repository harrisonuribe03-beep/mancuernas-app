import { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

// Medidas en metros, parecidas a un portátil de 13 pulgadas
export const BASE = { w: 0.31, d: 0.215, h: 0.014 };
export const LID = { h: 0.205, t: 0.006, open: 106 };
// La pantalla es 16:10, igual que la grabación de 1920×1200
export const SCREEN = { w: 0.288, h: 0.18 };

const shell = { color: "#141518", metalness: 0.55, roughness: 0.46 };

// Brillo diagonal del vidrio, muy tenue
const glare = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 160;
  const g = c.getContext("2d")!;
  const l = g.createLinearGradient(0, 0, 256, 160);
  l.addColorStop(0, "rgba(255,255,255,0.10)");
  l.addColorStop(0.42, "rgba(255,255,255,0.03)");
  l.addColorStop(0.43, "rgba(255,255,255,0)");
  l.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = l;
  g.fillRect(0, 0, 256, 160);
  return new THREE.CanvasTexture(c);
})();

const Keyboard: React.FC = () => {
  const { geo, matrices } = useMemo(() => {
    const geo = new RoundedBoxGeometry(0.0158, 0.0022, 0.0158, 2, 0.0015);
    const m: THREE.Matrix4[] = [];
    const cols = 14, rows = 6, pitch = 0.0191;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // la fila de abajo tiene la barra espaciadora: se salta el centro y se pone una tecla larga
        if (r === rows - 1 && c > 3 && c < 10) continue;
        const x = (c - (cols - 1) / 2) * pitch;
        const z = -0.088 + r * pitch;
        m.push(new THREE.Matrix4().makeTranslation(x, BASE.h + 0.0006, z));
      }
    }
    return { geo, matrices: m };
  }, []);

  return (
    <group>
      <instancedMesh
        args={[geo, undefined, matrices.length]}
        ref={(mesh) => {
          if (!mesh) return;
          matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
          mesh.instanceMatrix.needsUpdate = true;
        }}
      >
        <meshStandardMaterial color="#0f1012" metalness={0.1} roughness={0.75} />
      </instancedMesh>
      {/* barra espaciadora */}
      <mesh position={[0, BASE.h + 0.0006, -0.088 + 5 * 0.0191]}>
        <boxGeometry args={[0.1, 0.0022, 0.0158]} />
        <meshStandardMaterial color="#0f1012" metalness={0.1} roughness={0.75} />
      </mesh>
      {/* panel táctil */}
      <mesh position={[0, BASE.h + 0.0001, 0.064]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.125, 0.075]} />
        <meshStandardMaterial color="#25282c" metalness={0.5} roughness={0.32} />
      </mesh>
    </group>
  );
};

type Props = {
  readonly screen: THREE.Texture | null;
};

export const Laptop: React.FC<Props> = ({ screen }) => {
  const baseGeo = useMemo(() => new RoundedBoxGeometry(BASE.w, BASE.h, BASE.d, 4, 0.006), []);
  const lidGeo = useMemo(() => new RoundedBoxGeometry(BASE.w, LID.h, LID.t, 4, 0.0028), []);
  const tilt = THREE.MathUtils.degToRad(LID.open - 90);

  if (screen) {
    screen.colorSpace = THREE.SRGBColorSpace;
    screen.anisotropy = 8;
  }

  return (
    <group>
      <mesh geometry={baseGeo} position={[0, BASE.h / 2, 0]}>
        <meshStandardMaterial {...shell} />
      </mesh>
      <Keyboard />
      {/* la tapa gira sobre la bisagra en el borde de atrás */}
      <group position={[0, BASE.h, -BASE.d / 2 + 0.004]} rotation={[-tilt, 0, 0]}>
        <mesh geometry={lidGeo} position={[0, LID.h / 2, -LID.t / 2]}>
          <meshStandardMaterial {...shell} />
        </mesh>
        {/* vidrio negro del marco */}
        <mesh position={[0, LID.h / 2, 0.0001]}>
          <planeGeometry args={[BASE.w - 0.004, LID.h - 0.004]} />
          <meshPhysicalMaterial color="#050506" roughness={0.08} metalness={0} clearcoat={1} />
        </mesh>
        <mesh position={[0, LID.h / 2 + 0.004, 0.0003]}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
          {/* la key fuerza un material nuevo cuando llega la textura: three.js no recompila el shader solo */}
          {screen ? <meshBasicMaterial key="video" map={screen} toneMapped={false} /> : <meshBasicMaterial key="off" color="#111" />}
        </mesh>
        <mesh position={[0, LID.h / 2, 0.0006]}>
          <planeGeometry args={[BASE.w - 0.004, LID.h - 0.004]} />
          <meshBasicMaterial map={glare} transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};
