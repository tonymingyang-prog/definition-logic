// 定义逻辑图 · Host 半边
// 1. 注册三个工具（lib/tools.js）：查元素、出单图/整页、自由组合
// 2. 注册 skill（skills/guizang-elements）
// 3. /guizang-elements/ 展示页 + /api/* 预览与导出接口
import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { ALL, PRESETS, CATEGORIES, figure, place, getDef, paletteOf, scaleScene } from './compose.js';
import { PALETTES, scene } from './core.js';
import { sceneToSvg, sceneToHtmlPage } from './scene-svg.js';
import { sceneToPptx } from './scene-pptx.js';
import { TOOLS } from './tools.js';
import { sampleContent } from './samples.js';
import { createSkillProvider } from './skills.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BASE = '/guizang-elements';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
};

export const name = 'guizang-elements';
export const inject = ['webServer', 'skills', 'tools'];

// 刚生成的文件：token → 绝对路径（只允许下载这些）
const exports = new Map();

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
}
function notFound(res) {
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('not found');
}
function readJson(req, max = 256 * 1024) {
  return new Promise((resolve, reject) => {
    if (req.method !== 'POST') return reject(Object.assign(new Error('method'), { status: 405 }));
    let size = 0;
    const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > max) req.destroy(); else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (e) { reject(Object.assign(e, { status: 400 })); } });
    req.on('error', reject);
  });
}

function renderElementSvg(id, palette, variant) {
  const def = getDef(id);
  const pal = paletteOf(palette);
  const sc = scene(def.w, def.h, '#FFFFFF');
  place(sc, def, { x: 0, y: 0, w: def.w, h: def.h }, pal, sampleContent(def), variant || (def.variants ? def.variants[0] : undefined));
  return { svg: sceneToSvg(sc), w: def.w, h: def.h };
}

function presetScene(key, palette) {
  const p = PRESETS[key];
  if (!p) throw new Error('未知预设');
  return { scene: figure({ w: p.w, h: p.h, palette: palette || p.palette, blocks: p.blocks }), meta: p };
}

function outDir() {
  const dir = join(homedir(), 'DSH-work', 'guizang-elements-out');
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function apply(ctx) {
  ctx.effect(() => ctx.skills.registerProvider(() => createSkillProvider(join(ROOT, 'skills'))));
  for (const tool of TOOLS) ctx.tools.register(tool);

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'prefix',
      path: BASE,
      async handler(req, res) {
        const url = new URL(req.url || '/', 'http://x');
        const rest = decodeURIComponent(url.pathname.slice(BASE.length)) || '/';
        const q = url.searchParams;

        if (rest === '/api/catalog') {
          return sendJson(res, 200, {
            elements: ALL.map((d) => ({ id: d.id, name: d.name, cat: d.cat, tags: d.tags || [], slots: (d.slots || []).map((s) => ({ id: s.id, label: s.label })), variants: d.variants || [], w: d.w, h: d.h })),
            presets: Object.entries(PRESETS).map(([key, p]) => ({ key, name: p.name, palette: p.palette })),
            categories: CATEGORIES,
            palettes: Object.entries(PALETTES).map(([id, p]) => ({ id, name: p.name, primary: p.primary })),
          });
        }
        if (rest === '/api/preview') {
          try {
            const { svg } = renderElementSvg(q.get('id') || 'card.plain', q.get('palette') || 'orange', q.get('variant') || undefined);
            res.writeHead(200, { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'no-cache' });
            return res.end(svg);
          } catch (e) {
            return sendJson(res, 400, { ok: false, error: e.message });
          }
        }
        if (rest === '/api/preset') {
          try {
            const { scene: sc } = presetScene(q.get('key') || 'platform-overview', q.get('palette'));
            res.writeHead(200, { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'no-cache' });
            return res.end(sceneToSvg(sc));
          } catch (e) {
            return sendJson(res, 400, { ok: false, error: e.message });
          }
        }
        if (rest === '/api/export') {
          try {
            const body = await readJson(req);
            const palette = body.palette || 'orange';
            const fmts = Array.isArray(body.formats) && body.formats.length ? body.formats : ['pptx'];
            let sc;
            let base;
            if (body.preset) {
              const r = presetScene(body.preset, palette);
              sc = r.scene;
              base = body.preset;
            } else if (body.id) {
              const def = getDef(body.id);
              sc = scene(def.w, def.h, '#FFFFFF');
              place(sc, def, { x: 0, y: 0, w: def.w, h: def.h }, paletteOf(palette), body.content || sampleContent(def), body.variant || undefined);
              base = body.id.replace(/\./g, '-');
            } else {
              throw new Error('需要 id 或 preset');
            }
            const dir = outDir();
            const files = [];
            for (const f of fmts) {
              const token = randomUUID();
              if (f === 'svg') {
                const p = join(dir, `${base}-${token.slice(0, 6)}.svg`);
                writeFileSync(p, sceneToSvg(sc), 'utf8');
                files.push({ format: 'svg', path: p, token });
                exports.set(token, p);
              } else if (f === 'html') {
                const p = join(dir, `${base}-${token.slice(0, 6)}.html`);
                writeFileSync(p, sceneToHtmlPage(sc, { title: base }), 'utf8');
                files.push({ format: 'html', path: p, token });
                exports.set(token, p);
              } else if (f === 'pptx') {
                const p = join(dir, `${base}-${token.slice(0, 6)}.pptx`);
                sceneToPptx(body.preset ? sc : scaleScene(sc, { w: 1280, h: 720, padding: 56 }), p);
                files.push({ format: 'pptx', path: p, token });
                exports.set(token, p);
              }
            }
            return sendJson(res, 200, { ok: true, files });
          } catch (e) {
            return sendJson(res, 500, { ok: false, error: e.message });
          }
        }
        if (rest.startsWith('/api/download/')) {
          const token = rest.slice('/api/download/'.length);
          const file = exports.get(token);
          if (!file || !existsSync(file)) return notFound(res);
          const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
          res.writeHead(200, { 'content-type': type, 'content-length': statSync(file).size });
          return createReadStream(file).pipe(res);
        }
        if (req.method !== 'GET' && req.method !== 'HEAD') return notFound(res);
        const rel = rest === '/' ? 'index.html' : rest.slice(1);
        if (rel.split('/').some((p) => p.startsWith('.') || p.includes('..'))) return notFound(res);
        const file = normalize(join(ROOT, 'gallery', rel));
        if (!file.startsWith(normalize(join(ROOT, 'gallery')) + sep) || !existsSync(file)) return notFound(res);
        const type = MIME[extname(file).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'content-type': type, 'content-length': statSync(file).size, 'cache-control': 'no-cache' });
        if (req.method === 'HEAD') return res.end();
        return createReadStream(file).pipe(res);
      },
    }),
  );
}
