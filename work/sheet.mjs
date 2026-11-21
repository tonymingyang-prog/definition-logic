// QA：按元素原生尺寸展示（缩放到最大 640×360），避免小图误判
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sceneToSvg } from '../lib/scene-svg.js';
import { ALL, PRESETS, figure, place } from '../lib/compose.js';
import { buildPalette, scene } from '../lib/core.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'sheet.html');
const palette = process.argv[2] || 'orange';
const only = process.argv[3] || '';
const pal = buildPalette(palette);

const MAXW = 1120, MAXH = 380;
const list = only ? ALL.filter((d) => d.id.startsWith(only)) : ALL;

const cells = list.map((def) => {
  const s0 = Math.min(1.25, MAXW / def.w, MAXH / def.h);
  const w = Math.round(def.w * s0), h = Math.round(def.h * s0);
  const s = scene(w, h, '#FFFFFF');
  place(s, def, { x: 0, y: 0, w, h }, pal, sampleContent(def), def.variants ? def.variants[0] : undefined);
  return { def, svg: sceneToSvg(s), w, h };
});

const presetCards = only ? [] : Object.entries(PRESETS).map(([key, p]) => {
  const s = figure({ w: p.w, h: p.h, palette: p.palette, blocks: p.blocks });
  return { key, name: p.name, svg: sceneToSvg(s) };
});

const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>元素表</title>
<style>
  :root{color-scheme:light}
  body{margin:0;background:#F1F2F4;font-family:"微软雅黑",sans-serif;color:#1F2328}
  .wrap{max-width:1600px;margin:0 auto;padding:28px 28px 60px}
  h1{font-size:24px;margin:0 0 4px} .sub{color:#7A828C;font-size:13px;margin:0 0 22px}
  .flex{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start}
  .cell{margin:0;background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.08);overflow:hidden}
  .cell .stage{padding:10px;box-sizing:border-box;display:grid;place-items:center;background:#FCFCFD}
  .cell .stage svg{display:block}
  .cell figcaption{padding:7px 12px 9px;display:flex;gap:10px;align-items:baseline;border-top:1px solid #F0F1F3}
  .cell figcaption b{font-size:12.5px} .cell figcaption span{font-size:10.5px;color:#98A0AA;font-family:Consolas,monospace}
  h2{font-size:19px;margin:36px 0 14px}
  .preset{margin:0 0 20px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);overflow:hidden}
  .preset .stage2{padding:12px} .preset svg{width:100%;height:auto;display:block}
  .preset figcaption{padding:9px 14px 12px;border-top:1px solid #F0F1F3;display:flex;gap:10px;align-items:baseline}
</style></head><body><div class="wrap">
<h1>元素库 · ${pal.name}色</h1><p class="sub">${list.length} 个元素 · 按原生尺寸呈现</p>
<div class="flex">
${cells.map((c) => `<figure class="cell"><div class="stage" style="width:${c.w + 20}px;height:${c.h + 20}px">${c.svg}</div><figcaption><b>${c.def.name}</b><span>${c.def.id}</span></figcaption></figure>`).join('\n')}
</div>
${presetCards.length ? `<h2>整页预设</h2>${presetCards.map((p) => `<figure class="preset"><div class="stage2">${p.svg}</div><figcaption><b>${p.name}</b><span>${p.key}</span></figcaption></figure>`).join('\n')}` : ''}
</div></body></html>`;

writeFileSync(OUT, html, 'utf8');
console.log(JSON.stringify({ ok: true, out: OUT, count: list.length }));

function sampleContent(def) {
  const c = {};
  const byId = {
    'matrix.grid': {
      cols: ['交易域', '履约域', '客户域'],
      rows: ['现状', '目标', '差距'],
      cells: [
        ['订单中心已上线', '分单规则硬编码', '客户视图分散'],
        ['统一订单模型', '规则引擎化', 'OneID 打通'],
        ['模型收敛 60%', '规则可配置', '主数据治理'],
      ],
    },
    'board.columns': {
      cols: [
        { title: '待评估', items: ['客服工单改版', '库存预警规则', '签批链路精简'] },
        { title: '进行中', items: ['订单中心迁移', '主数据治理'] },
        { title: '已上线', items: ['统一门户', '报表自助化'] },
      ],
    },
    'dual.hub': { left: '数字化', right: '自动化', bridge: '数实融合' },
    'eco.bracket': { center: '业务中台', left: ['数据标准', '主数据', '指标口径', '安全合规'], right: ['运维保障', '监控告警', '灰度发布', '容量规划'] },
    'flow.lanes': {
      lanes: [
        { title: '接入层', items: ['门户', 'API', '移动端'] },
        { title: '服务层', items: ['用户', '订单', '商品'] },
        { title: '数据层', items: ['ODS', 'DWD', 'ADS'] },
      ],
    },
    'layers.band': {
      layers: [
        { title: '应用层', items: ['营销', '供应', '财务'] },
        { title: '中台层', items: ['数据中台', '业务中台'] },
        { title: '底座层', items: ['云原生', '数据湖'] },
      ],
    },
    'platform.disc': {
      layers: [
        { title: 'saas', items: ['营销云', '供应云', '财务云'] },
        { title: 'paas', items: ['数据中台', '业务中台'] },
        { title: 'iaas', items: ['弹性计算', '对象存储'] },
      ],
    },
    'arc.fan': { items: [{ title: '电商' }, { title: '零售' }, { title: '物流' }, { title: '金融' }, { title: '制造' }, { title: '政务' }, { title: '教育' }] },
  };
  if (byId[def.id]) return byId[def.id];
  for (const sl of def.slots || []) {
    if (sl.id === 'items') {
      c.items = [{ title: '营销域', desc: '人群与活动' }, { title: '供应域', desc: '采购与库存' }, { title: '财务域', desc: '核算与结算' }, { title: '人力域', desc: '组织与绩效' }, { title: '协同域', desc: '流程与门户' }];
    } else if (sl.id === 'cols') {
      c.cols = ['交易域', '履约域', '客户域'];
    } else if (sl.id === 'rows') {
      c.rows = ['现状', '目标'];
    } else if (sl.id === 'cells') {
      c.cells = [['订单中心已上线', '分单规则硬编码', '客户视图分散'], ['统一订单模型', '规则引擎化', 'OneID 打通']];
    } else if (sl.id === 'left' || sl.id === 'right') {
      c[sl.id] = ['数据标准', '主数据', '指标口径', '安全合规'];
    } else {
      c[sl.id] = sl.example;
    }
  }
  return c;
}
