// 单轮构建：deck.pptx + lint.json + 联系表 HTML/PNG
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { buildDeck, lintDeck, W, H } from '../lib/deck.js';
import { sceneToSvg } from '../lib/scene-svg.js';
import { scenesToPptx } from '../lib/scene-pptx.js';
import { DECK_SPEC } from './deck-spec.mjs';

const iter = Number(process.argv[2] || 1);
const ROOT = process.argv[3] || 'D:/DSH-work/plugins/dsh-guizang-elements/work/training';
const OUT = join(ROOT, `iter-${String(iter).padStart(2, '0')}`);
mkdirSync(OUT, { recursive: true });

const scenes = buildDeck(DECK_SPEC);
const lint = lintDeck(scenes);
writeFileSync(join(OUT, 'lint.json'), JSON.stringify(lint, null, 1), 'utf8');

const pptx = join(OUT, 'tech-architecture.pptx');
scenesToPptx(scenes, pptx);
scenes.forEach((s, i) => writeFileSync(join(OUT, 'page-' + String(i + 1).padStart(2, '0') + '.svg'), sceneToSvg(s), 'utf8'));

// 联系表：4 列 × 5 行，每页 600 宽
const COLS = 4, CELL = 600;
const rows = Math.ceil(scenes.length / COLS);
const cellH = Math.round((CELL * H) / W);
const cards = scenes.map((s, i) => {
  const svg = sceneToSvg(s);
  const n = String(i + 1).padStart(2, '0');
  return `<figure><figcaption>P${n}</figcaption>${svg}</figure>`;
}).join('\n');

const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>iter ${iter}</title>
<style>
  body{margin:0;background:#EDEDEA;font-family:"微软雅黑",sans-serif}
  .grid{display:grid;grid-template-columns:repeat(${COLS}, ${CELL}px);gap:14px;padding:16px;width:${COLS * CELL + 14 * (COLS - 1) + 32}px}
  figure{margin:0;background:#fff;border:1px solid #DDD;border-radius:4px;overflow:hidden}
  figcaption{font-size:12px;color:#666;padding:4px 8px;background:#F7F7F5;font-family:Consolas,monospace}
  svg{width:100%;height:auto;display:block}
</style></head><body><div class="grid">${cards}</div></body></html>`;
writeFileSync(join(OUT, 'sheet.html'), html, 'utf8');

// 汇总
const prevPath = join(ROOT, `iter-${String(iter - 1).padStart(2, '0')}`, 'lint.json');
const prev = existsSync(prevPath) ? JSON.parse(readFileSync(prevPath, 'utf8')) : null;
console.log(JSON.stringify({
  iter,
  out: OUT,
  pptx,
  pages: scenes.length,
  lint: { total: lint.total, byCode: lint.byCode },
  prev: prev ? { total: prev.total, byCode: prev.byCode } : null,
  sheetW: COLS * CELL + 14 * (COLS - 1) + 32,
  sheetH: rows * (cellH + 26) + 32,
}));
