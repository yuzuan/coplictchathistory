# GSE1=exp pd1=pd

| Field | Value |
|-------|-------|
| Session ID | `d195b8c5-4757-4f4b-8ea2-439c49ca8d58` |
| Workspace | 合并 GSE1 和 GSE2 数据并校正批次效应 |
| Start | 2025/11/25 11:23 |
| End | 2025/11/25 12:27 |
| Messages | 30 |

---

### 👤 User <sub>2025/11/25 11:24</sub>

GSE1=exp
pd1=pd

GSE2=exp
pd2=pd,现在 GSE1 和 GSE2 合并去批次

### 🤖 Copilot <sub>2025/11/25 11:24</sub>

我来帮你合并 GSE1 和 GSE2 的表达数据并进行批次效应校正。这是一个常见的生物信息学分析任务。

```
import pandas as pd
import numpy as np

# 假设你已经有以下数据：
# GSE1 表达矩阵：exp1 (基因 x 样本)
# GSE1 样本信息：pd1
# GSE2 表达矩阵：exp2 (基因 x 样本)
# GSE2 样本信息：pd2

# 1. 找到共同基因
common_genes = exp1.index.intersection(exp2.index)
print(f"共同基因数量: {len(common_genes)}")

# 提取共同基因
exp1_common = exp1.loc[common_genes]
exp2_common = exp2.loc[common_genes]

# 2. 合并表达矩阵
exp_merged = pd.concat([exp1_common, exp2_common], axis=1)

# 3. 合并样本信息并添加批次标签
pd1['batch'] = 'GSE1'
pd2['batch'] = 'GSE2'
pd_merged = pd.concat([pd1, pd2], axis=0)

# 4. 使用 ComBat 进行批次校正
# 方法一：使用 pycombat
from combat.pycombat import pycombat

# 创建批次向量
batch = pd_merged['batch'].values

# 运行 ComBat
exp_corrected = pycombat(exp_merged, batch)

# 方法二：如果使用 R 的 sva 包（通过 rpy2）
# import rpy2.robjects as ro
# from rpy2.robjects import pandas2ri
# from rpy2.robjects.packages import importr
# pandas2ri.activate()
# sva = importr('sva')
# 
# batch_r = ro.IntVector([1 if b == 'GSE1' else 2 for b in batch])
# exp_corrected = sva.ComBat(dat=exp_merged, batch=batch_r)

print(f"合并后样本数: {exp_corrected.shape[1]}")
print(f"合并后基因数: {exp_corrected.shape[0]}")
```

如果你使用 **R 语言**，可以用以下代码：

```
library(sva)
library(limma)

# 1. 找到共同基因
common_genes <- intersect(rownames(exp1), rownames(exp2))

# 提取共同基因
exp1_common <- exp1[common_genes, ]
exp2_common <- exp2[common_genes, ]

# 2. 合并表达矩阵
exp_merged <- cbind(exp1_common, exp2_common)

# 3. 合并样本信息并添加批次标签
pd1$batch <- "GSE1"
pd2$batch <- "GSE2"
pd_merged <- rbind(pd1, pd2)

# 4. ComBat 批次校正
batch <- pd_merged$batch
mod <- model.matrix(~ 1, data = pd_merged)  # 如果有分组信息可以加入：~ group

# 运行 ComBat
exp_corrected <- ComBat(dat = exp_merged, batch = batch, mod = mod)

# 或者使用 limma::removeBatchEffect
# exp_corrected <- removeBatchEffect(exp_merged, batch = batch)
```

**关键步骤说明：**

| 步骤 | 说明 |
|------|------|
| 1. 找共同基因 | 只保留两个数据集都有的基因 |
| 2. 合并表达矩阵 | 按列（样本）合并 |
| 3. 添加批次标签 | 在样本信息中标记来源 |
| 4. ComBat校正 | 去除批次效应，保留生物学差异 |

**注意事项：**
- 确保基因 ID 格式一致（都是 Symbol 或都是 Entrez ID）
- 如果有分组信息，建议在 ComBat 中指定 `mod` 参数保护生物学差异
- 校正后可以用 PCA 可视化检查批次效应是否消除

需要我根据你的具体数据格式调整代码吗？

### 👤 User <sub>2025/11/25 11:24</sub>

用 R 语言代码

### 🤖 Copilot <sub>2025/11/25 11:24</sub>

```
# ========== GSE1 和 GSE2 合并去批次效应 ==========

library(sva)
library(limma)

# 1. 找到共同基因
common_genes <- intersect(rownames(exp1), rownames(exp2))
cat("共同基因数量:", length(common_genes), "\n")

# 2. 提取共同基因并合并表达矩阵
exp1_common <- exp1[common_genes, ]
exp2_common <- exp2[common_genes, ]
exp_merged <- cbind(exp1_common, exp2_common)

# 3. 合并样本信息并添加批次标签
pd1$batch <- "GSE1"
pd2$batch <- "GSE2"
pd_merged <- rbind(pd1, pd2)

# 确保样本顺序一致
pd_merged <- pd_merged[colnames(exp_merged), ]

# 4. ComBat 批次校正
batch <- pd_merged$batch

# 方法一：ComBat（推荐）
mod <- model.matrix(~ 1, data = pd_merged)
exp_corrected <- ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod)

# 方法二：limma::removeBatchEffect（替代方案）
# exp_corrected <- removeBatchEffect(exp_merged, batch = batch)

# 5. 查看结果
cat("合并后样本数:", ncol(exp_corrected), "\n")
cat("合并后基因数:", nrow(exp_corrected), "\n")

# 6. 可视化检查（PCA）
library(ggplot2)

# 校正前 PCA
pca_before <- prcomp(t(exp_merged), scale. = TRUE)
df_before <- data.frame(PC1 = pca_before$x[,1], PC2 = pca_before$x[,2], batch = batch)
p1 <- ggplot(df_before, aes(PC1, PC2, color = batch)) + 
  geom_point(size = 2) + 
  theme_bw() + 
  ggtitle("校正前 PCA")

# 校正后 PCA
pca_after <- prcomp(t(exp_corrected), scale. = TRUE)
df_after <- data.frame(PC1 = pca_after$x[,1], PC2 = pca_after$x[,2], batch = batch)
p2 <- ggplot(df_after, aes(PC1, PC2, color = batch)) + 
  geom_point(size = 2) + 
  theme_bw() + 
  ggtitle("校正后 PCA")

# 显示图形
library(patchwork)
p1 + p2
```

**如果有分组信息需要保护**（比如 `group` 列区分疾病和对照）：

```
# 在 mod 中加入分组信息，防止 ComBat 把生物学差异也去掉
mod <- model.matrix(~ group, data = pd_merged)
exp_corrected <- ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod)
```

### 👤 User <sub>2025/11/25 11:28</sub>

pd 不是都一致的，但是都有 group列，按照 group 列合并

### 🤖 Copilot <sub>2025/11/25 11:28</sub>

