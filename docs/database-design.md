# 数据库设计

Mock 数据持久化在 `.data/studio.sqlite`。SQLite `records` 表以 `(collection,id)` 为复合主键，将各集合的结构化记录保存在 JSON `data` 字段中；图片二进制只写入 `.data/files`。云端使用下列同名集合。当前 Mock 将订单项、状态历史、选片和交付摘要内嵌 orders，云端分表设计用于正式迁移，不能将设计表误认为全部已在运行时独立写入。

所有金额为整数分，所有时间为 UTC ISO 8601 字符串，界面按 Asia/Shanghai 显示。

## 公共字段

|字段|类型|必填|说明|
|---|---|---|---|
|id / _id|string|是|主键，云数据库另有 _id|
|createdAt|string|是|创建时间|
|updatedAt|string|是|最近更新时间|
|status|string|是|记录业务状态|

## users

|字段|类型|必填|说明|
|---|---|---|---|
|openid|string|是|微信身份，敏感|
|phone|string|否|手机号，敏感|
|contacts|array|否|常用联系人，敏感|
|deletionRequested|boolean|是|注销申请状态|

主要索引：openid 唯一。公共字段按上表添加。

## staff

|字段|类型|必填|说明|
|---|---|---|---|
|openid|string|是|绑定微信用户|
|account|string|是|登录名|
|passwordHash|string|是|加盐密码派生值|
|salt|string|是|随机盐|
|role|owner | staff|是|服务端角色|
|status|active | disabled|是|启停状态|

主要索引：openid 唯一、account 唯一。公共字段按上表添加。

## store_settings

|字段|类型|必填|说明|
|---|---|---|---|
|name|string|是|门店名称|
|address|string|是|门店地址|
|phone|string|否|联系电话|
|hours|string|是|整点营业范围|
|watermark|string|是|水印文字|
|retentionDays|integer|是|文件保留天数|
|capacity|integer|是|每时段人数|
|closedDates|string|否|逗号分隔停业日期|

主要索引：id=store。公共字段按上表添加。

## packages

|字段|类型|必填|说明|
|---|---|---|---|
|name|string|是|套餐名|
|category|string|是|分类|
|image|string|否|展示图片|
|originalPrice|integer|是|原价分|
|price|integer|是|现价分|
|description|string|是|说明|
|retouchCount|integer|是|包含精修数|
|duration|integer|是|拍摄分钟数|
|bookingRequired|boolean|是|是否预约|
|enabled|boolean|是|是否上架|
|sort|integer|是|排序|

主要索引：enabled + sort。公共字段按上表添加。

## photo_specs

|字段|类型|必填|说明|
|---|---|---|---|
|name|string|是|考试或用途|
|width|integer|是|像素宽|
|height|integer|是|像素高|
|background|string|是|背景色|
|format|string|是|文件格式|
|size|string|是|文件大小范围|
|note|string|是|官方通知提醒|
|packageId|string|是|推荐套餐外键|

主要索引：name。公共字段按上表添加。

## booking_slots

|字段|类型|必填|说明|
|---|---|---|---|
|date|string|是|中国本地日期|
|time|string|是|时间段|
|startAt|string|是|开始UTC时间|
|capacity|integer|是|最大人数|
|reserved|integer|是|已预约人数|

主要索引：date + time 唯一、date + status。公共字段按上表添加。

## orders

|字段|类型|必填|说明|
|---|---|---|---|
|userId|string|是|users外键|
|packageId|string|是|packages外键|
|slotId|string|否|预约时段外键|
|packageName|string|是|下单套餐快照|
|name|string|是|联系人，敏感|
|phone|string|是|联系电话，敏感|
|people|integer|是|人数|
|appointment|string|是|预约UTC时间|
|amount|integer|是|总金额分|
|paid|integer|是|累计收款分|
|pickupCode|string(4)|是|四位取件码，不作为鉴权凭证|
|history|array|是|不可丢失的status和at历史|
|photos|array|是|照片引用及选片摘要|
|selectionLocked|boolean|是|选片锁定|
|retouchCount|integer|是|精修数量快照|
|revision|string|否|一次修改意见|
|confirmed|boolean|否|成片确认|
|internalNote|string|否|仅店员可见备注|
|requestId|string|是|用户范围幂等键|

