// 「最好的效果」展示册：每页一张满版逻辑图（参考模板 P03 的做法：只有图，没有页眉页脚）
import { writeFileSync, mkdirSync } from 'node:fs';
import { buildDeck, lintDeck } from '../lib/deck.js';

const OUT = 'D:/DSH-work/guizang-elements/展示册';
mkdirSync(OUT, { recursive: true });

const pages = [
  {
    type: 'cover',
    kicker: 'DEFINITION LOGIC · SHOWCASE',
    title: '一张图\n说清一件事',
    subtitle: '满版逻辑图 · 每页一张图，没有多余装饰',
    org: '定义逻辑图 · 图形元素库',
    date: '2026-11-23',
    metrics: [
      { label: '图形原子', value: '44' },
      { label: '线性图标', value: '20' },
      { label: '满版页型', value: '9' },
    ],
    tag: '虚拟案例 · 云栖智造',
  },
  {
    type: 'pano', atom: 'ring.system', title: '同心环 · 生态全景',
    content: {
      center: '创造\n客户价值',
      venn: ['业务价值', '数据价值', '组织价值'],
      segments: ['营销', '供应链', '制造', '服务', '财务', '人力'],
      nodes: ['客户', '员工', '合作伙伴', '监管', '社区', '股东', '供应商', '渠道'],
      arcs: ['专业 云栖智造', '高效 云栖智造', '可信 云栖智造', '共赢 云栖智造', '创新 云栖智造'],
    },
  },
  {
    type: 'pano', atom: 'platform.disc', title: '平台叠层 · 四层架构',
    content: {
      layers: [
        { title: '应用层', items: ['营销', '交易', '履约', '结算'] },
        { title: '能力层', items: ['用户', '商品', '订单', '支付'] },
        { title: '数据层', items: ['数仓', '标签', '模型'] },
        { title: '底座层', items: ['云原生', '安全合规'] },
      ],
    },
  },
  {
    type: 'pano', atom: 'hub.radial', title: '中心辐射 · 能力全景',
    content: {
      center: '数据中台',
      items: [{ title: '报表看板' }, { title: '标签画像' }, { title: '指标服务' }, { title: '自助分析' }, { title: '数据资产' }, { title: '实时计算' }],
    },
  },
  {
    type: 'pano', atom: 'pyramid.levels', title: '金字塔 · 战略到执行',
    content: {
      items: [
        { title: '战略目标', desc: '三年做成本行业数字化标杆' },
        { title: '业务能力', desc: '八域能力标准化' },
        { title: '平台支撑', desc: '一套底座服务全集团' },
        { title: '数据底座', desc: '主数据与指标口径统一' },
      ],
    },
  },
  {
    type: 'pano', atom: 'matrix.grid', title: '矩阵 · 先动谁',
    content: {
      cols: ['交易域', '履约域', '客户域'],
      rows: ['现状', '目标', '差距'],
      cells: [
        ['订单中心已上线', '分单规则硬编码', '客户视图分散'],
        ['统一订单模型', '规则引擎化', 'OneID 打通'],
        ['模型收敛 60%', '规则可配置', '主数据待治理'],
      ],
    },
  },
  {
    type: 'pano', atom: 'timeline', title: '时间轴 · 四个季度',
    content: {
      items: [
        { date: 'Q1', title: '打底座' },
        { date: 'Q2', title: '跑单点' },
        { date: 'Q3', title: '扩场景' },
        { date: 'Q4', title: '规模化' },
      ],
    },
  },
  {
    type: 'pano', atom: 'funnel.stage', title: '漏斗 · 从线索到复购',
    content: {
      items: [
        { title: '线索', value: '12000' },
        { title: '商机', value: '3200' },
        { title: '成交', value: '860' },
        { title: '复购', value: '310' },
      ],
    },
  },
  {
    type: 'pano', atom: 'eco.bracket', title: '生态支撑 · 主体与两侧',
    content: {
      center: '业务中台',
      left: ['数据标准', '主数据', '指标口径', '安全合规'],
      right: ['运维保障', '监控告警', '灰度发布', '容量规划'],
    },
  },
  {
    type: 'pano', atom: 'arc.layers', title: '多层弧 · 能力分层',
    content: {
      layers: [
        { title: '体验层', items: ['门户', '移动端'] },
        { title: '能力层', items: ['订单', '库存', '结算'] },
        { title: '数据层', items: ['数仓', '指标'] },
      ],
    },
  },
  {
    type: 'closing',
    title: '图形是壳，逻辑是里',
    points: [
      '每页只有一张图，去掉了所有页眉、页脚、结论条',
      '所有图形都是原生形状，可在 PowerPoint 里逐块编辑',
      '换一套内容，就是另一家企业的全景图',
    ],
  },
];

const scenes = buildDeck({ title: '定义逻辑图 · 展示册', palette: 'blue', pages });
const lint = lintDeck(scenes);
writeFileSync(OUT + '/deck.json', JSON.stringify({ w: 1280, h: 720, slides: scenes.map((s) => ({ w: s.w, h: s.h, bg: s.bg, items: s.items })) }), 'utf8');
console.log(JSON.stringify({ pages: scenes.length, lint_total: lint.total, byCode: lint.byCode }, null, 2));
if (lint.issues.length) for (const i of lint.issues.slice(0, 10)) console.log(` P${i.page} ${i.code} ${i.detail}`);
