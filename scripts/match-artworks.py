import json,re,hashlib,sys
from pathlib import Path
arts=json.load(open(sys.argv[1]))['data']
arts=[a for a in arts if re.search('ink|watercolor|color on|colours on',a['technique'],re.I) and not re.search('portrait|buddh|arhat|luohan|bodhisattva|battle|hunt|kill|beggar|emperor|calligraphy|hell|demon|guardian|madam|court ladies|Han Yige|man riding carp',a['title'],re.I)]
groups=[('春','spring|peach|blossom|willow','春桃杏柳燕莺'),('夏','summer|lotus|bamboo','夏荷莲竹'),('秋','autumn|chrysanthemum|maple','秋菊枫桂'),('冬','winter|snow|plum','冬雪梅冰寒'),('山','mountain|landscape|peak|hill','山峰岳岭岩'),('水','river|stream|lake|water|fish','江河水溪湖泉鱼'),('舟','boat|sail|fisher','舟帆船渔'),('月','moon|night|evening','月夜夕'),('雨','rain|mist|cloud','雨烟雾云'),('花','flower|blossom|peony|rose','花芳红'),('鸟','bird|sparrow|crane|goose','鸟雀鹤雁'),('松','pine|tree|forest','松树林木'),('闲居','pavilion|cottage|village|garden|scholar','亭居村园闲归')]
for a in arts:
 a['_tags']=[k for k,en,cn in groups if re.search(en,a['title']+' '+(a.get('description') or ''),re.I)]
arts=[a for a in arts if a['_tags']]
print('candidates',len(arts))
days=json.load(open('src/data/calendar/2027.json'))
used=set(); mapping={}
# Allocate rare seasonal and festival needs before general landscapes.
ordered=sorted(days,key=lambda d:(not bool(d['festivals'] or d['solarTerm']),-sum(c in d['poetry']['content'] for c in '雪梅荷月菊桃')))
for d in ordered:
 text=d['poetry']['content']+d['poetry']['title']+' '.join(d['festivals'])
 tags=[k for k,en,cn in groups if any(c in text for c in cn)]
 def score(a):
  at=a['_tags']; s=sum(12 for t in tags if t in at)+ (20 if d['season'] in at else 0)
  s-=sum(45 for t in ['春','夏','秋','冬'] if t in at and t!=d['season'])
  if '中秋节' in d['festivals'] and '月' in at:s+=100
  return s+int(hashlib.sha256((d['date']+str(a['id'])).encode()).hexdigest()[:6],16)/0xffffff
 a=max((a for a in arts if a['id'] not in used),key=score); used.add(a['id'])
 matches=[t for t in tags if t in a['_tags']]
 reason='诗句意象：'+ '、'.join(matches) if matches else ('季节：'+d['season'] if d['season'] in a['_tags'] else '古典山水与闲居意境；非节日专属画作')
 b=d['background'];b.update(url=a['images']['web']['url'],mobileUrl=None,source='Cleveland Museum of Art',sourceUrl=a['url'],author='；'.join(c['description'] for c in a['creators']) or '佚名（馆藏未署名）',license=a['share_license_status'],style='中国古典水墨／设色绘画',description=a['title']+' — '+reason,keywords=a['_tags'],isFallback=False)
 mapping[d['date']]=b.copy()
selected=[{k:a[k] for k in ['id','title','url','technique','images','share_license_status']} for a in arts if a['id'] in used]
Path('src/data/sources/artwork-links.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2)+'\n')
Path('src/data/calendar/2027.json').write_text(json.dumps(days,ensure_ascii=False,indent=2)+'\n')

print('unique artworks',len(used))
