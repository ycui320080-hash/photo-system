# 校园照相馆微信服务系统

项目位置：D:\夏洁校内照相馆系统。Windows 本地可运行的 Mock 版本，包含 Uni-app 顾客端、Electron/Vue 管理端、SQLite 本地服务以及独立 CloudBase 云函数。当前未配置微信 AppID / 云环境，不连接真实微信账号、不收款。可双击 start.cmd 启动三项本地服务；服务启动后可双击 start-desktop.cmd 打开桌面窗口。完整原始需求见 docs/original-requirements.txt；已验证范围与剩余工作见 docs/verification.md。

## 快速启动

环境：Node.js 24.14.0、npm 11.9.0、Git 2.54.0。PowerShell 中使用 npm.cmd，避免系统执行策略阻止 npm.ps1。无需更改执行策略。

```powershell
cd D:\夏洁校内照相馆系统
npm.cmd install
npm.cmd run dev
```

- 管理端：http://127.0.0.1:5173
- 顾客端 H5：http://127.0.0.1:5174
- 本地 API：http://127.0.0.1:8787/health

Mock 测试账号固定为 admin / 123456，登录页会直接提示并支持记住登录状态；生产模式不会创建该测试账号。顾客端自动进入固定 Mock 用户“演示同学”，演示手机号使用 00000000000。请不要输入真实学生资料。

如果端口被占用，先关闭已经启动的本项目进程，勿结束不明进程。三个进程也可分别使用 npm.cmd run dev:api、npm.cmd run dev:admin、npm.cmd run dev:mini 启动。

## UI 改版说明

顾客端采用校园胶片摄影与青春杂志风格，包含证件照、在线冲印、毕业写真、校园跟拍、学生福利、毕业季套餐、订单进度和个人中心；底部导航为首页、冲印、套餐、订单、我的。管理端使用奶油白与砖红色品牌主题，侧边栏覆盖工作台、预约日历、订单、套餐、照片、选片、打印、交付、顾客、统计和设置。图片均集中在 assets 目录，当前为中性占位素材并标注“待替换校园实拍”。

## Electron 桌面窗口

```powershell
npm.cmd run build -w desktop-admin
# 另一个终端保持 npm.cmd run dev:api 运行
npm.cmd run electron -w desktop-admin
```

照片导入页的“从电脑导入并保存原图索引”通过系统文件选择器读取照片；SQLite 只记录路径和预览编号。浏览器预览只能上传照片副本，受浏览器限制无法获取原图完整路径。Electron 使用 contextIsolation、sandbox、关闭 nodeIntegration，仅暴露专用导入接口。上传队列在系统设置查看并重试；默认目录由系统选择器设置。launch.cjs 只在子进程移除 ELECTRON_RUN_AS_NODE，避免宿主环境使 Electron 退化为 Node 模式。

## 验证命令

```powershell
npm.cmd run check
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run build:mp
npm.cmd run electron -w desktop-admin -- --smoke-test
npm.cmd run prepare:cloud
```

测试在 .data/test-* 创建独立 SQLite 数据库和图片，不改动演示订单。默认使用8790端口，测试结束关闭子进程。测试图片由 sharp 生成纯色图，不含真人照片。

## 演示一条完整订单

1. 顾客端点击快速预约，选择未来日期和时段，使用演示姓名、11个0的手机号提交。
2. 管理端登录后在工作台及订单管理看到相同订单。状态依次推进：待确认 → 待到店 → 已拍摄 → 待上传预览图。
3. 照片导入选择订单并上传 JPG、PNG、WebP（每批20张、单张10MB）；服务生成水印预览和缩略图，订单进入待选片。
4. 顾客端我的订单进入选片，选择套餐包含数量内的照片并填写修图要求。二次确认后锁定并进入修图中。
5. 管理端查看选片结果、导出清单或重新开放；在交付页上传精修图后进入待顾客确认。
6. 顾客可提一次意见或确认成片，并在有效期内保存。确认后进入待打印；管理端标记打印完成、取件完成。
7. 在订单详情以“分”登记累计收款，工作台和统计页汇总数据库订单及收款记录。未收取费用时营业额为0。

在线冲印支持尺寸、份数、相纸、塑封和取件日期；浏览器一次最多20张，当前微信 Mock 上传接口每次1张。第一版不控制打印机，不接微信支付。

## 项目目录

- miniapp/src/pages：9个独立顾客业务页面；components、services、composables 分层。
- desktop-admin/src/modules：12个管理模块；electron 为系统文件选择及本地索引。
- shared：共享类型、订单常量、规格演示数据、校验与格式化。
- server：仅本机监听的 Mock API；services 按预约、订单和统计拆分。
- cloudfunctions：17个需求云函数、辅助业务函数及独立desktop-*云入口；common 为复用源码，各部署目录由脚本复制运行依赖。
- docs：数据库、部署、验证、原始需求及依赖审计。

金额存整数分，时间存 UTC ISO 字符串，展示按中国时区。演示规格明确标注以当次官方报名通知为准。

## 数据备份与恢复

数据库在 .data/studio.sqlite；图片副本在 .data/files；Electron路径索引在 .data/electron/local-index.sqlite。备份前关闭本项目API和Electron，再将整个 .data 复制到你选择的备份位置，包含 SQLite WAL/SHM 文件（如仍存在）。本地原图位于用户原目录，需单独备份。

测试管理员可在系统设置导出 JSON 数据备份。恢复前显示具体文件名、记录数量并二次确认；同ID记录合并覆盖，恢复前自动将旧数据库记录存入 backups 集合。JSON不包含照片字节、桌面索引或随机会话。完整文件恢复应停止服务后，由用户核对目标路径再替换 .data；本程序不自动覆盖原图目录。备份含隐私信息，应保存在受访问控制的位置。

照片默认7天过期。到期立即禁止新下载；清理仅针对已完成/已取消订单的过期副本，要求确认具体文件ID，不删除本地原图。订单、收款不提供直接删除接口。

## 微信及云端

见 docs/wechat-import.md、docs/cloudbase-setup.md。没有真实环境时使用 Mock 即可。CloudBase部分已有独立处理器及基础数据适配，已补齐桌面云身份适配、云文件接口和持久化上传重试队列，但尚未完成真实云端部署与全流程验收，不能直接用于生产。环境变量示例在根目录和两端 .env.example；真实配置不得提交 Git。
