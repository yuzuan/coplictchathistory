# deg_genes <- DEG_sig$gene > > # 初始化STRINGdb (9606 = human, 10090 = mouse) > #...

| Field | Value |
|-------|-------|
| Session ID | `a4ca58b6-d7df-462e-9e3a-ef31bc93d403` |
| Workspace | igraph中心性指标转换错误解决方案 |
| Start | 2025/11/29 08:53 |
| End | 2025/11/29 09:57 |
| Messages | 22 |

---

### 👤 User <sub>2025/11/29 08:53</sub>

 deg_genes <- DEG_sig$gene
> 
> # 初始化STRINGdb (9606 = human, 10090 = mouse)
> # 根据你的物种修改species参数
> string_db <- STRINGdb$new(version = "11.5", 
+                           species = 9606,  # 人类
+                           score_threshold = 400,  # 中等置信度
+                           input_directory = output_dir)
> 
> # 将基因映射到STRING ID
> deg_mapped <- string_db$map(data.frame(gene = deg_genes), "gene", removeUnmappedRows = TRUE)
Warning:  we couldn't map to STRING 12% of your identifiers> cat("成功映射基因数:", nrow(deg_mapped), "/", length(deg_genes), "\n")
成功映射基因数: 2610 / 2961 
> 
> # 获取PPI网络
> if(nrow(deg_mapped) > 0) {
+     
+     # 获取互作关系
+     interactions <- string_db$get_interactions(deg_mapped$STRING_id)
+     
+     # 保存互作关系
+     write.csv(interactions, file.path(output_dir, "PPI_interactions.csv"), row.names = FALSE)
+     
+     # 绘制PPI网络图
+     pdf(file.path(output_dir, "PPI_network_STRING.pdf"), width = 12, height = 12)
+     string_db$plot_network(deg_mapped$STRING_id[1:min(200, nrow(deg_mapped))])
+     dev.off()
+     
+     # ============================================
+     # 5. 使用igraph计算Hub基因
+     # ============================================
+     
+     if(nrow(interactions) > 0) {
+         
+         # 创建igraph网络对象
+         # 将STRING_id转换回基因名
+         id_to_gene <- setNames(deg_mapped$gene, deg_mapped$STRING_id)
+         
+         interactions$from_gene <- id_to_gene[interactions$from]
+         interactions$to_gene <- id_to_gene[interactions$to]
+         
+         # 移除NA
+         interactions_clean <- interactions[!is.na(interactions$from_gene) & !is.na(interactions$to_gene), ]
+         
+         # 创建网络
+         g <- graph_from_data_frame(interactions_clean[, c("from_gene", "to_gene")], directed = FALSE)
+         
+         # 计算多种中心性指标
+         hub_analysis <- data.frame(
+             gene = V(g)$name,
+             degree = degree(g),
+             betweenness = betweenness(g),
+             closeness = closeness(g),
+             eigenvector = eigen_centrality(g)$vector
+         )
+         
+         # 按degree排序
+         hub_analysis <- hub_analysis[order(hub_analysis$degree, decreasing = TRUE), ]
+         
+         # 保存hub基因分析结果
+         write.csv(hub_analysis, file.path(output_dir, "hub_genes_analysis.csv"), row.names = FALSE)
+         
+         # 显示Top 20 Hub基因
+         cat("\n========== Top 20 Hub Genes (by Degree) ==========\n")
+         print(head(hub_analysis, 20))
+         
+         # 提取Top Hub基因
+         top_hub_genes <- head(hub_analysis, 10)
+         
+         # ============================================
+         # 6. Hub基因可视化
+         # ============================================
+         
+         # Hub基因柱状图
+         p_hub <- ggplot(head(hub_analysis, 20), aes(x = reorder(gene, degree), y = degree)) +
+             geom_bar(stat = "identity", fill = "#E41A1C", alpha = 0.8) +
+             coord_flip() +
+             theme_bw() +
+             labs(x = "Gene", y = "Degree", title = "Top 20 Hub Genes (by Degree)") +
+             theme(plot.title = element_text(hjust = 0.5))
+         
+         print(p_hub)
+         ggsave(file.path(output_dir, "hub_genes_barplot.pdf"), p_hub, width = 8, height = 6)
+         ggsave(file.path(output_dir, "hub_genes_barplot.png"), p_hub, width = 8, height = 6, dpi = 300)
+         
+         # Hub基因网络图
+         # 提取包含top hub基因的子网络
+         top_hub_names <- head(hub_analysis$gene, 10)
+         neighbors_list <- unlist(lapply(top_hub_names, function(x) neighbors(g, x)$name))
+         subnet_nodes <- unique(c(top_hub_names, neighbors_list))
+         
+         # 限制节点数量
+         if(length(subnet_nodes) > 100) {
+             subnet_nodes <- subnet_nodes[1:100]
+         }
+         
+         g_sub <- induced_subgraph(g, subnet_nodes)
+         
+         # 设置节点属性
+         V(g_sub)$color <- ifelse(V(g_sub)$name %in% top_hub_names, "#E41A1C", "#377EB8")
+         V(g_sub)$size <- ifelse(V(g_sub)$name %in% top_hub_names, 15, 8)
+         V(g_sub)$label.cex <- ifelse(V(g_sub)$name %in% top_hub_names, 0.8, 0.5)
+         
+         # 绘制网络
+         pdf(file.path(output_dir, "hub_genes_network.pdf"), width = 12, height = 12)
+         set.seed(123)
+         plot(g_sub, 
+              layout = layout_with_fr(g_sub),
+              vertex.label = V(g_sub)$name,
+              vertex.label.color = "black",
+              edge.color = "grey70",
+              edge.width = 0.5,
+              main = "Hub Genes PPI Network")
+         legend("bottomright", 
+                legend = c("Hub Gene", "Other Gene"),
+                fill = c("#E41A1C", "#377EB8"),
+                border = NA)
+         dev.off()
+         
+         # ============================================
+         # 7. Hub基因热图
+         # ============================================
+         
+         # 提取hub基因的表达矩阵
+         hub_genes_in_exp <- intersect(top_hub_genes$gene, rownames(exp))
+         
+         if(length(hub_genes_in_exp) > 0) {
+             exp_hub <- exp[hub_genes_in_exp, ]
+             exp_hub_scaled <- t(scale(t(exp_hub)))
+             
+             p_hub_heatmap <- pheatmap(exp_hub_scaled,
+                                       scale = "none",
+                                       cluster_rows = TRUE,
+                                       cluster_cols = TRUE,
+                                       show_rownames = TRUE,
+                                       show_colnames = FALSE,
+                                       annotation_col = annotation_col,
+                                       annotation_colors = ann_colors,
+                                       color = colorRampPalette(c("#377EB8", "white", "#E41A1C"))(100),
+                                       main = "Expression of Top Hub Genes",
+                                       fontsize = 10)
+             
+             pdf(file.path(output_dir, "hub_genes_heatmap.pdf"), width = 10, height = 6)
+             print(p_hub_heatmap)
+             dev.off()
+         }
+         
+     } else {
+         cat("没有找到蛋白互作关系\n")
+     }
+     
+ } else {
+     cat("基因映射失败，请检查基因名格式\n")
+ }
Error in as.data.frame.default(x[[i]], optional = TRUE, stringsAsFactors = stringsAsFactors) : 
  cannot coerce class ‘"degree"’ to a data.frame

### 🤖 Copilot <sub>2025/11/29 08:53</sub>

这个错误是因为 `igraph` 包的 `degree()` 函数返回的是一个特殊的 "degree" 类对象，而不是普通的数值向量。需要将其转换为普通数值。

问题出在这一行代码：

```r
hub_analysis <- data.frame(
    gene = V(g)$name,
    degree = degree(g),  # 这里返回的是 "degree" 类对象
    betweenness = betweenness(g),
    closeness = closeness(g),
    eigenvector = eigen_centrality(g)$vector
)
```

**解决方法**：使用 `as.numeric()` 或 `as.vector()` 将 `degree()` 的结果转换为普通数值向量：

```r
hub_analysis <- data.frame(
    gene = V(g)$name,
    degree = as.numeric(degree(g)),
    betweenness = as.numeric(betweenness(g)),
    closeness = as.numeric(closeness(g)),
    eigenvector = as.numeric(eigen_centrality(g)$vector)
)
```

**完整修改后的代码段**：

```r
# 计算多种中心性指标
hub_analysis <- data.frame(
    gene = V(g)$name,
    degree = as.numeric(degree(g)),
    betweenness = as.numeric(betweenness(g)),
    closeness = as.numeric(closeness(g)),
    eigenvector = as.numeric(eigen_centrality(g)$vector)
)
```

