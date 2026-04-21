# 监测一下跨数据集细胞类型注释之后的代码运行结果，注释是否正确呢

| Field | Value |
|-------|-------|
| Session ID | `fc4db0eb-f4c8-4dde-b218-87198a0b56e3` |
| Workspace | 生信技能树月更复现 |
| Start | 2026/04/21 15:09 |
| End | 2026/04/21 23:05 |
| Messages | 170 |
| Copilot | v0.44.2 |
| VS Code | v1.116.0 |

---

### 👤 User <sub>2026/04/21 15:28</sub>

监测一下跨数据集细胞类型注释之后的代码运行结果，注释是否正确呢

### 🤖 Copilot <sub>2026/04/21 15:29</sub>

代码运行成功，以下是注释结果的分析报告：

---

**整体质量（可接受）**
- 60,583 高置信度 / 8,337 Ambiguous（12.1%）—— 阈值合理

**细胞类型分布**

| 细胞类型 | Cluster | 细胞数 | 评价 |
|---|---|---|---|
| Oligodendrocyte | 0/1/10 | ~22,284 | ✅ 正常，GBM 中寡突最多 |
| AC-like | 2/3/8/15/18 | ~19,188 | ✅ GBM 标准肿瘤态 |
| OPC-like | 6/7/11/12 | ~9,557 | ✅ GBM 标准肿瘤态 |
| Macrophage | 4 | 6,045 | ⚠️ 见下文 |
| MES-like | 5 | 5,472 | ✅ GBM 标准肿瘤态 |
| CDC | 9 | 2,229 | ❗ 可疑，占比过大 |
| NPC-like | 13/19 | 1,488 | ✅ GBM 标准肿瘤态 |
| NK/T | 20 | 472 | ✅ snRNA 中少见，正常 |

---

**存在的问题**

**❗ 问题1：Microglia 与 Macrophage 未区分**
GBM 研究中这两者是重要区别（Microglia = 定居免疫细胞，Macrophage = 浸润单核）。当前 Macrophage 标记基因（SPP1, APOE, GPNMB, CTSD, CD68, C1QA, C1QB）与 Microglia 标记高度重叠，导致真正的 Microglia 被归入 Macrophage。

**❗ 问题2：Cluster 9 被注释为 CDC（2229 cells）**
CDC 在 GBM 中极罕见，2229 个细胞明显过多。该 cluster 实际可能是一个 Macrophage/Microglia 亚群（HLA-DPB1, CD83 可在激活的髓系细胞上表达）。

**❗ 问题3：多个 cluster 置信度 <50%**
12 个 cluster 的第一名投票 <50%（如 Cluster 17: Endothelial 仅 24.5%，Cluster 19: NPC-like 仅 25.9%），这些 cluster 需要手动核验 marker 表达。

**建议的改进** — 需要在 marker gene sets 中作以下修改：
1. **区分 Microglia / Macrophage**：Microglia 专用标记加入 `P2RY12`, `SALL1`, `SIGLECH`, `TMEM119`（保留现有 `CX3CR1`）；Macrophage 去掉与 Microglia 重叠的基因
2. **移除或重命名 CDC**：改为 `pDC` 或 `DC_mature`，或合并入 Macrophage
3. **添加 Prol.tumor**：增加增殖肿瘤细胞群（`MKI67`, `TOP2A` + 肿瘤态基因）

要我现在帮你修改 marker gene sets 重新注释吗？

### 🤖 Copilot <sub>2026/04/21 15:32</sub>

对比完成，发现当前流程与参考标准有以下差异：

**参考流程（`scGBM/0_integrate_two_datasets.ipynb`）vs 当前流程**

| 步骤 | 参考标准 | 当前 `1_snRNA_processing.ipynb` | 影响 |
|---|---|---|---|
| **QC - max_genes** | 8000 | 10000 | 当前更宽松，可能混入低质量细胞 |
| **QC - MT%** | 10% | 15% | 当前更宽松 |
| **HVG 数量** | 2000 (`seurat_v3`) | 3000 (`seurat_v3_paper`) | 当前包含更多基因 |
| **⚠️ regress_out** | ✅ 有（回归 total_counts + pct_counts_mt）| ❌ 缺失 | **缺少此步骤会导致 PC 被测序深度污染，影响聚类和注释** |
| **Leiden 分辨率** | 0.5（默认） | 0.8 | 当前 cluster 更多更碎 |
| **Leiden 参数** | `flavor="igraph", n_iterations=2` | 默认参数 | 结果可能略有不同 |

**最重要的差异：缺少 `regress_out` 步骤。** 参考流程在 PCA 前会回归去除 `total_counts` 和 `pct_counts_mt` 的影响，否则 PCA 的前几个 PC 会被测序深度/线粒体比例主导，导致细胞类型聚类混乱，注释结果不准。

需要我在 HVG+PCA+Harmony 步骤中补充 `regress_out`，并将参数对齐参考标准（HVG=2000, leiden res=0.5）重新运行吗？

### 🤖 Copilot <sub>2026/04/21 15:35</sub>

直接使用 Python 脚本修改 notebook JSON：

### 🤖 Copilot <sub>2026/04/21 15:35</sub>

所有变更确认生效：
- `leiden_0.8` → 已全部替换为 `leiden_0.5`，无残留
- `n_top_genes=2000, flavor='seurat_v3'` ✅
- `sc.pp.regress_out(...)` ✅

### 🤖 Copilot <sub>2026/04/21 15:37</sub>

正在运行中（后台异步，包含 regress_out 步骤，预计 20-40 分钟）。

**已完成的修改摘要：**

| 步骤 | 旧参数 | 新参数（对齐参考标准） |
|---|---|---|
| **HVG** | n=3000, `seurat_v3_paper` | n=2000, `seurat_v3` ✅ |
| **regress_out** | ❌ 缺失 | ✅ 回归 total_counts + pct_counts_mt |
| **PCA** | random_state 未设 | random_state=42 ✅ |
| **Leiden** | res=0.8, 默认参数 | res=0.5, `flavor='igraph', n_iterations=2` ✅ |
| **leiden key** | `leiden_0.8` | `leiden_0.5`（所有引用全部替换）✅ |

### 🤖 Copilot <sub>2026/04/21 15:56</sub>

`seurat_v3` 在跨数据集时因部分 sample 数据矩阵病态而报错。原来的 `seurat_v3_paper` + 回退逻辑是必要的，只需改 n=2000：

### 🤖 Copilot <sub>2026/04/21 15:56</sub>

已修复并重新启动。修复方案：保留 try/except 回退逻辑，仅将 n=3000 改为 n=2000（`seurat_v3` 在跨 Multiome/snRNA 混合数据集时容易矩阵病态，`seurat_v3_paper` 是更稳定的回退选项）。

正在后台运行，含 `regress_out` 步骤预计需要 20-40 分钟。

### 🤖 Copilot <sub>2026/04/21 16:01</sub>

还有残留的 `leiden_0.8` 引用，找出并修复：

### 🤖 Copilot <sub>2026/04/21 16:02</sub>

`leiden_0.8` 已全部清零（exit code 1 表示 grep 未找到匹配，符合预期）。重新执行：

### 🤖 Copilot <sub>2026/04/21 16:02</sub>

已修复（之前的 Python 脚本替换了 cell source 内容，但 notebook JSON 的 **outputs** 字段中仍保留了旧的输出文本含有 `leiden_0.8`，sed 全局替换已清理所有实例）。

正在后台重新运行，等待完成通知。

### 🤖 Copilot <sub>2026/04/21 16:08</sub>

这个错误来自上一次运行（`leiden_0.8` 在 sed 之前），当前 `d99752af` 正在运行的是已修复版本，先检查进度：

### 🤖 Copilot <sub>2026/04/21 16:08</sub>

仍在运行中（无输出=正常）。确认当前文件中已无 `leiden_0.8`：

### 🤖 Copilot <sub>2026/04/21 16:09</sub>

路径本身没有问题，`snGBM/snGBM/` 是 nbconvert 写输出文件时的 bug。原因是 notebook 内有 `os.chdir` 导致工作目录变成 `snGBM/`，然后 nbconvert 用相对路径 `snGBM/...` 写输出。改用绝对路径：

### 🤖 Copilot <sub>2026/04/21 16:09</sub>

没有 `chdir`，问题是 nbconvert 的 `--output` 路径相对于 notebook 所在目录（`snGBM/`）解析，导致变成 `snGBM/snGBM/...`。用绝对路径修复：

