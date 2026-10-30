"""Read-only HTTP audit. Start a production server and pass its origin."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import html, json, re, sys, time, urllib.request, urllib.error
BASE=Path(__file__).resolve().parent.parent
origin=(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:3002').rstrip('/')
roots=json.loads((BASE/'src/data/taxonomy.json').read_text())
paths=[('/', 'Beyond the'),('/explore/','A country of stories'),('/nature/','A country of'),('/economy/','Ideas.'),('/urban-life/','Everyday places.')]
def walk(nodes,prefix=()):
    for node in nodes:
        path=(*prefix,node['slug']);paths.append(('/explore/'+'/'.join(path)+'/',node['title']));walk(node['children'],path)
walk(roots)
started=time.time();failures=[];titles=set();descriptions=set()
def check(item):
    path,expected=item
    try:
        response=urllib.request.urlopen(origin+path,timeout=20)
        body=response.read().decode();headings=re.findall(r'<h1\b[^>]*>(.*?)</h1>',body,re.S)
        title=re.search(r'<title>(.*?)</title>',body,re.S)
        description=re.search(r'<meta name="description" content="([^"]*)"',body)
        heading=html.unescape(re.sub('<[^>]+>','',headings[0])) if headings else ''
        return path,response.status,len(headings),html.unescape(title.group(1)) if title else '',html.unescape(description.group(1)) if description else '',expected in heading
    except Exception as error:return path,str(error),0,'','',False
with ThreadPoolExecutor(max_workers=12) as pool:
    for path,status,h1,title,description,expected in pool.map(check,paths):
        if status!=200 or h1!=1 or not title or not description or not expected:failures.append([path,status,h1,expected])
        if path.startswith('/explore/'):
            if title in titles:failures.append([path,'duplicate title'])
            if description in descriptions:failures.append([path,'duplicate description'])
            titles.add(title);descriptions.add(description)
invalid=[]
for path in ['/explore/not-a-category/','/explore/history/not-a-group/','/explore/history/ancient-civilizations/not-a-topic/','/explore/history/ancient-civilizations/elam/extra/']:
    try:status=urllib.request.urlopen(origin+path).status
    except urllib.error.HTTPError as error:status=error.code
    invalid.append({'path':path,'status':status})
    if status!=404:failures.append([path,'expected 404',status])
report={'checkedPages':len(paths),'allPagesPassed':not failures,'uniqueExploreTitles':len(titles),'uniqueExploreDescriptions':len(descriptions),'invalidRoutes':invalid,'failures':failures,'elapsedSeconds':round(time.time()-started,2)}
(BASE/'docs/route-verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2));sys.exit(bool(failures))
