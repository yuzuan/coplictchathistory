# GSE246298_DEG = DEG_tb GSE106090_DEG = DEG_tb

| Field | Value |
|-------|-------|
| Session ID | `e34d162d-c106-43ce-8bba-75efcbe56480` |
| Workspace | 绘制 DEG 韦恩图的 R 代码示例 |
| Start | 2025/12/18 10:42 |
| End | 2025/12/18 10:59 |
| Messages | 12 |

---

### 👤 User <sub>2025/12/18 10:44</sub>

GSE246298_DEG = DEG_tb
GSE106090_DEG = DEG_tb

library(ggVennDiagram)
library(ggplot2)
library(dplyr)

# 数据准备
genes_GSE246298 <- rownames(GSE246298_DEG[GSE246298_DEG$DEG != "Not_Change", ])
genes_GSE106090 <- rownames(GSE106090_DEG[GSE106090_DEG$DEG != "Not_Change", ])

gene_list <- list(
    GSE246298 = genes_GSE246298,
    GSE106090 = genes_GSE106090
)

# 提取共同基因
common_genes <- intersect(genes_GSE246298, genes_GSE106090)
up_GSE246298 <- rownames(GSE246298_DEG[GSE246298_DEG$DEG == "Up", ])
up_GSE106090 <- rownames(GSE106090_DEG[GSE106090_DEG$DEG == "Up", ])
common_up_genes <- intersect(up_GSE246298, up_GSE106090)
down_GSE246298 <- rownames(GSE246298_DEG[GSE246298_DEG$DEG == "Down", ])
down_GSE106090 <- rownames(GSE106090_DEG[GSE106090_DEG$DEG == "Down", ])
common_down_genes <- intersect(down_GSE246298, down_GSE106090)
length(common_down_genes)
length(common_up_genes)。按照这个帮我制作韦恩图p_nature <- ggVennDiagram(
    gene_list,
    label_alpha = 0,
    label = "both",            # 同时显示数量和百分比
    label_size = 6,
    label_color = "#2C3E50",
    edge_size = 2,
    set_size = 8,              # 数据集名称字体大小
    set_color = "#2C3E50",
    show_sets = TRUE
) +
    scale_fill_gradient(
        low = "white",
        high = "#0073C2",      # 经典蓝色
        name = "DEG Count"
    ) +
    scale_color_manual(values = c("#2C3E50", "#2C3E50")) +
    scale_x_continuous(expand = expansion(mult = 0.25)) +
    theme_void() +
    theme(
        legend.position = "right",
        legend.title = element_text(size = 13, face = "bold"),
        legend.text = element_text(size = 11),
        plot.background = element_rect(fill = "white", color = NA),
        plot.margin = margin(30, 30, 30, 30)
    )

# 添加共同基因数量标注
p_nature <- p_nature +
    annotate(
        "text",
        x = Inf, y = -Inf,
        label = sprintf("Common genes: %d", length(common_genes)),
        hjust = 1.05, vjust = -0.8,
        size = 5.5,
        fontface = "bold.italic",
        color = "#0073C2"
    )

ggsave(
    filename = file.path(out_dir, "DEG_venn_nature.pdf"),
    plot = p_nature,
    width = 10,
    height = 6.5,
    dpi = 300
)
。

### 🤖 Copilot <sub>2025/12/18 10:44</sub>

下面给你一段“按你现有逻辑”可以直接跑的 R 代码，用 `ggVennDiagram` 画 **GSE246298 vs GSE106090 的 DEG（排除 Not_Change）韦恩图**，并保存为 `DEG_venn_nature.pdf`。我也把 `common_genes/common_up/common_down` 的数量一起标注到图上（不改变你的主体样式）。

> 关键注意：你开头写的  
> `GSE246298_DEG = DEG_tb` 和 `GSE106090_DEG = DEG_tb` 会把两个对象指向同一个表，最后两组基因会完全一样，韦恩图就没意义。请确保它们是两张不同的 DEG 表。

