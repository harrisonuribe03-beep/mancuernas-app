#!/bin/bash
# Arma el paquete "Gimnasio" a partir de grabaciones de Mixkit (licencia gratuita de Mixkit).
# Uso: build_gym_pack.sh <carpeta con mix-<id>.mp3> <carpeta destino>
set -e
I="$1"; O="$2"; mkdir -p "$O"
f(){ ffmpeg -v error -y "$@"; }
# tick: primer pitido de la cuenta regresiva de carreras (1051)
f -i "$I/mix-1051.mp3" -af "atrim=0:0.5,afade=t=out:st=0.32:d=0.18" -ac 1 -ar 44100 /tmp/tick.wav
# go: pitido agudo de largada (1051)
f -i "$I/mix-1051.mp3" -af "atrim=1.78:2.75,asetpts=PTS-STARTPTS,afade=t=out:st=0.55:d=0.42" -ac 1 -ar 44100 /tmp/go.wav
# set: golpe del bloque de pesas de una máquina (2115)
f -i "$I/mix-2115.mp3" -af "atrim=1.49:2.02,asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st=0.33:d=0.2" -ac 1 -ar 44100 /tmp/set.wav
# half: campana de aviso (586)
f -i "$I/mix-586.mp3" -af "atrim=0:1.0,afade=t=out:st=0.55:d=0.45" -ac 1 -ar 44100 /tmp/half.wav
# work: pito de árbitro (615)
f -i "$I/mix-615.mp3" -af "atrim=0.09:0.75,asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st=0.35:d=0.3" -ac 1 -ar 44100 /tmp/work.wav
# rest: campana de varios golpes, como de round (600)
f -i "$I/mix-600.mp3" -af "atrim=0:1.4,afade=t=out:st=0.85:d=0.55" -ac 1 -ar 44100 /tmp/rest.wav
# pr: público celebrando (459)
f -i "$I/mix-459.mp3" -af "atrim=0.37:3.0,asetpts=PTS-STARTPTS,afade=t=in:d=0.06,afade=t=out:st=1.9:d=0.73" -ar 44100 /tmp/pr.wav
# lvl: fanfarria de trompetas con estadio de fondo (722 + 462)
f -i "$I/mix-722.mp3" -i "$I/mix-462.mp3" -filter_complex "[0:a]atrim=0.04:2.4,asetpts=PTS-STARTPTS,aformat=channel_layouts=stereo[a];[1:a]atrim=0.6:4.2,asetpts=PTS-STARTPTS,volume=0.5,adelay=350|350,aformat=channel_layouts=stereo[b];[a][b]amix=inputs=2:normalize=0:duration=longest,atrim=0:3.9,afade=t=out:st=2.9:d=1.0" -ar 44100 /tmp/lvl.wav
# done: campana de fin de round y aplausos con gritos (600 + 518)
f -i "$I/mix-600.mp3" -i "$I/mix-518.mp3" -filter_complex "[0:a]atrim=0:1.3,afade=t=out:st=0.9:d=0.4,aformat=channel_layouts=stereo[a];[1:a]atrim=0.5:4.2,asetpts=PTS-STARTPTS,volume=0.8,adelay=450|450,aformat=channel_layouts=stereo[b];[a][b]amix=inputs=2:normalize=0:duration=longest,atrim=0:3.9,afade=t=out:st=2.9:d=1.0" -ar 44100 /tmp/done.wav
for n in tick go set half work rest pr lvl done; do
  # volumen parejo: pico a -1 dBFS en efectos cortos, algo más bajo en el público
  pk=$(ffmpeg -hide_banner -i /tmp/$n.wav -af volumedetect -f null - 2>&1 | sed -n 's/.*max_volume: \(-\?[0-9.]*\) dB/\1/p')
  case $n in pr|lvl|done) t=-3;; set) t=-2;; *) t=-1;; esac
  g=$(python3 -c "print(round($t-($pk),2))")
  f -i /tmp/$n.wav -af "volume=${g}dB" -c:a pcm_s16le "$O/$n.wav"
  echo "$n pico $pk → ganancia $g dB, $(ffprobe -v error -show_entries format=duration -of csv=p=0 $O/$n.wav) s"
done
