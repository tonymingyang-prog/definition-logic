# 上传到 GitHub（本机还没有 git，先装再传）

> 现状：这台机器**没有安装 git / gh**（`~/.gitconfig` 只有 `safe.directory`，`~/.ssh` 存在但没有配置远程仓库）。
> 所以这次只把仓库**整理成可直接上传的状态**，最后一步需要你装一次 Git 或授权。

## 一、先装 Git（二选一）

```powershell
# 方式 A：winget（推荐）
winget install --id Git.Git -e --source winget

# 方式 B：官网安装包
# https://git-scm.com/download/win
```

装完重开一个终端，确认：

```powershell
git --version
```

## 二、首次身份配置（只需一次）

```powershell
git config --global user.name  "你的名字"
git config --global user.email "你的邮箱"
```

## 三、在插件目录建仓并提交

```powershell
cd D:\DSH-work\plugins\dsh-guizang-elements
git init -b main
git add .
git commit -m "feat: 图形元素库 v0.2（35 原子 / 15 图纸 / 80 页模板映射）"
```

`.gitignore` 已经排除 `node_modules/`、`out/`、`refs/`、渲染产物等，提交体积只有几百 KB（代码 + 文档 + 映射 + 示例）。

## 四、在 GitHub 建仓并推送

1. 打开 https://github.com/new ，仓库名建议 `graphic-elements`，**不要**勾选初始化 README（本地已有）。
2. 复制仓库地址，然后：

```powershell
git remote add origin https://github.com/<你的账号>/graphic-elements.git
git push -u origin main
```

用 SSH 的话：

```powershell
ssh-keygen -t ed25519 -C "你的邮箱"     # 一路回车
# 把 ~/.ssh/id_ed25519.pub 的内容贴到 https://github.com/settings/keys
git remote add origin git@github.com:<你的账号>/graphic-elements.git
git push -u origin main
```

## 五、仓库设置建议

| 项 | 建议 |
|---|---|
| Description | `可参数化的 PPT 图形元素库：35 个原子 / 15 种图纸 / 可编辑 PPTX + SVG` |
| Topics | `pptx` `powerpoint` `svg` `design-system` `dsh-plugin` `graphic-elements` |
| License | MIT（已放 `LICENSE`） |
| Branch | `main` |
| 大文件 | 不要提交 `out/` 与 `refs/`（已忽略）；示例成品放 `examples/` |

## 六、后续更新

```powershell
git add -A
git commit -m "feat: 新增 funnel.stage 原子"
git push
```

## 七、如果只想打包不上传

```powershell
# 生成一个可拷贝的压缩包（排除 out/refs/node_modules）
Compress-Archive -Path lib,data,docs,mapping,examples,skills,gallery,py,package.json,README.md,LICENSE,SKILL.md -DestinationPath D:\DSH-work\graphic-elements.zip -Force
```

## 八、需要我代做的话

如果你愿意在 DSH 里装好 Git 并配好远程地址，我可以直接执行 `git init / add / commit / push`，并把提交记录、仓库链接回给你。
