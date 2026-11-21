---
name: guizang-elements
description: 用「图形元素库」里的咨询级图形元素（卡片、页签、平台叠层、中心圆盘、弧形标签、泳道、时间轴、矩阵、金字塔、双心桥接、生态支撑、装饰件等 43 个；含环形体系、漏斗、词云、蜂窝、扇区、多层弧、等距立体）拼出静态逻辑图 / 架构图，并导出可编辑 PPTX、网页 SVG 或整页 HTML。当用户要做逻辑图、架构图、全景图、能力矩阵、路线图，或说“用图形元素库拼一张”“做成 PPT 里的图”时使用。
metadata:
  version: "0.1.0"
---

# 图形元素库

一套从 6 份咨询级「静态逻辑图」模板里拆解、归一出来的图形体系：**原子元素（15）+ 组合生成器（16）+ 装饰件（4）+ 6 套配色**。
所有图形都只在设计坐标里画一次，然后同时输出到两条通道：

- **PPTX**：原生形状（圆角矩形 / 椭圆 / 自由多边形 / 连接线 / 文本框），在 PowerPoint、WPS 里可以逐块改字、改色、改位置。
- **SVG / HTML**：矢量，直接嵌进网页或插进 PPT 当图标级图形。

## 一、什么时候用它

| 用户要的 | 用哪个 |
|---|---|
| 一张逻辑图 / 架构图，要放进 PPT | `gze_render` + `formats: "pptx"` |
| 一张图，要放进网页 / 公众号 / 飞书文档 | `gze_render` + `formats: "svg"`（多尺寸用 `html`） |
| 整页汇报骨架（标题 + 主图 + 数据卡） | `gze_render` 的 `preset`，或 `gze_figure` 自己拼 |
| 不知道有什么元素 | 先 `gze_catalog` |

## 二、三步走

1. **查**：`gze_catalog`（可带 `category`：surface / frame / flow / structure / text / decor，或用 `query` 搜中文名）。
2. **出**：`gze_render`（单个元素或整页预设）或 `gze_figure`（多块自由拼）。
3. **交付**：给用户文件绝对路径，说明 PPTX 里是原生形状可改。

## 二·五、整份 PPT（页数多、结构重）

要一次性出 **10–30 页**的技术架构 / 方案汇报，用 `gze_deck`，不要一页页拼。

`gze_deck` 的输入是一份**蓝图**：每页指定一个「图纸类型」，其余由图形元素库自动排版。

```json
{
  "title": "企业技术架构 2025",
  "palette": "blue",
  "pages": [
    { "type": "cover", "kicker": "TECHNOLOGY ARCHITECTURE", "title": "从烟囱式系统\n到平台化底座", "subtitle": "现状诊断、目标架构、实施路径与价值测算",
      "metrics": [{ "value": "38% → 8%", "label": "重复建设率" }] },
    { "type": "agenda", "title": "目录", "items": [{ "title": "现状与挑战", "desc": "…" }] },
    { "type": "section", "no": "01", "title": "现状与挑战", "desc": "…", "points": ["系统孤岛", "接口失控"] },
    { "type": "lanes", "kicker": "CURRENT STATE", "title": "现状：四层各自为战", "lanes": [{ "title": "渠道层", "items": ["门店"] }], "takeaway": "…" },
    { "type": "kpi", "title": "四项指标", "cards": [{ "value": "38%", "label": "重复建设率" }], "bars": [], "notes": [] },
    { "type": "disc", "title": "总体架构", "layers": [{ "title": "应用层", "items": ["营销"] }], "side": [] },
    { "type": "matrix", "title": "应用架构", "cols": [], "rows": [], "cells": [[]], "callout": {} },
    { "type": "bands", "title": "数据架构", "layers": [], "side": [] },
    { "type": "hub", "title": "技术架构", "center": "技术平台", "items": [], "notes": [] },
    { "type": "eco", "title": "集成架构", "eco": { "center": "集成中枢", "left": [], "right": [] }, "cards": [] },
    { "type": "timeline", "title": "四期推进", "items": [], "cards": [] },
    { "type": "chevron", "title": "五个阶段", "items": [], "rows": [] },
    { "type": "compare", "title": "治理机制", "columns": [{ "title": "现状", "items": [] }] },
    { "type": "stack", "title": "五项保障", "items": [], "notes": [] },
    { "type": "closing", "title": "结论", "points": [] }
  ]
}
```