这个问题通常出现在较新版本的 `igraph` 包中，它为中心性指标添加了专门的类。通过显式转换为数值类型，可以确保这些值能够正确地放入 `data.frame` 中。

### 👤 User <sub>2025/11/29 08:54</sub>

Error in data.frame(gene = V(g)$name, degree = as.numeric(degree(g)),  : 
  'list' object cannot be coerced to type 'double'

### 🤖 Copilot <sub>2025/11/29 08:54</sub>

这个错误说明 `eigen_centrality(g)$vector` 返回的是一个列表而不是向量。需要用 `unlist()` 来处理。

**修正后的代码**：

```r
# 计算多种中心性指标
deg_values <- degree(g)
bet_values <- betweenness(g)
clo_values <- closeness(g)
eig_values <- eigen_centrality(g)$vector

hub_analysis <- data.frame(
    gene = V(g)$name,
    degree = as.numeric(deg_values),
    betweenness = as.numeric(bet_values),
    closeness = as.numeric(clo_values),
    eigenvector = as.numeric(unlist(eig_values))
)
```

或者更简洁的写法：

```r
# 计算多种中心性指标
hub_analysis <- data.frame(
    gene = names(V(g)),
    degree = as.vector(degree(g)),
    betweenness = as.vector(betweenness(g)),
    closeness = as.vector(closeness(g)),
    eigenvector = unlist(eigen_centrality(g)$vector)
)
```

**如果仍有问题**，可以尝试更保守的方法：

```r
# 分步计算，避免类型问题
gene_names <- V(g)$name
n_genes <- length(gene_names)

hub_analysis <- data.frame(
    gene = gene_names,
    stringsAsFactors = FALSE
)

hub_analysis$degree <- as.vector(degree(g))
hub_analysis$betweenness <- as.vector(betweenness(g))
hub_analysis$closeness <- as.vector(closeness(g))

# eigen_centrality 特殊处理
eig_result <- eigen_centrality(g)
hub_analysis$eigenvector <- as.vector(eig_result$vector)
```

这种分步赋值的方式可以更好地处理不同函数返回的各种数据类型。

### 👤 User <sub>2025/11/29 08:55</sub>

+     top_heatmap_genes <- sig_genes
+ }
> 
> # 提取表达矩阵
> exp_heatmap <- exp[top_heatmap_genes, ]
> 
> # 标准化（Z-score）
> exp_heatmap_scaled <- t(scale(t(exp_heatmap)))
> 
> # 注释信息
> annotation_col <- data.frame(
+     Group = pd$group,
+     row.names = rownames(pd)
+ )
> 
> # 颜色设置
> ann_colors <- list(
+     Group = c(Normal = "#4DAF4A", Tumor = "#E41A1C")
+ )
> 
> # 绘制热图
> p_heatmap <- pheatmap(exp_heatmap_scaled,
+                       scale = "none",
+                       clustering_method = "complete",
+                       cluster_rows = TRUE,
+                       cluster_cols = TRUE,
+                       show_rownames = ifelse(length(top_heatmap_genes) <= 50, TRUE, FALSE),
+                       show_colnames = FALSE,
+                       annotation_col = annotation_col,
+                       annotation_colors = ann_colors,
+                       color = colorRampPalette(c("#377EB8", "white", "#E41A1C"))(100),
+                       main = "Heatmap of Differentially Expressed Genes",
+                       fontsize = 10,
+                       fontsize_row = 6)
Error in hclust(d, method = method) : must have n >= 2 objects to cluster
> View(top_genes)
> obj <- download_GEO("GSE83452", out_dir = "test/00_GEO_data_GSE83452")
INFO [2025-11-29 08:13:42] Step1: Download GEO data ...
INFO [2025-11-29 08:13:42] Querying dataset: GSE83452 ...
	- Use local curl
	- Found 1 GPL
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 38.9M  100 38.9M    0     0  1834k      0  0:00:21  0:00:21 --:--:-- 4915k
	- Processing GPL16686 ...
	- Found 231 samples, 43 metas.
	- Writting sample_anno to test/00_GEO_data_GSE83452/GSE83452_GPL16686_sample_anno.csv 
	- Normalize between arrays ...
	- Successed, file save to test/00_GEO_data_GSE83452/GSE83452_GPL16686_raw.RData 
INFO [2025-11-29 08:14:35] Step2: Annotate probe GPL16686 ...
INFO [2025-11-29 08:14:35] Use AnnoProbe annotation file ...
	- Can't find annotation table in AnnoProbe.
INFO [2025-11-29 08:14:35] Download online annotation file ...
Can't find online annotation table. Please download annotation table manually:
	https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GPL16686
