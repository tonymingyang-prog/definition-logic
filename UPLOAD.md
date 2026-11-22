# 仓库与上传

仓库地址：**https://github.com/tonymingyang-prog/definition-logic**（私有）

- 默认分支：`main`
- 首次提交：`430db05` — `feat: 定义逻辑图 v0.2（35 原子 / 15 图纸 / 80 页模板映射）`
- 账号：`tonymingyang-prog`（gh OAuth 登录，token scopes：`repo`、`read:org`、`gist`）
- Topics：`pptx` `powerpoint` `svg` `design-system` `dsh-plugin` `definition-logic`

## 这台机器的特殊情况

沙箱里 PowerShell / curl 走 Schannel 会报 `SEC_E_NO_CREDENTIALS`，所以：

| 项 | 做法 |
|---|---|
| git | 不装系统，用便携版 **MinGit 2.56.1** → `D:\DSH-work\tools\git\cmd\git.exe` |
| TLS | git 必须加 `-c http.sslBackend=openssl`（默认走 schannel 会失败） |
| 认证 | `gh` 便携版 + OAuth 设备码登录，token 存 `D:\DSH-work\tools\gh-config` |
| 推送 | 用一次性 `http.extraheader`，token 不写进 `.git/config` |

## 日常更新（已封装）

```powershell
D:\DSH-work\tools\push.ps1                # 提交全部改动并推送
D:\DSH-work\tools\push.ps1 "feat: 新增漏斗原子"
```

脚本会：取 token → `git add -A` → commit → 用 openssl 后端 + 一次性 header 推送。

## 手动等价命令

```powershell
$env:GH_CONFIG_DIR = "D:\DSH-work\tools\gh-config"
$gh  = "D:\DSH-work\tools\gh\bin\gh.exe"
$git = "D:\DSH-work\tools\git\cmd\git.exe"
$tok = (& $gh auth token).Trim()
$hdr = "AUTHORIZATION: basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("x-access-token:$tok"))

cd D:\DSH-work\plugins\dsh-guizang-elements
& $git add -A
& $git commit -m "feat: xxx"
& $git -c http.sslBackend=openssl -c "http.https://github.com/.extraheader=$hdr" push -u origin main
```

## 换一台机器 / 别人接手

```powershell
winget install --id Git.Git -e
git clone https://github.com/tonymingyang-prog/definition-logic.git
cd definition-logic
# DSH 里：install_bundle target = link:<此目录绝对路径>
```

## 以后想转公开

```powershell
gh repo edit tonymingyang-prog/definition-logic --visibility public --accept-visibility-change-consequences
```

注意：转公开后 `docs/` 里的模板映射与元素几何都会对外可见。
