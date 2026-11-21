// 生成离线版《元素总览》HTML（不依赖插件服务，双击即可看）
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALL, PRESETS, CATEGORIES, place, figure } from '../lib/compose.js';
import { buildPalette, scene, PALETTES } from '../lib/core.js';
import { sceneToSvg } from '../lib/scene-svg.js';
import { sampleContent } from '../lib/samples.js';

const OUT = process.argv[2] || 'D:/DSH-work/plugins/dsh-guizang-elements/work/html';
mkdirSync(OUT, { recursive: true });

const pal = buildPalette('orange');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function cell(def) {
  const k = Math.min(1.15, 560 / def.w, 300 / def.h);
  const w = Math.round(def.w * k), h = Math.round(def.h * k);
  const s = scene(w, h, '#FFFFFF');
  place(s, def, { x: 0, y: 0, w, h }, pal, sampleContent(def), def.variants ? def.variants[0] : undefined);
  return `<figure class="cell"><div class="stage" style="width:${w + 16}px;height:${h + 16}px">${sceneToSvg(s)}</div>
    <figcaption><b>${esc(def.name)}</b><code>${esc(def.id)}</code></figcaption></figure>`;
}

const sections = CATEGORIES.map((c) => {
  const list = ALL.filter((d) => d.cat === c.id);
  if (!list.length) return '';
  return `<section><h2>${esc(c.name)}<span>${esc(c.desc)} · ${list.length} 个</span></h2><div class="flex">${list.map(cell).join('')}</div></section>`;
}).join('\n');

const paletteStrip = Object.entries(PALETTES).map(([id, p]) => {
  const pp = buildPalette(id);
  const def = ALL.find((d) => d.id === 'card.icon');
  const s = scene(def.w, def.h, '#FFFFFF');
  place(s, def, { x: 0, y: 0, w: def.w, h: def.h }, pp, sampleContent(def));
  return `<div class="pal"><div class="pstage">${sceneToSvg(s)}</div><span>${esc(p.name)} · ${esc(id)}</span></div>`;
}).join('');

const presets = Object.entries(PRESETS).map(([key, p]) => {
  const s = figure({ w: p.w, h: p.h, palette: p.palette, blocks: p.blocks });
  return `<figure class="preset"><div class="pstage2">${sceneToSvg(s, { padding: 0 })}</div><figcaption><b>${esc(p.name)}</b><code>${esc(key)}</code></figcaption></figure>`;
}).join('');

const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>图形元素库 · 总览</title>
<style>
  :root{color-scheme:light}
  *{box-sizing:border-box}
  body{margin:0;background:#F4F4F2;color:#1B1D21;font-family:"微软雅黑","Microsoft YaHei",system-ui,sans-serif}
  .wrap{max-width:1440px;margin:0 auto;padding:40px 32px 80px}
  header{border-bottom:1px solid #E4E5E7;padding-bottom:22px;margin-bottom:28px}
  h1{margin:0 0 6px;font-size:26px;letter-spacing:.4px}
  .sub{margin:0;color:#7C838C;font-size:12.5px;line-height:1.7}
  h2{font-size:15px;margin:38px 0 14px;display:flex;align-items:baseline;gap:10px}
  h2 span{font-size:11.5px;color:#8B929B;font-weight:400}
  .flex{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-start}
  .cell{margin:0;background:#fff;border:1px solid #E8E9EC;border-radius:10px;overflow:hidden}
  .cell .stage{display:grid;place-items:center;padding:8px;background:#fff}
  .cell figcaption{padding:7px 12px 9px;border-top:1px solid #F0F1F3;display:flex;gap:10px;align-items:baseline}
  .cell figcaption b{font-size:12.5px}
  code{font-size:10.5px;color:#98A0AA;font-family:Consolas,monospace}
  .pals{display:flex;gap:14px;flex-wrap:wrap}
  .pal{background:#fff;border:1px solid #E8E9EC;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px;align-items:center}
  .pal .pstage svg{display:block}
  .pal span{font-size:11px;color:#7C838C}
  .preset{margin:0 0 18px;background:#fff;border:1px solid #E8E9EC;border-radius:12px;overflow:hidden}
  .preset .pstage2{padding:10px}
  .preset svg{width:100%;height:auto;display:block}
  .preset figcaption{padding:9px 14px 11px;border-top:1px solid #F0F1F3;display:flex;gap:10px;align-items:baseline}
  footer{margin-top:50px;color:#9AA1A9;font-size:11.5px;line-height:1.8;border-top:1px solid #E4E5E7;padding-top:18px}
</style></head><body><div class="wrap">
<header>
  <h1>图形元素库 · 元素总览</h1>
  <p class="sub">35 个图形原子：15 个基础元素 + 16 个参数化生成器 + 4 个装饰件，6 套配色。<br>
  同一套几何同时导出「可编辑 PPTX」（原生圆角矩形/椭圆/自由多边形/文本框）与「网页 SVG」。源自 6 份咨询级静态逻辑图模板的拆解与归一。</p>
</header>
<section><h2>六套配色<span>同一主色的六级浅淡自动派生，层次靠明度不靠撞色</span></h2><div class="pals">${paletteStrip}</div></section>
${sections}
<section><h2>整页预设<span>标题 + 主图 + 数据卡，可直接换字使用</span></h2>${presets}</section>
<footer>用法：在 DSH 里让模型调 gze_catalog / gze_render / gze_figure；或直接改 JSON 走 lib/compose.js。字体默认「微软雅黑」。</footer>
</div></body></html>`;

writeFileSync(join(OUT, '图形元素库-总览.html'), html, 'utf8');
console.log(JSON.stringify({ ok: true, out: join(OUT, '图形元素库-总览.html') }));