```
library(ggVennDiagram)
library(ggplot2)
library(dplyr)

## 1) 确保 out_dir 存在
out_dir <- "results"  # 你也可以换成自己的路径
if (!dir.exists(out_dir)) dir.create(out_dir, recursive = TRUE)

## 2) 数据准备（假设两张表行名是基因名，且有一列 DEG: Up/Down/Not_Change）
stopifnot("DEG" %in% colnames(GSE246298_DEG), "DEG" %in% colnames(GSE106090_DEG))

genes_GSE246298 <- rownames(GSE246298_DEG[GSE246298_DEG$DEG != "Not_Change", , drop = FALSE])
genes_GSE106090 <- rownames(GSE106090_DEG[GSE106090_DEG$DEG != "Not_Change", , drop = FALSE])

## 去重/去空，避免集合计算异常
genes_GSE246298 <- unique(na.omit(genes_GSE246298))
genes_GSE106090 <- unique(na.omit(genes_GSE106090))

gene_list <- list(
  GSE246298 = genes_GSE246298,
  GSE106090 = genes_GSE106090
)

## 3) 共同基因（全部DEG / Up / Down）
common_genes <- intersect(genes_GSE246298, genes_GSE106090)

up_GSE246298 <- unique(na.omit(rownames(GSE246298_DEG[GSE246298_DEG$DEG == "Up", , drop = FALSE])))
up_GSE106090 <- unique(na.omit(rownames(GSE106090_DEG[GSE106090_DEG$DEG == "Up", , drop = FALSE])))
common_up_genes <- intersect(up_GSE246298, up_GSE106090)

down_GSE246298 <- unique(na.omit(rownames(GSE246298_DEG[GSE246298_DEG$DEG == "Down", , drop = FALSE])))
down_GSE106090 <- unique(na.omit(rownames(GSE106090_DEG[GSE106090_DEG$DEG == "Down", , drop = FALSE])))
common_down_genes <- intersect(down_GSE246298, down_GSE106090)

length(common_down_genes)
length(common_up_genes)

## 4) 画韦恩图（按你给的“nature风格”）
p_nature <- ggVennDiagram(
  gene_list,
  label_alpha = 0,
  label = "both",            # 同时显示数量和百分比
  label_size = 6,
  label_color = "#2C3E50",
  edge_size = 2,
  set_size = 8,
  set_color = "#2C3E50",
  show_sets = TRUE
) +
  scale_fill_gradient(
    low = "white",
    high = "#0073C2",
    name = "DEG Count"
  ) +
  scale_color_manual(values = c("#2C3E50", "#2C3E50")) +
  scale_x_continuous(expand = expansion(mult = 0.25)) +
  theme_void() +
  theme(
    legend.position = "right",
    legend.title = element_text(size = 13, face = "bold"),
    legend.text = element_text(size = 11),
    plot.background = element_rect(fill = "white", color = NA),
    plot.margin = margin(30, 30, 30, 30)
  ) +
  annotate(
    "text",
    x = Inf, y = -Inf,
    label = sprintf(
      "Common genes: %d\nCommon Up: %d\nCommon Down: %d",
      length(common_genes), length(common_up_genes), length(common_down_genes)
    ),
    hjust = 1.05, vjust = -0.8,
    size = 5.5,
    fontface = "bold.italic",
    color = "#0073C2"
  )

## 5) 保存
ggsave(
  filename = file.path(out_dir, "DEG_venn_nature.pdf"),
  plot = p_nature,
  width = 10,
  height = 6.5,
  dpi = 300
)
```

如果你还想再分别画 **Up-only 的韦恩图** 和 **Down-only 的韦恩图**（各存一个 PDF），我也可以按同样风格给你补两段最小改动版本。你更希望输出 1 张总图，还是 3 张（All/Up/Down）？

### 👤 User <sub>2025/12/18 10:48</sub>

共同common_up_genes和common_down_genes的韦恩图。还有这两个合并起来的 common_direction_genes的韦恩图

### 🤖 Copilot <sub>2025/12/18 10:48</sub>

