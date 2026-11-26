# 岁时有诗 Implementation Plan

**Goal:** 实现完整 2027 诗词日历静态应用。
**Architecture:** 本地 JSON 按日期索引，React 管理选择状态，localStorage 保存偏好与收藏；图片本地托管，日期以北京时间为准。
**Tech Stack:** React / TypeScript / Vite / Tailwind CSS / pnpm。
**Spec:** docs/requirements.md

## Global Constraints

365 天连续且摘录不重复；作品真实；不伪造图片来源；仅 2027 年；GitHub Pages 静态部署。

## Review Focus

跨北京时间零点和后台恢复；非法 query 日期；损坏本地存储；图片加载失败；移动端溢出及导出比例。

## Tasks

- [ ] 配置 package.json、Vite、严格类型检查、ESLint、Prettier 和 CI。
- [ ] 整理 src/data/calendar/2027.json，建立类型及 scripts 校验；验证日期连续、农历节气和诗词完整性。
- [ ] 完成独立日期测试，验证北京时间、范围限制及导航，再实现日期工具。
- [ ] 实现沉浸首页、日历、收藏、设置、分享和 PNG 海报，保留图片来源和降级状态。
- [ ] 核对桌面及手机布局、键盘操作、动画关闭与持久化。
- [ ] 执行 lint、format:check、typecheck、test、validate:data、validate:images、build，修复失败并记录内容限制。
- [ ] 完成 README 与 Pages 工作流。
