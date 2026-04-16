# library(ggplot2) > library(tinyarray) > > # 分别取 UP 和 DOWN 基因 > up_genes <- ro...

| Field | Value |
|-------|-------|
| Session ID | `1fddb2bf-6445-4d70-a723-21634107f6ce` |
| Workspace | 绘制热图时的错误调试 |
| Start | 2025/10/01 10:12 |
| End | 2025/10/01 10:19 |
| Messages | 6 |

---

### 👤 User <sub>2025/10/01 10:12</sub>

library(ggplot2)
> library(tinyarray)
> 
> # 分别取 UP 和 DOWN 基因
> up_genes <- rownames(DEG)[DEG$change == "UP"]
> down_genes <- rownames(DEG)[DEG$change == "DOWN"]
> 
> # 按 adj.P.Val 排序，分别取前 50
> top_up <- head(up_genes[order(DEG[up_genes, "adj.P.Val"], decreasing = FALSE)], 50)
> top_down <- head(down_genes[order(DEG[down_genes, "adj.P.Val"], decreasing = FALSE)], 50)
> 
> # 合并成最终基因列表
> top_genes <- c(top_up, top_down)
> 
> # 提取表达矩阵
> mat <- exp[top_genes, , drop = FALSE]
> 
> # 去掉 NA
> mat <- mat[complete.cases(mat), , drop = FALSE]
> 
> # 如果行数为 1，复制一行避免报错
> if (nrow(mat) == 1) {
+   mat <- rbind(mat, mat)
+   rownames(mat) <- c(rownames(mat)[1], paste0(rownames(mat)[1], "_dup"))
+ }
> 
> # 确保行名唯一
> rownames(mat) <- make.unique(rownames(mat))
> 
> # 确保数值型矩阵
> mat <- as.matrix(mat)
> storage.mode(mat) <- "double"
> 
> # group 转 factor
> group <- factor(group)
> 
> # 绘制热图
> h <- draw_heatmap(mat = mat, group_list = group, n = nrow(mat))
Error in `.rowNamesDF<-`(x, value = value) : invalid 'row.names' length

### 🤖 Copilot <sub>2025/10/01 10:12</sub>

看到您的错误信息，问题出在 `draw_heatmap` 函数内部处理数据时，行名长度不匹配。让我帮您解决这个问题。

常见的原因和解决方案：

## 问题分析

`draw_heatmap` 函数可能在内部对数据进行了转换，导致行名长度不匹配。这通常发生在：
1. 数据标准化/归一化过程中
2. 样本分组信息与表达矩阵列数不匹配

## 解决方案

请尝试以下修正代码：

```r
# 1. 首先检查数据维度
print(paste("矩阵维度:", nrow(mat), "行 x", ncol(mat), "列"))
print(paste("分组长度:", length(group)))
print(paste("列名:", paste(colnames(mat), collapse = ", ")))
print(paste("分组:", paste(as.character(group), collapse = ", ")))

# 2. 确保 group 长度与矩阵列数一致
if (length(group) != ncol(mat)) {
  stop("错误：group 长度 (", length(group), ") 与矩阵列数 (", ncol(mat), ") 不匹配！")
}

# 3. 确保矩阵列名存在且与 group 对应
if (is.null(colnames(mat))) {
  colnames(mat) <- paste0("Sample_", seq_len(ncol(mat)))
}

# 4. 对数据进行 Z-score 标准化（手动处理，避免函数内部问题）
mat_scaled <- t(scale(t(mat)))

# 5. 替换可能的 NA 值
mat_scaled[is.na(mat_scaled)] <- 0

# 6. 尝试使用 pheatmap 直接绘图（更稳定）
library(pheatmap)

# 创建注释数据框
annotation_col <- data.frame(
  Group = group,
  row.names = colnames(mat_scaled)
)

# 绘制热图
pheatmap(
  mat_scaled,
  annotation_col = annotation_col,
  show_rownames = TRUE,
  show_colnames = TRUE,
  cluster_rows = TRUE,
  cluster_cols = TRUE,
  scale = "none",  # 已经手动标准化了
  color = colorRampPalette(c("blue", "white", "red"))(100),
  main = "Top DEGs Heatmap"
)
```

## 如果仍想使用 tinyarray::draw_heatmap

```r
# 方法1：确保所有参数正确
h <- draw_heatmap(
  mat = mat, 
  group_list = group, 
  n = nrow(mat),
  scale = TRUE  # 添加 scale 参数
)

# 方法2：不指定 n 参数，让函数自动处理
h <- draw_heatmap(
  mat = mat, 
  group_list = group
)

# 方法3：使用较小的基因数
h <- draw_heatmap(
  mat = mat, 
  group_list = group, 
  n = min(50, nrow(mat))  # 限制最多50个基因
)
```

