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
    name: '平台总体架构（叠层 + 四注解 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'PLATFORM ARCHITECTURE', title: '平台总体架构', desc: '一套底座，支撑多业务线的复用与扩展' } },
      { id: 'platform.disc', box: { x: 96, y: 150, w: 856, h: 380 }, content: { layers: [
        { title: '应用层', items: ['营销', '交易', '履约', '结算'] },
        { title: '能力层', items: ['用户', '商品', '订单', '支付'] },
        { title: '数据层', items: ['数仓', '标签', '模型'] },
        { title: '底座层', items: ['云原生', '安全合规'] },
      ] } },
      { id: 'card.plain', box: { x: 972, y: 156, w: 264, h: 100 }, content: { title: '统一入口', desc: '一个门户收敛所有系统的登录与待办' } },
      { id: 'card.plain', box: { x: 972, y: 268, w: 264, h: 100 }, content: { title: '能力复用', desc: '四类核心能力全公司共用一份' } },
      { id: 'card.plain', box: { x: 972, y: 380, w: 264, h: 100 }, content: { title: '模型可换', desc: '换一层不动其他三层' } },
      { id: 'card.plain', box: { x: 972, y: 492, w: 264, h: 100 }, content: { title: '成本可算', desc: '按业务量计量资源与调用' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '分层不是目的，是让「换一层」不动其他三层' } },
    ],
  },
  'capability-matrix': {
    name: '能力评估矩阵（矩阵 + 三卡 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'CAPABILITY MATRIX', title: '业务能力矩阵', desc: '按业务域 × 目标状态排，先补差距再谈复制' } },
      { id: 'matrix.grid', box: { x: 44, y: 150, w: 920, h: 452 }, content: {
        cols: ['交易域', '履约域', '客户域'],
        rows: ['现状', '目标', '差距'],
        cells: [
          ['订单中心已上线', '分单规则硬编码', '客户视图分散'],
          ['统一订单模型', '规则引擎化', 'OneID 打通'],
          ['模型收敛 60%', '规则可配置', '主数据待治理'],
        ],
      } },
      { id: 'card.plain', box: { x: 988, y: 160, w: 248, h: 130 }, content: { title: '先动谁', desc: '差距最小的域先跑通，再复制另外两个域' } },
      { id: 'card.plain', box: { x: 988, y: 306, w: 248, h: 130 }, content: { title: '怎么判断', desc: '建模难度低、数据齐、业务痛感强的优先' } },
      { id: 'card.plain', box: { x: 988, y: 452, w: 248, h: 130 }, content: { title: '什么时候复制', desc: '单域复用率过 60% 再复制，避免带病推广' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '矩阵不是分类工具，是决定「先动谁」的排序工具' } },
    ],
  },
  'process-roadmap': {
    name: '端到端流程与路线（V 形 + 阶段卡 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'PROCESS & ROADMAP', title: '端到端流程与落地节奏', desc: '五段式推进，每段有出口、有验收' } },
      { id: 'flow.chevron', box: { x: 44, y: 146, w: 1192, h: 126 }, content: { items: [
        { title: '需求澄清' }, { title: '方案设计' }, { title: '开发联调' }, { title: '灰度验证' }, { title: '全量上线' },
      ] } },
      { id: 'card.plain', box: { x: 44, y: 292, w: 282, h: 140 }, content: { title: 'Q1 底座与标准', desc: '云资源、数据接入、接口规范' } },
      { id: 'card.plain', box: { x: 346, y: 292, w: 282, h: 140 }, content: { title: 'Q2 能力沉淀', desc: '三个核心域的能力上线' } },
      { id: 'card.plain', box: { x: 648, y: 292, w: 282, h: 140 }, content: { title: 'Q3 业务切流', desc: '两条业务线迁移，双跑后切流' } },
      { id: 'card.plain', box: { x: 950, y: 292, w: 286, h: 140 }, content: { title: 'Q4 规模化', desc: '其余域按模板复制，季度上线' } },
      { id: 'card.plain', box: { x: 44, y: 456, w: 580, h: 100 }, content: { title: '每段都有出口', desc: '诊断要基线报告、设计要能力清单、试点要端到端跑通' } },
      { id: 'card.plain', box: { x: 656, y: 456, w: 580, h: 100 }, content: { title: '验收由业务签字', desc: '平台只提能力，业务线认领场景并对结果负责' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '流程回答怎么做，时间轴回答什么时候见效' } },
    ],
  },
  'ecosystem': {
    name: '生态与支撑（中心 + 两侧 + 三卡 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'ECOSYSTEM', title: '生态协同关系', desc: '主体能力与上下游支撑网络' } },
      { id: 'eco.bracket', box: { x: 54, y: 144, w: 1172, h: 396 }, content: {
        center: '业务中台',
        left: ['数据标准', '主数据', '指标口径', '安全合规'],
        right: ['运维保障', '监控告警', '灰度发布', '容量规划'],
      } },
      { id: 'card.plain', box: { x: 44, y: 548, w: 372, h: 68 }, content: { title: '连接', desc: '统一协议接入，伙伴一次对接全场景可用' } },
      { id: 'card.plain', box: { x: 454, y: 548, w: 372, h: 68 }, content: { title: '标准', desc: '数据格式与口径由中台定义' } },
      { id: 'card.plain', box: { x: 864, y: 548, w: 372, h: 68 }, content: { title: '分工', desc: '中台做连接，专业能力留给伙伴' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '平台做连接与标准，专业能力留给伙伴' } },
    ],
  },
  'hub-overview': {
    name: '中心辐射（中心 + 四注解 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'OVERVIEW', title: '数据能力全景', desc: '一个中心，六个方向的能力辐射' } },
      { id: 'hub.radial', box: { x: 56, y: 146, w: 700, h: 462 }, content: {
        center: '数据中台',
        items: [{ title: '报表看板' }, { title: '标签画像' }, { title: '指标服务' }, { title: '自助分析' }, { title: '数据资产' }, { title: '实时计算' }],
      } },
      { id: 'card.plain', box: { x: 800, y: 156, w: 436, h: 100 }, content: { title: '报表：从取数到自助', desc: '80% 的取数需求由业务自助完成' } },
      { id: 'card.plain', box: { x: 800, y: 272, w: 436, h: 100 }, content: { title: '标签：从人肉到模型', desc: '标签由规则生成，口径统一可追溯' } },
      { id: 'card.plain', box: { x: 800, y: 388, w: 436, h: 100 }, content: { title: '指标：从口径之争到一处定义', desc: '一个指标只在汇总层定义一次' } },
      { id: 'card.plain', box: { x: 800, y: 504, w: 436, h: 100 }, content: { title: '资产：从表到资产目录', desc: '表、字段、血缘统一登记可检索' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '能力要先收成一个中心，辐射才不是各建各的' } },
    ],
  },
  'solution-dual': {
    name: '双边方案（双中心桥接 + 两张对照 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'SOLUTION', title: '线上线下双轮驱动', desc: '线上交易与线下履约互相放大' } },
      { id: 'dual.hub', box: { x: 140, y: 150, w: 1000, h: 340 }, content: { left: '线上交易', right: '线下履约', bridge: '数据回流' } },
      { id: 'card.plain', box: { x: 44, y: 510, w: 580, h: 96 }, content: { title: '线上：把漏斗做宽', desc: '渠道、投放、转化——规模与效率' } },
      { id: 'card.plain', box: { x: 656, y: 510, w: 580, h: 96 }, content: { title: '线下：把体验做实', desc: '门店、服务、售后——质量与口碑' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '两边各自最优不等于整体最优，桥接处才是价值' } },
    ],
  },
  'ring-panorama': {
    name: '环形全景（满版，无页眉）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'ring.system', box: { x: 287, y: 7, w: 706, h: 706 }, content: {
        center: '创造\n客户价值',
        venn: ['业务价值', '数据价值', '组织价值'],
        segments: ['营销', '供应链', '制造', '服务', '财务', '人力'],
        nodes: ['客户', '员工', '合作伙伴', '监管', '社区', '股东', '供应商', '渠道'],
        arcs: ['专业 定义逻辑图', '高效 定义逻辑图', '可信 定义逻辑图', '共赢 定义逻辑图', '创新 定义逻辑图'],
      } },
    ],
  },
  'ring-ecosystem': {
    name: '环形体系（同心扇区 + 两侧说明）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'BUSINESS ECOSYSTEM', title: '业务生态全景', desc: '一个中心、六个业务、八方相关方' } },
      { id: 'ring.system', box: { x: 380, y: 96, w: 560, h: 560 }, content: {
        center: '创造\n客户价值',
        venn: ['业务价值', '数据价值', '组织价值'],
        segments: ['营销', '供应链', '制造', '服务', '财务', '人力'],
        nodes: ['客户', '员工', '合作伙伴', '监管', '社区', '股东', '供应商', '渠道'],
        arcs: ['专业 定义逻辑图', '高效 定义逻辑图', '可信 定义逻辑图', '共赢 定义逻辑图', '创新 定义逻辑图'],
      } },
      { id: 'card.plain', box: { x: 44, y: 176, w: 300, h: 110 }, content: { title: '中心：一句话说清价值', desc: '为谁创造什么价值，只写一句' } },
      { id: 'card.plain', box: { x: 44, y: 318, w: 300, h: 110 }, content: { title: '中圈：4–8 个业务扇区', desc: '同一层级、互不包含，顺时针排' } },
      { id: 'card.plain', box: { x: 44, y: 460, w: 300, h: 110 }, content: { title: '内圈：三圆交叠', desc: '三个价值维度，交集就是主张' } },
      { id: 'card.plain', box: { x: 936, y: 176, w: 300, h: 110 }, content: { title: '外圈：6–10 个相关方', desc: '虚线表示协同，不是隶属' } },
      { id: 'card.plain', box: { x: 936, y: 318, w: 300, h: 110 }, content: { title: '角标：2–5 个关键词', desc: '沿弧线排字，首尾带端点' } },
      { id: 'card.plain', box: { x: 936, y: 460, w: 300, h: 110 }, content: { title: '换内容即换行业', desc: '扇区与相关方一换，就是另一版' } },
    ],
  },
};
