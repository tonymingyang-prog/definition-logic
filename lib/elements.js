// 原子元素：每个元素在本地设计坐标里绘制，调用方按目标框等比缩放
import { scene, rect, ellipse, poly, line, path, text, TYPE, wrapText, measureText, roundRectPath, lighten, darken, chevronPoints, cylinder } from './core.js';

export const STYLE = (name, pal, over = {}) => {
  const base = TYPE[name] || TYPE.body;
  const color = base.color === 'ink' ? pal.ink : base.color === 'body' ? pal.body : base.color === 'muted' ? pal.muted : base.color === 'primary' ? pal.primary : base.color;
  return { size: base.size, weight: base.weight, lh: base.lh, tracking: base.tracking, color, ...over };
};

const T = (s, x, y, w, h, str, st, extra = {}) =>
  text(s, x, y, w, h, str, { size: st.size, weight: st.weight, color: st.color, lh: st.lh, tracking: st.tracking, align: st.align, valign: st.valign, ...extra });

// 拖尾小三角 / 箭头
export function arrow(s, x1, y1, x2, y2, color, sw = 2, head = 7) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - Math.cos(ang) * head * 0.9;
  const by = y2 - Math.sin(ang) * head * 0.9;
  line(s, x1, y1, bx, by, { stroke: color, sw, linecap: 'round' });
  const p1 = [x2, y2];
  const p2 = [x2 - Math.cos(ang - 0.42) * head, y2 - Math.sin(ang - 0.42) * head];
  const p3 = [x2 - Math.cos(ang + 0.42) * head, y2 - Math.sin(ang + 0.42) * head];
  poly(s, [p1, p2, p3], { fill: color });
}

