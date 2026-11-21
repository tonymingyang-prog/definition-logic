// 注册给模型的工具：查元素、出单图、出整页、导出 PPTX/SVG/HTML
import { mkdirSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { ALL, PRESETS, CATEGORIES, figure, place, getDef, paletteOf, scaleScene } from './compose.js';
import { scene } from './core.js';
import { sceneToSvg, sceneToHtmlPage } from './scene-svg.js';
import { sceneToPptx, scenesToPptx } from './scene-pptx.js';
import { buildDeck, lintDeck } from './deck.js';
import { PALETTES } from './core.js';
import { sampleContent } from './samples.js';

const text = (v) => [{ type: 'text', text: v }];
const str = (description, extra = {}) => ({ type: 'string', description, ...extra });

function check(args, schema) {
  const errs = [];
  for (const k of schema.required || []) if (args?.[k] === undefined || args[k] === '') errs.push(`缺少 ${k}`);
  for (const [k, v] of Object.entries(args || {})) {
    const p = schema.properties[k];
    if (!p) errs.push(`未知参数 ${k}`);
    else if (p.type === 'string' && typeof v !== 'string') errs.push(`${k} 应该是字符串`);
    else if (p.type === 'string' && p.enum && !p.enum.includes(v)) errs.push(`${k} 只能是 ${p.enum.join(' / ')}`);
  }
  if (errs.length) throw new Error(errs.join('；'));
}

function outDirOf(p) {
  const dir = p && isAbsolute(p) ? p : resolve(process.cwd(), p || 'gze-out');
  mkdirSync(dir, { recursive: true });
  return dir;
}

const PALETTE_IDS = Object.keys(PALETTES);
const isHexColor = (v) => typeof v === 'string' && /^#?[0-9a-fA-F]{6}$/.test(v);
function checkPalette(v) {
  if (!v) return;
  if (!PALETTE_IDS.includes(v) && !isHexColor(v)) throw new Error(palette 只能是  或 #RRGGBB);
}

// ---------- 目录 ----------
export const catalogTool = {
  name: 'gze_catalog',
  description: '列出「图形元素库」里的元素与整页预设（咨询级静态逻辑图拆出来的可复用图形）。做 PPT/网页前先用它挑元素：返回 id、名称、分类、可填槽位。',
  parameters: {
    type: 'object',
    additionalProperties: false,
    properties: {
      category: str('只看某一类', { enum: CATEGORIES.map((c) => c.id) }),
      query: str('按关键字过滤（中文名、标签、id 片段）'),
    },
  },
  timeoutMs: 20_000,
  output: {
    schema: {
      type: 'object', additionalProperties: false,
      required: ['count', 'elements', 'presets', 'palettes'],
      properties: {
        count: { type: 'integer' },
        elements: { type: 'array', items: { type: 'object', additionalProperties: true } },
        presets: { type: 'array', items: { type: 'object', additionalProperties: true } },
        palettes: { type: 'array', items: { type: 'string' } },
      },
    },
    render: (_a, v) => text([
      `共 ${v.count} 个元素：`,
      ...v.elements.map((e) => `${e.id} · ${e.name}（${e.slots.join(' / ') || '无槽位'}）`),
      '',
      `整页预设：${v.presets.map((p) => p.key).join('、')}`,
      `配色：${v.palettes.join('、')}`,
    ].join('\n')),
  },
  async execute(args) {
    check(args, catalogTool.parameters);
    let list = ALL;
    if (args.category) list = list.filter((d) => d.cat === args.category);
    if (args.query) {
      const q = args.query.toLowerCase();
      list = list.filter((d) => [d.id, d.name, ...(d.tags || [])].join(' ').toLowerCase().includes(q));
    }
    return {
      count: list.length,
      elements: list.map((d) => ({ id: d.id, name: d.name, cat: d.cat, tags: d.tags || [], slots: (d.slots || []).map((s) => s.id), variants: d.variants || [] })),
      presets: Object.entries(PRESETS).map(([key, p]) => ({ key, name: p.name, palette: p.palette })),
      palettes: PALETTE_IDS,
    };
  },
};

// ---------- 单元素 / 整页 → 文件 ----------
const FORMATS = ['svg', 'html', 'pptx'];

export const renderTool = {
  name: 'gze_render',
  description: '把图形元素库里的一个元素或一套整页预设渲染成文件：SVG（嵌网页/插 PPT）、HTML（直接演示）、PPTX（原生可编辑形状）。返回文件绝对路径。',
  parameters: {
    type: 'object', additionalProperties: false,
    properties: {
      id: str('元素 id，例如 card.plain、platform.disc、timeline'),
      preset: str('整页预设 key，例如 platform-overview、capability-matrix（与 id 二选一）', { enum: Object.keys(PRESETS) }),
      palette: str('配色：orange/red/blue/green/teal/purple，或任意 #RRGGBB 自定义色'),
      variant: str('元素变体，如 filled / outline / left / right（不同元素支持的不一样）'),
      content: str('槽位内容，JSON 字符串。单元素用 {label|title|desc|value...}；整页预设用 blocks 覆盖'),
      formats: str('导出格式，逗号分隔，默认 svg', {}),
      outDir: str('输出目录（绝对路径），默认工作目录下 gze-out'),
      name: str('文件名前缀，默认用 id/preset'),
    },
  },
  timeoutMs: 120_000,
  output: {
    schema: {
      type: 'object', additionalProperties: false,
      required: ['ok', 'files', 'title'],
      properties: { ok: { type: 'boolean' }, title: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } },
    },
    render: (_a, v) => text(`已生成「${v.title}」：\n${v.files.map((f) => `- ${f}`).join('\n')}\nPPTX 里是原生形状，可直接在 PowerPoint / WPS 改字改色。`),
  },
  async execute(args) {
    check(args, renderTool.parameters);
    if (!args.id && !args.preset) throw new Error('id 与 preset 至少给一个');
    checkPalette(args.palette);
    const palette = args.palette || (args.preset ? PRESETS[args.preset]?.palette : 'orange') || 'orange';
    const fmts = (args.formats || 'svg').split(',').map((s) => s.trim()).filter(Boolean);
    for (const f of fmts) if (!FORMATS.includes(f)) throw new Error(`不支持的格式 ${f}（可选 ${FORMATS.join('/')}）`);
    const dir = outDirOf(args.outDir);
    const name = args.name || args.preset || args.id.replace(/\./g, '-');
    let content = {};
    if (args.content) {
      try { content = JSON.parse(args.content); } catch (e) { throw new Error(`content 不是合法 JSON：${e.message}`); }
    }

    let sc;
    let pageSc;
    let title;
    if (args.preset) {
      const p = PRESETS[args.preset];
      const blocks = content.blocks || p.blocks;
      sc = figure({ w: p.w, h: p.h, palette, blocks });
      pageSc = sc;
      title = p.name;
    } else {
      const def = getDef(args.id);
      const pal = paletteOf(palette);
      sc = scene(def.w, def.h, '#FFFFFF');
      const filled = { ...sampleContent(def), ...content };
      place(sc, def, { x: 0, y: 0, w: def.w, h: def.h }, pal, filled, args.variant);
      pageSc = scaleScene(sc, { w: 1280, h: 720, padding: 56 });
      title = def.name;
    }

    const files = [];
    if (fmts.includes('svg')) {
      const f = join(dir, `${name}.svg`);
      writeFileSync(f, sceneToSvg(sc), 'utf8');
      files.push(f);
    }
    if (fmts.includes('html')) {
      const f = join(dir, `${name}.html`);
      writeFileSync(f, sceneToHtmlPage(sc, { title }), 'utf8');
      files.push(f);
    }
    if (fmts.includes('pptx')) {
      const f = join(dir, `${name}.pptx`);
      sceneToPptx(pageSc, f);
      files.push(f);
    }
    return { ok: true, title, files };
  },
};

// ---------- 任意组合 ----------
export const figureTool = {
  name: 'gze_figure',
  description: '用图形元素库自由拼一整页（blocks 数组：每块指定 id、box{x,y,w,h}、content），输出 SVG/HTML/PPTX。适合先搭骨架再微调，比逐个画形状快。',
  parameters: {
    type: 'object', additionalProperties: false,
    required: ['blocks'],
    properties: {
      blocks: str('JSON 数组字符串，例如 [{"id":"title.block","box":{"x":60,"y":40,"w":700,"h":96},"content":{"title":"总体架构"}},{"id":"platform.disc","box":{"x":180,"y":150,"w":900,"h":540},"content":{"layers":[...]}}]'),
      palette: str('配色：orange/red/blue/green/teal/purple，或任意 #RRGGBB 自定义色'),
      w: str('画布宽（px），默认 1280'),
      h: str('画布高（px），默认 720'),
      formats: str('导出格式，默认 svg'),
      outDir: str('输出目录（绝对路径）'),
      name: str('文件名前缀'),
    },
  },
  timeoutMs: 120_000,
  output: {
    schema: {
      type: 'object', additionalProperties: false, required: ['ok', 'files'], properties: {
        ok: { type: 'boolean' }, files: { type: 'array', items: { type: 'string' } }, blocks: { type: 'integer' },
      },
    },
    render: (_a, v) => text(`已组合 ${v.blocks} 块图形：\n${v.files.map((f) => `- ${f}`).join('\n')}`),
  },
  async execute(args) {
    check(args, figureTool.parameters);
    checkPalette(args.palette);
    let blocks;
    try { blocks = JSON.parse(args.blocks); } catch (e) { throw new Error(`blocks 不是合法 JSON：${e.message}`); }
    if (!Array.isArray(blocks) || !blocks.length) throw new Error('blocks 要是非空数组');
    for (const b of blocks) if (!b.id) throw new Error('每个 block 都要有 id');
    const w = Number(args.w || 1280), h = Number(args.h || 720);
    const fmts = (args.formats || 'svg').split(',').map((s) => s.trim()).filter(Boolean);
    const dir = outDirOf(args.outDir);
    const name = args.name || 'figure';
    const sc = figure({ w, h, palette: args.palette || 'orange', blocks });
    const files = [];
    if (fmts.includes('svg')) { const f = join(dir, `${name}.svg`); writeFileSync(f, sceneToSvg(sc), 'utf8'); files.push(f); }
    if (fmts.includes('html')) { const f = join(dir, `${name}.html`); writeFileSync(f, sceneToHtmlPage(sc, { title: name }), 'utf8'); files.push(f); }
    if (fmts.includes('pptx')) { const f = join(dir, `${name}.pptx`); sceneToPptx(sc, f); files.push(f); }
    return { ok: true, files, blocks: blocks.length };
  },
};

// ---------- 整份 PPT：图纸式排版 ----------
export const deckTool = {
  name: 'gze_deck',
  description: '用图形元素库原子按“图纸类型”生成整份 PPT（一页一个图纸骨架：封面/目录/章节/分层/矩阵/泳道/时间轴/流程/对比/清单/收尾），输出多页原生可编辑 PPTX。适合技术架构、方案汇报这类高度结构化、页数较多的演示。',
  parameters: {
    type: 'object', additionalProperties: false,
    required: ['spec'],
    properties: {
      spec: str('整份蓝图 JSON 字符串：{"title":"…","palette":"blue","pages":[{"type":"cover",…},{"type":"matrix",…}]}。page.type 可选 cover / agenda / section / lanes / kpi / disc / matrix / bands / hub / eco / timeline / chevron / compare / stack / closing'),
      outDir: str('输出目录（绝对路径）'),
      name: str('文件名前缀'),
      formats: str('导出格式，逗号分隔：pptx,svgs（每页一个 SVG）'),
    },
  },
  timeoutMs: 180_000,
  output: {
    schema: {
      type: 'object', additionalProperties: false, required: ['ok', 'files', 'pages'],
      properties: { ok: { type: 'boolean' }, files: { type: 'array', items: { type: 'string' } }, pages: { type: 'integer' }, issues: { type: 'integer' } },
    },
    render: (_a, v) => text(`已生成 ${v.pages} 页：\n${v.files.map((f) => `- ${f}`).join('\n')}\n自检问题：${v.issues} 个${v.issues ? '（建议先修再交付）' : ''}`),
  },
  async execute(args) {
    check(args, deckTool.parameters);
    let spec;
    try { spec = JSON.parse(args.spec); } catch (e) { throw new Error(`spec 不是合法 JSON：${e.message}`); }
    if (!Array.isArray(spec.pages) || !spec.pages.length) throw new Error('spec.pages 不能为空');
    const dir = outDirOf(args.outDir);
    const name = args.name || 'deck';
    const scenes2 = buildDeck(spec);
    const lint = lintDeck(scenes2);
    const files = [];
    const fmts = (args.formats || 'pptx').split(',').map((s) => s.trim()).filter(Boolean);
    if (fmts.includes('pptx')) {
      const f = join(dir, `${name}.pptx`);
      scenesToPptx(scenes2, f);
      files.push(f);
    }
    if (fmts.includes('svgs')) {
      scenes2.forEach((s, i) => {
        const f = join(dir, `${name}-p${String(i + 1).padStart(2, '0')}.svg`);
        writeFileSync(f, sceneToSvg(s), 'utf8');
        files.push(f);
      });
    }
    return { ok: true, files, pages: scenes2.length, issues: lint.total };
  },
};

export const TOOLS = [catalogTool, renderTool, figureTool, deckTool];
