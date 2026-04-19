# 如何取消 VScode 的自动检查更新

| Field | Value |
|-------|-------|
| Session ID | `7d72f0d6-5025-4c0d-8821-17b201eff631` |
| Workspace | 取消 VS Code 自动检查更新设置 |
| Start | 2026/03/08 15:36 |
| End | 2026/03/08 15:36 |
| Messages | 2 |

---

### 👤 User <sub>2026/03/08 15:36</sub>

如何取消 VScode 的自动检查更新

### 🤖 Copilot <sub>2026/03/08 15:36</sub>

可以，直接把 VS Code 的更新模式改成 `none`。

操作方法：

1. 打开 VS Code 设置
2. 搜索 `update mode`
3. 找到 `Update: Mode`
4. 改成 `none`

或者直接编辑用户设置 `settings.json`，加入：

```
{
  "update.mode": "none"
}
```

更快的方式：

1. 按 `Cmd + Shift + P`
2. 输入 `Preferences: Open User Settings (JSON)`
3. 加上上面的配置并保存

补充说明：

- `none`：不自动检查，也不自动下载/安装更新
- `manual`：仍会检查更新，但需要你手动触发安装
- 如果你只是想减少提示，不想完全关掉更新，可以用 `manual`

如果你愿意，我也可以顺手告诉你 macOS 下 VS Code 配置文件的具体路径。
