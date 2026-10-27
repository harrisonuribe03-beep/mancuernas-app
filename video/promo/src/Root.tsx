import { Composition } from "remotion";
import { Promo } from "./Promo";

// 588 cuadros = 19,6 s, lo que dura la grabación de la landing (video/landing/out/landing.mp4)
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Promo"
      component={Promo}
      durationInFrames={588}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ caption: "¿Puedes creer que Claude hizo esto?", screenSrc: "landing.mp4" }}
    />
  );
};