// ---------------- 原子 ----------------
export const ELEMENTS = [
  {
    id: 'card.plain',
    name: '标准卡片',
    cat: 'surface',
    tags: ['卡片', 'card', '标题+说明'],
    w: 300, h: 96,
    slots: [{ id: 'title', label: '标题', example: '业务中台' }, { id: 'desc', label: '说明', example: '统一口径 · 复用能力 · 快速交付' }],
    draw(s, pal, c = {}) {
      rect(s, 0, 0, 300, 96, { r: 10, fill: '#FFFFFF', stroke: pal.t2, sw: 1, shadow: { color: pal.deep, blur: 12, dist: 3, dir: 90, opacity: 0.10 } });
      rect(s, 0, 0, 4, 96, { r: 2, fill: pal.primary });
      T(s, 18, 18, 260, 24, c.title || '业务中台', STYLE('h3', pal));
      T(s, 18, 46, 262, 40, c.desc || '统一口径 · 复用能力 · 快速交付', STYLE('small', pal));
    },
  },
  {
    id: 'card.icon',
    name: '图标卡片',
    cat: 'surface',
    tags: ['卡片', '图标', '能力'],
    w: 300, h: 132,
    slots: [
      { id: 'title', label: '标题', example: '数据治理' },
      { id: 'desc', label: '说明', example: '主数据 · 质量 · 血缘' },
      { id: 'glyph', label: '图标字', example: '◈' },
    ],
    draw(s, pal, c = {}) {
      rect(s, 0, 0, 300, 132, { r: 10, fill: pal.t1, stroke: pal.t3, sw: 1 });
      ellipse(s, 16, 16, 40, 40, { fill: pal.primary });
      T(s, 16, 16, 40, 40, c.glyph || '◈', { size: 18, weight: 400, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
      T(s, 68, 20, 214, 22, c.title || '数据治理', STYLE('h3', pal));
      T(s, 68, 46, 214, 20, c.desc || '主数据 · 质量 · 血缘', STYLE('micro', pal));
      line(s, 16, 104, 284, 104, { stroke: pal.t4, sw: 1 });
      T(s, 16, 112, 268, 14, c.foot || 'CAPABILITY', { size: 9, weight: 700, color: pal.primary, tracking: 1.2 });
    },
  },
  {
    id: 'card.stat',
    name: '指标卡片',
    cat: 'surface',
    tags: ['数字', 'KPI', '指标'],
    w: 236, h: 112,
    slots: [
      { id: 'value', label: '数值', example: '86%' },
      { id: 'label', label: '标签', example: '流程线上化率' },
      { id: 'delta', label: '增量', example: '+12pt' },
    ],
    draw(s, pal, c = {}) {
      rect(s, 0, 0, 236, 112, { r: 10, fill: '#FFFFFF', stroke: pal.t2, sw: 1, shadow: { color: pal.deep, blur: 12, dist: 3, dir: 90, opacity: 0.10 } });
      T(s, 20, 16, 196, 46, c.value || '86%', { size: 36, weight: 700, color: pal.primary, lh: 1.1 });
      T(s, 20, 66, 196, 20, c.label || '流程线上化率', STYLE('small', pal));
      if (c.delta) {
        const w = Math.max(46, c.delta.length * 8 + 14);
        rect(s, 20, 84, w, 18, { r: 9, fillGrad: { from: pal.t1, to: pal.t3, angle: 90 }, stroke: pal.t3, sw: 1 });
        T(s, 20, 84, w, 18, c.delta, { size: 9.5, weight: 700, color: pal.d1, align: 'center', valign: 'middle' }, { noWrap: true });
      }
    },
  },
  {
    id: 'tab',
    name: '页签 / 胶囊',
    cat: 'surface',
    tags: ['tab', 'pill', '标签'],
    w: 150, h: 40,
    slots: [{ id: 'label', label: '文字', example: '生产制造' }],
    variants: ['filled', 'outline', 'ghost'],
    draw(s, pal, c = {}, v = 'filled') {
      if (v === 'filled') {
        rect(s, 0, 0, 150, 40, { r: 20, fill: pal.primary });
        T(s, 0, 0, 150, 40, c.label || '生产制造', { size: 13, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
      } else if (v === 'outline') {
        rect(s, 0, 0, 150, 40, { r: 20, fill: pal.paper, stroke: pal.t4, sw: 1.2 });
        T(s, 0, 0, 150, 40, c.label || '生产制造', { size: 13, weight: 700, color: pal.d1, align: 'center', valign: 'middle' }, { noWrap: true });
      } else {
        rect(s, 0, 0, 150, 40, { r: 20, fillGrad: { from: pal.t1, to: pal.t3, angle: 90 }, stroke: pal.t3, sw: 1 });
        T(s, 0, 0, 150, 40, c.label || '生产制造', { size: 13, weight: 700, color: pal.d1, align: 'center', valign: 'middle' }, { noWrap: true });
      }
    },
  },
  {
    id: 'chip',
    name: '小标签',
    cat: 'surface',
    tags: ['chip', 'tag', '标注'],
    w: 104, h: 26,
    slots: [{ id: 'label', label: '文字', example: '主数据' }],
    draw(s, pal, c = {}) {
      rect(s, 0, 0, 104, 26, { r: 13, fillGrad: { from: pal.t1, to: pal.t3, angle: 90 }, stroke: pal.t3, sw: 1 });
      T(s, 0, 0, 104, 26, c.label || '主数据', { size: 10.5, weight: 700, color: pal.d1, align: 'center', valign: 'middle' }, { noWrap: true });
    },
  },
  {
    id: 'badge.num',
    name: '序号徽标',
    cat: 'surface',
    tags: ['步骤', '编号', 'step'],
    w: 48, h: 48,
    slots: [{ id: 'num', label: '序号', example: '01' }],
    variants: ['solid', 'ring'],
    draw(s, pal, c = {}, v = 'solid') {
      if (v === 'ring') {
        ellipse(s, 1, 1, 46, 46, { fill: pal.paper, stroke: pal.primary, sw: 2 });
        T(s, 0, 0, 48, 48, c.num || '01', { size: 14, weight: 700, color: pal.primary, align: 'center', valign: 'middle' }, { noWrap: true });
      } else {
        ellipse(s, 0, 0, 48, 48, { fill: pal.primary });
        T(s, 0, 0, 48, 48, c.num || '01', { size: 14, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
      }
    },
  },
  {
    id: 'ribbon',
    name: '标题横幅',
    cat: 'surface',
    tags: ['banner', '标题条', '章节'],
    w: 340, h: 44,
    slots: [{ id: 'label', label: '文字', example: '平台总体架构' }],
    draw(s, pal, c = {}) {
      const n = 14;
      poly(s, [[n, 0], [340 - n, 0], [340, 22], [340 - n, 44], [n, 44], [0, 22]], { fill: pal.primary });
      T(s, n + 6, 0, 340 - 2 * n - 12, 44, c.label || '平台总体架构', { size: 15, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
    },
  },
  {
    id: 'label.aside',
    name: '侧边防标签',
    cat: 'surface',
    tags: ['竖排', 'aside', '分区'],
    w: 34, h: 180,
    slots: [{ id: 'label', label: '文字', example: '支撑层' }],
    draw(s, pal, c = {}) {
      rect(s, 0, 0, 34, 180, { r: 6, fill: pal.primary });
      const chars = String(c.label || '支撑层').split('').join('\n');
      T(s, 0, 0, 34, 180, chars, { size: 12, weight: 700, color: '#fff', align: 'center', valign: 'middle', lh: 1.5 });
    },
  },
  {
    id: 'metric.ring',
    name: '环形进度',
    cat: 'surface',
    tags: ['donut', '占比', '进度'],
    w: 168, h: 168,
    slots: [{ id: 'value', label: '数值', example: '72%' }, { id: 'label', label: '说明', example: '覆盖率' }],
    draw(s, pal, c = {}) {
      const cx = 84, cy = 84, r = 66;
      ellipse(s, cx - r, cy - r, r * 2, r * 2, { fillGrad: { from: '#FFFFFF', to: pal.t1, angle: 90 }, stroke: pal.t2, sw: 1 });
      const pct = Math.min(1, Math.max(0, parseFloat(String(c.value || '72').replace('%', '')) / 100));
      const a0 = -Math.PI / 2, a1 = a0 + Math.PI * 2 * pct;
      const pts = [];
      const steps = Math.max(8, Math.round(64 * pct));
      for (let i = 0; i <= steps; i++) {
        const a = a0 + ((a1 - a0) * i) / steps;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      for (let i = 0; i <= steps; i++) {
        const a = a1 - ((a1 - a0) * i) / steps;
        pts.push([cx + (r - 14) * Math.cos(a), cy + (r - 14) * Math.sin(a)]);
      }
      poly(s, pts, { fill: pal.primary });
      T(s, 24, 58, 120, 40, c.value || '72%', { size: 30, weight: 700, color: pal.deep, align: 'center', valign: 'middle' }, { noWrap: true });
      T(s, 24, 96, 120, 20, c.label || '覆盖率', { size: 11, weight: 400, color: pal.muted, align: 'center' }, { noWrap: true });
    },
  },
  {
    id: 'callout',
    name: '标注气泡',
    cat: 'surface',
    tags: ['气泡', '注释', 'callout'],
    w: 260, h: 96,
    slots: [{ id: 'title', label: '标题', example: '关键结论' }, { id: 'desc', label: '说明', example: '审批链路由 5 级压缩到 3 级' }],
    draw(s, pal, c = {}) {
      rect(s, 0, 0, 260, 78, { r: 8, fill: pal.paper, stroke: pal.primary, sw: 1.4 });
      poly(s, [[22, 78], [46, 78], [30, 96]], { fill: pal.paper, stroke: pal.primary, sw: 1.4 });
      rect(s, 20.5, 76, 26, 4, { fill: pal.paper });
      T(s, 14, 12, 232, 20, c.title || '关键结论', { size: 12, weight: 700, color: pal.primary });
      T(s, 14, 34, 232, 36, c.desc || '审批链路由 5 级压缩到 3 级', { size: 10.5, weight: 400, color: pal.body, lh: 1.4 });
    },
  },
  {
    id: 'zone',
    name: '虚线分区框',
    cat: 'frame',
    tags: ['zone', '容器', '分组'],
    w: 420, h: 240,
    slots: [{ id: 'label', label: '区名', example: '业务中台' }],
    draw(s, pal, c = {}) {
      rect(s, 0, 14, 420, 226, { r: 8, fill: pal.wash, stroke: pal.t4, sw: 1.2, dash: '6 5' });
      rect(s, 16, 0, 116, 28, { r: 6, fill: pal.primary });
      T(s, 16, 0, 116, 28, c.label || '业务中台', { size: 11.5, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
    },
  },
  {
    id: 'bracket',
    name: '侧边括号',
    cat: 'frame',
    tags: ['bracket', '括注', '对照'],
    w: 96, h: 240,
    slots: [{ id: 'label', label: '文字', example: '统一支撑' }],
    variants: ['left', 'right'],
    draw(s, pal, c = {}, v = 'left') {
      const pts = v === 'left'
        ? [[92, 6], [66, 6], [66, 234], [92, 234]]
        : [[4, 6], [30, 6], [30, 234], [4, 234]];
      poly(s, pts, { stroke: pal.primary, sw: 3, fill: 'none', open: true, linejoin: 'round' });
      const chars = String(c.label || '统一支撑').split('').join('\n');
      text(s, v === 'left' ? 0 : 40, 12, 56, 216, chars, { size: 11.5, weight: 700, color: pal.primary, align: 'center', valign: 'middle', lh: 1.5 });
    },
  },
  {
    id: 'rail',
    name: '纵向栏位',
    cat: 'frame',
    tags: ['栏', 'rail', '清单'],
    w: 150, h: 400,
    slots: [{ id: 'title', label: '栏标题', example: '公域' }],
    items: 4,
    draw(s, pal, c = {}, v = 'solid') {
      rect(s, 0, 0, 150, 400, { r: 8, fill: pal.t1, stroke: pal.t3, sw: 1 });
      rect(s, 0, 0, 150, 46, { r: 8, fill: pal.primary });
      rect(s, 0, 34, 150, 12, { fill: pal.primary });
      T(s, 0, 0, 150, 46, c.title || '公域', { size: 14, weight: 700, color: '#fff', align: 'center', valign: 'middle' }, { noWrap: true });
      const rows = c.rows || ['内容种草', '直播引流', '搜索承接', '私信转化'];
      rows.slice(0, 4).forEach((r, i) => {
        const y = 58 + i * 84;
        rect(s, 14, y, 122, 66, { r: 6, fill: '#FFFFFF', stroke: pal.t2, sw: 1, shadow: { color: pal.deep, blur: 12, dist: 3, dir: 90, opacity: 0.10 } });
        T(s, 24, y + 12, 102, 44, r, { size: 11, weight: 400, color: pal.body, lh: 1.4 });
      });
    },
  },
  {
    id: 'divider',
    name: '分隔标注',
    cat: 'surface',
    tags: ['divider', '过渡', '说明'],
    w: 320, h: 36,
    slots: [{ id: 'label', label: '文字', example: '数据回流' }],
    draw(s, pal, c = {}) {
      const label = c.label || '数据回流';
      const tw = Math.min(200, label.length * 13 + 24);
      rect(s, (320 - tw) / 2, 6, tw, 24, { r: 12, fillGrad: { from: pal.t1, to: pal.t3, angle: 90 }, stroke: pal.t3, sw: 1 });
      T(s, (320 - tw) / 2, 6, tw, 24, label, { size: 11, weight: 700, color: pal.d1, align: 'center', valign: 'middle' }, { noWrap: true });
      line(s, 0, 18, (320 - tw) / 2 - 8, 18, { stroke: pal.t4, sw: 1, dash: '4 4' });
      line(s, (320 + tw) / 2 + 8, 18, 320, 18, { stroke: pal.t4, sw: 1, dash: '4 4' });
    },
  },
  {
    id: 'metric.bar',
    name: '横向进度条',
    cat: 'surface',
    tags: ['bar', '占比', '对比'],
    w: 340, h: 54,
    slots: [{ id: 'label', label: '标签', example: '研发投入占比' }, { id: 'value', label: '数值', example: '68%' }],
    draw(s, pal, c = {}) {
      const pct = Math.min(1, Math.max(0, parseFloat(String(c.value || '68').replace('%', '')) / 100));
      T(s, 0, 2, 250, 18, c.label || '研发投入占比', { size: 12, weight: 400, color: pal.body }, { noWrap: true });
      T(s, 250, 2, 90, 18, c.value || '68%', { size: 12, weight: 700, color: pal.primary, align: 'right' }, { noWrap: true });
      rect(s, 0, 28, 340, 12, { r: 6, fillGrad: { from: pal.t1, to: pal.t3, angle: 90 }, stroke: pal.t3, sw: 1 });
      rect(s, 0, 28, Math.max(12, 340 * pct), 12, { r: 6, fill: pal.primary });
    },
  },
  {
    id: 'title.block',
    name: '标题块',
    cat: 'text',
    tags: ['标题', 'title', '页眉'],
    w: 640, h: 96,
    slots: [
      { id: 'kicker', label: '眉标', example: 'SECTION 01' },
      { id: 'title', label: '主标题', example: '平台总体架构' },
      { id: 'desc', label: '副说明', example: '一套底座支撑多业务线的复用与扩展' },
    ],
    draw(s, pal, c = {}) {
      T(s, 0, 0, 640, 16, c.kicker || 'SECTION 01', { size: 10, weight: 700, color: pal.primary, tracking: 2 });
      T(s, 0, 18, 640, 38, c.title || '平台总体架构', { size: 30, weight: 700, color: pal.ink });
      rect(s, 0, 64, 44, 3, { fill: pal.primary });
      T(s, 0, 74, 640, 20, c.desc || '一套底座支撑多业务线的复用与扩展', { size: 12, weight: 400, color: pal.muted });
    },
  },
];

// 装饰件
export const DECOR = [
  {
    id: 'decor.dot-arc',
    name: '点阵弧',
    cat: 'decor',
    tags: ['装饰', '点阵', '弧线'],
    w: 400, h: 120,
    draw(s, pal) {
      const cx = 200, cy = 118, R = 180;
      for (let r = 0; r < 3; r++) {
        for (let i = 0; i < 22; i++) {
          const a = Math.PI + (i / 21) * Math.PI;
          const rr = R - r * 14;
          const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.42;
          ellipse(s, x - 2.2, y - 2.2, 4.4, 4.4, { fill: r === 0 ? pal.t4 : pal.t3, opacity: 1 - r * 0.18 });
        }
      }
    },
  },
  {
    id: 'decor.orbit',
    name: '虚线轨道',
    cat: 'decor',
    tags: ['装饰', '轨道', '环'],
    w: 420, h: 180,
    draw(s, pal) {
      ellipse(s, 0, 0, 420, 180, { stroke: pal.t4, sw: 1.2, dash: '5 6', fill: 'none' });
      ellipse(s, 40, 18, 340, 144, { stroke: pal.t3, sw: 1, dash: '3 6', fill: 'none' });
    },
  },
  {
    id: 'decor.wash',
    name: '柔光底衬',
    cat: 'decor',
    tags: ['装饰', '背景', '渐变'],
    w: 420, h: 260,
    draw(s, pal) {
      ellipse(s, 0, 0, 420, 260, { fillGrad: { from: pal.t2, to: pal.t1, vertical: true }, opacity: 0.9 });
    },
  },
  {
    id: 'decor.corner',
    name: '角标刻度',
    cat: 'decor',
    tags: ['装饰', '角', '刻度'],
    w: 120, h: 120,
    draw(s, pal) {
      for (let i = 0; i < 6; i++) rect(s, 0, i * 20, i % 2 === 0 ? 42 : 24, 6, { fill: pal.t4 });
    },
  },
];