主要索引：userId + createdAt、status + appointment、pickupCode、userId + requestId 唯一。公共字段按上表添加。

## order_items

|字段|类型|必填|说明|
|---|---|---|---|
|orderId|string|是|订单外键|
|packageId|string|是|套餐外键|
|quantity|integer|是|数量|
|unitPrice|integer|是|单价分|
|subtotal|integer|是|小计分|

主要索引：orderId。公共字段按上表添加。

## payments

|字段|类型|必填|说明|
|---|---|---|---|
|orderId|string|是|订单外键|
|amount|integer|是|本次收款分|
|method|string|是|线下收款|
|actor|string|是|登记人员|

主要索引：orderId + createdAt。公共字段按上表添加。

## photos

|字段|类型|必填|说明|
|---|---|---|---|
|orderId|string|是|订单外键|
|number|string|是|订单内稳定编号|
|fileId|string|否|云端存储ID|
|expiresAt|string|是|到期时间|
|kind|string|是|preview/print-source|
|favorite|boolean|否|收藏标志|

主要索引：orderId + number 唯一、expiresAt + status。公共字段按上表添加。

## photo_selections

|字段|类型|必填|说明|
|---|---|---|---|
|orderId|string|是|订单外键|
|photoId|string|是|照片外键|
|userId|string|是|选片用户|
|locked|boolean|是|提交锁定|

主要索引：orderId + photoId 唯一。公共字段按上表添加。

## retouch_requests

|字段|类型|必填|说明|
|---|---|---|---|
|orderId|string|是|订单外键|
|photoId|string|是|照片外键|
|note|string|否|修图要求|
|status|working | completed|是|修图进度|

主要索引：orderId + photoId。公共字段按上表添加。

## print_tasks

|字段|类型|必填|说明|
|---|---|---|---|
|orderId|string|是|订单外键|
|size|string|是|冲印尺寸|
|quantity|integer|是|每张数量|
|paper|string|是|光面或绒面|
|laminate|boolean|是|塑封|
|status|pending | printing | completed|是|任务状态|

主要索引：status + createdAt。公共字段按上表添加。

## delivery_files

|字段|类型|必填|说明|
|---|---|---|---|
|orderId|string|是|订单外键|
|fileId|string|是|私有成片文件ID|
|expiresAt|string|是|到期时间|
|status|active | deleted|是|文件状态|

主要索引：expiresAt + status、orderId。公共字段按上表添加。

## operation_logs

|字段|类型|必填|说明|
|---|---|---|---|
|actor|string|是|操作者|
|action|string|是|操作名|
|target|string|是|目标ID|

主要索引：target + createdAt、actor + createdAt。公共字段按上表添加。

## 本地索引

Electron `.data/electron/local-index.sqlite` 包含 local_files(id,order_id,original_path,preview_id,sync_status,created_at) 和 settings(id,value)。原图路径来自系统文件选择器，禁止接受渲染器任意路径；SQLite 不保存图片字节。

## 关系与保留

users 1:N orders；packages 1:N orders；orders 1:N order_items/payments/photos/photo_selections/retouch_requests/print_tasks/delivery_files/operation_logs。手机号、姓名、联系人、照片和原图路径为隐私字段。店员响应脱敏手机号，导出只允许店主，顾客只能读自己的订单。取件码不能替代用户身份。

成片默认7天到期，到期立即拒绝新下载请求，只有订单已完成或已取消的过期副本才可进入清理候选。清理前展示具体ID并确认；本地原图不在任何清理任务范围。订单与收款记录不提供删除接口。注销申请由门店处理未完成交易后执行去标识化；正式保存期限由运营方在上线前确定。JSON备份保留隐私字段，必须限制文件访问。

## 上传队列与云端辅助集合

Electron upload_jobs：id TEXT主键、order_id TEXT、source_path TEXT（敏感）、kind TEXT、status TEXT、attempts INTEGER、last_error TEXT、next_retry INTEGER。任务ID由订单/路径/类型/文件时间戳指纹派生，重试沿用同ID。settings(id,value)保存系统选择器选定的默认目录。

云端staff增加cloudUid用于桌面账号绑定；photos/delivery_files增加uploadKey和thumbnailId；backups保存恢复前记录快照。所有本地业务记录由save统一补齐createdAt、updatedAt和默认status。
