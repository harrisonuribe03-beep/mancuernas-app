import "./fonts";
import { Composition, Folder } from "remotion";
import { Cierre } from "./Cierre";
import { Curl } from "./Curl";
import { Intro } from "./Intro";
import { Promo } from "./Promo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Promo"
        component={Promo}
        durationInFrames={180}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="Escenas">
        <Composition
          id="Intro"
          component={Intro}
          durationInFrames={60}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            style: {
              backgroundColor: "#0d0f13",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />
        <Composition
          id="Curl"
          component={Curl}
          durationInFrames={84}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            style: { backgroundColor: "#f4f5f8" },
          }}
        />
        <Composition
          id="Cierre"
          component={Cierre}
          durationInFrames={60}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            style: {
              backgroundColor: "#3d5afe",
              justifyContent: "center",
              alignItems: "center",
            },
          }}
        />
      </Folder>
    </>
  );
};
