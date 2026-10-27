import {
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const IntroInner = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 36,
      }}
    >
      <Interactive.Div
        name="Antetítulo"
        style={{
          fontFamily: "Plus Jakarta Sans",
          fontWeight: 500,
          fontSize: 44,
          letterSpacing: 8,
          color: "#a3a9b5",
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        ENTRENA DONDE ESTÉS
      </Interactive.Div>
      <Interactive.Div
        name="Título"
        style={{
          fontFamily: "Plus Jakarta Sans",
          fontWeight: 800,
          fontSize: 150,
          letterSpacing: -4,
          color: "#f3f4f6",
          opacity: interpolate(frame, [0.2 * fps, 0.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.2 * fps, 1 * fps],
            ["0px 90px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Mancuernas
      </Interactive.Div>
      <Interactive.Div
        name="Barra"
        style={{
          height: 14,
          borderRadius: 7,
          backgroundColor: "#5b74ff",
          width: interpolate(frame, [0.6 * fps, 1.3 * fps], [0, 360], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />
    </div>
  );
};

export const Intro = Interactive.create({
  Component: IntroInner,
  layout: "absolute-fill",
  schema: {
    ...Interactive.backgroundSchema,
  },
});