```
# ========== GSE1 和 GSE2 合并去批次效应 ==========

library(sva)
library(limma)

# 1. 找到共同基因
common_genes <- intersect(rownames(exp1), rownames(exp2))
cat("共同基因数量:", length(common_genes), "\n")

# 2. 提取共同基因并合并表达矩阵
exp1_common <- exp1[common_genes, ]
exp2_common <- exp2[common_genes, ]
exp_merged <- cbind(exp1_common, exp2_common)

# 3. 合并样本信息（只保留 group 列，添加批次标签）
pd1_sub <- data.frame(
  sample = colnames(exp1_common),
  group = pd1$group,
  batch = "GSE1",
  row.names = colnames(exp1_common)
)

pd2_sub <- data.frame(
  sample = colnames(exp2_common),
  group = pd2$group,
  batch = "GSE2",
  row.names = colnames(exp2_common)
)

pd_merged <- rbind(pd1_sub, pd2_sub)

# 确保样本顺序一致
pd_merged <- pd_merged[colnames(exp_merged), ]

# 4. ComBat 批次校正（保护 group 信息）
batch <- pd_merged$batch
mod <- model.matrix(~ group, data = pd_merged)  # 保护分组信息

exp_corrected <- ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod)

# 5. 查看结果
cat("合并后样本数:", ncol(exp_corrected), "\n")
cat("合并后基因数:", nrow(exp_corrected), "\n")
table(pd_merged$batch, pd_merged$group)

# 6. 可视化检查（PCA）
library(ggplot2)
library(patchwork)

# 校正前 PCA
pca_before <- prcomp(t(exp_merged), scale. = TRUE)
df_before <- data.frame(
  PC1 = pca_before$x[,1], 
  PC2 = pca_before$x[,2], 
  batch = pd_merged$batch,
  group = pd_merged$group
)
p1 <- ggplot(df_before, aes(PC1, PC2, color = batch, shape = group)) + 
  geom_point(size = 3) + 
  theme_bw() + 
  ggtitle("校正前 PCA")

# 校正后 PCA
pca_after <- prcomp(t(exp_corrected), scale. = TRUE)
df_after <- data.frame(
  PC1 = pca_after$x[,1], 
  PC2 = pca_after$x[,2], 
  batch = pd_merged$batch,
  group = pd_merged$group
)
p2 <- ggplot(df_after, aes(PC1, PC2, color = batch, shape = group)) + 
  geom_point(size = 3) + 
  theme_bw() + 
  ggtitle("校正后 PCA")

p1 + p2
```

**关键点说明：**

| 步骤 | 说明 |
|------|------|
| `pd1_sub` / `pd2_sub` | 只提取需要的 `group` 列，统一格式 |
| `mod = model.matrix(~ group)` | 保护分组信息，不被当作批次效应去除 |
| PCA 可视化 | `color = batch` 看批次，`shape = group` 看分组 |

校正成功后，PCA 图中同一 batch 的点不再聚在一起，而是按 group 聚类。

### 👤 User <sub>2025/11/25 11:31</sub>

exp_corrected <- ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod)
Found 6 genes with uniform expression within a single batch (all zeros); these will not be adjusted for batch.
Found2batches
Adjusting for3covariate(s) or covariate level(s)
Error in ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod) : 
  At least one covariate is confounded with batch! Please remove confounded covariates and rerun ComBat

### 🤖 Copilot <sub>2025/11/25 11:31</sub>

这个错误说明 `group` 和 `batch` 之间存在混杂（confounding），即某些 group 只在某一个 batch 中出现。需要检查并处理：

```
# ========== 检查混杂问题 ==========

# 查看 group 和 batch 的分布
table(pd_merged$batch, pd_merged$group)

# 如果某个 group 只在一个 batch 出现，会导致混杂
# 例如：
#        Control  Disease  Treatment
# GSE1      10       15        0
# GSE2       8       12       10    <- Treatment 只在 GSE2，混杂！

# ========== 解决方案 ==========

# 方案一：只保留两个 batch 都有的 group
common_groups <- intersect(unique(pd1$group), unique(pd2$group))
cat("共同的 group:", common_groups, "\n")

# 筛选样本
keep1 <- pd1$group %in% common_groups
keep2 <- pd2$group %in% common_groups

exp1_filtered <- exp1[, keep1]
exp2_filtered <- exp2[, keep2]
pd1_filtered <- pd1[keep1, ]
pd2_filtered <- pd2[keep2, ]

# 重新合并
common_genes <- intersect(rownames(exp1_filtered), rownames(exp2_filtered))
exp_merged <- cbind(exp1_filtered[common_genes, ], exp2_filtered[common_genes, ])

pd_merged <- data.frame(
  sample = c(colnames(exp1_filtered), colnames(exp2_filtered)),
  group = c(pd1_filtered$group, pd2_filtered$group),
  batch = c(rep("GSE1", ncol(exp1_filtered)), rep("GSE2", ncol(exp2_filtered))),
  row.names = colnames(exp_merged)
)

# 再次检查
table(pd_merged$batch, pd_merged$group)

# 重新运行 ComBat
batch <- pd_merged$batch
mod <- model.matrix(~ group, data = pd_merged)
exp_corrected <- ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod)
```

```
# ========== 方案二：不保护 group，直接去批次 ==========
# 如果必须保留所有样本，可以不在 mod 中指定 group

batch <- pd_merged$batch
mod <- model.matrix(~ 1, data = pd_merged)  # 只用截距，不保护 group

exp_corrected <- ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod)

# 注意：这样可能会损失一些生物学差异
```

```
# ========== 方案三：使用 limma::removeBatchEffect ==========
# limma 对混杂的容忍度更高

library(limma)

# 可以指定 design 保护 group（如果不混杂）
# design <- model.matrix(~ group, data = pd_merged)
# exp_corrected <- removeBatchEffect(exp_merged, batch = pd_merged$batch, design = design)

# 或者直接去批次，不保护
exp_corrected <- removeBatchEffect(exp_merged, batch = pd_merged$batch)
```

**建议步骤：**

1. 先运行 `table(pd_merged$batch, pd_merged$group)` 查看分布
2. 如果有共同的 group → 用**方案一**
3. 如果必须保留所有样本 → 用**方案二**或**方案三**

请先看一下 `table()` 的输出结果，我可以帮你选择最合适的方案。

### 👤 User <sub>2025/11/25 11:32</sub>

table(pd_merged$batch, pd_merged$group)
      
       AD Control normal tumor
  GSE1 31      32      0     0
  GSE2  0       0      4    50

### 🤖 Copilot <sub>2025/11/25 11:32</sub>

问题很清楚了！两个数据集的 group 完全不重叠：

- **GSE1**: AD vs Control
- **GSE2**: tumor vs normal

这是**完全混杂**，无法用 ComBat 保护 group 信息。你需要先统一 group 的定义：

```
# ========== 重新定义 group ==========

# 假设：AD/tumor = 疾病组，Control/normal = 对照组
pd_merged$group_new <- ifelse(pd_merged$group %in% c("AD", "tumor"), "Disease", "Control")

# 检查新的分布
table(pd_merged$batch, pd_merged$group_new)
#       Control Disease
# GSE1      32      31
# GSE2       4      50

# ========== 重新运行 ComBat ==========
batch <- pd_merged$batch
mod <- model.matrix(~ group_new, data = pd_merged)

exp_corrected <- ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod)

# ========== 查看结果 ==========
cat("合并后样本数:", ncol(exp_corrected), "\n")
cat("合并后基因数:", nrow(exp_corrected), "\n")

# ========== PCA 可视化 ==========
library(ggplot2)
library(patchwork)

# 校正前
pca_before <- prcomp(t(exp_merged), scale. = TRUE)
df_before <- data.frame(
  PC1 = pca_before$x[,1], 
  PC2 = pca_before$x[,2], 
  batch = pd_merged$batch,
  group = pd_merged$group_new
)
p1 <- ggplot(df_before, aes(PC1, PC2, color = batch, shape = group)) + 
  geom_point(size = 3) + theme_bw() + ggtitle("校正前")

# 校正后
pca_after <- prcomp(t(exp_corrected), scale. = TRUE)
df_after <- data.frame(
  PC1 = pca_after$x[,1], 
  PC2 = pca_after$x[,2], 
  batch = pd_merged$batch,
  group = pd_merged$group_new
)
p2 <- ggplot(df_after, aes(PC1, PC2, color = batch, shape = group)) + 
  geom_point(size = 3) + theme_bw() + ggtitle("校正后")

p1 + p2
```