**用 `gze_deck` 的规矩**

- 页序固定为「封面 → 目录 → 四章（章节页打头）→ 收尾」，每章 2–4 页内容。
- 每页标题写**结论句**（“四层各自为战，能力在系统间重复”），不要写“现状分析”。
- 每页最多一个主图；主图之外只放 0–3 个辅助块（指标卡/注释/结论条）。
- **内容页都给 `conclusion`**：一句 20–40 字的收口话，会画成页面底部的结论条（参考版式里页页都有）。没有结论的页面会显得空。
- 矩阵页可加 `caption`（读法说明，画在右侧气泡下方）；不要给卡片塞 `delta`，指标卡只用「数值 + 标签」。
- 输出里带 `issues`（自检数），**>0 就先修蓝图再交付**，不要直接给用户。
- 生成后建议用 `ppt_render` 出一遍图，确认页眉、页脚、折行没有 PPT 端偏移。

**版面规格（v2，已按三份参考版式校准，别再改小）**

| 项 | 值 |
|---|---|
| 页边距 | 左右 44px，正文上边界 146px，下边界 618px，结论条 628–672px，页脚 692px |
| 字号（设计 px） | 页标题 31 / 副说明 12.5 / 章节大号 78 / 章节标题 36 / 目录标题 19 / 对比项 11.5 / 侧注 11 / 结论条 12.5 / 页脚 9.5 |
| 卡片 | 指标卡 120 高、对比框 58 高、V 形流程行 70 高、时间轴卡 112 高 |
| 间距 | 元素之间 18–24px，卡片内边距 14–20px |
| 结论条 | 浅底 `t1` + 左侧 3px 主色竖条 + “结论”小标 + 正文 |


## 三、元素清单

**卡片与标签（surface）**：`card.plain` 标准卡片、`card.icon` 图标卡片、`card.stat` 指标卡片、`tab` 页签（filled/outline/ghost）、`chip` 小标签、`badge.num` 序号徽标（solid/ring）、`ribbon` 标题横幅、`label.aside` 侧边防标签、`metric.ring` 环形进度、`metric.bar` 横向进度条、`callout` 标注气泡、`divider` 分隔标注

**容器与栏位（frame）**：`zone` 虚线分区框、`bracket` 侧边括号（left/right）、`rail` 纵向栏位

**流程与路径（flow）**：`flow.chevron` V 形流程、`flow.steps` 节点步骤流、`flow.lanes` 纵向泳道带、`timeline` 时间轴、`stack.list` 纵向清单、`board.columns` 看板分栏

**结构与体系（structure）**：`platform.disc` 平台叠层（等距圆柱）、`medallion` 中心圆盘、`hub.radial` 中心辐射、`arc.fan` 弧形标签扇、`dual.hub` 双心桥接、`eco.bracket` 主体+两侧支撑、`matrix.grid` 矩阵网格、`pyramid.levels` 金字塔层级、`layers.band` 横向分层

**第二批（v0.3 补齐的缺口母题）**：ing.system 环形体系（同心扇区 + 维恩 + 光环节点 + 弧形字）、unnel.stage 漏斗、cloud.text 词云、honeycomb.cluster 蜂窝、sector.band 扇区环带、rc.layers 多层同心弧、iso.platform 等距立体平台