下面给你直接可跑的 3 张韦恩图代码（同你之前 `p_nature` 的风格）：

1) **Up 基因集（两队列之间）** 的韦恩图  
2) **Down 基因集（两队列之间）** 的韦恩图  
3) **把 Up+Down 合并、但保留方向一致性** 的“common_direction_genes”韦恩图（用“基因|方向”做集合，避免 Up/Down 混在一起）

```
library(ggVennDiagram)
library(ggplot2)
library(dplyr)

## 输出目录
out_dir <- "results"
if (!dir.exists(out_dir)) dir.create(out_dir, recursive = TRUE)

## 取 Up / Down
up_GSE246298   <- unique(na.omit(rownames(GSE246298_DEG[GSE246298_DEG$DEG == "Up",   , drop = FALSE])))
up_GSE106090   <- unique(na.omit(rownames(GSE106090_DEG[GSE106090_DEG$DEG == "Up",   , drop = FALSE])))
down_GSE246298 <- unique(na.omit(rownames(GSE246298_DEG[GSE246298_DEG$DEG == "Down", , drop = FALSE])))
down_GSE106090 <- unique(na.omit(rownames(GSE106090_DEG[GSE106090_DEG$DEG == "Down", , drop = FALSE])))

common_up_genes   <- intersect(up_GSE246298, up_GSE106090)
common_down_genes <- intersect(down_GSE246298, down_GSE106090)

## 一个复用的“nature 风格”函数
make_venn_nature <- function(gene_list, note_label) {
  ggVennDiagram(
    gene_list,
    label_alpha = 0,
    label = "both",
    label_size = 6,
    label_color = "#2C3E50",
    edge_size = 2,
    set_size = 8,
    set_color = "#2C3E50",
    show_sets = TRUE
  ) +
    scale_fill_gradient(low = "white", high = "#0073C2", name = "DEG Count") +
    scale_color_manual(values = c("#2C3E50", "#2C3E50")) +
    scale_x_continuous(expand = expansion(mult = 0.25)) +
    theme_void() +
    theme(
      legend.position = "right",
      legend.title = element_text(size = 13, face = "bold"),
      legend.text = element_text(size = 11),
      plot.background = element_rect(fill = "white", color = NA),
      plot.margin = margin(30, 30, 30, 30)
    ) +
    annotate(
      "text",
      x = Inf, y = -Inf,
      label = note_label,
      hjust = 1.05, vjust = -0.8,
      size = 5.5,
      fontface = "bold.italic",
      color = "#0073C2"
    )
}

## 1) Up 的韦恩图
gene_list_up <- list(
  GSE246298_Up = up_GSE246298,
  GSE106090_Up = up_GSE106090
)
p_up <- make_venn_nature(
  gene_list_up,
  sprintf("Common Up genes: %d", length(common_up_genes))
)
ggsave(file.path(out_dir, "DEG_venn_up_nature.pdf"), p_up, width = 10, height = 6.5, dpi = 300)

## 2) Down 的韦恩图
gene_list_down <- list(
  GSE246298_Down = down_GSE246298,
  GSE106090_Down = down_GSE106090
)
p_down <- make_venn_nature(
  gene_list_down,
  sprintf("Common Down genes: %d", length(common_down_genes))
)
ggsave(file.path(out_dir, "DEG_venn_down_nature.pdf"), p_down, width = 10, height = 6.5, dpi = 300)

## 3) 合并 Up+Down，但要求方向一致（用“gene|Up/Down”编码）
dir_GSE246298 <- c(paste0(up_GSE246298, "|Up"), paste0(down_GSE246298, "|Down"))
dir_GSE106090 <- c(paste0(up_GSE106090, "|Up"), paste0(down_GSE106090, "|Down"))

common_direction_labels <- intersect(dir_GSE246298, dir_GSE106090)
common_direction_genes <- unique(sub("\\|.*$", "", common_direction_labels))

gene_list_direction <- list(
  GSE246298_Direction = dir_GSE246298,
  GSE106090_Direction = dir_GSE106090
)
p_direction <- make_venn_nature(
  gene_list_direction,
  sprintf("Common direction genes: %d", length(common_direction_genes))
)
ggsave(file.path(out_dir, "DEG_venn_direction_nature.pdf"), p_direction, width = 10, height = 6.5, dpi = 300)

## 如果你还想导出基因列表：
# write.table(common_up_genes,   file.path(out_dir, "common_up_genes.txt"),   quote=FALSE, row.names=FALSE, col.names=FALSE)
# write.table(common_down_genes, file.path(out_dir, "common_down_genes.txt"), quote=FALSE, row.names=FALSE, col.names=FALSE)
# write.table(common_direction_genes, file.path(out_dir, "common_direction_genes.txt"), quote=FALSE, row.names=FALSE, col.names=FALSE)
```