Error in anno_GEO_online(expM, GPL, out_dir = out_dir, symbol_name = symbol_name,  : 
  
In addition: Warning message:
In download.file(soft_url, destfile = soft_file, quiet = TRUE) :
  cannot open URL 'https://ftp.ncbi.nlm.nih.gov/geo/platforms/GPL16nnn/GPL16686/annot/GPL16686.annot.gz': HTTP status was '404 Not Found'
> rm(list = ls())
> load("~/Desktop/2025_08_10 fastGEO/test/00_GEO_data_GSE83452/GSE83452_GPL16686_raw.RData")
> exp <- GSE83452_GPL16686$expM
> View(exp)
> url <- "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?view=data&acc=GPL16686&id=17306&db=GeoDb_blob94"
> anno_tb_url <- read_GPL_url(url, out_dir = "test/GPL21827")
	Processing: GPL16686 ...
	File downloaded successfully!
	Found annotation column: GB_ACC 
	New annotation file save to: /Library/Frameworks/R.framework/Versions/4.4-arm64/Resources/library/fastGEO/data/anno_obj.RData 
> hd(anno_tb_url[[1]])
Type: data.frame  Dim: 53981 × 2 
        ID    SYMBOL
1 16657436   DDX11L1
2 16657440          
3 16657445          
4 16657447          
5 16657450 LINC01000
> View(exp)
> anno=anno_tb_url$GPL16686
> View(anno)
> anno <- anno[!(is.na(anno$SYMBOL) | anno$SYMBOL == ""), ]
> anno <- anno[anno$SYMBOL != "---", ]
> View(anno)
> common_ids <- intersect(rownames(exp), anno$ID)
> exp_filtered <- exp[common_ids, ]
> exp_df <- as.data.frame(exp_filtered)
> exp_df$ID <- rownames(exp_filtered)
> exp_df <- merge(exp_df, anno[, c("ID", "SYMBOL")], by = "ID")
> exp_df$ID <- NULL
> if (any(duplicated(exp_df$SYMBOL))) {
+     expr <- aggregate(. ~ SYMBOL, data = exp_df, FUN = mean, na.rm = TRUE)
+      rownames(expr) <- expr$SYMBOL
+     expr$SYMBOL <- NULL
+  } else {
+      rownames(exp_df) <- exp_df$SYMBOL
+      expr <- exp_df[, !colnames(exp_df) %in% "SYMBOL"]
+  }
> View(expr)
> exp=expr
> out_dir <- "test/00_GEO_data_GSE83452"
> write_csv(cbind(RowName = rownames(exp), exp), file.path(out_dir, "exp.csv"))
                                                                                                                         
> rm(list = ls())
> obj <- download_GEO("GSE15605", out_dir = "test/00_GEO_data_GSE15605")
Find local annotation file, will be used preferably!
INFO [2025-11-29 08:33:03] Step1: Download GEO data ...
INFO [2025-11-29 08:33:03] Querying dataset: GSE15605 ...
	- Use local curl
	- Found 1 GPL
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 17.2M  100 17.2M    0     0  2153k      0  0:00:08  0:00:08 --:--:-- 3273k
	- Processing GPL570 ...
	- Found 74 samples, 47 metas.
	- Writting sample_anno to test/00_GEO_data_GSE15605/GSE15605_GPL570_sample_anno.csv 
	- Normalize between arrays ...
	- Successed, file save to test/00_GEO_data_GSE15605/GSE15605_GPL570_raw.RData 
INFO [2025-11-29 08:33:25] Step2: Annotate probe GPL570 ...
INFO [2025-11-29 08:33:25] Use built-in annotation file ...
- All porbes matched!
- All porbes annotated!
INFO [2025-11-29 08:33:25] Removing duplicated genes by method: max ...
INFO [2025-11-29 08:33:31] Done.
> exp <- GSE15605_GPL16686$expM
Error: object 'GSE15605_GPL16686' not found
> exp <- obj$expM
> pd <- obj$sample_anno
> 
> small <- function(df){
+     library(tibble)
+     library(dplyr)
+     colname <- vector("character")
+     count <- vector("integer")
+     for(i in 1:ncol(df)){
+         colname[i] = colnames(df)[[i]]
+         count[i]=nrow(df[!duplicated(df[,i]),])
+     }
+     o <- tibble(colname,count) 
+     output=df[,o$count>1]
+ }
> pd=small(pd)
> out_dir <- "test/00_GEO_data_GSE15605"
> write_csv(cbind(RowName = rownames(exp), exp), file.path(out_dir, "exp.csv"))
> write_csv(cbind(RowName = rownames(pd),  pd),  file.path(out_dir, "pd.csv"))                                           
                                                                                                                         
> View(exp)
> View(pd)
> pd$group <- ifelse(
+     pd$source_name_ch1 == "Frozen tip of melanoma excision",
+     "Normal",
+     "Tumor"
+ )
> library(limma)      # 差异分析
> library(ggplot2)    # 绑图
> library(pheatmap)   # 热图
> library(ggrepel)    # 火山图标签
> library(STRINGdb)   # PPI分析
> library(igraph)     # 网络分析
> 
> # 设置保存路径
> output_dir <- out_dir
> 
> # 设置分组因子，Tumor vs Normal
> group <- factor(pd$group, levels = c("Normal", "Tumor"))
> 
> # 构建设计矩阵
> design <- model.matrix(~ 0 + group)
> colnames(design) <- levels(group)
> 
> # 拟合模型
> fit <- lmFit(exp, design)
> 
> # 设置对比：Tumor vs Normal
> contrast <- makeContrasts(Tumor - Normal, levels = design)
> fit2 <- contrasts.fit(fit, contrast)
> fit2 <- eBayes(fit2)
> 
> # 获取差异分析结果
> DEG <- topTable(fit2, coef = 1, number = Inf, adjust.method = "BH")
> DEG$gene <- rownames(DEG)
> DEG$FDR <- DEG$adj.P.Val
> # 添加差异表达标签 (logFC > 1, adj.P.Val < 0.05)
> DEG$change <- ifelse(DEG$adj.P.Val < 0.05 & DEG$logFC > 1, "Up",
+                      ifelse(DEG$adj.P.Val < 0.05 & DEG$logFC < -1, "Down", "Not Sig"))
> DEG <- DEG[, c("gene", "logFC", "AveExpr", "t", "P.Value", "FDR", "B", "change")]
> table(DEG$change)

   Down Not Sig      Up 
   1951   16532    1010 
> 
> # 保存差异分析结果
> write.csv(DEG, file.path(output_dir, "DEG_results.csv"), row.names = FALSE)
> 
> # 筛选显著差异基因
> DEG_sig <- DEG[DEG$change != "Not Sig", ]
> write.csv(DEG_sig, file.path(output_dir, "DEG_significant.csv"), row.names = FALSE)
> 
> cat("总基因数:", nrow(DEG), "\n")
总基因数: 19493 
> cat("上调基因:", sum(DEG$change == "Up"), "\n")
上调基因: 1010 
> cat("下调基因:", sum(DEG$change == "Down"), "\n")
下调基因: 1951 
> top_genes <- DEG[DEG$change != "Not Sig", ]
> top_genes <- top_genes[order(abs(top_genes$logFC), decreasing = TRUE), ][1:20, ]
> 
> # 火山图 - 使用FDR替代adj.P.Val
> p_volcano <- ggplot(DEG, aes(x = logFC, y = -log10(FDR), color = change)) +
+     geom_point(alpha = 0.6, size = 1.5) +
+     scale_color_manual(values = c("Up" = "#E41A1C", "Down" = "#377EB8", "Not Sig" = "grey60")) +
+     geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "black") +
+     geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "black") +
+     theme_bw() +
+     labs(x = "log2 Fold Change", 
+          y = "-log10(FDR)", 
+          title = "Volcano Plot: Tumor vs Normal",
+          color = "Expression") +
+     theme(plot.title = element_text(hjust = 0.5),
+           legend.position = "right") +
+     geom_text_repel(data = top_genes,
+                     aes(label = gene),
+                     size = 3,
+                     max.overlaps = 20,
+                     show.legend = FALSE)
> 
> print(p_volcano)
> ggsave(file.path(output_dir, "volcano_plot.pdf"), p_volcano, width = 8, height = 6)
> ggsave(file.path(output_dir, "volcano_plot.png"), p_volcano, width = 8, height = 6, dpi = 300)
> print(p_volcano)
> ggsave(file.path(output_dir, "volcano_plot.pdf"), p_volcano, width = 8, height = 6)
> ggsave(file.path(output_dir, "volcano_plot.png"), p_volcano, width = 8, height = 6, dpi = 300)
> library(ComplexHeatmap)
Loading required package: grid
========================================
ComplexHeatmap version 2.22.0
Bioconductor page: http://bioconductor.org/packages/ComplexHeatmap/
Github page: https://github.com/jokergoo/ComplexHeatmap
Documentation: http://jokergoo.github.io/ComplexHeatmap-reference

If you use it in published research, please cite either one:
- Gu, Z. Complex Heatmap Visualization. iMeta 2022.
- Gu, Z. Complex heatmaps reveal patterns and correlations in multidimensional 
    genomic data. Bioinformatics 2016.


The new InteractiveComplexHeatmap package can directly export static 
complex heatmaps into an interactive Shiny app with zero effort. Have a try!

This message can be suppressed by:
  suppressPackageStartupMessages(library(ComplexHeatmap))
========================================
! pheatmap() has been masked by ComplexHeatmap::pheatmap(). Most of the arguments
   in the original pheatmap() are identically supported in the new function. You 
   can still use the original function by explicitly calling pheatmap::pheatmap().


Attaching package: ‘ComplexHeatmap’

The following object is masked from ‘package:pheatmap’:

    pheatmap

> library(circlize)
========================================
circlize version 0.4.16
CRAN page: https://cran.r-project.org/package=circlize
Github page: https://github.com/jokergoo/circlize
Documentation: https://jokergoo.github.io/circlize_book/book/

If you use it in published research, please cite:
Gu, Z. circlize implements and enhances circular visualization
  in R. Bioinformatics 2014.

This message can be suppressed by:
  suppressPackageStartupMessages(library(circlize))
========================================


Attaching package: ‘circlize’

The following object is masked from ‘package:igraph’:

    degree

> 
> # 准备表达矩阵
> heatmap_genes <- c(UP, DOWN)
Error: object 'UP' not found
> View(DEG)
> # 获取Up和Down基因，各取TOP50（按FDR排序）
> DEG_up <- DEG[DEG$change == "Up" & DEG$gene %in% rownames(exp), ]
> DEG_up <- DEG_up[order(DEG_up$FDR), ]
> UP <- head(DEG_up$gene, 50)
> 
> DEG_down <- DEG[DEG$change == "Down" & DEG$gene %in% rownames(exp), ]
> DEG_down <- DEG_down[order(DEG_down$FDR), ]
> DOWN <- head(DEG_down$gene, 50)
> 
> cat("上调基因数:", length(UP), "\n")
上调基因数: 50 
> cat("下调基因数:", length(DOWN), "\n")
下调基因数: 50 
> 
> # 加载ComplexHeatmap
> library(ComplexHeatmap)
> library(circlize)
> 
> # 准备表达矩阵
> heatmap_genes <- c(UP, DOWN)
> exp_heatmap <- exp[heatmap_genes, ]
> exp_scale <- t(scale(t(exp_heatmap)))
> 
> # 列注释（样本分组）
> annotation_col <- data.frame(
+     Group = pd$group,
+     row.names = rownames(pd)
+ )
> 
> # 行注释（基因上下调）
> annotation_row <- data.frame(
+     gene_class = c(rep("Up", length(UP)), rep("Down", length(DOWN))),
+     row.names = heatmap_genes
+ )
> 
> # 顶部注释
> ha <- HeatmapAnnotation(
+     Group = annotation_col$Group,
+     col = list(Group = c("control" = "#2fa1dd", "experimental" = "#f87669")),
+     annotation_legend_param = list(direction = "horizontal", nrow = 1)
+ )
> 
> # 绑制热图
> pdf(file = file.path(output_dir, "heatmap_top50_DEG.pdf"), width = 10, height = 12)
> p <- Heatmap(exp_scale,
+              col = colorRampPalette(c("#524b9a", "white", "#e63118"))(100),
+              name = "Gene Expression\n(Z-score)",
+              heatmap_legend_param = list(direction = "horizontal", nrow = 1),
+              show_row_names = T,
+              row_names_side = "right",
+              row_names_gp = gpar(fontsize = 6),
+              show_column_names = F,
+              show_row_dend = F,
+              show_column_dend = F,
+              top_annotation = ha,
+              column_title_side = "top",
+              column_split = annotation_col$Group,
+              row_split = annotation_row$gene_class,
+              column_title = NULL,
+              cluster_column_slices = F,
+              border = T)
> draw(p, heatmap_legend_side = "bottom", annotation_legend_side = "bottom", merge_legend = TRUE)
Error: Group: cannot map colors to some of the levels: Normal
> # 顶部注释
> ha <- HeatmapAnnotation(
+     Group = annotation_col$Group,
+     col = list(Group = c("Normal" = "#2fa1dd", "Tumor" = "#f87669")),
+     annotation_legend_param = list(direction = "horizontal", nrow = 1)
+ )
> 
> # 绑制热图
> pdf(file = file.path(output_dir, "heatmap_top50_DEG.pdf"), width = 10, height = 12)
> p <- Heatmap(exp_scale,
+              col = colorRampPalette(c("#524b9a", "white", "#e63118"))(100),
+              name = "Gene Expression\n(Z-score)",
+              heatmap_legend_param = list(direction = "horizontal", nrow = 1),
+              show_row_names = T,
+              row_names_side = "right",
+              row_names_gp = gpar(fontsize = 6),
+              show_column_names = F,
+              show_row_dend = F,
+              show_column_dend = F,
+              top_annotation = ha,
+              column_title_side = "top",
+              column_split = annotation_col$Group,
+              row_split = annotation_row$gene_class,
+              column_title = NULL,
+              cluster_column_slices = F,
+              border = T)
> draw(p, heatmap_legend_side = "bottom", annotation_legend_side = "bottom", merge_legend = TRUE)
> dev.off()
RStudioGD 
        2 
