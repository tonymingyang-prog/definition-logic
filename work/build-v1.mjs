// 定义逻辑图 1.0 雏形：元素总表 + 复核结论 + 20 个案例成品
import { writeFileSync, mkdirSync } from 'node:fs';
import { buildDeck, lintDeck } from '../lib/deck.js';
import { ALL } from '../lib/compose.js';

const OUT = 'D:/DSH-work/guizang-elements/1.0';
mkdirSync(OUT, { recursive: true });

const CAT_NAME = {
  surface: '面 / 卡片类',
  frame: '框架 / 容器类',
  text: '文字 / 标题类',
  flow: '流程 / 时序类',
  structure: '结构 / 全景类',
  decor: '装饰 / 氛围类',
};
const ORDER = ['structure', 'flow', 'surface', 'frame', 'text', 'decor'];
const groups = ORDER.map((cat) => ({
  name: CAT_NAME[cat] || cat,
  items: ALL.filter((e) => e.cat === cat).map((e) => e.name),
}));

// ---------- 20 个案例 ----------
const CASES = [
  { atom: 'ring.system', title: '商业模式全景', content: {
    center: '创造\n客户价值', venn: ['价值主张', '收入结构', '成本结构'],
    segments: ['研发', '制造', '渠道', '服务', '品牌', '资金'],
    nodes: ['客户', '供应商', '渠道', '员工', '资本', '监管', '社区', '伙伴'],
    arcs: ['价值 商业模式', '效率 商业模式', '增长 商业模式', '壁垒 商业模式'],
  } },
  { atom: 'platform.disc', title: '技术中台四层架构', content: { layers: [
    { title: '应用层', items: ['营销', '交易', '履约', '结算'] },
    { title: '能力层', items: ['用户', '商品', '订单', '支付'] },
    { title: '数据层', items: ['数仓', '标签', '模型'] },
    { title: '底座层', items: ['云原生', '安全合规'] },
  ] } },
  { atom: 'hub.radial', title: '平台能力辐射', content: {
    center: '业务中台', items: [{ title: '报表看板' }, { title: '标签画像' }, { title: '指标服务' }, { title: '自助分析' }, { title: '数据资产' }, { title: '实时计算' }],
  } },
  { atom: 'matrix.grid', title: '商业模式九宫格', content: {
    cols: ['客户细分', '价值主张', '渠道通路'],
    rows: ['现状', '目标', '差距'],
    cells: [['中小制造企业', '降本 20%', '直营 + 代理'], ['行业头部客户', '一体化平台', '线上为主'], ['品牌认知弱', '标准化交付', '渠道待建']],
  } },
  { atom: 'pyramid.levels', title: '战略到执行', content: { items: [
    { title: '战略目标' }, { title: '业务能力' }, { title: '平台支撑' }, { title: '数据底座' },
  ] } },
  { atom: 'dual.hub', title: '线上线下一体化', content: { left: '线上交易', right: '线下履约', bridge: '数据回流' } },
  { atom: 'flow.chevron', title: '客户旅程五段', content: { items: [
    { title: '认知', desc: '内容触达' }, { title: '评估', desc: '方案比对' }, { title: '决策', desc: '商务谈判' }, { title: '交付', desc: '实施上线' }, { title: '复购', desc: '持续经营' },
  ] } },
  { atom: 'flow.steps', title: '研发交付流程', content: { items: [
    { title: '需求', desc: '澄清与排序' }, { title: '设计', desc: '方案评审' }, { title: '开发', desc: '迭代交付' }, { title: '测试', desc: '灰度验证' },
  ] } },
  { atom: 'flow.lanes', title: '跨部门协同', content: { lanes: [
    { title: '业务', items: ['提需求', '认场景', '验收'] },
    { title: '产品', items: ['出方案', '定优先级'] },
    { title: '研发', items: ['排期', '开发', '联调'] },
    { title: '运维', items: ['发布', '监控'] },
  ] } },
  { atom: 'timeline', title: '三年实施路线', content: { items: [
    { date: '2026', title: '打底座', desc: '主数据与接口规范' },
    { date: '2027', title: '做能力', desc: '三大核心域上线' },
    { date: '2028', title: '规模化', desc: '复制到全部业务线' },
  ] } },
  { atom: 'funnel.stage', title: '增长漏斗', content: { items: [
    { title: '线索', value: '12000' }, { title: '商机', value: '3200' }, { title: '成交', value: '860' }, { title: '复购', value: '310' },
  ] } },
  { atom: 'eco.bracket', title: '生态支撑', content: {
    center: '业务中台', left: ['数据标准', '主数据', '指标口径', '安全合规'], right: ['运维保障', '监控告警', '灰度发布', '容量规划'],
  } },
  { atom: 'arc.layers', title: '能力分层弧', content: { layers: [
    { title: '体验层', items: ['门户', '移动端'] },
    { title: '能力层', items: ['订单', '库存', '结算'] },
    { title: '数据层', items: ['数仓', '指标'] },
  ] } },
  { atom: 'honeycomb.cluster', title: '能力簇蜂窝', content: { items: ['交易', '履约', '结算', '客户', '商品', '数据'] } },
  { atom: 'cloud.text', title: '行业关键词', content: { words: ['平台', '数据', '中台', '智能', '协同', '生态', '增长', '效率', '标准', '复用'] } },
  { atom: 'iso.platform', title: '立体平台', content: { layers: [
    { title: '应用层' }, { title: '能力层' }, { title: '数据层' }, { title: '底座层' },
  ] } },
  { atom: 'sector.band', title: '市场结构', content: { segments: ['头部', '腰部', '长尾', '新兴'] } },
  { atom: 'fan.hub', title: '双扇互动', content: { center: '业务中台', nodes: [{ title: '需求' }, { title: '方案' }, { title: '交付' }], left: [{ title: '客户' }, { title: '渠道' }, { title: '产品' }], right: [{ title: '交付' }, { title: '运营' }, { title: '服务' }], topChips: ['统一入口 · 一次接入', '标准能力 · 全公司复用'], bottom: '连接 · 标准 · 复用 · 可度量' } },
  { atom: 'stack.list', title: '能力清单', content: { items: [
    { title: '统一入口' }, { title: '规则引擎' }, { title: '数据服务' }, { title: '监控告警' },
  ] } },
  { atom: 'board.columns', title: '项目看板', content: { columns: [
    { title: '待启动', items: ['客户主数据'] },
    { title: '进行中', items: ['订单中心'] },
    { title: '待验收', items: ['结算平台'] },
    { title: '已上线', items: ['报表门户'] },
  ] } },
];