你确认一下：你的 `DEG` 列取值是不是严格等于 `"Up" / "Down" / "Not_Change"`（大小写/下划线一致）？如果不一致，我可以帮你把筛选条件改成更稳健的写法（比如忽略大小写或兼容 “Not change/NS”等）。

### 👤 User <sub>2025/12/18 10:54</sub>

韦恩图GSE 那个标签太大了，显示不完全

### 🤖 Copilot <sub>2025/12/18 10:54</sub>

你这个情况一般有两类原因：**标签文字太长**（比如你现在用的 `GSE246298_Up` / `GSE106090_Down`），以及 **ggplot 默认会裁剪面板外的文字**。下面给你两种最小改法，通常一起用就能彻底解决。

**改法 A：把集合名字缩短 + 字体变小（推荐，最直接）**
把 `gene_list_up / down / direction` 的名字改短一点，例如：

```
gene_list_up <- list(
  `246298 Up` = up_GSE246298,
  `106090 Up` = up_GSE106090
)

gene_list_down <- list(
  `246298 Down` = down_GSE246298,
  `106090 Down` = down_GSE106090
)

gene_list_direction <- list(
  `246298 Dir` = dir_GSE246298,
  `106090 Dir` = dir_GSE106090
)
```

然后把你函数里的 `set_size` 调小（比如 5 或 6）：

```
set_size = 5
```

---

**改法 B：不裁剪文字 + 给画布留更多空白（防止“显示不全”）**
在你 `make_venn_nature()` 里加上 `coord_cartesian(clip = "off")`，并把边距/expand 再放大一点：

```
make_venn_nature <- function(gene_list, note_label) {
  ggVennDiagram(
    gene_list,
    label_alpha = 0,
    label = "both",
    label_size = 6,
    label_color = "#2C3E50",
    edge_size = 2,
    set_size = 5,              # <- 调小
    set_color = "#2C3E50",
    show_sets = TRUE
  ) +
    scale_fill_gradient(low = "white", high = "#0073C2", name = "DEG Count") +
    scale_color_manual(values = c("#2C3E50", "#2C3E50")) +
    scale_x_continuous(expand = expansion(mult = 0.40)) +   # <- 放大
    scale_y_continuous(expand = expansion(mult = 0.40)) +   # <- 放大
    coord_cartesian(clip = "off") +                         # <- 关键：不裁剪
    theme_void() +
    theme(
      legend.position = "right",
      legend.title = element_text(size = 13, face = "bold"),
      legend.text = element_text(size = 11),
      plot.background = element_rect(fill = "white", color = NA),
      plot.margin = margin(50, 70, 50, 70)                  # <- 边距加大
    ) +
    annotate(
      "text",
      x = Inf, y = -Inf,
      label = note_label,
      hjust = 1.05, vjust = -0.8,
      size = 5.5,
      fontface = "bold.italic",
      color = "#0073C2"
    )
}
```

如果你仍然觉得挤，可以再把 `ggsave()` 的宽度稍微加大，比如 `width = 11` 或 `12`。

你现在的标签具体是用的哪一套名字：`GSE246298_Up` 这种长标签，还是纯 `GSE246298`？我可以按你当前那段代码给你一份“完全替换即可运行”的最终版。

### 👤 User <sub>2025/12/18 10:58</sub>

