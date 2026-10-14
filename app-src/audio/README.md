# Audio

- `voice/catalog.json`: todas las frases que puede decir la coach (la app lo genera con `__voiceCatalog()`).
- `voice/salome/<hash>.mp3`: un clip por frase, grabado con la voz neuronal colombiana es-CO-SalomeNeural.
- `sounds/<paquete>/*.wav`: los 9 efectos de cada paquete (tick, go, set, half, work, rest, pr, lvl, done).
- `sources/`: grabaciones originales del paquete Gimnasio (Mixkit, licencia gratuita de Mixkit).

## Regenerar la voz

1. Cambiar las frases en `js/26-coach.js` y sacar el catálogo nuevo (prueba `qa2/catalog.py`).
2. Correr el flujo **Generar audio** con la tarea `voz`: graba solo las frases nuevas y las deja en la rama `audio-voz`.
3. `python3 process_voice.py <carpeta cruda>`: recorta silencios, iguala volumen y borra clips viejos.
4. La tarea `verificar` transcribe una muestra con Whisper para revisar la pronunciación.

## Paquete Gimnasio

`build_gym_pack.sh sources sounds/gym` recorta y nivela las grabaciones.
