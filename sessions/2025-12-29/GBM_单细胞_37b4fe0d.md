# all_genes_gsea <- DEG[, c("gene", "logFC")] all_genes_entrez <- bitr(all_gene...

| Field | Value |
|-------|-------|
| Session ID | `37b4fe0d-1a07-447f-9d74-43ec9c0d431e` |
| Workspace | GBM 单细胞 |
| Start | 2025/12/29 17:53 |
| End | 2025/12/30 11:19 |
| Messages | 22 |

---

### 👤 User <sub>2025/12/29 17:54</sub>

all_genes_gsea <- DEG[, c("gene", "logFC")]
all_genes_entrez <- bitr(all_genes_gsea$gene, fromType = "SYMBOL", toType = "ENTREZID", OrgDb = org.Hs.eg.db)
all_genes_gsea <- merge(all_genes_gsea, all_genes_entrez, by.x = "gene", by.y = "SYMBOL")

# 创建命名向量，按logFC排序
geneList <- all_genes_gsea$logFC
names(geneList) <- all_genes_gsea$ENTREZID
geneList <- sort(geneList, decreasing = TRUE)

cat("GSEA基因列表长度:", length(geneList), "\n")

# GSEA GO富集
gsea_go <- gseGO(geneList = geneList,
                 OrgDb = org.Hs.eg.db,
                 ont = "BP",
                 minGSSize = 10,
                 maxGSSize = 500,
                 pvalueCutoff = 0.05,
                 verbose = FALSE)

if (nrow(gsea_go@result) > 0) {
    gsea_go <- setReadable(gsea_go, OrgDb = org.Hs.eg.db)
    write.csv(gsea_go@result, file.path(out_dir, "GSEA_GO_BP.csv"), row.names = FALSE)
    
    # GSEA气泡图
    p_gsea_go <- dotplot(gsea_go, showCategory = 20, split = ".sign", font.size = 10) +
        facet_grid(. ~ .sign) +
        labs(title = "GSEA - GO Biological Process") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_gsea_go)
    ggsave(file.path(out_dir, "GSEA_GO_dotplot.pdf"), p_gsea_go, width = 12, height = 10)
    ggsave(file.path(out_dir, "GSEA_GO_dotplot.png"), p_gsea_go, width = 12, height = 10, dpi = 300)
}

# GSEA KEGG富集
gsea_kegg <- gseKEGG(geneList = geneList,
                     organism = 'hsa',
                     minGSSize = 10,
                     maxGSSize = 500,
                     pvalueCutoff = 0.05,
                     verbose = FALSE)

if (nrow(gsea_kegg@result) > 0) {
    gsea_kegg <- setReadable(gsea_kegg, OrgDb = org.Hs.eg.db, keyType = "ENTREZID")
    write.csv(gsea_kegg@result, file.path(out_dir, "GSEA_KEGG.csv"), row.names = FALSE)
    
    # GSEA KEGG气泡图
    p_gsea_kegg <- dotplot(gsea_kegg, showCategory = 20, split = ".sign", font.size = 10) +
        facet_grid(. ~ .sign) +
        labs(title = "GSEA - KEGG Pathway") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_gsea_kegg)
    ggsave(file.path(out_dir, "GSEA_KEGG_dotplot.pdf"), p_gsea_kegg, width = 12, height = 10)
    ggsave(file.path(out_dir, "GSEA_KEGG_dotplot.png"), p_gsea_kegg, width = 12, height = 10, dpi = 300)
}
```


```{r}
cat("\n========== 富集分析完成 ==========\n")
cat("\n生成的文件列表:\n")
GSEA 分析还有一种图

### 🤖 Copilot <sub>2025/12/29 17:54</sub>

看到您想补充 GSEA 分析的其他可视化图表。除了 dotplot，GSEA 分析还有几种常用的可视化方式：

**常见的 GSEA 可视化图表：**

1. **Enrichment Plot（富集图）** - 展示单个通路的 running enrichment score
2. **Ridge Plot（山脊图）** - 展示多个通路的基因表达分布
3. **GSEA Plot** - 经典的 GSEA 曲线图
4. **Network Plot** - 通路关系网络图
5. **Heatmap** - 核心富集基因热图

这是补充代码：

```
# ========== GSEA 其他可视化 ==========

# 1. Enrichment Plot (gseaplot2) - 展示前几个显著通路
if (nrow(gsea_go@result) > 0) {
    # 选择前3个最显著的通路
    top_pathways <- head(gsea_go@result$ID, 3)
    
    p_gsea_enrich <- gseaplot2(gsea_go, 
                               geneSetID = top_pathways,
                               title = "GSEA Enrichment Plot - Top GO Terms",
                               color = c("#E64B35", "#4DBBD5", "#00A087"),
                               pvalue_table = TRUE,
                               ES_geom = "line")
    print(p_gsea_enrich)
    ggsave(file.path(out_dir, "GSEA_GO_enrichplot.pdf"), p_gsea_enrich, width = 12, height = 10)
    ggsave(file.path(out_dir, "GSEA_GO_enrichplot.png"), p_gsea_enrich, width = 12, height = 10, dpi = 300)
}

# 2. Ridge Plot - 显示基因表达分布
if (nrow(gsea_go@result) > 0) {
    p_ridge_go <- ridgeplot(gsea_go, showCategory = 15, fill = "p.adjust") +
        labs(title = "GSEA Ridge Plot - GO BP",
             x = "Enrichment Distribution") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_ridge_go)
    ggsave(file.path(out_dir, "GSEA_GO_ridgeplot.pdf"), p_ridge_go, width = 10, height = 8)
    ggsave(file.path(out_dir, "GSEA_GO_ridgeplot.png"), p_ridge_go, width = 10, height = 8, dpi = 300)
}

# 3. GSEA Classic Plot - 单个通路的经典图
if (nrow(gsea_go@result) > 0) {
    # 选择最显著的通路
    top1 <- gsea_go@result$ID[1]
    
    p_classic <- gseaplot(gsea_go, 
                          geneSetID = top1,
                          title = gsea_go@result$Description[1])
    print(p_classic)
    ggsave(file.path(out_dir, "GSEA_GO_classic_top1.pdf"), p_classic, width = 10, height = 6)
    ggsave(file.path(out_dir, "GSEA_GO_classic_top1.png"), p_classic, width = 10, height = 6, dpi = 300)
}

# 4. Heatmap Plot - 核心富集基因
if (nrow(gsea_go@result) > 0) {
    p_heatmap <- heatplot(gsea_go, 
                          showCategory = 10,
                          foldChange = geneList) +
        labs(title = "GSEA Heatmap - GO BP") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_heatmap)
    ggsave(file.path(out_dir, "GSEA_GO_heatmap.pdf"), p_heatmap, width = 12, height = 10)
    ggsave(file.path(out_dir, "GSEA_GO_heatmap.png"), p_heatmap, width = 12, height = 10, dpi = 300)
}

# 同样的可视化用于 KEGG
if (nrow(gsea_kegg@result) > 0) {
    # Enrichment Plot
    top_kegg <- head(gsea_kegg@result$ID, 3)
    p_gsea_kegg_enrich <- gseaplot2(gsea_kegg, 
                                    geneSetID = top_kegg,
                                    title = "GSEA Enrichment Plot - Top KEGG Pathways",
                                    color = c("#E64B35", "#4DBBD5", "#00A087"),
                                    pvalue_table = TRUE)
    print(p_gsea_kegg_enrich)
    ggsave(file.path(out_dir, "GSEA_KEGG_enrichplot.pdf"), p_gsea_kegg_enrich, width = 12, height = 10)
    ggsave(file.path(out_dir, "GSEA_KEGG_enrichplot.png"), p_gsea_kegg_enrich, width = 12, height = 10, dpi = 300)
    
    # Ridge Plot
    p_ridge_kegg <- ridgeplot(gsea_kegg, showCategory = 15, fill = "p.adjust") +
        labs(title = "GSEA Ridge Plot - KEGG Pathway") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_ridge_kegg)
    ggsave(file.path(out_dir, "GSEA_KEGG_ridgeplot.pdf"), p_ridge_kegg, width = 10, height = 8)
    ggsave(file.path(out_dir, "GSEA_KEGG_ridgeplot.png"), p_ridge_kegg, width = 10, height = 8, dpi = 300)
}

cat("\n========== GSEA 可视化完成 ==========\n")
cat("生成的图表类型:\n")
cat("1. Dotplot (气泡图)\n")
cat("2. Enrichment Plot (富集曲线图)\n")
cat("3. Ridge Plot (山脊图)\n")
cat("4. Classic GSEA Plot (经典图)\n")
cat("5. Heatmap (热图)\n")
```

**各图表说明：**

- **Dotplot**：显示富集通路的显著性和富集程度
- **Enrichment Plot**：展示特定通路中基因的富集分数变化曲线
- **Ridge Plot**：展示多个通路中基因的表达分布密度
- **Classic GSEA Plot**：经典的 GSEA 分析图，包含 running enrichment score
- **Heatmap**：显示核心富集基因在不同通路中的表达模式

这些图表可以从不同角度解释 GSEA 结果，建议根据具体分析需求选择合适的可视化方式。

### 👤 User <sub>2025/12/29 17:55</sub>

山脊图帮我显示 top3的

### 🤖 Copilot <sub>2025/12/29 17:55</sub>

好的,我将山脊图的显示数量从15个改为top3:

```
# 2. Ridge Plot - 显示基因表达分布 (修改为显示top3)
if (nrow(gsea_go@result) > 0) {
    p_ridge_go <- ridgeplot(gsea_go, showCategory = 3, fill = "p.adjust") +
        labs(title = "GSEA Ridge Plot - GO BP (Top 3)",
             x = "Enrichment Distribution") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_ridge_go)
    ggsave(file.path(out_dir, "GSEA_GO_ridgeplot.pdf"), p_ridge_go, width = 10, height = 6)
    ggsave(file.path(out_dir, "GSEA_GO_ridgeplot.png"), p_ridge_go, width = 10, height = 6, dpi = 300)
}

# KEGG的山脊图也改为top3
if (nrow(gsea_kegg@result) > 0) {
    # Ridge Plot
    p_ridge_kegg <- ridgeplot(gsea_kegg, showCategory = 3, fill = "p.adjust") +
        labs(title = "GSEA Ridge Plot - KEGG Pathway (Top 3)") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_ridge_kegg)
    ggsave(file.path(out_dir, "GSEA_KEGG_ridgeplot.pdf"), p_ridge_kegg, width = 10, height = 6)
    ggsave(file.path(out_dir, "GSEA_KEGG_ridgeplot.png"), p_ridge_kegg, width = 10, height = 6, dpi = 300)
}
```