**重要提醒：**

⚠️ 即使重新定义 group，这两个数据集的生物学背景差异很大：
- GSE1: 阿尔茨海默病 (AD)
- GSE2: 肿瘤 (tumor)

合并这两个数据集做下游分析时要非常谨慎，需要确认你的研究目的是否合理（比如寻找两种疾病的共同机制）。

如果你的目的不同，请告诉我具体想做什么分析，我可以给出更合适的建议。

### 👤 User <sub>2025/11/25 11:33</sub>

现在合并 control和 normal，他两是一样的

### 🤖 Copilot <sub>2025/11/25 11:33</sub>

```
# ========== 统一 group 名称 ==========

# Control 和 normal 合并为 Control
pd_merged$group_new <- pd_merged$group
pd_merged$group_new[pd_merged$group_new == "normal"] <- "Control"

# 检查新的分布
table(pd_merged$batch, pd_merged$group_new)
#        AD Control tumor
# GSE1   31      32     0
# GSE2    0       4    50

# ========== 运行 ComBat ==========
batch <- pd_merged$batch
mod <- model.matrix(~ group_new, data = pd_merged)

exp_corrected <- ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod)

# ========== 查看结果 ==========
cat("合并后样本数:", ncol(exp_corrected), "\n")
cat("合并后基因数:", nrow(exp_corrected), "\n")
table(pd_merged$batch, pd_merged$group_new)

# ========== PCA 可视化 ==========
library(ggplot2)
library(patchwork)

# 校正前
pca_before <- prcomp(t(exp_merged), scale. = TRUE)
df_before <- data.frame(
  PC1 = pca_before$x[,1], 
  PC2 = pca_before$x[,2], 
  batch = pd_merged$batch,
  group = pd_merged$group_new
)
p1 <- ggplot(df_before, aes(PC1, PC2, color = batch, shape = group)) + 
  geom_point(size = 3) + theme_bw() + ggtitle("校正前")

# 校正后
pca_after <- prcomp(t(exp_corrected), scale. = TRUE)
df_after <- data.frame(
  PC1 = pca_after$x[,1], 
  PC2 = pca_after$x[,2], 
  batch = pd_merged$batch,
  group = pd_merged$group_new
)
p2 <- ggplot(df_after, aes(PC1, PC2, color = batch, shape = group)) + 
  geom_point(size = 3) + theme_bw() + ggtitle("校正后")

p1 + p2
```

现在 `Control` 在两个 batch 中都有（GSE1: 32, GSE2: 4），ComBat 可以利用这个共同的 group 来估计和校正批次效应。

### 👤 User <sub>2025/11/25 11:35</sub>

现在我要看 AD 和 tumor 的差异基因，并做出火山图和热图

### 🤖 Copilot <sub>2025/11/25 11:35</sub>

```
# ========== AD vs tumor 差异分析 ==========

library(limma)
library(ggplot2)
library(pheatmap)

# 1. 筛选 AD 和 tumor 样本
keep <- pd_merged$group_new %in% c("AD", "tumor")
exp_sub <- exp_corrected[, keep]
pd_sub <- pd_merged[keep, ]

# 2. 差异分析 (limma)
group <- factor(pd_sub$group_new, levels = c("Control", "AD", "tumor"))
# 如果只比较 AD vs tumor
group <- factor(pd_sub$group_new, levels = c("tumor", "AD"))  # AD 相对于 tumor

design <- model.matrix(~ 0 + group)
colnames(design) <- levels(group)

fit <- lmFit(exp_sub, design)
contrast <- makeContrasts(AD - tumor, levels = design)
fit2 <- contrasts.fit(fit, contrast)
fit2 <- eBayes(fit2)

# 获取差异结果
DEG <- topTable(fit2, coef = 1, number = Inf, adjust.method = "BH")
DEG$gene <- rownames(DEG)

# 3. 标记差异基因
DEG$change <- "NS"
DEG$change[DEG$logFC > 1 & DEG$adj.P.Val < 0.05] <- "Up"
DEG$change[DEG$logFC < -1 & DEG$adj.P.Val < 0.05] <- "Down"
table(DEG$change)

# ========== 火山图 ==========
p_volcano <- ggplot(DEG, aes(x = logFC, y = -log10(adj.P.Val), color = change)) +
  geom_point(alpha = 0.6, size = 1.5) +
  scale_color_manual(values = c("Down" = "blue", "NS" = "grey", "Up" = "red")) +
  geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "grey40") +
  geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "grey40") +
  theme_bw() +
  labs(x = "log2 Fold Change (AD vs tumor)", 
       y = "-log10(adj.P.Val)", 
       title = "Volcano Plot: AD vs Tumor") +
  theme(legend.position = "right")

print(p_volcano)

# ========== 热图 ==========

# 筛选显著差异基因
sig_genes <- DEG$gene[DEG$change != "NS"]
cat("显著差异基因数量:", length(sig_genes), "\n")

# 如果基因太多，取 top 50
if(length(sig_genes) > 50) {
  top_genes <- DEG[order(abs(DEG$logFC), decreasing = TRUE), ]
  top_genes <- top_genes[top_genes$change != "NS", ][1:50, "gene"]
} else {
  top_genes <- sig_genes
}

# 提取表达矩阵
exp_heatmap <- exp_sub[top_genes, ]

# 标准化（Z-score）
exp_heatmap_scaled <- t(scale(t(exp_heatmap)))

# 注释信息
annotation_col <- data.frame(
  Group = pd_sub$group_new,
  Batch = pd_sub$batch,
  row.names = colnames(exp_heatmap)
)

# 颜色设置
ann_colors <- list(
  Group = c("AD" = "#E41A1C", "tumor" = "#377EB8"),
  Batch = c("GSE1" = "#4DAF4A", "GSE2" = "#984EA3")
)

# 画热图
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = ifelse(length(top_genes) <= 30, TRUE, FALSE),
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",  # 已经 scale 过
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = "Heatmap: AD vs Tumor (Top DEGs)")
```

**输出说明：**

| 内容 | 说明 |
|------|------|
| `DEG` | 完整差异分析结果表 |
| `logFC > 1` | AD 中上调的基因 (相对于 tumor) |
| `logFC < -1` | AD 中下调的基因 (相对于 tumor) |
| `adj.P.Val < 0.05` | 校正后 P 值阈值 |

**保存结果：**

```
# 保存差异基因表
write.csv(DEG, "DEG_AD_vs_tumor.csv", row.names = FALSE)

# 保存图片
ggsave("volcano_AD_vs_tumor.pdf", p_volcano, width = 8, height = 6)
```

### 👤 User <sub>2025/11/25 11:37</sub>

设置一个保存路径'/Users/yuzuan/Desktop/2025_08_10 fastGEO/test/AD_tumor'

### 🤖 Copilot <sub>2025/11/25 11:37</sub>

