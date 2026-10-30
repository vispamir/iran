"""Convert generated RGBA illustration masters to real transparent SVG paths.
Run with a Python environment containing vtracer. Never modifies the PNG masters.
"""
from pathlib import Path
import sys
import vtracer

for name in sys.argv[1:]:
    source = Path(name)
    target = source.with_suffix('.svg')
    vtracer.convert_image_to_svg_py(str(source), str(target), colormode='color',
        hierarchical='stacked', mode='spline', filter_speckle=6,
        color_precision=6, layer_difference=24, corner_threshold=60,
        length_threshold=4, max_iterations=10, splice_threshold=45, path_precision=2)
    print(f'{target}: {target.stat().st_size:,} bytes')
