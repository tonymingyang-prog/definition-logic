// 审美检查：填充率 / 最大空档 / 色相数 / 最小字号 / 块数
// 用法：node check-aesthetic.mjs <scene.json>
import { readFileSync } from 'node:fs';

const file = process.argv[2];
const data = JSON.parse(readFileSync(file, 'utf8'));
const slides = data.slides || [data];
const W = 1280, M = 44;
const TOP = 142, BOT = 620;

const hueOf = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const s = max === 0 ? 0 : (max - min) / max;
  if (s < 0.18) return null;              // 中性色不计
  if (max === min) return 0;
  let h;
  if (max === r) h = ((g - b) / (max - min)) % 6;
  else if (max === g) h = (b - r) / (max - min) + 2;
  else h = (r - g) / (max - min) + 4;
  return Math.round(((h * 60) + 360) % 360 / 30) * 30;  // 30° 一档
};

console.log('页 | 填充率 | 最大空档 | 色相数 | 最小字号 | 图形块 | 评级');
console.log('---|---|---|---|---|---|---');
const rows = [];
for (const s of slides) {
  const items = s.items || [];
  const ys = [], xs = [], hues = {}, sizes = [];
  let blocks = 0;
  for (const it of items) {
    const y0 = it.y ?? Math.min(it.y1 ?? 0, it.y2 ?? 0);
    const y1 = it.y != null ? it.y + (it.h || 0) : Math.max(it.y1 ?? 0, it.y2 ?? 0);
    const x0 = it.x ?? Math.min(it.x1 ?? 0, it.x2 ?? 0);
    const x1 = it.x != null ? it.x + (it.w || 0) : Math.max(it.x1 ?? 0, it.x2 ?? 0);
    if (it.type === 'text') sizes.push(it.size || 13);
    else if ((it.w || 0) > 90 && (it.h || 0) > 36) blocks++;
    const h = hueOf(it.fill);
    if (h != null) hues[h] = (hues[h] || 0) + 1;
    if (y0 >= TOP - 10 && y1 <= BOT + 5) { ys.push([y0, y1]); xs.push([x0, x1]); }
  }
  const fillW = xs.length ? Math.max(...xs.map((v) => v[1])) - Math.min(...xs.map((v) => v[0])) : 0;
  const top = ys.length ? Math.min(...ys.map((v) => v[0])) : 0;
  const bot = ys.length ? Math.max(...ys.map((v) => v[1])) : 0;
  const fill = (bot - top) / (BOT - TOP);
  // 最大空档：把内容按 y 分段
  const spans = ys.sort((a, b) => a[0] - b[0]);
  let gap = 0, cur = TOP;
  for (const [a, b] of spans) {
    if (a - cur > gap) gap = a - cur;
    cur = Math.max(cur, b);
  }
  if (BOT - cur > gap) gap = BOT - cur;
  const hueCount = Object.values(hues).filter((v) => v >= 3).length;
  const minSize = sizes.length ? Math.min(...sizes) : 0;
  let score = 100;
  if (fill < 0.85) score -= Math.round((0.85 - fill) * 100);
  if (gap > 70) score -= Math.min(30, Math.round((gap - 70) / 4));
  if (hueCount > 1) score -= (hueCount - 1) * 12;
  if (minSize < 9) score -= 10;
  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : 'C';
  rows.push({ fill, gap, hueCount, minSize, blocks, score, grade });
  console.log(`P${String(rows.length).padStart(2, '0')} | ${(fill * 100).toFixed(0)}% | ${gap.toFixed(0)}px | ${hueCount} | ${minSize}px | ${blocks} | ${grade} ${score}`);
}
const avg = rows.reduce((a, b) => a + b.score, 0) / rows.length;
console.log(`\n平均分 ${avg.toFixed(1)} / 100`);
