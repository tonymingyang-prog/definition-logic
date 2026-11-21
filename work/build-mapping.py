# -*- coding: utf-8 -*-
"""生成 80 页模板 → 图形元素 的映射台账（JSON + Markdown）。"""
import json, os
from collections import Counter

ROOT = r"D:\DSH-work\plugins\dsh-guizang-elements"
OUT_JSON = os.path.join(ROOT, "mapping", "pages80.json")
OUT_MD = os.path.join(ROOT, "docs", "模板映射矩阵.md")
os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
os.makedirs(os.path.dirname(OUT_MD), exist_ok=True)

# (页, 模板主题, 逻辑骨架, 主图母题, 原子, 页型, 覆盖)
ROWS = [
 (1, "供应链管理", "中心环", "同心双环 + 外圈弧形标签扇", ["medallion", "arc.fan", "rail"], "hub", "part"),
 (2, "迟迟产品架构", "横向链路", "五段大箭头 + 上下能力/角色清单", ["flow.chevron", "stack.list"], "lanes", "ok"),
 (3, "让迟迟生活更美好", "同心环", "三环嵌套 + 外圈角色 + 弧形标注", ["medallion", "arc.fan", "label.aside"], "hub", "part"),
 (4, "会玩社区", "双翼闭环", "中心椭圆 + 左右阶段条 + 上下箭头", ["dual.hub", "bracket", "chip"], "eco", "ok"),
 (5, "物联网行业终端设备", "中心双列", "中心圆 + 左右协议/终端列 + 竖排边标", ["medallion", "stack.list", "label.aside"], "hub", "ok"),
 (6, "直播营销一体化", "辐射 + 流程", "中心圆 + 左右扇形 + 右侧漏斗", ["hub.radial", "arc.fan", "flow.steps"], "hub", "ok"),
 (7, "页面主标题（5 卡 + 平台图）", "卡片带 + 平台图", "顶部 5 张图标卡 + 下部复杂平台", ["card.icon", "platform.disc", "chip"], "stack", "part"),
 (8, "企业直播场景矩阵", "多层弧", "同心弧段多层 + 环形节点", ["arc.fan", "hub.radial"], "hub", "part"),
 (9, "楼宇资产运营", "中心辐射", "中心圆 + 8 向标签 + 侧注", ["hub.radial", "card.icon", "rail"], "hub", "ok"),
 (10, "5G 能力延展", "双列", "左标识 + 两列能力/行业 + 底部趋势行", ["stack.list", "label.aside", "divider"], "stack", "ok"),
 (11, "IT/IDC 智能运维", "横向链路", "顶部能力标签 + 四栏流程 + 底部数据带", ["flow.steps", "board.columns", "divider"], "lanes", "ok"),
 (12, "双十一活动流程", "立体圆柱 + 时间轴", "3D 圆柱 + 阶段轴 + 左右策略", ["platform.disc", "timeline"], "timeline", "part"),
 (13, "品牌体验设计", "四象限放射", "中心菱形 + 四角放射 + 四象限说明", ["matrix.grid", "hub.radial"], "matrix", "ok"),
 (14, "云盘 SaaS", "平台叠层", "SaaS/PaaS/IaaS 圆柱叠层 + 服务标签", ["platform.disc", "tab"], "disc", "ok"),
 (15, "数智能力体系", "多栏平台", "三中台分栏 + 底座 + 中心竖标", ["layers.band", "board.columns"], "bands", "ok"),
 (16, "云原生生态", "椭圆底座", "大椭圆底座 + 平台带 + 圆周文字", ["layers.band", "arc.fan"], "bands", "part"),
 (17, "安全全景", "中心两翼", "中心 + 左右方案组 + 顶部方案带", ["eco.bracket", "stack.list"], "eco", "ok"),
 (18, "大模型分层", "金字塔/冰山", "多层菱形收窄 + 底座", ["pyramid.levels", "platform.disc"], "—", "part"),
 (19, "组织人事管理", "外环 + 分区", "外环 + 内部虚线分区 + 底部平台带", ["zone", "layers.band", "rail"], "bands", "ok"),
 (20, "智慧金融通用模型", "球体能力", "半球 + 顶部 4 圆 + 多列能力 + 底部圆", ["medallion", "hub.radial", "chip"], "hub", "part"),
 (21, "数据服务", "三段横带", "三条横带 + 中心平台 + 左右资产标签", ["layers.band", "rail", "divider"], "bands", "ok"),
 (22, "中台架构塔", "金字塔", "层层收窄塔身 + 左侧竖标", ["pyramid.levels", "label.aside"], "—", "part"),
 (23, "大模型", "基座 + 三块", "圆柱基座 + 顶部能力标签 + 左中右三块", ["platform.disc", "board.columns"], "disc", "part"),
 (24, "大出行系统", "三层环", "生态/产品/技术三层环 + 右标签", ["hub.radial", "layers.band"], "hub", "part"),
 (25, "VS 对比", "对比", "左右 VS + 底部能力带 + 右策略块", ["card.stat", "layers.band"], "compare", "ok"),
 (26, "安全双翼", "双翼", "中心 + 左右两栏 + 底部标准横条", ["eco.bracket", "stack.list"], "eco", "ok"),
 (27, "数据中台", "圆柱 + 弧标签", "中心圆柱 + 顶部弧形标签 + 底部技术栈", ["platform.disc", "arc.fan", "chip"], "disc", "ok"),
 (28, "企业工作台", "双模平台", "顶部三块 + 稳态/敏态双模 + 平台带", ["layers.band", "tab", "bracket"], "bands", "ok"),
 (29, "城市大脑", "平台 + 闭环", "三平台 + 能力列 + 底部闭环环", ["layers.band", "hub.radial"], "bands", "part"),
 (30, "大数据平台", "分层 + 外围", "中心球 + 四层带 + 左右保障体系", ["layers.band", "hub.radial"], "bands", "part"),
 (31, "指标体系", "三层 + 球", "经营/现场/作业三层 + 左下三球", ["flow.steps", "medallion"], "stack", "part"),
 (32, "顶层架构", "圆环 + 层", "中心圆环 + 上下分层 + 两侧竖标", ["platform.disc", "layers.band"], "disc", "ok"),
 (33, "综合管理服务中心", "辐射 + 射线", "底座 + 四模块 + 密集射线", ["hub.radial", "decor.orbit"], "hub", "ok"),
 (34, "数字会展新基建", "四象限", "中心竖轴 + 四象限 + 底部四块", ["matrix.grid", "dual.hub"], "matrix", "ok"),
 (35, "健康云", "分层", "中心圆 + 平台行 + 感知平台", ["platform.disc", "layers.band"], "disc", "ok"),
 (36, "业务中台", "六边形 + 环绕", "中心六边 + 能力环绕 + 底部四平台", ["hub.radial", "eco.bracket"], "hub", "part"),
 (37, "大模型生态", "漏斗", "倒三角漏斗 + 底座 + 两侧行业", ["pyramid.levels", "platform.disc"], "—", "gap"),
 (38, "贯通能力平台", "六步流程", "顶部四贯通 + 01–06 步骤 + 两侧能力 + 底座", ["flow.steps", "badge.num", "layers.band"], "chevron", "ok"),
 (39, "数据安全体系", "环形 + 分层", "中心 + 多层数据带 + 左右环箭头", ["hub.radial", "decor.orbit"], "hub", "part"),
 (40, "文字云", "词云", "大量文本块堆叠", [], "—", "gap"),
 (41, "分层架构", "横向分层", "表现/应用/能力/数据四层 + 左右箭头", ["layers.band", "flow.chevron"], "bands", "ok"),
 (42, "多维产品架构", "椭圆 + 环标签", "中心椭圆 + 环状产品标签 + 顶部两排特点", ["medallion", "arc.fan"], "hub", "part"),
 (43, "数据库", "左中右链路", "立方 + 分层仓 + 立方 + 底元数据", ["flow.steps", "layers.band"], "lanes", "part"),
 (44, "终端云服务全景图", "多层半环", "同心多层半环 + 密集小标签", ["arc.fan", "decor.orbit"], "—", "gap"),
 (45, "解决方案", "中心辐射 + 外环", "中心平台 + 8 方案 + 顶部四标签", ["hub.radial", "eco.bracket"], "hub", "ok"),
 (46, "安全大脑", "扇区 + 辐射", "中心球 + 扇区式行业带 + 两侧竖注", ["hub.radial", "arc.fan"], "hub", "part"),
 (47, "智能人事", "流程带 + 模块", "顶部双带 + 中间薪酬 + 左右漏斗/列表", ["flow.steps", "layers.band"], "lanes", "ok"),
 (48, "安全合规体系", "山形", "三角形山体 + 分层 + 左右标签", ["pyramid.levels", "eco.bracket"], "—", "part"),
 (49, "攻防演练", "中心三圆", "防/知/查 三圆 + 左右两翼", ["medallion", "eco.bracket"], "hub", "ok"),
 (50, "品牌分销", "左中右链路", "三圆 + 中间阶段流程 + 底部四段", ["dual.hub", "flow.steps"], "eco", "ok"),
 (51, "营销数字化", "横向全链路", "左侧竖排字 + 多列能力 + 右侧垂直流程", ["board.columns", "flow.steps"], "lanes", "ok"),
 (52, "产品与服务体系", "三层体系", "顶部体系 + 中间平台 + 底部核心产品", ["layers.band", "board.columns"], "bands", "ok"),
 (53, "供应链", "中心环 + 能力", "中心圆 + 中心词云 + 6 大能力 + 底数据", ["medallion", "stack.list"], "hub", "ok"),
 (54, "智慧城市", "平台分层", "建筑剪影 + 城市大脑 + 城市云底座", ["layers.band", "platform.disc"], "bands", "ok"),
 (55, "PPT 架构", "左右双环", "左右两个大环 + 中心圆 + 顶部标题", ["dual.hub", "medallion"], "eco", "ok"),
 (56, "平台赋能", "辐射 + 价值", "中心圆 + 左侧四象限 + 右侧价值标签", ["hub.radial", "matrix.grid"], "hub", "ok"),
 (57, "安全分析与管理平台", "功能分层", "三层功能带 + 底部数据组件", ["layers.band", "stack.list"], "bands", "ok"),
 (58, "MES", "中心 + 多层", "中心 + 上方五环 + 下方平台层", ["hub.radial", "platform.disc"], "hub", "ok"),
 (59, "安心平台", "中心 + 双翼", "中心圆 + 左右箭头列 + 底部四提升", ["eco.bracket", "flow.steps"], "eco", "ok"),
 (60, "DTC 用户价值模型", "三圆联动", "左中右三圆 + 三角连线", ["dual.hub", "decor.orbit"], "eco", "ok"),
 (61, "行业物联半环", "半环", "弧形半环 + 大量行业标签 + 底部球", ["arc.fan", "medallion"], "—", "part"),
 (62, "产业协同平台", "同心圆生态", "双环嵌套 + 外环三段", ["medallion", "arc.fan"], "hub", "ok"),
 (63, "品牌变革", "底座架构", "顶部三块 + 平台带 + 数字化底座 + 标签带", ["layers.band", "board.columns"], "bands", "ok"),
 (64, "数据治理", "闭环", "左右圆 + 中心圆 + 上下数据流 + 底部系统群", ["hub.radial", "flow.steps"], "hub", "ok"),
 (65, "经营增长飞轮", "立方飞轮", "中心立方 + 左右扇形 + 顶部培训", ["platform.disc", "arc.fan"], "hub", "part"),
 (66, "企业绩效服务", "双环", "外环九类客户 + 内环服务类目 + 中心", ["arc.fan", "hub.radial"], "hub", "ok"),
 (67, "实训室解决方案", "左右三层", "左侧三层横条 + 右侧三层内容", ["board.columns", "layers.band"], "stack", "ok"),
 (68, "自动化解决方案", "三列", "左 9 能力 + 中心 + 右 9 集成能力", ["board.columns", "hub.radial"], "hub", "ok"),
 (69, "知识产权生态", "生态环", "中心六边 + 外环多段 + 底部标准", ["hub.radial", "eco.bracket"], "hub", "part"),
 (70, "一站式数字化", "双月环", "左右月牙环 + 中间信息对接", ["dual.hub", "arc.fan"], "eco", "part"),
 (71, "品牌推广评估", "分层平台", "多层平台 + 左右侧注 + 底部词云", ["layers.band", "stack.list"], "bands", "ok"),
 (72, "转化流程", "中心 + 四方", "中心六边 + 左右上下资源方 + 底部小词", ["medallion", "flow.steps"], "hub", "ok"),
 (73, "AI 生态平台（3D）", "等距立体", "大量等距立体块 + 中心 +AI", [], "—", "gap"),
 (74, "研发中台", "扇形分层", "扇形分层 + 左右侧注 + 底部平台", ["arc.fan", "layers.band"], "—", "gap"),
 (75, "服务能力全景图", "环", "外环标签 + 内环 + 中心 logo + 左右注释", ["arc.fan", "hub.radial"], "hub", "ok"),
 (76, "官方服务", "双列 + 中心", "左右两条竖列 + 中心圆 + 底部横条", ["board.columns", "medallion"], "eco", "ok"),
 (77, "绿色低碳工业互联网", "云边端", "管理端 + 平台 + 设备端 + 左右标准", ["layers.band", "platform.disc"], "bands", "ok"),
 (78, "延迟营销（蜂窝）", "蜂窝", "中心六边 + 六边环 + 左右标签", [], "—", "gap"),
 (79, "生态元脑", "左右伙伴", "中心 + 左右伙伴 + 上下平台", ["eco.bracket", "hub.radial"], "eco", "ok"),
 (80, "营销闭环", "闭环飞轮", "左右双闭环 + 中心圆 + 四象限", ["flow.steps", "hub.radial"], "hub", "ok"),
]

