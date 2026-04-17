# Copilot Chat Sync GitHub Pages 网页版设计

## 背景

当前扩展已经可以把 Copilot Chat 会话同步到单独仓库，并按日期写入：

- `sessions/YYYY-MM-DD/*.md`

现在目标变了：

- 主展示界面不再以 VS Code 侧边栏树视图为主
- 改为生成一个本地可预览、后续可发布到 GitHub Pages 的网页
- 网页首页和会话详情页都要尽量贴近 VS Code 中的阅读体验
- 详情区样式以用户提供的截图为唯一参照

这次先做：

- 本地生成和预览
- 为后续 GitHub Pages 发布预留目录结构

这次不做：

- 公网发布
- 权限控制
- 在线编辑
- 实时从 GitHub API 拉取数据

## 目标

- 保留 `sessions/*.md` 作为原始归档
- 额外生成一个很小的 `index.json` 给网页列表和分组使用
- 额外生成静态网页产物，支持本地直接打开预览
- 首页使用双栏布局：
  - 左侧会话列表
  - 右侧会话详情
- 每条会话也有独立详情页
- 首页记住上次打开的会话，找不到时退回最新一条
- 页面支持：
  - `Workspace -> Session`
  - `Workspace -> Date -> Session`
  - `Date -> Session`
- 页面主题跟随系统，并允许手动切换
- 会话详情区按截图复刻消息卡片样式，包括 `Tool calls` 折叠区

## 设计原则

- 数据和展示分开
- 列表数据尽量小
- 单条详情提前生成，避免浏览器现场做重解析
- 首页和详情页共用同一套样式和消息模板
- 先把详情区做准，再包列表和页面壳子

## 输出结构

同步后，目标仓库保留原有归档目录，并新增站点产物：

```text
sessions/
  YYYY-MM-DD/
    workspace_shortid.md

docs/
  index.html
  data/
    index.json
  session/
    <sessionId>.html
  assets/
    site.css
    site.js
    session.js
```

说明：

- `sessions/` 继续作为 Markdown 归档
- `docs/data/index.json` 只放首页和分组需要的最小元数据
- `docs/session/<sessionId>.html` 是每条会话的静态详情页
- `docs/assets/*` 放共用样式和脚本
- `docs/index.html` 是双栏首页

## 数据模型

### `index.json`

只保留列表和导航所需字段：

- `sessionId`
- `title`
- `workspaceName`
- `startTime`
- `endTime`
- `messageCount`
- `toolCallCount`
- `dateKey`
- `markdownPath`
- `detailPath`
- `previewText`
- `hasToolCalls`

说明：

- `previewText` 取第一条可展示内容，给左侧列表摘要使用
- `toolCallCount` 用来在列表和详情中快速显示标记
- 不把完整消息体塞进 `index.json`，避免首页数据过大

## 页面结构

### 首页

首页采用双栏布局：

- 左侧：会话浏览区
- 右侧：详情阅读区

左侧需要提供：

- 分组方式切换：`Workspace`、`Date`
- Workspace 视图层级切换：
  - `Workspace / Session`
  - `Workspace / Date / Session`
- 搜索框
- 折叠分组列表
- 当前选中会话高亮

右侧默认行为：

- 优先恢复上次打开的会话
- 如果找不到，则打开最新一条会话

### 独立详情页

每条会话都有单独页面：

- 地址形式：`docs/session/<sessionId>.html`
- 视觉样式与首页右侧详情区保持一致
- 可以直接单独打开

## 详情区样式

详情区以用户截图为准。

### 卡片样式

- 页面背景为浅灰色
- 每条消息是白底卡片
- 卡片有圆角
- 卡片有细边框
- 卡片之间有固定竖向间距
- 内容区左右内边距较大

### 头部样式

- 左侧显示机器人图标和 `Copilot`
- 右侧或同一行显示时间
- 标题区比正文更紧凑
- 时间颜色比正文浅

### 正文样式

- 正文字号偏大
- 行距偏宽
- 段落留白明显
- 不增加多余装饰

### Tool calls

- 每条消息下方支持折叠区
- 默认折叠
- 标题形式参考截图：`Tool calls (n)`
- 折叠箭头、扳手图标、数量都要保留
- 先展示基础内容，不做复杂工具详情交互

## 主题

- 默认跟随系统深浅色
- 同时提供手动切换
- 手动选择记录到浏览器本地存储
- 如果没有手动选择，则跟随系统

## 本地状态

网页本地存储以下状态：

- 上次打开的 `sessionId`
- `groupBy`
- `workspaceViewMode`
- 搜索关键词
- 主题选择

恢复顺序：

1. 读取本地存储
2. 校验会话是否仍存在
3. 不存在则回退到最新会话

## 分组和排序

沿用现有浏览逻辑：

- `Workspace -> Session`
- `Workspace -> Date -> Session`
- `Date -> Session`

排序规则统一使用最近优先：

- Workspace 分组按最近会话排序
- 日期分组按日期倒序
- 会话按开始时间倒序

## 生成流程

在现有同步流程后增加网页产物生成步骤：

1. 扫描并解析本地会话
2. 继续写入 `sessions/*.md`
3. 生成 `docs/data/index.json`
4. 生成每条会话的 `docs/session/<sessionId>.html`
5. 生成首页 `docs/index.html`
6. 生成共用 `docs/assets/*`

## 代码结构

建议新增独立的站点生成模块，避免把网页逻辑塞进 `extension.ts`。

### 新模块

- `src/site.ts`
  - 负责生成站点产物
  - 产出 `index.json`、详情页、首页、静态资源

### 复用模块

- `src/parser.ts`
  - 继续负责会话解析
- `src/formatter.ts`
  - 抽出可复用的会话摘要、时间格式、HTML 片段辅助函数
- `src/preview.ts`
  - 仍服务 VS Code 内部预览，但其 HTML 结构应向网页模板靠拢

### `extension.ts`

需要修改：

- 在同步流程中调用站点生成方法
- 生成 `README.md` 时不要覆盖 `docs/` 产物
- 保持现有同步、搜索、导出能力不受影响

## 错误处理

- 如果单条会话解析失败，跳过并继续生成其他页面
- 如果某条会话缺少时间，日期分组落到 `unknown`
- 如果缺少工作区名，归到 `(no workspace)`
- 站点生成失败时，要给出明确日志，但不破坏原始 Markdown 归档

## 测试范围

### 数据产物

- `sessions/*.md` 继续正确生成
- `docs/data/index.json` 字段完整且体积小
- `docs/session/*.html` 数量与会话数一致
- `docs/index.html` 能直接打开

### 页面行为

- 首页能恢复上次会话
- 找不到上次会话时回退最新会话
- 三种分组都能切换
- 搜索能过滤左侧列表
- 独立详情页能正确展示消息和 `Tool calls`

### 样式

- 详情卡片结构、圆角、边框、间距、折叠区与截图保持一致
- 深浅色主题切换正常
- 页面在桌面尺寸下布局稳定

## 实施顺序

1. 抽出站点生成器
2. 先生成 `index.json` 和单条详情页
3. 再补首页双栏结构和本地状态恢复
4. 最后补主题切换和文档