**主要修改：**
- `showCategory = 15` → `showCategory = 3` (只显示top3通路)
- 图片高度从8调整为6 (因为通路数量减少)
- 标题添加了"Top 3"标识

这样山脊图会更加清晰，聚焦于最显著的3个富集通路。

### 👤 User <sub>2025/12/29 18:09</sub>

Error in h(simpleError(msg, call)) : 
  error in evaluating the argument 'x' in selecting a method for function 'nrow': object 'gsea_kegg' not found

### 🤖 Copilot <sub>2025/12/29 18:09</sub>

这个错误表明 `gsea_kegg` 对象不存在。可能是 KEGG 富集分析部分没有运行或失败了。我来提供一个更安全的代码版本，添加对象存在性检查：

```r
# ========== GSEA 其他可视化（带安全检查）==========

# 1. Enrichment Plot (gseaplot2) - 展示前几个显著通路
if (exists("gsea_go") && nrow(gsea_go@result) > 0) {
    # 选择前3个最显著的通路
    top_pathways <- head(gsea_go@result$ID, 3)

p_gsea_enrich <- gseaplot2(gsea_go, 
                               geneSetID = top_pathways,
                               title = "GSEA Enrichment Plot - Top GO Terms",
                               color = c("#E64B35", "#4DBBD5", "#00A087"),
                               pvalue_table = TRUE,
                               ES_geom = "line")
    print(p_gsea_enrich)
    ggsave(file.path(out_dir, "GSEA_GO_enrichplot.pdf"), p_gsea_enrich, width = 12, height = 10)
    ggsave(file.path(out_dir, "GSEA_GO_enrichplot.png"), p_gsea_enrich, width = 12, height = 10, dpi = 300)
}

# 2. Ridge Plot - 显示基因表达分布 (Top 3)
if (exists("gsea_go") && nrow(gsea_go@result) > 0) {
    p_ridge_go

### 👤 User <sub>2025/12/29 19:33</sub>

GSEA 如何在 MsigDB指定通路富集分析？

### 🤖 Copilot <sub>2025/12/29 19:33</sub>

在 GSEA 中使用 MsigDB 指定通路进行富集分析，需要使用 `msigdbr` 包。以下是完整的代码示例：

```
# ========== 安装必要的包（首次使用需要） ==========
# if (!require("msigdbr")) install.packages("msigdbr")

library(clusterProfiler)
library(msigdbr)
library(org.Hs.eg.db)
library(ggplot2)

# ========== 查看 MsigDB 可用的基因集类别 ==========
# 查看所有可用的物种
msigdbr_show_species()

# 查看人类可用的所有基因集类别
msigdbr_collections() %>% print()

# ========== 准备 GSEA 基因列表（假设已经有 DEG 数据）==========
# 这部分代码应该在获得差异基因后使用
all_genes_gsea <- DEG[, c("gene", "logFC")]
all_genes_entrez <- bitr(all_genes_gsea$gene, fromType = "SYMBOL", toType = "ENTREZID", OrgDb = org.Hs.eg.db)
all_genes_gsea <- merge(all_genes_gsea, all_genes_entrez, by.x = "gene", by.y = "SYMBOL")

# 创建命名向量，按 logFC 排序
geneList <- all_genes_gsea$logFC
names(geneList) <- all_genes_gsea$ENTREZID
geneList <- sort(geneList, decreasing = TRUE)

cat("GSEA 基因列表长度:", length(geneList), "\n")

# ========== 方法1: Hallmark 基因集（最常用的50个标志性通路）==========
msigdb_hallmark <- msigdbr(species = "Homo sapiens", category = "H")
hallmark_gene_sets <- msigdb_hallmark %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("\nHallmark 基因集数量:", length(unique(hallmark_gene_sets$gs_name)), "\n")

# GSEA 分析 - Hallmark
gsea_hallmark <- GSEA(geneList = geneList,
                      TERM2GENE = hallmark_gene_sets,
                      pvalueCutoff = 0.05,
                      pAdjustMethod = "BH",
                      minGSSize = 10,
                      maxGSSize = 500,
                      verbose = FALSE)

if (nrow(gsea_hallmark@result) > 0) {
    write.csv(gsea_hallmark@result, file.path(out_dir, "GSEA_Hallmark.csv"), row.names = FALSE)
    
    # 可视化
    p_hallmark <- dotplot(gsea_hallmark, showCategory = 20, split = ".sign", font.size = 10) +
        facet_grid(. ~ .sign) +
        labs(title = "GSEA - MSigDB Hallmark Gene Sets") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_hallmark)
    ggsave(file.path(out_dir, "GSEA_Hallmark_dotplot.pdf"), p_hallmark, width = 12, height = 10)
    ggsave(file.path(out_dir, "GSEA_Hallmark_dotplot.png"), p_hallmark, width = 12, height = 10, dpi = 300)
    
    # Ridge plot (Top 3)
    p_ridge_hallmark <- ridgeplot(gsea_hallmark, showCategory = 3, fill = "p.adjust") +
        labs(title = "GSEA Ridge Plot - Hallmark (Top 3)") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_ridge_hallmark)
    ggsave(file.path(out_dir, "GSEA_Hallmark_ridgeplot.pdf"), p_ridge_hallmark, width = 10, height = 6)
}

# ========== 方法2: C2 - Canonical Pathways (KEGG, Reactome, BioCarta等）==========
msigdb_c2_cp <- msigdbr(species = "Homo sapiens", category = "C2", subcategory = "CP")
c2_cp_gene_sets <- msigdb_c2_cp %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("\nC2 Canonical Pathways 基因集数量:", length(unique(c2_cp_gene_sets$gs_name)), "\n")

gsea_c2_cp <- GSEA(geneList = geneList,
                   TERM2GENE = c2_cp_gene_sets,
                   pvalueCutoff = 0.05,
                   pAdjustMethod = "BH",
                   minGSSize = 10,
                   maxGSSize = 500,
                   verbose = FALSE)

if (nrow(gsea_c2_cp@result) > 0) {
    write.csv(gsea_c2_cp@result, file.path(out_dir, "GSEA_C2_CP.csv"), row.names = FALSE)
    
    p_c2_cp <- dotplot(gsea_c2_cp, showCategory = 20, split = ".sign", font.size = 8) +
        facet_grid(. ~ .sign) +
        labs(title = "GSEA - MSigDB C2 Canonical Pathways") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_c2_cp)
    ggsave(file.path(out_dir, "GSEA_C2_CP_dotplot.pdf"), p_c2_cp, width = 14, height = 10)
}

# ========== 方法3: 仅 KEGG 通路（从 C2 中筛选）==========
msigdb_c2_kegg <- msigdbr(species = "Homo sapiens", category = "C2", subcategory = "CP:KEGG")
kegg_gene_sets <- msigdb_c2_kegg %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("\nKEGG 通路数量:", length(unique(kegg_gene_sets$gs_name)), "\n")

gsea_kegg_msig <- GSEA(geneList = geneList,
                       TERM2GENE = kegg_gene_sets,
                       pvalueCutoff = 0.05,
                       minGSSize = 10,
                       maxGSSize = 500,
                       verbose = FALSE)

# ========== 方法4: Reactome 通路 ==========
msigdb_c2_reactome <- msigdbr(species = "Homo sapiens", category = "C2", subcategory = "CP:REACTOME")
reactome_gene_sets <- msigdb_c2_reactome %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

gsea_reactome <- GSEA(geneList = geneList,
                      TERM2GENE = reactome_gene_sets,
                      pvalueCutoff = 0.05,
                      minGSSize = 10,
                      maxGSSize = 500,
                      verbose = FALSE)

# ========== 方法5: C7 - 免疫相关基因集（适用于免疫研究）==========
msigdb_c7 <- msigdbr(species = "Homo sapiens", category = "C7")
c7_gene_sets <- msigdb_c7 %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

gsea_immune <- GSEA(geneList = geneList,
                    TERM2GENE = c7_gene_sets,
                    pvalueCutoff = 0.05,
                    minGSSize = 10,
                    maxGSSize = 500,
                    verbose = FALSE)

# ========== 方法6: C8 - 细胞类型特异性基因集 ==========
msigdb_c8 <- msigdbr(species = "Homo sapiens", category = "C8")
c8_gene_sets <- msigdb_c8 %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

gsea_celltype <- GSEA(geneList = geneList,
                      TERM2GENE = c8_gene_sets,
                      pvalueCutoff = 0.05,
                      minGSSize = 10,
                      maxGSSize = 500,
                      verbose = FALSE)

# ========== 方法7: 自定义特定通路（例如只分析癌症相关通路）==========
# 筛选包含特定关键词的通路
msigdb_all <- msigdbr(species = "Homo sapiens", category = "C2")

# 筛选癌症相关通路（通路名包含 "CANCER", "TUMOR", "ONCOGENIC" 等）
cancer_pathways <- msigdb_all %>%
  filter(grepl("CANCER|TUMOR|ONCOGENIC|METASTASIS", gs_name, ignore.case = TRUE)) %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("\n癌症相关通路数量:", length(unique(cancer_pathways$gs_name)), "\n")

gsea_cancer <- GSEA(geneList = geneList,
                    TERM2GENE = cancer_pathways,
                    pvalueCutoff = 0.05,
                    minGSSize = 10,
                    maxGSSize = 500,
                    verbose = FALSE)

cat("\n========== GSEA MsigDB 分析完成 ==========\n")
```

**MsigDB 主要类别说明：**

| 类别 | 子类别 | 说明 | 推荐场景 |
|------|--------|------|----------|
| **H** | - | Hallmark 基因集（50个） | 最常用，涵盖主要生物学过程 |
| **C2** | CP | 经典通路（所有数据库） | 综合通路分析 |
| | CP:KEGG | 仅 KEGG 通路 | 代谢/信号通路 |
| | CP:REACTOME | 仅 Reactome 通路 | 详细通路分析 |
| | CP:BIOCARTA | 仅 BioCarta 通路 | 经典通路 |
| | CP:PID | 仅 PID 通路 | 信号传导 |
| | CP:WIKIPATHWAYS | 仅 WikiPathways | 社区维护通路 |
| **C5** | GO:BP | GO 生物学过程 | GO 富集分析 |
| | GO:MF | GO 分子功能 | 功能分析 |
| | GO:CC | GO 细胞组分 | 定位分析 |
| **C7** | - | 免疫特征基因集 | 免疫研究 |
| **C8** | - | 细胞类型标志基因 | 细胞类型研究 |

**推荐使用组合：**
- **通用研究**: Hallmark + C2:CP
- **免疫研究**: Hallmark + C7
- **肿瘤研究**: Hallmark + 自定义癌症通路
- **代谢研究**: C2:CP:KEGG + C2:CP:REACTOME

### 👤 User <sub>2025/12/29 19:34</sub>

乳酸或者糖酵解相关的通路

### 🤖 Copilot <sub>2025/12/29 19:34</sub>

以下是针对乳酸和糖酵解相关通路的 GSEA 分析代码：

```
library(clusterProfiler)
library(msigdbr)
library(org.Hs.eg.db)
library(ggplot2)

