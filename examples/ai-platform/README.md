# 示例：企业 AI 中台 2026（20 页）

这份蓝图是 v2 图纸的完整用法演示：封面 → 目录 → 四章（现状 / 目标架构 / 实施路径 / 价值治理）→ 收尾。
每页一个结论句标题 + 一条底部结论条，自检 0 问题。

- `spec.mjs` — 20 页蓝图（可直接改内容复用）
- `build.mjs` — 构建脚本：`node build.mjs <输出目录>`，产出逐页 SVG + `scene.json`
- `企业AI中台-2026.pptx` — 成品（20 页 / 1066 个原生形状）
- `preview-01.png`、`preview-02.png` — 前 12 页联系表

## 跑一遍

```powershell
cd examples\ai-platform
node build.mjs out
# 再把 scene.json 交给 python-pptx：
python ..\..\py\render_pptx.py out\scene.json out\deck.pptx
```

## 蓝图结构速记

| 字段 | 作用 |
|---|---|
| `type` | 图纸页型：cover / agenda / section / lanes / kpi / disc / matrix / bands / hub / eco / timeline / chevron / compare / stack / closing |
| `kicker` | 眉标（英文小字） |
| `title` | **结论句**，单行，≤ 32 汉字 |
| `desc` | 副说明，一行 ≤ 40 汉字 |
| `conclusion` | 底部结论条（内容页必给） |
| `caption` | 矩阵页右侧读法说明 |
| `label` | 页脚左侧的章节名 |

> 数值均为示意，落实到你自己的汇报时替换即可；结构可以直接沿用。
