const TOKEN = process.env.GH_TOKEN;
const OWNER = 'tonymingyang-prog';
const REPO = 'definition-logic';
const PATH = '.github/workflows/check.yml';

const content = `name: check
on:
  push:
    branches: [main]
  pull_request:
jobs:
  self-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: self check
        run: node tools/self-check.mjs
      - name: syntax check
        run: for f in lib/*.js work/*.mjs tools/*.mjs; do node --check "$f"; done
`;

const body = {
  message: 'ci: 添加模块自检工作流',
  content: Buffer.from(content, 'utf8').toString('base64'),
  branch: 'main',
};

const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'dsh-agent',
  },
  body: JSON.stringify(body),
});
const text = await r.text();
console.log('status', r.status);
console.log(text.slice(0, 400));
