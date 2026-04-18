# exp_heatmap <- exp[top_heatmap_genes, ] > > # 标准化（Z-score） > exp_heatmap_scal...

| Field | Value |
|-------|-------|
| Session ID | `bde274ac-ac5d-4b44-9688-b93fe536eb09` |
| Workspace | R语言中对象未找到错误解决方案 |
| Start | 2026/01/05 15:47 |
| End | 2026/01/05 17:59 |
| Messages | 8 |

---

### 👤 User <sub>2026/01/05 17:40</sub>

exp_heatmap <- exp[top_heatmap_genes, ]
> 
> # 标准化（Z-score）
> exp_heatmap_scaled <- t(scale(t(exp_heatmap)))
> 
> # 注释信息（列：样本分组）
> annotation_col_all <- data.frame(
+   Group = pd$group,
+   row.names = rownames(pd)
+ )
> 
> # 行注释（标记 Up/Down/Not Sig）
> deg_regulation <- DEG[DEG$gene %in% all_deg_genes, c("gene", "change")]
Error in h(simpleError(msg, call)) : 
  error in evaluating the argument 'table' in selecting a method for function '%in%': object 'all_deg_genes' not found

### 🤖 Copilot <sub>2026/01/05 17:40</sub>

错误原因是 `all_deg_genes` 对象不存在。根据你的代码逻辑，你应该使用 `top_heatmap_genes` 来替换 `all_deg_genes`，或者先创建这个变量。

**解决方案1** - 使用 `top_heatmap_genes`（推荐）：

```
deg_regulation <- DEG[DEG$gene %in% top_heatmap_genes, c("gene", "change")]
```

**解决方案2** - 如果你想要所有差异基因，先创建 `all_deg_genes`：

```
# 提取所有差异表达基因
all_deg_genes <- DEG$gene[DEG$change != "Not Sig"]

# 然后再执行行注释
deg_regulation <- DEG[DEG$gene %in% all_deg_genes, c("gene", "change")]
```

根据你前面的代码，你已经筛选了 `top_heatmap_genes` 用于热图，所以应该使用**解决方案1**，保持数据一致性。

### 👤 User <sub>2026/01/05 17:56</sub>

all_deg_genes <- DEG$gene[DEG$change != "Not Sig"]
> DEG_up_sig <- DEG[DEG$change == "Up", ]
> DEG_down_sig <- DEG[DEG$change == "Down", ]
> 
> DEG_up_sig <- DEG_up_sig[order(DEG_up_sig$FDR), ]
> DEG_down_sig <- DEG_down_sig[order(DEG_down_sig$FDR), ]
> 
> top_up_heatmap <- head(DEG_up_sig$gene, 50)
> top_down_heatmap <- head(DEG_down_sig$gene, 50)
> top_heatmap_genes <- c(top_up_heatmap, top_down_heatmap)
> top_heatmap_genes <- top_heatmap_genes[top_heatmap_genes %in% rownames(exp)]
> 
> cat("热图基因数: Up =", length(top_up_heatmap), ", Down =", length(top_down_heatmap), "\n")
热图基因数: Up = 50 , Down = 50 
> cat("热图基因数: Up =", length(top_up_heatmap), ", Down =", length(top_down_heatmap), "\n")
热图基因数: Up = 50 , Down = 50 
> 
> # 提取表达矩阵
> exp_heatmap <- exp[top_heatmap_genes, ]
> 
> # 标准化（Z-score）
> exp_heatmap_scaled <- t(scale(t(exp_heatmap)))
> 
> # 注释信息（列：样本分组）
> annotation_col_all <- data.frame(
+   Group = pd$group,
+   row.names = rownames(pd)
+ )
> 
> # 行注释（标记 Up/Down/Not Sig）
> deg_regulation <- DEG[DEG$gene %in% all_deg_genes, c("gene", "change")]
> rownames(deg_regulation) <- deg_regulation$gene
> 
> annotation_row_all <- data.frame(
+   Regulation = deg_regulation[all_deg_genes, "change"],
+   row.names = all_deg_genes
+ )
> 
> # 定义颜色
> group_colors_all <- c("control" = "#4DAF4A", "LDHAi" = "#E41A1C")
> regulation_colors_all <- c("Up" = "#E41A1C", "Down" = "#377EB8", "Not Sig" = "grey60")
> 
> # 顶部注释
> ha_all <- HeatmapAnnotation(
+   Group = annotation_col_all$Group,
+   col = list(Group = group_colors_all),
+   show_annotation_name = FALSE,
+   annotation_name_side = "left"
+ )
> 
> # 行注释（Up/Down）
> ra_all <- rowAnnotation(
+   Regulation = annotation_row_all$Regulation,
+   col = list(Regulation = regulation_colors_all),
+   show_annotation_name = FALSE
+ )
> # 绘制热图
> p_heatmap <- Heatmap(
+     exp_heatmap_scaled,                              # Z-score标准化后的表达矩阵（行=基因，列=样本）
+     col = colorRampPalette(c("#524b9a", "white", "#e63118"))(100),  # 颜色梯度：紫色(低表达)-白色-红色(高表达)
+     name = "Gene Expression\n(Z-score)",             # 图例标题
+     heatmap_legend_param = list(direction = "horizontal", nrow = 1),  # 图例水平显示
+     show_row_names = TRUE,                           # 显示行名（基因名）
+     show_column_names = FALSE,                       # 不显示列名（样本名太多会乱）
+     show_row_dend = FALSE,                           # 不显示行聚类树
+     show_column_dend = FALSE,                        # 不显示列聚类树
+     top_annotation = ha_deg,                         # 顶部添加分组注释
+     column_title_side = "top",                       # 列标题显示在顶部
+     column_split = annotation_col$Group,             # 按Group（control/LDHAi）分割列
+     row_split = annotation_row$Regulation,           # 按Regulation（Up/Down）分割行
+     #column_title = TRUE,                             # 显示列标题（分组名）
+     row_names_gp = gpar(fontsize = 5),               # 行名字体大小
+     cluster_rows = TRUE,                             # 对行进行聚类
+     cluster_columns = TRUE                           # 对列进行聚类
+ )
Error: object 'annotation_row' not found

