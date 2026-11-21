# 图形元素 · Graphic Elements

> 仓库：**https://github.com/tonymingyang-prog/graphic-elements**（私有） · MIT
> 上传与更新流程见 [UPLOAD.md](UPLOAD.md)

一套**自建的 PPT 图形元素体系**：把咨询级静态逻辑图 / 架构图拆成可参数化的图形原子，一套 JSON 同时产出**可编辑 PPTX**（原生形状）与**网页 SVG**。

> 不是模板复制品。模板里 1.3 万个形状被归一成 44 个原子，靠参数（层数、条目、行列、配色）重新生成，而不是把某几页抠下来复用。

## 现在有什么

| 维度 | 数量 | 说明 |
|---|---|---|
| 图形原子 | **44** | 卡片与标签 / 容器与栏位 / 流程与路径 / 结构与体系 / 文字块 / 装饰件 |
| 整页预设 | **7** | 平台架构、能力矩阵、流程路线、生态支撑、中心辐射、环形体系、双边方案（v2 版式，自带底部结论条） |
| 图纸页型 | **15** | `gze_deck` 用：封面/目录/章节/泳道/指标/叠层/矩阵/分层/辐射/生态/时间轴/V 形/对比/清单/收尾 |
| 配色 | **6** | 橙 / 红 / 蓝 / 绿 / 青 / 紫，每套自动派生 6 级浅淡 + 2 级深色 |
| 模板映射 | **80 页** | 逐页对齐「模板母题 → 原子 → 页型」，50 页可直接映射，见 [映射矩阵](docs/模板映射矩阵.md) |
| 输出通道 | 3 | PPTX（原生可编辑）/ SVG（矢量）/ HTML（演示页） |

## 文档

| 文档 | 内容 |
|---|---|
| [模板映射矩阵](docs/模板映射矩阵.md) | **核心**：80 页模板逐页的「逻辑骨架 → 主图母题 → 映射原子 → 映射页型 → 覆盖状态」 |
| [元素清单](docs/元素清单.md) | 44 个原子的 id、名称、尺寸、槽位、变体 |
| [版面规格](docs/版面规格.md) | 画布/边距/字号阶梯/元素尺寸/「逻辑 → 图纸」选型决策表 |
| [缺口与路线图](docs/缺口与路线图.md) | 6 个缺口母题、6 个待扩展变体、4 个缺页型、四批计划 |
| [SKILL.md](skills/guizang-elements/SKILL.md) | 给模型的使用说明（DSH 里自动加载） |

## 设计原则（不是照搬模板）

1. **原子化**：模板里 1.3 万个形状归成六族，每族只保留可复用的几何骨架。
2. **参数化**：层数、条目数、行列数由内容决定（`flow.chevron` 吃 3–6 段、`matrix.grid` 吃 2–3 行、`platform.disc` 吃 2–4 层），不写死坐标。
3. **单色相阶梯**：层次只靠同一主色的明度阶梯（t1–t6）与留白表达，一张图只允许一处高饱和强调。
4. **一次绘制、两路输出**：场景（scene）是唯一真相，SVG 与 PPTX 只是两个序列化后端。
5. **页页收口**：内容页底部统一一条结论条；标题写结论句，不写“分析/方案”。

## 目录结构

```
lib/core.js         调色板派生、字阶、场景原语（rect/ellipse/poly/line/text/cylinder）
lib/elements.js     15 个基础元素 + 4 个装饰件
lib/generators.js   16 个参数化生成器（按内容数量自动排布）
lib/deck.js         15 种图纸页型（v2：44px 边距 / 31px 标题 / 底部结论条）
lib/compose.js      place / figure / scaleScene / 6 套预设 / 分类
lib/scene-svg.js    scene → SVG
lib/scene-pptx.js   scene → PPTX（调用 python-pptx，输出原生形状）
lib/tools.js        4 个工具：catalog / render / figure / deck
lib/index.js        Host 半边：工具 + skill + 面板与 API
lib/client.js       浏览器半边：侧栏入口 + iframe 面板
gallery/index.html  元素库面板（分类、配色、槽位试填、导出）
py/render_pptx.py   场景 JSON → 原生可编辑 PPTX
skills/…/SKILL.md   给模型的使用说明
data/catalog.json   机器可读的元素清单
docs/               映射矩阵 / 元素清单 / 版面规格 / 路线图
mapping/pages80.json 80 页映射的结构化数据
examples/           示例蓝图与产物
```

## 安装（DSH 插件）

