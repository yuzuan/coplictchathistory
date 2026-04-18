# library(AnnotationDbi) library(org.Mm.eg.db)

| Field | Value |
|-------|-------|
| Session ID | `3b69abff-4706-4829-88ed-42446378e612` |
| Workspace | R数据框行数不匹配错误解决方案 |
| Start | 2025/12/02 21:59 |
| End | 2025/12/02 22:21 |
| Messages | 8 |

---

### 👤 User <sub>2025/12/02 21:59</sub>

library(AnnotationDbi)
library(org.Mm.eg.db)

anno <- data.frame(ID = exp$V1)

symbol_mapping <- mapIds(org.Mm.eg.db,
                         keys = anno$ID,
                         column = "SYMBOL",
                         keytype = "ENSEMBL",
                         multiVals = "first")

anno$SYMBOL <- symbol_mapping
#anno$SYMBOL[is.na(anno$SYMBOL)] <- anno$ID[is.na(anno$SYMBOL)]
anno <- anno[!is.na(anno$SYMBOL) & anno$SYMBOL != "", ]




library(dplyr)
expr <- as.data.frame(exp)
rownames(expr) <- expr[[1]]
expr <- expr[, -1]
expr$symbol <- anno$SYMBOL
Error in `$<-.data.frame`(`*tmp*`, symbol, value = c("Gnai3", "Pbsn",  : 
  replacement has 27720 rows, data has 39184

### 🤖 Copilot <sub>2025/12/02 21:59</sub>

这个错误是因为 `anno` 和 `expr` 的行数不匹配。在你过滤掉 `NA` 值后，`anno` 只剩下 27720 行，而 `expr` 仍然有 39184 行。

你需要先将 `anno` 与 `expr` 进行匹配，而不是直接赋值。以下是修正后的代码：

```
library(AnnotationDbi)
library(org.Mm.eg.db)
library(dplyr)

# 创建表达式数据框
expr <- as.data.frame(exp)
rownames(expr) <- expr[[1]]
expr <- expr[, -1]

# 创建注释映射
anno <- data.frame(ID = exp$V1)
symbol_mapping <- mapIds(org.Mm.eg.db,
                         keys = anno$ID,
                         column = "SYMBOL",
                         keytype = "ENSEMBL",
                         multiVals = "first")
anno$SYMBOL <- symbol_mapping

# 方法1: 使用匹配的方式添加 symbol（保留所有行）
expr$symbol <- anno$SYMBOL[match(rownames(expr), anno$ID)]

# 方法2: 如果只想保留有 symbol 的行
expr$symbol <- anno$SYMBOL[match(rownames(expr), anno$ID)]
expr <- expr[!is.na(expr$symbol) & expr$symbol != "", ]
```

**关键区别**：

- 使用 `match(rownames(expr), anno$ID)` 来确保按照正确的顺序匹配 SYMBOL
- 过滤操作应该在 `expr` 上进行，而不是单独在 `anno` 上进行

**如果你想用 SYMBOL 作为行名并合并重复的基因**：

```
# 添加 symbol 并过滤
expr$symbol <- anno$SYMBOL[match(rownames(expr), anno$ID)]
expr <- expr[!is.na(expr$symbol) & expr$symbol != "", ]

# 合并重复的 symbol（取平均值）
expr <- expr %>%
  group_by(symbol) %>%
  summarise(across(everything(), mean)) %>%
  as.data.frame()

rownames(expr) <- expr$symbol
expr$symbol <- NULL
```

### 👤 User <sub>2025/12/02 22:11</sub>

library(data.table)
exp <- fread("/Users/yuzuan/Downloads/Downloads/2025_12_01 GSE72737_Dnmt3a_KI_counts_norm.csv.gz")

library(AnnotationDbi)
library(org.Mm.eg.db)

anno <- data.frame(ID = exp$V1)

symbol_mapping <- mapIds(org.Mm.eg.db,
                         keys = anno$ID,
                         column = "SYMBOL",
                         keytype = "ENSEMBL",
                         multiVals = "first")

anno$SYMBOL <- symbol_mapping
#anno$SYMBOL[is.na(anno$SYMBOL)] <- anno$ID[is.na(anno$SYMBOL)]
anno <- anno[!is.na(anno$SYMBOL) & anno$SYMBOL != "", ]




library(dplyr)
expr <- as.data.frame(exp)
rownames(expr) <- expr[[1]]
expr <- expr[, -1]
expr$symbol <- anno$SYMBOL[match(rownames(expr), anno$ID)]
expr <- expr[!is.na(expr$symbol) & expr$symbol != "", ]
expr <- expr %>% filter(!is.na(symbol) & symbol != "")

numeric_cols <- colnames(expr)[sapply(expr, is.numeric)]

expr_final <- expr %>%
    dplyr::select(symbol, all_of(numeric_cols)) %>%
    group_by(symbol) %>%
    summarise(across(everything(), ~ mean(.x, na.rm = TRUE))) %>%
    as.data.frame()

rownames(expr_final) <- expr_final$symbol
expr_final <- expr_final[, -1]

expr=log2(expr_final + 1)
num_samples <- ncol(expr)
expr <- expr[apply(expr, 1, function(x) sum(x != 0) >= (num_samples / 2)), ]

exp=expr

pd=GSE72737_GPL17021_sample_anno

pd <- as.data.frame(pd)
rownames(pd) <- pd[[1]]
pd <- pd[, -1]
small <- function(df){
    library(tibble)
    library(dplyr)
    colname <- vector("character")
    count <- vector("integer")
    for(i in 1:ncol(df)){
        colname[i] = colnames(df)[[i]]
        count[i]=nrow(df[!duplicated(df[,i]),])
    }
    o <- tibble(colname,count) 
    output=df[,o$count>1]
}
pd=small(pd)

current_cols <- colnames(exp)
idx <- match(current_cols, pd$title)
colnames(exp) <- ifelse(is.na(idx), current_cols, pd$geo_accession[idx])

pd$group <- ifelse(grepl("Cre", pd$`genotype:ch1`, ignore.case = TRUE), "Cre",
                   ifelse(grepl("Mx", pd$`genotype:ch1`, ignore.case = TRUE), "Mx",
                          NA))
table(pd$group)



pd$group <- gsub("-|\\+", "", pd$`genotype:ch1`)


sid_post <- pd$geo_accession[pd$group == "cKI_Mx"]
sid_pre  <- pd$geo_accession[pd$group == "wt_Mx"]


expM <- exp[, c(sid_post, sid_pre)]
group <- rep_by_len(c("cKI_Mx", "wt_Mx"), list(sid_post, sid_pre))
table(group)
group <- c(
    rep("cKI_Mx", length(sid_post)),
    rep("wt_Mx", length(sid_pre))
)


library(limma)      # 差异分析
library(ggplot2)    # 绑图
library(pheatmap)   # 热图
library(ggrepel)    # 火山图标签


group <- factor(pd$group, levels = c("cKI_Mx", "wt_Mx"))
design <- model.matrix(~ 0 + group)
colnames(design) <- levels(group)
fit <- lmFit(expM, design)

contrast <- makeContrasts(cKI_Mx - wt_Mx, levels = design)
fit2 <- contrasts.fit(fit, contrast)
fit2 <- eBayes(fit2)

DEG <- topTable(fit2, coef = 1, number = Inf, adjust.method = "BH")
DEG$gene <- rownames(DEG)
DEG$FDR <- DEG$adj.P.Val

# 添加差异表达标签 (logFC > 1, adj.P.Val < 0.05)
DEG$change <- ifelse(DEG$adj.P.Val < 0.05 & DEG$logFC > 1, "Up",
                     ifelse(DEG$adj.P.Val < 0.05 & DEG$logFC < -1, "Down", "Not Sig"))
DEG <- DEG[, c("gene", "logFC", "AveExpr", "t", "P.Value", "FDR", "B", "change")]
table(DEG$change)
write.csv(DEG, file.path(out_dir, "DEG_results.csv"), row.names = FALSE)

DEG_sig <- DEG[DEG$change != "Not Sig", ]
write.csv(DEG_sig, file.path(out_dir, "DEG_significant.csv"), row.names = FALSE)
cat("上调基因:", sum(DEG$change == "Up"), "\n")
cat("下调基因:", sum(DEG$change == "Down"), "\n")

现在我要做三个基因的boxplot和violin图，三个基因分别是Msantd5l，Gm7467， Igkv4-61，请帮我做出相应代码

### 🤖 Copilot <sub>2025/12/02 22:11</sub>

以下是绘制三个基因 boxplot 和 violin 图的代码：

```
library(ggplot2)
library(tidyr)
library(dplyr)

# 定义要绘制的基因
genes_of_interest <- c("Msantd5l", "Gm7467", "Igkv4-61")

# 提取这些基因的表达数据
expr_subset <- expM[rownames(expM) %in% genes_of_interest, , drop = FALSE]

# 转换为长格式数据
expr_long <- as.data.frame(t(expr_subset))
expr_long$sample <- rownames(expr_long)
expr_long$group <- group

# 转为长格式
plot_data <- expr_long %>%
  pivot_longer(cols = all_of(genes_of_interest[genes_of_interest %in% colnames(expr_long)]),
               names_to = "gene",
               values_to = "expression")

# 设置分组因子顺序
plot_data$group <- factor(plot_data$group, levels = c("wt_Mx", "cKI_Mx"))

# ========== Boxplot ==========
p_box <- ggplot(plot_data, aes(x = group, y = expression, fill = group)) +
  geom_boxplot(outlier.shape = 21, width = 0.6) +
  geom_jitter(width = 0.15, size = 1.5, alpha = 0.6) +
  facet_wrap(~ gene, scales = "free_y", nrow = 1) +
  scale_fill_manual(values = c("wt_Mx" = "#4DAF4A", "cKI_Mx" = "#E41A1C")) +
  labs(x = "Group", y = "Expression (log2)", title = "Gene Expression Boxplot") +
  theme_bw() +
  theme(
    strip.text = element_text(face = "bold", size = 12),
    axis.text.x = element_text(angle = 45, hjust = 1),
    legend.position = "none"
  )

print(p_box)
ggsave(file.path(out_dir, "boxplot_3genes.pdf"), p_box, width = 9, height = 4)

# ========== Violin plot ==========
p_violin <- ggplot(plot_data, aes(x = group, y = expression, fill = group)) +
  geom_violin(trim = FALSE, alpha = 0.7) +
  geom_boxplot(width = 0.15, fill = "white", outlier.shape = NA) +
  geom_jitter(width = 0.1, size = 1.5, alpha = 0.6) +
  facet_wrap(~ gene, scales = "free_y", nrow = 1) +
  scale_fill_manual(values = c("wt_Mx" = "#4DAF4A", "cKI_Mx" = "#E41A1C")) +
  labs(x = "Group", y = "Expression (log2)", title = "Gene Expression Violin Plot") +
  theme_bw() +
  theme(
    strip.text = element_text(face = "bold", size = 12),
    axis.text.x = element_text(angle = 45, hjust = 1),
    legend.position = "none"
  )

print(p_violin)
ggsave(file.path(out_dir, "violin_3genes.pdf"), p_violin, width = 9, height = 4)

# ========== 可选：添加统计检验 ==========
library(ggpubr)

p_box_stat <- ggplot(plot_data, aes(x = group, y = expression, fill = group)) +
  geom_boxplot(outlier.shape = 21, width = 0.6) +
  geom_jitter(width = 0.15, size = 1.5, alpha = 0.6) +
  facet_wrap(~ gene, scales = "free_y", nrow = 1) +
  scale_fill_manual(values = c("wt_Mx" = "#4DAF4A", "cKI_Mx" = "#E41A1C")) +
  stat_compare_means(method = "t.test", label = "p.signif", 
                     comparisons = list(c("wt_Mx", "cKI_Mx"))) +
  labs(x = "Group", y = "Expression (log2)", title = "Gene Expression Boxplot with Statistics") +
  theme_bw() +
  theme(
    strip.text = element_text(face = "bold", size = 12),
    axis.text.x = element_text(angle = 45, hjust = 1),
    legend.position = "none"
  )

print(p_box_stat)
ggsave(file.path(out_dir, "boxplot_3genes_stat.pdf"), p_box_stat, width = 9, height = 5)
```

**代码说明：**

1. **数据准备**：从 `expM` 中提取三个目标基因，转换为长格式便于 ggplot 绑图

2. **Boxplot**：显示中位数、四分位数和离群点，叠加散点显示样本分布

3. **Violin plot**：显示数据分布密度，内嵌小 boxplot，叠加散点

4. **统计检验**（可选）：使用 `ggpubr` 包添加 t 检验显著性标记

**注意**：如果某个基因不在 `expM` 中，代码会自动跳过。你可以先检查基因是否存在：

```
genes_of_interest[genes_of_interest %in% rownames(expM)]
```

### 👤 User <sub>2025/12/02 22:13</sub>

expr_long$group <- group
Error in `$<-.data.frame`(`*tmp*`, group, value = c(NA, NA, 2L, 2L, 1L,  : 
  replacement has 9 rows, data has 7

### 🤖 Copilot <sub>2025/12/02 22:13</sub>

这个错误是因为 `group` 向量有 9 个元素，但 `expr_long` 只有 7 行（可能是因为只有部分样本在 `expM` 中）。

需要通过样本名匹配来添加 group 信息。修正代码如下：

```
library(ggplot2)
library(tidyr)
library(dplyr)

# 定义要绘制的基因
genes_of_interest <- c("Msantd5l", "Gm7467", "Igkv4-61")

# 检查基因是否存在
genes_found <- genes_of_interest[genes_of_interest %in% rownames(expM)]
cat("找到的基因:", genes_found, "\n")

# 提取这些基因的表达数据
expr_subset <- expM[rownames(expM) %in% genes_found, , drop = FALSE]

# 转换为长格式数据
expr_long <- as.data.frame(t(expr_subset))
expr_long$sample <- rownames(expr_long)

# 通过样本名匹配 group（从 pd 中获取）
expr_long$group <- pd$group[match(expr_long$sample, pd$geo_accession)]

# 转为长格式
plot_data <- expr_long %>%
  pivot_longer(cols = all_of(genes_found),
               names_to = "gene",
               values_to = "expression")

# 只保留 cKI_Mx 和 wt_Mx 两组
plot_data <- plot_data %>% filter(group %in% c("cKI_Mx", "wt_Mx"))

# 设置分组因子顺序
plot_data$group <- factor(plot_data$group, levels = c("wt_Mx", "cKI_Mx"))

# ========== Boxplot ==========
p_box <- ggplot(plot_data, aes(x = group, y = expression, fill = group)) +
  geom_boxplot(outlier.shape = 21, width = 0.6) +
  geom_jitter(width = 0.15, size = 1.5, alpha = 0.6) +
  facet_wrap(~ gene, scales = "free_y", nrow = 1) +
  scale_fill_manual(values = c("wt_Mx" = "#4DAF4A", "cKI_Mx" = "#E41A1C")) +
  labs(x = "Group", y = "Expression (log2)", title = "Gene Expression Boxplot") +
  theme_bw() +
  theme(
    strip.text = element_text(face = "bold", size = 12),
    axis.text.x = element_text(angle = 45, hjust = 1),
    legend.position = "none"
  )

print(p_box)

# ========== Violin plot ==========
p_violin <- ggplot(plot_data, aes(x = group, y = expression, fill = group)) +
  geom_violin(trim = FALSE, alpha = 0.7) +
  geom_boxplot(width = 0.15, fill = "white", outlier.shape = NA) +
  geom_jitter(width = 0.1, size = 1.5, alpha = 0.6) +
  facet_wrap(~ gene, scales = "free_y", nrow = 1) +
  scale_fill_manual(values = c("wt_Mx" = "#4DAF4A", "cKI_Mx" = "#E41A1C")) +
  labs(x = "Group", y = "Expression (log2)", title = "Gene Expression Violin Plot") +
  theme_bw() +
  theme(
    strip.text = element_text(face = "bold", size = 12),
    axis.text.x = element_text(angle = 45, hjust = 1),
    legend.position = "none"
  )

print(p_violin)
```

**关键修改**：
- 使用 `pd$group[match(expr_long$sample, pd$geo_accession)]` 来正确匹配每个样本对应的分组
- 添加了检查基因是否存在的步骤
- 过滤只保留需要的两个分组

### 👤 User <sub>2025/12/02 22:21</sub>

boxplot_3genes_stat.是什么意思啊

### 🤖 Copilot <sub>2025/12/02 22:21</sub>

`boxplot_3genes_stat` 的意思是：

**boxplot** = 箱线图（Box Plot）
**3genes** = 3个基因
**stat** = statistics（统计检验）

所以 `boxplot_3genes_stat.pdf` 就是 **"带统计检验的3个基因箱线图"**。

具体来说，这张图除了显示箱线图外，还会在图上添加统计显著性标记：

```
stat_compare_means(method = "t.test", label = "p.signif", 
                   comparisons = list(c("wt_Mx", "cKI_Mx")))
```

这行代码会：
- 对两组（wt_Mx vs cKI_Mx）进行 **t 检验**
- 在图上显示显著性符号：
  - `ns` = 不显著 (p > 0.05)
  - `*` = p < 0.05
  - `**` = p < 0.01
  - `***` = p < 0.001
  - `****` = p < 0.0001

如果你只想要普通的箱线图（不带统计检验），用 `boxplot_3genes.pdf` 那个就可以了。
