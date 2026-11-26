# 生成插画与图床配置

当前使用 46 张统一的浅色中国水墨插画：12 个月份、24 节气，以及元旦、腊八、除夕、春节、元宵、龙头节、端午、七夕、中秋、重阳。清明使用同名节气图。节日优先于节气，节气优先于月份；七夕与立秋、重阳与寒露重叠时使用节日图。

原有五张插画保留在 public/backgrounds，作为加载失败的备用背景。新素材位于 public/illustrations，每张配有小尺寸 preview 文件，用于渐进加载。没有配置图床，目前使用本地地址，不代表已经上传。

将 public/illustrations 内所有文件上传至同一图床目录（保留文件名），复制 .env.example 为 .env.local，设置 VITE_ILLUSTRATION_BASE_URL 为该目录的 HTTPS 地址，然后重新构建。图床应允许公开访问；如需要导出海报，还需允许跨域图片读取。该环境变量是公开地址，不应包含密钥。

output/illustrations-upload.zip 是待上传素材包。src/data/illustrations.json 是素材清单；scripts/generate-calendar.ts 使用同一优先级规则生成日历数据。之前 Picsum 资料仅留作历史，不再用于当前页面。

页面固定使用浅宣纸与深墨文字，移除明暗主题选项，诗句直接展示在插画上。全文朗读使用设备浏览器的中文语音，支持开始、重新朗读、暂停、继续与停止，关闭全文后停止；语音质量和暂停能力依赖设备。

图片文件名统一使用 ASCII；节气采用无声调拼音，如 term-qingming.webp、term-dongzhi.webp，预览图对应添加 -preview 后缀。
