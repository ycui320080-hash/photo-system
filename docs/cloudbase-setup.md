# CloudBase 配置与部署

默认保持 Mock，未填写或编造任何微信AppID、环境ID、商户号。本次已编写云端处理器和两端适配，但没有真实环境，因此云端身份、存储规则、事务并发与真机联调尚未执行。

## 1. 准备数据

按 database-design.md 创建集合和索引。初始化 store_settings 的 store 文档及 packages。业务文档同时保留 id 字段和云数据库 _id。booking_slots 需要预先创建 date、time、startAt(UTC ISO)、capacity、reserved=0、status=open。预约通过事务读取时段并更新名额，幂等ID来自服务端用户身份与requestId。

## 2. 独立部署目录

执行 npm.cmd run prepare:cloud。需求列出的17个云函数均为独立目录，另有门店设置、收藏、云文件下载、源图登记、收款/备份等辅助函数。common只存公共源码，不部署。

脚本同时生成 desktop-* 目录：微信入口使用 wx-server-sdk 上下文；桌面入口使用 @cloudbase/node-sdk 的 getAuthContext(invocationContext) 读取可信CloudBase uid，并要求 staff 中 cloudUid 与调用者匹配。两种调用渠道独立部署，不能把同一微信入口暴露给混合HTTP/Web来源。

上传各目录，选择云端安装依赖，避免上传Windows构建的sharp原生二进制。每次修改common后重新运行脚本。云函数均返回 {ok:true,data} 或 {ok:false,error}。

## 3. 账号与配置

微信用户身份来自运行时OPENID，不能使用前端event.userId。CloudBase认证后台创建店主/店员账号，启用用户名密码认证；在staff文档中设置 cloudUid、role(owner/staff)、status(active)。如店员也从小程序使用管理功能，另填写真实openid。任何客户端均无自助提权接口。

desktop-admin/.env.local 与 miniapp/.env.local 设置 VITE_MODE=cloudbase 和真实 VITE_CLOUDBASE_ENV。微信AppID配置 miniapp/src/manifest.json 的 mp-weixin.appid。桌面密码由官方SDK认证，刷新会话由SDK管理；本机Mock临时密码不可用于云端。

## 4. 文件与同步

照片预览、成片和冲印源图经云函数检查身份、格式、大小和订单状态；预览压缩并加水印，缩略图单独生成。云端路径为 preview/{orderId}/{id}.jpg、delivery/{orderId}/{id}.jpg、print-source/{openid}/{id}.jpg，缩略图使用 .thumb.jpg。私有数据库和存储默认禁止客户端直接读写，通过函数进行受控操作。

下载函数检查归属与expiresAt，仅生成最多60秒且不超过剩余有效期的链接。需要在真实环境验证私有存储规则和CDN缓存行为。当前函数上传使用base64载荷，业务层限制10MB；上线前必须验证所选套餐的函数请求体上限，必要时改成受鉴权的分块或临时凭证上传。此限制无法仅凭本地Mock确认。

Electron 的 SQLite upload_jobs 保存选中的原图路径、订单、任务类型、状态、尝试次数、错误与下次重试时间。pending/uploading/failed/synced 状态持久化；重启时把中断的uploading恢复为failed。用户可重试未完成任务；任务编号去重，同路径照片修改后会生成新任务。原图不会移动或删除。本地Mock由主进程上传；云端由受隔离的渲染器SDK上传，再将成功编号回写本地索引。业务状态以服务器为准，云端照片追加使用事务防止并发覆盖。

## 5. 备份与安全清理

店主可导出JSON备份。云端恢复每批最多50条，恢复前保存覆盖目标的旧记录并事务提交；较大备份需受控迁移，不能在未核对目标时直接覆盖。备份不包含云存储字节。

expired-files-cleanup 默认返回候选文件，提交confirm=true与具体ids后再次检查到期和订单结束状态才删除。仅清理过期副本，不触碰本地原图。上线前验证缩略图、冲印源图及孤儿上传的保留策略与定时任务。

## 6. 上线前必须实际验收

- 微信开发者工具和真机登录、相册权限、地图导航、完整预约/选片/交付流程。
- CloudBase用户名登录、账号停用、角色隔离与不同顾客间的数据隔离。
- 并发预约容量、上传重放、文件请求体上限与到期链接。
- 部署全部映射函数，验证数据库索引、存储权限和云运行时sharp安装。
- 完成依赖升级复核、密码限流、会话策略、退款流程与备份恢复演练。
- 填写真实运营主体、门店信息及隐私政策；不在Git保存密码或密钥。

官方参考：[小程序云函数](https://docs.cloudbase.net/recipes/add-cloud-function-wechat-miniprogram)、[身份认证](https://docs.cloudbase.net/api-reference/webv3/authentication)、[事务](https://docs.cloudbase.net/database/transaction)、[私有存储临时链接](https://docs.cloudbase.net/api-reference/server/node-sdk/storage)。

初始化命令：npm.cmd run seed:cloud。生成的docs/cloud-seed/*.jsonl可按集合导入**空环境**，包含未来30天时段；不可导入已有预约的环境来覆盖reserved。不要导入Mock订单或演示身份。