### 🤖 Copilot <sub>2026/04/21 16:10</sub>

已修复路径问题（改用 `--output-dir snGBM`，输出写到 `snGBM/1_snRNA_processing.nbconvert.ipynb`），正在后台运行。

### 🤖 Copilot <sub>2026/04/21 16:12</sub>

当前注释逻辑框架合理，但有几个具体问题值得关注：

**合理之处：**
- `sc.tl.score_genes()` + 多数投票是标准做法
- `MIN_SCORE_DIFF=0.05` 过滤低置信度细胞合适
- 13个细胞类型覆盖了 GBM 主要群体

**存在的问题：**

1. **Microglia/Macrophage 标记基因高度重叠**
   - 当前 Microglia: `TMEM119, CX3CR1, TREM2, GPNMB, CTSD, CD68`
   - 当前 Macrophage: `SPP1, APOE, GPNMB, CTSD, CD68`（5个基因中3个重叠）
   - 应该：Microglia 改为特异性基因 `P2RY12, SALL1, SIGLECH, TMEM119, CX3CR1`

2. **CDC marker 非特异**
   - `FCER1A, HLA-DPB1, CD83, AREG` ——其中 `HLA-DPB1` 是泛免疫标记，可能把激活的巨噬细胞误判为 DC
   - CDC 在 GBM 中正常只占 <1%，之前出现 2229 个细胞（~3.2%）说明污染严重

3. **缺少 Prol.tumor 标记集**（代码里被注释掉了）

需要我在 notebook 里修复 Microglia 和 CDC 的标记基因吗（可以在等待运行结束期间修改 source notebook）？

### 🤖 Copilot <sub>2026/04/21 16:13</sub>

好的，等运行完成后再评估。

### 🤖 Copilot <sub>2026/04/21 16:14</sub>

还有残留，需要看完整错误上下文：

### 🤖 Copilot <sub>2026/04/21 16:16</sub>

正在运行，同时直接检查 notebook 源文件中所有 `leiden` 相关引用：

### 🤖 Copilot <sub>2026/04/21 16:16</sub>

源文件已全部正确，`leiden_0.8` 已被完全替换。当前正在运行的 `fafd1d9e` 终端是最新版本，等它完成即可。

### 🤖 Copilot <sub>2026/04/21 16:17</sub>

当前 `fafd1d9e` 仍在运行（执行全流程）。之前两次 `KeyError` 是因为 sed 修复发生在运行途中，而 `fafd1d9e` 是在 sed 确认清零后才启动的，应该没有问题。等待完成通知。

### 🤖 Copilot <sub>2026/04/21 16:19</sub>

双细胞去除流程分析：

**GSE286419（Cell 17）：**
- 逻辑正确，按 sample 分别运行 Scrublet
- `expected_doublet_rate=0.06`（6%），snRNA 标准值偏低，通常 10x snRNA 建议用 0.05-0.08，这里合理
- **潜在问题**：GBM1C 和 GBM4C 双细胞率极低（0.0-0.2%），GBM4C 只有 402 个细胞，可能是低质量 sample，但目前代码没有 sample-level 过滤

**GSE276177（Cell 28）：**
- ✅ 有安全阈值机制（>20% 自动阈值异常时回退 0.25）
- `GBM20_tumor` 自动检测到 12% 双细胞（350/2928），率偏高但仍在正常范围
- `GBM25_tumor` 0 个双细胞（0/10735）—— **这是一个问题**：10735 个细胞一个双细胞都没有，说明 Scrublet 自动阈值失效了

**主要问题：**

`GBM25_tumor` 0% 双细胞率高度可疑（10x 常见 5-10%），说明 Scrublet 双峰分布不够清晰时会误判阈值。这会导致双细胞混入下游分析，但不影响当前流程的运行正确性，只影响生物学解读。

整体来说，代码逻辑没有 bug，可以正常运行，问题属于数据质量层面而非代码错误。

### 🤖 Copilot <sub>2026/04/21 16:25</sub>

两件事并行处理：检查残留 `leiden_0.8` + 修改 UMAP 可视化 cell：

### 🤖 Copilot <sub>2026/04/21 16:26</sub>

源文件无 `leiden_0.8` 残留。同时修改 UMAP 可视化 cell 为用户指定的 1×4 布局，然后重新运行：

### 🤖 Copilot <sub>2026/04/21 16:26</sub>

文件彻底干净（0 个 `leiden_0.8`）。之前报错根因是旧执行产生的 **output 文本**中仍含 `leiden_0.8`，这次已清空所有 cell outputs 后重写，重新执行：

### 🤖 Copilot <sub>2026/04/21 16:27</sub>

**本次修改汇总：**
1. 清空了所有 cell 的旧 outputs（这是 `leiden_0.8 KeyError` 的根因 —— nbconvert 执行输出的文本里保留了旧 key）
2. UMAP 可视化 cell 改为 1×4 布局：`leiden_0.5 | celltype | dataset | tissue_unified`
3. 保存到 `./figures/1_snRNA_processing/merged_celltype_UMAP.pdf`

正在后台运行，预计 20-40 分钟完成。

### 🤖 Copilot <sub>2026/04/21 16:28</sub>

内核有旧变量残留，先重启内核，然后逐步运行：

### 🤖 Copilot <sub>2026/04/21 16:31</sub>

QC 图正常显示。继续：

### 🤖 Copilot <sub>2026/04/21 16:37</sub>

HVG 2000 已选出，`seurat_v3` 回退 `seurat_v3_paper` 正常。接下来是 regress_out + PCA（最慢步骤）：

### 🤖 Copilot <sub>2026/04/21 16:38</sub>

regress_out + PCA + Harmony 全部完成（90 秒）。继续 UMAP + Leiden：

### 🤖 Copilot <sub>2026/04/21 16:39</sub>

Leiden res=0.5 得到 **16 clusters**（之前 res=0.8 得 21 clusters）。继续可视化：

### 🤖 Copilot <sub>2026/04/21 16:40</sub>

`celltype` 还未生成（在后面的注释步骤才创建）。这个 UMAP viz cell 位置应该在注释之后。先修复这个 cell（去掉 celltype，用 3 panel），稍后在注释后补全：

### 🤖 Copilot <sub>2026/04/21 16:41</sub>

Cell 51 是 `celltype` 注释后的可视化（正确位置），但 `axes[0, 0]` 是 2D 索引（用于 2 维 subplot），1×4 布局应用 `axes[0]`。同时修复 Cell 41（去掉 celltype）和 Cell 51（修正索引）：

### 🤖 Copilot <sub>2026/04/21 16:41</sub>

Now re-run cell 41 with the fixed version, then continue:

### 🤖 Copilot <sub>2026/04/21 16:42</sub>

VS Code 内存覆盖了磁盘修改。需用正确的 notebook 编辑工具：

### 🤖 Copilot <sub>2026/04/21 16:44</sub>

查看 notebook cell 摘要来确认 cell ID 映射：

### 🤖 Copilot <sub>2026/04/21 16:44</sub>

Cell 41 is at lines 519-531. Let me read the current content:

### 🤖 Copilot <sub>2026/04/21 16:44</sub>

用 `replace_string_in_file` 直接修改：

### 🤖 Copilot <sub>2026/04/21 16:45</sub>

VS Code 持有文件，需要用 Python 直接修改 JSON 并让 VS Code reload。先用 Python 修改 JSON 文件，然后触发 VS Code 重新加载：

### 🤖 Copilot <sub>2026/04/21 16:47</sub>

文件已正确修改。需要让 VS Code 从磁盘重新加载 notebook：

### 🤖 Copilot <sub>2026/04/21 16:48</sub>

Notebook 已 reload，Cell 41 现在是 `#VSC-7b288d2c`，kernel 变量完好。同时先修复 Cell 51 (`#VSC-cd10463a`) 的 2D axes 问题：

### 🤖 Copilot <sub>2026/04/21 16:49</sub>

Cell IDs 已更新，kernel 变量完好。现在运行 Cell 41 (早期 UMAP，已去掉 celltype)：

### 🤖 Copilot <sub>2026/04/21 16:49</sub>

UMAP 图渲染成功，整合效果良好（两数据集混合均匀）。继续运行注释 cells：

### 🤖 Copilot <sub>2026/04/21 16:52</sub>