# ========== 准备 GSEA 基因列表 ==========
all_genes_gsea <- DEG[, c("gene", "logFC")]
all_genes_entrez <- bitr(all_genes_gsea$gene, fromType = "SYMBOL", toType = "ENTREZID", OrgDb = org.Hs.eg.db)
all_genes_gsea <- merge(all_genes_gsea, all_genes_entrez, by.x = "gene", by.y = "SYMBOL")

geneList <- all_genes_gsea$logFC
names(geneList) <- all_genes_gsea$ENTREZID
geneList <- sort(geneList, decreasing = TRUE)

# ========== 方法1: Hallmark 糖酵解通路（最推荐）==========
msigdb_hallmark <- msigdbr(species = "Homo sapiens", category = "H")

# 筛选糖酵解通路
glycolysis_hallmark <- msigdb_hallmark %>%
  filter(grepl("GLYCOLYSIS", gs_name, ignore.case = TRUE)) %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("\n找到的 Hallmark 糖酵解通路:\n")
print(unique(glycolysis_hallmark$gs_name))

# GSEA 分析 - Hallmark 糖酵解
gsea_glycolysis_hallmark <- GSEA(geneList = geneList,
                                  TERM2GENE = glycolysis_hallmark,
                                  pvalueCutoff = 1,  # 设为1以查看所有结果
                                  minGSSize = 10,
                                  maxGSSize = 500,
                                  verbose = FALSE)

if (nrow(gsea_glycolysis_hallmark@result) > 0) {
    write.csv(gsea_glycolysis_hallmark@result, 
              file.path(out_dir, "GSEA_Glycolysis_Hallmark.csv"), 
              row.names = FALSE)
    
    # Enrichment plot
    p_glyco_hallmark <- gseaplot2(gsea_glycolysis_hallmark, 
                                  geneSetID = 1,
                                  title = "HALLMARK_GLYCOLYSIS",
                                  pvalue_table = TRUE)
    print(p_glyco_hallmark)
    ggsave(file.path(out_dir, "GSEA_Glycolysis_Hallmark_enrichplot.pdf"), 
           p_glyco_hallmark, width = 10, height = 8)
    ggsave(file.path(out_dir, "GSEA_Glycolysis_Hallmark_enrichplot.png"), 
           p_glyco_hallmark, width = 10, height = 8, dpi = 300)
}

# ========== 方法2: 从所有 MsigDB 通路中筛选糖酵解和乳酸相关 ==========
msigdb_all <- msigdbr(species = "Homo sapiens", category = "C2")

# 筛选包含糖酵解、乳酸、葡萄糖代谢相关的通路
glycolysis_lactate_pathways <- msigdb_all %>%
  filter(grepl("GLYCOLYSIS|GLYCOLYTIC|LACTATE|GLUCOSE|PYRUVATE|WARBURG|AEROBIC_GLYCOLYSIS", 
               gs_name, ignore.case = TRUE)) %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("\n找到的糖酵解/乳酸相关通路数量:", length(unique(glycolysis_lactate_pathways$gs_name)), "\n")
cat("\n通路列表:\n")
print(unique(glycolysis_lactate_pathways$gs_name))

# GSEA 分析 - 糖酵解/乳酸通路
gsea_glycolysis_lactate <- GSEA(geneList = geneList,
                                TERM2GENE = glycolysis_lactate_pathways,
                                pvalueCutoff = 0.05,
                                minGSSize = 10,
                                maxGSSize = 500,
                                verbose = FALSE)

if (nrow(gsea_glycolysis_lactate@result) > 0) {
    write.csv(gsea_glycolysis_lactate@result, 
              file.path(out_dir, "GSEA_Glycolysis_Lactate_All.csv"), 
              row.names = FALSE)
    
    # Dotplot
    p_glyco_all <- dotplot(gsea_glycolysis_lactate, 
                           showCategory = 20, 
                           split = ".sign", 
                           font.size = 8) +
        facet_grid(. ~ .sign) +
        labs(title = "GSEA - 糖酵解/乳酸代谢相关通路") +
        theme(plot.title = element_text(hjust = 0.5),
              axis.text.y = element_text(size = 8))
    print(p_glyco_all)
    ggsave(file.path(out_dir, "GSEA_Glycolysis_Lactate_dotplot.pdf"), 
           p_glyco_all, width = 14, height = 10)
    ggsave(file.path(out_dir, "GSEA_Glycolysis_Lactate_dotplot.png"), 
           p_glyco_all, width = 14, height = 10, dpi = 300)
    
    # Ridge plot (Top 3)
    if (nrow(gsea_glycolysis_lactate@result) >= 3) {
        p_ridge_glyco <- ridgeplot(gsea_glycolysis_lactate, 
                                   showCategory = 3, 
                                   fill = "p.adjust") +
            labs(title = "糖酵解/乳酸通路 - Top 3") +
            theme(plot.title = element_text(hjust = 0.5))
        print(p_ridge_glyco)
        ggsave(file.path(out_dir, "GSEA_Glycolysis_Lactate_ridgeplot.pdf"), 
               p_ridge_glyco, width = 10, height = 6)
    }
}

# ========== 方法3: 自定义糖酵解核心基因列表 ==========
# 糖酵解通路的关键基因
glycolysis_core_genes <- c(
    "HK1", "HK2", "HK3",           # 己糖激酶
    "GPI",                          # 葡萄糖-6-磷酸异构酶
    "PFKL", "PFKM", "PFKP",        # 磷酸果糖激酶
    "ALDOA", "ALDOB", "ALDOC",     # 醛缩酶
    "TPI1",                         # 磷酸丙糖异构酶
    "GAPDH",                        # 甘油醛-3-磷酸脱氢酶
    "PGK1", "PGK2",                # 磷酸甘油酸激酶
    "PGAM1", "PGAM2",              # 磷酸甘油酸变位酶
    "ENO1", "ENO2", "ENO3",        # 烯醇化酶
    "PKM",                          # 丙酮酸激酶
    "LDHA", "LDHB", "LDHC",        # 乳酸脱氢酶
    "PDK1", "PDK2", "PDK3", "PDK4", # 丙酮酸脱氢酶激酶
    "SLC2A1", "SLC2A2", "SLC2A3", "SLC2A4",  # 葡萄糖转运蛋白 GLUT
    "SLC16A1", "SLC16A3", "SLC16A7",         # 乳酸转运蛋白 MCT
    "G6PC", "G6PC2", "G6PC3"       # 葡萄糖-6-磷酸酶
)

# 将基因符号转换为 ENTREZ ID
glycolysis_entrez <- bitr(glycolysis_core_genes, 
                          fromType = "SYMBOL", 
                          toType = "ENTREZID", 
                          OrgDb = org.Hs.eg.db)

# 创建自定义基因集
custom_glycolysis <- data.frame(
    gs_name = "CUSTOM_GLYCOLYSIS_LACTATE_CORE",
    entrez_gene = glycolysis_entrez$ENTREZID
)

cat("\n自定义糖酵解核心基因数量:", nrow(custom_glycolysis), "\n")

# GSEA 分析 - 自定义基因集
gsea_custom_glyco <- GSEA(geneList = geneList,
                          TERM2GENE = custom_glycolysis,
                          pvalueCutoff = 1,
                          minGSSize = 5,
                          maxGSSize = 500,
                          verbose = FALSE)

if (nrow(gsea_custom_glyco@result) > 0) {
    write.csv(gsea_custom_glyco@result, 
              file.path(out_dir, "GSEA_Custom_Glycolysis_Core.csv"), 
              row.names = FALSE)
    
    # Enrichment plot
    p_custom_glyco <- gseaplot2(gsea_custom_glyco, 
                                geneSetID = 1,
                                title = "自定义糖酵解/乳酸核心基因",
                                pvalue_table = TRUE)
    print(p_custom_glyco)
    ggsave(file.path(out_dir, "GSEA_Custom_Glycolysis_enrichplot.pdf"), 
           p_custom_glyco, width = 10, height = 8)
    ggsave(file.path(out_dir, "GSEA_Custom_Glycolysis_enrichplot.png"), 
           p_custom_glyco, width = 10, height = 8, dpi = 300)
    
    # 提取核心富集基因
    core_enrichment <- gsea_custom_glyco@result$core_enrichment[1]
    cat("\n核心富集基因 (Leading Edge):\n")
    cat(core_enrichment, "\n")
}

# ========== 方法4: 提取糖酵解基因的表达热图 ==========
# 获取在基因列表中存在的糖酵解基因
glycolysis_in_deg <- all_genes_gsea %>%
    filter(gene %in% glycolysis_core_genes) %>%
    arrange(desc(logFC))

cat("\n在差异基因中找到的糖酵解基因数量:", nrow(glycolysis_in_deg), "\n")
print(glycolysis_in_deg)

# 保存糖酵解基因列表
write.csv(glycolysis_in_deg, 
          file.path(out_dir, "Glycolysis_Genes_in_DEG.csv"), 
          row.names = FALSE)

