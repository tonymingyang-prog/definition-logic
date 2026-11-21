// 组合层：把原子/生成器放进画布，负责缩放、对齐与整页预设
import { scene, buildPalette, TYPE } from './core.js';
import { ELEMENTS, DECOR } from './elements.js';
import { GENERATORS } from './generators.js';
import { sampleContent } from './samples.js';

export const ALL = [...ELEMENTS, ...GENERATORS, ...DECOR];
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
    name: '平台总体架构（叠层 + 能力带）',
    w: 1280, h: 720, palette: 'orange',
    blocks: [
      { id: 'title.block', box: { x: 60, y: 44, w: 720, h: 96 }, content: { kicker: 'PLATFORM', title: '平台总体架构', desc: '一套底座支撑多业务线的复用与扩展' } },
      { id: 'platform.disc', box: { x: 150, y: 200, w: 980, h: 430 }, content: { layers: [
        { title: '应用层', items: ['营销', '供应', '财务', '人力'] },
        { title: '中台层', items: ['数据中台', '业务中台', '技术中台'] },
        { title: '底座层', items: ['云原生', '数据湖', '安全'] },
      ] } },
    ],
  },
  'capability-matrix': {
    name: '能力矩阵（四象限）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 60, y: 44, w: 720, h: 96 }, content: { kicker: 'MATRIX', title: '能力评估矩阵', desc: '按成熟度与业务价值分组' } },
      { id: 'matrix.grid', box: { x: 100, y: 168, w: 1080, h: 440 }, content: {
        cols: ['交易域', '履约域', '客户域'],
        rows: ['现状', '目标', '差距'],
        cells: [
          ['订单中心已上线', '分单规则硬编码', '客户视图分散'],
          ['统一订单模型', '规则引擎化', 'OneID 打通'],
          ['模型收敛 60%', '规则可配置', '主数据治理'],
        ],
      } },
    ],
  },
  'process-roadmap': {
    name: '流程与路线（V 形 + 时间轴）',
    w: 1280, h: 720, palette: 'green',
    blocks: [
      { id: 'title.block', box: { x: 60, y: 44, w: 720, h: 96 }, content: { kicker: 'PROCESS', title: '端到端流程与落地节奏', desc: '从需求到上线的五段式推进' } },
      { id: 'flow.chevron', box: { x: 60, y: 160, w: 1160, h: 130 }, content: { items: [
        { title: '需求澄清' }, { title: '方案设计' }, { title: '开发联调' }, { title: '灰度验证' }, { title: '全量上线' },
      ] } },
      { id: 'timeline', box: { x: 80, y: 340, w: 1120, h: 260 }, content: { items: [
        { date: '2025 Q1', title: '底座搭建', desc: '云资源与数据接入' },
        { date: '2025 Q2', title: '中台成型', desc: '用户/订单/商品域' },
        { date: '2025 Q3', title: '业务迁移', desc: '两条业务线切流' },
        { date: '2025 Q4', title: '规模化', desc: '指标口径统一' },
      ] } },
    ],
  },
  'ecosystem': {
    name: '生态与支撑（中心 + 两侧）',
    w: 1280, h: 720, palette: 'purple',
    blocks: [
      { id: 'title.block', box: { x: 60, y: 44, w: 720, h: 96 }, content: { kicker: 'ECOSYSTEM', title: '生态协同关系', desc: '主体能力与上下游支撑网络' } },
      { id: 'eco.bracket', box: { x: 80, y: 150, w: 1120, h: 540 }, content: {
        center: '业务中台',
        left: ['数据标准', '主数据', '指标口径', '安全合规'],
        right: ['运维保障', '监控告警', '灰度发布', '容量规划'],
      } },
    ],
  },
  'hub-overview': {
    name: '中心辐射（一图看全局）',
    w: 1280, h: 720, palette: 'teal',
    blocks: [
      { id: 'title.block', box: { x: 60, y: 44, w: 720, h: 96 }, content: { kicker: 'OVERVIEW', title: '数字化能力全景', desc: '一个中心，六个方向的能力辐射' } },
      { id: 'hub.radial', box: { x: 340, y: 150, w: 600, h: 540 }, content: {
        center: '数据中台',
        items: [{ title: '报表看板' }, { title: '标签画像' }, { title: '指标服务' }, { title: '自助分析' }, { title: '数据资产' }, { title: '实时计算' }],
      } },
      { id: 'card.stat', box: { x: 60, y: 480, w: 220, h: 110 }, content: { value: '1200+', label: '指标口径', delta: '+18%' } },
      { id: 'card.stat', box: { x: 1000, y: 480, w: 220, h: 110 }, content: { value: '98%', label: '任务成功率', delta: '+3pt' } },
    ],
  },
  'solution-dual': {
    name: '双边方案（双中心桥接）',
    w: 1280, h: 720, palette: 'red',
    blocks: [
      { id: 'title.block', box: { x: 60, y: 44, w: 720, h: 96 }, content: { kicker: 'SOLUTION', title: '线上线下双轮驱动', desc: '数字化能力与自动化能力互相放大' } },
      { id: 'dual.hub', box: { x: 140, y: 200, w: 1000, h: 440 }, content: { left: '数字化', right: '自动化', bridge: '数实融合' } },
      { id: 'divider', box: { x: 480, y: 620, w: 320, h: 36 }, content: { label: '数据回流 · 闭环运营' } },
    ],
  },
  'live-fan-hub': {
    name: '双扇互动环（中心 + 双扇 + 胶囊）',
    w: 1600, h: 900, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 170, y: 26, w: 1260, h: 92 }, content: {
        kicker: 'LIVE COMMERCE · INTEGRATED SERVICE',
        title: '直播营销一体化服务，迟速赋能企业创新',
        desc: '从公域获客到私域复购，一次直播贯穿用户全生命周期' } },
      { id: 'card.plain', box: { x: 96, y: 148, w: 430, h: 84 }, content: { title: '布局直播营销矩阵', desc: '搭建企业自有流量池' } },
      { id: 'card.plain', box: { x: 585, y: 148, w: 430, h: 84 }, content: { title: '覆盖直播前中后', desc: '流程的互动直播' } },
      { id: 'card.plain', box: { x: 1074, y: 148, w: 430, h: 84 }, content: { title: '数据驱动下，深入用户', desc: '全生命周期的用户运营' } },
      { id: 'fan.hub', box: { x: 40, y: 286, w: 1520, h: 596 }, content: {
        center: '互动直播',
        nodes: [{ title: '发现' }, { title: '挖掘' }, { title: '智能分析' }],
        left: [{ title: '精准引流' }, { title: '微吼引流' }, { title: '推广平台' }, { title: '广告平台' }, { title: '策划服务' }],
        right: [{ title: '售后服务' }, { title: '产生复购' }, { title: '客户成功' }, { title: '客户运营' }, { title: '追加销售' }],
        topChips: ['会议营销 裂变营销', '会员营销 社会化营销 口碑营销'],
        bottom: '互动强 · 销售前置 · 成本低 · 覆盖广' } },
    ],
  },
};