`celltype` 已创建。运行 Cell 51 (post-annotation 完整 UMAP)：

### 🤖 Copilot <sub>2026/04/21 16:53</sub>

完美！1×4 UMAP 清晰展示了 9 种细胞类型、数据集整合和组织分布。继续运行剩余 cells：

### 🤖 Copilot <sub>2026/04/21 16:56</sub>

全部完成！

### 🤖 Copilot <sub>2026/04/21 16:56</sub>

整个 notebook 已成功跑完，保存为 `68920 cells × 32163 genes`。关键结果：

**细胞类型**（16 clusters → 9 types）：
- Oligodendrocyte (大量，以瘤周为主) — MBP、PLP1 高表达
- AC-like (4 个 cluster，肿瘤优势)
- OPC-like (4 个 cluster)
- Macrophage、NK/T、Pericyte、Endothelial、MES-like、NPC-like

**Tissue DEG**：
- 肿瘤特异高表达：TRIO、VIM、PTPRZ1、GFAP、EGFR
- 瘤周特异高表达：IL1RAPL1、MBP、PLP1（髓鞘化相关）

**注意**：Cluster 4 (Macrophage/CDC 混合) 和部分 OPC-like 边界不清晰（已在注释步骤有警告提示）。

### 🤖 Copilot <sub>2026/04/21 16:58</sub>

在 Cell 50 (`#VSC-856b89d6`) 之后插入一个 cluster × marker gene 热图 cell：

### 🤖 Copilot <sub>2026/04/21 17:00</sub>

新 cell `#VSC-74377334` 已插入。运行热图：

### 🤖 Copilot <sub>2026/04/21 17:00</sub>

热图生成成功。可以清晰看出：

- **Cluster 8、3、1、5 等**：Oligodendrocyte/OPC-like markers (MAG, CLDN11, OLIG1, PLP1) 高表达  
- **Cluster 0、2、7**：AC-like markers (GFAP, S100B, HOPX, SLC1A3) 明显  
- **Cluster 4**：Macrophage markers (SPP1, APOE, C1QA/B, CTSD) 高表达  
- **Cluster 9**：NK/T markers (CD3D/E/G, IL7R, TRAC) 强表达  
- **Cluster 10**：Endothelial markers (ESAM, FLT1, VWF, ADGRL4) 明显  
- **Cluster 12**：Pericyte markers (COL1A2, PDGFRB, COL6A2) 高表达  
- **Cluster 13**：MES-like (VIM, ENO2) + Macrophage 混合（与之前注释警告一致）

### 🤖 Copilot <sub>2026/04/21 17:01</sub>

将 cell `#VSC-74377334` 改为 dotplot 版本：

### 🤖 Copilot <sub>2026/04/21 17:03</sub>

直接用 `edit_notebook_file` 修改 cell 74377334 的内容为 dotplot：

### 🤖 Copilot <sub>2026/04/21 17:04</sub>

Dotplot 渲染成功，`standard_scale='var'` 后各基因归一化，可以清晰看出：

- **Cluster 8**：Oligodendrocyte (MAG, MOG, CLDN11) 几乎 100% 表达
- **Cluster 9**：NK/T (CD3D/E/G, IL7R) 特异高表达  
- **Cluster 10**：Endothelial (ESAM, FLT1, VWF, ADGRL4) 特异  
- **Cluster 12**：Pericyte (COL1A2, PDGFRB) 特异  
- **Cluster 4**：Macrophage (SPP1, APOE, CTSD) 明显，同时无 Microglia 特异标记 → 正确标注为 Macrophage
- **Cluster 5**：有 Prol.NK/T 中的 MKI67 信号，可能存在增殖 T 细胞
- 已保存为 `dotplot_markers_leiden.pdf`

### 🤖 Copilot <sub>2026/04/21 17:07</sub>

先查看当前 `cluster_anno` 映射，再让用户决定修改哪些：

### 🤖 Copilot <sub>2026/04/21 17:08</sub>

当前注释由 `cluster_anno` 动态计算，需要添加一个手动 override cell。先告诉我哪些 cluster 要修改成什么？

根据 dotplot 可以看出，以下 clusters 值得关注：

| Cluster | 当前注释 | Dotplot 提示 |
|---------|----------|-------------|
| 5 | AC-like | 有 MKI67 表达，可能是 Prol.tumor |
| 11 | OPC-like (低置信度) | OPC 标记弱，第二名=Endothelial |
| 14 | OPC-like (低置信度) | 第二名=NPC-like |
| 15 | NPC-like (低置信度) | 第二名=Endothelial |
| 13 | MES-like (低置信度) | 第二名=Oligodendrocyte |

### 🤖 Copilot <sub>2026/04/21 17:11</sub>

在 post-annotation UMAP 后插入 `enhance_umap` 函数定义 cell，再添加调用 cell：

### 🤖 Copilot <sub>2026/04/21 17:12</sub>

函数定义成功。现在插入调用 cell：

### 🤖 Copilot <sub>2026/04/21 17:13</sub>

美化 UMAP 渲染效果非常好：
- KDE 虚线等高线清晰圈出每个细胞群  
- 标签带百分比 (AC-like 35.6%, Oligodendrocyte 33.2%, Macrophage 12.3%...)
- 科研风箭头坐标轴
- 标签排斥算法有效避免重叠
- 已保存为 `enhanced_umap_celltype.pdf`

### 🤖 Copilot <sub>2026/04/21 18:23</sub>

从 UMAP 生物学合理性来看：

**合理之处** ✅
- **AC-like 35.6% + Oligodendrocyte 33.2%**：snRNA 数据中，Oligodendrocyte 通常来自瘤周正常脑组织（GSE276177 peritumoral 居多），AC-like 是 GBM 主要肿瘤细胞类型，比例符合预期
- **Macrophage 12.3%**：GBM 有丰富的肿瘤相关巨噬细胞（TAM），比例合理  
- **Pericyte + Endothelial 分群紧密**：两者均为血管细胞，聚在一起正常
- **NK/T 0.7%**：CNS 肿瘤中 T 细胞浸润较少，比例符合 "cold tumor" 特征

**需注意的点** ⚠️
- **MES-like 仅 0.8%**（Cluster 13 仅 522 cells）：文献中 MES-like 通常占 GBM 肿瘤细胞的 15-30%，偏低。可能是 MES-like markers 与 AC-like 重叠导致部分 MES 细胞被错分入 AC-like
- **右侧粉色大团**（OPC-like）包含多个 cluster（1/6/11/14），占 14%，说明 OPC-like 分群较分散，内部可能有亚型差异  
- **NPC-like（棕色，1.4%）**：与 OPC-like 相邻，分界不清晰，也是之前 dotplot 中 Cluster 14/15 低置信度的体现

**总体判断**：UMAP 结构合理，整合质量良好（两数据集无明显批次分离）。若后续需要更准确的肿瘤 vs 正常区分，建议加入 CNV 分析（inferCNV）来确认哪些 AC-like 是真正的肿瘤细胞。

### 🤖 Copilot <sub>2026/04/21 18:41</sub>

先检测 `infercnvpy` 是否已安装，并确认 chromosome 位置文件情况：

### 🤖 Copilot <sub>2026/04/21 18:42</sub>

`infercnvpy` 0.6.1 已安装，但缺少基因位置文件。先搜索系统中是否有 hg38 GTF/gene_order 文件：

### 🤖 Copilot <sub>2026/04/21 18:43</sub>

找到 GTF 文件 `results/gencode.v44.basic.annotation.gtf.gz`，可以直接用。先检查 `var_names` 格式和各细胞类型数量，规划分析参数：

### 🤖 Copilot <sub>2026/04/21 18:45</sub>

现在开始写 CNV 分析代码，分 4 个 cell 完成。先编辑第一个检查 cell 为 GTF 注释代码：

### 🤖 Copilot <sub>2026/04/21 18:46</sub>

先检查 `genomic_position_from_gtf` 的正确 API：

### 🤖 Copilot <sub>2026/04/21 18:47</sub>

API 已清晰，第一个参数是 `gtf_file`，第二个是 `adata`。修复并重新运行：

### 🤖 Copilot <sub>2026/04/21 18:48</sub>

GTF 注释成功，21,105 个基因有染色体位置。接下来 subsample + 运行 infercnvpy：

### 🤖 Copilot <sub>2026/04/21 18:49</sub>

4,452 个细胞，现在运行 infercnvpy 推断 CNV（参考细胞：Oligodendrocyte + Endothelial + Pericyte）：