# ========== 综合结果汇总 ==========
cat("\n========== 糖酵解/乳酸代谢 GSEA 分析完成 ==========\n")
cat("\n生成的文件:\n")
cat("1. GSEA_Glycolysis_Hallmark.csv - Hallmark糖酵解通路结果\n")
cat("2. GSEA_Glycolysis_Lactate_All.csv - 所有相关通路结果\n")
cat("3. GSEA_Custom_Glycolysis_Core.csv - 自定义核心基因结果\n")
cat("4. Glycolysis_Genes_in_DEG.csv - 差异表达的糖酵解基因\n")
cat("5. 相应的可视化图片（PDF和PNG格式）\n")
```

**关键通路说明：**

1. **HALLMARK_GLYCOLYSIS** - 最权威的糖酵解基因集
2. **KEGG_GLYCOLYSIS_GLUCONEOGENESIS** - KEGG 糖酵解/糖异生通路
3. **REACTOME_GLYCOLYSIS** - Reactome 糖酵解通路
4. **BIOCARTA_GLYCOLYSIS_PATHWAY** - BioCarta 糖酵解通路

**核心基因包括：**
- **糖酵解限速酶**: HK2, PFKL, PKM
- **乳酸代谢**: LDHA, LDHB
- **葡萄糖转运**: SLC2A1 (GLUT1), SLC2A3 (GLUT3)
- **乳酸转运**: SLC16A1 (MCT1), SLC16A3 (MCT4)

这个代码会生成多个层次的分析结果，帮助你全面了解糖酵解和乳酸代谢在你的数据中的富集情况。

### 👤 User <sub>2025/12/29 19:36</sub>

前面的代码如下：all_deg <- DEG[DEG$gene %in% genes_interest, ]
up_genes <- DEG_sig$gene[DEG_sig$change == "Up" & DEG_sig$gene %in% genes_interest]
down_genes <- DEG_sig$gene[DEG_sig$change == "Down" & DEG_sig$gene %in% genes_interest]
cat("上调基因数:", length(up_genes), "\n")
cat("下调基因数:", length(down_genes), "\n")
cat("总差异基因数:", length(all_deg), "\n")

# 将基因Symbol转换为ENTREZID (KEGG需要)
up_entrez <- bitr(up_genes, fromType = "SYMBOL", toType = "ENTREZID", OrgDb = org.Hs.eg.db)
down_entrez <- bitr(down_genes, fromType = "SYMBOL", toType = "ENTREZID", OrgDb = org.Hs.eg.db)
all_entrez <- bitr(all_deg, fromType = "SYMBOL", toType = "ENTREZID", OrgDb = org.Hs.eg.db)

cat("上调基因转换成功:", nrow(up_entrez), "\n")
cat("下调基因转换成功:", nrow(down_entrez), "\n")
cat("总差异基因转换成功:", nrow(all_entrez), "\n")

### 🤖 Copilot <sub>2025/12/29 19:36</sub>

根据你前面的代码，我看到你使用了筛选后的基因列表。需要注意的是，**GSEA 需要使用所有基因**（而非仅差异基因），按 logFC 排序。以下是适配你代码的版本：

```
# ========== GSEA 分析需要使用完整的基因列表（非筛选后的）==========
# 注意：GSEA 应该使用所有基因，而不是 genes_interest 筛选后的基因

# 准备 GSEA 基因列表（使用完整的 DEG，而不是筛选后的）
all_genes_gsea <- DEG[, c("gene", "logFC")]  # 使用所有基因

# 转换为 ENTREZID
all_genes_entrez <- bitr(all_genes_gsea$gene, 
                         fromType = "SYMBOL", 
                         toType = "ENTREZID", 
                         OrgDb = org.Hs.eg.db)
all_genes_gsea <- merge(all_genes_gsea, all_genes_entrez, by.x = "gene", by.y = "SYMBOL")

# 创建排序的基因列表
geneList <- all_genes_gsea$logFC
names(geneList) <- all_genes_gsea$ENTREZID
geneList <- sort(geneList, decreasing = TRUE)

cat("GSEA 基因列表长度:", length(geneList), "\n")
cat("logFC 范围:", min(geneList), "到", max(geneList), "\n")

# ========== 安装 msigdbr 包（如果未安装）==========
if (!require("msigdbr", quietly = TRUE)) {
    install.packages("msigdbr")
}
library(msigdbr)

# ========== 方法1: Hallmark 糖酵解通路（推荐）==========
msigdb_hallmark <- msigdbr(species = "Homo sapiens", category = "H")

glycolysis_hallmark <- msigdb_hallmark %>%
  filter(grepl("GLYCOLYSIS", gs_name, ignore.case = TRUE)) %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("\n找到 Hallmark 糖酵解通路:", nrow(glycolysis_hallmark), "个基因\n")
print(unique(glycolysis_hallmark$gs_name))

# GSEA 分析
gsea_glycolysis <- GSEA(geneList = geneList,
                        TERM2GENE = glycolysis_hallmark,
                        pvalueCutoff = 1,  # 设为1查看所有结果
                        minGSSize = 10,
                        maxGSSize = 500,
                        verbose = FALSE)

# 查看结果
print(gsea_glycolysis@result)

if (nrow(gsea_glycolysis@result) > 0) {
    write.csv(gsea_glycolysis@result, 
              file.path(out_dir, "GSEA_Glycolysis_Hallmark.csv"), 
              row.names = FALSE)
    
    cat("\n富集结果:\n")
    cat("NES (标准化富集分数):", gsea_glycolysis@result$NES, "\n")
    cat("p.adjust:", gsea_glycolysis@result$p.adjust, "\n")
    cat("核心基因数:", length(unlist(strsplit(gsea_glycolysis@result$core_enrichment, "/"))), "\n")
    
    # 绘制 enrichment plot
    p_glyco <- gseaplot2(gsea_glycolysis, 
                         geneSetID = 1,
                         title = unique(glycolysis_hallmark$gs_name),
                         pvalue_table = TRUE,
                         ES_geom = "line")
    print(p_glyco)
    ggsave(file.path(out_dir, "GSEA_Glycolysis_Hallmark.pdf"), 
           p_glyco, width = 10, height = 8)
    ggsave(file.path(out_dir, "GSEA_Glycolysis_Hallmark.png"), 
           p_glyco, width = 10, height = 8, dpi = 300)
}

# ========== 方法2: 所有糖酵解/乳酸相关通路 ==========
msigdb_all <- msigdbr(species = "Homo sapiens", category = "C2")

glycolysis_lactate <- msigdb_all %>%
  filter(grepl("GLYCOLYSIS|GLYCOLYTIC|LACTATE|GLUCOSE_METABOLISM|PYRUVATE|WARBURG", 
               gs_name, ignore.case = TRUE)) %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("\n找到糖酵解/乳酸相关通路数:", length(unique(glycolysis_lactate$gs_name)), "\n")

gsea_glyco_lactate <- GSEA(geneList = geneList,
                           TERM2GENE = glycolysis_lactate,
                           pvalueCutoff = 0.25,  # 可以设宽松一些
                           minGSSize = 10,
                           maxGSSize = 500,
                           verbose = FALSE)

if (nrow(gsea_glyco_lactate@result) > 0) {
    write.csv(gsea_glyco_lactate@result, 
              file.path(out_dir, "GSEA_Glycolysis_Lactate_All.csv"), 
              row.names = FALSE)
    
    # Dotplot
    p_dotplot <- dotplot(gsea_glyco_lactate, 
                         showCategory = 15, 
                         split = ".sign",
                         font.size = 9) +
        facet_grid(. ~ .sign) +
        labs(title = "糖酵解/乳酸代谢相关通路") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_dotplot)
    ggsave(file.path(out_dir, "GSEA_Glycolysis_Lactate_dotplot.pdf"), 
           p_dotplot, width = 12, height = 10)
    
    # Ridge plot (Top 3)
    if (nrow(gsea_glyco_lactate@result) >= 3) {
        p_ridge <- ridgeplot(gsea_glyco_lactate, 
                            showCategory = 3, 
                            fill = "p.adjust") +
            labs(title = "糖酵解/乳酸通路 (Top 3)") +
            theme(plot.title = element_text(hjust = 0.5))
        print(p_ridge)
        ggsave(file.path(out_dir, "GSEA_Glycolysis_Lactate_ridge.pdf"), 
               p_ridge, width = 10, height = 6)
    }
    
    # Enrichment plot for top 3
    if (nrow(gsea_glyco_lactate@result) >= 3) {
        top3_ids <- head(order(gsea_glyco_lactate@result$p.adjust), 3)
        p_top3 <- gseaplot2(gsea_glyco_lactate, 
                           geneSetID = top3_ids,
                           title = "Top 3 糖酵解/乳酸通路",
                           pvalue_table = TRUE)
        print(p_top3)
        ggsave(file.path(out_dir, "GSEA_Glycolysis_Top3_enrichplot.pdf"), 
               p_top3, width = 12, height = 10)
    }
}

# ========== 方法3: 提取糖酵解核心基因的表达情况 ==========
glycolysis_core <- c(
    "HK1", "HK2", "HK3",           # 己糖激酶
    "PFKL", "PFKM", "PFKP",        # 磷酸果糖激酶
    "ALDOA", "ALDOB", "ALDOC",     # 醛缩酶
    "GAPDH",                        # 甘油醛-3-磷酸脱氢酶
    "PGK1", "PKM",                  # 磷酸甘油酸激酶, 丙酮酸激酶
    "LDHA", "LDHB",                # 乳酸脱氢酶
    "SLC2A1", "SLC2A3",            # 葡萄糖转运蛋白
    "SLC16A1", "SLC16A3"           # 乳酸转运蛋白
)

# 提取这些基因在 DEG 中的表达情况
glycolysis_deg <- DEG[DEG$gene %in% glycolysis_core, ]
glycolysis_deg <- glycolysis_deg[order(glycolysis_deg$logFC, decreasing = TRUE), ]

cat("\n糖酵解核心基因在差异分析中的情况:\n")
print(glycolysis_deg[, c("gene", "logFC", "pvalue", "padj")])

write.csv(glycolysis_deg, 
          file.path(out_dir, "Glycolysis_Core_Genes_Expression.csv"), 
          row.names = FALSE)

# 可视化糖酵解核心基因的 logFC
if (nrow(glycolysis_deg) > 0) {
    p_bar <- ggplot(glycolysis_deg, aes(x = reorder(gene, logFC), y = logFC, fill = logFC)) +
        geom_bar(stat = "identity") +
        scale_fill_gradient2(low = "blue", mid = "white", high = "red", midpoint = 0) +
        coord_flip() +
        labs(title = "糖酵解核心基因表达变化", 
             x = "基因", 
             y = "log2 Fold Change") +
        theme_minimal() +
        theme(plot.title = element_text(hjust = 0.5, face = "bold"))
    print(p_bar)
    ggsave(file.path(out_dir, "Glycolysis_Core_Genes_barplot.pdf"), 
           p_bar, width = 8, height = 6)
    ggsave(file.path(out_dir, "Glycolysis_Core_Genes_barplot.png"), 
           p_bar, width = 8, height = 6, dpi = 300)
}

