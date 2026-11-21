// 示例：四种常见说法各自产出的图（PPTX + SVG + 预览页）
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { figure } from '../lib/compose.js';
import { sceneToSvg } from '../lib/scene-svg.js';
import { sceneToPptx } from '../lib/scene-pptx.js';

const OUT = process.argv[2] || 'D:/DSH-work/plugins/dsh-guizang-elements/work/examples';
mkdirSync(OUT, { recursive: true });

const EXAMPLES = [
  {
    key: 'ex1-architecture',
    said: '做一张平台分层架构图，三层：应用层（营销、供应、财务、人力）、中台层（数据中台、业务中台、技术中台）、底座层（云原生、数据湖、安全），蓝色，放进 PPT',
    title: '平台总体架构',
    palette: 'blue',
    blocks: [
      { id: 'title.block', box: { x: 60, y: 44, w: 820, h: 96 }, content: { kicker: 'PLATFORM', title: '平台总体架构', desc: '一套底座支撑多业务线的复用与扩展' } },
      { id: 'platform.disc', box: { x: 150, y: 196, w: 980, h: 430 }, content: { layers: [
        { title: '应用层', items: ['营销云', '供应云', '财务云', '人力云'] },
        { title: '中台层', items: ['数据中台', '业务中台', '技术中台'] },
        { title: '底座层', items: ['云原生', '数据湖', '安全'] },
      ] } },
    ],
  },
  {
    key: 'ex2-lanes',
    said: '用元素库拼一页分层能力图，绿色：左边四条泳道（触点 / 交易 / 数据 / 支撑），右边一列“公域”清单，右下角放一张指标卡',
    title: '能力分层与运营阵地',
    palette: 'green',
    blocks: [
      { id: 'title.block', box: { x: 60, y: 44, w: 820, h: 96 }, content: { kicker: 'CAPABILITY', title: '能力分层与运营阵地', desc: '四条能力带 + 公域运营清单' } },
      { id: 'flow.lanes', box: { x: 60, y: 168, w: 880, h: 430 }, content: { lanes: [
        { title: '触点层', items: ['门店', '电商', '客服', '企微'] },
        { title: '交易层', items: ['订单', '支付', '履约'] },
        { title: '数据层', items: ['ODS', 'DWD', 'ADS'] },
        { title: '支撑层', items: ['云', '安全', '运维'] },
      ] } },
      { id: 'rail', box: { x: 976, y: 168, w: 176, h: 300 }, content: { title: '公域', rows: ['内容种草', '直播引流', '搜索承接', '私信转化'] } },
      { id: 'card.stat', box: { x: 976, y: 486, w: 240, h: 112 }, content: { value: '92%', label: '流程线上化率', delta: '+8pt' } },
    ],
  },
  {
    key: 'ex3-matrix',
    said: '出四象限…不对，出个能力矩阵：行是现状 / 目标 / 差距，列是交易域 / 履约域 / 客户域，橙色，给我可编辑的 PPTX',
    title: '能力评估矩阵',
    palette: 'orange',
    blocks: [
      { id: 'title.block', box: { x: 60, y: 44, w: 820, h: 96 }, content: { kicker: 'MATRIX', title: '能力评估矩阵', desc: '按业务域拆解现状、目标与差距' } },
      { id: 'matrix.grid', box: { x: 60, y: 168, w: 1080, h: 440 }, content: {
        cols: ['交易域', '履约域', '客户域'],
        rows: ['现状', '目标', '差距'],
        cells: [
          ['订单中心已上线', '分单规则硬编码', '客户视图分散'],
          ['统一订单模型', '规则引擎化', 'OneID 打通'],
          ['模型收敛 60%', '规则可配置', '主数据治理'],
        ],
      } },
      { id: 'callout', box: { x: 920, y: 52, w: 300, h: 100 }, content: { title: '关键结论', desc: '差距集中在客户域，优先做主数据与 OneID' } },
    ],
  },
  {
    key: 'ex4-eco',
    said: '用元素库做一张生态协同关系图，紫色：中间“业务中台”，左右各四项支撑，底部放两个指标卡',
    title: '生态协同关系',
    palette: 'purple',
    blocks: [
      { id: 'title.block', box: { x: 60, y: 44, w: 820, h: 96 }, content: { kicker: 'ECOSYSTEM', title: '生态协同关系', desc: '主体能力与上下游支撑网络' } },
      { id: 'eco.bracket', box: { x: 80, y: 150, w: 1120, h: 392 }, content: {
        center: '业务中台',
        left: ['数据标准', '主数据', '指标口径', '安全合规'],
        right: ['运维保障', '监控告警', '灰度发布', '容量规划'],
      } },
      { id: 'card.stat', box: { x: 80, y: 566, w: 236, h: 100 }, content: { value: '1200+', label: '指标口径', delta: '+18%' } },
      { id: 'card.stat', box: { x: 340, y: 566, w: 236, h: 100 }, content: { value: '98%', label: '任务成功率', delta: '+3pt' } },
    ],
  },
];

const cards = [];
for (const ex of EXAMPLES) {
  const sc = figure({ w: 1280, h: 720, palette: ex.palette, blocks: ex.blocks });
  const svgPath = join(OUT, `${ex.key}.svg`);
  const pptxPath = join(OUT, `${ex.key}.pptx`);
  writeFileSync(svgPath, sceneToSvg(sc), 'utf8');
  sceneToPptx(sc, pptxPath);
  cards.push({ ...ex, svg: sceneToSvg(sc), svgPath, pptxPath });
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>元素库 · 示例</title>
<style>
  :root{color-scheme:light}
  body{margin:0;background:#F4F4F2;font-family:"微软雅黑",system-ui,sans-serif;color:#1B1D21}
  .wrap{max-width:1360px;margin:0 auto;padding:36px 28px 70px}
  h1{font-size:24px;margin:0 0 6px}
  .sub{color:#7C838C;font-size:12.5px;margin:0 0 26px}
  .ex{background:#fff;border:1px solid #E6E7EA;border-radius:12px;overflow:hidden;margin-bottom:22px;box-shadow:0 2px 10px rgba(0,0,0,.04)}
  .said{padding:12px 16px;background:#FBFBFA;border-bottom:1px solid #EFF0F2;font-size:12.5px;color:#4A5058}
  .said b{color:#1B1D21}
  .shot svg{width:100%;height:auto;display:block}
  .meta{padding:10px 16px 12px;display:flex;gap:14px;align-items:baseline;font-size:11.5px;color:#8B929B;font-family:Consolas,monospace}
</style></head><body><div class="wrap">
<h1>元素库 · 四种说法，四种成品</h1>
<p class="sub">每组都是一句话生成的：可编辑 PPTX + 矢量 SVG。内容为示例数据。</p>
${cards.map((c) => `<div class="ex"><div class="said"><b>你说：</b>${esc(c.said)}</div><div class="shot">${c.svg}</div><div class="meta"><span>${esc(c.key)}.pptx</span><span>${esc(c.key)}.svg</span><span>配色 ${esc(c.palette)}</span></div></div>`).join('\n')}
</div></body></html>`;
writeFileSync(join(OUT, 'examples.html'), html, 'utf8');
console.log(JSON.stringify({ ok: true, out: OUT, count: cards.length }));