```
# ========== 设置保存路径 ==========
save_path <- "/Users/yuzuan/Desktop/2025_08_10 fastGEO/test/AD_tumor"

# 创建文件夹（如果不存在）
if(!dir.exists(save_path)) {
  dir.create(save_path, recursive = TRUE)
}

# ========== 保存差异基因表 ==========
write.csv(DEG, file.path(save_path, "DEG_AD_vs_tumor.csv"), row.names = FALSE)

# ========== 保存火山图 ==========
ggsave(file.path(save_path, "volcano_AD_vs_tumor.pdf"), p_volcano, width = 8, height = 6)
ggsave(file.path(save_path, "volcano_AD_vs_tumor.png"), p_volcano, width = 8, height = 6, dpi = 300)

# ========== 保存热图 ==========
pdf(file.path(save_path, "heatmap_AD_vs_tumor.pdf"), width = 10, height = 8)
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = ifelse(length(top_genes) <= 30, TRUE, FALSE),
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = "Heatmap: AD vs Tumor (Top DEGs)")
dev.off()

png(file.path(save_path, "heatmap_AD_vs_tumor.png"), width = 10, height = 8, units = "in", res = 300)
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = ifelse(length(top_genes) <= 30, TRUE, FALSE),
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = "Heatmap: AD vs Tumor (Top DEGs)")
dev.off()

cat("文件已保存到:", save_path, "\n")
```

**保存的文件：**

| 文件名 | 说明 |
|--------|------|
| `DEG_AD_vs_tumor.csv` | 差异基因结果表 |
| `volcano_AD_vs_tumor.pdf/png` | 火山图 |
| `heatmap_AD_vs_tumor.pdf/png` | 热图 |

### 👤 User <sub>2025/11/25 11:39</sub>

save_path <- "/Users/yuzuan/Desktop/2025_08_10 fastGEO/test/AD_tumor"
> 
> # 创建文件夹（如果不存在）
> if(!dir.exists(save_path)) {
+     dir.create(save_path, recursive = TRUE)
+ }
> 
> # ========== 保存差异基因表 ==========
> write.csv(DEG, file.path(save_path, "DEG_AD_vs_tumor.csv"), row.names = FALSE)
> 
> # ========== 保存火山图 ==========
> ggsave(file.path(save_path, "volcano_AD_vs_tumor.pdf"), p_volcano, width = 8, height = 6)
Error: object 'p_volcano' not found

### 🤖 Copilot <sub>2025/11/25 11:39</sub>

需要先运行火山图的代码。以下是完整的火山图和热图代码：

```
# ========== 设置保存路径 ==========
save_path <- "/Users/yuzuan/Desktop/2025_08_10 fastGEO/test/AD_tumor"

if(!dir.exists(save_path)) {
  dir.create(save_path, recursive = TRUE)
}

# ========== 火山图 ==========
library(ggplot2)

p_volcano <- ggplot(DEG, aes(x = logFC, y = -log10(adj.P.Val), color = change)) +
  geom_point(alpha = 0.6, size = 1.5) +
  scale_color_manual(values = c("Down" = "blue", "NS" = "grey", "Up" = "red")) +
  geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "grey40") +
  geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "grey40") +
  theme_bw() +
  labs(x = "log2 Fold Change (AD vs tumor)", 
       y = "-log10(adj.P.Val)", 
       title = "Volcano Plot: AD vs Tumor") +
  theme(legend.position = "right")

print(p_volcano)

# 保存火山图
ggsave(file.path(save_path, "volcano_AD_vs_tumor.pdf"), p_volcano, width = 8, height = 6)
ggsave(file.path(save_path, "volcano_AD_vs_tumor.png"), p_volcano, width = 8, height = 6, dpi = 300)

# ========== 热图 ==========
library(pheatmap)

# 筛选显著差异基因
sig_genes <- DEG$gene[DEG$change != "NS"]
cat("显著差异基因数量:", length(sig_genes), "\n")

# 取 top 50 基因
if(length(sig_genes) > 50) {
  top_genes <- DEG[order(abs(DEG$logFC), decreasing = TRUE), ]
  top_genes <- top_genes[top_genes$change != "NS", ][1:50, "gene"]
} else {
  top_genes <- sig_genes
}

# 提取并标准化
exp_heatmap <- exp_sub[top_genes, ]
exp_heatmap_scaled <- t(scale(t(exp_heatmap)))

# 注释
annotation_col <- data.frame(
  Group = pd_sub$group_new,
  Batch = pd_sub$batch,
  row.names = colnames(exp_heatmap)
)

ann_colors <- list(
  Group = c("AD" = "#E41A1C", "tumor" = "#377EB8"),
  Batch = c("GSE1" = "#4DAF4A", "GSE2" = "#984EA3")
)

# 保存热图
pdf(file.path(save_path, "heatmap_AD_vs_tumor.pdf"), width = 10, height = 8)
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = ifelse(length(top_genes) <= 30, TRUE, FALSE),
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = "Heatmap: AD vs Tumor (Top DEGs)")
dev.off()

# ========== 保存差异基因表 ==========
write.csv(DEG, file.path(save_path, "DEG_AD_vs_tumor.csv"), row.names = FALSE)

cat("文件已保存到:", save_path, "\n")
```

### 👤 User <sub>2025/11/25 11:41</sub>

热图选全部差异基因

### 🤖 Copilot <sub>2025/11/25 11:41</sub>

```
# ========== 热图（全部差异基因） ==========
library(pheatmap)

# 筛选全部显著差异基因
sig_genes <- DEG$gene[DEG$change != "NS"]
cat("显著差异基因数量:", length(sig_genes), "\n")

# 提取并标准化
exp_heatmap <- exp_sub[sig_genes, ]
exp_heatmap_scaled <- t(scale(t(exp_heatmap)))

# 注释
annotation_col <- data.frame(
  Group = pd_sub$group_new,
  Batch = pd_sub$batch,
  row.names = colnames(exp_heatmap)
)

ann_colors <- list(
  Group = c("AD" = "#E41A1C", "tumor" = "#377EB8"),
  Batch = c("GSE1" = "#4DAF4A", "GSE2" = "#984EA3")
)

# 保存热图
pdf(file.path(save_path, "heatmap_AD_vs_tumor_all_DEGs.pdf"), width = 10, height = 12)
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = FALSE,  # 基因太多，不显示基因名
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = paste0("Heatmap: AD vs Tumor (", length(sig_genes), " DEGs)"))
dev.off()

# 同时显示
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = FALSE,
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = paste0("Heatmap: AD vs Tumor (", length(sig_genes), " DEGs)"))

cat("热图已保存到:", file.path(save_path, "heatmap_AD_vs_tumor_all_DEGs.pdf"), "\n")
```

### 👤 User <sub>2025/11/25 12:16</sub>

library(sva)
library(limma)

# 1. 找到共同基因
common_genes <- intersect(rownames(GSE1), rownames(GSE2))
cat("共同基因数量:", length(common_genes), "\n")

# 2. 提取共同基因并合并表达矩阵
exp1_common <- GSE1[common_genes, ]
exp2_common <- GSE2[common_genes, ]
exp_merged <- cbind(exp1_common, exp2_common)

# 3. 合并样本信息并添加批次标签
pd1_sub <- data.frame(
    sample = colnames(exp1_common),
    group = pd1$group,
    batch = "GSE29378",
    row.names = colnames(exp1_common)
)

pd2_sub <- data.frame(
    sample = colnames(exp2_common),
    group = pd2$group,
    batch = "GSE2223",
    row.names = colnames(exp2_common)
)

pd_merged <- rbind(pd1_sub, pd2_sub)