const pages = [
  {
    type: 'cover',
    kicker: 'DEFINITION LOGIC · V1.0',
    title: '定义逻辑图\n1.0 雏形',
    subtitle: '元素总表 · 复核结论 · 20 个案例成品',
    org: '定义逻辑图',
    date: '2026-11-23',
    metrics: [
      { label: '图形原子', value: '44' },
      { label: '线性图标', value: '20' },
      { label: '案例成品', value: '20' },
    ],
    tag: '虚拟案例 · 云栖智造',
  },
  {
    type: 'index.elements',
    kicker: 'ELEMENT INDEX',
    title: '元素总表：44 个图形原子，六类',
    desc: '结构 / 流程 / 面 / 框架 / 文字 / 装饰 —— 案例页全部由这些原子组合而成',
    groups,
  },
  {
    type: 'kpi',
    kicker: 'AUDIT',
    title: '复核：确实是 80 页，但只有 14 种骨架',
    desc: '源文件 C.pptx 共 80 张；按逻辑骨架归并后 14 类，原子组合 66 种',
    cards: [
      { label: '源文件页数', value: '80', unit: '页' },
      { label: '逻辑骨架', value: '14', unit: '类' },
      { label: '原子组合', value: '66', unit: '种' },
      { label: '用到原子', value: '32', unit: '个' },
    ],
    bars: [
      { label: '分层平台 20 页', value: 20, max: 20 },
      { label: '中心辐射 16 页', value: 16, max: 20 },
      { label: '同心环 11 页', value: 11, max: 20 },
      { label: '左右对称 11 页', value: 11, max: 20 },
    ],
    notes: [
      { title: '为什么感觉"不止一种图"', desc: '同一骨架换内容、换装饰，视觉差异被放大' },
      { title: '为什么又"不是 80 种"', desc: '20 页分层平台共用同一套几何，只是层数与条目不同' },
    ],
    conclusion: '80 页 = 14 种骨架 × 内容 × 装饰；原子化的价值就在这里',
  },
];

CASES.forEach((c, i) => {
  pages.push({
    type: 'pano',
    atom: c.atom,
    content: c.content,
    chrome: 'title',
    title: `案例 ${String(i + 1).padStart(2, '0')} · ${c.title}`,
  });
});

pages.push({
  type: 'closing',
  title: '1.0 的边界与下一步',
  points: [
    '44 个原子、20 个图标、15 种图纸页型、8 套整页预设，全部原生可编辑',
    '80 页模板复核完毕：14 种骨架覆盖，20 个案例验证组合能力',
    '下一步：补齐第二批原子密度，再做 CI 与开源发布',
  ],
});

const scenes = buildDeck({ title: '定义逻辑图 1.0 雏形', palette: 'blue', pages });
const lint = lintDeck(scenes);
writeFileSync(OUT + '/deck.json', JSON.stringify({ w: 1280, h: 720, slides: scenes.map((s) => ({ w: s.w, h: s.h, bg: s.bg, items: s.items })) }), 'utf8');
console.log(JSON.stringify({ pages: scenes.length, lint_total: lint.total, byCode: lint.byCode }, null, 2));
if (lint.issues.length) for (const i of lint.issues.slice(0, 10)) console.log(` P${i.page} ${i.code} ${i.detail}`);