cat("\n========== 糖酵解/乳酸 GSEA 分析完成 ==========\n")
cat("生成文件:\n")
cat("1. GSEA_Glycolysis_Hallmark.csv/pdf/png\n")
cat("2. GSEA_Glycolysis_Lactate_All.csv\n")
cat("3. GSEA_Glycolysis_Lactate_dotplot/ridge.pdf\n")
cat("4. Glycolysis_Core_Genes_Expression.csv\n")
cat("5. Glycolysis_Core_Genes_barplot.pdf/png\n")
```

**重要提示：**

1. **GSEA 使用全基因集**：应该用 `DEG`（所有基因），不要用 `genes_interest` 筛选后的子集
2. **排序很重要**：基因按 logFC 降序排列
3. **pvalueCutoff 可以放宽**：对于特定通路，可设为 0.25 或 1.0 来查看所有结果
4. **NES (标准化富集分数)**：
   - NES > 0：通路在上调基因中富集
   - NES < 0：通路在下调基因中富集

这样的分析可以告诉你糖酵解/乳酸代谢通路在你的比较组中是整体上调还是下调。

### 👤 User <sub>2025/12/29 19:42</sub>

print(glycolysis_deg[, c("gene", "logFC", "pvalue", "padj")])
Error in `glycolysis_deg[, c("gene", "logFC", "pvalue", "padj")]`:
! Can't subset columns that don't exist.
✖ Columns `pvalue` and `padj` don't exist.
Run `rlang::last_trace()` to see where the error occurred.print(colnames(glycolysis_deg))
[1] "gene"    "logFC"   "AveExpr" "t"       "P.Value" "FDR"     "B"       "change" 
> 

### 🤖 Copilot <sub>2025/12/29 19:42</sub>

看到问题了，你的差异分析结果使用的是 `P.Value` 和 `FDR` 列名，而不是 `pvalue` 和 `padj`。以下是修正后的代码：

```
# ========== 方法3: 提取糖酵解核心基因的表达情况 ==========
glycolysis_core <- c(
    "HK1", "HK2", "HK3",           # 己糖激酶
    "PFKL", "PFKM", "PFKP",        # 磷酸果糖激酶
    "ALDOA", "ALDOB", "ALDOC",     # 醛缩酶
    "GAPDH",                        # 甘油醛-3-磷酸脱氢酶
    "PGK1", "PKM",                  # 磷酸甘油酸激酶, 丙酮酸激酶
    "LDHA", "LDHB",                # 乳酸脱氢酶
    "SLC2A1", "SLC2A3",            # 葡萄糖转运蛋白
    "SLC16A1", "SLC16A3"           # 乳酸转运蛋白
)

# 提取这些基因在 DEG 中的表达情况
glycolysis_deg <- DEG[DEG$gene %in% glycolysis_core, ]
glycolysis_deg <- glycolysis_deg[order(glycolysis_deg$logFC, decreasing = TRUE), ]

cat("\n糖酵解核心基因在差异分析中的情况:\n")
# 使用正确的列名：P.Value 和 FDR
print(glycolysis_deg[, c("gene", "logFC", "P.Value", "FDR", "change")])

write.csv(glycolysis_deg, 
          file.path(out_dir, "Glycolysis_Core_Genes_Expression.csv"), 
          row.names = FALSE)

# 添加显著性标记
glycolysis_deg$significance <- ifelse(glycolysis_deg$FDR < 0.05, 
                                      ifelse(glycolysis_deg$logFC > 0, "Up", "Down"), 
                                      "NS")

# 可视化糖酵解核心基因的 logFC
if (nrow(glycolysis_deg) > 0) {
    # 柱状图
    p_bar <- ggplot(glycolysis_deg, aes(x = reorder(gene, logFC), y = logFC, fill = significance)) +
        geom_bar(stat = "identity") +
        scale_fill_manual(values = c("Up" = "red", "Down" = "blue", "NS" = "gray")) +
        coord_flip() +
        labs(title = "糖酵解核心基因表达变化", 
             x = "基因", 
             y = "log2 Fold Change",
             fill = "显著性") +
        theme_minimal() +
        theme(plot.title = element_text(hjust = 0.5, face = "bold")) +
        geom_hline(yintercept = 0, linetype = "dashed", color = "black")
    
    print(p_bar)
    ggsave(file.path(out_dir, "Glycolysis_Core_Genes_barplot.pdf"), 
           p_bar, width = 8, height = 6)
    ggsave(file.path(out_dir, "Glycolysis_Core_Genes_barplot.png"), 
           p_bar, width = 8, height = 6, dpi = 300)
    
    # 火山图样式（横向）
    p_volcano <- ggplot(glycolysis_deg, aes(x = logFC, y = -log10(P.Value), 
                                            color = significance, label = gene)) +
        geom_point(size = 4, alpha = 0.8) +
        geom_text_repel(max.overlaps = 20, size = 3.5) +
        scale_color_manual(values = c("Up" = "red", "Down" = "blue", "NS" = "gray")) +
        geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "gray50") +
        geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "gray50") +
        labs(title = "糖酵解核心基因 - Volcano Plot",
             x = "log2 Fold Change",
             y = "-log10(P.Value)",
             color = "显著性") +
        theme_minimal() +
        theme(plot.title = element_text(hjust = 0.5, face = "bold"))
    
    print(p_volcano)
    ggsave(file.path(out_dir, "Glycolysis_Core_Genes_volcano.pdf"), 
           p_volcano, width = 10, height = 6)
    ggsave(file.path(out_dir, "Glycolysis_Core_Genes_volcano.png"), 
           p_volcano, width = 10, height = 6, dpi = 300)
}

# 统计糖酵解基因的上下调情况
cat("\n糖酵解核心基因统计:\n")
cat("总共找到:", nrow(glycolysis_deg), "个基因\n")
if (nrow(glycolysis_deg) > 0) {
    sig_up <- sum(glycolysis_deg$FDR < 0.05 & glycolysis_deg$logFC > 0)
    sig_down <- sum(glycolysis_deg$FDR < 0.05 & glycolysis_deg$logFC < 0)
    cat("显著上调:", sig_up, "\n")
    cat("显著下调:", sig_down, "\n")
    cat("不显著:", nrow(glycolysis_deg) - sig_up - sig_down, "\n")
}
```

**主要修改：**
1. 将 `pvalue` 改为 `P.Value`
2. 将 `padj` 改为 `FDR`
3. 添加了 `change` 列到输出
4. 添加了显著性分类和更丰富的可视化
5. 添加了统计汇总信息

这样代码就可以正常运行了！

### 👤 User <sub>2025/12/29 19:44</sub>

Error in geom_text_repel(max.overlaps = 20, size = 3.5) : 
  could not find function "geom_text_repel"
In addition: There were 16 warnings (use warnings() to see them)

### 🤖 Copilot <sub>2025/12/29 19:44</sub>

`geom_text_repel` 函数来自 `ggrepel` 包，需要先安装和加载。以下是修正后的代码：

```
# ========== 安装并加载必要的包 ==========
if (!require("ggrepel", quietly = TRUE)) {
    install.packages("ggrepel")
}
library(ggrepel)

# ========== 方法3: 提取糖酵解核心基因的表达情况 ==========
glycolysis_core <- c(
    "HK1", "HK2", "HK3",           # 己糖激酶
    "PFKL", "PFKM", "PFKP",        # 磷酸果糖激酶
    "ALDOA", "ALDOB", "ALDOC",     # 醛缩酶
    "GAPDH",                        # 甘油醛-3-磷酸脱氢酶
    "PGK1", "PKM",                  # 磷酸甘油酸激酶, 丙酮酸激酶
    "LDHA", "LDHB",                # 乳酸脱氢酶
    "SLC2A1", "SLC2A3",            # 葡萄糖转运蛋白
    "SLC16A1", "SLC16A3"           # 乳酸转运蛋白
)

# 提取这些基因在 DEG 中的表达情况
glycolysis_deg <- DEG[DEG$gene %in% glycolysis_core, ]
glycolysis_deg <- glycolysis_deg[order(glycolysis_deg$logFC, decreasing = TRUE), ]

cat("\n糖酵解核心基因在差异分析中的情况:\n")
print(glycolysis_deg[, c("gene", "logFC", "P.Value", "FDR", "change")])

write.csv(glycolysis_deg, 
          file.path(out_dir, "Glycolysis_Core_Genes_Expression.csv"), 
          row.names = FALSE)

# 添加显著性标记
glycolysis_deg$significance <- ifelse(glycolysis_deg$FDR < 0.05, 
                                      ifelse(glycolysis_deg$logFC > 0, "Up", "Down"), 
                                      "NS")

# 可视化糖酵解核心基因的 logFC
if (nrow(glycolysis_deg) > 0) {
    # 柱状图
    p_bar <- ggplot(glycolysis_deg, aes(x = reorder(gene, logFC), y = logFC, fill = significance)) +
        geom_bar(stat = "identity") +
        scale_fill_manual(values = c("Up" = "red", "Down" = "blue", "NS" = "gray")) +
        coord_flip() +
        labs(title = "糖酵解核心基因表达变化", 
             x = "基因", 
             y = "log2 Fold Change",
             fill = "显著性") +
        theme_minimal() +
        theme(plot.title = element_text(hjust = 0.5, face = "bold")) +
        geom_hline(yintercept = 0, linetype = "dashed", color = "black")
    
    print(p_bar)
    ggsave(file.path(out_dir, "Glycolysis_Core_Genes_barplot.pdf"), 
           p_bar, width = 8, height = 6)
    ggsave(file.path(out_dir, "Glycolysis_Core_Genes_barplot.png"), 
           p_bar, width = 8, height = 6, dpi = 300)
    
    # 火山图样式（使用 ggrepel）
    p_volcano <- ggplot(glycolysis_deg, aes(x = logFC, y = -log10(P.Value), 
                                            color = significance, label = gene)) +
        geom_point(size = 4, alpha = 0.8) +
        geom_text_repel(max.overlaps = 20, size = 3.5, box.padding = 0.5) +
        scale_color_manual(values = c("Up" = "red", "Down" = "blue", "NS" = "gray")) +
        geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "gray50") +
        geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "gray50") +
        labs(title = "糖酵解核心基因 - Volcano Plot",
             x = "log2 Fold Change",
             y = "-log10(P.Value)",
             color = "显著性") +
        theme_minimal() +
        theme(plot.title = element_text(hjust = 0.5, face = "bold"))
    
    print(p_volcano)
    ggsave(file.path(out_dir, "Glycolysis_Core_Genes_volcano.pdf"), 
           p_volcano, width = 10, height = 6)
    ggsave(file.path(out_dir, "Glycolysis_Core_Genes_volcano.png"), 
           p_volcano, width = 10, height = 6, dpi = 300)
}

# 统计糖酵解基因的上下调情况
cat("\n糖酵解核心基因统计:\n")
cat("总共找到:", nrow(glycolysis_deg), "个基因\n")
if (nrow(glycolysis_deg) > 0) {
    sig_up <- sum(glycolysis_deg$FDR < 0.05 & glycolysis_deg$logFC > 0)
    sig_down <- sum(glycolysis_deg$FDR < 0.05 & glycolysis_deg$logFC < 0)
    cat("显著上调:", sig_up, "\n")
    cat("显著下调:", sig_down, "\n")
    cat("不显著:", nrow(glycolysis_deg) - sig_up - sig_down, "\n")
}

