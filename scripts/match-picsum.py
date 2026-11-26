"""Rebuild deterministic daily links from visually reviewed Picsum candidates."""
import json
from pathlib import Path
root = Path(__file__).resolve().parent.parent

def read(path):
    return json.loads((root / path).read_text())

def write(path, value):
    (root / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

catalog = {int(p['id']): p for p in read('src/data/sources/picsum-catalog.json')}
groups = read('src/data/sources/picsum-tags.json')
tags = {}
for label, ids in groups.items():
    for image_id in ids:
        if image_id in catalog:
            tags.setdefault(image_id, set()).update(label.split())
days = read('src/data/calendar/2027.json')
used = set()
links = {}
# Rare motifs are allocated before general landscape imagery.
ordered = sorted(days, key=lambda d: (d['date'] != '2027-01-01', -sum(c in d['poetry']['content'] for c in '雪霜冰花梅星月'), d['date']))
for day in ordered:
    verse = day['poetry']['content'] + day['poetry']['title']
    wants = set()
    for label, chars in [('雪','雪霜冰'),('花','花芳桃杏梅'),('星','星夜月'),('水','水江河湖海溪泉'),('林','林树木松竹'),('田','田草野麦'),('雨','雨露'),('山','山岭峰岳岩')]:
        if any(c in verse for c in chars): wants.add(label)
    def score(image_id):
        t = tags[image_id]
        value = 20 * len(t & wants)
        if day['date'] == '2027-01-01' and image_id == 896: value += 1000
        if day['season'] in t: value += 12
        if '雪' in t and day['season'] != '冬': value -= 100
        if '秋' in t and day['season'] == '春': value -= 20
        if '花' in t and day['season'] == '冬': value -= 30
        if not wants and ('山' in t or '水' in t): value += 3
        return value, -image_id
    image_id = max((i for i in tags if i not in used), key=score)
    used.add(image_id)
    photo = catalog[image_id]
    matched = sorted(wants & tags[image_id])
    reason = '诗句意象：' + '、'.join(matched) if matched else '季节与宁静自然意境搭配（非节日实景）'
    background = dict(day['background'])
    background.update(url=f'https://picsum.photos/id/{image_id}/1920/1080.webp', mobileUrl=f'https://picsum.photos/id/{image_id}/900/1600.webp', source='Lorem Picsum / Unsplash', sourceUrl=photo['url'], author=photo['author'], license='Unsplash License — https://unsplash.com/license', style='自然风景摄影', description='、'.join(sorted(tags[image_id]))+'；'+reason, keywords=sorted(tags[image_id]), overlayOpacity=0.55, isFallback=False)
    day['background'] = background
    links[day['date']] = background
write('src/data/calendar/2027.json', days)
write('src/data/sources/artwork-links.json', links)
print(f'Assigned {len(used)} unique, visually screened Picsum IDs.')