**文字与装饰（text / decor）**：`title.block` 标题块、`decor.dot-arc` 点阵弧、`decor.orbit` 虚线轨道、`decor.wash` 柔光底衬、`decor.corner` 角标刻度

## 四、内容写法

元素用**槽位**吃内容，槽位名见 `gze_catalog` 返回的 `slots`。通用约定：

```json
{ "title": "业务中台", "desc": "统一口径 · 复用能力" }
```

列表型元素吃数组：

```json
// flow.chevron / flow.steps / timeline / stack.list / hub.radial / medallion
{ "items": [{ "title": "需求澄清", "desc": "Q1" }] }

// platform.disc / layers.band / flow.lanes
{ "layers": [{ "title": "应用层", "items": ["营销", "供应", "财务"] }] }

// matrix.grid
{ "cols": ["交易域", "履约域"], "rows": ["现状", "目标"], "cells": [["已上线", "待建"], ["统一模型", "规则引擎"]] }
```

**条数要克制**：chevron 3–5、items 4–8、layers 3–4、matrix 最多 3×3。超过就拆两张图。

## 五、配色

6 套预设：`orange` 橙、`red` 红、`blue` 蓝、`green` 绿、`teal` 青、`purple` 紫；**也可以直接传任意主色 `#RRGGBB`**（如 palette: "#0E7490"），会按同一套算法派生出 t1–t6 与 d1/d2 色阶。
每套自动派生 6 级浅淡（t1–t6）与两级深色（d1/d2），**层次感靠浅淡阶梯表达，不要在一张图里堆 3 种主色**。

## 六、组合原则（拼整页时）

1. **一页一个结论**：标题块写结论句，不要写“分析”“方案”这种空词。
2. **三段式**：顶部标题块（高 96）+ 中部主图（占 60–70% 高）+ 底部一到三条注释/数据卡。
3. **对齐**：所有块左边界对齐到 60、80 或 120；主图居中不超过 1160 宽。
4. **留白**：主图四周至少 40px，元素之间 12–16px，卡内边距 16–20px。
5. **字号**：标题 30 / 小标题 17 / 正文 13 / 注释 11 / 微标 9.5（设计空间 px，导出时按比例缩放）。
6. **强调**：整张图只允许一处高饱和填充（primary 实底或深色块），其余用 t1/t2 浅底 + 描边。

## 七、铁律

- **不要用 `gze_figure` 从零画形状**：图形元素库已经封装了几何，手写坐标会让字号和对齐失真。
- **不要在一张图里塞两个中心**：`hub.radial` 和 `medallion` 都是“单中心”结构，需要双中心用 `dual.hub`。
- **导出 PPTX 前先确认字体**：默认「微软雅黑」，用户机器没有思源黑体时不要指定它。
- **文字超长先拆**：一条 `desc` 超过 24 个汉字就该拆行或拆块。
- 交付时告诉用户：PPTX 内是**原生形状**，可以直接在 PowerPoint / WPS 里改；SVG 插 PPT 会作为矢量图片，不能再拆块。

## 八、示例

```json
// gze_render: 平台叠层图，直接进 PPT
{ "id": "platform.disc", "palette": "blue", "formats": "pptx,svg",
  "content": "{\"layers\":[{\"title\":\"应用层\",\"items\":[\"营销\",\"供应\",\"财务\"]},{\"title\":\"中台层\",\"items\":[\"数据中台\",\"业务中台\"]},{\"title\":\"底座层\",\"items\":[\"云原生\",\"数据湖\"]}]}" }
```

```json
// gze_figure: 一页完整汇报
{ "palette": "orange", "formats": "pptx",
  "blocks": "[{\"id\":\"title.block\",\"box\":{\"x\":60,\"y\":44,\"w\":720,\"h\":96},\"content\":{\"title\":\"平台总体架构\"}},{\"id\":\"layers.band\",\"box\":{\"x\":60,\"y\":170,\"w\":1160,\"h\":460},\"content\":{...}}]" }
```
