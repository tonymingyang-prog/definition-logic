// 审计：逐个原子统计「渐变 / 投影 / 纯色」使用情况
import { readFileSync } from 'node:fs';
import { ALL } from '../lib/compose.js';

const deck = JSON.parse(readFileSync('D:/DSH-work/guizang-elements/原子图鉴/deck.json', 'utf8'));
const rows = deck.slides.map((s, i) => {
  const def = ALL[i];
  let grad = 0, shadow = 0, flat = 0, total = 0;
  for (const it of s.items) {
    if (['rect', 'ellipse', 'poly'].includes(it.type)) {
      total++;
      if (it.fillGrad) grad++;
      else if (it.fill && it.fill !== 'none' && !String(it.fill).startsWith('rgba') && it.fill !== '#FFFFFF') flat++;
      if (it.shadow) shadow++;
    }
  }
  return { id: def.id, cat: def.cat, total, grad, shadow, flat };
});

const finished = (r) => r.total === 0 || r.grad + r.shadow > 0;
const todo = rows.filter((r) => !finished(r));

console.log('atoms:', rows.length, 'touched(grad/shadow):', rows.length - todo.length, 'untouched:', todo.length);
console.log('\n未使用渐变或投影的原子：');
for (const r of todo.sort((a, b) => b.total - a.total)) {
  console.log(`  ${r.id.padEnd(22)} ${r.cat.padEnd(9)} 形状${String(r.total).padStart(3)} 纯色${String(r.flat).padStart(3)}`);
}
console.log('\n已有渐变的原子：');
console.log('  ' + rows.filter((r) => r.grad > 0).map((r) => r.id).join(', '));