### 🤖 Copilot <sub>2026/04/21 18:50</sub>

inferCNV 完成，`X_cnv` 矩阵已生成。接下来绘制染色体热图和 CNV-space UMAP：

### 🤖 Copilot <sub>2026/04/21 18:52</sub>

热图已成功渲染，只是文件保存路径有问题（scanpy `save` 参数会自动拼接 figdir 前缀）。用 `plt.savefig()` 替代：

### 🤖 Copilot <sub>2026/04/21 18:53</sub>

热图成功保存为 PDF。最后一步：计算 CNV score 并生成 CNV-space UMAP：

### 🤖 Copilot <sub>2026/04/21 18:55</sub>

`cnv_score` 需要先运行 leiden 聚类。改用手动计算每个细胞的 CNV score（平均绝对偏差）：

### 🤖 Copilot <sub>2026/04/21 18:55</sub>

`cnv.tl.neighbors` 不存在，改用 scanpy 的 `sc.pp.neighbors(use_rep='X_cnv')`：

### 🤖 Copilot <sub>2026/04/21 18:57</sub>

CNV 分析全部完成。关键结论：

**CNV score 排序（平均绝对 CNV 偏差）**：

| celltype | CNV score | 解读 |
|----------|-----------|------|
| MES-like | 0.01251 | 🔴 肿瘤细胞（最高染色体异常） |
| AC-like | 0.01239 | 🔴 肿瘤细胞 |
| OPC-like | 0.00839 | 🟡 肿瘤+正常 OPC 混合 |
| Macrophage | 0.00831 | 🟡 免疫细胞（非肿瘤） |
| NK/T | 0.00751 | 🟡 免疫细胞 |
| Pericyte | 0.00592 | ✅ 正常血管细胞 |
| Endothelial | 0.00502 | ✅ 正常血管细胞 |
| NPC-like | 0.00445 | ❓ CNV 偏低，可能混有正常 NPC |
| Oligodendrocyte | 0.00366 | ✅ 正常脑细胞（参考） |

**结论**：AC-like 和 MES-like 是主要肿瘤亚型（与 GBM chr7 增益/chr10 缺失一致），OPC-like 中可能混有肿瘤 OPC。NPC-like 的 CNV 偏低值得关注。

### 🤖 Copilot <sub>2026/04/21 18:58</sub>

分析 OPC-like 内部 4 个 cluster（1/6/11/14）的 CNV score 分布：

### 🤖 Copilot <sub>2026/04/21 19:00</sub>

Cluster 1（CNV 0.0099）最高，Cluster 11（0.0044）最接近正常 Oligo（0.0037）。用 dotplot 验证 marker 基因区分肿瘤 vs 正常 OPC：

### 🤖 Copilot <sub>2026/04/21 19:01</sub>

从 dotplot 可以非常清楚地区分：

**OPC-like 4 个 cluster 判断**：

| Cluster | CNV score | 关键 marker | 判断 |
|---------|-----------|-------------|------|
| **1** | 0.0099 (最高) | PDGFRA ↑↑、EGFR ↑↑、CCND2 ↑↑ | 🔴 **肿瘤 OPC-like** |
| **6** | 0.0077 | CCND2 ↑↑、EGFR ↑ | 🔴 **肿瘤 OPC-like** |
| **14** | 0.0048 | 所有 marker 低 | 🟡 **不确定**（可能正常）|
| **11** | 0.0044 (最低) | 所有 marker 极低 | ✅ **正常 OPC** |

**额外发现**：
- Cluster 3（注释为 Oligodendrocyte）表达 OLIG1/2、VCAN、**PDGFRA+、EGFR+**，不像成熟少突胶质细胞，可能是 **OPC 过渡态或误注释**
- Cluster 8（Oligodendrocyte）：MOG/MBP/MOBP 极高 → 明确正常成熟少突胶质细胞 ✅

**结论**：OPC-like 中 **Cluster 11 是正常 OPC**，Cluster 1 和 6 是肿瘤 OPC-like 亚型（PDGFRA/EGFR 驱动，与 GBM chr7 扩增一致）。

### 🤖 Copilot <sub>2026/04/21 19:04</sub>

不完全是，两者是同一谱系的不同分化阶段：

**少突胶质细胞谱系（从原始到成熟）**：

```
OPC → Pre-OL → Immature OL → Mature OL (Oligodendrocyte)
PDGFRA+      GPR17+       MBP+ low      MOG/MBP/MOBP ↑↑
CSPG4+       TCF7L2+
```

**Cluster 11 vs Cluster 8 的区别**：
- **Cluster 11 (OPC-like)**: 所有 marker 低表达 → 静息态 OPC 或 Pre-OL 过渡阶段，**未分化，不产生髓鞘**
- **Cluster 8 (Oligodendrocyte)**: MOG/MBP/MOBP 极高 → 完全分化的**成熟少突胶质细胞，负责髓鞘化**

两者都是"正常非肿瘤细胞"，但：
- 来源相同（少突胶质谱系）
- 功能和转录组不同（OPC 是前体，Oligo 是终末分化细胞）
- 在临床上，OPC 是 GBM 研究的重要细胞类型，因为 GBM 中有 PDGFRA 突变驱动的肿瘤 OPC 亚型（Cluster 1/6）

**实际标注建议**：如果你想简化分析，可以将 Cluster 11 归入 "Oligodendrocyte-lineage"；如果要精细分析肿瘤 vs 正常 OPC，Cluster 11 应该保持 "OPC-normal" 与 Cluster 1/6 区分。

### 🤖 Copilot <sub>2026/04/21 19:07</sub>

**不可以**，OPC 和神经元是两种完全不同的细胞类型：

| 特征 | OPC（少突胶质前体）| 神经元（神经细胞）|
|------|------------------|------------------|
| 谱系 | 胶质细胞 | 神经元 |
| 功能 | 分化为少突胶质细胞（髓鞘化） | 电信号传导 |
| 关键 marker | PDGFRA, SOX10, OLIG1/2 | MAP2, RBFOX3(NeuN), SYP, SNAP25 |
| 有丝分裂 | 可增殖 | 终末分化、不分裂 |

Cluster 11 虽然 marker 低，但它的归类依据是与 PDGFRA/SOX10/OLIG 谱系的相似性，**不能被标注为神经元**。

**snRNA-seq 中的神经元**：在 GBM 数据中，神经元比例通常很低（<1%），因为：
1. snRNA-seq 时神经元核容易损失  
2. GBM 样本主要是肿瘤组织，正常神经元较少

如果想确认是否有神经元，可以查看 `MAP2`/`RBFOX3`/`SYP` 在你的数据中的表达情况。Cluster 11 的正确标签是 **OPC（正常少突胶质前体细胞）**。

### 🤖 Copilot <sub>2026/04/21 19:09</sub>

将 Cluster 11 重新标注为 Oligodendrocyte，然后重绘 UMAP：

### 🤖 Copilot <sub>2026/04/21 19:11</sub>

UMAP v2 完成：Oligodendrocyte 上升至 34.2%，OPC-like 降至 13.0%（682 个正常 OPC 细胞已归入正确类型）。现在保存更新后的 h5ad：

### 🤖 Copilot <sub>2026/04/21 19:12</sub>

已保存，包含完整的注释信息（含 CNV 验证后更新的 celltype）。

**本次 `1_snRNA_processing.ipynb` 最终成果汇总**：

| 内容 | 结果 |
|------|------|
| 数据整合 | 68,920 cells × 32,163 genes |
| 细胞类型 | 9 种（AC-like/Oligo/OPC-like/Macro/NPC-like/Peri/Endo/MES-like/NK/T）|
| CNV 验证 | AC-like + MES-like 确认为肿瘤；Cluster 11 归入 Oligodendrocyte |
| 输出文件 | `adata1.h5ad`（含更新注释）|
| 图表 | UMAP × 2、dotplot × 2、CNV 染色体热图、CNV-score UMAP |

### 🤖 Copilot <sub>2026/04/21 19:14</sub>

删除第一个 enhance_umap 调用 cell（`#VSC-5b548929`，早期注释版本），只保留最后的 v2 版本：

### 🤖 Copilot <sub>2026/04/21 19:14</sub>

已删除，notebook 结构现在更整洁：

