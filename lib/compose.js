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
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'TALENT PLATFORM', title: '人才数智平台总体架构', desc: '一套底座，支撑招聘、用工与员工全链路' } },
      { id: 'platform.disc', box: { x: 96, y: 150, w: 856, h: 380 }, content: { layers: [
        { title: '场景层', items: ['招聘', '入职', '员工服务', '绩效'] },
        { title: '能力层', items: ['画像', '匹配', '问答', '测评'] },
        { title: '模型与数据层', items: ['简历库', '人才标签', '大模型'] },
        { title: '底座层', items: ['云原生', '安全合规'] },
      ] } },
      { id: 'card.plain', box: { x: 972, y: 156, w: 264, h: 100 }, content: { title: '统一入口', desc: '一个工作台收敛所有 HR 系统入口' } },
      { id: 'card.plain', box: { x: 972, y: 268, w: 264, h: 100 }, content: { title: '能力复用', desc: '画像、匹配、问答、测评四类共用' } },
      { id: 'card.plain', box: { x: 972, y: 380, w: 264, h: 100 }, content: { title: '模型可换', desc: '换模型不改场景代码与提示词' } },
      { id: 'card.plain', box: { x: 972, y: 492, w: 264, h: 100 }, content: { title: '成本可算', desc: '按场景计量调用与算力，可分摊' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '分层不是目的，是让「换一层」不动其他三层' } },
    ],
  },
  'capability-matrix': {
    name: '能力评估矩阵（矩阵 + 判定 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'CAPABILITY MATRIX', title: '人才服务能力矩阵', desc: '按业务域 × 目标状态排，先补差距再谈复制' } },
      { id: 'matrix.grid', box: { x: 44, y: 150, w: 920, h: 452 }, content: {
        cols: ['招聘域', '员工域', '组织域'],
        rows: ['现状', '目标', '差距'],
        cells: [
          ['渠道与 ATS 各自为政', '入转调离靠人工台账', '组织数据两套口径'],
          ['统一人才库 + 智能匹配', '员工自助 + 电子签', '一套组织主数据'],
          ['匹配模型待训练', '流程需重排', '主数据待治理'],
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
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'PROCESS & ROADMAP', title: '招聘端到端流程与落地节奏', desc: '五段式推进，每段有出口、有验收' } },
      { id: 'flow.chevron', box: { x: 44, y: 146, w: 1192, h: 126 }, content: { items: [
        { title: '需求澄清' }, { title: '渠道触达' }, { title: '筛选评估' }, { title: '面试录用' }, { title: '入职融合' },
      ] } },
      { id: 'card.plain', box: { x: 44, y: 292, w: 282, h: 140 }, content: { title: 'Q1 底座与标准', desc: '人才库、标签体系、接口规范' } },
      { id: 'card.plain', box: { x: 346, y: 292, w: 282, h: 140 }, content: { title: 'Q2 三域上线', desc: '招聘、员工、组织三域 12 个场景' } },
      { id: 'card.plain', box: { x: 648, y: 292, w: 282, h: 140 }, content: { title: 'Q3 规模化', desc: '其余场景按模板复制，季度上线' } },
      { id: 'card.plain', box: { x: 950, y: 292, w: 286, h: 140 }, content: { title: 'Q4 运营', desc: '复用率与候选人体验进考核' } },
      { id: 'card.plain', box: { x: 44, y: 456, w: 580, h: 100 }, content: { title: '每段都有出口', desc: '诊断要基线报告、设计要能力清单、试点要端到端跑通' } },
      { id: 'card.plain', box: { x: 656, y: 456, w: 580, h: 100 }, content: { title: '验收由业务签字', desc: '平台只提能力，业务线认领场景并对结果负责' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '流程回答怎么做，时间轴回答什么时候见效' } },
    ],
  },
  'ecosystem': {
    name: '生态与支撑（中心 + 两侧 + 三卡 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'ECOSYSTEM', title: '人才服务生态协同', desc: '人才中台居中，供给侧与需求侧各自专业化' } },
      { id: 'eco.bracket', box: { x: 54, y: 144, w: 1172, h: 396 }, content: {
        center: '人才中台',
        left: ['高校就业办', '人力资源机构', '背调服务商', '测评供应商'],
        right: ['招聘渠道', 'ATS 系统', '薪酬数据', '灵活用工平台'],
      } },
      { id: 'card.plain', box: { x: 44, y: 548, w: 372, h: 68 }, content: { title: '连接', desc: '统一协议接入，伙伴一次对接全场景可用' } },
      { id: 'card.plain', box: { x: 454, y: 548, w: 372, h: 68 }, content: { title: '标准', desc: '数据格式与评价口径由中台定义' } },
      { id: 'card.plain', box: { x: 864, y: 548, w: 372, h: 68 }, content: { title: '分工', desc: '中台做连接，专业能力留给伙伴' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '平台做连接与标准，专业能力留给伙伴' } },
    ],
  },
  'hub-overview': {
    name: '中心辐射（中心 + 四注解 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'OVERVIEW', title: '人才服务能力全景', desc: '一个中心，六个方向的能力辐射' } },
      { id: 'hub.radial', box: { x: 56, y: 146, w: 700, h: 462 }, content: {
        center: '人才中台',
        items: [{ title: '人才画像' }, { title: '智能匹配' }, { title: 'AI 面试' }, { title: '测评题库' }, { title: '薪酬数据' }, { title: '组织诊断' }],
      } },
      { id: 'card.plain', box: { x: 800, y: 156, w: 436, h: 100 }, content: { title: '画像：从简历到标签', desc: '一份简历 120+ 字段，自动生成能力标签' } },
      { id: 'card.plain', box: { x: 800, y: 272, w: 436, h: 100 }, content: { title: '匹配：从关键词到语义', desc: 'JD 与简历语义对齐，召回率提升 3 倍' } },
      { id: 'card.plain', box: { x: 800, y: 388, w: 436, h: 100 }, content: { title: '面试：从经验到结构化', desc: '题库 + 评分卡，评价口径全公司一致' } },
      { id: 'card.plain', box: { x: 800, y: 504, w: 436, h: 100 }, content: { title: '诊断：从感觉到数据', desc: '组织健康度、流失预警进月度经营会' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '能力要先收成一个中心，辐射才不是各建各的' } },
    ],
  },
  'solution-dual': {
    name: '双边方案（双中心桥接 + 两张对照 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'SOLUTION', title: '线上线下双轮驱动', desc: '线上招聘与线下交付互相放大' } },
      { id: 'dual.hub', box: { x: 140, y: 150, w: 1000, h: 340 }, content: { left: '线上招聘', right: '线下交付', bridge: '数据回流' } },
      { id: 'card.plain', box: { x: 44, y: 510, w: 580, h: 96 }, content: { title: '线上：把漏斗做宽', desc: '渠道、投放、AI 初筛——规模与效率' } },
      { id: 'card.plain', box: { x: 656, y: 510, w: 580, h: 96 }, content: { title: '线下：把转化做实', desc: '面试官、交付顾问、入职关怀——质量与体验' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '两边各自最优不等于整体最优，桥接处才是价值' } },
    ],
  },
  'ring-ecosystem': {
    name: '环形体系（同心扇区 + 两侧说明 + 结论条）',
    w: 1280, h: 720, palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 44, y: 32, w: 640, h: 96 }, content: { kicker: 'TALENT ECOSYSTEM', title: '人才生态全景', desc: '一个中心、六个业务、八方相关方' } },
      { id: 'ring.system', box: { x: 402, y: 146, w: 470, h: 470 }, content: {
        center: '让人才\n更有价值',
        venn: ['客户价值', '员工价值', '社会价值'],
        segments: ['招聘服务', '灵活用工', '数智员工', '培训发展', '薪酬福利', '人事外包'],
        nodes: ['客户', '候选人', '员工', '合作伙伴', '政策', '高校', '投资者', '社会'],
        arcs: ['专业 今日人才', '高效 今日人才', '可信 今日人才', '共赢 今日人才'],
      } },
      { id: 'card.plain', box: { x: 44, y: 170, w: 320, h: 96 }, content: { title: '中心：一句话说清价值', desc: '为谁创造什么价值，只写一句' } },
      { id: 'card.plain', box: { x: 44, y: 288, w: 320, h: 96 }, content: { title: '中圈：4–8 个业务扇区', desc: '同一层级、互不包含，按顺时针排' } },
      { id: 'card.plain', box: { x: 44, y: 406, w: 320, h: 96 }, content: { title: '内圈：价值观的三圆交叠', desc: '三个价值维度，交集就是主张' } },
      { id: 'card.plain', box: { x: 916, y: 170, w: 320, h: 96 }, content: { title: '外圈：6–10 个相关方', desc: '虚线表示协同关系，不是隶属' } },
      { id: 'card.plain', box: { x: 916, y: 288, w: 320, h: 96 }, content: { title: '角标：2–4 个关键词', desc: '沿弧线排字，首尾带端点' } },
      { id: 'card.plain', box: { x: 916, y: 406, w: 320, h: 96 }, content: { title: '换内容即换行业', desc: '扇区与相关方一换，就是另一版' } },
      { id: 'conclusion.bar', box: { x: 44, y: 628, w: 1192, h: 44 }, content: { label: '结论', text: '人才服务不是一条线，是一张以「人才价值」为圆心的网' } },
    ],
  },
};