选出common_up和 down分别排前 10 的基因组成火山基因

### 🤖 Copilot <sub>2025/12/18 10:58</sub>

下面给你一套“从 `common_up_genes` 和 `common_down_genes` 各取前 10 个基因，合并成火山图标注基因 `volcano_genes`”的 R 代码。默认用 **两套数据共同信息综合排序**：先按两数据的平均 $|logFC|$ 由大到小，再按两数据里更显著的 P（更小）排序。

> 假设你的 `GSE246298_DEG` / `GSE106090_DEG` 里至少有 `logFC` +（`adj.P.Val` 或 `padj` 或 `P.Value` 之一）。如果列名不同，我这段会自动匹配常见写法。

```
library(dplyr)

## 把 rownames 变成 gene 列，方便 join
to_gene_df <- function(df) {
  df %>% tibble::rownames_to_column("gene")
}

## 自动找列名
pick_col <- function(df, candidates) {
  hit <- intersect(candidates, colnames(df))
  if (length(hit) == 0) stop("缺少列: ", paste(candidates, collapse = "/"))
  hit[1]
}

deg1 <- to_gene_df(GSE246298_DEG)
deg2 <- to_gene_df(GSE106090_DEG)

lfc1 <- pick_col(deg1, c("logFC", "log2FoldChange", "avg_log2FC"))
lfc2 <- pick_col(deg2, c("logFC", "log2FoldChange", "avg_log2FC"))
p1   <- pick_col(deg1, c("adj.P.Val", "padj", "FDR", "p_val_adj", "P.Value", "pvalue", "p_val"))
p2   <- pick_col(deg2, c("adj.P.Val", "padj", "FDR", "p_val_adj", "P.Value", "pvalue", "p_val"))

## 只取需要的列并合并
m <- deg1 %>%
  select(gene, lfc_1 = all_of(lfc1), p_1 = all_of(p1)) %>%
  inner_join(
    deg2 %>% select(gene, lfc_2 = all_of(lfc2), p_2 = all_of(p2)),
    by = "gene"
  )

## （可选但推荐）方向一致性检查：
## common_up 要求两边 logFC 都 > 0；common_down 要求两边 logFC 都 < 0
top10_common_up <- m %>%
  filter(gene %in% common_up_genes, lfc_1 > 0, lfc_2 > 0) %>%
  mutate(
    mean_abs_lfc = (abs(lfc_1) + abs(lfc_2)) / 2,
    best_p = pmin(p_1, p_2, na.rm = TRUE)
  ) %>%
  arrange(desc(mean_abs_lfc), best_p) %>%
  slice_head(n = 10)

top10_common_down <- m %>%
  filter(gene %in% common_down_genes, lfc_1 < 0, lfc_2 < 0) %>%
  mutate(
    mean_abs_lfc = (abs(lfc_1) + abs(lfc_2)) / 2,
    best_p = pmin(p_1, p_2, na.rm = TRUE)
  ) %>%
  arrange(desc(mean_abs_lfc), best_p) %>%
  slice_head(n = 10)

volcano_genes <- unique(c(top10_common_up$gene, top10_common_down$gene))

top10_common_up$gene
top10_common_down$gene
volcano_genes
length(volcano_genes)   # 通常是 20（除非有重复）
```

如果你接下来要“画火山图并标注这些 `volcano_genes`”，我可以按你想用的那张数据集来画：  
你是要用 **GSE246298** 画火山图标注，还是用 **GSE106090**，还是两张都画一张各自标注同一组 `volcano_genes`？

### 👤 User <sub>2025/12/18 10:58</sub>

logFC AveExpr t ÷ P.Value 수 adj.P.Val B 수 DEG

### 🤖 Copilot <sub>2025/12/18 10:58</sub>

你这串列名看起来就是 **limma** 的标准输出（外加你自己加的 `DEG` 列）：

