# 岁时有诗 · Poetic Days

## 许可证

本项目代码采用 [MIT License](LICENSE)，Copyright (c) 2026 typeofnan。第三方依赖及素材遵循各自的许可证，保留其原有版权与来源声明。

一日一诗，四季皆景。2027 年静态诗词日历，采用 React、TypeScript、Vite、Tailwind CSS 和 pnpm。无服务器、登录或数据库；收藏与偏好保存在当前浏览器。

## 本地运行

安装 Node.js 22 和 pnpm 10.13.0：

```sh
pnpm install --frozen-lockfile
pnpm dev
```

打开终端显示的本地地址。生产预览使用 `pnpm build` 后执行 `pnpm preview`。

## 检查

```sh
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm validate:data
pnpm validate:images
pnpm build
```

`pnpm format` 统一格式；`pnpm lint:fix` 修复可自动修复的问题。全年数据位于 `src/data/calendar/2027.json`，类型、来源和校验逻辑随源码维护。修改诗词时必须同步核对全文、摘录、作者、朝代及来源，不可使用虚构诗词补齐记录。

## 日期与隐私

日期以北京时间计算，仅允许访问 2027 年。真实日期早于范围时展示元旦，晚于范围时展示年末。链接使用 `?date=2027-05-20`，静态部署刷新无需服务端路由。收藏和设置仅保存在设备本地，清除网站数据会删除这些记录。

## GitHub Pages

1. 将仓库推送到 GitHub，默认分支设为 `main`。
2. 进入 **Settings → Pages → Build and deployment**，Source 选择 **GitHub Actions**。
3. 推送 `main` 或在 Actions 手动运行工作流。PR 仅检查及构建，不会部署。
4. 所有检查成功后，官方 Pages Actions 上传并部署 `dist`。访问部署任务返回的 URL。

GitHub Actions 已设置 `VITE_BASE_PATH=2027-poetry-calendar`，构建时自动规范为 `/2027-poetry-calendar/`。本地复现：

```sh
VITE_BASE_PATH=2027-poetry-calendar pnpm build
```

## Cloudflare

构建命令为 `pnpm build`，静态产物目录为 `dist`，构建环境变量设置 `VITE_BASE_PATH=/`。本地复现：

```sh
VITE_BASE_PATH=/ pnpm build
```

未设置时默认使用 `/`。配置同时支持平台环境变量和 `.env` 文件，平台环境变量优先。两平台分别构建，不能直接共用同一份带固定前缀的 `dist`。脚本、样式、图标、插画及首页链接使用同一个基础路径；外部图床地址不受影响。

自定义域名：在 Pages 设置填写域名并按 GitHub 指引配置 DNS；需要时添加 `public/CNAME`，内容为实际域名。启用 HTTPS。当前源码不假设正式域名，因此 `sitemap.xml` 保留空索引；上线时填入真实绝对 URL，同时为 robots.txt 添加 Sitemap 地址，并补充 Open Graph 的正式站点 URL/预览图，不能使用示例域名冒充线上地址。

## 内容与图片

古典作品应核查公共领域状态；现代整理本与注释可能具有独立权利。翻译与赏析的来源、编辑状态应以数据来源文档为准。图片信息记录在各日 `background` 字段。缺少合适图片时使用明确标记的本地降级图，不能将降级资源宣称为已逐日完成的正式插画。

浏览器下载海报依赖 Canvas 与本地资源；原生分享及全屏依赖浏览器支持。静态站点无需付费 AI 接口。
