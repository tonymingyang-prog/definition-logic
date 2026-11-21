// 场景 → SVG。几何与排版在这里收敛，HTML / 图片预览都用它
import { wrapText, roundRectPath } from './core.js';
import { FONT } from './core.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

let defSeq = 0;
export function sceneToSvg(s, opts = {}) {
  const { scale = 1, padding = 0, font = FONT.cjk } = opts;
  const w = s.w + padding * 2;
  const h = s.h + padding * 2;
  const defs = [];
  const body = [];
  const gid = () => `g${++defSeq}`;

  const paint = (o) => {
    if (o.fillGrad) {
      const id = gid();
      const { from, to, vertical = true, opacity = 1 } = o.fillGrad;
      defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${from}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${to}" stop-opacity="${opacity}"/></linearGradient>`);
      return `url(#${id})`;
    }
    return o.fill || 'none';
  };
  const strokeAttr = (o) => (o.stroke && o.stroke !== 'none'
    ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 1}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.opacity != null ? ` stroke-opacity="${o.opacity}"` : ''}${o.linecap ? ` stroke-linecap="${o.linecap}"` : ''}`
    : ' stroke="none"');

  for (const it of s.items) {
    const common = ` fill="${paint(it)}"${strokeAttr(it)}${it.opacity != null ? ` opacity="${it.opacity}"` : ''}${it.rotate ? ` transform="rotate(${it.rotate} ${it.x + it.w / 2} ${it.y + it.h / 2})"` : ''}`;
    if (it.type === 'rect') {
      const r = it.r || 0;
      if (r > 0) body.push(`<path d="${roundRectPath(it.x, it.y, it.w, it.h, r)}"${common}/>`);
      else body.push(`<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}"${common}/>`);
    } else if (it.type === 'ellipse') {
      body.push(`<ellipse cx="${it.x + it.w / 2}" cy="${it.y + it.h / 2}" rx="${it.w / 2}" ry="${it.h / 2}"${common}/>`);
    } else if (it.type === 'poly') {
      const pts = it.points.map((p) => p.join(',')).join(' ');
      if (it.open) body.push(`<polyline points="${pts}" fill="none"${strokeAttr(it)}${it.linejoin ? ` stroke-linejoin="${it.linejoin}"` : ''}/>`);
      else body.push(`<polygon points="${pts}"${common}/>`);
    } else if (it.type === 'line') {
      body.push(`<line x1="${it.x1}" y1="${it.y1}" x2="${it.x2}" y2="${it.y2}" stroke="${it.stroke || '#000'}" stroke-width="${it.sw ?? 1}"${it.dash ? ` stroke-dasharray="${it.dash}"` : ''}${it.opacity != null ? ` opacity="${it.opacity}"` : ''}${it.linecap ? ` stroke-linecap="${it.linecap}"` : ''}/>`);
    } else if (it.type === 'path') {
      body.push(`<path d="${it.d}"${common}/>`);
    } else if (it.type === 'text') {
      const size = it.size || 13;
      const lh = it.lh || 1.4;
      const lines = it.noWrap ? String(it.text).split('\n') : wrapText(it.text, it.w, size);
      const anchor = it.align === 'center' ? 'middle' : it.align === 'right' ? 'end' : 'start';
      const tx = it.align === 'center' ? it.x + it.w / 2 : it.align === 'right' ? it.x + it.w : it.x;
      const total = lines.length * size * lh;
      let ty = it.y;
      if (it.valign === 'middle') ty = it.y + (it.h - total) / 2 + size * 0.82;
      else if (it.valign === 'bottom') ty = it.y + it.h - total + size * 0.82;
      else ty = it.y + size * 0.82;
      const rot = it.rotate ? ` transform="rotate(${it.rotate} ${it.x + it.w / 2} ${it.y + it.h / 2})"` : '';
      const parts = lines.map((ln, i) => `<text x="${tx}" y="${ty + i * size * lh}" font-family="${esc(it.font || font)}" font-size="${size}" font-weight="${it.weight || 400}" fill="${it.color || '#333'}" text-anchor="${anchor}"${it.tracking ? ` letter-spacing="${it.tracking}"` : ''}>${esc(ln)}</text>`);
      body.push(`<g${rot}>${parts.join('')}</g>`);
    }
  }

  let clipId = null;
  if (s.clip) {
    defs.push(`<clipPath id="clip-${++defSeq}"><rect x="0" y="0" width="${s.w}" height="${s.h}"/></clipPath>`);
    clipId = `clip-${defSeq}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${-padding} ${-padding} ${w} ${h}" overflow="visible">
<defs>${defs.join('')}</defs>
<rect x="0" y="0" width="${s.w}" height="${s.h}" fill="${s.bg || '#fff'}"/>
<g${clipId ? ` clip-path="url(#${clipId})"` : ''}>${body.join('\n')}</g>
</svg>`;
}

export function sceneToHtmlPage(s, opts = {}) {
  const { title = '元素预览', bg = '#f5f5f3' } = opts;
  const svg = sceneToSvg(s, { padding: 0 });
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  html,body{margin:0;height:100%;background:${bg};}
  .stage{position:fixed;inset:0;display:grid;place-items:center;padding:24px;box-sizing:border-box}
  svg{max-width:100%;max-height:100%;height:auto;width:auto;box-shadow:0 12px 40px rgba(0,0,0,.12);border-radius:4px;background:#fff}
</style></head><body><div class="stage">${svg}</div></body></html>`;
}