本机已通过 plugin manager 以 `link:D:/DSH-work/plugins/dsh-guizang-elements` 装进 `desktop` profile；改完代码需重启客户端（宿主缓存 ESM 模块）。

换机器：

```bash
# 在 DSH 里（plugin manager）
install_bundle  target = link:<此目录绝对路径>
```

或手工：把 `"dsh-guizang-elements": "link:<绝对路径>"` 加进 profile 的 `dependencies`，并把 `dsh-guizang-elements` 加进 `dsh.profile.bundles`，再 `pnpm install`。

## 四个工具

| 工具 | 用途 | 关键参数 |
|---|---|---|
| `gze_catalog` | 查元素（按分类 / 关键字） | `category`、`query` |
| `gze_render` | 单元素或整页预设 → 文件 | `id` / `preset`、`palette`、`formats`(svg,html,pptx)、`content`(JSON) |
| `gze_figure` | 多块自由拼一整页 | `blocks`(JSON 数组)、`palette`、`w`/`h`、`formats` |
| `gze_deck` | 按蓝图出 10–30 页整份 PPT | `spec`(JSON 字符串)、`outDir`、`name`、`formats`(pptx,svgs) |

### gze_deck 蓝图

```json
{
  "title": "企业 AI 中台 2026",
  "palette": "blue",
  "pages": [
    { "type": "cover", "kicker": "AI PLATFORM ARCHITECTURE 2026",
      "title": "从分散试点\n到智能体平台底座", "subtitle": "…",
      "metrics": [{ "value": "23 → 4", "label": "重复建设" }] },
    { "type": "section", "no": "01", "title": "现状与挑战", "points": ["重复建设", "数据割裂"] },
    { "type": "lanes", "kicker": "CURRENT STATE", "title": "四条线各自试点",
      "lanes": [{ "title": "场景层", "items": ["客服问答", "营销文案"] }],
      "conclusion": "先统一能力供给，再谈场景复制" },
    { "type": "matrix", "title": "应用架构", "cols": [], "rows": [], "cells": [[]],
      "callout": { "title": "推进原则", "desc": "一次只动一个域" },
      "caption": "读法：一行问现状，一行问目标" }
  ]
}
```

完整示例见 [examples/ai-platform/spec.mjs](examples/ai-platform/spec.mjs)（20 页，自检 0 问题）。

## 面板

侧栏「图形元素」→ `/guizang-elements/`：分类筛选、六色切换、点开任意元素试填槽位、一键导出 PPTX / SVG / HTML。

接口：

- `GET  /guizang-elements/api/catalog`
- `GET  /guizang-elements/api/preview?id=&palette=&variant=`
- `GET  /guizang-elements/api/preset?key=&palette=`
- `POST /guizang-elements/api/export` `{ id|preset, palette, formats:[...] }`
- `GET  /guizang-elements/api/download/<token>`

## 依赖与约束

- **PPTX 后端需要 Python + python-pptx**（DSH 自带运行时里有）。解释器按 `GZE_PYTHON` → `.dsh-fresh` 运行时 → `python` 顺序探测。
- 字体默认「微软雅黑」，可用 `font` 覆盖；模板原字体是思源黑体 CN，本机没装，故不默认使用。
- SVG 用纯字符串生成，不需要浏览器；PPTX 渲染回检才需要 LibreOffice 引擎。
- 装饰件的柔和渐变在 PPTX 退化为纯色，其余几何一致。

## 扩展一个新元素

```js
// lib/elements.js
{
  id: 'card.quote', name: '引言卡', cat: 'surface', tags: ['引用'],
  w: 300, h: 120,
  slots: [{ id: 'text', label: '引文' }],
  draw(s, pal, c) {
    rect(s, 0, 0, 300, 120, { r: 10, fill: pal.t1, stroke: pal.t3, sw: 1 });
    text(s, 20, 20, 260, 80, c.text || '……', { size: 13, color: pal.body, lh: 1.5 });
  },
}
```

加完在 `data/catalog.json` 登记，刷新面板即可；PPTX / SVG 两条通道自动支持（新元素只用 `rect/ellipse/poly/line/text`）。

## 路线图

见 [缺口与路线图](docs/缺口与路线图.md)：第一批补 5 个缺口原子（漏斗、词云、多层弧、蜂窝、扇形分层），第二批补 3 个页型，第三批扩展 6 个变体，第四批做暗色主题。

## License

MIT，见 [LICENSE](LICENSE)。
