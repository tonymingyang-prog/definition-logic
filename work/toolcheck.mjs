// 直接调用插件的工具实现，验证真实代码路径（不依赖 host 重载）
import { mkdirSync } from 'node:fs';
import { TOOLS } from '../lib/tools.js';

const OUT = process.argv[2] || 'D:/DSH-work/plugins/dsh-guizang-elements/work/toolcheck';
mkdirSync(OUT, { recursive: true });
const byName = Object.fromEntries(TOOLS.map((t) => [t.name, t]));

const results = [];

// 1. 目录
const cat = await byName.gze_catalog.execute({ category: 'structure' });
results.push({ tool: 'gze_catalog', count: cat.count, ids: cat.elements.map((e) => e.id) });

// 2. 单元素：默认示例内容 → 16:9 PPTX + SVG
const r1 = await byName.gze_render.execute({ id: 'platform.disc', palette: 'green', formats: 'pptx,svg', outDir: OUT, name: 'platform' });
results.push({ tool: 'gze_render', files: r1.files });

// 3. 整页预设
const r2 = await byName.gze_render.execute({ preset: 'process-roadmap', formats: 'pptx', outDir: OUT, name: 'roadmap' });
results.push({ tool: 'gze_render preset', files: r2.files });

// 4. 自由组合
const blocks = JSON.stringify([
  { id: 'title.block', box: { x: 60, y: 40, w: 720, h: 96 }, content: { kicker: 'FIGURE', title: '用元素拼一页', desc: '两块卡片 + 一条时间轴' } },
  { id: 'card.stat', box: { x: 60, y: 170, w: 236, h: 112 }, content: { value: '92%', label: '线上化率', delta: '+8pt' } },
  { id: 'card.stat', box: { x: 320, y: 170, w: 236, h: 112 }, content: { value: '3.5d', label: '平均交付周期', delta: '-1.2d' } },
  { id: 'timeline', box: { x: 60, y: 320, w: 1120, h: 260 } },
]);
const r3 = await byName.gze_figure.execute({ blocks, palette: 'orange', formats: 'pptx,svg', outDir: OUT, name: 'combo' });
results.push({ tool: 'gze_figure', files: r3.files, blocks: r3.blocks });

console.log(JSON.stringify({ ok: true, results }, null, 1));