### 🤖 Copilot <sub>2026/01/05 17:56</sub>

错误原因是变量命名不一致。你创建的变量名是 `annotation_row_all`、`annotation_col_all`、`ha_all`，但在热图代码中使用的是 `annotation_row`、`annotation_col`、`ha_deg`。

**解决方案** - 修改热图代码中的变量名：

```
# 绘制热图
p_heatmap <- Heatmap(
    exp_heatmap_scaled,
    col = colorRampPalette(c("#524b9a", "white", "#e63118"))(100),
    name = "Gene Expression\n(Z-score)",
    heatmap_legend_param = list(direction = "horizontal", nrow = 1),
    show_row_names = TRUE,
    show_column_names = FALSE,
    show_row_dend = FALSE,
    show_column_dend = FALSE,
    top_annotation = ha_all,                         # 改为 ha_all
    column_title_side = "top",
    column_split = annotation_col_all$Group,         # 改为 annotation_col_all
    row_split = annotation_row_all$Regulation,       # 改为 annotation_row_all
    row_names_gp = gpar(fontsize = 5),
    cluster_rows = TRUE,
    cluster_columns = TRUE
)
```

需要修改的三处：
1. `ha_deg` → `ha_all`
2. `annotation_col$Group` → `annotation_col_all$Group`
3. `annotation_row$Regulation` → `annotation_row_all$Regulation`

### 👤 User <sub>2026/01/05 17:58</sub>

Error: Length or nrow of `row_split` should be same as nrow of `matrix`.

### 🤖 Copilot <sub>2026/01/05 17:58</sub>

错误原因是 `annotation_row_all` 使用了所有差异基因（`all_deg_genes`），但热图矩阵只包含 `top_heatmap_genes`（100个基因）。行数不匹配导致报错。

**解决方案** - 修改行注释创建代码，使用 `top_heatmap_genes`：

```
# 行注释（标记 Up/Down）- 只针对热图中的基因
annotation_row_all <- data.frame(
  Regulation = deg_regulation[top_heatmap_genes, "change"],
  row.names = top_heatmap_genes
)
```

同时更新行注释对象的创建：

```
# 行注释（Up/Down）
ra_all <- rowAnnotation(
  Regulation = annotation_row_all$Regulation,
  col = list(Regulation = regulation_colors_all),
  show_annotation_name = FALSE
)
```

