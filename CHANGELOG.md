# Changelog

## v0.5.0 — 2026-11-23

- 新增 **20 个线性图标**（`lib/icons.js`）：客户 / 团队 / 伙伴 / 合规 / 社区 / 财务 / 物流 / 渠道 / 营销 / 流程 / 制造 / 服务 / 人力 / 报表 / 标签 / 指标 / 分析 / 资产 / 实时 / 中心 / 分层
- 图标用「线段 / 圆 / 折线 / 弧」四类原始笔触定义，SVG 与 PPTX 共用同一份几何
- `hub.radial` 节点自动配图标（按标签模糊匹配，最长键优先）
- 环形体系节点保持纯文字（56px 圆放不下图标，加了反而更乱）
- gitee 远程仓库已配置：`tony-mingyang/definition-logic`

## v0.4.2 — 2026-11-23

- 全面更名：图形元素 → **定义逻辑图**（Definition Logic），技术 id 保持不变
- 环形体系（`ring.system`）按参考模板重画：满版构图、沿弧逐字、五段角标、维恩比例
- 新增满版预设 `ring-panorama`；重排 `ring-ecosystem`（560 环 + 两侧三卡）

## v0.4.1 — 2026-11-22

- 修复 `tools.js` 语法错误（曾导致插件整包加载失败、侧栏入口消失）
- 新增 `tools/self-check.mjs` 与 `npm run check`
- `work/sync-catalog.mjs` 支持同步预设

## v0.4.0 — 2026-11-22

- 新增渐变 / 外发光 / 投影三种效果，SVG 与 PPTX 双后端实现
- 新增《差距分析与升级方案》文档

## v0.3.0 — 2026-11-21

- 补齐 7 个缺口母题：`ring.system`、`funnel.stage`、`cloud.text`、`arc.layers`、`sector.band`、`honeycomb.cluster`、`iso.platform`
- 新增 `conclusion.bar`；元素总数 35 → 44
- 80 页模板映射矩阵：缺口清零（59 ✅ / 21 ◐ / 0 ✗）

## v0.2.0 — 2026-11-21

- 6 套整页预设升级 v2 版式（44px 边距 / 31px 标题 / 底部结论条）
- 更名 图形元素；修复 PPTX 端行高偏移

## v0.1.0 — 2026-11-20

- 首个版本：35 个图形原子、6 套配色、6 套整页预设、PPTPX/SVG 双通道
