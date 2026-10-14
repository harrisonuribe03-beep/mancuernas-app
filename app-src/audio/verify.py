"""Transcribe una muestra de clips con Whisper y la compara con el texto esperado."""
import json, os, random, re, unicodedata
from faster_whisper import WhisperModel

cat = json.load(open('voice/catalog.json'))
have = [f[:-4] for f in os.listdir('voice/salome') if f.endswith('.mp3')]
fixed = [h for h in have if not re.search(r'\d', cat[h]['t'])]
nums = [h for h in have if re.search(r'\d', cat[h]['t'])]
random.seed(7)
sample = fixed + random.sample(nums, min(90, len(nums)))
m = WhisperModel('small', device='cpu', compute_type='int8')
norm = lambda s: re.sub(r'[^a-z0-9ñ ]', '', unicodedata.normalize('NFKD', s.lower()).encode('ascii', 'ignore').decode()).split()
os.makedirs('out/verificar', exist_ok=True)
rows, bad = [], 0
for h in sample:
    segs, _ = m.transcribe(f'voice/salome/{h}.mp3', language='es', beam_size=5)
    got = ' '.join(s.text.strip() for s in segs)
    exp = cat[h]['t']
    a, b = set(norm(exp)), set(norm(got))
    score = len(a & b) / max(1, len(a))
    if score < 0.75: bad += 1
    rows.append(f'{score:.2f}\t{h}\t{exp}\t{got}')
rows.sort()
open('out/verificar/report.tsv', 'w').write('\n'.join(rows))
print(len(sample), 'clips;', bad, 'con diferencias')
print('\n'.join(rows[:45]))
