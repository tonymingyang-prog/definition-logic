import { TOOLS } from "file:///D:/DSH-work/plugins/dsh-guizang-elements/lib/tools.js";
import { DECK_SPEC } from "file:///D:/DSH-work/plugins/dsh-guizang-elements/work/deck-spec.mjs";
const deck = TOOLS.find(t => t.name === "gze_deck");
const r = await deck.execute({ spec: JSON.stringify(DECK_SPEC), outDir: "C:/Users/TONY/Desktop/POC 案例库/gz-elements/out/tech-architecture", name: "技术架构-2025", formats: "pptx,svgs" });
console.log(JSON.stringify({ ok: r.ok, pages: r.pages, issues: r.issues, files: r.files.length, first: r.files[0] }));