- `logFC`：log2 fold change（火山图 x 轴用它）
- `P.Value`：原始 P 值
- `adj.P.Val`：多重校正后的 P 值（通常火山图 y 轴更推荐用它）
- `AveExpr / t / B`：limma 的统计量（做火山图一般不必用）
- `DEG`：你自己分的 `Up/Down/Not_Change`（用来筛 common_up/down）

所以你之前要“选 common_up/down 各前 10 个基因”，我的那段代码 **可以直接用**，因为我优先匹配的就是 `logFC` 和 `adj.P.Val`，找不到才会退到 `P.Value`。

如果你想显式指定（最稳、最不容易匹配错），就这样写即可：

```
lfc1 <- "logFC"
lfc2 <- "logFC"
p1   <- "adj.P.Val"   # 或者改成 "P.Value"
p2   <- "adj.P.Val"   # 或者改成 "P.Value"
```

然后后面 `select(gene, lfc_1 = all_of(lfc1), p_1 = all_of(p1))` 那套逻辑不变。

如果你现在的列名里出现了奇怪字符（比如你发的 “÷ / 수” 这种，可能是复制时编码问题），先跑一句确认真实列名：

```
colnames(GSE246298_DEG)
colnames(GSE106090_DEG)
```

把输出贴我，我可以帮你把“选前10 + 画火山图标注”完全对齐到你真实列名（用 `adj.P.Val` 还是 `P.Value` 也一起确认）。

### 👤 User <sub>2025/12/18 10:59</sub>

[1] "logFC"     "AveExpr"   "t"         "P.Value"   "adj.P.Val" "B"         "DEG"  

### 🤖 Copilot <sub>2025/12/18 10:59</sub>

很好，你的列名就是标准 limma：`logFC` 和 `adj.P.Val` 都齐全。下面给你一段“**严格用这两个列**”来从 `common_up_genes`、`common_down_genes` **各选前 10 个**并合并成“火山图标注基因集”的代码（排序规则：两数据集的平均 $|logFC|$ 越大越靠前；同时更显著（两者中更小的 `adj.P.Val`）优先）。

```
library(dplyr)
library(tibble)

## 1) 变成带 gene 列的数据框
deg1 <- GSE246298_DEG %>% rownames_to_column("gene")
deg2 <- GSE106090_DEG %>% rownames_to_column("gene")

## 2) 合并两套数据的 logFC + adj.P.Val（只保留共有基因）
m <- deg1 %>%
  select(gene, logFC_1 = logFC, adjP_1 = adj.P.Val) %>%
  inner_join(
    deg2 %>% select(gene, logFC_2 = logFC, adjP_2 = adj.P.Val),
    by = "gene"
  )

## 3) common_up / common_down 各取前10（方向一致：两边logFC同号）
top10_common_up <- m %>%
  filter(gene %in% common_up_genes, logFC_1 > 0, logFC_2 > 0) %>%
  mutate(
    mean_abs_logFC = (abs(logFC_1) + abs(logFC_2)) / 2,
    best_adjP = pmin(adjP_1, adjP_2, na.rm = TRUE)
  ) %>%
  arrange(desc(mean_abs_logFC), best_adjP) %>%
  slice_head(n = 10)

top10_common_down <- m %>%
  filter(gene %in% common_down_genes, logFC_1 < 0, logFC_2 < 0) %>%
  mutate(
    mean_abs_logFC = (abs(logFC_1) + abs(logFC_2)) / 2,
    best_adjP = pmin(adjP_1, adjP_2, na.rm = TRUE)
  ) %>%
  arrange(desc(mean_abs_logFC), best_adjP) %>%
  slice_head(n = 10)

## 4) 合并成火山图要标注的基因集
volcano_genes <- unique(c(top10_common_up$gene, top10_common_down$gene))

## 查看结果
top10_common_up$gene
top10_common_down$gene
volcano_genes
length(volcano_genes)   # 通常=20
```

如果你希望“前10”的定义改成 **按显著性（best adj.P.Val 最小）优先**，或只按 **某一个数据集**（比如只用 GSE246298 的 `abs(logFC)` 排序），告诉我你想用哪种规则，我给你对应的一行 `arrange()` 替换版。
