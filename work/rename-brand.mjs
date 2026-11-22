import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILES = [
  'README.md', 'package.json', 'data/catalog.json', 'gallery/index.html',
  'lib/client.js', 'lib/index.js', 'lib/tools.js', 'lib/deck.js', 'lib/graphics.js',
  'skills/guizang-elements/SKILL.md',
  'docs/模板映射矩阵.md', 'docs/元素清单.md', 'docs/版面规格.md', 'docs/缺口与路线图.md', 'docs/差距分析与升级方案.md',
  'UPLOAD.md',
];

let touched = 0;
for (const f of FILES) {
  const p = join(ROOT, f);
  if (!existsSync(p)) continue;
  let s = readFileSync(p, 'utf8');
  const before = s;
  s = s.split('图形元素库').join('定义逻辑');
  s = s.split('图形元素').join('定义逻辑');
  s = s.split('GRAPHIC ELEMENTS').join('DEFINITION LOGIC');
  if (s !== before) {
    writeFileSync(p, s, 'utf8');
    touched++;
  }
}
console.log('renamed files:', touched);
