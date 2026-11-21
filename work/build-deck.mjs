// 生成样例册：2 页元素总览（44 个）+ 6 页整页预设（v2 版式）
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL, PRESETS, figure, place } from '../lib/compose.js';
import { scene, buildPalette } from '../lib/core.js';
import { sceneToSvg } from '../lib/scene-svg.js';
import { rect, text } from '../lib/core.js';
import { sampleContent } from '../lib/samples.js';

const OUT = process.argv[2] || 'D:/DSH-work/guizang-elements/样例册-v2';
mkdirSync(OUT, { recursive: true });
const pal = buildPalette('orange');

function overviewScene(list, title, sub) {
  const s = scene(1280, 720, '#FFFFFF');
  text(s, 44, 36, 900, 34, title, { size: 26, weight: 700, color: pal.ink });
  text(s, 44, 74, 1000, 20, sub, { size: 11.5, weight: 400, color: pal.muted });
  rect(s, 44, 104, 44, 3, { fill: pal.primary });
  const cols = 7, rows = 4;
  const cellW = (1280 - 88 - (cols - 1) * 8) / cols;
  const cellH = (720 - 140 - (rows - 1) * 8) / rows;
  list.forEach((def, i) => {
    const cx = 44 + (i % cols) * (cellW + 8);
    const cy = 128 + Math.floor(i / cols) * (cellH + 8);
    rect(s, cx, cy, cellW, cellH, { r: 6, fill: '#FCFCFB', stroke: '#EDEEF0', sw: 1 });
    const bw = cellW - 16, bh = cellH - 34;
    const k = Math.min(bw / def.w, bh / def.h);
    place(s, def, { x: cx + (cellW - def.w * k) / 2, y: cy + 8 + (bh - def.h * k) / 2, w: def.w * k, h: def.h * k }, pal, sampleContent(def));
    text(s, cx + 6, cy + cellH - 22, cellW - 12, 16, def.name, { size: 9, weight: 700, color: pal.body, align: 'center', noWrap: true });
  });
  return s;
}

const half = Math.ceil(ALL.length / 2);
const slides = [
  overviewScene(ALL.slice(0, half), `图形元素 · ${ALL.length} 个可复用图形`, '第一批：卡片 / 容器 / 流程 / 结构 / 文字 / 装饰 —— 同一套几何，导出可编辑 PPTX 与网页 SVG'),
  overviewScene(ALL.slice(half), `图形元素 · 第 2 页（${half + 1}–${ALL.length}）`, '含 v0.3 补齐的缺口母题：环形体系、漏斗、词云、蜂窝、扇区、多层弧、等距立体、结论条'),
];
for (const [key, p] of Object.entries(PRESETS)) {
  slides.push(figure({ w: p.w, h: p.h, palette: p.palette, blocks: p.blocks }));
}

const pptx = join(OUT, '图形元素-样例册.pptx');
const { scenesToPptx } = await import('../lib/scene-pptx.js');
try {
  scenesToPptx(slides, pptx);
} catch (e) {
  console.log('PPTX 需要 python-pptx，已跳过：', e.message.slice(0, 60));
}
slides.forEach((s, i) => writeFileSync(join(OUT, `page-${String(i + 1).padStart(2, '0')}.svg`), sceneToSvg(s), 'utf8'));
writeFileSync(join(OUT, 'scene.json'), JSON.stringify({ ...slides[0], slides }), 'utf8');
console.log(JSON.stringify({ pages: slides.length, out: OUT }));
