// skill 提供方：把插件自带的 skills/<name>/SKILL.md 注册进 DSH
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const RANK = 600;
const INVOCATION = { modelInvocable: true, userInvocable: true };

function parse(file) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return null;
  const field = (k) => (m[1].match(new RegExp(`^${k}:\\s*(.+)$`, 'm')) || [])[1]?.trim().replace(/^(["'])(.*)\1$/, '$2');
  const name = field('name'), description = field('description');
  return name && description ? { name, description, body: text.slice(m[0].length) } : null;
}

function readSkills(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(dir, d.name, 'SKILL.md')))
    .map((d) => ({ dir: join(dir, d.name), file: join(dir, d.name, 'SKILL.md'), ...parse(join(dir, d.name, 'SKILL.md')) }))
    .filter((s) => s.name);
}

export function createSkillProvider(dir) {
  const candidate = (s) => ({
    name: s.name, description: s.description, path: s.file,
    invocation: INVOCATION, source: 'bundled', provider: 'guizang-elements', rank: RANK, locator: s.dir,
    resourceBase: { kind: 'directory', path: s.dir },
  });
  return {
    name: 'guizang-elements',
    async list() {
      return readSkills(dir).map(candidate);
    },
    async get(c) {
      const s = readSkills(dir).find((x) => x.dir === c.locator && x.name === c.name);
      if (!s) return undefined;
      const content = s.body.replaceAll('<SKILL_ROOT>', s.dir);
      const { rank, locator, ...summary } = candidate(s);
      return { ...summary, content };
    },
  };
}
