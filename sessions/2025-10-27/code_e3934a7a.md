# 查看我的电脑有几个 Python 环境

| Field | Value |
|-------|-------|
| Session ID | `e3934a7a-3555-4843-a5c1-cac37f644f4c` |
| Workspace | code |
| Start | 2025/10/27 23:31 |
| End | 2025/10/28 20:42 |
| Messages | 2 |

---

### 👤 User <sub>2025/10/28 20:42</sub>

查看我的电脑有几个 Python 环境

### 🤖 Copilot <sub>2025/10/28 20:42</sub>

我可以帮你查看电脑上的 Python 环境。由于我目前没有可用的终端工具,我会提供几个命令供你在终端中运行来检查:

## 检查 Python 环境的命令

你可以在终端中运行以下命令:

**1. 查找所有 Python 可执行文件:**
```zsh
which -a python python3
```

**2. 查看系统中所有 Python 版本:**
```zsh
ls -la /usr/bin/python* /usr/local/bin/python* 2>/dev/null
```

**3. 如果使用 Homebrew 安装的 Python:**
```zsh
brew list | grep python
ls -la /opt/homebrew/bin/python* 2>/dev/null
```

**4. 查看 conda 环境 (如果安装了 Anaconda/Miniconda):**
```zsh
conda env list
```

**5. 查看 pyenv 管理的 Python 版本 (如果安装了 pyenv):**
```zsh
pyenv versions
```

**6. 查看当前使用的 Python 版本和路径:**
```zsh
python3 --version
which python3
```

你可以在 VS Code 中打开终端(Terminal → New Terminal)并运行这些命令,这样就能看到你的 Mac 上安装了哪些 Python 环境了。
