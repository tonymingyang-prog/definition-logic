// 元素内核：调色板、字阶、几何工具、场景构建
// 设计空间：1280×720 px（16:9），1px = 0.75pt = 9525 EMU

export const PX = 9525; // EMU per px

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function hex2rgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function rgb2hex([r, g, b]) {
  const f = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0').toUpperCase();
  return `#${f(r)}${f(g)}${f(b)}`;
}
export function mix(a, b, t) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return rgb2hex([0, 1, 2].map((i) => A[i] + (B[i] - A[i]) * t));
}
export const lighten = (c, t) => mix(c, '#FFFFFF', t);
export const darken = (c, t) => mix(c, '#000000', t);
export function alpha(hex, a) {
  const [r, g, b] = hex2rgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// 六套主题色取自模板内嵌 theme2–theme6 / theme1 的 accent 家族
export const PALETTES = {
  orange: { id: 'orange', name: '橙', primary: '#FF891D', secondary: '#FFB11F', accent: '#FF7A33', deep: '#8A3D00' },
  red:    { id: 'red',    name: '红', primary: '#F5483B', secondary: '#FF7F72', accent: '#FD1943', deep: '#7A0E12' },
  blue:   { id: 'blue',   name: '蓝', primary: '#1E63E9', secondary: '#41B2EB', accent: '#0AE8FD', deep: '#0B2E7A' },
  green:  { id: 'green',  name: '绿', primary: '#3DA802', secondary: '#7BD14A', accent: '#1AF64E', deep: '#1F4D00' },
  teal:   { id: 'teal',   name: '青', primary: '#16B694', secondary: '#5BEBA0', accent: '#0BDD6A', deep: '#064C3C' },
  purple: { id: 'purple', name: '紫', primary: '#A93BF5', secondary: '#DD0CF8', accent: '#E961FB', deep: '#45096E' },
};

export const INK = { ink: '#1F2328', body: '#3D434B', muted: '#7A828C', line: '#E3E6EA', paper: '#FFFFFF', wash: '#F7F8FA' };

// 由主色派生 6 级浅淡，模板的层次几乎全由这套阶梯表达
export function buildPalette(id = 'orange') {
  const p = PALETTES[id] || PALETTES.orange;
  const primary = p.primary;
  return {
    ...p,
    ...INK,
    t1: lighten(primary, 0.92), // 大底衬
    t2: lighten(primary, 0.84), // 区块填充
    t3: lighten(primary, 0.7),
    t4: lighten(primary, 0.5),
    t5: lighten(primary, 0.28),
    t6: primary,
    d1: darken(primary, 0.18),
    d2: darken(primary, 0.36),
    onPrimary: '#FFFFFF',
    onDeep: '#FFFFFF',
  };
}

// 字阶（px，设计空间）—— 参照模板标题/正文比例
export const TYPE = {
  display: { size: 40, weight: 700, color: 'ink', lh: 1.2 },
  h1: { size: 30, weight: 700, color: 'ink', lh: 1.25 },
  h2: { size: 22, weight: 700, color: 'ink', lh: 1.3 },
  h3: { size: 17, weight: 700, color: 'ink', lh: 1.35 },
  body: { size: 13, weight: 400, color: 'body', lh: 1.5 },
  small: { size: 11.5, weight: 400, color: 'body', lh: 1.45 },
  micro: { size: 9.5, weight: 400, color: 'muted', lh: 1.4 },
  kicker: { size: 11, weight: 700, color: 'primary', lh: 1.2, tracking: 2 },
};

export const FONT = {
  cjk: '微软雅黑',
  latin: 'Arial',
  mono: 'Consolas',
};

// ---------- 场景构建 ----------
export function scene(w = 1280, h = 720, bg = '#FFFFFF') {
  return { w, h, bg, items: [] };
}

const push = (s, it) => (s.items.push(it), s);

export const rect = (s, x, y, w, h, o = {}) => push(s, { type: 'rect', x, y, w, h, ...o });
export const ellipse = (s, x, y, w, h, o = {}) => push(s, { type: 'ellipse', x, y, w, h, ...o });
export const poly = (s, points, o = {}) => push(s, { type: 'poly', points, ...o });
export const line = (s, x1, y1, x2, y2, o = {}) => push(s, { type: 'line', x1, y1, x2, y2, ...o });
export const path = (s, d, o = {}) => push(s, { type: 'path', d, ...o });
export const text = (s, x, y, w, h, str, o = {}) => push(s, { type: 'text', x, y, w, h, text: str, ...o });
export const group = (s, name, fn) => {
  const start = s.items.length;
  fn(s);
  for (let i = start; i < s.items.length; i++) if (!s.items[i].group) s.items[i].group = name;
  return s;
};

// 文本块：自动按行折行估算（供 SVG/PPTX 同用）
export function wrapText(str, maxWidth, size, fontFactor = 1) {
  const lines = [];
  for (const para of String(str).split('\n')) {
    if (!para) { lines.push(''); continue; }
    let cur = '';
    let w = 0;
    for (const ch of para) {
      const cw = /[\u4e00-\u9fa5\uff00-\uffef]/.test(ch) ? size : size * 0.56;
      if (w + cw > maxWidth && cur) { lines.push(cur); cur = ch; w = cw * fontFactor; }
      else { cur += ch; w += cw * fontFactor; }
    }
    if (cur) lines.push(cur);
  }
  return lines;
}

// 估算文本高度
export function measureText(str, maxWidth, size, lh = 1.4) {
  return wrapText(str, maxWidth, size).length * size * lh;
}

export function roundRectPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M${x + rr},${y}`,
    `H${x + w - rr}`, `A${rr},${rr} 0 0 1 ${x + w},${y + rr}`,
    `V${y + h - rr}`, `A${rr},${rr} 0 0 1 ${x + w - rr},${y + h}`,
    `H${x + rr}`, `A${rr},${rr} 0 0 1 ${x},${y + h - rr}`,
    `V${y + rr}`, `A${rr},${rr} 0 0 1 ${x + rr},${y}`, 'Z',
  ].join(' ');
}

// 圆柱/平台：底椭圆 + 侧壁 + 顶椭圆（模板里平台叠层的基本单元）
export function cylinder(s, x, y, w, h, ry, o = {}) {
  const { top = o.fill, side = null, bottom = null, stroke, sw = 1 } = o;
  const fillTop = top;
  const fillSide = side || (fillTop ? darken(fillTop, 0.12) : INK.wash);
  const fillBottom = bottom || (fillTop ? darken(fillTop, 0.2) : INK.line);
  // 底
  ellipse(s, x, y + h - ry * 2, w, ry * 2, { fill: fillBottom, stroke: stroke || 'none', sw });
  // 侧壁（矩形 + 两侧半圆由椭圆边缘近似）
  rect(s, x, y + ry, w, h - ry * 2, { fill: fillSide, stroke: stroke || 'none', sw });
  ellipse(s, x, y, w, ry * 2, { fill: fillTop, stroke: stroke || 'none', sw });
  return s;
}

export function chevronPoints(x, y, w, h, notch) {
  return [
    [x, y], [x + w - notch, y], [x + w, y + h / 2], [x + w - notch, y + h], [x, y + h], [x + notch, y + h / 2],
  ];
}
