# Copilot Chat Sync 按 Workspace 分类设计

## 背景

现在侧边栏只支持按日期分组，结构是 `Date -> Session`。  
用户希望默认按 Workspace 分组，同时保留按日期切换。  
另外，按 Workspace 分组时，还要支持两种层级：

- `Workspace -> Session`
- `Workspace -> Date -> Session`

这些切换要能在界面里直接点，也要能在设置里保存默认值。

## 目标

- 默认按 Workspace 分组展示会话
- 保留按日期分组切换
- 支持 Workspace 视图下两种层级切换
- 标题栏提供直接切换入口
- 设置项保存用户默认值
- 不影响搜索、预览、导出、同步等已有功能

## 不做的事

- 不新增第二个树视图
- 不改会话解析逻辑
- 不改导出文件结构
- 不改搜索结果结构

## 用户界面

侧边栏仍然只有一个树视图：`Chat Sessions`。

标题栏新增两个按钮：

- `Group By`
- `Workspace Layout`

行为如下：

- `Group By` 支持在 `Workspace` 和 `Date` 之间切换
- `Workspace Layout` 支持在 `Workspace / Session` 和 `Workspace / Date / Session` 之间切换
- 当当前分组是 `Date` 时，隐藏 `Workspace Layout` 按钮
- 用户点击标题栏按钮后，马上刷新树视图
- 标题栏切换结果会写回设置，方便下次启动继续使用

## 设置项

新增两个设置项：

### `copilotChatSync.sessionGroupBy`

- 类型：`string`
- 可选值：`workspace`、`date`
- 默认值：`workspace`

### `copilotChatSync.workspaceViewMode`

- 类型：`string`
- 可选值：`flat`、`byDate`
- 默认值：`flat`

设置写入目标使用 `Global`，不写入当前工作区设置。

原因：

- 这个扩展浏览的是全局聊天记录
- 分组方式更像个人使用习惯
- 不需要随项目变化

## 命令设计

新增两个命令：

### `copilotChatSync.changeSessionGroupBy`

用于切换分组方式。  
点击后弹出 QuickPick，选项如下：

- `Workspace`
- `Date`

### `copilotChatSync.changeWorkspaceViewMode`

用于切换 Workspace 视图层级。  
点击后弹出 QuickPick，选项如下：

- `Workspace / Session`
- `Workspace / Date / Session`

## 树结构

树数据只保留一套，内部根据两个状态值生成不同结构：

- `groupBy`
- `workspaceViewMode`

### 模式一：`groupBy = workspace` 且 `workspaceViewMode = flat`

结构：

- `Workspace -> Session`

说明：

- 根节点是 Workspace
- 子节点直接是会话

### 模式二：`groupBy = workspace` 且 `workspaceViewMode = byDate`

结构：

- `Workspace -> Date -> Session`

说明：

- 根节点是 Workspace
- 第二层是日期
- 第三层是会话

### 模式三：`groupBy = date`

结构：

- `Date -> Session`

说明：

- 根节点是日期
- 子节点是会话
- 此时 `workspaceViewMode` 不参与展示，但会保留上次值
- 用户切回 `Workspace` 后恢复上次选中的层级

## 节点类型

建议在树视图里明确区分 4 类节点：

- `workspaceGroup`
- `dateGroup`
- `workspaceDateGroup`
- `session`

每个节点带上最少的定位信息，避免依赖字符串判断：

- `workspaceName`
- `dateKey`
- `sessionId`

## 排序规则

统一使用最近优先：

- Workspace 根节点：按该 Workspace 最近会话时间倒序
- 日期节点：按日期倒序
- 会话节点：按开始时间倒序

## 展示规则

### Workspace 节点

- 标题：`workspaceName`
- 描述：`N sessions`
- 图标：文件夹或工作区相关图标

### 日期节点

- 标题：日期，如 `2026-04-17`
- 描述：`N sessions`
- 图标：日历图标