# 确保样本顺序一致
pd_merged <- pd_merged[colnames(exp_merged), ]

# ========== 统一 group 名称 ==========

# Control 和 normal 合并为 Control
pd_merged$group_new <- pd_merged$group
pd_merged$group_new[pd_merged$group_new == "normal"] <- "Control"

# 检查新的分布
table(pd_merged$batch, pd_merged$group_new)
#        AD Control tumor
# GSE1   31      32     0
# GSE2    0       4    50

# ========== 运行 ComBat ==========
batch <- pd_merged$batch
mod <- model.matrix(~ group_new, data = pd_merged)

exp_corrected <- ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod)

# ========== 查看结果 ==========
cat("合并后样本数:", ncol(exp_corrected), "\n")
cat("合并后基因数:", nrow(exp_corrected), "\n")
table(pd_merged$batch, pd_merged$group_new)

# ========== PCA 可视化 ==========
library(ggplot2)
library(patchwork)

# 校正前
pca_before <- prcomp(t(exp_merged), scale. = TRUE)
df_before <- data.frame(
    PC1 = pca_before$x[,1], 
    PC2 = pca_before$x[,2], 
    batch = pd_merged$batch,
    group = pd_merged$group_new
)
p1 <- ggplot(df_before, aes(PC1, PC2, color = batch, shape = group)) + 
    geom_point(size = 3) + theme_bw() + ggtitle("校正前")

# 校正后
pca_after <- prcomp(t(exp_corrected), scale. = TRUE)
df_after <- data.frame(
    PC1 = pca_after$x[,1], 
    PC2 = pca_after$x[,2], 
    batch = pd_merged$batch,
    group = pd_merged$group_new
)
p2 <- ggplot(df_after, aes(PC1, PC2, color = batch, shape = group)) + 
    geom_point(size = 3) + theme_bw() + ggtitle("校正后")

p1 + p2


# ========== AD vs tumor 差异分析 ==========

library(limma)
library(ggplot2)
library(pheatmap)

# 1. 筛选 AD 和 tumor 样本
keep <- pd_merged$group_new %in% c("AD", "tumor")
exp_sub <- exp_corrected[, keep]
pd_sub <- pd_merged[keep, ]

# 2. 差异分析 (limma)
group <- factor(pd_sub$group_new, levels = c("Control", "AD", "tumor"))
# 如果只比较 AD vs tumor
group <- factor(pd_sub$group_new, levels = c("tumor", "AD"))  # AD 相对于 tumor

design <- model.matrix(~ 0 + group)
colnames(design) <- levels(group)

fit <- lmFit(exp_sub, design)
contrast <- makeContrasts(AD - tumor, levels = design)
fit2 <- contrasts.fit(fit, contrast)
fit2 <- eBayes(fit2)

# 获取差异结果
DEG <- topTable(fit2, coef = 1, number = Inf, adjust.method = "BH")
DEG$gene <- rownames(DEG)

# 3. 标记差异基因
DEG$change <- "NS"
DEG$change[DEG$logFC > 1 & DEG$adj.P.Val < 0.05] <- "Up"
DEG$change[DEG$logFC < -1 & DEG$adj.P.Val < 0.05] <- "Down"
table(DEG$change)

# ========== 设置保存路径 ==========
# ========== 设置保存路径 ==========
save_path <- "/Users/yuzuan/Desktop/2025_08_10 fastGEO/test/AD_tumor"

if(!dir.exists(save_path)) {
    dir.create(save_path, recursive = TRUE)
}

# ========== 火山图 ==========
library(ggplot2)

p_volcano <- ggplot(DEG, aes(x = logFC, y = -log10(adj.P.Val), color = change)) +
    geom_point(alpha = 0.6, size = 1.5) +
    scale_color_manual(values = c("Down" = "blue", "NS" = "grey", "Up" = "red")) +
    geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "grey40") +
    geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "grey40") +
    theme_bw() +
    labs(x = "log2 Fold Change (AD vs tumor)", 
         y = "-log10(adj.P.Val)", 
         title = "Volcano Plot: AD vs Tumor") +
    theme(legend.position = "right")

print(p_volcano)

# 保存火山图
ggsave(file.path(save_path, "volcano_AD_vs_tumor.pdf"), p_volcano, width = 8, height = 6)
ggsave(file.path(save_path, "volcano_AD_vs_tumor.png"), p_volcano, width = 8, height = 6, dpi = 300)

# ========== 热图 ==========
library(pheatmap)

# ========== 热图（全部差异基因） ==========
library(pheatmap)

# 筛选全部显著差异基因
sig_genes <- DEG$gene[DEG$change != "NS"]
cat("显著差异基因数量:", length(sig_genes), "\n")

# 提取并标准化
exp_heatmap <- exp_sub[sig_genes, ]
exp_heatmap_scaled <- t(scale(t(exp_heatmap)))

# 注释
annotation_col <- data.frame(
    Group = pd_sub$group_new,
    Batch = pd_sub$batch,
    row.names = colnames(exp_heatmap)
)
#GSE2223=GSE2
#GSE29378=GSE1
ann_colors <- list(
    Group = c("AD" = "#E41A1C", "tumor" = "#377EB8"),
    Batch = c("GSE29378" = "#4DAF4A", "GSE2223" = "#984EA3")
)

# 保存热图
pdf(file.path(save_path, "heatmap_AD_vs_tumor_all_DEGs.pdf"), width = 10, height = 12)
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = FALSE,  # 基因太多，不显示基因名
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = paste0("Heatmap: AD vs Tumor"))
dev.off()

# 同时显示
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = FALSE,
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = paste0("Heatmap: AD vs Tumor "))

cat("热图已保存到:", file.path(save_path, "heatmap_AD_vs_tumor_all_DEGs.pdf"), "\n")# ========== 保存差异基因表 ==========
write.csv(DEG, file.path(save_path, "DEG_AD_vs_tumor.csv"), row.names = FALSE)

cat("文件已保存到:", save_path, "\n")

有什么问题吗？

### 🤖 Copilot <sub>2025/11/25 12:16</sub>

代码整体是正确的！但有几个小问题和优化建议：

## 1. 潜在问题

```
# 这行代码被覆盖了，没有实际作用
group <- factor(pd_sub$group_new, levels = c("Control", "AD", "tumor"))
# 下一行立即覆盖了上面的定义
group <- factor(pd_sub$group_new, levels = c("tumor", "AD"))
```

**修正**：删除第一行，因为你只比较 AD vs tumor，不需要 Control：

```
# 2. 差异分析 (limma)
group <- factor(pd_sub$group_new, levels = c("tumor", "AD"))  # AD 相对于 tumor
```

---

## 2. 最后一行注释和代码混在一起

```
cat("热图已保存到:", file.path(save_path, "heatmap_AD_vs_tumor_all_DEGs.pdf"), "\n")# ========== 保存差异基因表 ==========
```

**修正**：加个换行

```
cat("热图已保存到:", file.path(save_path, "heatmap_AD_vs_tumor_all_DEGs.pdf"), "\n")

# ========== 保存差异基因表 ==========
write.csv(DEG, file.path(save_path, "DEG_AD_vs_tumor.csv"), row.names = FALSE)
```

---

## 3. 建议添加：保存合并后的数据

```
# 保存合并校正后的表达矩阵和样本信息（方便后续分析）
save(exp_corrected, pd_merged, file = file.path(save_path, "merged_data.RData"))
```

---

## 4. 建议添加：保存 PCA 图

