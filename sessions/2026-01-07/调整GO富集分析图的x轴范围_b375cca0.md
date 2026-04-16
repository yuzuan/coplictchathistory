# p_go_dot <- dotplot(ego_all,                      showCategory = 10,         ...

| Field | Value |
|-------|-------|
| Session ID | `b375cca0-ddb4-4d8a-b422-35673c28e0b4` |
| Workspace | 调整GO富集分析图的x轴范围 |
| Start | 2026/01/07 16:59 |
| End | 2026/01/07 17:08 |
| Messages | 6 |

---

### 👤 User <sub>2026/01/07 17:00</sub>

p_go_dot <- dotplot(ego_all, 
                    showCategory = 10, 
                    split = "ONTOLOGY",
                    font.size = 10) +
    facet_grid(ONTOLOGY ~ ., scales = "free") +
    labs(title = "GO Enrichment Analysis") +
    theme(plot.title = element_text(hjust = 0.5))

print(p_go_dot)
ggsave(file.path(out_dir, "GO_dotplot.pdf"), p_go_dot, width = 10, height = 12)现在这个图中间太空了，缩小一点刻度

### 🤖 Copilot <sub>2026/01/07 17:00</sub>

看到您的图中x轴(GeneRatio)范围较大导致中间留白过多。可以通过调整x轴范围来压缩图形:

```r
p_go_dot <- dotplot(ego_all, 
                    showCategory = 10, 
                    split = "ONTOLOGY",
                    font.size = 10) +
    facet_grid(ONTOLOGY ~ ., scales = "free") +
    scale_x_continuous(limits = c(0.06, 0.14)) +  # 调整x轴范围
    labs(title = "GO Enrichment Analysis") +
    theme(plot.title = element_text(hjust = 0.5))

print(p_go_dot)
ggsave(file.path(out_dir, "GO_dotplot.pdf"), p_go_dot, width = 10, height = 12)
```

或者让x轴自动适应数据范围,去除多余空白:

```r
p_go_dot <- dotplot(ego_all, 
                    showCategory = 10, 
                    split = "ONTOLOGY",
                    font.size = 10) +
    facet_grid(ONTOLOGY ~ ., scales = "free") +
    scale_x_continuous(expand = expansion(mult = c(0.05, 0.1))) +  # 减少边距
    labs(title = "GO Enrichment Analysis") +
    theme(plot.title = element_text(hjust = 0.5))

print(p_go_dot)
ggsave(file.path(out_dir, "GO_dotplot.pdf"), p_go_dot, width = 10, height = 12)
```

第二种方法使用 `expand` 参数减少x轴两端的留白,会根据实际数据自动调整,通常效果更好。

### 👤 User <sub>2026/01/07 17:02</sub>

直接 0。06。0。12，0。18 这种呢

### 🤖 Copilot <sub>2026/01/07 17:02</sub>

```r
p_go_dot <- dotplot(ego_all, 
                    showCategory = 10, 
                    split = "ONTOLOGY",
                    font.size = 10) +
    facet_grid(ONTOLOGY ~ ., scales = "free") +
    scale_x_continuous(breaks = c(0.06, 0.12, 0.18)) +
    labs(title = "GO Enrichment Analysis") +
    theme(plot.title = element_text(hjust = 0.5))

print(p_go_dot)
ggsave(file.path(out_dir, "GO_dotplot.pdf"), p_go_dot, width = 10, height = 12)
```

这样会将x轴刻度固定为0.06、0.12、0.18三个点,图形会更紧凑。

### 👤 User <sub>2026/01/07 17:08</sub>

p_volcano <- ggplot(data_clean, aes(x = log2FC, y = -log10(P), color = change)) +
    geom_point(alpha = 0.6, size = 2) +
    scale_color_manual(values = c("Up" = "#E41A1C", "Down" = "#377EB8", "Not Sig" = "grey70")) +
    geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "black") +
    geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "black") +
    theme_bw(base_size = 14) +
    labs(x = "log2 Fold Change", 
         y = "-log10(P value)", 
         title = "Volcano Plot: AC8 vs Control",
         color = "Expression") +
    theme(plot.title = element_text(hjust = 0.5, face = "bold"),
          legend.position = "right") +
    geom_text_repel(data = top_genes,
                    aes(label = Gene),
                    size = 3,
                    max.overlaps = 20,
                    show.legend = FALSE)

print(p_volcano)
ggsave("volcano_plot.pdf", p_volcano, width = 10, height = 8)
火山图的 X 轴范围改为-5 到 5

### 🤖 Copilot <sub>2026/01/07 17:08</sub>

```r
p_volcano <- ggplot(data_clean, aes(x = log2FC, y = -log10(P), color = change)) +
    geom_point(alpha = 0.6, size = 2) +
    scale_color_manual(values = c("Up" = "#E41A1C", "Down" = "#377EB8", "Not Sig" = "grey70")) +
    scale_x_continuous(limits = c(-5, 5)) +
    geom_hline(yintercept = -log10(0.05), linetype = "dashed", color = "black") +
    geom_vline(xintercept = c(-1, 1), linetype = "dashed", color = "black") +
    theme_bw(base_size = 14) +
    labs(x = "log2 Fold Change", 
         y = "-log10(P value)", 
         title = "Volcano Plot: AC8 vs Control",
         color = "Expression") +
    theme(plot.title = element_text(hjust = 0.5, face = "bold"),
          legend.position = "right") +
    geom_text_repel(data = top_genes,
                    aes(label = Gene),
                    size = 3,
                    max.overlaps = 20,
                    show.legend = FALSE)

print(p_volcano)
ggsave("volcano_plot.pdf", p_volcano, width = 10, height = 8)
```

添加了 `scale_x_continuous(limits = c(-5, 5))` 来设置x轴范围为-5到5。
