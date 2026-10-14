#!/bin/bash
# Uso: gen.sh prueba|voz|sonidos|todo
set -e
cd "$(dirname "$0")"
T="${1:-todo}"
mkdir -p out
if [ "$T" = "prueba" ]; then
  mkdir -p out/prueba
  edge-tts --list-voices | grep -E "^Name|es-CO|es-MX|es-US" | head -40 > out/prueba/voces.txt || true
  i=0
  while IFS='|' read -r rate pitch text; do
    i=$((i+1))
    edge-tts --voice es-CO-SalomeNeural --rate="$rate" --pitch="$pitch" --text "$text" --write-media out/prueba/p$i.mp3
    echo "p$i|$rate|$pitch|$text" >> out/prueba/index.txt
  done <<'L'
+0%|+0Hz|¡Hágale pues! Serie 2 de 4. 8 kilos, 10 repeticiones.
+8%|+2Hz|¡Eso es, qué berraquera! Vos podés con una más.
+5%|+0Hz|Descansá un minuto. Respirá hondo, que vas muy bien.
+10%|+4Hz|¡Ave María, nuevo récord! ¡Qué nivel, parce!
L
  ls -la out/prueba
fi

if [ "$T" = "sonidos" ] || [ "$T" = "descubrir" ]; then
  python3 discover.py
  du -sh out/descubrir; ls out/descubrir/mp3 | wc -l
fi

if [ "$T" = "voz" ] || [ "$T" = "todo" ]; then
  python3 synth_voice.py
  ls out/voz | wc -l; du -sh out/voz
fi

if [ "$T" = "verificar" ]; then
  pip install -q faster-whisper "av>=14"
  python3 verify.py
fi