```
# 保存 PCA 图
p_pca <- p1 + p2
ggsave(file.path(save_path, "PCA_batch_correction.pdf"), p_pca, width = 12, height = 5)
ggsave(file.path(save_path, "PCA_batch_correction.png"), p_pca, width = 12, height = 5, dpi = 300)
```

---

## 总结

| 问题 | 严重程度 | 状态 |
|------|---------|------|
| group 重复定义 | ⚠️ 轻微（不影响结果） | 建议删除多余行 |
| 注释换行 | ⚠️ 格式问题 | 建议修正 |
| 保存合并数据 | 💡 建议 | 可选 |
| 保存 PCA 图 | 💡 建议 | 可选 |

**其他方面没有问题**，代码逻辑正确，可以正常运行！

### 👤 User <sub>2025/11/25 12:16</sub>

帮我重新写一下

### 🤖 Copilot <sub>2025/11/25 12:16</sub>

```
# ========================================================
# GSE1 和 GSE2 合并去批次效应 + 差异分析
# ========================================================

library(sva)
library(limma)
library(ggplot2)
library(pheatmap)
library(patchwork)

# ========== 设置保存路径 ==========
save_path <- "/Users/yuzuan/Desktop/2025_08_10 fastGEO/test/AD_tumor"
if(!dir.exists(save_path)) {
  dir.create(save_path, recursive = TRUE)
}

# ========== 1. 数据合并 ==========

# 找到共同基因
common_genes <- intersect(rownames(GSE1), rownames(GSE2))
cat("共同基因数量:", length(common_genes), "\n")

# 提取共同基因并合并表达矩阵
exp1_common <- GSE1[common_genes, ]
exp2_common <- GSE2[common_genes, ]
exp_merged <- cbind(exp1_common, exp2_common)

# 合并样本信息并添加批次标签
pd1_sub <- data.frame(
  sample = colnames(exp1_common),
  group = pd1$group,
  batch = "GSE29378",
  row.names = colnames(exp1_common)
)

pd2_sub <- data.frame(
  sample = colnames(exp2_common),
  group = pd2$group,
  batch = "GSE2223",
  row.names = colnames(exp2_common)
)

pd_merged <- rbind(pd1_sub, pd2_sub)
pd_merged <- pd_merged[colnames(exp_merged), ]  # 确保样本顺序一致

# ========== 2. 统一 group 名称 ==========

pd_merged$group_new <- pd_merged$group
pd_merged$group_new[pd_merged$group_new == "normal"] <- "Control"

# 检查分布
cat("\n样本分布:\n")
print(table(pd_merged$batch, pd_merged$group_new))

# ========== 3. ComBat 批次校正 ==========

batch <- pd_merged$batch
mod <- model.matrix(~ group_new, data = pd_merged)

exp_corrected <- ComBat(dat = as.matrix(exp_merged), batch = batch, mod = mod)

cat("\n合并后样本数:", ncol(exp_corrected))
cat("\n合并后基因数:", nrow(exp_corrected), "\n")

# ========== 4. PCA 可视化 ==========

# 校正前
pca_before <- prcomp(t(exp_merged), scale. = TRUE)
df_before <- data.frame(
  PC1 = pca_before$x[,1], 
  PC2 = pca_before$x[,2], 
  batch = pd_merged$batch,
  group = pd_merged$group_new
)
p1 <- ggplot(df_before, aes(PC1, PC2, color = batch, shape = group)) + 
  geom_point(size = 3) + 
  theme_bw() + 
  ggtitle("校正前")

# 校正后
pca_after <- prcomp(t(exp_corrected), scale. = TRUE)
df_after <- data.frame(
  PC1 = pca_after$x[,1], 
  PC2 = pca_after$x[,2], 
  batch = pd_merged$batch,
  group = pd_merged$group_new
)
p2 <- ggplot(df_after, aes(PC1, PC2, color = batch, shape = group)) + 
  geom_point(size = 3) + 
  theme_bw() + 
  ggtitle("校正后")

p_pca <- p1 + p2
print(p_pca)

# 保存 PCA 图
ggsave(file.path(save_path, "PCA_batch_correction.pdf"), p_pca, width = 12, height = 5)
ggsave(file.path(save_path, "PCA_batch_correction.png"), p_pca, width = 12, height = 5, dpi = 300)

# ========== 5. AD vs Tumor 差异分析 ==========

# 筛选 AD 和 tumor 样本
keep <- pd_merged$group_new %in% c("AD", "tumor")
exp_sub <- exp_corrected[, keep]
pd_sub <- pd_merged[keep, ]

# limma 差异分析
group <- factor(pd_sub$group_new, levels = c("tumor", "AD"))  # AD 相对于 tumor
design <- model.matrix(~ 0 + group)
colnames(design) <- levels(group)

fit <- lmFit(exp_sub, design)
contrast <- makeContrasts(AD - tumor, levels = design)
fit2 <- contrasts.fit(fit, contrast)
fit2 <- eBayes(fit2)

# 获取差异结果
DEG <- topTable(fit2, coef = 1, number = Inf, adjust.method = "BH")
DEG$gene <- rownames(DEG)

# 标记差异基因
DEG$change <- "NS"
DEG$change[DEG$logFC > 1 & DEG$adj.P.Val < 0.05] <- "Up"
DEG$change[DEG$logFC < -1 & DEG$adj.P.Val < 0.05] <- "Down"

cat("\n差异基因统计:\n")
print(table(DEG$change))

# ========== 6. 火山图 ==========

p_volcano <- ggplot(DEG, aes(x = logFC, y = -log10(adj.P.Val), color = change)) +
  geom_point(alpha = 0.6, size = 1.5) +
  scale_color_manual(values = c("Down" = "blue", "NS" = "grey", "Up" = "red")) +
  geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "grey40") +
  geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "grey40") +
  theme_bw() +
  labs(x = "log2 Fold Change (AD vs Tumor)", 
       y = "-log10(adj.P.Val)", 
       title = "Volcano Plot: AD vs Tumor") +
  theme(legend.position = "right")

print(p_volcano)

# 保存火山图
ggsave(file.path(save_path, "volcano_AD_vs_tumor.pdf"), p_volcano, width = 8, height = 6)
ggsave(file.path(save_path, "volcano_AD_vs_tumor.png"), p_volcano, width = 8, height = 6, dpi = 300)

# ========== 7. 热图（全部差异基因） ==========

sig_genes <- DEG$gene[DEG$change != "NS"]
cat("\n显著差异基因数量:", length(sig_genes), "\n")

# 提取并标准化
exp_heatmap <- exp_sub[sig_genes, ]
exp_heatmap_scaled <- t(scale(t(exp_heatmap)))

# 注释
annotation_col <- data.frame(
  Group = pd_sub$group_new,
  Batch = pd_sub$batch,
  row.names = colnames(exp_heatmap)
)

ann_colors <- list(
  Group = c("AD" = "#E41A1C", "tumor" = "#377EB8"),
  Batch = c("GSE29378" = "#4DAF4A", "GSE2223" = "#984EA3")
)

# 保存热图
pdf(file.path(save_path, "heatmap_AD_vs_tumor_all_DEGs.pdf"), width = 10, height = 12)
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = FALSE,
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = paste0("Heatmap: AD vs Tumor (", length(sig_genes), " DEGs)"))
dev.off()

# 显示热图
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = FALSE,
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = paste0("Heatmap: AD vs Tumor (", length(sig_genes), " DEGs)"))

# ========== 8. 保存结果 ==========

# 保存差异基因表
write.csv(DEG, file.path(save_path, "DEG_AD_vs_tumor.csv"), row.names = FALSE)

# 保存合并后的数据
save(exp_corrected, pd_merged, file = file.path(save_path, "merged_data.RData"))

# ========== 完成 ==========
cat("\n========== 分析完成 ==========\n")
cat("保存路径:", save_path, "\n")
cat("输出文件:\n")
cat("  - DEG_AD_vs_tumor.csv (差异基因表)\n")
cat("  - volcano_AD_vs_tumor.pdf/png (火山图)\n")
cat("  - heatmap_AD_vs_tumor_all_DEGs.pdf (热图)\n")
cat("  - PCA_batch_correction.pdf/png (PCA图)\n")
cat("  - merged_data.RData (合并数据)\n")
```

