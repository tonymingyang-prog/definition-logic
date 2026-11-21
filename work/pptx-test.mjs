import { figure, PRESETS } from "file:///D:/DSH-work/plugins/dsh-guizang-elements/lib/compose.js";
import { sceneToPptx } from "file:///D:/DSH-work/plugins/dsh-guizang-elements/lib/scene-pptx.js";
import { writeFileSync } from "node:fs";
const p = PRESETS["platform-overview"];
const s = figure({ w: p.w, h: p.h, palette: p.palette, blocks: p.blocks });
const out = "D:/DSH-work/plugins/dsh-guizang-elements/work/preset1.pptx";
console.log(sceneToPptx(s, out).log);
