# 提前当前 html 文件的 R 代码形成rmd 文件

| Field | Value |
|-------|-------|
| Session ID | `3f18cadc-2768-4fc0-ae35-551c24f47ca6` |
| Workspace | 251209_double_heatmap |
| Start | 2025/12/09 18:25 |
| End | 2025/12/09 18:26 |
| Messages | 2 |

---

### 👤 User <sub>2025/12/09 18:26</sub>

提前当前 html 文件的 R 代码形成rmd 文件

### 🤖 Copilot <sub>2025/12/09 18:26</sub>

- 提炼了 HTML 中的全部 R 代码并整理成可复现的 R Markdown：

（同目录）。包含：
  - 版本1：上下三角共用 RdBu 调色；基础热图与带行/列注释的版本。
  - 版本2：上下三角使用不同调色，按 P 值过滤非显著相关；附带双图例绘制。
  - 自动生成分组颜色（`group1/2/3`），便于直接使用你的 `group.csv`。
- 每段代码保持原逻辑，简化注释并补齐缺失的颜色定义，方便直接 knitting。

下一步可运行 `rmarkdown::render("double_heatmap.Rmd")`（确保 `M0_r.csv`, `M1_r.csv`, `M0_p.csv`, `M1_p.csv`, `group.csv` 在同目录）即可得到报告。