### 👤 User <sub>2025/11/25 12:19</sub>

为什么热图显示已损坏

### 🤖 Copilot <sub>2025/11/25 12:19</sub>

热图 PDF 显示损坏通常是因为 `dev.off()` 没有正确关闭，或者绘图过程中出错。以下是修复方案：

```
# ========== 7. 热图（全部差异基因） ==========

sig_genes <- DEG$gene[DEG$change != "NS"]
cat("\n显著差异基因数量:", length(sig_genes), "\n")

# 检查是否有差异基因
if(length(sig_genes) == 0) {
  cat("警告: 没有显著差异基因!\n")
} else {
  
  # 提取并标准化
  exp_heatmap <- exp_sub[sig_genes, ]
  
  # 处理 NA 和 Inf 值
  exp_heatmap <- exp_heatmap[complete.cases(exp_heatmap), ]
  exp_heatmap <- exp_heatmap[apply(exp_heatmap, 1, function(x) all(is.finite(x))), ]
  
  # Z-score 标准化
  exp_heatmap_scaled <- t(scale(t(exp_heatmap)))
  
  # 处理标准化后的 NA（标准差为0的行会产生 NA）
  exp_heatmap_scaled <- exp_heatmap_scaled[complete.cases(exp_heatmap_scaled), ]
  
  # 注释
  annotation_col <- data.frame(
    Group = pd_sub$group_new,
    Batch = pd_sub$batch,
    row.names = colnames(exp_heatmap_scaled)
  )
  
  ann_colors <- list(
    Group = c("AD" = "#E41A1C", "tumor" = "#377EB8"),
    Batch = c("GSE29378" = "#4DAF4A", "GSE2223" = "#984EA3")
  )
  
  # 方法一：使用 pheatmap 直接保存（推荐）
  p_heatmap <- pheatmap(exp_heatmap_scaled,
                        annotation_col = annotation_col,
                        annotation_colors = ann_colors,
                        show_rownames = FALSE,
                        show_colnames = FALSE,
                        cluster_rows = TRUE,
                        cluster_cols = TRUE,
                        scale = "none",
                        color = colorRampPalette(c("blue", "white", "red"))(100),
                        main = paste0("Heatmap: AD vs Tumor (", nrow(exp_heatmap_scaled), " DEGs)"),
                        silent = TRUE)
  
  # 保存 PDF
  ggsave(file.path(save_path, "heatmap_AD_vs_tumor_all_DEGs.pdf"), 
         plot = p_heatmap, width = 10, height = 12)
  
  # 保存 PNG
  ggsave(file.path(save_path, "heatmap_AD_vs_tumor_all_DEGs.png"), 
         plot = p_heatmap, width = 10, height = 12, dpi = 300)
  
  # 显示热图
  print(p_heatmap)
  
  cat("热图已保存\n")
}
```

**主要修复：**

| 问题 | 修复方法 |
|------|---------|
| NA/Inf 值导致绘图失败 | 添加 `complete.cases()` 过滤 |
| `dev.off()` 问题 | 改用 `ggsave()` 保存 pheatmap |
| 标准差为0的基因 | 过滤标准化后的 NA |

---

**如果还是损坏，试试这个替代方案：**

```
# 替代方案：使用 png/pdf 设备
heatmap_file <- file.path(save_path, "heatmap_AD_vs_tumor_all_DEGs.pdf")

# 先关闭所有图形设备
graphics.off()

# 打开 PDF 设备
pdf(heatmap_file, width = 10, height = 12)

# 绘制热图
pheatmap(exp_heatmap_scaled,
         annotation_col = annotation_col,
         annotation_colors = ann_colors,
         show_rownames = FALSE,
         show_colnames = FALSE,
         cluster_rows = TRUE,
         cluster_cols = TRUE,
         scale = "none",
         color = colorRampPalette(c("blue", "white", "red"))(100),
         main = paste0("Heatmap: AD vs Tumor (", nrow(exp_heatmap_scaled), " DEGs)"))

# 关闭设备
dev.off()

cat("热图已保存到:", heatmap_file, "\n")
```

请试试上面的代码，如果还有问题请告诉我错误信息。

### 👤 User <sub>2025/11/25 12:24</sub>

把火山图风格改成p <- ggplot(volcano_data, aes(x = logFC, y = negLogP)) +
  # 非显著基因（背景）
  geom_point(data = volcano_data[volcano_data$DEG == "Not_Change", ], 
             aes(color = Group), size = 0.8, alpha = 0.3) +
  
  # 显著但不高亮的基因
  geom_point(data = volcano_data[volcano_data$DEG == "Down" & volcano_data$Highlight == "No", ], 
             aes(color = Group), size = 1.5, alpha = 0.6) +
  geom_point(data = volcano_data[volcano_data$DEG == "Up" & volcano_data$Highlight == "No", ], 
             aes(color = Group), size = 1.5, alpha = 0.6) +
  
  # 高亮的基因（菱形，更大）
  geom_point(data = volcano_data[volcano_data$DEG == "Down" & volcano_data$Highlight == "Yes", ], 
             aes(color = Group), size = 3, alpha = 0.9, shape = 18) +
  geom_point(data = volcano_data[volcano_data$DEG == "Up" & volcano_data$Highlight == "Yes", ], 
             aes(color = Group), size = 3, alpha = 0.9, shape = 18) +
  
  # 设置颜色
  scale_color_manual(
    name = "Differential Expression",
    values = setNames(
      c("#e74c3c", "#3498db", "#95a5a6"),
      c(
        paste0("Up-regulated (", n_up, ")"),
        paste0("Down-regulated (", n_down, ")"),
        paste0("Not significant (", n_not_sig, ")")
      )
    )
  ) +
  
  # 阈值线
  geom_vline(xintercept = c(-log2FC, log2FC), 
             linetype = "dashed", color = "black", linewidth = 0.6) +
  geom_hline(yintercept = -log10(pvalue), 
             linetype = "dashed", color = "black", linewidth = 0.6) +
  
  # 标注基因名
  geom_text_repel(aes(label = Label), 
                  size = 3.5, 
                  fontface = "bold",
                  max.overlaps = 50,
                  box.padding = 0.5,
                  point.padding = 0.5,
                  segment.color = "gray40",
                  segment.size = 0.4,
                  min.segment.length = 0) +
  
  # 主题
  theme_classic() +
  theme(
    axis.text = element_text(size = 11, color = "black"),
    axis.title = element_text(size = 13, face = "bold"),
    plot.title = element_text(size = 15, face = "bold", hjust = 0.5),
    legend.position = "right",
    legend.title = element_text(size = 12, face = "bold"),
    legend.text = element_text(size = 10),
    legend.key.size = unit(1, "lines")
  ) +
  
  labs(
    title = paste0("Volcano Plot - ", gene_set, " Genes Highlighted"),
    caption = paste0("Threshold: |log2FC| > ", log2FC, ", P < ", pvalue, 
                    " | Highlighted genes: ", length(label_genes)),
    x = expression(log[2]("Fold Change")),
    y = expression(-log[10]("P-value"))
  )

