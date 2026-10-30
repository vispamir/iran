"""Compile the reviewed bilingual taxonomy. Never executed by the website."""
from pathlib import Path
import json, re, unicodedata, sys
BASE = Path(__file__).resolve().parent.parent
source=[]
for line in (BASE/'docs/terms.md').read_text().splitlines():
    if line.startswith('## '): source.append({'title':re.sub(r'^##\s+[\d۰-۹]+\.\s*','',line),'groups':[]})
    elif line.startswith('- '): source[-1]['groups'].append({'title':line[2:],'leaves':[]})
    elif line.startswith('  - '): source[-1]['groups'][-1]['leaves'].append(line[4:])
english=[]
for line in (BASE/'src/data/taxonomy-en.txt').read_text().splitlines():
    if line.startswith('# '):
        title,slug=line[2:].split(' | '); english.append({'title':title,'slug':slug,'groups':[]})
    elif line.strip():
        title,leaves=line.split(' | ');english[-1]['groups'].append({'title':title,'leaves':leaves.split('; ')})
copy=[]
for line in (BASE/'src/data/taxonomy-copy.txt').read_text().splitlines():
    if line.startswith('# '): copy.append({'slug':line[2:],'groups':[]})
    elif line.startswith('@ '): copy[-1]['groups'].append({'title':line[2:]})
    elif line.strip():
        g=copy[-1]['groups'][-1]
        if 'intro' not in g:g['intro']=line
        else:g['leaves']=line.split('|')
roots=json.loads((BASE/'src/data/taxonomy-roots.json').read_text())
assert len(source)==len(english)==len(copy)==len(roots)==26
ICON_RULES=[('water',r'river|lake|water|sea|coast|irrigation|marine'),('mountain',r'mountain|highland|geograph|desert'),('nature',r'forest|biodiversity|climate|environment|conservation|plant|sustainab|circular'),('music',r'music|instrument|sing|radif|tar &'),('book',r'literature|publishing|book|poetry|writing|language|dialect'),('film',r'cinema|film|television|screen|visual effects|animation'),('technology',r'technolog|software|digital|cloud|cyber|data center|comput|telecom|electronic|smart|artificial intelligence'),('finance',r'bank|financ|payment|insurance|capital market|macroeconomic'),('industry',r'industry|industrial|manufactur|factor|production|metal|chemical|material'),('travel',r'travel|touris|adventure'),('education',r'education|universit|school|training|academic'),('science',r'science|scientific|research|biotechnolog'),('health',r'health|medical|pharma|care'),('law',r'law|legal|registration|intellectual|judicial'),('governance',r'government|policy|administration|politic|election|legislative|executive'),('people',r'family|society|population|migration|social|communit|people'),('arts',r'art|design|craft|paint|calligraph|fashion'),('agriculture',r'agricultur|food|livestock|horticultur|crop'),('urban',r'urban|transport|rail|road|housing|port|infrastructure'),('markets',r'market|retail|trade|commerce|distribution'),('history',r'histor|ancient|dynast|empire|heritage')]
def icon(title,fallback):
    return next((key for key,pattern in ICON_RULES if re.search(pattern,title,re.I)),fallback)
def slugify(s):
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower().replace('&',' and ')
    return re.sub(r'[^a-z0-9]+','-',s).strip('-')
def unique_slug(title,seen):
    slug=slugify(title);assert slug
    if slug in seen:raise ValueError('Duplicate sibling slug: '+title)
    seen.add(slug);return slug
tree=[]
for ri,(fa,en,co,meta) in enumerate(zip(source,english,copy,roots)):
    assert en['slug']==co['slug']
    assert len(fa['groups'])==len(en['groups'])==len(co['groups'])
    root={'id':f'topic-{ri+1}','sourceTitle':fa['title'],'title':en['title'],'slug':en['slug'],**meta,'children':[]}
    seen=set()
    for gi,(fg,eg,cg) in enumerate(zip(fa['groups'],en['groups'],co['groups'])):
        assert eg['title']==cg['title']
        assert len(fg['leaves'])==len(eg['leaves'])==len(cg['leaves'])
        group={'id':f'topic-{ri+1}-{gi+1}','sourceTitle':fg['title'],'title':eg['title'],'slug':unique_slug(eg['title'],seen),'intro':cg['intro'],'icon':icon(eg['title'],root['icon']),'children':[]}
        # Match the agreed example URL without changing the visible title.
        if root['slug']=='history' and gi==0:group['slug']='ancient-civilizations'
        leaf_seen=set()
        for li,(ftext,etext,intro) in enumerate(zip(fg['leaves'],eg['leaves'],cg['leaves'])):
            group['children'].append({'id':f'topic-{ri+1}-{gi+1}-{li+1}','sourceTitle':ftext,'title':etext,'slug':unique_slug(etext,leaf_seen),'intro':intro,'icon':icon(etext,group['icon']),'children':[]})
        root['children'].append(group)
    tree.append(root)
compiled_tree=json.dumps(tree,ensure_ascii=False,indent=2)+'\n'
# Keep long introductions and Persian editorial labels out of the client menu bundle.
def navigation(n):return {k:([navigation(c) for c in v] if k=='children' else v) for k,v in n.items() if k in ['title','slug','icon','image','children']}
compiled_nav=json.dumps([navigation(n) for n in tree],separators=(',',':'))+'\n'
for filename,content in [('taxonomy.json',compiled_tree),('taxonomy-navigation.json',compiled_nav)]:
    target=BASE/'src/data'/filename
    if '--check' in sys.argv:
        assert target.read_text()==content, f'{filename} is out of date; run npm run taxonomy:compile'
    else:target.write_text(content)
print('Compiled 26 categories, 240 subcategories and 1476 topics.')
