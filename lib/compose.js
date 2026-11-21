// 组合层：把原子/生成器放进画布，负责缩放、对齐与整页预设
import { scene, buildPalette, TYPE } from './core.js';
import { ELEMENTS, DECOR } from './elements.js';
import { GENERATORS } from './generators.js';
import { GRAPHICS } from './graphics.js';
import { sampleContent } from './samples.js';

export const ALL = [...ELEMENTS, ...GENERATORS, ...DECOR, ...GRAPHICS];
export const byId = new Map(ALL.map((e) => [e.id, e]));

export const CATEGORIES = [
  { id: 'surface', name: '卡片与标签', desc: '卡片、页签、徽标、指标' },
  { id: 'frame', name: '容器与栏位', desc: '分区、括号、纵向栏' },
  { id: 'flow', name: '流程与路径', desc: 'V 形流程、步骤、时间轴、泳道' },
  { id: 'structure', name: '结构与体系', desc: '平台叠层、中心圆盘、辐射、矩阵' },
  { id: 'text', name: '文字块', desc: '标题、眉标、说明' },
  { id: 'decor', name: '装饰件', desc: '点阵、轨道、底衬' },
];

export function getDef(id) {
  const d = byId.get(id);
  if (!d) throw new Error(`unknown element: ${id}`);
  return d;
}

export function paletteOf(id) {
  return buildPalette(id);
}

// 在本地设计坐标里绘制
export function drawLocal(def, pal, content = {}, variant) {
  const s = scene(def.w, def.h, 'transparent');
  if (def.draw) def.draw(s, pal, content || {}, variant);
  else if (def.gen) def.gen(s, pal, content || {}, variant);
  return s;
}

// 等比缩放到目标框并居中
export function place(target, def, box, pal, content, variant) {
  const local = drawLocal(def, pal, content, variant);
  const sx = box.w / def.w;
  const sy = box.h / def.h;
  const s = Math.min(sx, sy);
  const ow = def.w * s, oh = def.h * s;
  const ox = box.x + (box.w - ow) / 2;
  const oy = box.y + (box.h - oh) / 2;

  for (const it of local.items) {
    const o = { ...it };
    if (o.type === 'rect' || o.type === 'ellipse' || o.type === 'text') {
      o.x = ox + it.x * s; o.y = oy + it.y * s;
      o.w = it.w * s; o.h = it.h * s;
      if (o.type === 'rect') o.r = (it.r || 0) * s;
      if (o.type === 'text') { o.size = it.size * s; o.tracking = it.tracking ? it.tracking * s : undefined; }
    } else if (o.type === 'poly') {
      o.points = it.points.map(([x, y]) => [ox + x * s, oy + y * s]);
      o.sw = (it.sw || 0) * s;
    } else if (o.type === 'line') {
      o.x1 = ox + it.x1 * s; o.y1 = oy + it.y1 * s;
      o.x2 = ox + it.x2 * s; o.y2 = oy + it.y2 * s;
      o.sw = (it.sw || 1) * s;
    } else if (o.type === 'path') {
      continue; // 元素库不使用裸路径
    }
    if (o.dash) o.dash = it.dash;
    target.items.push(o);
  }
  return { x: ox, y: oy, w: ow, h: oh };
}

// 整页组合
export function figure({ w = 1280, h = 720, bg = '#FFFFFF', palette = 'orange', blocks = [], padding = 60 } = {}) {
  const pal = buildPalette(palette);
  const s = scene(w, h, bg);
  for (const b of blocks) {
    const def = getDef(b.id);
    const box = b.box || defBox(def, w, h, padding);
    place(s, def, box, b.palette ? buildPalette(b.palette) : pal, { ...sampleContent(def), ...(b.content || {}) }, b.variant);
  }
  return s;
}

function defBox(def, w, h, padding) {
  return { x: padding, y: padding, w: w - padding * 2, h: h - padding * 2 };
}

// 把任意场景等比缩放并居中到另一张画布（元素 → 16:9 页面）
export function scaleScene(src, { w, h, padding = 48 } = {}) {
  const W = w || src.w, H = h || src.h;
  const s = Math.min(1, (W - padding * 2) / src.w, (H - padding * 2) / src.h);
  const ox = (W - src.w * s) / 2, oy = (H - src.h * s) / 2;
  const out = scene(W, H, src.bg || '#FFFFFF');
  for (const it of src.items) {
    const o = { ...it };
    if (o.type === 'rect' || o.type === 'ellipse' || o.type === 'text') {
      o.x = ox + it.x * s; o.y = oy + it.y * s; o.w = it.w * s; o.h = it.h * s;
      if (o.type === 'rect') o.r = (it.r || 0) * s;
      if (o.type === 'text') { o.size = it.size * s; o.tracking = it.tracking ? it.tracking * s : undefined; }
    } else if (o.type === 'poly') {
      o.points = it.points.map(([x, y]) => [ox + x * s, oy + y * s]);
      o.sw = (it.sw || 0) * s;
    } else if (o.type === 'line') {
      o.x1 = ox + it.x1 * s; o.y1 = oy + it.y1 * s; o.x2 = ox + it.x2 * s; o.y2 = oy + it.y2 * s;
      o.sw = (it.sw || 1) * s;
    }
    out.items.push(o);
  }
  return out;
}

