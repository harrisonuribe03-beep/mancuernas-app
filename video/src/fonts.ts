import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// La misma fuente que usa la app
loadFont({
  family: "Plus Jakarta Sans",
  url: staticFile("fonts/plus-jakarta-sans-latin-500-normal.woff2"),
  weight: "500",
});
loadFont({
  family: "Plus Jakarta Sans",
  url: staticFile("fonts/plus-jakarta-sans-latin-800-normal.woff2"),
  weight: "800",
});