cat("\n========== 糖酵解核心基因分析完成 ==========\n")
```

**主要修改：**
1. 在代码开头添加了 `ggrepel` 包的安装和加载
2. 如果不想使用 `ggrepel`，也可以用普通的 `geom_text()` 替代（但可能会有标签重叠）

**替代方案（如果不想安装 ggrepel）：**

```
# 使用 geom_text 替代 geom_text_repel（可能有标签重叠）
p_volcano <- ggplot(glycolysis_deg, aes(x = logFC, y = -log10(P.Value), 
                                        color = significance, label = gene)) +
    geom_point(size = 4, alpha = 0.8) +
    geom_text(size = 3, hjust = -0.2, vjust = 0, check_overlap = TRUE) +  # 使用普通 geom_text
    scale_color_manual(values = c("Up" = "red", "Down" = "blue", "NS" = "gray")) +
    geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "gray50") +
    geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "gray50") +
    labs(title = "糖酵解核心基因 - Volcano Plot",
         x = "log2 Fold Change",
         y = "-log10(P.Value)",
         color = "显著性") +
    theme_minimal() +
    theme(plot.title = element_text(hjust = 0.5, face = "bold"))
```

推荐使用第一个方案（安装 `ggrepel`），因为它能自动避免标签重叠，图形更美观。

### 👤 User <sub>2025/12/29 20:00</sub>

再加一个乙酰化的通路，现在是乳酸化、糖酵解以及乙酰化

### 🤖 Copilot <sub>2025/12/29 20:00</sub>

好的，我来添加乙酰化相关的通路分析。以下是完整的代码，整合了**糖酵解、乳酸代谢和乙酰化**三个方面：

```
library(clusterProfiler)
library(msigdbr)
library(org.Hs.eg.db)
library(ggplot2)

# 安装 ggrepel（如果需要）
if (!require("ggrepel", quietly = TRUE)) {
    install.packages("ggrepel")
}
library(ggrepel)

# ========== 准备 GSEA 基因列表（使用完整的 DEG）==========
all_genes_gsea <- DEG[, c("gene", "logFC")]
all_genes_entrez <- bitr(all_genes_gsea$gene, 
                         fromType = "SYMBOL", 
                         toType = "ENTREZID", 
                         OrgDb = org.Hs.eg.db)
all_genes_gsea <- merge(all_genes_gsea, all_genes_entrez, by.x = "gene", by.y = "SYMBOL")

geneList <- all_genes_gsea$logFC
names(geneList) <- all_genes_gsea$ENTREZID
geneList <- sort(geneList, decreasing = TRUE)

cat("GSEA 基因列表长度:", length(geneList), "\n")
cat("logFC 范围:", round(min(geneList), 2), "到", round(max(geneList), 2), "\n")

# ========== 方法1: Hallmark 通路（糖酵解）==========
msigdb_hallmark <- msigdbr(species = "Homo sapiens", category = "H")

glycolysis_hallmark <- msigdb_hallmark %>%
  filter(grepl("GLYCOLYSIS", gs_name, ignore.case = TRUE)) %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("\n找到 Hallmark 糖酵解通路:", length(unique(glycolysis_hallmark$gs_name)), "个\n")

gsea_glycolysis <- GSEA(geneList = geneList,
                        TERM2GENE = glycolysis_hallmark,
                        pvalueCutoff = 1,
                        minGSSize = 10,
                        maxGSSize = 500,
                        verbose = FALSE)

if (nrow(gsea_glycolysis@result) > 0) {
    write.csv(gsea_glycolysis@result, 
              file.path(out_dir, "GSEA_Glycolysis_Hallmark.csv"), 
              row.names = FALSE)
    
    p_glyco <- gseaplot2(gsea_glycolysis, 
                         geneSetID = 1,
                         title = unique(glycolysis_hallmark$gs_name),
                         pvalue_table = TRUE)
    print(p_glyco)
    ggsave(file.path(out_dir, "GSEA_Glycolysis_Hallmark.pdf"), p_glyco, width = 10, height = 8)
}

# ========== 方法2: 糖酵解、乳酸、乙酰化综合通路 ==========
msigdb_all <- msigdbr(species = "Homo sapiens", category = "C2")

# 扩展搜索关键词，包含乙酰化
metabolism_pathways <- msigdb_all %>%
  filter(grepl("GLYCOLYSIS|GLYCOLYTIC|LACTATE|GLUCOSE|PYRUVATE|WARBURG|ACETYL|ACETYLATION|HISTONE_ACETYL", 
               gs_name, ignore.case = TRUE)) %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("\n找到糖酵解/乳酸/乙酰化相关通路数:", length(unique(metabolism_pathways$gs_name)), "\n")
cat("通路列表:\n")
print(unique(metabolism_pathways$gs_name))

gsea_metabolism <- GSEA(geneList = geneList,
                       TERM2GENE = metabolism_pathways,
                       pvalueCutoff = 0.25,
                       minGSSize = 10,
                       maxGSSize = 500,
                       verbose = FALSE)

if (nrow(gsea_metabolism@result) > 0) {
    write.csv(gsea_metabolism@result, 
              file.path(out_dir, "GSEA_Metabolism_All.csv"), 
              row.names = FALSE)
    
    # Dotplot
    p_dotplot <- dotplot(gsea_metabolism, 
                         showCategory = 20, 
                         split = ".sign",
                         font.size = 8) +
        facet_grid(. ~ .sign) +
        labs(title = "糖酵解/乳酸/乙酰化代谢相关通路") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_dotplot)
    ggsave(file.path(out_dir, "GSEA_Metabolism_dotplot.pdf"), p_dotplot, width = 14, height = 10)
    
    # Ridge plot (Top 3)
    if (nrow(gsea_metabolism@result) >= 3) {
        p_ridge <- ridgeplot(gsea_metabolism, showCategory = 3, fill = "p.adjust") +
            labs(title = "代谢通路 (Top 3)") +
            theme(plot.title = element_text(hjust = 0.5))
        print(p_ridge)
        ggsave(file.path(out_dir, "GSEA_Metabolism_ridge.pdf"), p_ridge, width = 10, height = 6)
    }
}

# ========== 方法3: 提取核心基因的表达情况 ==========
# 糖酵解核心基因
glycolysis_genes <- c(
    "HK1", "HK2", "HK3",           # 己糖激酶
    "PFKL", "PFKM", "PFKP",        # 磷酸果糖激酶
    "ALDOA", "PKM",                 # 醛缩酶, 丙酮酸激酶
    "GAPDH", "PGK1"                # 糖酵解关键酶
)

# 乳酸代谢基因
lactate_genes <- c(
    "LDHA", "LDHB", "LDHC",        # 乳酸脱氢酶
    "SLC16A1", "SLC16A3", "SLC16A7" # 乳酸转运蛋白 (MCT1, MCT4, MCT2)
)

# 乙酰化相关基因
acetylation_genes <- c(
    # 乙酰辅酶A合成与代谢
    "ACLY", "ACSS1", "ACSS2",      # ATP citrate lyase, Acyl-CoA synthetase
    "SLC25A1",                      # 乙酰辅酶A转运蛋白
    
    # 组蛋白乙酰转移酶 (HATs)
    "KAT2A", "KAT2B",              # GCN5, PCAF
    "EP300", "CREBBP",             # p300, CBP
    "KAT5", "KAT6A", "KAT7", "KAT8", # TIP60, MOZ, HBO1, MOF
    
    # 组蛋白去乙酰化酶 (HDACs)
    "HDAC1", "HDAC2", "HDAC3",     # Class I HDACs
    "HDAC4", "HDAC5", "HDAC6", "HDAC7", # Class II HDACs
    "HDAC8", "HDAC9", "HDAC10", "HDAC11",
    "SIRT1", "SIRT2", "SIRT3", "SIRT6", "SIRT7"  # Sirtuins (Class III)
)

# 合并所有基因
all_metabolism_genes <- c(glycolysis_genes, lactate_genes, acetylation_genes)

# 提取这些基因在 DEG 中的表达情况
metabolism_deg <- DEG[DEG$gene %in% all_metabolism_genes, ]
metabolism_deg <- metabolism_deg[order(metabolism_deg$logFC, decreasing = TRUE), ]

# 添加基因分类标签
metabolism_deg$pathway <- NA
metabolism_deg$pathway[metabolism_deg$gene %in% glycolysis_genes] <- "Glycolysis"
metabolism_deg$pathway[metabolism_deg$gene %in% lactate_genes] <- "Lactate"
metabolism_deg$pathway[metabolism_deg$gene %in% acetylation_genes] <- "Acetylation"

# 添加显著性标记
metabolism_deg$significance <- ifelse(metabolism_deg$FDR < 0.05, 
                                      ifelse(metabolism_deg$logFC > 0, "Up", "Down"), 
                                      "NS")

cat("\n代谢核心基因在差异分析中的情况:\n")
print(metabolism_deg[, c("gene", "pathway", "logFC", "P.Value", "FDR", "significance")])

write.csv(metabolism_deg, 
          file.path(out_dir, "Metabolism_Core_Genes_Expression.csv"), 
          row.names = FALSE)