// 预设：常用整页版式（可直接改动文字后使用）
export const PRESETS = {
  'platform-overview': {
    name: '平台总体架构（叠层 + 结论条）',
    w: 1280, h: 720, palette: 'orange',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'PLATFORM ARCHITECTURE', title: '平台总体架构', desc: '一套底座支撑多业务线的复用与扩展' } },
      { id: 'platform.disc', box: { x: 170, y: 150, w: 940, h: 430 }, content: { layers: [
        { title: '应用层', items: ['营销', '供应', '财务', '人力'] },
        { title: '中台层', items: ['数据中台', '业务中台', '技术中台'] },
        { title: '底座层', items: ['云原生', '数据湖', '安全'] },
      ] } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '分层不是目的，是让「换一层」的成本从月降到天' } },
    ],
  },
  'capability-matrix': {
    name: '能力矩阵（四象限 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'CAPABILITY MATRIX', title: '能力评估矩阵', desc: '按业务域 × 成熟度分组，先补缺口再谈复制' } },
      { id: 'matrix.grid', box: { x: 44, y: 146, w: 1192, h: 452 }, content: {
        cols: ['交易域', '履约域', '客户域'],
        rows: ['现状', '目标', '差距'],
        cells: [
          ['订单中心已上线', '分单规则硬编码', '客户视图分散'],
          ['统一订单模型', '规则引擎化', 'OneID 打通'],
          ['模型收敛 60%', '规则可配置', '主数据治理'],
        ],
      } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '矩阵不是分类工具，是决定「先动谁」的排序工具' } },
    ],
  },
  'process-roadmap': {
    name: '流程与路线（V 形 + 时间轴 + 结论条）',
    w: 1280, h: 720, palette: 'green',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'PROCESS & ROADMAP', title: '端到端流程与落地节奏', desc: '五段式推进，每段有出口' } },
      { id: 'flow.chevron', box: { x: 44, y: 146, w: 1192, h: 126 }, content: { items: [
        { title: '需求澄清' }, { title: '方案设计' }, { title: '开发联调' }, { title: '灰度验证' }, { title: '全量上线' },
      ] } },
      { id: 'timeline', box: { x: 64, y: 316, w: 1152, h: 280 }, content: { items: [
        { date: '2026 Q1', title: '底座搭建', desc: '云资源与数据接入' },
        { date: '2026 Q2', title: '中台成型', desc: '用户/订单/商品域' },
        { date: '2026 Q3', title: '业务迁移', desc: '两条业务线切流' },
        { date: '2026 Q4', title: '规模化', desc: '指标口径统一' },
      ] } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '流程与节奏要一起画：流程回答怎么做，时间轴回答什么时候见效' } },
    ],
  },
  'ecosystem': {
    name: '生态与支撑（中心 + 两侧 + 结论条）',
    w: 1280, h: 720, palette: 'purple',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'ECOSYSTEM', title: '生态协同关系', desc: '主体能力与上下游支撑网络' } },
      { id: 'eco.bracket', box: { x: 54, y: 150, w: 1172, h: 430 }, content: {
        center: '业务中台',
        left: ['数据标准', '主数据', '指标口径', '安全合规'],
        right: ['运维保障', '监控告警', '灰度发布', '容量规划'],
      } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '平台做连接与标准，专业能力留给生态伙伴' } },
    ],
  },
  'hub-overview': {
    name: '中心辐射（一图看全局 + 结论条）',
    w: 1280, h: 720, palette: 'teal',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'OVERVIEW', title: '数字化能力全景', desc: '一个中心，六个方向的能力辐射' } },
      { id: 'hub.radial', box: { x: 56, y: 146, w: 700, h: 462 }, content: {
        center: '数据中台',
        items: [{ title: '报表看板' }, { title: '标签画像' }, { title: '指标服务' }, { title: '自助分析' }, { title: '数据资产' }, { title: '实时计算' }],
      } },
      { id: 'card.stat', box: { x: 800, y: 170, w: 380, h: 130 }, content: { value: '1200+', label: '已治理指标口径', delta: '' } },
      { id: 'card.stat', box: { x: 800, y: 330, w: 380, h: 130 }, content: { value: '98%', label: '任务成功率', delta: '' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '能力要先收成一个中心，辐射才不是各建各的' } },
    ],
  },
  'solution-dual': {
    name: '双边方案（双中心桥接 + 结论条）',
    w: 1280, h: 720, palette: 'red',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'SOLUTION', title: '线上线下双轮驱动', desc: '数字化能力与自动化能力互相放大' } },
      { id: 'dual.hub', box: { x: 140, y: 170, w: 1000, h: 400 }, content: { left: '数字化', right: '自动化', bridge: '数实融合' } },
      { id: 'divider', box: { x: 480, y: 566, w: 320, h: 36 }, content: { label: '数据回流 · 闭环运营' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '两边各自最优不等于整体最优，桥接处才是价值' } },
    ],
  },
};
