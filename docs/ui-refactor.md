> 最新方案：已改为 46 张生成插画，直接叠字且取消主题切换。详见 [插画说明](illustrations.md)。以下内容包含历史实现记录。

# 界面重构与背景加载

2026-11-25：保留诗意排版，采用 shadcn/ui 官方 new-york-v4 Radix 组件源码（button、select、dialog、switch、slider、input、label），主要布局和样式迁移至 Tailwind CSS v4。components.json 和路径别名支持后续组件添加。原始组件来源：https://github.com/shadcn-ui/ui/tree/main/apps/v4/registry/new-york-v4/ui ，MIT 授权。

文字、日期、导航使用独立的94%不透明阅读底色，浅深主题均受保护，用户调整照片遮罩不会取消文字保护。海报独立使用浅色遮罩和深色字。

背景加载：本地原有插画立即占位，低清同ID预览、高清 decode 完成后淡入；请求按日期失效保护，避免旧请求覆盖新日期。18秒超时或请求失败降级；相邻日期延后预加载。尊重减少动态偏好。

Picsum全年365个固定ID链接，来源和作者记录于数据；不新增项目图片文件。自然意象匹配不等于照片拍摄季节或中国节日实景。
