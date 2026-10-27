import {
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Cuenta una repetición cada vez que los brazos suben (cada 24 frames desde el 10)
const RepCounter = () => {
  const frame = useCurrentFrame();
  const reps = Math.min(3, Math.max(0, Math.floor((frame - 10) / 24) + 1));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 20,
        fontFamily: "Plus Jakarta Sans",
        color: "#0f1115",
      }}
    >
      <span style={{ fontWeight: 800, fontSize: 180, lineHeight: 1 }}>
        {reps}
      </span>
      <span style={{ fontWeight: 500, fontSize: 60, color: "#5a6170" }}>
        / 3 reps
      </span>
    </div>
  );
};

const CurlInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "150px 80px 170px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Interactive.Div
          name="Etiqueta"
          style={{
            fontFamily: "Plus Jakarta Sans",
            fontWeight: 800,
            fontSize: 44,
            letterSpacing: 6,
            color: "#3d5afe",
          }}
        >
          EJERCICIO 1
        </Interactive.Div>
        <Interactive.Div
          name="Nombre del ejercicio"
          style={{
            fontFamily: "Plus Jakarta Sans",
            fontWeight: 800,
            fontSize: 104,
            letterSpacing: -2,
            color: "#0f1115",
          }}
        >
          Curl de bíceps
        </Interactive.Div>
      </div>
      <div
        style={{
          position: "relative",
          width: 1000,
          height: 1000,
          scale: interpolate(frame, [0, 0.6 * fps], [0.9, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        <Img
          name="Pose abajo"
          src={staticFile("img/curl-biceps-a.webp")}
          style={{ position: "absolute", inset: 0, width: 1000, height: 1000 }}
        />
        <Img
          name="Pose arriba"
          src={staticFile("img/curl-biceps-b.webp")}
          style={{
            position: "absolute",
            inset: 0,
            width: 1000,
            height: 1000,
            opacity: interpolate(
              frame,
              [8, 10, 20, 22, 32, 34, 44, 46, 56, 58, 68, 70],
              [0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            ),
          }}
        />
      </div>
      <RepCounter />
    </div>
  );
};

export const Curl = Interactive.create({
  Component: CurlInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