# v0.3 补齐后：这些页从「部分/缺口」升级为可覆盖
OVERRIDE = {3: "ok", 8: "ok", 37: "ok", 40: "ok", 44: "ok", 61: "ok", 73: "ok", 74: "ok", 78: "ok"}
ATOM_FIX = {
    3: ["ring.system"], 8: ["arc.layers", "hub.radial"], 37: ["funnel.stage"],
    40: ["cloud.text"], 44: ["arc.layers"], 61: ["arc.layers"],
    73: ["iso.platform"], 74: ["sector.band", "arc.layers"], 78: ["honeycomb.cluster"],
}

data = []
SHAPES = {}
_shp = r"D:\DSH-work\guizang-elements\refs\pages80.json"
if os.path.exists(_shp):
    for p in json.load(open(_shp, encoding="utf-8"))["pages"]:
        SHAPES[p["n"]] = p["shapes"]

# 归一后的 14 类逻辑骨架（把逐页描述收敛成可统计的类型）
LOGIC = {
 1:"同心环", 2:"横向链路", 3:"同心环", 4:"左右对称", 5:"中心辐射", 6:"中心辐射", 7:"分层平台",
 8:"半环/多层弧", 9:"中心辐射", 10:"左右对称", 11:"横向链路", 12:"时间轴", 13:"矩阵象限", 14:"分层平台",
 15:"分层平台", 16:"分层平台", 17:"左右对称", 18:"金字塔", 19:"同心环", 20:"中心辐射",
 21:"分层平台", 22:"金字塔", 23:"分层平台", 24:"同心环", 25:"对比", 26:"左右对称", 27:"分层平台",
 28:"分层平台", 29:"分层平台", 30:"分层平台", 31:"分层平台", 32:"分层平台", 33:"中心辐射",
 34:"矩阵象限", 35:"分层平台", 36:"中心辐射", 37:"漏斗", 38:"横向链路", 39:"同心环", 40:"词云",
 41:"分层平台", 42:"同心环", 43:"横向链路", 44:"半环/多层弧", 45:"中心辐射", 46:"中心辐射", 47:"横向链路",
 48:"金字塔", 49:"中心辐射", 50:"横向链路", 51:"横向链路", 52:"分层平台", 53:"同心环", 54:"分层平台",
 55:"左右对称", 56:"中心辐射", 57:"分层平台", 58:"中心辐射", 59:"左右对称", 60:"中心辐射", 61:"半环/多层弧",
 62:"同心环", 63:"分层平台", 64:"中心辐射", 65:"中心辐射", 66:"同心环", 67:"左右对称", 68:"左右对称",
 69:"同心环", 70:"左右对称", 71:"分层平台", 72:"中心辐射", 73:"等距立体", 74:"半环/多层弧", 75:"同心环",
 76:"左右对称", 77:"分层平台", 78:"蜂窝", 79:"左右对称", 80:"中心辐射",
}

