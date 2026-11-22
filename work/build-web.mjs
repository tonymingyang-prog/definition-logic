// 把 1.0 的 deck.json 生成单文件网页版（左右键翻页）
import { readFileSync, writeFileSync } from 'node:fs';
import { sceneToSvg } from '../lib/scene-svg.js';

const SRC = process.argv[2] || 'D:/DSH-work/guizang-elements/1.0/deck.json';
const OUT = process.argv[3] || 'D:/DSH-work/guizang-elements/1.0/定义逻辑图-1.0.html';
const TITLE = process.argv[4] || '定义逻辑图 · 1.0 雏形';

const deck = JSON.parse(readFileSync(SRC, 'utf8'));
const slides = deck.slides.map((s) => sceneToSvg({ ...s, w: s.w || deck.w, h: s.h || deck.h, bg: s.bg || '#FFFFFF' }));

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${TITLE}</title>
<style>
  :root { --blue: #1E63E9; --ink: #0B2E7A; }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; background: #0E1116; font-family: "Microsoft YaHei", "PingFang SC", system-ui, sans-serif; }
  #stage { position: fixed; inset: 0; display: grid; place-items: center; padding: 28px 28px 64px; }
  .slide { display: none; width: min(100%, calc((100vh - 110px) * 1.7778)); aspect-ratio: 16 / 9; background: #fff; border-radius: 6px; box-shadow: 0 22px 70px rgba(0,0,0,.55); overflow: hidden; }
  .slide.on { display: block; }
  .slide svg { width: 100%; height: 100%; display: block; }
  #hud { position: fixed; left: 0; right: 0; bottom: 0; height: 48px; display: flex; align-items: center; gap: 14px; padding: 0 20px; color: #cfd6e4; font-size: 13px; background: rgba(14,17,22,.92); border-top: 1px solid rgba(255,255,255,.08); }
  #hud b { color: #fff; font-weight: 600; }
  #dots { display: flex; gap: 5px; margin-left: 6px; flex-wrap: wrap; }
  #dots i { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,.22); cursor: pointer; }
  #dots i.on { background: var(--blue); transform: scale(1.35); }
  #hud .sp { flex: 1; }
  #hud button { background: rgba(255,255,255,.1); color: #e8edf7; border: 1px solid rgba(255,255,255,.14); border-radius: 6px; padding: 6px 12px; font-size: 12.5px; cursor: pointer; }
  #hud button:hover { background: rgba(30,99,233,.35); }
  #hint { position: fixed; top: 14px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,.45); font-size: 12px; letter-spacing: .04em; }
</style>
</head>
<body>
<div id="hint">← → 翻页 · F 全屏 · 点击右侧下一页</div>
<div id="stage">
${slides.map((svg, i) => `<div class="slide${i === 0 ? ' on' : ''}" data-i="${i}">${svg}</div>`).join('\n')}
</div>
<div id="hud">
  <b>${TITLE}</b>
  <span id="counter">01 / ${String(slides.length).padStart(2, '0')}</span>
  <div id="dots">${slides.map((_, i) => `<i data-i="${i}" class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
  <span class="sp"></span>
  <button id="prev">上一页</button>
  <button id="next">下一页</button>
  <button id="full">全屏</button>
</div>
<script>
  const slides = [...document.querySelectorAll('.slide')];
  const dots = [...document.querySelectorAll('#dots i')];
  const counter = document.getElementById('counter');
  let cur = 0;
  const total = slides.length;
  function go(i) {
    cur = Math.max(0, Math.min(total - 1, i));
    slides.forEach((s, k) => s.classList.toggle('on', k === cur));
    dots.forEach((d, k) => d.classList.toggle('on', k === cur));
    counter.textContent = String(cur + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
    history.replaceState(null, '', '#' + (cur + 1));
  }
  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(cur + 1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
    if (e.key === 'Home') go(0);
    if (e.key === 'End') go(total - 1);
    if (e.key.toLowerCase() === 'f') document.documentElement.requestFullscreen?.();
  });
  document.getElementById('next').onclick = () => go(cur + 1);
  document.getElementById('prev').onclick = () => go(cur - 1);
  document.getElementById('full').onclick = () => document.documentElement.requestFullscreen?.();
  dots.forEach((d) => (d.onclick = () => go(+d.dataset.i)));
  slides.forEach((s, k) => (s.onclick = (e) => go(e.offsetX > s.clientWidth / 2 ? k + 1 : k - 1)));
  const fromHash = parseInt(location.hash.replace('#', ''), 10);
  if (fromHash > 0) go(fromHash - 1);
</script>
</body>
</html>`;

writeFileSync(OUT, html, 'utf8');
console.log('html written', OUT, 'slides', slides.length, 'size', (html.length / 1024).toFixed(0) + 'KB');