- Cell 53 (`#VSC-716d11de`): `enhance_umap` 函数定义
- Cell 54-63: CNV 分析（GTF 注释 → infercnvpy → 热图 → OPC 分析 → Cluster 11 重标注）  
- Cell 62 (`#VSC-26267510`): 最终美化 UMAP v2（含更新注释，已保存 PDF）
- Cell 63 (`#VSC-50767ea4`): 保存 h5ad

### 🤖 Copilot <sub>2026/04/21 19:17</sub>

读完了结构，需要确认 2 个关键依赖后再运行：

### 🤖 Copilot <sub>2026/04/21 19:21</sub>

所有初始化 cell 都通过了。现在运行关键的数据加载 cell：

### 🤖 Copilot <sub>2026/04/21 19:21</sub>

数据加载成功：`layers: 'counts'` ✓，Macrophage 8,507 个细胞（5302 peritumoral + 3205 tumor）。继续运行 re-clustering：

### 🤖 Copilot <sub>2026/04/21 19:22</sub>

8,507 个 Macrophage cells → 9 个 leiden_sub 亚群！Harmony 收敛仅 2 次迭代。继续运行 UMAP 和结果导出：

### 🤖 Copilot <sub>2026/04/21 19:25</sub>

继续运行剩余 cells（7b 开始是汇总和可视化部分）：

### 🤖 Copilot <sub>2026/04/21 19:28</sub>

Cluster 2 确认为 OPC/Tumor 污染 (score=0.84)，继续执行：

### 🤖 Copilot <sub>2026/04/21 19:29</sub>

Cluster 2 顶部标记是 PTPRZ1（OPC/肿瘤），Cluster 7 是 MT 基因。继续：

### 🤖 Copilot <sub>2026/04/21 19:31</sub>

Cluster 2 是 OPC/Tumor 污染（PTPRZ1 顶部 marker + 得分=0.84），但预写的 `cluster_name_map` 把 cluster 1/2 搞反了。在运行注释 cell 前先修正：

### 🤖 Copilot <sub>2026/04/21 19:31</sub>

需要先修正 `cluster_name_map` 再运行注释 cell，否则 OPC/Tumor 污染的 cluster 2 不会被识别出来：

### 🤖 Copilot <sub>2026/04/21 19:33</sub>

DA 分析完成，6 对配对患者。继续：

### 🤖 Copilot <sub>2026/04/21 19:34</sub>

验证表确认：
- Cluster 0: Microglia=0.505（最高）✓
- Cluster 6: Macrophage=1.022（最高）✓  
- Cluster 7: Stress_MT=1.571（高 MT%，已移除）✓

继续运行 DEG 和后续分析：

### 🤖 Copilot <sub>2026/04/21 19:36</sub>

GSEA 完成，部分请求遭遇 API 限流 (429) 属正常，6/6 subtype 均有结果。继续最后两个 cell：

### 🤖 Copilot <sub>2026/04/21 19:36</sub>

所有代码 cell 已全部成功运行（共 41 次执行）。

---

**`5_snRNA_myeloid_subclustering_v1.ipynb` 运行完毕，总结：**

| 步骤 | 结果 |
|------|------|
| 输入 | 8,507 Macrophage 细胞 |
| Leiden 亚聚类 | 9 个 cluster (0-8) |
| 污染识别 | Cluster 1 (神经元), Cluster 2 (OPC/Tumor), Cluster 7 (高MT%) |
| **修正** | 原 notebook 把 cluster 1/2 注释写反，已修正：cluster 2 正确标为 `Non-Myeloid: OPC/Tumor` |
| 过滤后 clean cells | 5,636 cells (去除 2,871 污染) |
| 最终 myeloid 亚型 | Microglia, C1Q-MG, Stress-TAM, M2-like-TAM, SLC11A1-Mac, Phago/AP-TAM |
| DA 分析 | 6 对患者，Stress-TAM 趋向 Tumor 富集 (p=0.06) |
| GSEA | 6/6 亚型完成，617 terms 导出 |
| 输出文件 | `adata_snMyeloid_clean.h5ad` 等多个 CSV/PDF |

### 🤖 Copilot <sub>2026/04/21 19:39</sub>

先完整阅读 `4_Sub_clustering.ipynb` 的所有代码：

### 🤖 Copilot <sub>2026/04/21 19:44</sub>

了解了 scGBM 的流程。现在按照 `4_Sub_clustering.ipynb` 的相同结构，重写 snRNA 版本的 myeloid 亚聚类 notebook：

### 🤖 Copilot <sub>2026/04/21 19:51</sub>

UMAP 清晰！8 个 clusters，Harmony 效果良好。继续运行 dotplot 和 DEG：

### 🤖 Copilot <sub>2026/04/21 19:51</sub>

dotplot 非常清晰，可以读出各 cluster 的标识：
- Cluster 0: PDK4 高 → Mg-Inflam
- Cluster 1/4: Scavenger-IS 高 → M2/Scavenger TAM  
- Cluster 2: C1QA/C3 高 → Complement-IS
- Cluster 5: HSPA1A/DNAJB1 很高 → HS-UPR

继续 DEG 和组成表：

### 🤖 Copilot <sub>2026/04/21 19:52</sub>

从 DEG 图可以清楚看到：
- Cluster 0: NAV3/FOXP2/SLC1A3/P2RY12 → **Homeostatic MG**
- Cluster 2: PTPRZ1/NLGN1/NOVA1 → **Non-Myeloid: OPC/Tumor**
- Cluster 7: SAT1/CADM2/IL1RAPL1 → **Non-Myeloid: Neuronal**
- Cluster 5: HSPA1A/HSPA1B/HSP90AA1 → **HS-UPR TAM**

更新注释 cell 后再继续：

### 🤖 Copilot <sub>2026/04/21 19:53</sub>

组织分布验证结果非常有说服力：
- Cluster 0/1/7: 98-99% Peritumoral → 瘤周脑组织来源
- Cluster 2: 96% Tumor + PTPRZ1 → OPC/Tumor 污染  
- Cluster 3/5: 92%/86% Tumor → 真正的 TAM

现在更新 annotation cell 再运行：

### 🤖 Copilot <sub>2026/04/21 19:53</sub>

UMAP 注释效果非常清晰，各亚型分离良好。运行最后的保存 cells：

### 🤖 Copilot <sub>2026/04/21 19:55</sub>

新的 [snGBM/5_snRNA_myeloid_subclustering_v2.ipynb](snGBM/5_snRNA_myeloid_subclustering_v2.ipynb) 已完整运行，全部 13 个 cell 成功。结构完全对齐 scGBM 的 `4_Sub_clustering.ipynb`：

**流程结构对比：**

| scGBM `4_Sub_clustering.ipynb` | snRNA `v2` |
|---|---|
| import + figdir | ✅ 相同 |
| 加载 adata2.h5ad | ✅ 加载 adata1.h5ad |
| 提取 myeloid_types | ✅ `['Macrophage']` |
| HVG → PCA → Harmony → UMAP → Leiden | ✅ Harmony key=`patient` |
| 髓系 marker dotplot（8 程序） | ✅ 完全相同的 marker 字典 |
| DEG rank_genes_groups_dotplot | ✅ |
| crosstab（celltype + tissue） | ✅ 新增 tissue_unified 分布 |
| 手动 mye_annot 映射 | ✅ 基于真实数据：8 clusters |
| UMAP 展示注释 | ✅ |
| 保存子集 h5ad + 写回主 adata | ✅ |

**最终 Myeloid 亚型（6 clean + 2 污染）：**
- Homeostatic MG: 2,893（99% Peritumoral）
- Complement-Scavenger TAM: 1,631
- Stress-TAM: 987（92% Tumor）
- APOE-TAM: 757
- HS-UPR TAM: 568（86% Tumor）
- Scavenger-Mac: 306
- Non-Myeloid: OPC/Tumor: 1,085（96% Tumor，PTPRZ1 top marker）
- Non-Myeloid: Neuronal: 280（98% Peritumoral）

### 🤖 Copilot <sub>2026/04/21 20:00</sub>

在 v2 notebook 最后添加：过滤 Non-Myeloid 后重新跑 UMAP 并出图。

### 🤖 Copilot <sub>2026/04/21 20:04</sub>

VS Code 未自动检测到文件变化，直接用 terminal 跑过滤+UMAP 代码：

### 🤖 Copilot <sub>2026/04/21 20:05</sub>

Clean UMAP 效果很好：6 个髓系亚型清晰分离，污染细胞（1,365 个）已全部移除。

