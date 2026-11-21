// 端到端自检：元素 → 16:9 页 → PPTX / SVG，并生成组合页
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { figure, place, getDef, paletteOf, scaleScene, PRESETS, ALL } from '../lib/compose.js';
import { scene } from '../lib/core.js';
import { sceneToSvg } from '../lib/scene-svg.js';
import { sceneToPptx } from '../lib/scene-pptx.js';

const OUT = process.argv[2] || 'D:/DSH-work/plugins/dsh-guizang-elements/work/e2e';
mkdirSync(OUT, { recursive: true });

const def = getDef('platform.disc');
const pal = paletteOf('blue');
const tight = scene(def.w, def.h, '#FFFFFF');
place(tight, def, { x: 0, y: 0, w: def.w, h: def.h }, pal, {
  layers: [
    { title: '应用层', items: ['营销云', '供应云', '财务云', '人力云'] },
    { title: '中台层', items: ['数据中台', '业务中台', '技术中台'] },
    { title: '底座层', items: ['云原生', '数据湖', '安全'] },
  ],
});
const page = scaleScene(tight, { w: 1280, h: 720, padding: 56 });
writeFileSync(join(OUT, 'element-page.svg'), sceneToSvg(page), 'utf8');
sceneToPptx(page, join(OUT, 'element-page.pptx'));

// 六套预设各出一页 PPTX（多页合并由 build-deck.mjs 负责）
for (const [key, p] of Object.entries(PRESETS)) {
  const s = figure({ w: p.w, h: p.h, palette: p.palette, blocks: p.blocks });
  writeFileSync(join(OUT, `${key}.svg`), sceneToSvg(s), 'utf8');
}
console.log(JSON.stringify({ ok: true, out: OUT, elements: ALL.length }));
