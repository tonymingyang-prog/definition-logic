// 组合生成器：参数化产出成套图形（同族元素按数量自动排布）
import { rect, ellipse, poly, line, path, text, wrapText, darken, lighten, mix, chevronPoints, cylinder } from './core.js';
import { STYLE, arrow } from './elements.js';
import { iconItems, iconForLabel } from './icons.js';

const T = (s, x, y, w, h, str, st, extra = {}) =>
  text(s, x, y, w, h, str, { size: st.size, weight: st.weight, color: st.color, lh: st.lh, tracking: st.tracking, align: st.align, valign: st.valign, ...extra });

const items = (c, n, make) => {
  const list = (c.items || []).slice(0, n);
  while (list.length < n) list.push(make(list.length));
  return list;
};

export const GENERATORS = [
  {
    id: 'flow.chevron',
    name: 'V 形流程',
    cat: 'flow',
    tags: ['流程', 'chevron', '阶段'],
    w: 1180, h: 128,
    slots: [{ id: 'items', label: '步骤（3–6）', example: [{ title: '需求' }, { title: '设计' }, { title: '开发' }, { title: '上线' }] }],
    gen(s, pal, c = {}) {
      const list = items(c, 5, (i) => ({ title: `阶段 ${i + 1}` })).slice(0, (c.items || []).length || 4);
      const n = Math.max(3, list.length);
      const arrow = 22, gap = 6;
      const w = (1180 - gap * (n - 1)) / n;
      list.forEach((it, i) => {
        const x = i * (w + gap);
        poly(s, chevronPoints(x, 20, w, 84, arrow), { fill: i === 0 ? pal.primary : lighten(pal.primary, Math.min(0.55, i * 0.13)) });
        T(s, x + arrow + 8, 20, w - arrow * 2 - 16, 84, it.title || `阶段 ${i + 1}`, { size: 14, weight: 700, color: i < 2 ? '#fff' : pal.deep, align: 'center', valign: 'middle' }, { noWrap: true });
        if (it.desc) T(s, x + 6, 108, w - 12, 18, it.desc, { size: 9.5, weight: 400, color: pal.muted, align: 'center' }, { noWrap: true });
      });
    },
  },
  {
    id: 'flow.steps',
    name: '节点步骤流',
    cat: 'flow',
    tags: ['流程', '步骤', '编号'],
    w: 1180, h: 150,
    slots: [{ id: 'items', label: '步骤（3–5）', example: [{ title: '统一入口', desc: '一个门户' }] }],
    gen(s, pal, c = {}) {
      const list = (c.items || []).slice(0, 5);
      const n = Math.max(2, list.length || 4);
      const colW = 1180 / n;
      line(s, 60, 52, 1180 - 60, 52, { stroke: pal.t4, sw: 2, dash: '1 0' });
      list.forEach((it, i) => {
        const cx = colW * i + colW / 2;
        ellipse(s, cx - 26, 26, 52, 52, { fill: pal.primary });
        T(s, cx - 26, 26, 52, 52, String(i + 1).padStart(2, '0'), { size: 15, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
        T(s, cx - colW / 2 + 8, 90, colW - 16, 22, it.title || `步骤 ${i + 1}`, { size: 13, weight: 700, color: pal.ink, align: 'center' }, { noWrap: true });
        if (it.desc) T(s, cx - colW / 2 + 8, 114, colW - 16, 30, it.desc, { size: 10, weight: 400, color: pal.muted, align: 'center' });
      });
    },
  },
  {
    id: 'flow.lanes',
    name: '纵向泳道带',
    cat: 'flow',
    tags: ['泳道', '分层', '能力带'],
    w: 1100, h: 440,
    slots: [{ id: 'lanes', label: '层（2–5）', example: [{ title: '接入层', items: ['门户', 'API', '移动端'] }] }],
    gen(s, pal, c = {}) {
      const lanes = (c.lanes || c.items || []).slice(0, 5);
      const n = Math.max(2, lanes.length || 4);
      const h = (440 - (n - 1) * 14) / n;
      lanes.forEach((ln, i) => {
        const y = i * (h + 14);
        const tint = i % 2 === 0 ? pal.t2 : pal.t1;
        rect(s, 0, y, 1100, h, { r: 8, fill: tint, stroke: pal.t3, sw: 1 });
        rect(s, 0, y, 8, h, { r: 4, fill: pal.primary });
        T(s, 24, y + h / 2 - 12, 190, 24, ln.title || `第 ${i + 1} 层`, { size: 14, weight: 700, color: pal.deep }, { noWrap: true });
        const chips = (ln.items || []).slice(0, 6);
        const startX = 230, avail = 1100 - startX - 20;
        const cw = chips.length ? Math.min(170, (avail - (chips.length - 1) * 10) / chips.length) : 0;
        chips.forEach((ch, j) => {
          const x = startX + j * (cw + 10);
          rect(s, x, y + h / 2 - 18, cw, 36, { r: 18, fill: pal.paper, stroke: pal.t4, sw: 1 });
          T(s, x + 6, y + h / 2 - 18, cw - 12, 36, ch, { size: 11.5, weight: 400, color: pal.body, align: 'center', valign: 'middle' }, { noWrap: true });
        });
      });
    },
  },
  {
    id: 'hub.radial',
    name: '中心辐射',
    cat: 'structure',
    tags: ['hub', '辐射', '生态'],
    w: 900, h: 620,
    slots: [{ id: 'center', label: '中心', example: '数据中台' }, { id: 'items', label: '外围节点（4–8）', example: [{ title: '报表' }] }],
    gen(s, pal, c = {}) {
      const cx = 450, cy = 310, R = 190;
      ellipse(s, cx - 250, cy - 250, 500, 500, { fill: pal.t1 });
      ellipse(s, cx - 210, cy - 210, 420, 420, { stroke: pal.t4, sw: 1, dash: '5 6', fill: 'none' });
      const list = (c.items || []).slice(0, 8);
      const n = Math.max(4, list.length || 6);
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R * 0.92;
        line(s, cx + Math.cos(a) * 92, cy + Math.sin(a) * 92, x - Math.cos(a) * 54, y - Math.sin(a) * 54, { stroke: pal.t4, sw: 1.2, dash: '4 4' });
        ellipse(s, x - 58, y - 34, 116, 68, { r: 12, fill: pal.paper, stroke: pal.t4, sw: 1 });
        const _t = list[i]?.title || `节点 ${i + 1}`;
        const _ic = iconForLabel(_t);
        if (_ic) {
          s.items.push(...iconItems(_ic, x, y - 13, 22, { stroke: pal.primary, sw: 1.8 }));
          T(s, x - 52, y + 7, 104, 20, _t, { size: 11, weight: 700, color: pal.deep, align: 'center', valign: 'middle' });
        } else {
          T(s, x - 52, y - 34, 104, 68, _t, { size: 11.5, weight: 700, color: pal.deep, align: 'center', valign: 'middle' });
        }
      }
      ellipse(s, cx - 92, cy - 92, 184, 184, { fill: pal.primary });
      ellipse(s, cx - 76, cy - 76, 152, 152, { stroke: 'rgba(255,255,255,0.65)', sw: 1.2, fill: 'none', dash: '4 4' });
      const _ct = c.center || '数据中台';
      const _two = String(_ct).includes('\n');
      T(s, cx - 76, cy - (_two ? 26 : 20), 152, _two ? 52 : 40, _ct, { size: _two ? 14.5 : 17, weight: 700, color: '#fff', align: 'center', valign: 'middle', lh: 1.3 });
    },
  },
  {
    id: 'timeline',
    name: '时间轴',
    cat: 'flow',
    tags: ['时间', 'roadmap', '里程碑'],
    w: 1120, h: 260,
    slots: [{ id: 'items', label: '里程碑（3–6）', example: [{ date: '2024 Q1', title: '立项' }] }],
    gen(s, pal, c = {}) {
      const list = (c.items || []).slice(0, 6);
      const n = Math.max(3, list.length || 4);
      line(s, 40, 130, 1080, 130, { stroke: pal.t4, sw: 2 });
      const colW = 1040 / (n - 1 || 1);
      list.forEach((it, i) => {
        const x = 40 + colW * i;
        const up = i % 2 === 0;
        ellipse(s, x - 9, 121, 18, 18, { fill: pal.primary });
        ellipse(s, x - 4, 126, 8, 8, { fill: '#fff' });
        line(s, x, up ? 100 : 142, x, up ? 130 : 130, { stroke: pal.primary, sw: 1.2 });
        const by = up ? 40 : 158;
        const _tx = Math.max(2, Math.min(x - 90, 1120 - 182));
        T(s, _tx, by, 180, 18, it.date || `阶段 ${i + 1}`, { size: 10.5, weight: 700, color: pal.primary, align: 'center' }, { noWrap: true });
        T(s, _tx, by + 20, 180, 22, it.title || '里程碑', { size: 13, weight: 700, color: pal.ink, align: 'center' }, { noWrap: true });
        if (it.desc) T(s, x - 90, by + 44, 180, 28, it.desc, { size: 10.5, weight: 400, color: pal.muted, align: 'center' });
      });
    },
  },
  {
    id: 'matrix.grid',
    name: '矩阵网格',
    cat: 'structure',
    tags: ['矩阵', '2x2', '对比'],
    w: 940, h: 580,
    slots: [{ id: 'cols', label: '列（2–4）', example: ['现状', '目标'] }, { id: 'rows', label: '行（2–4）', example: ['数据', '流程'] }, { id: 'cells', label: '单元格文字' }],
    gen(s, pal, c = {}) {
      const cols = (c.cols || ['维度 A', '维度 B']).slice(0, 4);
      const rows = (c.rows || ['维度 1', '维度 2']).slice(0, 4);
      const lx = 130, ty = 54, cw = (940 - lx) / cols.length, ch = (580 - ty) / rows.length;
      cols.forEach((t, i) => {
        rect(s, lx + i * cw + 4, 6, cw - 8, 40, { r: 6, fill: pal.primary });
        T(s, lx + i * cw + 4, 6, cw - 8, 40, t, { size: 12, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
      });
      rows.forEach((t, j) => {
        rect(s, 0, ty + j * ch + 4, 126, ch - 8, { r: 6, fill: pal.t2 });
        T(s, 0, ty + j * ch + 4, 126, ch - 8, t, { size: 12, weight: 700, color: pal.deep, align: 'center', valign: 'middle' });
      });
      rows.forEach((_, j) => cols.forEach((_, i) => {
        const cell = (c.cells && c.cells[j] && c.cells[j][i]) || '';
        rect(s, lx + i * cw + 4, ty + j * ch + 4, cw - 8, ch - 8, { r: 6, fill: (i + j) % 2 ? pal.paper : pal.t1, stroke: pal.t3, sw: 1 });
        if (cell) T(s, lx + i * cw + 16, ty + j * ch + 14, cw - 32, ch - 28, cell, { size: 12, weight: 400, color: pal.body, lh: 1.5, valign: 'middle' });
      }));
    },
  },
  {
    id: 'pyramid.levels',
    name: '金字塔层级',
    cat: 'structure',
    tags: ['金字塔', '层级', '漏斗'],
    w: 720, h: 420,
    slots: [{ id: 'items', label: '层级（3–5，自上而下）', example: [{ title: '战略层' }] }],
    gen(s, pal, c = {}) {
      const list = (c.items || []).slice(0, 5);
      const n = Math.max(3, list.length || 4);
      const topW = 240, bottomW = 700, hh = 420 / n;
      list.forEach((it, i) => {
        const wTop = topW + (bottomW - topW) * (i / n);
        const wBot = topW + (bottomW - topW) * ((i + 1) / n);
        const y = i * hh;
        poly(s, [[(720 - wTop) / 2, y], [(720 + wTop) / 2, y], [(720 + wBot) / 2, y + hh - 4], [(720 - wBot) / 2, y + hh - 4]], { fill: lighten(pal.primary, i * 0.16) });
        T(s, (720 - wBot) / 2 + 20, y, wBot - 40, hh - 4, it.title || `第 ${i + 1} 层`, { size: 14 - i * 0.6, weight: 700, color: i < 2 ? '#fff' : pal.deep, align: 'center', valign: 'middle' }, { noWrap: true });
      });
    },
  },
  {
    id: 'layers.band',
    name: '横向分层',
    cat: 'structure',
    tags: ['分层', '架构', 'band'],
    w: 980, h: 420,
    slots: [{ id: 'layers', label: '层（3–5）', example: [{ title: '应用层', items: ['CRM', 'ERP'] }] }],
    gen(s, pal, c = {}) {
      const list = (c.layers || c.items || []).slice(0, 5);
      const n = Math.max(3, list.length || 4);
      const h = (420 - (n - 1) * 12) / n;
      list.forEach((ln, i) => {
        const y = i * (h + 12);
        const depth = i / Math.max(1, n - 1);
        rect(s, 0, y, 980, h, { r: 8, fill: lighten(pal.primary, 0.93 - depth * 0.1), stroke: pal.t3, sw: 1 });
        rect(s, 0, y, 118, h, { r: 8, fill: mix(pal.primary, '#FFFFFF', i * 0.28) });
        rect(s, 110, y, 8, h, { fill: mix(pal.primary, '#FFFFFF', i * 0.28) });
        T(s, 0, y, 118, h, ln.title || `第 ${i + 1} 层`, { size: 13, weight: 700, color: i === 0 ? '#fff' : pal.deep, align: 'center', valign: 'middle' }, { noWrap: true });
        const chips = (ln.items || []).slice(0, 5);
        const avail = 980 - 148 - 16;
        const cw = chips.length ? Math.min(190, (avail - (chips.length - 1) * 10) / chips.length) : 0;
        const totalW = chips.length ? chips.length * cw + (chips.length - 1) * 10 : 0;
        const startX = 148 + Math.max(0, (avail - totalW) / 2);
        chips.forEach((ch, j) => {
          const x = startX + j * (cw + 10);
          rect(s, x, y + 12, cw, h - 24, { r: 6, fill: pal.paper, stroke: pal.t3, sw: 1 });
          T(s, x + 8, y + 12, cw - 16, h - 24, ch, { size: 11.5, weight: 400, color: pal.body, align: 'center', valign: 'middle' });
        });
      });
    },
  },
  {
    id: 'platform.disc',
    name: '平台叠层（等距）',
    cat: 'structure',
    tags: ['平台', '等距', '底座'],
    w: 940, h: 420,
    slots: [{ id: 'layers', label: '平台层（2–4，自下而上）', example: [{ title: 'IaaS', items: ['弹性计算'] }] }],
    gen(s, pal, c = {}) {
      const layers = (c.layers || c.items || []).slice(0, 4);
      const n = Math.max(2, layers.length || 3);
      const H = 420;
      const h = 96;
      const spacing = Math.min(112, (H - h) / Math.max(1, n - 1));
      const total = (n - 1) * spacing + h;
      const bottom = (H + total) / 2;
      layers.forEach((ln, i) => {
        const idx = n - 1 - i; // 0=最底
        const w = 860 - idx * 88;
        const x = (940 - w) / 2;
        const y = bottom - idx * spacing - h;
        cylinder(s, x, y, w, h, 24, { fill: lighten(pal.primary, 0.30 + idx * 0.13), stroke: 'none', shadow: { color: pal.deep, blur: 16, dist: 6, dir: 90, opacity: 0.14 } });
        T(s, x + 26, y + 4, 190, 44, ln.title || `第 ${idx + 1} 层`, { size: 15, weight: 700, color: idx === 0 ? '#fff' : pal.deep, align: 'left', valign: 'middle' }, { noWrap: true });
        const chips = (ln.items || []).slice(0, 5);
        const startX = x + 210;
        const avail = w - 210 - 26;
        const cw = chips.length ? Math.min(150, (avail - (chips.length - 1) * 8) / chips.length) : 0;
        chips.forEach((ch, j) => {
          const cx = startX + j * (cw + 8);
          const cy = y + 12;
          rect(s, cx, cy, cw, 28, { r: 14, fill: pal.paper, stroke: pal.t4, sw: 1 });
          T(s, cx + 4, cy, cw - 8, 28, ch, { size: 10, weight: 400, color: pal.body, align: 'center', valign: 'middle' }, { noWrap: true });
        });
      });
    },
  },
  {
    id: 'medallion',
    name: '中心圆盘',
    cat: 'structure',
    tags: ['medallion', '圆盘', '平台'],
    w: 720, h: 700,
    slots: [{ id: 'center', label: '中心文字', example: '业务中台' }, { id: 'items', label: '外圈标签（6–10）', example: [{ title: '客户' }] }],
    gen(s, pal, c = {}) {
      const cx = 360, cy = 350;
      ellipse(s, cx - 300, cy - 300, 600, 600, { fill: pal.t1 });
      ellipse(s, cx - 226, cy - 226, 452, 452, { stroke: pal.t4, sw: 1.2, dash: '5 7', fill: 'none' });
      ellipse(s, cx - 150, cy - 150, 300, 300, { fill: pal.primary });
      ellipse(s, cx - 132, cy - 132, 264, 264, { stroke: 'rgba(255,255,255,.55)', sw: 1.2, dash: '4 5', fill: 'none' });
      T(s, cx - 120, cy - 26, 240, 56, c.center || '业务中台', { size: 20, weight: 700, color: '#fff', align: 'center', valign: 'middle' });
      const list = (c.items || []).slice(0, 10);
      const n = Math.max(6, list.length || 8);
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const x = cx + Math.cos(a) * 268, y = cy + Math.sin(a) * 268;
        rect(s, x - 52, y - 24, 104, 48, { r: 10, fill: pal.paper, stroke: pal.t4, sw: 1 });
        T(s, x - 48, y - 24, 96, 48, list[i]?.title || `能力 ${i + 1}`, { size: 11, weight: 700, color: pal.deep, align: 'center', valign: 'middle' });
      }
    },
  },
  {
    id: 'arc.fan',
    name: '弧形标签扇',
    cat: 'structure',
    tags: ['弧线', '旋转标签', '全景'],
    w: 1000, h: 460,
    slots: [{ id: 'items', label: '标签（5–12）', example: [{ title: '电商' }] }],
    gen(s, pal, c = {}) {
      const list = (c.items || []).slice(0, 10);
      const n = Math.max(5, list.length || 8);
      const cx = 500, cy = 430, R = 316;
      const arcPts = [];
      for (let i = 0; i <= 60; i++) {
        const a = Math.PI + 0.12 + (i / 60) * (Math.PI - 0.24);
        arcPts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.9]);
      }
      poly(s, arcPts, { stroke: pal.t2, sw: 10, fill: 'none', open: true });
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0.5 : i / (n - 1);
        const a = Math.PI + 0.12 + t * (Math.PI - 0.24);
        const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R * 0.9;
        const label = list[i]?.title || `标签 ${i + 1}`;
        const w = Math.min(150, label.length * 12 + 24);
        const lx = cx + Math.cos(a) * (R - 96), ly = cy + Math.sin(a) * (R - 96) * 0.9;
        line(s, lx, ly, px - Math.cos(a) * 8, py - Math.sin(a) * 8, { stroke: pal.t4, sw: 1.2, dash: '3 4' });
        ellipse(s, px - 4, py - 4, 8, 8, { fill: pal.primary });
        rect(s, px - w / 2, py - 15, w, 30, { r: 15, fill: pal.primary });
        text(s, px - w / 2, py - 15, w, 30, label, { size: 10.5, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
      }
      ellipse(s, cx - 90, cy - 45, 180, 90, { fill: pal.paper, stroke: pal.t4, sw: 1.2 });
      T(s, cx - 84, cy - 45, 168, 90, c.center || '全景能力', { size: 13, weight: 700, color: pal.deep, align: 'center', valign: 'middle' });
    },
  },
  {
    id: 'dual.hub',
    name: '双心桥接',
    cat: 'structure',
    tags: ['双中心', '桥接', '协同'],
    w: 1000, h: 440,
    slots: [{ id: 'left', label: '左中心', example: '数字化' }, { id: 'right', label: '右中心', example: '自动化' }, { id: 'bridge', label: '桥接文字', example: '数实融合' }],
    gen(s, pal, c = {}) {
      const y = 220, r = 150;
      ellipse(s, 60, y - r, r * 2, r * 2, { fill: pal.t1, stroke: pal.t4, sw: 1.2 });
      ellipse(s, 640, y - r, r * 2, r * 2, { fill: pal.t2, stroke: pal.t4, sw: 1.2 });
      ellipse(s, 110, y - 96, 192, 192, { fill: pal.primary });
      ellipse(s, 698, y - 96, 192, 192, { fill: pal.primary });
      T(s, 110, y - 26, 192, 52, c.left || '数字化', { size: 16, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
      T(s, 698, y - 26, 192, 52, c.right || '自动化', { size: 16, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
      rect(s, 420, y - 34, 160, 68, { r: 34, fill: pal.paper, stroke: pal.primary, sw: 1.6 });
      T(s, 420, y - 34, 160, 68, c.bridge || '数实融合', { size: 13, weight: 700, color: pal.deep, align: 'center', valign: 'middle' }, { noWrap: true });
      line(s, 350, y, 416, y, { stroke: pal.primary, sw: 2, dash: '6 5' });
      line(s, 584, y, 650, y, { stroke: pal.primary, sw: 2, dash: '6 5' });
    },
  },
  {
    id: 'eco.bracket',
    name: '主体 + 两侧支撑',
    cat: 'structure',
    tags: ['bracket', '生态', '支撑'],
    w: 1120, h: 380,
    slots: [{ id: 'center', label: '主体', example: '业务中台' }, { id: 'left', label: '左侧项', example: ['数据标准'] }, { id: 'right', label: '右侧项', example: ['运维保障'] }],
    gen(s, pal, c = {}) {
      const left = (c.left || ['数据标准', '主数据', '指标口径', '安全合规']).slice(0, 4);
      const right = (c.right || ['运维保障', '监控告警', '灰度发布', '容量规划']).slice(0, 4);
      const n = Math.max(left.length, right.length, 1);
      const pad = 14, itemH = 56;
      const step = n > 1 ? (380 - pad * 2 - itemH) / (n - 1) : 0;
      const itemY = (i) => pad + i * step;
      const midY = (i) => itemY(i) + itemH / 2;

      // 中央主体：撑满整个高度
      rect(s, 372, pad, 376, 380 - pad * 2, { r: 12, fill: pal.primary });
      rect(s, 388, pad + 14, 344, 380 - pad * 2 - 28, { r: 8, fill: 'none', stroke: 'rgba(255,255,255,.5)', sw: 1, dash: '5 5' });
      T(s, 388, 150, 344, 80, c.center || '业务中台', { size: 22, weight: 700, color: '#fff', align: 'center', valign: 'middle' });

      const drawSide = (arr, side) => {
        arr.forEach((it, i) => {
          const y = itemY(i);
          const x = side === 'left' ? 20 : 820;
          rect(s, x, y, 280, itemH, { r: 8, fill: pal.t1, stroke: pal.t3, sw: 1 });
          T(s, x + 12, y, 256, itemH, typeof it === 'string' ? it : it.title, {
            size: 12.5, weight: 600, color: pal.body, align: side === 'left' ? 'right' : 'left', valign: 'middle',
          }, { noWrap: true });
        });
      };
      drawSide(left, 'left');
      drawSide(right, 'right');

      const spineL = 336, spineR = 784;
      line(s, spineL, midY(0), spineL, midY(n - 1), { stroke: pal.t5, sw: 1.4, dash: '5 5' });
      line(s, spineR, midY(0), spineR, midY(n - 1), { stroke: pal.t5, sw: 1.4, dash: '5 5' });
      for (let i = 0; i < n; i++) {
        line(s, 300, midY(i), spineL, midY(i), { stroke: pal.t4, sw: 1.2, dash: '3 4' });
        line(s, spineR, midY(i), 820, midY(i), { stroke: pal.t4, sw: 1.2, dash: '3 4' });
      }
      line(s, spineL, 190, 372, 190, { stroke: pal.t4, sw: 1.2, dash: '3 4' });
      line(s, 748, 190, spineR, 190, { stroke: pal.t4, sw: 1.2, dash: '3 4' });
    },
  },  {
    id: 'stack.list',
    name: '纵向清单',
    cat: 'flow',
    tags: ['清单', 'stack', '路径'],
    w: 560, h: 460,
    slots: [{ id: 'items', label: '条目（3–5）', example: [{ title: '统一门户' }] }],
    gen(s, pal, c = {}) {
      const list = (c.items || []).slice(0, 5);
      const n = Math.max(3, list.length || 4);
      const rowH = 74, gap = 18;
      const startY = 20;
      line(s, 40, startY + 22, 40, startY + (n - 1) * (rowH + gap) + 22, { stroke: pal.t4, sw: 1.4, dash: '1 0' });
      list.forEach((it, i) => {
        const y = startY + i * (rowH + gap);
        ellipse(s, 26, y + 8, 28, 28, { fill: pal.primary });
        T(s, 26, y + 8, 28, 28, String(i + 1), { size: 11, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
        rect(s, 76, y, 464, rowH, { r: 8, fill: pal.t1, stroke: pal.t3, sw: 1 });
        T(s, 92, y + 10, 432, 24, it.title || `条目 ${i + 1}`, { size: 13, weight: 700, color: pal.deep }, { noWrap: true });
        if (it.desc) T(s, 92, y + 36, 432, 30, it.desc, { size: 10, weight: 400, color: pal.muted });
      });
    },
  },
  {
    id: 'board.columns',
    name: '看板分栏',
    cat: 'flow',
    tags: ['看板', 'kanban', '分组'],
    w: 1000, h: 520,
    slots: [{ id: 'cols', label: '栏（2–4）', example: [{ title: '待办', items: ['事项一'] }] }],
    gen(s, pal, c = {}) {
      const cols = (c.cols || c.items || []).slice(0, 4);
      const n = Math.max(2, cols.length || 3);
      const cw = (1000 - (n - 1) * 16) / n;
      cols.forEach((col, i) => {
        const x = i * (cw + 16);
        rect(s, x, 0, cw, 520, { r: 10, fill: pal.t1, stroke: pal.t3, sw: 1 });
        rect(s, x, 0, cw, 46, { r: 10, fill: pal.primary });
        rect(s, x, 30, cw, 16, { fill: pal.primary });
        T(s, x, 0, cw, 46, col.title || `第 ${i + 1} 列`, { size: 13, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
        (col.items || []).slice(0, 5).forEach((it, j) => {
          const y = 62 + j * 86;
          rect(s, x + 10, y, cw - 20, 74, { r: 6, fill: pal.paper, stroke: pal.t3, sw: 1 });
          T(s, x + 20, y + 10, cw - 40, 54, it, { size: 10.5, weight: 400, color: pal.body, lh: 1.45 });
        });
      });
    },
  },
  {
    id: 'fan.hub',
    name: '双扇互动环',
    cat: 'structure',
    tags: ['扇形', '互动', '中心辐射', '全景', '直播'],
    w: 1500, h: 700,
    slots: [
      { id: 'center', label: '中心（2-6 字）', example: '互动直播' },
      { id: 'nodes', label: '内侧节点（2-4）', example: [{ title: '发现' }, { title: '挖掘' }, { title: '智能分析' }] },
      { id: 'left', label: '左扇标签（3-6）', example: [{ title: '精准引流' }, { title: '推广平台' }, { title: '策划服务' }] },
      { id: 'right', label: '右扇标签（3-6）', example: [{ title: '智能管理' }, { title: '客户运营' }, { title: '追加销售' }] },
      { id: 'topChips', label: '上方胶囊（1-2）', example: ['会议营销 裂变营销', '会员营销 口碑营销'] },
      { id: 'bottom', label: '下方胶囊', example: '互动强 销售前置 成本低 覆盖广' },
    ],
    gen(s, pal, c = {}) {
      const cx = 750, cy = 380;
      const halo = ellipse(s, cx - 432, cy - 432, 864, 864, { fill: pal.t1 });
      ellipse(s, cx - 344, cy - 344, 688, 688, { stroke: pal.t3, sw: 1.1, dash: '6 7', fill: 'none' });
      ellipse(s, cx - 276, cy - 276, 552, 552, { stroke: pal.t4, sw: 1, dash: '3 6', fill: 'none' });

      // 左右扇形（用浅色多边形 + 分段填充表现扇面）
      const wing = (a0, a1, fill, edge) => {
        const pts = [[cx, cy]];
        for (let i = 0; i <= 40; i++) {
          const a = a0 + ((a1 - a0) * i) / 40;
          pts.push([cx + Math.cos(a) * 430, cy + Math.sin(a) * 414]);
        }
        poly(s, pts, { fill, stroke: edge, sw: 1 });
      };
      wing(Math.PI * 0.72, Math.PI * 1.28, pal.t1, pal.t3);   // 左扇
      wing(-Math.PI * 0.28, Math.PI * 0.28, pal.t2, pal.t3);  // 右扇
      // 扇面上再压一层更浅的内扇，做出层次
      wing(Math.PI * 0.82, Math.PI * 1.18, pal.paper, pal.t4);
      wing(-Math.PI * 0.18, Math.PI * 0.18, pal.paper, pal.t4);

      const pill = (x, y, w, h, label, opt = {}) => {
        rect(s, x, y, w, h, { r: h / 2, fill: opt.fill || pal.primary, stroke: opt.stroke || 'none', sw: opt.sw || 0 });
        T(s, x + 8, y, w - 16, h, label, { size: opt.size || 12, weight: 700, color: opt.color || '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
      };

      // 外圈标签
      const place = (list, a0, a1) => {
        const n = Math.max(1, list.length);
        list.forEach((it, i) => {
          const t = n === 1 ? 0.5 : i / (n - 1);
          const a = a0 + (a1 - a0) * t;
          const px = cx + Math.cos(a) * 412, py = cy + Math.sin(a) * 398;
          const label = String(it.title || it.label || it);
          const w = Math.min(160, label.length * 14 + 26);
          line(s, cx + Math.cos(a) * 212, cy + Math.sin(a) * 206, px - Math.cos(a) * 18, py - Math.sin(a) * 18, { stroke: pal.t4, sw: 1.1, dash: '3 5' });
          ellipse(s, px - 5, py - 5, 10, 10, { fill: pal.primary });
          pill(px - w / 2, py - 16, w, 32, label, { size: 11.5 });
        });
      };
      place(c.left || [], Math.PI * 0.84, Math.PI * 1.22);
      place(c.right || [], -Math.PI * 0.19, Math.PI * 0.22);

      // 内侧节点
      const nodes = c.nodes || [];
      const nodeAngle = [Math.PI, Math.PI * 0.78, Math.PI * 0.22, Math.PI * 1.5];
      nodes.slice(0, 4).forEach((it, i) => {
        const a = nodeAngle[i] ?? Math.PI;
        const nx = cx + Math.cos(a) * 212, ny = cy + Math.sin(a) * 206;
        line(s, cx + Math.cos(a) * 118, cy + Math.sin(a) * 114, nx - Math.cos(a) * 62, ny - Math.sin(a) * 36, { stroke: pal.t4, sw: 1.2, dash: '4 4' });
        ellipse(s, nx - 72, ny - 38, 144, 76, { r: 14, fill: pal.primary });
        ellipse(s, nx - 64, ny - 30, 128, 60, { stroke: 'rgba(255,255,255,.55)', sw: 1, fill: 'none', dash: '3 3' });
        T(s, nx - 62, ny - 38, 124, 76, String(it.title || ''), { size: 12.5, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
      });

      // 上方两枚胶囊
      const chips = (c.topChips || []).slice(0, 2);
      chips.forEach((label, i) => {
        const w = Math.min(300, String(label).length * 15 + 40);
        const x = cx - (chips.length === 2 ? (i === 0 ? w + 12 : 0) : w / 2);
        pill(x, cy - 258 + (i % 2) * 0, w, 40, String(label), { size: 12.5 });
      });

      // 中心
      ellipse(s, cx - 118, cy - 118, 236, 236, { fill: pal.primary });
      ellipse(s, cx - 100, cy - 100, 200, 200, { stroke: 'rgba(255,255,255,.6)', sw: 1.3, fill: 'none', dash: '5 5' });
      poly(s, [[cx - 26, cy - 30], [cx + 30, cy], [cx - 26, cy + 30]], { fill: '#fff' });
      T(s, cx - 92, cy + 44, 184, 30, String(c.center || '互动直播'), { size: 16, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });

      // 下方胶囊
      if (c.bottom) {
        const w = Math.min(470, String(c.bottom).length * 15 + 46);
        pill(cx - w / 2, cy + 244, w, 44, String(c.bottom), { size: 13 });
      }

      // 虚线标注
      T(s, cx - 360, cy - 152, 150, 24, '持续挖掘', { size: 10.5, weight: 600, color: pal.muted, align: 'center' }, { noWrap: true });
      line(s, cx - 300, cy - 128, cx - 196, cy - 96, { stroke: pal.t4, sw: 1.1, dash: '4 4' });
      T(s, cx + 300, cy + 306, 320, 24, '通过直播持续做客户触达', { size: 10.5, weight: 600, color: pal.muted, align: 'center' }, { noWrap: true });
    },
  },
];
