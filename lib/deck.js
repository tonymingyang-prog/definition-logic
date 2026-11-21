// 图纸生成器 v2：一页一个"图纸类型"，全部由图形元素原子组合。
// v2 依据三份参考版式（数智员工方案 / 华为一网通 / 蓝色静态逻辑图模板）校准：
// 页边距 44px、正文 12.5–14.5px、标题 31px、标题行 24pt，内容页统一带底部结论条。
import { scene, buildPalette, text, rect, ellipse, line, measureText } from './core.js';
import { place, getDef } from './compose.js';
import { sampleContent } from './samples.js';

export const W = 1280, H = 720;
const M = 44;              // 左右留白（参考值 26–40px）
const CW = W - M * 2;      // 内容宽度 1192
const BODY_Y = 146;        // 正文起始
const BODY_B = 618;        // 正文下边界
const BAND_Y = 628;        // 结论条
const FOOT_Y = 692;
let CURRENT_CHAPTER = 0;

// 统一页眉：眉标 + 结论式标题 + 副说明 + 分隔
function header(s, pal, { kicker, title, desc }) {
  if (kicker) text(s, M, 32, 720, 16, kicker, { size: 10.5, weight: 700, color: pal.primary, tracking: 2.4 });
  text(s, M, 50, 1040, 54, title, { size: 31, weight: 700, color: pal.ink, lh: 1.26 });
  rect(s, M, 110, 46, 3, { fill: pal.primary });
  if (desc) text(s, M + 58, 103, 1010, 22, desc, { size: 12.5, weight: 400, color: pal.muted });
  line(s, M, 128, W - M, 128, { stroke: pal.line, sw: 1 });
}

