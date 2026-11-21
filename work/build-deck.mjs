// 生成交付用的样例册：1 页元素总览 + 6 页整页预设
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL, PRESETS, figure, place } from '../lib/compose.js';
import { scene, buildPalette, TYPE } from '../lib/core.js';
import { sceneToSvg, sceneToHtmlPage } from '../lib/scene-svg.js';
import { scenesToPptx } from '../lib/scene-pptx.js';
import { rect, text } from '../lib/core.js';
import { STYLE } from '../lib/elements.js';
import { sampleContent } from '../lib/samples.js';

const OUT = process.argv[2] || 'D:/DSH-work/plugins/dsh-guizang-elements/work/demo';
mkdirSync(OUT, { recursive: true });

const pal = buildPalette('orange');

// —— 第 1 页：35 个元素总览 ——
function overviewScene() {
  const s = scene(1280, 720, '#FFFFFF');
  text(s, 56, 40, 700, 36, '图形元素库 · 35 个可复用图形原子', { size: 26, weight: 700, color: pal.ink });
  text(s, 56, 78, 760, 20, '卡片 / 标签 / 容器 / 流程 / 结构 / 装饰 —— 同一套几何，导出可编辑 PPTX 与网页 SVG', { size: 11.5, weight: 400, color: pal.muted });
  const cols = 7, rows = 5;
  const cellW = (1280 - 80 - (cols - 1) * 8) / cols;
  const cellH = (720 - 130 - (rows - 1) * 8) / rows;
  ALL.forEach((def, i) => {
    const cx = 40 + (i % cols) * (cellW + 8);
    const cy = 118 + Math.floor(i / cols) * (cellH + 8);
    rect(s, cx, cy, cellW, cellH, { r: 6, fill: '#FCFCFB', stroke: '#EDEEF0', sw: 1 });
    const bw = cellW - 16, bh = cellH - 34;
    const k = Math.min(bw / def.w, bh / def.h);
    place(s, def, { x: cx + (cellW - def.w * k) / 2, y: cy + 8 + (bh - def.h * k) / 2, w: def.w * k, h: def.h * k }, pal, sampleContent(def));
    text(s, cx + 6, cy + cellH - 22, cellW - 12, 16, def.name, { size: 9, weight: 700, color: pal.body, align: 'center' });
  });
  return s;
}

const slides = [overviewScene()];
for (const [key, p] of Object.entries(PRESETS)) {
  slides.push(figure({ w: p.w, h: p.h, palette: p.palette, blocks: p.blocks }));
}

const pptx = join(OUT, '图形元素库-样例册.pptx');
scenesToPptx(slides, pptx);
writeFileSync(join(OUT, '图形元素库-样例册.svg'), sceneToSvg(slides[0]), 'utf8');
for (const [i, s] of slides.entries()) {
  writeFileSync(join(OUT, `page-${String(i + 1).padStart(2, '0')}.svg`), sceneToSvg(s), 'utf8');
}
console.log(JSON.stringify({ ok: true, pptx, slides: slides.length }));
