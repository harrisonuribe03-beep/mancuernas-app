import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const CierreInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Interactive.Div
        name="Línea 1"
        style={{
          fontFamily: "Plus Jakarta Sans",
          fontWeight: 800,
          fontSize: 150,
          letterSpacing: -4,
          color: "#ffffff",
          opacity: interpolate(frame, [0.3 * fps, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.3 * fps, 1 * fps],
            ["0px 70px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Tu plan.
      </Interactive.Div>
      <Interactive.Div
        name="Línea 2"
        style={{
          fontFamily: "Plus Jakarta Sans",
          fontWeight: 800,
          fontSize: 150,
          letterSpacing: -4,
          color: "#ffffff",
          opacity: interpolate(frame, [0.6 * fps, 1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.6 * fps, 1.3 * fps],
            ["0px 70px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Tu ritmo.
      </Interactive.Div>
      <Interactive.Div
        name="Firma"
        style={{
          marginTop: 60,
          fontFamily: "Plus Jakarta Sans",
          fontWeight: 500,
          fontSize: 48,
          color: "#e9edff",
          opacity: interpolate(frame, [1 * fps, 1.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Mancuernas · App para Android
      </Interactive.Div>
    </div>
  );
};

export const Cierre = Interactive.create({
  Component: CierreInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
