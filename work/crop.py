import sys
from pathlib import Path
from PIL import Image

src = Path(sys.argv[1])
outdir = src.parent
img = Image.open(src)
W, H = img.size
print('size', W, H)
SLICE = int(sys.argv[2]) if len(sys.argv) > 2 else 1250
n = (H + SLICE - 1) // SLICE
for i in range(n):
    top = i * SLICE
    bot = min(H, top + SLICE)
    crop = img.crop((0, top, W, bot))
    # 控制宽度便于查看
    if crop.width > 1400:
        crop = crop.resize((1400, int(crop.height * 1400 / crop.width)))
    p = outdir / f'{src.stem}-{i+1}.png'
    crop.save(p)
    print(p, crop.size)