# ========== 可视化 ==========
if (nrow(metabolism_deg) > 0) {
    # 1. 按pathway分面的柱状图
    p_bar_facet <- ggplot(metabolism_deg, 
                          aes(x = reorder(gene, logFC), y = logFC, fill = significance)) +
        geom_bar(stat = "identity") +
        scale_fill_manual(values = c("Up" = "red", "Down" = "blue", "NS" = "gray")) +
        facet_wrap(~ pathway, scales = "free_y", ncol = 1) +
        coord_flip() +
        labs(title = "糖酵解/乳酸/乙酰化核心基因表达变化", 
             x = "基因", 
             y = "log2 Fold Change",
             fill = "显著性") +
        theme_minimal() +
        theme(plot.title = element_text(hjust = 0.5, face = "bold"),
              strip.text = element_text(face = "bold", size = 12)) +
        geom_hline(yintercept = 0, linetype = "dashed", color = "black")
    
    print(p_bar_facet)
    ggsave(file.path(out_dir, "Metabolism_Core_Genes_barplot_facet.pdf"), 
           p_bar_facet, width = 10, height = 14)
    ggsave(file.path(out_dir, "Metabolism_Core_Genes_barplot_facet.png"), 
           p_bar_facet, width = 10, height = 14, dpi = 300)
    
    # 2. 火山图（按pathway着色）
    p_volcano <- ggplot(metabolism_deg, 
                       aes(x = logFC, y = -log10(P.Value), 
                           color = pathway, shape = significance, label = gene)) +
        geom_point(size = 4, alpha = 0.8) +
        geom_text_repel(max.overlaps = 30, size = 3, box.padding = 0.5) +
        scale_color_manual(values = c("Glycolysis" = "#E64B35", 
                                      "Lactate" = "#4DBBD5", 
                                      "Acetylation" = "#00A087")) +
        scale_shape_manual(values = c("Up" = 17, "Down" = 25, "NS" = 16)) +
        geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "gray50") +
        geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "gray50") +
        labs(title = "代谢核心基因 - Volcano Plot",
             x = "log2 Fold Change",
             y = "-log10(P.Value)",
             color = "通路",
             shape = "显著性") +
        theme_minimal() +
        theme(plot.title = element_text(hjust = 0.5, face = "bold", size = 14))
    
    print(p_volcano)
    ggsave(file.path(out_dir, "Metabolism_Core_Genes_volcano.pdf"), 
           p_volcano, width = 12, height = 8)
    ggsave(file.path(out_dir, "Metabolism_Core_Genes_volcano.png"), 
           p_volcano, width = 12, height = 8, dpi = 300)
    
    # 3. 热图样式（仅显著的基因）
    sig_metabolism_deg <- metabolism_deg[metabolism_deg$FDR < 0.05, ]
    
    if (nrow(sig_metabolism_deg) > 0) {
        p_heatmap <- ggplot(sig_metabolism_deg, 
                           aes(x = pathway, y = reorder(gene, logFC), fill = logFC)) +
            geom_tile(color = "white", size = 0.5) +
            scale_fill_gradient2(low = "blue", mid = "white", high = "red", 
                               midpoint = 0, name = "log2FC") +
            geom_text(aes(label = ifelse(FDR < 0.01, "**", 
                                         ifelse(FDR < 0.05, "*", ""))), 
                     size = 5) +
            labs(title = "显著差异的代谢基因热图",
                 x = "通路",
                 y = "基因") +
            theme_minimal() +
            theme(plot.title = element_text(hjust = 0.5, face = "bold"),
                  axis.text.x = element_text(angle = 45, hjust = 1))
        
        print(p_heatmap)
        ggsave(file.path(out_dir, "Metabolism_Significant_Genes_heatmap.pdf"), 
               p_heatmap, width = 8, height = 10)
    }
}

# ========== 统计汇总 ==========
cat("\n========== 代谢基因统计汇总 ==========\n")
for (pw in c("Glycolysis", "Lactate", "Acetylation")) {
    pw_genes <- metabolism_deg[metabolism_deg$pathway == pw, ]
    if (nrow(pw_genes) > 0) {
        cat(sprintf("\n%s 通路:\n", pw))
        cat("  总基因数:", nrow(pw_genes), "\n")
        cat("  显著上调:", sum(pw_genes$FDR < 0.05 & pw_genes$logFC > 0), "\n")
        cat("  显著下调:", sum(pw_genes$FDR < 0.05 & pw_genes$logFC < 0), "\n")
        cat("  不显著:", sum(pw_genes$FDR >= 0.05), "\n")
    }
}

cat("\n========== 分析完成 ==========\n")
cat("生成文件:\n")
cat("1. GSEA_Glycolysis_Hallmark.csv/pdf\n")
cat("2. GSEA_Metabolism_All.csv\n")
cat("3. GSEA_Metabolism_dotplot/ridge.pdf\n")
cat("4. Metabolism_Core_Genes_Expression.csv\n")
cat("5. Metabolism_Core_Genes_barplot_facet.pdf/png\n")
cat("6. Metabolism_Core_Genes_volcano.pdf/png\n")
cat("7. Metabolism_Significant_Genes_heatmap.pdf\n")
```

**主要改进：**

1. **乙酰化基因分类：**
   - 乙酰辅酶A合成：ACLY, ACSS1/2
   - 组蛋白乙酰转移酶（HATs）：EP300, CREBBP, KAT家族
   - 组蛋白去乙酰化酶（HDACs）：HDAC1-11, SIRT家族

2. **可视化增强：**
   - 按通路分面的柱状图
   - 按通路着色的火山图
   - 显著基因的热图

3. **统计汇总：**
   - 分别统计三个通路的基因数量和显著性

这样可以全面分析糖酵解、乳酸代谢和乙酰化三个代谢通路在你的数据中的表达变化！

### 👤 User <sub>2025/12/30 11:15</sub>

我现在有几个要求帮我修改一下代码：要求如下：1.从 HALLMARK_GLYCOLYSIS 通路中，可以只保留上调的基因去做GESA分析么；2.HALLMARK 通路是 “宽泛的功能集合”，可换成更细分的糖酵解子通路（比如 KEGG 的hsa00010 Glycolysis/Gluconeogenesis）：
步骤：用 KEGG 的糖酵解通路基因列表（更聚焦核心代谢步骤）替代 HALLMARK_GLYCOLYSIS，重新做富集分析；
效果：细分通路的基因功能更集中，差异趋势的一致性更强，易得到显著 P 值。3.传统 GSEA 默认是 “表型置换”（适合大样本），若你的样本量较小，可改为 **“基因集置换”**：
• 操作：在 GSEA 软件 / 代码中，将permutation_type参数设为gene_set（而非phenotype）；
• 原理：样本量小时，表型置换的假阴性率高，基因集置换更适配小样本，能提升富集显著性。4.GSEA 的weight参数决定了 “差异倍数大的基因” 对富集分数的贡献度：
操作：将 GSEA 的weight从默认的1调整为2（或更高）；
原理：图 1 中糖酵解通路有部分基因差异倍数较大（比如 GAPDH 的 log2FC 较低），提高权重后，这些高差异基因会更强地 “拉动” 富集分数，让 running enrichment score 的波动更明显，从而降低 P 值。

### 🤖 Copilot <sub>2025/12/30 11:15</sub>

根据你的要求，我来修改代码。需要注意的是：

**关于要求1的说明：** GSEA需要完整的基因排序列表（包括上调和下调），不能只用上调基因。如果只用上调基因，应该用ORA（Over-Representation Analysis）而不是GSEA。我会在代码中提供两种方案。

以下是修改后的完整代码：

```
library(clusterProfiler)
library(msigdbr)
library(org.Hs.eg.db)
library(ggplot2)

if (!require("ggrepel", quietly = TRUE)) {
    install.packages("ggrepel")
}
library(ggrepel)

# ========== 准备 GSEA 基因列表（完整排序）==========
all_genes_gsea <- DEG[, c("gene", "logFC")]
all_genes_entrez <- bitr(all_genes_gsea$gene, 
                         fromType = "SYMBOL", 
                         toType = "ENTREZID", 
                         OrgDb = org.Hs.eg.db)
all_genes_gsea <- merge(all_genes_gsea, all_genes_entrez, by.x = "gene", by.y = "SYMBOL")

# 完整排序基因列表（GSEA用）
geneList <- all_genes_gsea$logFC
names(geneList) <- all_genes_gsea$ENTREZID
geneList <- sort(geneList, decreasing = TRUE)

cat("GSEA 基因列表长度:", length(geneList), "\n")
cat("logFC 范围:", round(min(geneList), 2), "到", round(max(geneList), 2), "\n")

# ========== 方案1: 完整GSEA（推荐，使用所有基因）==========
cat("\n========== 方案1: 标准GSEA（使用完整基因排序）==========\n")

# 获取 KEGG 糖酵解通路（hsa00010）
msigdb_kegg <- msigdbr(species = "Homo sapiens", category = "C2", subcategory = "CP:KEGG")

# 筛选糖酵解通路
kegg_glycolysis <- msigdb_kegg %>%
  filter(grepl("GLYCOLYSIS|GLUCONEOGENESIS", gs_name, ignore.case = TRUE)) %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("找到 KEGG 糖酵解通路:", length(unique(kegg_glycolysis$gs_name)), "个\n")
print(unique(kegg_glycolysis$gs_name))

# GSEA 分析 - 优化参数
# 1. 使用基因集置换（默认，适合小样本）
# 2. 提高 exponent (weight) 参数，让高差异基因贡献更大
gsea_glycolysis_optimized <- GSEA(
    geneList = geneList,
    TERM2GENE = kegg_glycolysis,
    pvalueCutoff = 1,           # 查看所有结果
    minGSSize = 10,
    maxGSSize = 500,
    pAdjustMethod = "BH",
    by = "fgsea",               # 使用fgsea算法（更快更准）
    exponent = 2,               # 提高权重！让高差异基因贡献更大（默认1）
    nPermSimple = 10000,        # 增加置换次数（默认1000）
    verbose = FALSE
)

if (nrow(gsea_glycolysis_optimized@result) > 0) {
    cat("\n✅ GSEA 结果（优化参数）:\n")
    print(gsea_glycolysis_optimized@result[, c("ID", "Description", "NES", "pvalue", "p.adjust")])
    
    write.csv(gsea_glycolysis_optimized@result, 
              file.path(out_dir, "GSEA_KEGG_Glycolysis_Optimized.csv"), 
              row.names = FALSE)
    
    # Enrichment plot
    p_gsea_opt <- gseaplot2(gsea_glycolysis_optimized, 
                           geneSetID = 1,
                           title = paste0(gsea_glycolysis_optimized@result$Description[1], 
                                        "\n(weight=2, nPerm=10000)"),
                           pvalue_table = TRUE,
                           ES_geom = "line")
    print(p_gsea_opt)
    ggsave(file.path(out_dir, "GSEA_KEGG_Glycolysis_Optimized.pdf"), 
           p_gsea_opt, width = 10, height = 8)
    ggsave(file.path(out_dir, "GSEA_KEGG_Glycolysis_Optimized.png"), 
           p_gsea_opt, width = 10, height = 8, dpi = 300)
}

# ========== 方案2: ORA富集分析（仅上调基因）==========
cat("\n========== 方案2: ORA富集分析（仅使用显著上调基因）==========\n")
cat("注意：这不是GSEA，而是Over-Representation Analysis\n")

# 筛选显著上调的基因
up_genes <- all_genes_gsea$ENTREZID[all_genes_gsea$logFC > 0]  # 可以加FDR < 0.05的条件
cat("上调基因数:", length(up_genes), "\n")

# 背景基因集（所有检测到的基因）
background_genes <- all_genes_gsea$ENTREZID

# ORA富集分析（针对上调基因）
ora_glycolysis_up <- enricher(
    gene = up_genes,
    TERM2GENE = kegg_glycolysis,
    universe = background_genes,
    pvalueCutoff = 1,
    qvalueCutoff = 1,
    minGSSize = 10,
    maxGSSize = 500
)

