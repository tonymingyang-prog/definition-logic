// 构建示例：20 页「企业 AI 中台 2026」
// 用法：node build.mjs [输出目录]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDeck, lintDeck } from '../../lib/deck.js';
import { sceneToSvg } from '../../lib/scene-svg.js';
import { SPEC } from './spec.mjs';

const OUT = process.argv[2] || join(process.cwd(), 'out');
mkdirSync(OUT, { recursive: true });

const scenes = buildDeck(SPEC);
const lint = lintDeck(scenes);
console.log(JSON.stringify({ pages: scenes.length, issues: lint.total, byCode: lint.byCode }, null, 1));
if (lint.total) console.log(JSON.stringify(lint.issues, null, 1));

scenes.forEach((s, i) =>
  writeFileSync(join(OUT, `page-${String(i + 1).padStart(2, '0')}.svg`), sceneToSvg(s), 'utf8'));

// 交给 python-pptx 出原生 PPTX（沙箱内 node 不能带管道 spawn，改由命令行直接调 python）
writeFileSync(join(OUT, 'scene.json'), JSON.stringify({ ...scenes[0], slides: scenes }), 'utf8');
console.log(`SVG + scene.json 已写入 ${OUT}`);
console.log(`出 PPTX：python py/render_pptx.py "${join(OUT, 'scene.json')}" "${join(OUT, 'deck.pptx')}"`);