这样 `annotation_row_all` 就会有100行（与热图基因数一致），而不是所有差异基因的数量。

### 👤 User <sub>2026/01/05 17:59</sub>

all_deg_genes <- DEG$gene[DEG$change != "Not Sig"]
DEG_up_sig <- DEG[DEG$change == "Up", ]
DEG_down_sig <- DEG[DEG$change == "Down", ]

DEG_up_sig <- DEG_up_sig[order(DEG_up_sig$FDR), ]
DEG_down_sig <- DEG_down_sig[order(DEG_down_sig$FDR), ]

top_up_heatmap <- head(DEG_up_sig$gene, 50)
top_down_heatmap <- head(DEG_down_sig$gene, 50)
top_heatmap_genes <- c(top_up_heatmap, top_down_heatmap)
top_heatmap_genes <- top_heatmap_genes[top_heatmap_genes %in% rownames(exp)]

cat("热图基因数: Up =", length(top_up_heatmap), ", Down =", length(top_down_heatmap), "\n")
cat("热图基因数: Up =", length(top_up_heatmap), ", Down =", length(top_down_heatmap), "\n")

# 提取表达矩阵
exp_heatmap <- exp[top_heatmap_genes, ]

# 标准化（Z-score）
exp_heatmap_scaled <- t(scale(t(exp_heatmap)))

# 注释信息（列：样本分组）
annotation_col_all <- data.frame(
  Group = pd$group,
  row.names = rownames(pd)
)

# 行注释（标记 Up/Down/Not Sig）
deg_regulation <- DEG[DEG$gene %in% all_deg_genes, c("gene", "change")]
rownames(deg_regulation) <- deg_regulation$gene

annotation_row_all <- data.frame(
  Regulation = deg_regulation[all_deg_genes, "change"],
  row.names = all_deg_genes
)

# 定义颜色
group_colors_all <- c("control" = "#4DAF4A", "LDHAi" = "#E41A1C")
regulation_colors_all <- c("Up" = "#E41A1C", "Down" = "#377EB8", "Not Sig" = "grey60")

# 顶部注释
ha_all <- HeatmapAnnotation(
  Group = annotation_col_all$Group,
  col = list(Group = group_colors_all),
  show_annotation_name = FALSE,
  annotation_name_side = "left"
)

# 行注释（Up/Down）
ra_all <- rowAnnotation(
  Regulation = annotation_row_all$Regulation,
  col = list(Regulation = regulation_colors_all),
  show_annotation_name = FALSE
)
# 绘制热图
p_heatmap <- Heatmap(
    exp_heatmap_scaled,                              # Z-score标准化后的表达矩阵（行=基因，列=样本）
    col = colorRampPalette(c("#524b9a", "white", "#e63118"))(100),  # 颜色梯度：紫色(低表达)-白色-红色(高表达)
    name = "Gene Expression\n(Z-score)",             # 图例标题
    heatmap_legend_param = list(direction = "horizontal", nrow = 1),  # 图例水平显示
    show_row_names = TRUE,                           # 显示行名（基因名）
    show_column_names = FALSE,                       # 不显示列名（样本名太多会乱）
    show_row_dend = FALSE,                           # 不显示行聚类树
    show_column_dend = FALSE,                        # 不显示列聚类树
    top_annotation = ha_deg,                         # 顶部添加分组注释
    column_title_side = "top",                       # 列标题显示在顶部
    column_split = annotation_col_all$Group,         # 按Group（control/LDHAi）分割列
    row_split = annotation_row_all$Regulation,           # 按Regulation（Up/Down）分割行
    #column_title = TRUE,                             # 显示列标题（分组名）
    row_names_gp = gpar(fontsize = 5),               # 行名字体大小
    cluster_rows = TRUE,                             # 对行进行聚类
    cluster_columns = TRUE                           # 对列进行聚类
)

# 保存热图
pdf(file.path(out_dir, "heatmap_DEGs.pdf"), width = 10, height = 14)
draw(p_heatmap, 
     heatmap_legend_side = "bottom", 
     annotation_legend_side = "bottom", 
     merge_legend = TRUE)
dev.off()