## 调试建议

```r
# 检查关键信息
str(mat)
str(group)
table(group)
dim(mat)
length(group)

# 确认没有重复的行名
any(duplicated(rownames(mat)))
any(duplicated(colnames(mat)))
```

请先运行检查代码，确认数据结构是否正确，然后再尝试绘图。如果问题依然存在，请分享检查代码的输出结果，我可以提供更具体的解决方案。

### 👤 User <sub>2025/10/01 10:14</sub>

我要的 Group 的分在一起，而不是一个个展示

### 🤖 Copilot <sub>2025/10/01 10:14</sub>

明白了！您想要在热图中将同一分组的样本聚集在一起显示，而不是让它们分散。这需要关闭列的聚类，并按分组排序样本。

## 解决方案

```r
# 按 group 排序样本
group_order <- order(group)
mat_ordered <- mat_scaled[, group_order, drop = FALSE]
group_ordered <- group[group_order]

# 创建注释数据框
annotation_col <- data.frame(
  Group = group_ordered,
  row.names = colnames(mat_ordered)
)

# 设置分组颜色
library(RColorBrewer)
group_colors <- setNames(
  brewer.pal(length(unique(group_ordered)), "Set1")[1:length(unique(group_ordered))],
  levels(factor(group_ordered))
)

annotation_colors <- list(Group = group_colors)

# 绘制热图 - 关键：cluster_cols = FALSE
pheatmap(
  mat_ordered,
  annotation_col = annotation_col,
  annotation_colors = annotation_colors,
  show_rownames = TRUE,
  show_colnames = TRUE,
  cluster_rows = TRUE,      # 基因聚类
  cluster_cols = FALSE,     # 样本不聚类，保持分组
  scale = "none",
  color = colorRampPalette(c("blue", "white", "red"))(100),
  border_color = NA,
  main = "Top DEGs Heatmap (Grouped by Condition)",
  fontsize_row = 8,
  fontsize_col = 10
)
```

## 使用 tinyarray::draw_heatmap 的方案

```r
# tinyarray 的 draw_heatmap 默认就会按分组聚集样本
# 关键是确保数据格式正确

# 按 group 排序
group_order <- order(group)
mat_ordered <- mat[, group_order, drop = FALSE]
group_ordered <- group[group_order]

# 使用 draw_heatmap
h <- draw_heatmap(
  mat = mat_ordered, 
  group_list = group_ordered,
  cluster_cols = FALSE,  # 关闭列聚类
  n = nrow(mat_ordered)
)
```

## 完整代码示例

```r
library(pheatmap)
library(RColorBrewer)

# 1. 对数据进行 Z-score 标准化
mat_scaled <- t(scale(t(mat)))
mat_scaled[is.na(mat_scaled)] <- 0

# 2. 按分组排序样本
group_order <- order(group)
mat_ordered <- mat_scaled[, group_order, drop = FALSE]
group_ordered <- group[group_order]

# 3. 创建注释
annotation_col <- data.frame(
  Group = group_ordered,
  row.names = colnames(mat_ordered)
)

# 4. 设置颜色
n_groups <- length(unique(group_ordered))
if (n_groups <= 2) {
  group_colors <- c("Control" = "#3498db", "Treatment" = "#e74c3c")
} else {
  group_colors <- setNames(
    brewer.pal(max(3, n_groups), "Set1")[1:n_groups],
    unique(as.character(group_ordered))
  )
}

annotation_colors <- list(Group = group_colors)

# 5. 绘制热图
pheatmap(
  mat_ordered,
  annotation_col = annotation_col,
  annotation_colors = annotation_colors,
  show_rownames = TRUE,
  show_colnames = TRUE,
  cluster_rows = TRUE,       # 基因按表达模式聚类
  cluster_cols = FALSE,      # 样本不聚类，按分组展示
  scale = "none",
  color = colorRampPalette(c("#2E86AB", "white", "#A23B72"))(100),
  border_color = NA,
  gaps_col = cumsum(table(group_ordered))[-length(table(group_ordered))],  # 在分组间添加间隙
  main = "Top DEGs Heatmap",
  fontsize_row = 6,
  fontsize_col = 9,
  angle_col = 45
)
```

## 关键参数说明

- **`cluster_cols = FALSE`**: 关闭列（样本）的聚类分析
- **`gaps_col`**: 在不同分组之间添加分隔线，使分组更清晰
- **排序样本**: 使用 `order(group)` 将同一分组的样本排在一起

这样热图就会按照分组将样本聚集在一起展示，而不是让算法自动聚类打乱分组顺序！

### 👤 User <sub>2025/10/01 10:19</sub>

我要你把样本不需要一个个体现，直接体现分组即可

### 🤖 Copilot <sub>2025/10/01 10:19</sub>

