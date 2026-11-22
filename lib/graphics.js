// 第二批图形：从 80 页模板里盘点出的缺口母题
// ring.system / funnel.stage / cloud.text / honeycomb.cluster / sector.band / arc.layers / iso.platform
import { rect, ellipse, poly, line, text, darken, lighten } from './core.js';

const D = Math.PI / 180;
const T = (s, x, y, w, h, str, st = {}) =>
  text(s, x, y, w, h, str, { size: 12, weight: 700, color: '#333', align: 'center', valign: 'middle', ...st });
const norm = (a) => ((((a + 180) % 360) + 360) % 360) - 180;
// 槽位既接受字符串，也接受 { title } 对象
const asText = (it) => (typeof it === 'string' ? it : (it && (it.title || it.name)) || '');

export const GRAPHICS = [
  // ---------------- 1. 环形体系 ----------------
  {
    id: 'ring.system',
    name: '环形体系',
    cat: 'structure',
    tags: ['同心环', '扇区', '维恩', '全景'],
    w: 680, h: 680,
    slots: [
      { id: 'center', label: '中心文字', example: '让人才更有价值' },
      { id: 'venn', label: '内圈三圆（3）', example: ['客户价值', '员工价值', '社会价值'] },
      { id: 'segments', label: '中圈扇区（4–8）', example: ['招聘服务', '灵活用工'] },
      { id: 'nodes', label: '外圈节点（6–10）', example: ['客户', '候选人'] },
      { id: 'arcs', label: '弧形角标（2–6）', example: ['专业 今日人才'] },
    ],
    gen(s, pal, c = {}) {
      const CX = 340, CY = 340;
      const P = (r, a) => [CX + Math.cos(a * D) * r, CY + Math.sin(a * D) * r];
      const venn = (c.venn || ['客户价值', '员工价值', '社会价值']).slice(0, 3).map(asText);
      const segs = (c.segments || ['招聘服务', '灵活用工', '数智员工', '培训发展', '薪酬福利', '人事外包']).slice(0, 8).map(asText);
      const nodes = (c.nodes || ['客户', '候选人', '员工', '合作伙伴', '政策', '高校', '投资者', '社会']).slice(0, 10).map(asText);
      const arcs = (c.arcs || ['专业 今日人才', '高效 今日人才', '可信 今日人才']).slice(0, 6).map(asText);

      const arcLabel = (r, aMid0, text, size, color, step) => {
        const aMid = norm(aMid0);
        const chars = [...String(text)];
        const dir = aMid <= 0 ? 1 : -1;
        for (let k = 0; k < chars.length; k++) {
          const off = (k - (chars.length - 1) / 2) * step;
          const a = aMid + (dir * off) / r / D;
          const [x, y] = P(r, a);
          T(s, x - size * 0.95, y - size * 0.8, size * 1.9, size * 1.6, chars[k], {
            size, weight: 700, color, rotate: dir > 0 ? a + 90 : a - 90, noWrap: true,
          });
        }
        return ((chars.length - 1) * step) / r / D;
      };

      // 外层淡底圆
      ellipse(s, CX - 300, CY - 300, 600, 600, { stroke: pal.t2, sw: 1.1, fill: 'none' });
      ellipse(s, CX - 322, CY - 322, 644, 644, { stroke: pal.t1, sw: 2, fill: 'none' });

      // 外圈相关方：白底细环
      const RN = 294;
      nodes.forEach((label, i) => {
        const a = -90 + (i * 360) / nodes.length;
        const [x, y] = P(RN, a);
        ellipse(s, x - 34, y - 34, 68, 68, { fill: pal.t1, opacity: 0.4, stroke: 'none' });
        ellipse(s, x - 28, y - 28, 56, 56, { fill: '#FFFFFF', stroke: pal.t3, sw: 1.2 });
        T(s, x - 28, y - 28, 56, 56, label, { size: 12, weight: 700, color: pal.deep, lh: 1.15 });
      });

      // 中圈扇区：近白渐层 + 白缝 + 沿弧字
      const R_IN = 160, R_OUT = 266;
      const n = Math.max(3, segs.length);
      segs.forEach((label, i) => {
        const a0 = -90 + (i * 360) / n, a1 = a0 + 360 / n;
        const pts = [];
        const N = 40;
        for (let k = 0; k <= N; k++) pts.push(P(R_OUT, a0 + ((a1 - a0) * k) / N));
        for (let k = N; k >= 0; k--) pts.push(P(R_IN, a0 + ((a1 - a0) * k) / N));
        poly(s, pts, {
          fillGrad: { from: i % 2 ? pal.t1 : pal.t1, to: i % 2 ? pal.t2 : pal.t2, angle: (a0 + a1) / 2 + 90 },
          stroke: '#FFFFFF', sw: 3,
        });
        const am = norm(a0 + 180 / n);
        const fs = label.length > 9 ? 13 : label.length > 7 ? 14 : 15.5;
        arcLabel((R_IN + R_OUT) / 2 + 6, am, label, fs, pal.deep, fs * 1.12);
      });
      ellipse(s, CX - R_IN, CY - R_IN, R_IN * 2, R_IN * 2, { stroke: pal.t4, sw: 1, dash: '4 5', fill: 'none' });
      ellipse(s, CX - R_OUT, CY - R_OUT, R_OUT * 2, R_OUT * 2, { stroke: pal.t3, sw: 1, fill: 'none' });

      // 内圈维恩
      const VENN = 104, DV = 56;
      const va = [-90, 30, 150];
      venn.forEach((t, i) => {
        const [x, y] = P(DV, va[i]);
        ellipse(s, x - VENN, y - VENN, VENN * 2, VENN * 2, {
          fill: pal.t1, opacity: 0.9, stroke: pal.t4, sw: 1.1, dash: '6 4',
        });
      });
      venn.forEach((t, i) => {
        const [x, y] = P(128, va[i]);
        T(s, x - 70, y - 13, 140, 26, t, { size: 14, weight: 700, color: pal.deep });
      });

      // 中心：粗蓝环 + 白芯
      const R0 = 58;
      ellipse(s, CX - R0, CY - R0, R0 * 2, R0 * 2, { fill: pal.primary, stroke: 'none' });
      ellipse(s, CX - R0 + 11, CY - R0 + 11, (R0 - 11) * 2, (R0 - 11) * 2, { fill: '#FFFFFF', stroke: pal.t4, sw: 1, dash: '2 3' });
      T(s, CX - 80, CY - 28, 160, 56, c.center || '让人才\n更有价值', { size: 17.5, weight: 700, color: pal.primary, lh: 1.28 });

      // 外圈弧形角标：粗弧 + 端点
      const ra = arcs.length;
      arcs.forEach((label, i) => {
        const aMid = norm(-90 + (360 / ra) * i + 360 / ra / 2 + 22.5);
        const span = arcLabel(328, aMid, label, 14, pal.primary, 15);
        const b0 = aMid - span / 2 - 3, b1 = aMid + span / 2 + 3;
        const arcPts = [];
        for (let k = 0; k <= 30; k++) arcPts.push(P(316, b0 + ((b1 - b0) * k) / 30));
        poly(s, arcPts, { fill: 'none', stroke: pal.primary, sw: 2.4, open: true });
        const [x1, y1] = P(316, b0), [x2, y2] = P(316, b1);
        ellipse(s, x1 - 3.5, y1 - 3.5, 7, 7, { fill: pal.primary });
        ellipse(s, x2 - 3.5, y2 - 3.5, 7, 7, { fill: pal.primary });
      });
    },
  },
  // ---------------- 2. 漏斗 ----------------
  {
    id: 'funnel.stage',
    name: '漏斗分层',
    cat: 'structure',
    tags: ['漏斗', '转化', '分层'],
    w: 660, h: 440,
    slots: [{ id: 'items', label: '层级（3–5）', example: [{ title: '线索', value: '12000' }, { title: '签约', value: '800' }] }],
    gen(s, pal, c = {}) {
      const list = (c.items || []).slice(0, 5);
      const n = Math.max(3, list.length || 4);
      const top = 640, bot = 260, gap = 8;
      const h = (440 - gap * (n - 1)) / n;
      list.forEach((it, i) => {
        const w0 = top + ((bot - top) * i) / n;
        const w1 = top + ((bot - top) * (i + 1)) / n;
        const y = i * (h + gap);
        const x0 = (660 - w0) / 2, x1 = (660 - w1) / 2;
        poly(s, [[x0, y], [x0 + w0, y], [x1 + w1, y + h], [x1, y + h]], {
          fill: i === 0 ? pal.primary : lighten(pal.primary, Math.min(0.62, 0.18 + i * 0.12)),
        });
        T(s, x1 + 16, y + 6, w1 - 32, h - 30, it.title || `层级 ${i + 1}`, {
          size: 15, weight: 700, color: i === 0 ? '#fff' : pal.deep, noWrap: true,
        });
        if (it.value) {
          T(s, x1 + 16, y + h - 30, w1 - 32, 24, String(it.value), {
            size: 12, weight: 700, color: i === 0 ? 'rgba(255,255,255,.85)' : pal.primary, noWrap: true,
          });
        }
      });
    },
  },

  // ---------------- 3. 词云 ----------------
  {
    id: 'cloud.text',
    name: '能力词云',
    cat: 'structure',
    tags: ['词云', '标签', '能力'],
    w: 900, h: 400,
    slots: [{ id: 'items', label: '词条（8–20）', example: ['智能招聘', '人才画像'] }],
    gen(s, pal, c = {}) {
      const words = (c.items || ['智能招聘', '人才画像', '面试评估', '组织诊断', '薪酬对标', '灵活用工']).slice(0, 18).map(asText);
      const ROWS = 4;
      const per = Math.ceil(words.length / ROWS);
      const rowH = 400 / ROWS;
      for (let r = 0; r < ROWS; r++) {
        const row = words.slice(r * per, (r + 1) * per);
        if (!row.length) continue;
        const gap = 24;
        let size = 30 - r * 3;
        let widths = row.map((w) => w.length * size * 0.98 + gap);
        let total = widths.reduce((a, b) => a + b, 0);
        while (total > 840 && size > 15) {
          size -= 1;
          widths = row.map((w) => w.length * size * 0.98 + gap);
          total = widths.reduce((a, b) => a + b, 0);
        }
        let x = (900 - total) / 2;
        const y = r * rowH;
        row.forEach((w, i) => {
          T(s, x, y, widths[i], rowH, w, {
            size, weight: r === 0 ? 700 : 600,
            color: r % 2 ? pal.deep : pal.primary, noWrap: true,
          });
          x += widths[i];
        });
      }
    },
  },

  // ---------------- 4. 蜂窝 ----------------
  {
    id: 'honeycomb.cluster',
    name: '蜂窝集群',
    cat: 'structure',
    tags: ['蜂窝', '六边形', '集群'],
    w: 780, h: 470,
    slots: [{ id: 'center', label: '中心', example: '人才中台' }, { id: 'items', label: '环内格子（6–18）', example: ['招聘', '测评'] }],
    gen(s, pal, c = {}) {
      const CX = 390, CY = 235, R = 46;
      const hexAt = (x, y) => {
        const pts = [];
        for (let i = 0; i < 6; i++) pts.push([x + Math.cos((60 * i - 90) * D) * (R - 2), y + Math.sin((60 * i - 90) * D) * (R - 2)]);
        return pts;
      };
      const cells = [];
      for (let q = -2; q <= 2; q++) {
        for (let rr = -2; rr <= 2; rr++) {
          const ss = -q - rr;
          if (Math.max(Math.abs(q), Math.abs(rr), Math.abs(ss)) > 2) continue;
          const x = CX + Math.sqrt(3) * R * (q + rr / 2);
          const y = CY + 1.5 * R * rr;
          cells.push({ x, y, d: Math.max(Math.abs(q), Math.abs(rr), Math.abs(ss)), q, rr });
        }
      }
      cells.sort((a, b) => a.d - b.d || Math.atan2(a.rr, a.q) - Math.atan2(b.rr, b.q));
      const list = (c.items || []).slice(0, 18).map(asText);
      cells.forEach((cell, i) => {
        const isCenter = i === 0;
        const fill = isCenter ? pal.primary : cell.d === 1 ? pal.t2 : pal.t1;
        poly(s, hexAt(cell.x, cell.y), { fill, stroke: '#FFFFFF', sw: 2 });
        const label = isCenter ? (c.center || '人才中台') : list[i - 1] || '';
        if (label) {
          T(s, cell.x - R + 6, cell.y - 14, R * 2 - 12, 28, label, {
            size: isCenter ? 12.5 : 10.5, weight: 700, color: isCenter ? '#fff' : pal.deep, lh: 1.1,
          });
        }
      });
    },
  },

  // ---------------- 5. 扇区环带 ----------------
  {
    id: 'sector.band',
    name: '扇区环带',
    cat: 'structure',
    tags: ['扇区', '环带', '分层'],
    w: 720, h: 720,
    slots: [{ id: 'center', label: '中心', example: '业务版图' }, { id: 'items', label: '扇区（3–8）', example: ['招聘', '外包'] }],
    gen(s, pal, c = {}) {
      const CX = 360, CY = 360;
      const P = (r, a) => [CX + Math.cos(a * D) * r, CY + Math.sin(a * D) * r];
      const list = (c.items || ['招聘服务', '灵活用工', '数智员工', '培训发展', '薪酬福利', '人事外包']).slice(0, 8).map(asText);
      const n = Math.max(3, list.length);
      const R0 = 92, R1 = 306;
      list.forEach((label, i) => {
        const a0 = -90 + (i * 360) / n, a1 = a0 + 360 / n;
        const pts = [];
        for (let k = 0; k <= 30; k++) pts.push(P(R1, a0 + ((a1 - a0) * k) / 30));
        for (let k = 30; k >= 0; k--) pts.push(P(R0, a0 + ((a1 - a0) * k) / 30));
        poly(s, pts, { fill: i % 2 ? pal.t2 : pal.t1, stroke: '#FFFFFF', sw: 2 });
        const am = norm(a0 + 180 / n);
        const rot = am <= 0 ? am + 90 : am - 90;
        const [tx, ty] = P((R0 + R1) / 2, am);
        T(s, tx - 110, ty - 16, 220, 32, label, { size: 14, weight: 700, color: pal.deep, rotate: rot, noWrap: true });
      });
      ellipse(s, CX - R0, CY - R0, R0 * 2, R0 * 2, { fill: '#FFFFFF', stroke: pal.primary, sw: 6 });
      T(s, CX - 80, CY - 26, 160, 52, c.center || '业务版图', { size: 15, weight: 700, color: pal.primary, lh: 1.3 });
    },
  },

  // ---------------- 6. 多层同心弧 ----------------
  {
    id: 'arc.layers',
    name: '多层同心弧',
    cat: 'structure',
    tags: ['弧', '全景', '分层'],
    w: 900, h: 480,
    slots: [{ id: 'layers', label: '层（2–4）', example: [{ title: '行业', items: ['政务', '金融'] }] }],
    gen(s, pal, c = {}) {
      const CX = 450, CY = 452;
      const layers = (c.layers || [
        { title: '行业', items: ['政务', '金融', '制造'] },
        { title: '能力', items: ['招聘', '测评', '外包'] },
        { title: '底座', items: ['数据', '模型'] },
      ]).slice(0, 4);
      const n = Math.max(2, layers.length);
      layers.forEach((ly, i) => {
        const r = 132 + i * 84;
        const pts = [];
        for (let k = 0; k <= 60; k++) {
          const a = Math.PI + (Math.PI * k) / 60;
          pts.push([CX + Math.cos(a) * r, CY + Math.sin(a) * r]);
        }
        poly(s, pts, {
          fill: 'none',
          stroke: i === n - 1 ? pal.primary : lighten(pal.primary, 0.5 - i * 0.12),
          sw: 26, open: true,
        });
        T(s, CX - 64, CY - r - 22, 128, 24, ly.title || `层 ${i + 1}`, { size: 12.5, weight: 700, color: pal.deep });
        const items = (ly.items || []).slice(0, 6).map(asText);
        items.forEach((it, k) => {
          const a = Math.PI + ((k + 1) / (items.length + 1)) * Math.PI;
          const x = CX + Math.cos(a) * r, y = CY + Math.sin(a) * r;
          const up = Math.sin(a) < 0;
          T(s, x - 52, y + (up ? -44 : 24), 104, 20, String(it), { size: 11.5, weight: 600, color: pal.body, noWrap: true });
          ellipse(s, x - 3.5, y - 3.5, 7, 7, { fill: pal.primary });
        });
      });
    },
  },

  // ---------------- 7. 等距立体平台 ----------------
  {
    id: 'iso.platform',
    name: '等距立体平台',
    cat: 'structure',
    tags: ['等距', '3D', '平台'],
    w: 780, h: 480,
    slots: [{ id: 'layers', label: '层（2–4）', example: [{ title: '应用层' }, { title: '数据层' }] }],
    gen(s, pal, c = {}) {
      const CX = 390, W = 470, DP = 118, TH = 22;
      const layers = (c.layers || [
        { title: '应用层' }, { title: '能力层' }, { title: '数据层' }, { title: '底座层' },
      ]).slice(0, 4);
      const n = layers.length;
      const dy = Math.min(112, (480 - 110) / Math.max(1, n - 1));
      const y0 = 96;
      layers.forEach((ly, i) => {
        const y = y0 + i * dy;
        const top = [[CX - W / 2, y], [CX, y - DP / 2], [CX + W / 2, y], [CX, y + DP / 2]];
        const left = [[CX - W / 2, y], [CX, y + DP / 2], [CX, y + DP / 2 + TH], [CX - W / 2, y + TH]];
        const right = [[CX + W / 2, y], [CX, y + DP / 2], [CX, y + DP / 2 + TH], [CX + W / 2, y + TH]];
        const base = i === 0 ? pal.primary : i === 1 ? pal.t5 : i === 2 ? pal.t4 : pal.t3;
        poly(s, left, { fill: darken(base, 0.16), stroke: 'none' });
        poly(s, right, { fill: darken(base, 0.3), stroke: 'none' });
        poly(s, top, { fill: base, stroke: '#FFFFFF', sw: 1.5 });
        T(s, CX - 150, y - 14, 300, 28, ly.title || `层 ${i + 1}`, {
          size: 13.5, weight: 700, color: i === 0 ? '#fff' : pal.deep, noWrap: true,
        });
        if (ly.items && ly.items.length) {
          const its = ly.items.slice(0, 4).map(asText);
          its.forEach((it, k) => {
            const t = (k + 0.5) / its.length;
            const x = CX - W / 2 + W * t;
            const yy = y + DP / 2 - DP * t + 10;
            T(s, x - 44, yy, 88, 18, String(it), { size: 9.5, weight: 600, color: i === 0 ? 'rgba(255,255,255,.92)' : pal.body, noWrap: true });
          });
        }
      });
    },
  },
  // ---------------- 8. 底部结论条 ----------------
  {
    id: 'conclusion.bar',
    name: '结论条',
    cat: 'text',
    tags: ['结论', '收口', '页脚'],
    w: 1192, h: 44,
    slots: [
      { id: 'label', label: '小标', example: '结论' },
      { id: 'text', label: '一句话', example: '分层不是目的，是让替换成本从月降到天' },
    ],
    gen(s, pal, c = {}) {
      rect(s, 0, 0, 1192, 44, { r: 8, fill: pal.t1 });
      rect(s, 16, 13, 3, 18, { fill: pal.primary });
      T(s, 30, 13, 46, 20, c.label || '结论', { size: 9.5, weight: 700, color: pal.primary, tracking: 1.2 });
      T(s, 76, 10, 1096, 26, c.text || '一句话说清这一页的结论', { size: 12.5, weight: 400, color: pal.ink, align: 'left' });
    },
  },
];