# 在屏幕上显示
draw(p_heatmap, 
     heatmap_legend_side = "bottom", 
     annotation_legend_side = "bottom", 
     merge_legend = TRUE)

### 🤖 Copilot <sub>2026/01/05 17:59</sub>

你的代码有两个问题需要修正：

1. `annotation_row_all` 使用了 `all_deg_genes`（所有差异基因），但热图只包含 `top_heatmap_genes`（100个基因），导致行数不匹配
2. 热图中 `top_annotation = ha_deg` 应该是 `ha_all`

**修正后的完整代码：**

```
all_deg_genes <- DEG$gene[DEG$change != "Not Sig"]
DEG_up_sig <- DEG[DEG$change == "Up", ]
DEG_down_sig <- DEG[DEG$change == "Down", ]

DEG_up_sig <- DEG_up_sig[order(DEG_up_sig$FDR), ]
DEG_down_sig <- DEG_down_sig[order(DEG_down_sig$FDR), ]

top_up_heatmap <- head(DEG_up_sig$gene, 50)
top_down_heatmap <- head(DEG_down_sig$gene, 50)
top_heatmap_genes <- c(top_up_heatmap, top_down_heatmap)
top_heatmap_genes <- top_heatmap_genes[top_heatmap_genes %in% rownames(exp)]

cat("热图基因数: Up =", length(top_up_heatmap), ", Down =", length(top_down_heatmap), "\n")

# 提取表达矩阵
exp_heatmap <- exp[top_heatmap_genes, ]

# 标准化（Z-score）
exp_heatmap_scaled <- t(scale(t(exp_heatmap)))

# 注释信息（列：样本分组）
annotation_col_all <- data.frame(
  Group = pd$group,
  row.names = rownames(pd)
)

# 行注释（标记 Up/Down）- 只针对热图中的基因
deg_regulation <- DEG[DEG$gene %in% top_heatmap_genes, c("gene", "change")]
rownames(deg_regulation) <- deg_regulation$gene

annotation_row_all <- data.frame(
  Regulation = deg_regulation[top_heatmap_genes, "change"],
  row.names = top_heatmap_genes
)

# 定义颜色
group_colors_all <- c("control" = "#4DAF4A", "LDHAi" = "#E41A1C")
regulation_colors_all <- c("Up" = "#E41A1C", "Down" = "#377EB8", "Not Sig" = "grey60")

# 顶部注释
ha_all <- HeatmapAnnotation(
  Group = annotation_col_all$Group,
  col = list(Group = group_colors_all),
  show_annotation_name = FALSE,
  annotation_name_side = "left"
)

# 行注释（Up/Down）
ra_all <- rowAnnotation(
  Regulation = annotation_row_all$Regulation,
  col = list(Regulation = regulation_colors_all),
  show_annotation_name = FALSE
)

# 绘制热图
p_heatmap <- Heatmap(
    exp_heatmap_scaled,
    col = colorRampPalette(c("#524b9a", "white", "#e63118"))(100),
    name = "Gene Expression\n(Z-score)",
    heatmap_legend_param = list(direction = "horizontal", nrow = 1),
    show_row_names = TRUE,
    show_column_names = FALSE,
    show_row_dend = FALSE,
    show_column_dend = FALSE,
    top_annotation = ha_all,                         # 修正：ha_deg → ha_all
    column_title_side = "top",
    column_split = annotation_col_all$Group,
    row_split = annotation_row_all$Regulation,       # 现在行数匹配了
    row_names_gp = gpar(fontsize = 5),
    cluster_rows = TRUE,
    cluster_columns = TRUE
)

# 保存热图
pdf(file.path(out_dir, "heatmap_DEGs.pdf"), width = 10, height = 14)
draw(p_heatmap, 
     heatmap_legend_side = "bottom", 
     annotation_legend_side = "bottom", 
     merge_legend = TRUE)
dev.off()

# 在屏幕上显示
draw(p_heatmap, 
     heatmap_legend_side = "bottom", 
     annotation_legend_side = "bottom", 
     merge_legend = TRUE)
```

**主要修改：**
1. `deg_regulation` 筛选改为 `top_heatmap_genes`
2. `annotation_row_all` 使用 `top_heatmap_genes` 而非 `all_deg_genes`
3. `top_annotation = ha_all` 而非 `ha_deg`