> 
> # 同时保存png
> png(file.path(output_dir, "heatmap_top50_DEG.png"), width = 10, height = 12, units = "in", res = 300)
> draw(p, heatmap_legend_side = "bottom", annotation_legend_side = "bottom", merge_legend = TRUE)
> dev.off()
RStudioGD 
        2 
> deg_genes <- DEG_sig$gene
> 
> # 初始化STRINGdb (9606 = human, 10090 = mouse)
> # 根据你的物种修改species参数
> string_db <- STRINGdb$new(version = "11.5", 
+                           species = 9606,  # 人类
+                           score_threshold = 400,  # 中等置信度
+                           input_directory = output_dir)
> 
> # 将基因映射到STRING ID
> deg_mapped <- string_db$map(data.frame(gene = deg_genes), "gene", removeUnmappedRows = TRUE)
trying URL 'https://stringdb-downloads.org/download/protein.aliases.v11.5/9606.protein.aliases.v11.5.txt.gz'
Content type 'application/octet-stream' length 21726816 bytes (20.7 MB)
==================================================
downloaded 20.7 MB

trying URL 'https://stringdb-downloads.org/download/protein.info.v11.5/9606.protein.info.v11.5.txt.gz'
Content type 'application/octet-stream' length 1901833 bytes (1.8 MB)
==================================================
downloaded 1.8 MB

Warning:  we couldn't map to STRING 12% of your identifiers> cat("成功映射基因数:", nrow(deg_mapped), "/", length(deg_genes), "\n")
成功映射基因数: 2610 / 2961 
> 
> # 获取PPI网络
> if(nrow(deg_mapped) > 0) {
+     
+     # 获取互作关系
+     interactions <- string_db$get_interactions(deg_mapped$STRING_id)
+     
+     # 保存互作关系
+     write.csv(interactions, file.path(output_dir, "PPI_interactions.csv"), row.names = FALSE)
+     
+     # 绘制PPI网络图
+     pdf(file.path(output_dir, "PPI_network_STRING.pdf"), width = 12, height = 12)
+     string_db$plot_network(deg_mapped$STRING_id[1:min(200, nrow(deg_mapped))])
+     dev.off()
+     
+     # ============================================
+     # 5. 使用igraph计算Hub基因
+     # ============================================
+     
+     if(nrow(interactions) > 0) {
+         
+         # 创建igraph网络对象
+         # 将STRING_id转换回基因名
+         id_to_gene <- setNames(deg_mapped$gene, deg_mapped$STRING_id)
+         
+         interactions$from_gene <- id_to_gene[interactions$from]
+         interactions$to_gene <- id_to_gene[interactions$to]
+         
+         # 移除NA
+         interactions_clean <- interactions[!is.na(interactions$from_gene) & !is.na(interactions$to_gene), ]
+         
+         # 创建网络
+         g <- graph_from_data_frame(interactions_clean[, c("from_gene", "to_gene")], directed = FALSE)
+         
+         # 计算多种中心性指标
+         hub_analysis <- data.frame(
+             gene = V(g)$name,
+             degree = degree(g),
+             betweenness = betweenness(g),
+             closeness = closeness(g),
+             eigenvector = eigen_centrality(g)$vector
+         )
+         
+         # 按degree排序
+         hub_analysis <- hub_analysis[order(hub_analysis$degree, decreasing = TRUE), ]
+         
+         # 保存hub基因分析结果
+         write.csv(hub_analysis, file.path(output_dir, "hub_genes_analysis.csv"), row.names = FALSE)
+         
+         # 显示Top 20 Hub基因
+         cat("\n========== Top 20 Hub Genes (by Degree) ==========\n")
+         print(head(hub_analysis, 20))
+         
+         # 提取Top Hub基因
+         top_hub_genes <- head(hub_analysis, 10)
+         
+         # ============================================
+         # 6. Hub基因可视化
+         # ============================================
+         
+         # Hub基因柱状图
+         p_hub <- ggplot(head(hub_analysis, 20), aes(x = reorder(gene, degree), y = degree)) +
+             geom_bar(stat = "identity", fill = "#E41A1C", alpha = 0.8) +
+             coord_flip() +
+             theme_bw() +
+             labs(x = "Gene", y = "Degree", title = "Top 20 Hub Genes (by Degree)") +
+             theme(plot.title = element_text(hjust = 0.5))
+         
+         print(p_hub)
+         ggsave(file.path(output_dir, "hub_genes_barplot.pdf"), p_hub, width = 8, height = 6)
+         ggsave(file.path(output_dir, "hub_genes_barplot.png"), p_hub, width = 8, height = 6, dpi = 300)
+         
+         # Hub基因网络图
+         # 提取包含top hub基因的子网络
+         top_hub_names <- head(hub_analysis$gene, 10)
+         neighbors_list <- unlist(lapply(top_hub_names, function(x) neighbors(g, x)$name))
+         subnet_nodes <- unique(c(top_hub_names, neighbors_list))
+         
+         # 限制节点数量
+         if(length(subnet_nodes) > 100) {
+             subnet_nodes <- subnet_nodes[1:100]
+         }
+         
+         g_sub <- induced_subgraph(g, subnet_nodes)
+         
+         # 设置节点属性
+         V(g_sub)$color <- ifelse(V(g_sub)$name %in% top_hub_names, "#E41A1C", "#377EB8")
+         V(g_sub)$size <- ifelse(V(g_sub)$name %in% top_hub_names, 15, 8)
+         V(g_sub)$label.cex <- ifelse(V(g_sub)$name %in% top_hub_names, 0.8, 0.5)
+         
+         # 绘制网络
+         pdf(file.path(output_dir, "hub_genes_network.pdf"), width = 12, height = 12)
+         set.seed(123)
+         plot(g_sub, 
+              layout = layout_with_fr(g_sub),
+              vertex.label = V(g_sub)$name,
+              vertex.label.color = "black",
+              edge.color = "grey70",
+              edge.width = 0.5,
+              main = "Hub Genes PPI Network")
+         legend("bottomright", 
+                legend = c("Hub Gene", "Other Gene"),
+                fill = c("#E41A1C", "#377EB8"),
+                border = NA)
+         dev.off()
+         
+         # ============================================
+         # 7. Hub基因热图
+         # ============================================
+         
+         # 提取hub基因的表达矩阵
+         hub_genes_in_exp <- intersect(top_hub_genes$gene, rownames(exp))
+         
+         if(length(hub_genes_in_exp) > 0) {
+             exp_hub <- exp[hub_genes_in_exp, ]
+             exp_hub_scaled <- t(scale(t(exp_hub)))
+             
+             p_hub_heatmap <- pheatmap(exp_hub_scaled,
+                                       scale = "none",
+                                       cluster_rows = TRUE,
+                                       cluster_cols = TRUE,
+                                       show_rownames = TRUE,
+                                       show_colnames = FALSE,
+                                       annotation_col = annotation_col,
+                                       annotation_colors = ann_colors,
+                                       color = colorRampPalette(c("#377EB8", "white", "#E41A1C"))(100),
+                                       main = "Expression of Top Hub Genes",
+                                       fontsize = 10)
+             
+             pdf(file.path(output_dir, "hub_genes_heatmap.pdf"), width = 10, height = 6)
+             print(p_hub_heatmap)
+             dev.off()
+         }
+         
+     } else {
+         cat("没有找到蛋白互作关系\n")
+     }
+     
+ } else {
+     cat("基因映射失败，请检查基因名格式\n")
+ }
trying URL 'https://stringdb-downloads.org/download/protein.links.v11.5/9606.protein.links.v11.5.txt.gz'
Content type 'application/octet-stream' length 72718210 bytes (69.3 MB)
==================================================
downloaded 69.3 MB