for n, topic, logic, motif, atoms, ptype, cov in ROWS:
    data.append({"page": n, "topic": topic, "logic": logic, "logicType": LOGIC.get(n, logic),
                 "motif": motif, "atoms": ATOM_FIX.get(n, atoms), "deckType": ptype,
                 "coverage": OVERRIDE.get(n, cov)})

cov = Counter(d["coverage"] for d in data)
types = Counter(d["deckType"] for d in data)
atomc = Counter(a for d in data for a in d["atoms"])
logic = Counter(d["logicType"] for d in data)

json.dump({"source": "PPT静态逻辑图模板-完整版 蓝色 by 迟迟（80 页）", "pages": data},
          open(OUT_JSON, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

LABEL = {"ok": "✅ 已覆盖", "part": "◐ 部分", "gap": "✗ 缺口"}
lines = []
lines.append("# 模板映射矩阵（80 页 → 图形元素）\n")
lines.append("来源：`PPT静态逻辑图模板-完整版 蓝色 by 迟迟.pptx`（80 页，13.33×7.5in）。")
lines.append("另外 23 份是同一套几何的配色/背景变体（6 色 × PPT/WPS × 白/黑底），几何完全一致，见文末「配色与背景映射」。\n")
lines.append("## 一、怎么读这张表\n")
lines.append("- **逻辑骨架**：这一页在讲什么关系（中心环 / 分层 / 链路 / 对比 / 生态…），决定用哪种页型。")
lines.append("- **主图母题**：画法（同心环、金字塔、漏斗、蜂窝…），决定用哪些原子。")
lines.append("- **映射原子**：元素库里可直接调用的图形原子 id。")
lines.append("- **映射页型**：`gze_deck` 的图纸类型；`—` 表示还没有对应页型。")
lines.append("- **覆盖**：✅ 原子和页型都齐；◐ 原子有但需要组合/缺变体；✗ 素材库里没有这个母题。\n")
lines.append("## 二、逐页映射\n")
lines.append("| 页 | 形状数 | 模板主题 | 逻辑骨架 | 主图母题 | 映射原子 | 页型 | 覆盖 |")
lines.append("|---|---|---|---|---|---|---|---|")
for d in data:
    lines.append("| %02d | %s | %s | %s | %s | %s | %s | %s |" % (
        d["page"], SHAPES.get(d["page"], "—"), d["topic"], d["logicType"], d["motif"],
        "、".join("`%s`" % a for a in d["atoms"]) or "—",
        ("`%s`" % d["deckType"]) if d["deckType"] != "—" else "—",
        LABEL[d["coverage"]]))
lines.append("")
lines.append("## 三、逻辑类型 → 图纸（14 类）\n")
lines.append("80 页先归成 **14 类逻辑骨架**，再落到页型与原子上。这一层是「重新梳理逻辑」的核心：看到一页新图，先判断它属于哪类关系，再选图纸。\n")
lines.append("| 逻辑类型 | 页数 | 代表页 | 推荐页型 | 推荐原子 | 判断依据 |")
lines.append("|---|---|---|---|---|---|")
LOGIC_TABLE = [
 ("同心环", ["hub", "disc"], ["medallion", "arc.fan", "decor.orbit"], "中心 + 一圈或几圈，外圈有环状标签"),
 ("中心辐射", ["hub"], ["hub.radial", "medallion", "chip"], "一个中心向四周发散，节点不等距"),
 ("分层平台", ["disc", "bands"], ["platform.disc", "layers.band"], "自下而上叠层（底座→中台→应用）"),
 ("左右对称", ["eco"], ["eco.bracket", "dual.hub", "bracket"], "左右两翼夹一个中心，或并列两栏"),
 ("横向链路", ["lanes", "chevron"], ["flow.steps", "flow.chevron", "board.columns"], "从左到右的流程/数据流，有先后"),
 ("矩阵象限", ["matrix"], ["matrix.grid", "zone"], "两维交叉，2×2 ~ 3×3"),
 ("金字塔", ["（缺）"], ["pyramid.levels"], "层级收紧，越往上越少"),
 ("对比", ["compare"], ["card.stat", "layers.band"], "两种做法/两个状态并列"),
 ("时间轴", ["timeline"], ["timeline", "platform.disc"], "按时间/阶段推进"),
 ("漏斗", ["（缺）"], ["待建 funnel.stage"], "逐层筛减，越往下越窄"),
 ("蜂窝", ["（缺）"], ["待建 honeycomb.cluster"], "六边形平铺成网"),
 ("等距立体", ["（缺）"], ["待建 iso.platform"], "2.5D 立体块堆叠"),
 ("词云", ["（缺）"], ["待建 cloud.text"], "只有词，没有结构线"),
 ("半环/多层弧", ["（缺）"], ["待建 arc.layers"], "3 层以上的同心弧段"),
]
REP = {"同心环": "01、03、24、53、66", "中心辐射": "09、20、45、56、72", "分层平台": "14、27、41、54、63",
       "左右对称": "04、17、26、59、79", "横向链路": "02、11、38、50、51", "矩阵象限": "13、34",
       "金字塔": "18、22、48", "对比": "25", "时间轴": "12", "漏斗": "37", "蜂窝": "78",
       "等距立体": "73", "词云": "40", "半环/多层弧": "08、44、61、74"}
for name, ptypes, atoms, hint in LOGIC_TABLE:
    lines.append("| **%s** | %d | %s | %s | %s | %s |" % (
        name, logic.get(name, 0), REP[name],
        " / ".join("`%s`" % x for x in ptypes),
        "、".join("`%s`" % a for a in atoms), hint))
lines.append("")
lines.append("## 四、统计\n")
lines.append("**覆盖**：✅ %d 页 / ◐ %d 页 / ✗ %d 页（共 %d 页）\n" % (cov["ok"], cov["part"], cov["gap"], len(data)))
lines.append("**按页型**：" + "、".join("%s %d 页" % (k, v) for k, v in types.most_common()) + "\n")
lines.append("**原子使用频次**：" + "、".join("`%s` %d" % (k, v) for k, v in atomc.most_common()) + "\n")
lines.append("**逻辑骨架分布**：" + "、".join("%s %d" % (k, v) for k, v in logic.most_common()) + "\n")
lines.append("## 五、缺口：已补齐与仍缺\n")
lines.append("v0.3 新增 7 个原子，把 6 个「没有母题」的页面补成了可出图：\n")
lines.append("| 已补母题 | 原出现页 | 新增原子 | 状态 |")
lines.append("|---|---|---|---|")
lines.append("| 环形体系（同心扇区 + 维恩 + 光环节点 + 弧形字） | 3 | `ring.system` | ✅ 可出图 |")
lines.append("| 漏斗 / 倒三角 | 37 | `funnel.stage` | ✅ 可出图 |")
lines.append("| 词云 / 文本块阵 | 40、71 | `cloud.text` | ✅ 可出图 |")
lines.append("| 多层同心弧 | 8、44、61 | `arc.layers` | ✅ 可出图 |")
lines.append("| 扇形分层 | 74 | `sector.band` | ✅ 可出图 |")
lines.append("| 蜂窝六边形集群 | 78 | `honeycomb.cluster` | ✅ 可出图 |")
lines.append("| 等距立体平台 | 73 | `iso.platform` | ✅ 可出图 |")
lines.append("")
lines.append("**仍缺**（下一批）：\n")
lines.append("| 仍缺母题 | 出现页 | 建议原子 | 说明 |")
lines.append("|---|---|---|---|")
lines.append("| 扇区底座 | 46、54 | `base.sector` | 行业扇区与底座结合 |")
lines.append("| 球体 / 半球 | 20、30、46 | `sphere.dome` | 行业模型、能力球 |")
lines.append("| 立体圆柱（带阶段） | 12、23、27 | `disc.stack` | 现有 platform.disc 的扩展 |")
lines.append("| 金字塔 / 冰山（页型） | 18、22、48 | 页型 `pyramid` | 原子有，缺整页图纸 |")
lines.append("| 暗色主题 | 黑色背景 12 份 | 暗色调色板 | 目前只能靠 bg 覆盖 |")
lines.append("")
lines.append("## 六、配色与背景映射（另外 23 份模板）\n")
lines.append("| 维度 | 取值 | 对应 |")
lines.append("|---|---|---|")
lines.append("| 主色 | 橙 `#FF891D` / 红 `#F5483B` / 蓝 `#1E63E9` / 绿 `#3DA802` / 青 `#16B694` / 紫 `#A93BF5` | `palette` 参数 6 选 1 |")
lines.append("| 背景 | 白色 / 黑色 | 白色为默认；黑色背景需要 `bg` 覆盖 + 文字反色（未实现） |")
lines.append("| 宿主 | PowerPoint / WPS | 几何一致，仅字体度量差异 |")
lines.append("")
lines.append("> 结论：24 份文件 = 1 套几何 × 6 主色 × 2 背景 × 2 宿主。**学一次几何，配色用参数**；黑色背景是唯一尚未支持的维度。")
open(OUT_MD, "w", encoding="utf-8").write("\n".join(lines))
print("pages", len(data), dict(cov), "->", OUT_JSON, OUT_MD)