if (!is.null(ora_glycolysis_up) && nrow(ora_glycolysis_up@result) > 0) {
    cat("\n✅ ORA 结果（仅上调基因）:\n")
    print(ora_glycolysis_up@result[, c("ID", "Description", "GeneRatio", "pvalue", "p.adjust")])
    
    write.csv(ora_glycolysis_up@result, 
              file.path(out_dir, "ORA_KEGG_Glycolysis_UpGenes.csv"), 
              row.names = FALSE)
    
    # 条形图
    if (nrow(ora_glycolysis_up@result) > 0) {
        p_ora <- barplot(ora_glycolysis_up, showCategory = 10) +
            labs(title = "ORA - 上调基因在糖酵解通路中的富集") +
            theme(plot.title = element_text(hjust = 0.5))
        print(p_ora)
        ggsave(file.path(out_dir, "ORA_KEGG_Glycolysis_UpGenes.pdf"), 
               p_ora, width = 10, height = 6)
    }
}

# ========== 方案3: 多条糖酵解/乳酸/乙酰化通路的GSEA（优化参数）==========
cat("\n========== 方案3: 综合代谢通路GSEA（优化参数）==========\n")

msigdb_all <- msigdbr(species = "Homo sapiens", category = "C2")

# 使用更精确的KEGG通路
kegg_metabolism <- msigdb_all %>%
  filter(grepl("KEGG_GLYCOLYSIS|KEGG_PYRUVATE|KEGG_CITRATE|ACETYL", 
               gs_name, ignore.case = TRUE)) %>%
  dplyr::select(gs_name, entrez_gene) %>%
  as.data.frame()

cat("找到代谢相关通路数:", length(unique(kegg_metabolism$gs_name)), "\n")
print(unique(kegg_metabolism$gs_name))

# GSEA分析 - 使用优化参数
gsea_metabolism_opt <- GSEA(
    geneList = geneList,
    TERM2GENE = kegg_metabolism,
    pvalueCutoff = 0.25,
    minGSSize = 10,
    maxGSSize = 500,
    pAdjustMethod = "BH",
    by = "fgsea",
    exponent = 2,               # 提高权重
    nPermSimple = 10000,        # 增加置换次数
    verbose = FALSE
)

if (nrow(gsea_metabolism_opt@result) > 0) {
    write.csv(gsea_metabolism_opt@result, 
              file.path(out_dir, "GSEA_Metabolism_KEGG_Optimized.csv"), 
              row.names = FALSE)
    
    # Dotplot
    p_dotplot_opt <- dotplot(gsea_metabolism_opt, 
                             showCategory = 15, 
                             split = ".sign",
                             font.size = 8) +
        facet_grid(. ~ .sign) +
        labs(title = "KEGG代谢通路GSEA (weight=2, nPerm=10000)") +
        theme(plot.title = element_text(hjust = 0.5))
    print(p_dotplot_opt)
    ggsave(file.path(out_dir, "GSEA_Metabolism_KEGG_Optimized_dotplot.pdf"), 
           p_dotplot_opt, width = 12, height = 8)
    
    # Ridge plot (Top 3)
    if (nrow(gsea_metabolism_opt@result) >= 3) {
        p_ridge_opt <- ridgeplot(gsea_metabolism_opt, showCategory = 3, fill = "p.adjust") +
            labs(title = "KEGG代谢通路 (Top 3, 优化参数)") +
            theme(plot.title = element_text(hjust = 0.5))
        print(p_ridge_opt)
        ggsave(file.path(out_dir, "GSEA_Metabolism_KEGG_ridge.pdf"), 
               p_ridge_opt, width = 10, height = 6)
    }
}

# ========== 提取代谢核心基因表达 ==========
glycolysis_genes <- c("HK1", "HK2", "HK3", "PFKL", "PFKM", "PFKP", 
                      "ALDOA", "PKM", "GAPDH", "PGK1")
lactate_genes <- c("LDHA", "LDHB", "LDHC", "SLC16A1", "SLC16A3", "SLC16A7")
acetylation_genes <- c("ACLY", "ACSS1", "ACSS2", "SLC25A1",
                       "KAT2A", "KAT2B", "EP300", "CREBBP",
                       "HDAC1", "HDAC2", "HDAC3", "SIRT1", "SIRT2", "SIRT3")

all_metabolism_genes <- c(glycolysis_genes, lactate_genes, acetylation_genes)

metabolism_deg <- DEG[DEG$gene %in% all_metabolism_genes, ]
metabolism_deg <- metabolism_deg[order(metabolism_deg$logFC, decreasing = TRUE), ]

metabolism_deg$pathway <- NA
metabolism_deg$pathway[metabolism_deg$gene %in% glycolysis_genes] <- "Glycolysis"
metabolism_deg$pathway[metabolism_deg$gene %in% lactate_genes] <- "Lactate"
metabolism_deg$pathway[metabolism_deg$gene %in% acetylation_genes] <- "Acetylation"

metabolism_deg$significance <- ifelse(metabolism_deg$FDR < 0.05, 
                                      ifelse(metabolism_deg$logFC > 0, "Up", "Down"), 
                                      "NS")

write.csv(metabolism_deg, 
          file.path(out_dir, "Metabolism_Core_Genes_Expression.csv"), 
          row.names = FALSE)

# ========== 可视化核心基因 ==========
if (nrow(metabolism_deg) > 0) {
    # 分面柱状图
    p_bar_facet <- ggplot(metabolism_deg, 
                          aes(x = reorder(gene, logFC), y = logFC, fill = significance)) +
        geom_bar(stat = "identity") +
        scale_fill_manual(values = c("Up" = "red", "Down" = "blue", "NS" = "gray")) +
        facet_wrap(~ pathway, scales = "free_y", ncol = 1) +
        coord_flip() +
        labs(title = "糖酵解/乳酸/乙酰化核心基因表达变化", 
             x = "基因", 
             y = "log2 Fold Change") +
        theme_minimal() +
        theme(plot.title = element_text(hjust = 0.5, face = "bold"),
              strip.text = element_text(face = "bold")) +
        geom_hline(yintercept = 0, linetype = "dashed", color = "black")
    
    print(p_bar_facet)
    ggsave(file.path(out_dir, "Metabolism_Core_Genes_barplot_facet.pdf"), 
           p_bar_facet, width = 10, height = 12)
    ggsave(file.path(out_dir, "Metabolism_Core_Genes_barplot_facet.png"), 
           p_bar_facet, width = 10, height = 12, dpi = 300)
    
    # 火山图（按pathway着色）
    p_volcano <- ggplot(metabolism_deg, 
                       aes(x = logFC, y = -log10(P.Value), 
                           color = pathway, shape = significance, label = gene)) +
        geom_point(size = 4, alpha = 0.8) +
        geom_text_repel(max.overlaps = 30, size = 3, box.padding = 0.5) +
        scale_color_manual(values = c("Glycolysis" = "#E64B35", 
                                      "Lactate" = "#4DBBD5", 
                                      "Acetylation" = "#00A087")) +
        scale_shape_manual(values = c("Up" = 17, "Down" = 25, "NS" = 16)) +
        geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "gray50") +
        geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "gray50") +
        labs(title = "代谢核心基因 - Volcano Plot",
             x = "log2 Fold Change",
             y = "-log10(P.Value)") +
        theme_minimal() +
        theme(plot.title = element_text(hjust = 0.5, face = "bold"))
    
    print(p_volcano)
    ggsave(file.path(out_dir, "Metabolism_Core_Genes_volcano.pdf"), 
           p_volcano, width = 12, height = 8)
    ggsave(file.path(out_dir, "Metabolism_Core_Genes_volcano.png"), 
           p_volcano, width = 12, height = 8, dpi = 300)
}

# ========== 统计汇总 ==========
cat("\n========== 统计汇总 ==========\n")
for (pw in c("Glycolysis", "Lactate", "Acetylation")) {
    pw_genes <- metabolism_deg[metabolism_deg$pathway == pw, ]
    if (nrow(pw_genes) > 0) {
        cat(sprintf("\n%s 通路:\n", pw))
        cat("  总基因数:", nrow(pw_genes), "\n")
        cat("  显著上调:", sum(pw_genes$FDR < 0.05 & pw_genes$logFC > 0), "\n")
        cat("  显著下调:", sum(pw_genes$FDR < 0.05 & pw_genes$logFC < 0), "\n")
    }
}

cat("\n========== 分析完成 ==========\n")
cat("\n生成文件:\n")
cat("【方案1 - 标准GSEA（推荐）】\n")
cat("  1. GSEA_KEGG_Glycolysis_Optimized.csv/pdf/png\n")
cat("【方案2 - ORA分析（仅上调基因）】\n")
cat("  2. ORA_KEGG_Glycolysis_UpGenes.csv/pdf\n")
cat("【方案3 - 综合代谢通路】\n")
cat("  3. GSEA_Metabolism_KEGG_Optimized.csv\n")
cat("  4. GSEA_Metabolism_KEGG_Optimized_dotplot.pdf\n")
cat("  5. Metabolism_Core_Genes_Expression.csv\n")
cat("  6. Metabolism_Core_Genes_barplot_facet/volcano.pdf\n")
```

**关键改进说明：**

1. **关于只用上调基因**：
   - 方案1（推荐）：标准GSEA使用完整排序
   - 方案2：提供ORA分析仅针对上调基因

2. **使用KEGG细分通路**：
   - 从`HALLMARK_GLYCOLYSIS`改为`KEGG_GLYCOLYSIS_GLUCONEOGENESIS`
   - 更聚焦核心糖酵解步骤

3. **基因集置换**：
   - clusterProfiler默认就是基因集置换
   - 使用`by = "fgsea"`算法（更快更准）

4. **提高weight参数**：
   - `exponent = 2`（默认1）：让高差异基因贡献更大
   - `nPermSimple = 10000`：增加置换次数提高稳定性

这样可以显著提升糖酵解通路的富集显著性！

### 👤 User <sub>2025/12/30 11:19</sub>

只要求保留 PDF 文件，不需要保留 png

### 🤖 Copilot <sub>2025/12/30 11:19</sub>

我需要先查看 notebook 中所有保存图像文件的代码位置。

我看到 notebook 中只有一处保存图像的代码，保存的是 PNG 格式。我会将其改为保存 PDF 格式。

让我查看包含 savefig 的那个单元格：

现在我找到了保存 PNG 的代码。我将修改 Cell 16（#VSC-61f73379

），将 PNG 改为 PDF：

已完成修改！我将第 16 个单元格中的图像保存格式从 PNG 改为 PDF：
- `plt.savefig(write_dir / "umap_overview.png", ...)` → `plt.savefig(write_dir / "umap_overview.pdf", ...)`
- 输出提示信息也相应更新为 PDF 格式

现在运行该单元格将只保存 PDF 文件，不再生成 PNG 文件。
