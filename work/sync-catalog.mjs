// 把 lib 里的元素定义同步进 data/catalog.json（供 gze_catalog / 面板 / 文档使用）
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const { ALL, PRESETS } = await import('file://' + join(HERE, '..', 'lib', 'compose.js').replace(/\\/g, '/'));
const FILE = join(HERE, '..', 'data', 'catalog.json');
const cat = JSON.parse(readFileSync(FILE, 'utf8'));

const have = new Set(cat.elements.map((e) => e.id));
let added = 0;
for (const def of ALL) {
  if (have.has(def.id)) continue;
  cat.elements.push({
    id: def.id,
    name: def.name,
    cat: def.cat,
    tags: def.tags || [],
    size: { w: def.w, h: def.h },
    slots: (def.slots || []).map((s) => ({ id: s.id, label: s.label })),
    variants: def.variants || [],
    kind: def.gen ? 'generator' : 'primitive',
  });
  added++;
}
const presets = {};
for (const [k, v] of Object.entries(PRESETS)) presets[k] = { name: v.name, size: { w: v.w, h: v.h }, palette: v.palette, blocks: v.blocks.length };
cat.presets = presets;
cat.version = '0.4.0';
cat.source = '6 份 WPS 白底咨询级静态逻辑图模板（橙/红/蓝/绿/青/紫，各 80 页）+ 80 页缺口母题补齐';
writeFileSync(FILE, JSON.stringify(cat, null, 1), 'utf8');
console.log(JSON.stringify({ added, total: cat.elements.length }));