### 会话节点

不同模式下描述不同：

- `Workspace -> Session`：`04-17 09:30 · 12 msgs`
- `Date -> Session`：`workspaceName · 12 msgs`
- `Workspace -> Date -> Session`：`09:30 · 12 msgs`

会话标题继续沿用现有标题生成逻辑。

tooltip 和点击行为不变：

- tooltip 继续显示工作区、消息数、开始时间、会话 ID
- 点击会话继续打开预览

## 特殊情况

- 空窗口会话归到 `(no workspace)`
- 没有时间的会话归到 `unknown`
- 如果设置值不合法，自动回退默认值：
  - `sessionGroupBy` 回退到 `workspace`
  - `workspaceViewMode` 回退到 `flat`

## 实现方式

### `package.json`

需要修改：

- 新增两个命令定义
- 新增两个设置项定义
- 在 `view/title` 增加两个标题栏按钮
- `Workspace Layout` 按钮增加 `when` 条件，只在 Workspace 分组下显示

### `src/extension.ts`

需要修改：

- 注册两个新命令
- 命令内更新 VS Code 设置
- 启动时同步 context key
- 配置变化时刷新树视图
- 配置变化时同步标题栏按钮显示状态

建议新增一个辅助方法：

- `updateViewContext()`

作用：

- 读取当前 `sessionGroupBy`
- 设置 `copilotChatSync.groupByWorkspace` context key

### `src/treeView.ts`

需要修改：

- 在 provider 中读取当前设置
- 根据设置返回不同层级的根节点和子节点
- 增加 Workspace 相关分组方法
- 增加 Workspace + 日期的二级分组方法
- 会话描述按当前模式动态生成

建议增加的辅助方法：

- `getViewState()`
- `getWorkspaceGroups()`
- `getSessionsForWorkspace()`
- `getDateGroupsForWorkspace()`
- `getSessionsForWorkspaceDate()`

### `src/parser.ts`

不需要修改。  
现有 `workspaceName` 字段已经满足本次需求。

## 状态同步

状态来源只保留一份，就是 VS Code 设置。

流程如下：

1. 扩展启动时读取设置
2. 树视图按设置构建
3. 用户点击标题栏按钮后更新设置
4. 配置变化事件触发
5. 刷新树视图并更新 context key

这样可以避免：

- 树视图内部状态和设置状态不一致
- 重启后模式丢失

## 兼容性

以下能力不应受影响：

- 搜索历史
- 预览会话
- 导出单条会话
- 导出全部会话
- Q&A 导出
- Chunk 导出
- HTML 导入
- 自动同步

原因：

- 这些功能直接使用 `ChatSession`
- 本次只改树视图展示和视图设置

## 验证范围

### 基础切换

- 启动后默认按 `Workspace` 分组
- `Group By` 可切换到 `Date`
- 切回 `Workspace` 后保留上次的 Workspace 层级

### 树结构

- `Workspace -> Session` 模式正常显示
- `Workspace -> Date -> Session` 模式正常显示
- `Date -> Session` 模式正常显示

### 展示内容

- 节点数量描述正确
- 会话描述与当前模式一致
- 排序按最近优先

### 特殊数据

- `(no workspace)` 正常显示
- `unknown` 正常显示

### 设置持久化

- 标题栏切换后重启 VS Code 仍保留
- 在 Settings 中手动修改后树视图会刷新

## 风险点

- `Workspace Layout` 按钮显示条件依赖 context key，如果更新时机不对，标题栏状态会不同步
- 现有树节点类较简单，本次扩展后需要注意节点元数据不要混乱
- 会话描述文案要按模式变化，避免信息重复

## 推荐实现顺序

1. 先在 `package.json` 加设置、命令、标题栏按钮
2. 在 `extension.ts` 接好设置更新和 context key
3. 在 `treeView.ts` 重构树节点与分组逻辑
4. 编译并做人工验证