Error in as.data.frame.default(x[[i]], optional = TRUE, stringsAsFactors = stringsAsFactors) : 
  cannot coerce class ‘"degree"’ to a data.frame
> # 准备差异基因列表
> deg_genes <- DEG_sig$gene
> 
> # 初始化STRINGdb (9606 = human, 10090 = mouse)
> # 根据你的物种修改species参数
> string_db <- STRINGdb$new(version = "11.5", 
+                           species = 9606,  # 人类
+                           score_threshold = 400,  # 中等置信度
+                           input_directory = output_dir)
> 
> # 将基因映射到STRING ID
> deg_mapped <- string_db$map(data.frame(gene = deg_genes), "gene", removeUnmappedRows = TRUE)
Warning:  we couldn't map to STRING 12% of your identifiers> cat("成功映射基因数:", nrow(deg_mapped), "/", length(deg_genes), "\n")
成功映射基因数: 2610 / 2961 
> 
> # 获取PPI网络
> if(nrow(deg_mapped) > 0) {
+     
+     # 获取互作关系
+     interactions <- string_db$get_interactions(deg_mapped$STRING_id)
+     
+     # 保存互作关系
+     write.csv(interactions, file.path(output_dir, "PPI_interactions.csv"), row.names = FALSE)
+     
+     # 绘制PPI网络图
+     pdf(file.path(output_dir, "PPI_network_STRING.pdf"), width = 12, height = 12)
+     string_db$plot_network(deg_mapped$STRING_id[1:min(200, nrow(deg_mapped))])
+     dev.off()
+     
+     # ============================================
+     # 5. 使用igraph计算Hub基因
+     # ============================================
+     
+     if(nrow(interactions) > 0) {
+         
+         # 创建igraph网络对象
+         # 将STRING_id转换回基因名
+         id_to_gene <- setNames(deg_mapped$gene, deg_mapped$STRING_id)
+         
+         interactions$from_gene <- id_to_gene[interactions$from]
+         interactions$to_gene <- id_to_gene[interactions$to]
+         
+         # 移除NA
+         interactions_clean <- interactions[!is.na(interactions$from_gene) & !is.na(interactions$to_gene), ]
+         
+         # 创建网络
+         g <- graph_from_data_frame(interactions_clean[, c("from_gene", "to_gene")], directed = FALSE)
+         
+         # 计算多种中心性指标
+         hub_analysis <- data.frame(
+             gene = V(g)$name,
+             degree = degree(g),
+             betweenness = betweenness(g),
+             closeness = closeness(g),
+             eigenvector = eigen_centrality(g)$vector
+         )
+         
+         # 按degree排序
+         hub_analysis <- hub_analysis[order(hub_analysis$degree, decreasing = TRUE), ]
+         
+         # 保存hub基因分析结果
+         write.csv(hub_analysis, file.path(output_dir, "hub_genes_analysis.csv"), row.names = FALSE)
+         
+         # 显示Top 20 Hub基因
+         cat("\n========== Top 20 Hub Genes (by Degree) ==========\n")
+         print(head(hub_analysis, 20))
+         
+         # 提取Top Hub基因
+         top_hub_genes <- head(hub_analysis, 10)
+         
+         # ============================================
+         # 6. Hub基因可视化
+         # ============================================
+         
+         # Hub基因柱状图
+         p_hub <- ggplot(head(hub_analysis, 20), aes(x = reorder(gene, degree), y = degree)) +
+             geom_bar(stat = "identity", fill = "#E41A1C", alpha = 0.8) +
+             coord_flip() +
+             theme_bw() +
+             labs(x = "Gene", y = "Degree", title = "Top 20 Hub Genes (by Degree)") +
+             theme(plot.title = element_text(hjust = 0.5))
+         
+         print(p_hub)
+         ggsave(file.path(output_dir, "hub_genes_barplot.pdf"), p_hub, width = 8, height = 6)
+         ggsave(file.path(output_dir, "hub_genes_barplot.png"), p_hub, width = 8, height = 6, dpi = 300)
+         
+         # Hub基因网络图
+         # 提取包含top hub基因的子网络
+         top_hub_names <- head(hub_analysis$gene, 10)
+         neighbors_list <- unlist(lapply(top_hub_names, function(x) neighbors(g, x)$name))
+         subnet_nodes <- unique(c(top_hub_names, neighbors_list))
+         
+         # 限制节点数量
+         if(length(subnet_nodes) > 100) {
+             subnet_nodes <- subnet_nodes[1:100]
+         }
+         
+         g_sub <- induced_subgraph(g, subnet_nodes)
+         
+         # 设置节点属性
+         V(g_sub)$color <- ifelse(V(g_sub)$name %in% top_hub_names, "#E41A1C", "#377EB8")
+         V(g_sub)$size <- ifelse(V(g_sub)$name %in% top_hub_names, 15, 8)
+         V(g_sub)$label.cex <- ifelse(V(g_sub)$name %in% top_hub_names, 0.8, 0.5)
+         
+         # 绘制网络
+         pdf(file.path(output_dir, "hub_genes_network.pdf"), width = 12, height = 12)
+         set.seed(123)
+         plot(g_sub, 
+              layout = layout_with_fr(g_sub),
+              vertex.label = V(g_sub)$name,
+              vertex.label.color = "black",
+              edge.color = "grey70",
+              edge.width = 0.5,
+              main = "Hub Genes PPI Network")
+         legend("bottomright", 
+                legend = c("Hub Gene", "Other Gene"),
+                fill = c("#E41A1C", "#377EB8"),
+                border = NA)
+         dev.off()
+         
+         # ============================================
+         # 7. Hub基因热图
+         # ============================================
+         
+         # 提取hub基因的表达矩阵
+         hub_genes_in_exp <- intersect(top_hub_genes$gene, rownames(exp))
+         
+         if(length(hub_genes_in_exp) > 0) {
+             exp_hub <- exp[hub_genes_in_exp, ]
+             exp_hub_scaled <- t(scale(t(exp_hub)))
+             
+             p_hub_heatmap <- pheatmap(exp_hub_scaled,
+                                       scale = "none",
+                                       cluster_rows = TRUE,
+                                       cluster_cols = TRUE,
+                                       show_rownames = TRUE,
+                                       show_colnames = FALSE,
+                                       annotation_col = annotation_col,
+                                       annotation_colors = ann_colors,
+                                       color = colorRampPalette(c("#377EB8", "white", "#E41A1C"))(100),
+                                       main = "Expression of Top Hub Genes",
+                                       fontsize = 10)
+             
+             pdf(file.path(output_dir, "hub_genes_heatmap.pdf"), width = 10, height = 6)
+             print(p_hub_heatmap)
+             dev.off()
+         }
+         
+     } else {
+         cat("没有找到蛋白互作关系\n")
+     }
+     
+ } else {
+     cat("基因映射失败，请检查基因名格式\n")
+ }
Error in as.data.frame.default(x[[i]], optional = TRUE, stringsAsFactors = stringsAsFactors) : 
  cannot coerce class ‘"degree"’ to a data.frame
