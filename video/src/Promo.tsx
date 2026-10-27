import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { useVideoConfig } from "remotion";
import { Cierre } from "./Cierre";
import { Curl } from "./Curl";
import { Intro } from "./Intro";

export const Promo = () => {
  const { fps } = useVideoConfig();

  return (
    <TransitionSeries name="Escenas">
      <TransitionSeries.Sequence name="Intro" durationInFrames={2 * fps}>
        <Intro
          style={{
            backgroundColor: "#0d0f13",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={linearTiming({ durationInFrames: 12 })}
      />
      <TransitionSeries.Sequence name="Curl" durationInFrames={2.8 * fps}>
        <Curl style={{ backgroundColor: "#f4f5f8" }} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: 12 })}
      />
      <TransitionSeries.Sequence name="Cierre" durationInFrames={2 * fps}>
        <Cierre
          style={{
            backgroundColor: "#3d5afe",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
