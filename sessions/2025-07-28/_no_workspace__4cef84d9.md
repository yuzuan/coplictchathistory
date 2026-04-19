# 提取其中的 R代码，形成 rmd 格式

| Field | Value |
|-------|-------|
| Session ID | `4cef84d9-64c4-4dc2-b876-d5b7f0133f5b` |
| Workspace | (no workspace) |
| Start | 2025/07/28 17:45 |
| End | 2025/07/29 00:19 |
| Messages | 2 |

---

### 👤 User <sub>2025/07/29 00:19</sub>

提取其中的 R代码，形成 rmd 格式

### 🤖 Copilot <sub>2025/07/29 00:19</sub>

以下是从你提供的内容中提取的R代码，并整理为R Markdown（.Rmd）格式，方便你直接用于分析或复现：

```
---
title: "GEO数据基因注释（GPL17586）转换为gene symbol"
output: html_document
---

# 1. 提取基因标志
```

{r}
rawFile = "D:/Desktop/GPL17586_annoT.txt"
annoT = data.table::fread(rawFile, data.table = FALSE)
SYMBOL = sapply(strsplit(a[, 8], "[/ ]"), function(x) x[5])
head(SYMBOL)
table(SYMBOL)[order(table(SYMBOL), decreasing = T)][1:20]

sum(grepl("LOC", SYMBOL))
sum(grepl("OTTHUMG", SYMBOL))
sum(is.na(SYMBOL))
table(SYMBOL == "---")
sum(grepl("00000", SYMBOL))

```

# 2. ID转换
```

{r}
ref_gene = sapply(strsplit(readLines("hg19_protein_SYMBOL.txt"), " "), function(x) x[2])
inter_gene = intersect(SYMBOL, ref_gene)
str(inter_gene)

```

# 3. 替换与保存
```

{r}
annoT = cbind(gene_name = SYMBOL, annoT)
save(annoT, file = "RData/GPL17586_aanoT.RData")

```

# 4. 取子集
```

{r}
xexpM = expM[gene_name %in% ref_gene, ]
xgene_name = gene_name[gene_name %in% ref_gene]
hd(xexpM); hd(xgene_name)

```

# 5. 合并基因（去重取均值）
```

{r}
xexpM2 = aggregate(xexpM, by = list(xgene_name), mean)
rownames(xexpM2) = xexpM2[, 1]; xexpM2[, 1] = NULL
hd(xexpM2)

```

# 6. 另一种注释方法（分列提取symbol）
```

{r}
GPL17586 <- read.table("D:/data/GEO/platform/GPL17586-45144.txt",
                       sep = '\t',quote = "",fill = T,comment.char = "#",
                       header = T,stringsAsFactors = F)
probe2gene <- GPL17586[,c(2,8)]
head(probe2gene)

library(stringr)  
probe2gene$symbol <- trimws(str_split(probe2gene$gene_assignment,'//',simplify = T)[,2])
head(probe2gene)
ids2 <- probe2gene[,c(1,3)]
ids2[1:20,1:2] # 含有缺失值
table(table(unique(ids2$symbol))) # 30907 ,30906个基因，一个空字符
```
如需进一步美化或补充注释可告知！如需进一步美化或补充注释可告知！