> if(nrow(deg_mapped) > 0) {
+     
+     # 获取互作关系
+     interactions <- string_db$get_interactions(deg_mapped$STRING_id)
+     
+     # 保存互作关系
+     write.csv(interactions, file.path(output_dir, "PPI_interactions.csv"), row.names = FALSE)
+     
+     # 绘制PPI网络图
+     pdf(file.path(output_dir, "PPI_network_STRING.pdf"), width = 12, height = 12)
+     string_db$plot_network(deg_mapped$STRING_id[1:min(200, nrow(deg_mapped))])
+     dev.off()
+     
+     # ============================================
+     # 5. 使用igraph计算Hub基因
+     # ============================================
+     
+     if(nrow(interactions) > 0) {
+         
+         # 创建igraph网络对象
+         # 将STRING_id转换回基因名
+         id_to_gene <- setNames(deg_mapped$gene, deg_mapped$STRING_id)
+         
+         interactions$from_gene <- id_to_gene[interactions$from]
+         interactions$to_gene <- id_to_gene[interactions$to]
+         
+         # 移除NA
+         interactions_clean <- interactions[!is.na(interactions$from_gene) & !is.na(interactions$to_gene), ]
+         
+         # 创建网络
+         g <- graph_from_data_frame(interactions_clean[, c("from_gene", "to_gene")], directed = FALSE)
+         
+         # 计算多种中心性指标
+         # 计算多种中心性指标
+         hub_analysis <- data.frame(
+             gene = V(g)$name,
+             degree = as.numeric(degree(g)),
+             betweenness = as.numeric(betweenness(g)),
+             closeness = as.numeric(closeness(g)),
+             eigenvector = as.numeric(eigen_centrality(g)$vector)
+         )
+         
+         # 按degree排序
+         hub_analysis <- hub_analysis[order(hub_analysis$degree, decreasing = TRUE), ]
+         
+         # 保存hub基因分析结果
+         write.csv(hub_analysis, file.path(output_dir, "hub_genes_analysis.csv"), row.names = FALSE)
+         
+         # 显示Top 20 Hub基因
+         cat("\n========== Top 20 Hub Genes (by Degree) ==========\n")
+         print(head(hub_analysis, 20))
+         
+         # 提取Top Hub基因
+         top_hub_genes <- head(hub_analysis, 10)
+         
+         # ============================================
+         # 6. Hub基因可视化
+         # ============================================
+         
+         # Hub基因柱状图
+         p_hub <- ggplot(head(hub_analysis, 20), aes(x = reorder(gene, degree), y = degree)) +
+             geom_bar(stat = "identity", fill = "#E41A1C", alpha = 0.8) +
+             coord_flip() +
+             theme_bw() +
+             labs(x = "Gene", y = "Degree", title = "Top 20 Hub Genes (by Degree)") +
+             theme(plot.title = element_text(hjust = 0.5))
+         
+         print(p_hub)
+         ggsave(file.path(output_dir, "hub_genes_barplot.pdf"), p_hub, width = 8, height = 6)
+         ggsave(file.path(output_dir, "hub_genes_barplot.png"), p_hub, width = 8, height = 6, dpi = 300)
+         
+         # Hub基因网络图
+         # 提取包含top hub基因的子网络
+         top_hub_names <- head(hub_analysis$gene, 10)
+         neighbors_list <- unlist(lapply(top_hub_names, function(x) neighbors(g, x)$name))
+         subnet_nodes <- unique(c(top_hub_names, neighbors_list))
+         
+         # 限制节点数量
+         if(length(subnet_nodes) > 100) {
+             subnet_nodes <- subnet_nodes[1:100]
+         }
+         
+         g_sub <- induced_subgraph(g, subnet_nodes)
+         
+         # 设置节点属性
+         V(g_sub)$color <- ifelse(V(g_sub)$name %in% top_hub_names, "#E41A1C", "#377EB8")
+         V(g_sub)$size <- ifelse(V(g_sub)$name %in% top_hub_names, 15, 8)
+         V(g_sub)$label.cex <- ifelse(V(g_sub)$name %in% top_hub_names, 0.8, 0.5)
+         
+         # 绘制网络
+         pdf(file.path(output_dir, "hub_genes_network.pdf"), width = 12, height = 12)
+         set.seed(123)
+         plot(g_sub, 
+              layout = layout_with_fr(g_sub),
+              vertex.label = V(g_sub)$name,
+              vertex.label.color = "black",
+              edge.color = "grey70",
+              edge.width = 0.5,
+              main = "Hub Genes PPI Network")
+         legend("bottomright", 
+                legend = c("Hub Gene", "Other Gene"),
+                fill = c("#E41A1C", "#377EB8"),
+                border = NA)
+         dev.off()
+         
+         # ============================================
+         # 7. Hub基因热图
+         # ============================================
+         
+         # 提取hub基因的表达矩阵
+         hub_genes_in_exp <- intersect(top_hub_genes$gene, rownames(exp))
+         
+         if(length(hub_genes_in_exp) > 0) {
+             exp_hub <- exp[hub_genes_in_exp, ]
+             exp_hub_scaled <- t(scale(t(exp_hub)))
+             
+             p_hub_heatmap <- pheatmap(exp_hub_scaled,
+                                       scale = "none",
+                                       cluster_rows = TRUE,
+                                       cluster_cols = TRUE,
+                                       show_rownames = TRUE,
+                                       show_colnames = FALSE,
+                                       annotation_col = annotation_col,
+                                       annotation_colors = ann_colors,
+                                       color = colorRampPalette(c("#377EB8", "white", "#E41A1C"))(100),
+                                       main = "Expression of Top Hub Genes",
+                                       fontsize = 10)
+             
+             pdf(file.path(output_dir, "hub_genes_heatmap.pdf"), width = 10, height = 6)
+             print(p_hub_heatmap)
+             dev.off()
+         }
+         
+     } else {
+         cat("没有找到蛋白互作关系\n")
+     }
+     
+ } else {
+     cat("基因映射失败，请检查基因名格式\n")
+ }
Error in data.frame(gene = V(g)$name, degree = as.numeric(degree(g)),  : 
  'list' object cannot be coerced to type 'double'
> # 获取PPI网络
> if(nrow(deg_mapped) > 0) {
+     
+     # 获取互作关系
+     interactions <- string_db$get_interactions(deg_mapped$STRING_id)
+     
+     # 保存互作关系
+     write.csv(interactions, file.path(output_dir, "PPI_interactions.csv"), row.names = FALSE)
+     
+     # 绘制PPI网络图
+     pdf(file.path(output_dir, "PPI_network_STRING.pdf"), width = 12, height = 12)
+     string_db$plot_network(deg_mapped$STRING_id[1:min(200, nrow(deg_mapped))])
+     dev.off()
+     
+     # ============================================
+     # 5. 使用igraph计算Hub基因
+     # ============================================
+     
+     if(nrow(interactions) > 0) {
+         
+         # 创建igraph网络对象
+         # 将STRING_id转换回基因名
+         id_to_gene <- setNames(deg_mapped$gene, deg_mapped$STRING_id)
+         
+         interactions$from_gene <- id_to_gene[interactions$from]
+         interactions$to_gene <- id_to_gene[interactions$to]
+         
+         # 移除NA
+         interactions_clean <- interactions[!is.na(interactions$from_gene) & !is.na(interactions$to_gene), ]
+         
+         # 创建网络
+         g <- graph_from_data_frame(interactions_clean[, c("from_gene", "to_gene")], directed = FALSE)
+         
+         # 计算多种中心性指标
+         # 计算多种中心性指标
+         # 计算多种中心性指标
+         hub_analysis <- data.frame(
+             gene = names(V(g)),
+             degree = as.vector(degree(g)),
+             betweenness = as.vector(betweenness(g)),
+             closeness = as.vector(closeness(g)),
+             eigenvector = unlist(eigen_centrality(g)$vector)
+         )
+         
+         # 按degree排序
+         hub_analysis <- hub_analysis[order(hub_analysis$degree, decreasing = TRUE), ]
+         
+         # 保存hub基因分析结果
+         write.csv(hub_analysis, file.path(output_dir, "hub_genes_analysis.csv"), row.names = FALSE)
+         
+         # 显示Top 20 Hub基因
+         cat("\n========== Top 20 Hub Genes (by Degree) ==========\n")
+         print(head(hub_analysis, 20))
+         
+         # 提取Top Hub基因
+         top_hub_genes <- head(hub_analysis, 10)
+         
+         # ============================================
+         # 6. Hub基因可视化
+         # ============================================
+         
+         # Hub基因柱状图
+         p_hub <- ggplot(head(hub_analysis, 20), aes(x = reorder(gene, degree), y = degree)) +
+             geom_bar(stat = "identity", fill = "#E41A1C", alpha = 0.8) +
+             coord_flip() +
+             theme_bw() +
+             labs(x = "Gene", y = "Degree", title = "Top 20 Hub Genes (by Degree)") +
+             theme(plot.title = element_text(hjust = 0.5))
+         
+         print(p_hub)
+         ggsave(file.path(output_dir, "hub_genes_barplot.pdf"), p_hub, width = 8, height = 6)
+         ggsave(file.path(output_dir, "hub_genes_barplot.png"), p_hub, width = 8, height = 6, dpi = 300)
+         
+         # Hub基因网络图
+         # 提取包含top hub基因的子网络
+         top_hub_names <- head(hub_analysis$gene, 10)
+         neighbors_list <- unlist(lapply(top_hub_names, function(x) neighbors(g, x)$name))
+         subnet_nodes <- unique(c(top_hub_names, neighbors_list))
+         
+         # 限制节点数量
+         if(length(subnet_nodes) > 100) {
+             subnet_nodes <- subnet_nodes[1:100]
+         }
+         
+         g_sub <- induced_subgraph(g, subnet_nodes)
+         
+         # 设置节点属性
+         V(g_sub)$color <- ifelse(V(g_sub)$name %in% top_hub_names, "#E41A1C", "#377EB8")
+         V(g_sub)$size <- ifelse(V(g_sub)$name %in% top_hub_names, 15, 8)
+         V(g_sub)$label.cex <- ifelse(V(g_sub)$name %in% top_hub_names, 0.8, 0.5)
+         
+         # 绘制网络
+         pdf(file.path(output_dir, "hub_genes_network.pdf"), width = 12, height = 12)
+         set.seed(123)
+         plot(g_sub, 
+              layout = layout_with_fr(g_sub),
+              vertex.label = V(g_sub)$name,
+              vertex.label.color = "black",
+              edge.color = "grey70",
+              edge.width = 0.5,
+              main = "Hub Genes PPI Network")
+         legend("bottomright", 
+                legend = c("Hub Gene", "Other Gene"),
+                fill = c("#E41A1C", "#377EB8"),
+                border = NA)
+         dev.off()
+         
+         # ============================================
+         # 7. Hub基因热图
+         # ============================================
+         
+         # 提取hub基因的表达矩阵
+         hub_genes_in_exp <- intersect(top_hub_genes$gene, rownames(exp))
+         
+         if(length(hub_genes_in_exp) > 0) {
+             exp_hub <- exp[hub_genes_in_exp, ]
+             exp_hub_scaled <- t(scale(t(exp_hub)))
+             
+             p_hub_heatmap <- pheatmap(exp_hub_scaled,
+                                       scale = "none",
+                                       cluster_rows = TRUE,
+                                       cluster_cols = TRUE,
+                                       show_rownames = TRUE,
+                                       show_colnames = FALSE,
+                                       annotation_col = annotation_col,
+                                       annotation_colors = ann_colors,
+                                       color = colorRampPalette(c("#377EB8", "white", "#E41A1C"))(100),
+                                       main = "Expression of Top Hub Genes",
+                                       fontsize = 10)
+             
+             pdf(file.path(output_dir, "hub_genes_heatmap.pdf"), width = 10, height = 6)
+             print(p_hub_heatmap)
+             dev.off()
+         }
+         
+     } else {
+         cat("没有找到蛋白互作关系\n")
+     }
+     
+ } else {
+     cat("基因映射失败，请检查基因名格式\n")
+ }
Error in as.data.frame.default(x[[i]], optional = TRUE, stringsAsFactors = stringsAsFactors) : 
  cannot coerce class ‘"degree"’ to a data.frame

### 🤖 Copilot <sub>2025/11/29 08:55</sub>

问题是 `circlize` 包的 `degree` 函数遮盖了 `igraph` 的 `degree` 函数。您需要显式调用 `igraph::degree()`。

**解决方法**：

```r
# 计算多种中心性指标 - 使用 igraph:: 前缀避免函数冲突
hub_analysis <- data.frame(
    gene = V(g)$name,
    stringsAsFactors = FALSE
)

hub_analysis$degree <- as.vector(igraph::degree(g))
hub_analysis$betweenness <- as.vector(igraph::betweenness(g))
hub_analysis$closeness <- as.vector(igraph::closeness(g))
hub_analysis$eigenvector <- as.vector(igraph::eigen_centrality(g)$vector)
```

您在加载包的时候看到了这个警告：
```
Attaching package: 'circlize'

The following object is masked from 'package:igraph':

    degree
```

这说明 `circlize::degree` 遮盖了 `igraph::degree`。

**完整修正后的代码段**：

```r
# 创建网络
g <- graph_from_data_frame(interactions_clean[, c("from_gene", "to_gene")], directed = FALSE)

# 计算多种中心性指标 - 显式使用 igraph:: 前缀
gene_names <- V(g)$name

hub_analysis <- data.frame(
    gene = gene_names,
    degree = as.vector(igraph::degree(g)),
    betweenness = as.vector(igraph::betweenness(g)),
    closeness = as.vector(igraph::closeness(g)),
    eigenvector = as.vector(igraph::eigen_centrality(g)$vector),
    stringsAsFactors = FALSE
)

# 按degree排序
hub_analysis <- hub_analysis[order(hub_analysis$degree, decreasing = TRUE), ]
```

**关键修改**：
- `degree(g)` → `igraph::degree(g)`
- `betweenness(g)` → `igraph::betweenness(g)`
- `closeness(g)` → `igraph::closeness(g)`
- `eigen_centrality(g)` → `igraph::eigen_centrality(g)`

这样可以确保调用的是 `igraph` 包的函数而不是 `circlize` 包的同名函数。

### 👤 User <sub>2025/11/29 08:58</sub>

Error in as.data.frame.default(x[[i]], optional = TRUE, stringsAsFactors = stringsAsFactors) : 
  cannot coerce class ‘"degree"’ to a data.frame

### 🤖 Copilot <sub>2025/11/29 08:58</sub>

```

```
已修复代码。问题是 `circlize` 包的 `degree` 函数遮盖了 `igraph` 的 `degree` 函数。

**主要修改**：
- `degree(g)` → `igraph::degree(g)`
- `betweenness(g)` → `igraph::betweenness(g)`
- `closeness(g)` → `igraph::closeness(g)`
- `eigen_centrality(g)` → `igraph::eigen_centrality(g)`
- `names(V(g))` → `V(g)$name`
- 添加 `stringsAsFactors = FALSE`

现在可以重新运行代码了。

### 👤 User <sub>2025/11/29 08:59</sub>

直接整理出一个完整的代码

### 🤖 Copilot <sub>2025/11/29 08:59</sub>

这是整理后的完整代码（去除了控制台的 `+` 符号）：

```r
if(nrow(deg_mapped) > 0) {
    
    # 获取互作关系
    interactions <- string_db$get_interactions(deg_mapped$STRING_id)
    
    # 保存互作关系
    write.csv(interactions, file.path(output_dir, "PPI_interactions.csv"), row.names = FALSE)
    
    # 绘制PPI网络图
    pdf(file.path(output_dir, "PPI_network_STRING.pdf"), width = 12, height = 12)
    string_db$plot_network(deg_mapped$STRING_id[1:min(200, nrow(deg_mapped))])
    dev.off()
    
    # ============================================
    # 5. 使用igraph计算Hub基因
    # ============================================
    
    if(nrow(interactions) > 0) {
        
        # 创建igraph网络对象
        # 将STRING_id转换回基因名
        id_to_gene <- setNames(deg_mapped$gene, deg_mapped$STRING_id)
        
        interactions$from_gene <- id_to_gene[interactions$from]
        interactions$to_gene <- id_to_gene[interactions$to]
        
        # 移除NA
        interactions_clean <- interactions[!is.na(interactions$from_gene) & !is.na(interactions$to_gene), ]
        
        # 创建网络
        g <- graph_from_data_frame(interactions_clean[, c("from_gene", "to_gene")], directed = FALSE)
        
        # 计算多种中心性指标 - 使用 igraph:: 前缀避免与 circlize 包冲突
        hub_analysis <- data.frame(
            gene = V(g)$name,
            degree = as.vector(igraph::degree(g)),
            betweenness = as.vector(igraph::betweenness(g)),
            closeness = as.vector(igraph::closeness(g)),
            eigenvector = as.vector(igraph::eigen_centrality(g)$vector),
            stringsAsFactors = FALSE
        )
        
        # 按degree排序
        hub_analysis <- hub_analysis[order(hub_analysis$degree, decreasing = TRUE), ]
        
        # 保存hub基因分析结果
        write.csv(hub_analysis, file.path(output_dir, "hub_genes_analysis.csv"), row.names = FALSE)
        
        # 显示Top 20 Hub基因
        cat("\n========== Top 20 Hub Genes (by Degree) ==========\n")
        print(head(hub_analysis, 20))
        
        # 提取Top Hub基因
        top_hub_genes <- head(hub_analysis, 10)
        
        # ============================================
        # 6. Hub基因可视化
        # ============================================
        
        # Hub基因柱状图
        p_hub <- ggplot(head(hub_analysis, 20), aes(x = reorder(gene, degree), y = degree)) +
            geom_bar(stat = "identity", fill = "#E41A1C", alpha = 0.8) +
            coord_flip() +
            theme_bw() +
            labs(x = "Gene", y = "Degree", title = "Top 20 Hub Genes (by Degree)") +
            theme(plot.title = element_text(hjust = 0.5))
        
        print(p_hub)
        ggsave(file.path(output_dir, "hub_genes_barplot.pdf"), p_hub, width = 8, height = 6)
        ggsave(file.path(output_dir, "hub_genes_barplot.png"), p_hub, width = 8, height = 6, dpi = 300)
        
        # Hub基因网络图
        # 提取包含top hub基因的子网络
        top_hub_names <- head(hub_analysis$gene, 10)
        neighbors_list <- unlist(lapply(top_hub_names, function(x) igraph::neighbors(g, x)$name))
        subnet_nodes <- unique(c(top_hub_names, neighbors_list))
        
        # 限制节点数量
        if(length(subnet_nodes) > 100) {
            subnet_nodes <- subnet_nodes[1:100]
        }
        
        g_sub <- induced_subgraph(g, subnet_nodes)
        
        # 设置节点属性
        V(g_sub)$color <- ifelse(V(g_sub)$name %in% top_hub_names, "#E41A1C", "#377EB8")
        V(g_sub)$size <- ifelse(V(g_sub)$name %in% top_hub_names, 15, 8)
        V(g_sub)$label.cex <- ifelse(V(g_sub)$name %in% top_hub_names, 0.8, 0.5)
        
        # 绘制网络
        pdf(file.path(output_dir, "hub_genes_network.pdf"), width = 12, height = 12)
        set.seed(123)
        plot(g_sub, 
             layout = layout_with_fr(g_sub),
             vertex.label = V(g_sub)$name,
             vertex.label.color = "black",
             edge.color = "grey70",
             edge.width = 0.5,
             main = "Hub Genes PPI Network")
        legend("bottomright", 
               legend = c("Hub Gene", "Other Gene"),
               fill = c("#E41A1C", "#377EB8"),
               border = NA)
        dev.off()
        
        # ============================================
        # 7. Hub基因热图
        # ============================================
        
        # 提取hub基因的表达矩阵
        hub_genes_in_exp <- intersect(top_hub_genes$gene, rownames(exp))
        
        if(length(hub_genes_in_exp) > 0) {
            exp_hub <- exp[hub_genes_in_exp, ]
            exp_hub_scaled <- t(scale(t(exp_hub)))
            
            p_hub_heatmap <- pheatmap::pheatmap(exp_hub_scaled,
                                      scale = "none",
                                      cluster_rows = TRUE,
                                      cluster_cols = TRUE,
                                      show_rownames = TRUE,
                                      show_colnames = FALSE,
                                      annotation_col = annotation_col,
                                      annotation_colors = ann_colors,
                                      color = colorRampPalette(c("#377EB8", "white", "#E41A1C"))(100),
                                      main = "Expression of Top Hub Genes",
                                      fontsize = 10)
            
            pdf(file.path(output_dir, "hub_genes_heatmap.pdf"), width = 10, height = 6)
            print(p_hub_heatmap)
            dev.off()
        }
        
    } else {
        cat("没有找到蛋白互作关系\n")
    }
    
} else {
    cat("基因映射失败，请检查基因名格式\n")
}
```

**主要修改点**：
1. 去除了所有 `+` 符号
2. `degree()`, `betweenness()`, `closeness()`, `eigen_centrality()` 都添加了 `igraph::` 前缀
3. `neighbors()` 也添加了 `igraph::` 前缀
4. `pheatmap()` 添加了 `pheatmap::` 前缀（因为 ComplexHeatmap 也有同名函数）

### 👤 User <sub>2025/11/29 09:02</sub>

Error: object 'ann_colors' not found

### 🤖 Copilot <sub>2025/11/29 09:02</sub>

错误是因为 `ann_colors` 变量未定义。需要在热图代码之前添加 `ann_colors` 的定义。

```

```
已修复。添加了 `annotation_col` 和 `ann_colors` 的定义，并将 `pheatmap` 改为 `pheatmap::pheatmap` 以避免与 ComplexHeatmap 的冲突。

现在代码中包含了：
```r
annotation_col <- data.frame(
    Group = pd$group,
    row.names = rownames(pd)
)
ann_colors <- list(
    Group = c(Normal = "#4DAF4A", Tumor = "#E41A1C")
)
```

请重新运行代码。

### 👤 User <sub>2025/11/29 09:03</sub>

把这个代码整理一下

### 🤖 Copilot <sub>2025/11/29 09:03</sub>

```

```
代码已整理完成，主要修改：

1. **去除了所有 `+` 符号** - 这些是 R 控制台的续行符号
2. **添加了 `igraph::` 前缀** - 避免与 `circlize` 包的函数冲突
3. **使用 `pheatmap::pheatmap`** - 避免与 `ComplexHeatmap` 的冲突
4. **修正了缩进格式** - 使代码更易读

现在可以直接复制运行了。

### 👤 User <sub>2025/11/29 09:07</sub>

能不能同意一下 hub 基因也取 top50

### 🤖 Copilot <sub>2025/11/29 09:07</sub>

```

```
已将 Hub 基因统一改为 Top 50，修改内容包括：

1. **显示和提取**：`top_hub_genes <- head(hub_analysis, 50)`
2. **柱状图**：`head(hub_analysis, 50)` 和标题改为 "Top 50 Hub Genes"
3. **网络图**：`top_hub_names <- head(hub_analysis$gene, 50)`

现在所有 Hub 基因相关的分析都使用 Top 50 了。

### 👤 User <sub>2025/11/29 09:08</sub>

热图的风格也和上面的热图的风格一直

### 🤖 Copilot <sub>2025/11/29 09:08</sub>

```

```
已将 Hub 基因热图的风格统一为与上面差异基因热图一致，主要修改：

1. **使用 ComplexHeatmap** 替代 pheatmap
2. **颜色方案一致**：`colorRampPalette(c("#524b9a", "white", "#e63118"))(100)`
3. **分组注释颜色一致**：`Normal = "#2fa1dd", Tumor = "#f87669"`
4. **图例位置一致**：底部水平显示
5. **按分组拆分列**：`column_split = annotation_col_hub$Group`
6. **边框和字体设置一致**
7. **同时保存 PDF 和 PNG**

### 👤 User <sub>2025/11/29 09:15</sub>

这边 top 基因改为 up 和 down 的各 10

### 🤖 Copilot <sub>2025/11/29 09:15</sub>

```

```
已修改火山图的 top 基因标注，现在分别从 Up 和 Down 基因中各取 logFC 绝对值最大的 10 个进行标注（共 20 个），同时删除了重复的保存代码。

### 👤 User <sub>2025/11/29 09:57</sub>

plot_heatmap_DEG(expM, DEG_tb, group, out_name = "test/00_GEO_data_GSE184000/heatmap")
Error in expM[rownames(DEG_tb), ] : subscript out of bounds

### 🤖 Copilot <sub>2025/11/29 09:57</sub>

这个错误是因为 `DEG_tb` 中的基因名（行名）在 `expM` 表达矩阵中找不到。这通常发生在以下情况：

1. **基因名格式不一致** - DEG 表的基因名和表达矩阵的行名不匹配
2. **DEG 表没有行名** - 基因名可能在列中而不是行名

**解决方法**：

```r
# 检查两者的基因名
head(rownames(expM))
head(rownames(DEG_tb))

# 如果 DEG_tb 的基因名在 gene 列而不是行名
if("gene" %in% colnames(DEG_tb)) {
    rownames(DEG_tb) <- DEG_tb$gene
}

# 确保只使用在表达矩阵中存在的基因
common_genes <- intersect(rownames(DEG_tb), rownames(expM))
cat("共有基因数:", length(common_genes), "\n")

# 筛选 DEG_tb 只保留在 expM 中存在的基因
DEG_tb_filtered <- DEG_tb[common_genes, ]

# 然后再调用函数
plot_heatmap_DEG(expM, DEG_tb_filtered, group, out_name = "test/00_GEO_data_GSE184000/heatmap")
```

**或者快速检查问题**：

```r
# 查看有多少基因能匹配上
sum(rownames(DEG_tb) %in% rownames(expM))

# 查看前几个不匹配的基因
head(rownames(DEG_tb)[!rownames(DEG_tb) %in% rownames(expM)])
```

如果发现基因名完全不匹配，可能需要检查数据来源，或者 `DEG_tb` 的行名是否正确设置了。
