# miniapp 图片素材审计

审计范围：miniapp/src/static/images。未删除任何用户 Logo 或原始图片。

| 文件名 | 尺寸 | 文件大小 | 实际用途 | 被哪些页面/组件引用 | 重复使用 | 卡通占位图 |
|---|---:|---:|---|---|---|---|
| brand/logo-full.png | 900×733 | 951.5 KB | 完整品牌Logo（个人中心） | miniapp/src/pages/profile/index.vue | 否 | 否 |
| brand/logo-mark.png | 320×320 | 156.1 KB | 品牌标记（品牌栏、店铺卡等） | miniapp/src/components/brand-header/Index.vue<br>miniapp/src/components/home-redesign/Index.vue<br>miniapp/src/pages/orders/index.vue<br>miniapp/src/pages/profile/index.vue | 是 | 否 |
| brand/logo-original.jpg | 1390×1132 | 586.7 KB | 用户提供的原始Logo（受保护、未引用） | 未引用 | 否 | 否 |
| camp/campus-hero.jpg | 1200×800 | 287.9 KB | 首页校园主视觉 | miniapp/src/components/home-redesign/Index.vue<br>miniapp/src/pages/packages/index.vue | 是 | 否 |
| campus/campus-neutral.svg | 1200×760 | 0.8 KB | 早期校园卡通占位图（首页未引用） | 未引用 | 否 | 是 |
| graduation/graduation-neutral.svg | 1200×760 | 0.7 KB | 早期毕业卡通占位图（首页未引用） | 未引用 | 否 | 是 |
| home/campus-follow-shoot.jpg | 1200×900 | 193.5 KB | 校园跟拍套餐 | miniapp/src/components/home-redesign/Index.vue | 否 | 否 |
| home/campus-tree-shade.jpg | 1200×900 | 277.1 KB | 主视觉树荫照片 | miniapp/src/components/home-redesign/Index.vue | 否 | 否 |
| home/class-group.jpg | 1200×675 | 180.8 KB | 班级集体照套餐 | miniapp/src/components/home-redesign/Index.vue | 否 | 否 |
| home/dorm-group.jpg | 1200×900 | 153.6 KB | 宿舍多人合照套餐 | miniapp/src/components/home-redesign/Index.vue | 否 | 否 |
| home/graduation-portrait-female.jpg | 800×1000 | 120.9 KB | 毕业写真服务入口 | 未引用 | 否 | 否 |
| home/graduation-portrait-male.jpg | 800×1000 | 98.6 KB | 单人毕业写真套餐 | miniapp/src/components/home-redesign/Index.vue | 否 | 否 |
| home/id-photo-female-secondary.jpg | 800×1067 | 68.3 KB | 学生证件照套餐女性样片 | miniapp/src/components/home-redesign/Index.vue | 否 | 否 |
| home/id-photo-male.jpg | 800×1067 | 57.4 KB | 学生证件照套餐男性样片 | 未引用 | 否 | 否 |
| home/photo-wall.jpg | 1200×900 | 239.5 KB | 主视觉与纸质作品展示 | miniapp/src/components/home-redesign/Index.vue | 否 | 否 |
| home/photographer-at-work.jpg | 1200×900 | 147.5 KB | 校园跟拍服务入口 | miniapp/src/components/home-redesign/Index.vue | 否 | 否 |
| id-photo/id-photo-neutral.svg | 800×1000 | 0.5 KB | 早期证件照卡通占位图（首页未引用） | 未引用 | 否 | 是 |
| id-photo/id-photo-sample.jpg | 600×800 | 76.1 KB | 证件照服务入口 | miniapp/src/pages/order-detail/index.vue<br>miniapp/src/pages/photo-specs/index.vue | 是 | 否 |
| packages/package-neutral.svg | 1200×760 | 0.6 KB | 早期套餐卡通占位图（首页未引用） | 未引用 | 否 | 是 |
| placeholders/empty-neutral.svg | 800×520 | 0.4 KB | 空状态扁平占位图（首页未引用） | 未引用 | 否 | 是 |
| printing/printing-hero.jpg | 1200×800 | 257.8 KB | 在线冲印服务入口 | miniapp/src/components/home-redesign/Index.vue<br>miniapp/src/pages/printing/index.vue | 是 | 否 |
| printing/printing-neutral.svg | 1200×760 | 0.7 KB | 早期冲印卡通占位图（首页未引用） | 未引用 | 否 | 是 |

## 文件级重复检查

未发现内容完全相同的图片文件。

说明：`重复使用` 按被多个页面或组件引用判断；素材清单中的登记不计为页面引用。早期 SVG 卡通占位图仍保留但首页不再使用。