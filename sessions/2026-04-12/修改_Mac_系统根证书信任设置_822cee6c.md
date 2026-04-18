# Mac 的 shadow找不到不能修改“系统根证书”钥匙串。

| Field | Value |
|-------|-------|
| Session ID | `822cee6c-a71f-4296-8779-94179b62bed8` |
| Workspace | 修改 Mac 系统根证书信任设置 |
| Start | 2026/04/12 23:44 |
| End | 2026/04/12 23:44 |
| Messages | 2 |

---

### 👤 User <sub>2026/04/12 23:44</sub>

Mac 的 shadow找不到不能修改“系统根证书”钥匙串。

若要更改根证书是否会被信任，请在 “钥匙串访问”中打开它，然后修改它的信任设置。新根证书应被添加到当前用户的登录钥匙串，如果它将被这台机器的所有用户共享，则应被添加到系统钥匙串。

### 🤖 Copilot <sub>2026/04/12 23:44</sub>

macOS 的 **系统根证书** (System Roots) 钥匙串是 Apple 内置的，**设计上就是只读的**，无法直接修改。这是正常行为。

### 修改根证书信任的正确方法

1. **打开「钥匙串访问」** (`/Applications/Utilities/Keychain Access.app`)
2. 在左侧选择 **系统根证书** 钥匙串，找到目标证书
3. **双击**该证书 → 展开 **▶ 信任** 区域
4. 将「使用此证书时」改为 **始终信任** 或 **永不信任**
5. 关闭窗口时输入管理员密码确认

这不会修改系统根证书钥匙串本身，而是在你的 **登录钥匙串** 中创建一条信任覆盖记录。

### 添加新根证书

```
# 添加到当前用户的登录钥匙串
security add-trusted-cert -k ~/Library/Keychains/login.keychain-db cert.pem

# 添加到系统钥匙串（所有用户共享，需 sudo）
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain cert.pem
```

### 命令行修改信任设置

```
# 将某个证书标记为始终信任（SSL）
sudo security add-trusted-cert -d -r trustRoot \
  -p ssl -k /Library/Keychains/System.keychain cert.pem

# 查看当前信任设置
security dump-trust-settings -d   # 用户级
security dump-trust-settings -s   # 系统级
```

> **总结**：系统根证书只读是 Apple 的安全设计。你只能通过信任覆盖（trust override）来改变某个根证书是否被信任，覆盖记录存储在登录或系统钥匙串中。

你想进一步做什么？

你想进一步做什么？

刚下载的证书不会自动出现在钥匙串中，需要手动导入。

### 方法 1：双击导入

直接在 Finder 中**双击**证书文件（`.cer` / `.crt` / `.pem`），macOS 会自动打开钥匙串访问并提示导入到 **登录钥匙串**。

### 方法 2：钥匙串访问中导入

1. 打开「钥匙串访问」
2. 左侧选择 **登录** 钥匙串
3. 菜单栏 → **文件** → **导入项目…**
4. 选中下载的证书文件

### 方法 3：命令行导入

```
# 找到证书文件（通常在 ~/Downloads）
ls ~/Downloads/*.{cer,crt,pem} 2>/dev/null

# 导入到登录钥匙串
security import ~/Downloads/你的证书.cer -k ~/Library/Keychains/login.keychain-db
```

### 导入后找到它

导入成功后在钥匙串访问中：
- 左侧选 **登录** 钥匙串（不是系统根证书）
- 上方类别选 **证书**
- 用右上角搜索框搜索证书名称

你能告诉我证书文件的名称和路径吗？我可以直接帮你执行导入命令。

你想怎么处理这个证书？