# 保存
volcano_pdf <- paste0(out_dir, "/Volcano_Plot_", gene_set, ".pdf")
ggsave(volcano_pdf, p, width = 12, height = 9)
cat("✓ 火山图已保存:", basename(volcano_pdf), "\n")


### 🤖 Copilot <sub>2025/11/25 12:24</sub>

```
# ========== 6. 火山图（新风格） ==========

library(ggrepel)

# 准备数据
volcano_data <- DEG
volcano_data$negLogP <- -log10(volcano_data$adj.P.Val)

# 设置阈值
log2FC <- 1
pvalue <- 0.05

# 标记差异表达状态
volcano_data$DEG <- "Not_Change"
volcano_data$DEG[volcano_data$logFC > log2FC & volcano_data$adj.P.Val < pvalue] <- "Up"
volcano_data$DEG[volcano_data$logFC < -log2FC & volcano_data$adj.P.Val < pvalue] <- "Down"

# 统计数量
n_up <- sum(volcano_data$DEG == "Up")
n_down <- sum(volcano_data$DEG == "Down")
n_not_sig <- sum(volcano_data$DEG == "Not_Change")

# 设置 Group 用于颜色映射
volcano_data$Group <- factor(
  volcano_data$DEG,
  levels = c("Up", "Down", "Not_Change"),
  labels = c(
    paste0("Up-regulated (", n_up, ")"),
    paste0("Down-regulated (", n_down, ")"),
    paste0("Not significant (", n_not_sig, ")")
  )
)

# 高亮基因（可选：设置要标注的基因，或自动选 top 基因）
# 方法1：手动指定基因
# label_genes <- c("TP53", "EGFR", "BRCA1")

# 方法2：自动选 top 10 上调 + top 10 下调
top_up <- volcano_data[volcano_data$DEG == "Up", ]
top_up <- top_up[order(top_up$logFC, decreasing = TRUE), ][1:min(10, n_up), "gene"]

top_down <- volcano_data[volcano_data$DEG == "Down", ]
top_down <- top_down[order(top_down$logFC), ][1:min(10, n_down), "gene"]

label_genes <- c(top_up, top_down)

# 标记高亮基因
volcano_data$Highlight <- ifelse(volcano_data$gene %in% label_genes, "Yes", "No")
volcano_data$Label <- ifelse(volcano_data$gene %in% label_genes, volcano_data$gene, "")

# 绘图
p_volcano <- ggplot(volcano_data, aes(x = logFC, y = negLogP)) +
  # 非显著基因（背景）
  geom_point(data = volcano_data[volcano_data$DEG == "Not_Change", ], 
             aes(color = Group), size = 0.8, alpha = 0.3) +
  
  # 显著但不高亮的基因
  geom_point(data = volcano_data[volcano_data$DEG == "Down" & volcano_data$Highlight == "No", ], 
             aes(color = Group), size = 1.5, alpha = 0.6) +
  geom_point(data = volcano_data[volcano_data$DEG == "Up" & volcano_data$Highlight == "No", ], 
             aes(color = Group), size = 1.5, alpha = 0.6) +
  
  # 高亮的基因（菱形，更大）
  geom_point(data = volcano_data[volcano_data$DEG == "Down" & volcano_data$Highlight == "Yes", ], 
             aes(color = Group), size = 3, alpha = 0.9, shape = 18) +
  geom_point(data = volcano_data[volcano_data$DEG == "Up" & volcano_data$Highlight == "Yes", ], 
             aes(color = Group), size = 3, alpha = 0.9, shape = 18) +
  
  # 设置颜色
  scale_color_manual(
    name = "Differential Expression",
    values = setNames(
      c("#e74c3c", "#3498db", "#95a5a6"),
      c(
        paste0("Up-regulated (", n_up, ")"),
        paste0("Down-regulated (", n_down, ")"),
        paste0("Not significant (", n_not_sig, ")")
      )
    )
  ) +
  
  # 阈值线
  geom_vline(xintercept = c(-log2FC, log2FC), 
             linetype = "dashed", color = "black", linewidth = 0.6) +
  geom_hline(yintercept = -log10(pvalue), 
             linetype = "dashed", color = "black", linewidth = 0.6) +
  
  # 标注基因名
  geom_text_repel(aes(label = Label), 
                  size = 3.5, 
                  fontface = "bold",
                  max.overlaps = 50,
                  box.padding = 0.5,
                  point.padding = 0.5,
                  segment.color = "gray40",
                  segment.size = 0.4,
                  min.segment.length = 0) +
  
  # 主题
  theme_classic() +
  theme(
    axis.text = element_text(size = 11, color = "black"),
    axis.title = element_text(size = 13, face = "bold"),
    plot.title = element_text(size = 15, face = "bold", hjust = 0.5),
    legend.position = "right",
    legend.title = element_text(size = 12, face = "bold"),
    legend.text = element_text(size = 10),
    legend.key.size = unit(1, "lines")
  ) +
  
  labs(
    title = "Volcano Plot: AD vs Tumor",
    caption = paste0("Threshold: |log2FC| > ", log2FC, ", adj.P < ", pvalue, 
                     " | Highlighted genes: ", length(label_genes)),
    x = expression(log[2]("Fold Change")),
    y = expression(-log[10]("adj.P-value"))
  )

# 显示
print(p_volcano)

# 保存
ggsave(file.path(save_path, "volcano_AD_vs_tumor.pdf"), p_volcano, width = 12, height = 9)
ggsave(file.path(save_path, "volcano_AD_vs_tumor.png"), p_volcano, width = 12, height = 9, dpi = 300)

cat("✓ 火山图已保存:", file.path(save_path, "volcano_AD_vs_tumor.pdf"), "\n")
```

**新风格特点：**

| 特点 | 说明 |
|------|------|
| 分层绘制 | 背景灰色、显著基因突出 |
| 高亮基因 | 菱形标记 + 基因名标注 |
| 自动标注 | Top 10 上调 + Top 10 下调基因 |
| 图例含数量 | 显示各组基因数目 |
| 经典主题 | `theme_classic()` 更简洁 |

**如需手动指定标注基因：**

```
# 替换这行
label_genes <- c("基因1", "基因2", "基因3")
```

### 👤 User <sub>2025/11/25 12:27</sub>

exp_corrected，pd_merged分别保存为 csv文件

### 🤖 Copilot <sub>2025/11/25 12:27</sub>

```
# ========== 保存表达矩阵和样本信息为 CSV ==========

# 保存校正后的表达矩阵（保留行名作为第一列）
exp_corrected_df <- data.frame(gene = rownames(exp_corrected), exp_corrected, check.names = FALSE)
write.csv(exp_corrected_df, file.path(save_path, "exp_corrected.csv"), row.names = FALSE)

# 保存样本信息
write.csv(pd_merged, file.path(save_path, "pd_merged.csv"), row.names = FALSE)

cat("✓ 表达矩阵已保存:", file.path(save_path, "exp_corrected.csv"), "\n")
cat("✓ 样本信息已保存:", file.path(save_path, "pd_merged.csv"), "\n")
```
