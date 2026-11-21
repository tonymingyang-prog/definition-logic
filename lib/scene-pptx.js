// 场景 → PPTX：交给 python-pptx 生成原生形状（可编辑）
import { spawnSync } from 'node:child_process';
import { writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, '..', 'py', 'render_pptx.py');
let cachedPython = null;

function pythonCandidates() {
  const list = [];
  if (process.env.GZE_PYTHON) list.push(process.env.GZE_PYTHON);
  const home = homedir();
  list.push(join(home, '.dsh-fresh', 'dsh-runtimes', 'dsh-primary-runtime', 'dependencies', 'python', 'python.exe'));
  list.push(join(home, '.dsh-fresh', 'dsh-runtimes', 'dsh-primary-runtime', 'dependencies', 'python', 'bin', 'python3'));
  list.push(join(home, '.dsh', 'runtimes', 'dsh-primary-runtime', 'dependencies', 'python', 'python.exe'));
  list.push('python.exe');
  list.push('python3');
  list.push('python');
  return list;
}

export function resolvePython() {
  if (cachedPython) return cachedPython;
  for (const exe of pythonCandidates()) {
    if (exe.includes('/') || exe.includes('\\')) {
      if (!existsSync(exe)) continue;
    }
    const r = spawnSync(exe, ['-c', 'import pptx, sys; sys.stdout.write("ok")'], { encoding: 'utf8', timeout: 20000 });
    if (r.status === 0 && (r.stdout || '').includes('ok')) {
      cachedPython = exe;
      return exe;
    }
  }
  throw new Error('找不到可用的 Python（需 python-pptx）。可设置环境变量 GZE_PYTHON 指向解释器。');
}

export function sceneToPptx(scene, outPath) {
  return run({ ...scene }, outPath);
}

// 多页：scenes 依次成为每一页（共用第一页的画布尺寸）
export function scenesToPptx(scenes, outPath) {
  if (!Array.isArray(scenes) || !scenes.length) throw new Error('scenes 不能为空');
  return run({ ...scenes[0], slides: scenes }, outPath);
}

function run(payload, outPath) {
  const py = resolvePython();
  const dir = mkdtempSync(join(tmpdir(), 'gze-'));
  const scenePath = join(dir, 'scene.json');
  writeFileSync(scenePath, JSON.stringify(payload), 'utf8');
  const r = spawnSync(py, [SCRIPT, scenePath, outPath], { encoding: 'utf8', timeout: 120000 });
  if (r.status !== 0) {
    throw new Error(`PPTX 生成失败：${(r.stderr || r.stdout || '').slice(-800)}`);
  }
  const count = payload.slides ? payload.slides.length : 1;
  return { path: outPath, items: count, log: (r.stdout || '').trim() };
}