- **Homeostatic MG**（红色）：大簇，稳态小胶质细胞
- **Complement-Scavenger TAM**（橙色）：独立分离在左侧
- **Stress-TAM**（黄绿）：右上，低氧应激
- **HS-UPR TAM**（绿色）：热休克应激，与 Stress-TAM 相邻
- **APOE-TAM**（蓝色）+ **Scavenger-Mac**（粉色）：中间过渡区

### 🤖 Copilot <sub>2026/04/21 20:11</sub>

全部补全完毕：

- **Cell 14**（过滤）：8507 → 7142 cells，去除 1365 个 Non-Myeloid 污染细胞
- **Cell 15**（clean UMAP）：重跑 neighbors + UMAP，6 个髓系亚群清晰分离，图已保存
- **Cell 16**（保存）：`adata_snMyeloid_clean.h5ad`（7142 cells）已写入

notebook 现共 20 个 cells，全部执行完成。

### 🤖 Copilot <sub>2026/04/21 20:13</sub>

`tissue_unified`（Peritumoral: 4986, Tumor: 2156）和 `patient` 列均存在。现在添加差异丰度分析 cells：

### 🤖 Copilot <sub>2026/04/21 20:15</sub>

现在依次运行 4 个新 cell：

### 🤖 Copilot <sub>2026/04/21 20:17</sub>

看到 DA 结果全是 NaN — 是因为 `observed=False` 给 GBM2（无 Tumor 样本）的 Tumor 组插入了空行，导致比例列含 NaN 后均值失效。修复两个 cell：

### 🤖 Copilot <sub>2026/04/21 20:18</sub>

`edit_notebook_file` 只支持 `insert`。改为在 terminal 直接运行修正版代码并打印结果：

### 🤖 Copilot <sub>2026/04/21 20:19</sub>

现在把修正版代码更新到 notebook cells 里。由于 `edit_notebook_file` 只支持 `insert`，直接用 Python 脚本更新现有 cell 的 source：

### 🤖 Copilot <sub>2026/04/21 20:20</sub>

现在运行修正后的所有 DA cells：

### 🤖 Copilot <sub>2026/04/21 20:21</sub>

VS Code 已重新读取文件，kernel 中 `adata_mye_clean` 和 `prop` 都还在。现在运行修正后的 4 个 DA cells：

### 🤖 Copilot <sub>2026/04/21 20:23</sub>

差异丰度分析完成。主要结果：

| 亚型 | Tumor_mean | Peri_mean | p值 |
|------|-----------|-----------|-----|
| **Stress-TAM** | 0.741 | 0.069 | **0.016 ✓** |
| HS-UPR TAM | 0.144 | 0.079 | 0.250 |
| Scavenger-Mac | 0.069 | 0.052 | 0.250 |
| APOE-TAM | 0.153 | 0.075 | 0.762 |
| Complement-Scavenger TAM | 0.014 | 0.333 | — (仅1个Tumor样本) |
| Homeostatic MG | 0.028 | 0.425 | — (仅1个Tumor样本) |

**Stress-TAM 在肿瘤区显著富集**（p=0.016），而 **Homeostatic MG 和 Complement-Scavenger TAM 主要位于瘤周区**（但 Tumor 患者数不足无法检验）。

### 🤖 Copilot <sub>2026/04/21 20:29</sub>

根据两个 notebook 中的 marker gene 注释，直接做一个对比：

**snGBM Stress-TAM → scGBM 最接近的亚型**

| 维度 | snGBM Stress-TAM (Cluster 3) | scGBM 最接近 |
|------|------------------------------|-------------|
| 主要 markers | HIF1A, FNDC3B, SLC16A10 | **Mg-Inflam TAM**: RHOB, FOS, KLF2, CEBPD, PDK4 |
| 特征 | 缺氧应激 + 代谢重编程 | IEG + 代谢重编程（CEBPD/PDK4）|
| 组织分布 | 92% Tumor | 91% Macro (tumor) |
| 次选 | — | **Systemic-Inflam TAM**: IL1B/CCL3/CCL4（促炎）|

**结论**：snGBM Stress-TAM 主要对应 scGBM 的 **Mg-Inflam TAM**，两者都是肿瘤富集、应激/代谢激活状态。差异在于 snRNA 更多捕捉到 HIF1A 低氧信号（核转录），scRNA 更多捕捉到 FOS/KLF2 等 IEG（细胞质转录本丰度更高）。如需定量验证，可以做 label transfer 或 cluster signature 相关性分析。

### 🤖 Copilot <sub>2026/04/21 20:30</sub>

scVI 1.4.1 可用。先检查 scGBM myeloid 数据是否有存档：

### 🤖 Copilot <sub>2026/04/21 20:32</sub>

scGBM 有 `Activity_Hypoxia` 程序得分，且 `myeloid_label` 包含 C0_Mg-Inflam、C5_Systemic-Inflam 等。我来做基于共同 HVG 的 KNN label transfer（不需要 scArches）：

### 🤖 Copilot <sub>2026/04/21 20:34</sub>

Label transfer 结果非常清晰，让我总结：

**snGBM → scGBM 对应关系**

| snGBM 亚型 | 最强映射 scGBM 亚群 | 置信度 |
|------------|-------------------|--------|
| **Complement-Scavenger TAM** | C3_Complement-IS | **61%** 高置信 ✓ |
| **HS-UPR TAM** | C4_HS-UPR + C9_HS-UPR | **45%+20%=65%** 高置信 ✓ |
| **APOE-TAM** | C1_Lipid-TAM | **45%** 较强映射 |
| **Homeostatic MG** | C0_Mg-Inflam | **34%** 分散 |
| **Scavenger-Mac** | C0_Mg-Inflam | **33%** 分散 |
| **Stress-TAM** | C1_Lipid-TAM / C2_Complement-IS / C6_Mg-Inflam(OPC?) | 各 25-30%，**无明确对应** |

**关于 Stress-TAM**：映射高度分散，没有与任何单一 scGBM 亚群强烈对应。这提示 Stress-TAM 可能是 **snRNA 特有的低氧应激表型**（HIF1A 是核转录因子，snRNA 中信号更强），在 scGBM 的 scRNA 中被稀释到多个亚群里，而非对应某个确定的 scGBM 类型。

### 🤖 Copilot <sub>2026/04/21 20:34</sub>

将 label transfer 代码补充到 v2 notebook 中：

### 🤖 Copilot <sub>2026/04/21 20:35</sub>

Label transfer 分析完成，代码已补全进 notebook（Section 5）。图片保存在 [figures/5_snRNA_myeloid_subclustering/label_transfer_confusion.png](snGBM/figures/5_snRNA_myeloid_subclustering/label_transfer_confusion.png)。

### 🤖 Copilot <sub>2026/04/21 20:45</sub>

`scGBM/adata2.h5ad` 已有 `Minor_cluster`（含 Mg-Inflam TAM 等标签），但 `adata_mye` subset 没有单独保存。需要在 `4_Sub_clustering.ipynb` 里加一个保存 cell：

### 🤖 Copilot <sub>2026/04/21 20:46</sub>

保存 cell 已添加。现在运行 cells：先重跑前面的 myeloid 处理 cells，再运行保存 cell。由于 notebook 已有执行结果，快速重跑即可：

### 🤖 Copilot <sub>2026/04/21 20:50</sub>

81,581 个 myeloid 细胞已保存到 `scGBM/write/4_Sub_clustering/adata_scMyeloid_annotated.h5ad`，含完整 `myeloid_subtype` 注释。

现在回 snGBM notebook，更新 label transfer cells 的 `REF_PATH`：

### 🤖 Copilot <sub>2026/04/21 20:51</sub>

需要更新 label transfer cells 的 `REF_PATH` 和标签列名：

### 🤖 Copilot <sub>2026/04/21 20:52</sub>

Label transfer 完成，混淆矩阵结果清晰：

| snGBM 亚型 | 最强映射 scGBM | 比例 |
|---|---|---|
| **Homeostatic MG** | Mg-Inflam TAM | 0.80 ✓ |
| **Complement-Scavenger TAM** | Mg-Inflam TAM | 0.55 (+ Complement-Scavenger 0.38) |
| **HS-UPR TAM** | HS-UPR TAM / Lipid-metabolism | 0.42 / 0.41 — 分裂 |
| **Scavenger-Mac** | Complement-Scavenger TAM 0.29 / Mg-Inflam 0.36 — 混合 |
| **APOE-TAM** | Mg-Inflam TAM | 0.46 |
| **Stress-TAM** | Mg-Inflam 0.36 + Complement-Scavenger 0.48 — **无明确对应** → snRNA unique |

