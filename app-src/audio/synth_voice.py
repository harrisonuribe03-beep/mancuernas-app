"""Graba con edge-tts (voz neuronal es-CO-SalomeNeural) cada frase de voice/catalog.json que todavía no
tenga clip en voice/salome/. Deja los mp3 crudos en out/voz/<hash>.mp3; el recorte y la normalización
se hacen después con process_voice.py."""
import asyncio, json, os, sys
import edge_tts

VOICE = 'es-CO-SalomeNeural'
STYLE = {'info': ('+4%', '+0Hz'), 'hype': ('+9%', '+3Hz'), 'calm': ('-6%', '-1Hz')}
cat = json.load(open('voice/catalog.json'))
have = {f[:-4] for f in os.listdir('voice/salome')} if os.path.isdir('voice/salome') else set()
os.makedirs('out/voz', exist_ok=True)
todo = [(h, v) for h, v in cat.items() if h not in have]
print(len(cat), 'frases,', len(todo), 'por grabar')
fails = []

async def one(sem, h, v):
    rate, pitch = STYLE.get(v['s'], STYLE['info'])
    async with sem:
        for i in range(4):
            try:
                await edge_tts.Communicate(v['t'], VOICE, rate=rate, pitch=pitch).save(f'out/voz/{h}.mp3')
                if os.path.getsize(f'out/voz/{h}.mp3') > 1000: return
            except Exception as e:
                err = e
            await asyncio.sleep(2 + i * 3)
        fails.append((h, v['t'], str(err) if 'err' in dir() else 'vacío'))

async def main():
    sem = asyncio.Semaphore(4)
    await asyncio.gather(*(one(sem, h, v) for h, v in todo))

asyncio.run(main())
json.dump(fails, open('out/voz/_fallos.json', 'w'), ensure_ascii=False, indent=1)
print('listo;', len(fails), 'fallos')
