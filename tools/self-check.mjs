// 自检：插件所有模块能否导入 + 目录与代码是否一致
// 用法：node tools/self-check.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const fail = [];
const ok = [];

const modules = [
  'lib/core.js', 'lib/elements.js', 'lib/generators.js', 'lib/graphics.js',
  'lib/compose.js', 'lib/samples.js', 'lib/scene-svg.js', 'lib/scene-pptx.js',
  'lib/tools.js', 'lib/skills.js', 'lib/index.js',
];

for (const m of modules) {
  try {
    await import('file://' + join(ROOT, m).replace(/\\/g, '/'));
    ok.push(m);
  } catch (e) {
    fail.push(`${m}: ${e.message.split('\n')[0]}`);
  }
}

const { ALL, PRESETS } = await import('file://' + join(ROOT, 'lib/compose.js').replace(/\\/g, '/'));
const cat = JSON.parse(readFileSync(join(ROOT, 'data/catalog.json'), 'utf8'));
if (cat.elements.length !== ALL.length) {
  fail.push(`catalog 有 ${cat.elements.length} 个元素，代码里有 ${ALL.length} 个（跑 work/sync-catalog.mjs）`);
}
if (Object.keys(cat.presets || {}).length !== Object.keys(PRESETS).length) {
  fail.push(`catalog 有 ${Object.keys(cat.presets || {}).length} 套预设，代码里有 ${Object.keys(PRESETS).length} 套`);
}

console.log(`模块导入：${ok.length}/${modules.length}`);
console.log(`元素：${ALL.length} 个，预设：${Object.keys(PRESETS).length} 套，目录记录：${cat.elements.length} / ${Object.keys(cat.presets || {}).length}`);
if (fail.length) {
  console.error('\n❌ 自检失败：');
  for (const f of fail) console.error(' - ' + f);
  process.exit(1);
}
console.log('\n✅ 自检通过');