// 统一页脚：页名 + 章节进度 + 页码
function footer(s, pal, { label, page, total, chapter }) {
  chapter = chapter || CURRENT_CHAPTER;
  line(s, M, FOOT_Y, W - M, FOOT_Y, { stroke: pal.line, sw: 1 });
  text(s, M, FOOT_Y + 7, 600, 16, label || '', { size: 9.5, weight: 400, color: pal.muted, tracking: 0.5 });
  if (chapter) {
    for (let i = 0; i < 4; i++) {
      rect(s, W - M - 84 - (4 - i) * 17, FOOT_Y + 12, 11, 3, { fill: i + 1 === chapter ? pal.primary : pal.line });
    }
  }
  text(s, W - M - 64, FOOT_Y + 7, 64, 16, `${String(page).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, { size: 9.5, weight: 700, color: pal.muted, align: 'right' });
}

// 底部结论条：参考版式里每页收口的一句话
function band(s, pal, txt) {
  if (!txt) return;
  rect(s, M, BAND_Y, CW, 44, { r: 8, fill: pal.t1 });
  rect(s, M + 16, BAND_Y + 13, 3, 18, { fill: pal.primary });
  text(s, M + 30, BAND_Y + 13, 46, 20, '结论', { size: 9.5, weight: 700, color: pal.primary, tracking: 1.2 });
  text(s, M + 76, BAND_Y + 10, CW - 96, 26, txt, { size: 12.5, weight: 400, color: pal.ink });
}

// 在框内放原子，按内容自动补示例
function atom(s, pal, id, box, content, variant) {
  const def = getDef(id);
  place(s, def, box, pal, { ...sampleContent(def), ...(content || {}) }, variant);
}

// ---------- 页面类型 ----------
const PAGES = {
  cover(s, pal, p, meta) {
    rect(s, 0, 0, W, H, { fill: '#FFFFFF' });
    rect(s, 0, 0, 10, H, { fill: pal.primary });
    atom(s, pal, 'decor.dot-arc', { x: 820, y: 24, w: 420, h: 150 });
    text(s, 96, 150, 780, 20, p.kicker || 'GRAPHIC SYSTEM', { size: 10.5, weight: 700, color: pal.primary, tracking: 3 });
    text(s, 96, 182, 880, 136, p.title, { size: 48, weight: 700, color: pal.ink, lh: 1.24 });
    rect(s, 96, 334, 64, 4, { fill: pal.primary });
    text(s, 96, 354, 720, 58, p.subtitle || '', { size: 15.5, weight: 400, color: pal.body, lh: 1.7 });
    (p.metrics || []).forEach((m, i) => {
      const x = 96 + i * 280;
      text(s, x, 466, 250, 42, m.value, { size: 32, weight: 700, color: pal.primary, lh: 1.1 });
      text(s, x, 514, 256, 20, m.label, { size: 11.5, weight: 400, color: pal.body });
      if (i < p.metrics.length - 1) line(s, x + 246, 470, x + 246, 534, { stroke: pal.line, sw: 1 });
    });
    line(s, 96, 570, W - 96, 570, { stroke: pal.line, sw: 1 });
    text(s, 96, 588, 700, 20, p.org || '（示例内容）', { size: 12, weight: 400, color: pal.muted });
    text(s, 96, 612, 700, 20, p.date || '', { size: 12, weight: 400, color: pal.muted });
    atom(s, pal, 'chip', { x: 1040, y: 588, w: 144, h: 30 }, { label: p.tag || '示例 · 版式演示' });
  },

  agenda(s, pal, p, meta) {
    header(s, pal, { kicker: 'CONTENTS', title: p.title || '目录', desc: p.desc });
    const items = p.items || [];
    const rowsN = Math.max(1, Math.ceil(items.length / 2));
    const step = Math.min(206, Math.floor((BAND_Y - 34 - (BODY_Y + 54)) / rowsN));
    items.forEach((it, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = M + col * (CW / 2 + 8), y = BODY_Y + 54 + row * step;
      atom(s, pal, 'badge.num', { x, y, w: 52, h: 52 }, { num: String(i + 1).padStart(2, '0') }, i === 0 ? 'solid' : 'ring');
      text(s, x + 70, y - 2, 470, 28, it.title, { size: 19, weight: 700, color: pal.ink });
      text(s, x + 70, y + 32, 470, 44, it.desc || '', { size: 12.5, weight: 400, color: pal.muted, lh: 1.55 });
      line(s, x + 70, y + 92, x + 520, y + 92, { stroke: pal.line, sw: 1 });
    });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  section(s, pal, p, meta) {
    rect(s, 0, 0, 24, H, { fill: pal.primary });
    text(s, 96, 170, 320, 120, p.no || '01', { size: 78, weight: 700, color: pal.t4, lh: 1.1 });
    text(s, 96, 290, 640, 54, p.title, { size: 36, weight: 700, color: pal.ink });
    rect(s, 96, 356, 56, 3, { fill: pal.primary });
    text(s, 96, 378, 620, 46, p.desc || '', { size: 13, weight: 400, color: pal.muted, lh: 1.6 });
    (p.points || []).forEach((t, i) => {
      const y = 456 + i * 46;
      text(s, 96, y, 30, 20, String(i + 1).padStart(2, '0'), { size: 10, weight: 700, color: pal.primary });
      text(s, 134, y - 3, 500, 26, t, { size: 14.5, weight: 400, color: pal.body });
      line(s, 96, y + 34, 650, y + 34, { stroke: pal.line, sw: 1 });
    });
    // 右侧：四章导航，当前位置高亮
    const chapters = meta.chapters || [];
    rect(s, 760, 176, 424, 312, { r: 10, fill: pal.t1 });
    text(s, 792, 196, 320, 18, '章节导航', { size: 9.5, weight: 700, color: pal.muted, tracking: 2 });
    chapters.forEach((c, i) => {
      const y = 232 + i * 64;
      const active = i + 1 === meta.chapter;
      if (active) rect(s, 776, y - 12, 392, 56, { r: 8, fill: pal.paper });
      text(s, 792, y, 30, 20, String(i + 1).padStart(2, '0'), { size: 10, weight: 700, color: active ? pal.primary : pal.muted });
      text(s, 828, y - 3, 320, 26, c.title, { size: 13, weight: active ? 700 : 400, color: active ? pal.ink : pal.body });
      if (!active) line(s, 776, y + 36, 1168, y + 36, { stroke: pal.line, sw: 1 });
    });
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total, chapter: meta.chapter });
  },

  lanes(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    atom(s, pal, 'flow.lanes', { x: M, y: BODY_Y + 2, w: 880, h: 452 }, { lanes: p.lanes });
    atom(s, pal, 'rail', { x: 952, y: BODY_Y + 2, w: 204, h: 330 }, p.rail || { title: '痛点', rows: ['重复建设', '接口割裂', '口径不一', '交付缓慢'] });
    atom(s, pal, 'callout', { x: 942, y: BODY_Y + 344, w: 252, h: 108 }, p.callout || {});
    band(s, pal, p.conclusion || p.takeaway || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  kpi(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    const cards = p.cards || [];
    const n = Math.max(1, cards.length);
    const gap = 18, cw = (CW - gap * (n - 1)) / n;
    cards.forEach((c, i) => atom(s, pal, 'card.stat', { x: M + i * (cw + gap), y: BODY_Y + 6, w: cw, h: 120 }, { delta: '', ...c }));
    (p.bars || []).forEach((b, i) => atom(s, pal, 'metric.bar', { x: M, y: BODY_Y + 172 + i * 76, w: 556, h: 56 }, b));
    (p.notes || []).forEach((t, i) => {
      const y = BODY_Y + 172 + i * 94;
      rect(s, 640, y, 4, 72, { fill: pal.primary });
      text(s, 660, y + 4, 520, 28, t.title, { size: 14, weight: 700, color: pal.ink });
      text(s, 660, y + 34, 540, 46, t.desc || '', { size: 11.5, weight: 400, color: pal.muted, lh: 1.5 });
    });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  disc(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    atom(s, pal, 'platform.disc', { x: 96, y: BODY_Y + 2, w: 860, h: 380 }, { layers: p.layers });
    (p.side || []).forEach((t, i) => {
      const y = BODY_Y + 14 + i * 100;
      rect(s, 980, y, 4, 80, { fill: pal.primary });
      text(s, 998, y + 2, 240, 26, t.title, { size: 13, weight: 700, color: pal.ink });
      text(s, 998, y + 30, 250, 46, t.desc || '', { size: 11, weight: 400, color: pal.muted, lh: 1.45 });
    });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  matrix(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    const hasCallout = !!p.callout;
    atom(s, pal, 'matrix.grid', { x: M, y: BODY_Y + 4, w: hasCallout ? 1000 : CW, h: 452 }, { cols: p.cols, rows: p.rows, cells: p.cells });
    if (hasCallout) atom(s, pal, 'callout', { x: 1060, y: 322, w: 220, h: 116 }, p.callout);
    if (p.caption) text(s, 1060, 460, 196, 120, p.caption, { size: 10.5, weight: 400, color: pal.muted, lh: 1.6 });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  bands(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    atom(s, pal, 'layers.band', { x: M, y: BODY_Y + 2, w: 950, h: 452 }, { layers: p.layers });
    (p.side || []).forEach((t, i) => {
      const y = BODY_Y + 12 + i * 112;
      rect(s, 1012, y + 2, 4, 78, { fill: pal.primary });
      text(s, 1032, y, 220, 26, t.title, { size: 13, weight: 700, color: pal.ink });
      text(s, 1032, y + 30, 220, 48, t.desc || '', { size: 11, weight: 400, color: pal.muted, lh: 1.45 });
    });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  hub(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    atom(s, pal, 'hub.radial', { x: 56, y: BODY_Y + 2, w: 710, h: 462 }, { center: p.center, items: p.items });
    (p.notes || []).forEach((t, i) => {
      const y = BODY_Y + 16 + i * 96;
      atom(s, pal, 'chip', { x: 800, y, w: 122, h: 28 }, { label: t.tag });
      text(s, 800, y + 36, 420, 24, t.title, { size: 13.5, weight: 700, color: pal.ink });
      text(s, 800, y + 62, 420, 26, t.desc || '', { size: 11, weight: 400, color: pal.muted });
    });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  eco(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    atom(s, pal, 'eco.bracket', { x: M + 10, y: BODY_Y + 2, w: 1172, h: 380 }, p.eco);
    (p.cards || []).forEach((c, i) => {
      const gap = 20, n = p.cards.length, cw = (CW - gap * (n - 1)) / n;
      atom(s, pal, 'card.plain', { x: M + i * (cw + gap), y: 542, w: cw, h: 70 }, c);
    });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  timeline(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    atom(s, pal, 'timeline', { x: M, y: BODY_Y + 16, w: CW, h: 244 }, { items: p.items });
    (p.cards || []).forEach((c, i) => {
      const gap = 18, n = p.cards.length, cw = (CW - gap * (n - 1)) / n;
      atom(s, pal, 'card.plain', { x: M + i * (cw + gap), y: 440, w: cw, h: 112 }, c);
    });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  chevron(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    atom(s, pal, 'flow.chevron', { x: M, y: BODY_Y + 2, w: CW, h: 126 }, { items: p.items });
    (p.rows || []).forEach((r, i) => {
      const y = BODY_Y + 154 + i * 76;
      rect(s, M, y, CW, 70, { r: 8, fill: i % 2 ? pal.paper : pal.t1, stroke: pal.t3, sw: 1 });
      text(s, M + 20, y + 10, 200, 24, r.title, { size: 13.5, weight: 700, color: pal.deep });
      text(s, M + 20, y + 36, 200, 20, r.date || '', { size: 9.5, weight: 400, color: pal.muted });
      text(s, M + 244, y + 11, 920, 50, r.desc || '', { size: 11.5, weight: 400, color: pal.body, lh: 1.5 });
    });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  compare(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    const cols = p.columns || [];
    const gap = 24, cw = (CW - gap * (cols.length - 1)) / cols.length;
    cols.forEach((c, i) => {
      const x = M + i * (cw + gap);
      rect(s, x, BODY_Y + 2, cw, 46, { r: 8, fill: i === cols.length - 1 ? pal.primary : pal.t2 });
      text(s, x, BODY_Y + 2, cw, 46, c.title, { size: 13.5, weight: 700, color: i === cols.length - 1 ? '#fff' : pal.deep, align: 'center', valign: 'middle' });
      (c.items || []).forEach((t, j) => {
        const y = BODY_Y + 60 + j * 78;
        rect(s, x, y, cw, 58, { r: 6, fill: pal.paper, stroke: pal.t3, sw: 1 });
        text(s, x + 14, y, cw - 28, 58, t, { size: 11.5, weight: 400, color: pal.body, lh: 1.45, valign: 'middle' });
      });
    });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  stack(s, pal, p, meta) {
    header(s, pal, { kicker: p.kicker, title: p.title, desc: p.desc });
    atom(s, pal, 'stack.list', { x: M, y: BODY_Y + 4, w: 620, h: 462 }, { items: p.items });
    (p.notes || []).forEach((t, i) => {
      const y = BODY_Y + 18 + i * 100;
      rect(s, 700, y, 4, 80, { fill: pal.primary });
      text(s, 720, y + 2, 500, 26, t.title, { size: 13, weight: 700, color: pal.ink });
      text(s, 720, y + 32, 510, 46, t.desc || '', { size: 11, weight: 400, color: pal.muted, lh: 1.45 });
    });
    band(s, pal, p.conclusion || '');
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },

  closing(s, pal, p, meta) {
    rect(s, 0, 0, W, H, { fill: '#FFFFFF' });
    rect(s, 0, 0, 10, H, { fill: pal.primary });
    text(s, 96, 196, 940, 136, p.title, { size: 42, weight: 700, color: pal.ink, lh: 1.28 });
    rect(s, 96, 352, 64, 4, { fill: pal.primary });
    (p.points || []).forEach((t, i) => {
      const y = 404 + i * 60;
      ellipse(s, 96, y + 8, 13, 13, { fill: pal.primary });
      text(s, 126, y - 2, 900, 48, t, { size: 14.5, weight: 400, color: pal.body });
    });
    atom(s, pal, 'decor.dot-arc', { x: 820, y: 430, w: 420, h: 140 });
    footer(s, pal, { label: meta.label, page: meta.page, total: meta.total });
  },
};

export const PAGE_TYPES = Object.keys(PAGES);

export function buildDeck(spec) {
  const pal = buildPalette(spec.palette || 'blue');
  const total = spec.pages.length;
  const scenes = [];
  const agenda = spec.pages.find((p) => p.type === 'agenda');
  const chapters = (agenda?.items || []).map((it) => ({ title: it.title }));
  let chapter = 0;
  spec.pages.forEach((p, i) => {
    if (p.type === 'section') chapter += 1;
    CURRENT_CHAPTER = chapter;
    const s = scene(W, H, '#FFFFFF');
    const fn = PAGES[p.type];
    if (!fn) throw new Error(`未知页面类型：${p.type}（可用：${PAGE_TYPES.join(' / ')}）`);
    fn(s, pal, p, { label: p.label || spec.title || '', page: i + 1, total, chapter, chapters });
    s.meta = { type: p.type, page: i + 1, chapter };
    scenes.push(s);
  });
  return scenes;
}

// ---------- 自检：越界 / 文字溢出 / 重叠 ----------
export function lintDeck(scenes) {
  const issues = [];
  scenes.forEach((s, idx) => {
    const page = idx + 1;
    const texts = [];
    for (const it of s.items) {
      const oob = it.type === 'poly'
        ? it.points.some(([x, y]) => x < -2 || y < -2 || x > W + 2 || y > H + 2)
        : it.type === 'line'
          ? [it.x1, it.x2].some((x) => x < -2 || x > W + 2) || [it.y1, it.y2].some((y) => y < -2 || y > H + 2)
          : (it.x < -2 || it.y < -2 || it.x + it.w > W + 2 || it.y + it.h > H + 2);
      if (oob) issues.push({ page, code: 'OUT_OF_BOUNDS', detail: `${it.type} 越界` });
      if (it.type === 'text') {
        const need = measureText(it.text, it.w, it.size || 13, it.lh || 1.4);
        if (need > it.h + 4) issues.push({ page, code: 'TEXT_OVERFLOW', detail: `「${String(it.text).slice(0, 12)}」需 ${Math.round(need)}px / 有 ${Math.round(it.h)}px` });
        if ((it.size || 13) < 8) issues.push({ page, code: 'FONT_TOO_SMALL', detail: `「${String(it.text).slice(0, 10)}」${it.size}px` });
        texts.push(it);
      }
    }
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const a = texts[i], b = texts[j];
        const ox = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
        const oy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        const area = ox * oy;
        const min = Math.min(a.w * a.h, b.w * b.h);
        if (min > 0 && area / min > 0.35) {
          issues.push({ page, code: 'TEXT_OVERLAP', detail: `「${String(a.text).slice(0, 10)}」×「${String(b.text).slice(0, 10)}」` });
        }
      }
    }
  });
  const byCode = {};
  for (const i of issues) byCode[i.code] = (byCode[i.code] || 0) + 1;
  return { total: issues.length, byCode, issues };
}
