"""Optimize raster assets as high-quality WebP using Pillow (pip install Pillow).

Run from the repository root. SVG vectors remain scalable. Existing WebP files
are replaced only when re-encoding reduces their size. Uses quality 92,
keeps original dimensions, ICC profiles and lossless alpha. References in
tracked text files are migrated; external source URLs remain unchanged.
"""
from pathlib import Path
from io import BytesIO
import json
import subprocess
from PIL import Image, ImageOps

root = Path('public/images')
paths = sorted(p for p in root.rglob('*') if p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'})
reserved = {p.with_suffix('.webp') for p in paths if p.suffix == '.webp'}
mapping = {}
records = []
for source in paths:
    old_size = source.stat().st_size
    target = source if source.suffix == '.webp' else source.with_suffix('.webp')
    if source.suffix != '.webp':
        if target in reserved:
            target = source.with_name(source.stem + '-' + source.suffix[1:] + '.webp')
        if target in reserved:
            raise RuntimeError(f'Output collision: {target}')
        reserved.add(target)
    with Image.open(source) as original:
        if getattr(original, 'n_frames', 1) != 1:
            raise RuntimeError(f'Animated asset needs separate processing: {source}')
        pixels = ImageOps.exif_transpose(original).convert('RGBA')
        out = BytesIO()
        options = {'icc_profile': original.info['icc_profile']} if original.info.get('icc_profile') else {}
        pixels.save(out, format='WEBP', lossless=False, quality=92, method=6, alpha_quality=100, exact=True, **options)
        data = out.getvalue()
        with Image.open(BytesIO(data)) as decoded:
            if decoded.size != pixels.size or decoded.convert('RGBA').getchannel('A').tobytes() != pixels.getchannel('A').tobytes():
                raise RuntimeError(f'Dimension/alpha verification failed: {source}')
    if source != target or len(data) < old_size:
        target.write_bytes(data)
    records.append({'source': str(source), 'target': str(target), 'before': old_size, 'after': target.stat().st_size})
    if source != target:
        mapping[str(source.relative_to('public'))] = str(target.relative_to('public'))

# Exact asset paths and quoted basenames cover data-driven local image paths.
tracked = subprocess.check_output(['git', 'ls-files', '-z']).decode().split('\0')
for name in tracked:
    path = Path(name)
    if not path.is_file() or path.suffix.lower() not in {'.tsx', '.ts', '.jsx', '.js', '.mjs', '.css', '.json', '.md', '.py', '.html'}:
        continue
    try:
        text = path.read_text()
    except UnicodeDecodeError:
        continue
    updated = text
    for old, new in mapping.items():
        updated = updated.replace(old, new)
        for quote in ['"', "'", '`']:
            updated = updated.replace(quote + Path(old).name + quote, quote + Path(new).name + quote)
    if updated != text:
        path.write_text(updated)
for old in mapping:
    Path('public', old).unlink()
report = {'count': len(records), 'before': sum(r['before'] for r in records), 'after': sum(r['after'] for r in records), 'files': records}
Path('/tmp/iran-webp-report.json').write_text(json.dumps(report, indent=2))
print(json.dumps({k: v for k, v in report.items() if k != 'files'}))