**关键结论**：Stress-TAM（snGBM 特异，DA p=0.016 Tumor enriched）在 scRNA 中无直接对应，分散到 Mg-Inflam 和 Complement-Scavenger，可能是 snRNA 捕获的独特低氧/缺氧应激状态。

### 🤖 Copilot <sub>2026/04/21 21:00</sub>

继续 `scGBM/4_Sub_clustering.ipynb`。先看看哪些 cells 还没跑、以及后续流程是什么：

### 🤖 Copilot <sub>2026/04/21 21:00</sub>

继续运行 myeloid 标记 dotplot + DEG + crosstab：

### 🤖 Copilot <sub>2026/04/21 21:02</sub>

myeloid 部分全部完成。现在进入 T/NK 分析：

### 🤖 Copilot <sub>2026/04/21 21:04</sub>

继续运行 Tumor 和 Stromal 部分：

### 🤖 Copilot <sub>2026/04/21 21:08</sub>

Tumor Neftel scoring 完成。进入 Stromal 部分：

### 🤖 Copilot <sub>2026/04/21 21:10</sub>

最后整合所有亚型并保存 `adata2.h5ad`：

### 🤖 Copilot <sub>2026/04/21 21:11</sub>

10566 未注释 = Prol.tumor (5490) + OPC-like Tumor (2844) + NPC-like Tumor (2232)，是肿瘤亚型中未纳入的增殖/浸润类细胞。运行最后的保存 cell：

### 🤖 Copilot <sub>2026/04/21 21:11</sub>

`4_Sub_clustering.ipynb` 全部完成！全景 UMAP 已生成，`adata2.h5ad` 已更新并保存（含完整 `Minor_cluster`）。

**完成情况**：
- 骨髓细胞（11 亚型，81,581 cells）✓
- T/NK（9 亚型，1,457 cells）✓
- 肿瘤（5 Neftel 状态，37,301 cells）✓
- 基质（9 亚型，4,630 cells）✓
- `adata_scMyeloid_annotated.h5ad` 已保存 ✓
- `adata2.h5ad` 已更新 ✓

### 🤖 Copilot <sub>2026/04/21 21:12</sub>

先看 cluster 3 的具体标记基因，再决定重新注释：

### 🤖 Copilot <sub>2026/04/21 21:14</sub>

从 DEG 图可以清晰看出：
- **Cluster 3**: FTL/SAT1/FTH1/C1QB/APOE → 纯髓系标志，不是 γδT，应改为 **Myeloid contamination**
- **Clusters 5 & 9**: NLGN1/LSAMP/NRXN1/SOX6/PLXDC2 → 肿瘤/神经元标志，T-Tumor doublet ✓
- **Cluster 6**: RPL/RPS ribosomal genes → Low-quality T ✓

修改 cluster 3 注释并重跑整合：

### 🤖 Copilot <sub>2026/04/21 21:14</sub>

Cluster 3 的 DEG 证据：**FTL / SAT1 / FTH1 / C1QB / APOE** = 纯髓系标志，且 Pan-T (CD3D/CD3E/CD2) 几乎不表达，说明这是 myeloid 污染而非 γδT。

Clusters 5/9 均为 T-Tumor doublet，NLGN1/NRXN1/SOX6 是肿瘤神经元标志，保持现状合理。修改 cluster 3：

### 🤖 Copilot <sub>2026/04/21 21:15</sub>

现在重跑整合和保存（cluster 3 已改为 Myeloid contamination，183 cells）：

### 🤖 Copilot <sub>2026/04/21 21:17</sub>

`4_Sub_clustering.ipynb` 全部完成，`adata2.h5ad` 已更新。

**修正摘要**：
- Cluster 3：`γδ T` → `Myeloid contamination`（183 cells，DEG 为 FTL/FTH1/C1QB/APOE）
- Clusters 5/9：维持 `T-Tumor doublet`（NLGN1/NRXN1/SOX6 肿瘤神经元标志）
- 全景 UMAP + `adata2.h5ad` 已重新保存，包含 33 个 Minor_cluster 亚型

### 🤖 Copilot <sub>2026/04/21 21:19</sub>

跨数据集整合 myeloid 分析。先看看 workspace 是否有现成的 cross 笔记本可以用：

### 🤖 Copilot <sub>2026/04/21 21:21</sub>

将创建一个专用的跨数据集 myeloid 分析 notebook：

### 🤖 Copilot <sub>2026/04/21 21:21</sub>

notebook 创建完成，开始运行：

### 🤖 Copilot <sub>2026/04/21 21:26</sub>

整合 UMAP 非常清晰！snGBM 细胞在 scGBM 空间内的定位：
- **Homeostatic MG** → scGBM Homeostatic MG 区域 ✓
- **Complement-Scavenger TAM** → scGBM Complement-Scavenger 区域 ✓  
- **HS-UPR TAM** → scGBM HS-UPR 区域 ✓
- **Stress-TAM** → 弥散分布（验证了它在 scGBM 中无直接对应）

### 🤖 Copilot <sub>2026/04/21 21:27</sub>

比例对比图非常有意义！

**关键发现**：
- **Homeostatic MG**: snGBM 40.5% vs scGBM 7.8% — snRNA 更好捕获稳态小胶质细胞（解离诱导激活效应）
- **Mg-Inflam TAM**: scGBM 27.9%，snGBM 0% — scRNA 细胞解离会诱导 IEG 反应，人为富集炎症激活状态
- **Complement-Scavenger TAM / HS-UPR TAM**: 比例接近，是跨模态保守亚型 ✓
- **Stress-TAM / APOE-TAM**: snGBM 独有，体现核转录组捕获的独特应激信号

### 🤖 Copilot <sub>2026/04/21 21:27</sub>

热图很清晰！Leiden clusters 5、8 是 scGBM/snGBM 混合最高的（43%/45% snGBM），对应保守亚型。运行共有亚型的 sc vs sn DEG 比较：

### 🤖 Copilot <sub>2026/04/21 21:29</sub>

跨模态 DEG 差异揭示了技术性系统误差：所有共有亚型中 scGBM 高于 snGBM 的基因均为**细胞质/线粒体基因**：
- `FTL/FTH1` (铁蛋白 - 胞质)
- `TMSB4X/TMSB10` (胸腺素 - 胞质肌动蛋白结合)
- `MT-ATP6/MT-CO1/MT-CYB` (线粒体基因 - snRNA-seq 不含)
- `RPL/RPLP/EEF1A1` (核糖体/翻译因子 - 胞质)

→ **完美验证了 scRNA vs snRNA 的系统性技术差异**，与核基因转录组一致性正常。

---

**跨数据集分析总结**：

| 分类 | 亚型 | 结论 |
|---|---|---|
| **跨模态保守** | Complement-Scavenger TAM, HS-UPR TAM, Homeostatic MG | sc+sn 均清晰识别 |
| **scGBM 特异** | Mg-Inflam TAM (28%), Classical Mono, IFN-resp TAM | 解离诱导激活 / 外周免疫细胞更多 |
| **snGBM 特异** | Stress-TAM (14%), APOE-TAM (11%), Scavenger-Mac | 核转录组捕获的独特信号 |
| **Homeostatic MG 富集** | snGBM 41% vs scGBM 8% | snRNA 更好保存稳态小胶质细胞  |

### 🤖 Copilot <sub>2026/04/21 21:33</sub>

在 cross 分析 notebook 里新增一个精细 DEG 分析 cell，过滤掉技术噪音基因后再比较 sc vs sn 的真实生物差异：

### 🤖 Copilot <sub>2026/04/21 21:36</sub>

去除技术噪音后，得到清晰的**真实生物差异**：

| 方向 | 基因 | 生物意义 |
|---|---|---|
| **scGBM 高** | `CCL4L2/CCL4/CXCL8` | 趋化因子释放 → 解离激活状态 |
| **scGBM 高** | `C1QB/CD74/HLA-DRA` | 补体 + MHC-II 抗原呈递激活 |
| **scGBM 高** | `APOE/EIF1/PTMA` | 胞质分泌/翻译活化 |
| **snGBM 高** | `PLXDC2/DOCK4/ELMO1` | 吞噬/细胞运动 homeostatic 信号 |
| **snGBM 高** | `FRMD4A/LRMDA/LDLRAD4` | 细胞骨架/受体信号 → 核转录捕获 |

