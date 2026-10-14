#!/bin/bash
# Corre en GitHub Actions: genera el audio y lo publica en la rama audio-<tarea>.
# Los registros no se pueden leer desde fuera, así que el resumen y los errores salen como anotaciones.
T="$1"; REPO="$2"; TOKEN="$3"
cd "$(dirname "$0")"
note(){ local m; m=$(tail -c 3500 "$2" | sed -e 's/%/%25/g' -e 's/\r//g' | awk '{printf "%s%%0A",$0}'); echo "::$1 title=Audio::$m"; }
set -o pipefail
if ! bash gen.sh "$T" 2>&1 | tee /tmp/gen.log; then note error /tmp/gen.log; exit 1; fi
note notice /tmp/gen.log
cd out
{
  git init -q
  git checkout -q -b "audio-$T"
  git config user.name "github-actions[bot]"
  git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
  git add -A
  git commit -q -m "Audio generado ($T)"
  git push -q -f "https://x-access-token:${TOKEN}@github.com/${REPO}.git" "HEAD:audio-$T"
} > /tmp/pub.log 2>&1 || { note error /tmp/pub.log; exit 1; }
echo "Publicado en audio-$T"
