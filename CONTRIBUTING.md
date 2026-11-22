# Contributing · 怎么参与

## 本地开发

```bash
git clone <repo>
cd dsh-guizang-elements
node tools/self-check.mjs      # 必须通过
```

不需要 npm install（零运行时依赖，PPTX 输出依赖系统里的 python-pptx，DSH 自带运行时里有）。

## 目录约定

| 目录 | 放什么 | 能不能改 |
|---|---|---|
| `lib/elements.js` | 基础元素（15） | 改几何要同步 `docs/元素清单.md` |
| `lib/generators.js` | 参数化生成器（16） | 同上 |
| `lib/graphics.js` | 第二批图形（8，含环形体系） | 同上 |
| `lib/deck.js` | 15 种图纸页型（v2 版式） | 改版式要跑样例册回看 |
| `lib/compose.js` | 放置/缩放/整页预设 | 预设改动要同步 `work/sync-catalog.mjs` |
| `py/render_pptx.py` | PPTX 后端（原生形状 + 渐变/发光/投影） | 改 XML 注入要跑 `ppt_render` 回检 |
| `data/catalog.json` | 机器可读清单 | 只由 `work/sync-catalog.mjs` 生成，别手改 |

## 加一个新图形

1. 在 `lib/graphics.js`（或 elements/generators）里加定义：`id / name / cat / w / h / slots / gen`
2. `node work/sync-catalog.mjs` 同步到 `data/catalog.json`
3. `node tools/self-check.mjs` 确认 11 个模块能 import、数量对得上
4. 用 `gze_render` 或 `gze_figure` 出一次 PPTX 与 SVG，肉眼确认
5. 更新 `docs/元素清单.md`、`docs/模板映射矩阵.md` 里对应的覆盖状态

## 提交规范

- 一个提交一件事：`feat: 新增 funnel.stage`、`fix: 修复 eco.bracket 高度`、`docs: ...`
- 提交前必须 `node tools/self-check.mjs` 通过
- 涉及版式的改动，附一张渲染图或说出改了哪几页

## 已知边界（别当 bug 提）

- PowerPoint 不支持文字沿路径，环形标签是逐字文本框
- 渐变只支持线性，径向靠多层圆近似
- 字体默认微软雅黑，模板原字体是思源黑体
