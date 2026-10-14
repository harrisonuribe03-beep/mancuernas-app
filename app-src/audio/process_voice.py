"""Recorta silencios, iguala el volumen y comprime los clips crudos de la voz.
Uso: python3 process_voice.py <carpeta_cruda>   → escribe voice/salome/<hash>.mp3"""
import json, os, subprocess, sys, re
from concurrent.futures import ThreadPoolExecutor

RAW = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'voice/salome')
os.makedirs(OUT, exist_ok=True)
TARGET = -17.0  # dB RMS medio aproximado

def mean_db(path):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True)
    m = re.search(r'mean_volume: (-?[\d.]+) dB', r.stderr); p = re.search(r'max_volume: (-?[\d.]+) dB', r.stderr)
    return (float(m.group(1)) if m else -20.0, float(p.group(1)) if p else -3.0)

def one(f):
    h = f[:-4]; src = os.path.join(RAW, f); dst = os.path.join(OUT, h + '.mp3')
    trim = ('silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.02,'
            'areverse,silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.06,areverse,'
            'afade=t=in:d=0.008')
    tmp = dst + '.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', trim, '-ac', '1', '-ar', '24000', tmp], check=True)
    mean, peak = mean_db(tmp)
    gain = min(TARGET - mean, -1.0 - peak)  # sin pasar de -1 dBFS
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'volume={gain:.2f}dB,apad=pad_dur=0.04',
                    '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', '48k', dst], check=True)
    os.remove(tmp)
    return h

files = [f for f in os.listdir(RAW) if f.endswith('.mp3')]
with ThreadPoolExecutor(8) as ex:
    done = list(ex.map(one, files))
print(len(done), 'clips procesados en', OUT)