明白了！您想要热图上方只显示分组信息，不显示每个样本的名称。这样可以让热图更简洁，只关注基因表达模式和分组差异。

## 解决方案

```r
library(pheatmap)
library(RColorBrewer)

# 1. 对数据进行 Z-score 标准化
mat_scaled <- t(scale(t(mat)))
mat_scaled[is.na(mat_scaled)] <- 0

# 2. 按分组排序样本
group_order <- order(group)
mat_ordered <- mat_scaled[, group_order, drop = FALSE]
group_ordered <- group[group_order]

# 3. 创建注释（只显示分组）
annotation_col <- data.frame(
  Group = group_ordered,
  row.names = colnames(mat_ordered)
)

# 4. 设置颜色
n_groups <- length(unique(group_ordered))
if (n_groups == 2) {
  group_colors <- c("#3498db", "#e74c3c")
  names(group_colors) <- levels(factor(group_ordered))
} else {
  group_colors <- setNames(
    brewer.pal(max(3, n_groups), "Set1")[1:n_groups],
    levels(factor(group_ordered))
  )
}

annotation_colors <- list(Group = group_colors)

# 5. 绘制热图 - 关键：show_colnames = FALSE
pheatmap(
  mat_ordered,
  annotation_col = annotation_col,
  annotation_colors = annotation_colors,
  show_rownames = TRUE,          # 显示基因名
  show_colnames = FALSE,          # 不显示样本名 ← 关键参数
  cluster_rows = TRUE,            # 基因聚类
  cluster_cols = FALSE,           # 样本不聚类
  scale = "none",
  color = colorRampPalette(c("blue", "white", "red"))(100),
  border_color = NA,
  gaps_col = cumsum(table(group_ordered))[-length(table(group_ordered))],  # 分组间隙
  main = "Top DEGs Heatmap",
  fontsize_row = 8,
  annotation_names_col = TRUE,    # 显示注释标签（Group）
  annotation_legend = TRUE        # 显示分组图例
)
```

## 使用 ComplexHeatmap 包（更强大的选项）

```r
library(ComplexHeatmap)
library(circlize)

# 1. 标准化
mat_scaled <- t(scale(t(mat)))
mat_scaled[is.na(mat_scaled)] <- 0

# 2. 按分组排序
group_order <- order(group)
mat_ordered <- mat_scaled[, group_order, drop = FALSE]
group_ordered <- group[group_order]

# 3. 创建顶部注释（只显示分组颜色条）
col_ha <- HeatmapAnnotation(
  Group = group_ordered,
  col = list(Group = c("Control" = "#3498db", "Treatment" = "#e74c3c")),  # 根据实际分组名调整
  show_annotation_name = TRUE,
  annotation_name_side = "left"
)

# 4. 绘制热图
Heatmap(
  mat_ordered,
  name = "Z-score",
  top_annotation = col_ha,
  show_column_names = FALSE,      # 不显示样本名
  show_row_names = TRUE,          # 显示基因名
  cluster_rows = TRUE,
  cluster_columns = FALSE,
  col = colorRamp2(c(-2, 0, 2), c("blue", "white", "red")),
  row_names_gp = gpar(fontsize = 8),
  column_split = group_ordered,   # 按分组分割列
  column_title_gp = gpar(fontsize = 12),
  heatmap_legend_param = list(title = "Expression")
)
```

## 简化版（推荐）

```r
# 最简洁的代码
library(pheatmap)

# 标准化和排序
mat_scaled <- t(scale(t(mat)))
mat_scaled[is.na(mat_scaled)] <- 0
group_order <- order(group)
mat_ordered <- mat_scaled[, group_order, drop = FALSE]
group_ordered <- group[group_order]

# 注释
annotation_col <- data.frame(Group = group_ordered, row.names = colnames(mat_ordered))
annotation_colors <- list(Group = c("Control" = "#4A90E2", "Treatment" = "#E94B3C"))  # 修改为实际分组名

# 绘图
pheatmap(
  mat_ordered,
  annotation_col = annotation_col,
  annotation_colors = annotation_colors,
  show_colnames = FALSE,          # ← 核心：不显示样本名
  cluster_cols = FALSE,
  gaps_col = cumsum(table(group_ordered))[-length(table(group_ordered))],
  color = colorRampPalette(c("blue", "white", "red"))(100),
  border_color = NA
)
```

## 关键参数

- **`show_colnames = FALSE`**: 隐藏样本名称
- **`annotation_col`**: 顶部显示分组颜色条
- **`gaps_col`**: 在不同分组之间添加间隙
- **`cluster_cols = FALSE`**: 保持分组顺序

这样热图就只会显示分组信息的颜色条，不会显示每个样本的名称，更加简洁清晰！