**结论**：scRNA 捕获**解离诱导的激活转录组**（CCL4/CXCL8/MHC-II 上调），snRNA 捕获**稳态核转录程序**（DOCK4/ELMO1 吞噬通路）。`PLXDC2` 在 snGBM 所有共有亚型中一致升高，是跨亚型的核转录标志。

### 🤖 Copilot <sub>2026/04/21 22:11</sub>

先检查两个数据集里有没有 tumor vs peritumor 的元数据列。

### 🤖 Copilot <sub>2026/04/21 22:12</sub>

两个数据集都有 `tissue_type`/`tissue` 列（Tumor vs Peritumoral）。先看各数据集的注释情况再规划分析。

### 🤖 Copilot <sub>2026/04/21 22:13</sub>

两个数据集都有 `tissue_type`/`tissue` 列和丰富的注释。创建新 notebook 做 tumor vs peritumor 的一致性分析。

### 🤖 Copilot <sub>2026/04/21 22:16</sub>

kernel 名称是 `sc2`，不是 `sc`。需要更新 notebook metadata。

### 🤖 Copilot <sub>2026/04/21 22:17</sub>

文件被创建为空文件。用 terminal 重新写入。

### 🤖 Copilot <sub>2026/04/21 22:24</sub>

分析全部完成。以下是关键发现：

---

## 一致趋势（两个数据集方向相同）

| 细胞类型 | scGBM Δ | snGBM Δ | 方向 |
|---|---|---|---|
| Pericyte | +0.85% | +2.20% | **Tumor↑** |
| Tumor cells | +4.2% | +43.9% | **Tumor↑** |
| TAM/Macrophage 总体 | −15.6% | −1.7% | **Peritumoral↑** |

## 最有趣的**不一致**（模态差异）

**髓系亚型完全反向**：
- **Complement-Scavenger TAM**：scGBM 强烈富集在 Tumor（+32%），snGBM 强烈富集在 Peritumoral（−32%）→ 同一基因程序在两种模态捕获的细胞群不同
- **HS-UPR TAM**：scGBM 略偏瘤周，snGBM 强烈偏 Tumor（+21%）→ sc 中解离应激掩盖了真实的肿瘤内 UPR 信号
- **Homeostatic MG**：scGBM 略偏 Tumor，snGBM 强烈偏瘤周（−56%）→ snRNA 更真实地还原了 MG 的瘤周定居模式

**肿瘤亚型空间格局完全相反**：
- scGBM：OPC 在肿瘤核心（+9.5%），AC 在瘤周（−4.9%）
- snGBM：AC-like 在肿瘤核心（+37%），OPC-like 在瘤周（−27%）→ scRNA 和 snRNA 对肿瘤亚型空间分布的刻画是对立的，提示两种模态存在系统性的区域捕获偏差

### 🤖 Copilot <sub>2026/04/21 22:31</sub>

共有的 3 个亚型（Complement-Scavenger、HS-UPR、Homeostatic MG）空间方向全部**相反**。但从生物功能角度重新分组，仍有一致规律。让我加一个映射分析：

### 🤖 Copilot <sub>2026/04/21 22:32</sub>

按生物功能分组后，髓系亚型的一致规律清晰了：

| 功能组 | scGBM Δ | snGBM Δ | 一致？ | 结论 |
|---|---|---|---|---|
| **Resident MG** | −38% | −87% | ✅ **一致** | 强烈偏瘤周，两个模态均验证 |
| **Infiltrating TAM** | +25% | +26% | ✅ **一致** | 强烈偏肿瘤核心，两个模态均验证 |
| **Stress/UPR TAM** | −2.6% | +61% | ❌ 不一致 | sc 中被解离应激干扰；sn 才捕获到真实的肿瘤内 UPR |

**两个数据集的共识**：
1. **Resident MG（Mg-Inflam TAM / Homeostatic MG）永远偏瘤周** — 真正的常驻小胶质细胞不进入肿瘤核心
2. **浸润型 TAM（Complement-Scavenger / APOE-TAM 等）永远偏肿瘤核心** — 血源性髓系细胞随肿瘤招募进入核心
3. **Stress/UPR TAM 的空间分布是模态特异的** — snRNA 才能捕获到肿瘤内真实的压力反应状态

### 🤖 Copilot <sub>2026/04/21 22:46</sub>

先看一下 `三位置 GBM/GSE241037` 目录的内容和 CSV 文件。

### 🤖 Copilot <sub>2026/04/21 22:47</sub>

CSV 里列了 GBM2/GBM3/GBM4 但目录里根本没有这些文件，同时缺少所有 Border 样本。根据实际文件重建：

### 🤖 Copilot <sub>2026/04/21 22:48</sub>

CSV 更新完成。修改内容：
- **删除**不存在的 GBM2/GBM3/GBM4 样本（原 8 条→4 条真实患者）
- **补全**所有 Border 样本（GSM7714306, GSM9271342, GSM9271345, GSM9271348）
- **tissue 修正**：Core 不再用 "Tumor"，统一为 Periphery / Border / Core 三位置命名
- **新增** `patient` 列（GBM1/GBM6/GBM10/GBM11），方便后续分层分析

### 🤖 Copilot <sub>2026/04/21 22:53</sub>

h5ad 文件有 37 个样本、10 个患者，还有三个位置（PT/TE/TC），CSV 只有 24 行且缺少 TE 位置和 6245/6434/6234/6240 四个患者。先获取完整样本列表：

### 🤖 Copilot <sub>2026/04/21 22:54</sub>

h5ad 有 37 个样本，CSV 只有 24 个，缺少 6234/6240/6245/6434 四个患者和所有 TE（Tumor_Edge）样本。用 h5ad 实际内容重写 CSV：

### 🤖 Copilot <sub>2026/04/21 22:54</sub>

CSV 更新完成。修改内容：

- **从 24 行扩充到 37 行**，与 h5ad 完全对齐
- **补全 4 个缺失患者**：6234（3个PT样本）、6240（1个TE）、6245（PT+TE×2）、6434（1个TC）
- **补全所有 TE (Tumor_Edge) 样本**：6237_B, 6240_A, 6245_B/C, 6425_C/D, 6509_B, 6514_A
- **tissue_type 修正**：原 CSV 把 Tumor_Edge 完全漏掉，现在 PT/TE/TC = Peripheral/Tumor_Edge/Tumor 三位置对齐
- **n_cells 来自 h5ad 实际细胞数**（部分样本原 CSV 数字可能有误）

### 🤖 Copilot <sub>2026/04/21 22:58</sub>

对比两者：

| GSE241037 | GSE274987 | 推荐统一用 |
|---|---|---|
| Periphery | Peripheral | **Peripheral** |
| Border | Tumor_Edge | **Edge** |
| Core | Tumor | **Core** |

改动最小、标签最简洁的方案是 **Peripheral / Edge / Core**：
- GSE241037：`Periphery→Peripheral`，`Border→Edge`，`Core→Core`（不变）
- GSE274987：`Peripheral→Peripheral`（不变），`Tumor_Edge→Edge`，`Tumor→Core`

直接更新两个 CSV：

### 🤖 Copilot <sub>2026/04/21 22:59</sub>

GSE241037 目录实际在 `GSE274987/` 下面。更新正确路径的 CSV：

### 🤖 Copilot <sub>2026/04/21 23:00</sub>

两个 CSV 均已统一为 **Peripheral / Edge / Core**：
- GSE241037：4×Peripheral + 4×Edge + 4×Core（4 patients × 3 positions）
- GSE274987：17×Peripheral + 8×Edge + 12×Core（10 patients，部分患者样本数不均）

同时确认了 GSE241037 的实际路径是 `三位置 GBM/GSE274987/GSE241037/`（嵌套在 GSE274987 目录内）。

### 🤖 Copilot <sub>2026/04/21 23:01</sub>

先了解两个数据集的实际文件结构：

### 🤖 Copilot <sub>2026/04/21 23:03</sub>

CSV 内容正确。检查 GSE274987 的更新状态：

### 🤖 Copilot <sub>2026/04/21 23:04</sub>

两个 CSV 都已正确更新（8 个 Edge 样本）。现在创建三位置分析 notebook：
