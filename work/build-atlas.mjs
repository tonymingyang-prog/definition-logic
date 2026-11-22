// 44 原子图鉴：每个原子一页满版，用默认示例内容，验证每个原子都能独立出图
import { writeFileSync, mkdirSync } from 'node:fs';
import { buildDeck, lintDeck } from '../lib/deck.js';
import { ALL } from '../lib/compose.js';

const OUT = 'D:/DSH-work/guizang-elements/原子图鉴';
mkdirSync(OUT, { recursive: true });

const pages = [];
for (const def of ALL) {
  pages.push({
    type: 'pano',
    atom: def.id,
    chrome: 'title',
    maxScale: ['metric.ring', 'title.block'].includes(def.id) ? 1 : def.w < 300 ? 3.2 : def.w < 600 ? 2 : def.w < 900 ? 1.5 : 1.25,
    title: `${def.name} · ${def.id} · ${def.w}×${def.h}`,
  });
}

const scenes = buildDeck({ title: '定义逻辑图 · 原子图鉴', palette: 'blue', pages });
const lint = lintDeck(scenes);
writeFileSync(OUT + '/deck.json', JSON.stringify({ w: 1280, h: 720, slides: scenes.map((s) => ({ w: s.w, h: s.h, bg: s.bg, items: s.items })) }), 'utf8');
const byPage = {};
for (const i of lint.issues) (byPage[i.page] = byPage[i.page] || []).push(i.code);
console.log(JSON.stringify({ atoms: ALL.length, pages: scenes.length, lint_total: lint.total, byCode: lint.byCode }, null, 2));
for (const [p, codes] of Object.entries(byPage)) {
  const def = ALL[p - 1];
  console.log(` P${p} ${def.id}: ${codes.join(',')}`);
}
