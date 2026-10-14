"""Busca sonidos CC0 en Freesound y Mixkit, guarda el HTML y baja las vistas previas mejor valoradas.
Corre en GitHub Actions (el entorno local no tiene acceso a esos sitios)."""
import json, os, re, sys, time, urllib.parse, urllib.request

OUT = 'out/descubrir'
os.makedirs(OUT + '/mp3', exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      'Accept-Language': 'es,en;q=0.8'}

def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        b = r.read()
    return b if binary else b.decode('utf-8', 'replace')

FS_QUERIES = {
    'boxing-bell': 'boxing bell', 'ring-bell': 'boxing ring bell', 'fight-bell': 'fight bell',
    'whistle-ref': 'referee whistle', 'whistle-sport': 'sports whistle', 'coach-whistle': 'coach whistle',
    'dumbbell': 'dumbbell', 'weights': 'gym weights', 'kettlebell': 'kettlebell', 'plates': 'weight plates clank',
    'cheer': 'crowd cheer', 'stadium': 'stadium crowd cheer', 'applause': 'applause short', 'wooo': 'crowd woo',
    'airhorn': 'air horn', 'gong': 'gong', 'countdown': 'countdown beep', 'stopwatch': 'stopwatch beep',
    'timer-beep': 'timer beep', 'buzzer': 'sports buzzer', 'levelup': 'level up', 'success': 'success fanfare',
    'achievement': 'achievement', 'punch': 'punch impact', 'bell-ding': 'bell ding', 'start-race': 'race start beep',
}
MIX = ['cheer', 'whistle', 'bell', 'applause', 'sport', 'win', 'game', 'crowd', 'boxing', 'gym', 'beep', 'alarm', 'clock', 'horn', 'notification', 'achievement']

index = {'freesound': {}, 'mixkit': {}}
for key, q in FS_QUERIES.items():
    url = 'https://freesound.org/search/?' + urllib.parse.urlencode({
        'q': q, 'f': 'license:"Creative Commons 0" duration:[0 TO 10]', 's': 'Downloads (most first)', 'g': ''})
    try:
        html = get(url)
    except Exception as e:
        print('FS fallo', key, e); continue
    prev = re.findall(r'previews/\d+/(\d+)_(\d+)-(?:hq|lq)\.(?:mp3|ogg)', html)
    if not prev:
        snip = [html[m.start()-120:m.start()+160] for m in re.finditer(r'preview|\.mp3|sound-id|data-', html)][:4]
        print('FS sin vistas previas', key, len(html), [x.replace('\n', ' ') for x in snip])
    titles = dict(re.findall(r'/people/[^/"]+/sounds/(\d+)/"[^>]*>\s*([^<]{2,80})<', html))
    seen = []
    for sid, uid in prev:
        if (sid, uid) not in seen: seen.append((sid, uid))
    index['freesound'][key] = [{'id': s, 'user': u, 't': titles.get(s, '').strip()} for s, u in seen]
    for s, u in seen[:8]:
        f = f'{OUT}/mp3/fs-{key}-{s}.mp3'
        if os.path.exists(f): continue
        try:
            open(f, 'wb').write(get(f'https://cdn.freesound.org/previews/{int(s)//1000}/{s}_{u}-hq.mp3', True))
        except Exception as e:
            print('mp3 fallo', s, e)
        time.sleep(0.3)
    print('FS', key, len(seen))
    time.sleep(1)

for cat in MIX:
    try:
        html = get(f'https://mixkit.co/free-sound-effects/{cat}/')
    except Exception as e:
        print('MIX fallo', cat, e); continue
    urls = []
    for m in re.finditer(r'https://assets\.mixkit\.co/active_storage/sfx/(\d+)/\d+(?:-preview)?\.mp3', html):
        sid = m.group(1)
        if any(u['id'] == sid for u in urls): continue
        after = html[m.end():m.end() + 4000]
        t = re.search(r'item-grid-card__title[^>]*>\s*([^<]+)<', after) or re.search(r'<h\d[^>]*>\s*([^<]{3,80})<', after)
        d = re.search(r'(\d+:\d\d)', after)
        urls.append({'id': sid, 'url': m.group(0), 't': t.group(1).strip() if t else '', 'd': d.group(1) if d else ''})
    index['mixkit'][cat] = urls
    for u in urls[:40]:
        sid = u['id']
        f = f'{OUT}/mp3/mix-{sid}.mp3'
        if os.path.exists(f): continue
        try:
            open(f, 'wb').write(get(u['url'], True))
        except Exception as e:
            print('mp3 fallo', u['url'], e)
        time.sleep(0.2)
    print('MIX', cat, len(urls), '|', '; '.join(u['t'] for u in urls[:6]))

json.dump(index, open(f'{OUT}/index.json', 'w'), indent=1)
