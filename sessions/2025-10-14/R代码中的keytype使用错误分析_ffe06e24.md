# library(org.Hs.eg.db) library(AnnotationDbi) library(dplyr) anno <- data.fram...

| Field | Value |
|-------|-------|
| Session ID | `ffe06e24-887c-4446-9291-4c6dc76df84c` |
| Workspace | R代码中的keytype使用错误分析 |
| Start | 2025/10/14 18:40 |
| End | 2025/10/14 18:54 |
| Messages | 16 |

---

### 👤 User <sub>2025/10/14 18:40</sub>

library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)
anno <- data.frame(ID = rownames(expr), stringsAsFactors = FALSE)
anno$ID <- sub("\\..*", "", anno$ID)

gene_map <- mapIds(org.Hs.eg.db, keys = anno$ID, column = "SYMBOL",
                   keytype = "ENSEMBLTRANS", multiVals = "first")

anno$symbol <- gene_map[anno$ID]这个代码有什么逻辑问题

### 🤖 Copilot <sub>2025/10/14 18:40</sub>

我来分析这段代码的逻辑问题:

## 主要逻辑问题

### 1. **关键类型（keytype）使用错误**
```r
gene_map <- mapIds(org.Hs.eg.db, keys = anno$ID, column = "SYMBOL",
                   keytype = "ENSEMBLTRANS", multiVals = "first")
```

**问题：** 使用了 `ENSEMBLTRANS`（Ensembl转录本ID）作为 keytype，但从代码上下文看：
- `anno$ID <- sub("\\..*", "", anno$ID)` 这行代码移除了点号后面的内容
- 这通常是处理 **Ensembl基因ID**（格式如 `ENSG00000000003.14` → `ENSG00000000003`）的操作
- 而不是转录本ID（格式如 `ENST00000000003`）

**应该使用：** `keytype = "ENSEMBL"`（Ensembl基因ID）

### 2. **ID匹配逻辑不一致**
```r
anno$symbol <- gene_map[anno$ID]
```

**问题：** `gene_map` 的 names 是原始的 keys（即 `anno$ID`），这个赋值本身是正确的，但前提是 keytype 要正确。

## 修正后的代码

```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

anno <- data.frame(ID = rownames(expr), stringsAsFactors = FALSE)
# 移除版本号（点号后的内容）
anno$ID <- sub("\\..*", "", anno$ID)

# 修正：使用 ENSEMBL 而不是 ENSEMBLTRANS
gene_map <- mapIds(org.Hs.eg.db, 
                   keys = anno$ID, 
                   column = "SYMBOL",
                   keytype = "ENSEMBL",  # 改为 ENSEMBL
                   multiVals = "first")

anno$symbol <- gene_map[anno$ID]
```

## 如何判断应该使用哪个 keytype？

查看你的 ID 格式：
- **ENSG** 开头 → 使用 `keytype = "ENSEMBL"`（基因ID）
- **ENST** 开头 → 使用 `keytype = "ENSEMBLTRANS"`（转录本ID）
- **ENSP** 开头 → 使用 `keytype = "ENSEMBLPROT"`（蛋白质ID）

你可以运行以下代码检查可用的 keytypes：
```r
keytypes(org.Hs.eg.db)
```

或者查看你的数据：
```r
head(rownames(expr))
```

这样就能确定正确的 keytype 了。

### 👤 User <sub>2025/10/14 18:41</sub>

ENST 开头 → 使用 keytype = "ENSEMBLTRANS"（转录本ID）

### 🤖 Copilot <sub>2025/10/14 18:41</sub>

明白了！如果您的数据确实是 **ENST 开头**的转录本ID，那么使用 `keytype = "ENSEMBLTRANS"` 是正确的。

但这段代码仍然存在一个**潜在的逻辑问题**：

## 问题：一个转录本ID对应一个基因符号，但一个基因可能有多个转录本

```r
gene_map <- mapIds(org.Hs.eg.db, keys = anno$ID, column = "SYMBOL",
                   keytype = "ENSEMBLTRANS", multiVals = "first")
```

**逻辑问题：**
- 使用 `multiVals = "first"` 时，如果一个转录本ID映射到多个基因符号（理论上不应该，但数据库可能有异常情况），只会返回第一个
- 更重要的是，**多个不同的转录本ID可能映射到同一个基因符号**

## 建议的改进

### 1. **检查映射结果**
```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

anno <- data.frame(ID = rownames(expr), stringsAsFactors = FALSE)
anno$ID <- sub("\\..*", "", anno$ID)

gene_map <- mapIds(org.Hs.eg.db, 
                   keys = anno$ID, 
                   column = "SYMBOL",
                   keytype = "ENSEMBLTRANS", 
                   multiVals = "first")

anno$symbol <- gene_map[anno$ID]

# 检查有多少ID没有映射成功
sum(is.na(anno$symbol))
```

### 2. **如果需要基因水平的分析**
如果您最终需要在基因水平分析（而不是转录本水平），建议：

```r
# 先映射到基因符号
anno$symbol <- gene_map[anno$ID]

# 对重复的基因符号进行处理（例如：取平均值、最大值等）
expr_gene <- expr %>%
  as.data.frame() %>%
  mutate(symbol = anno$symbol) %>%
  filter(!is.na(symbol)) %>%
  group_by(symbol) %>%
  summarise(across(everything(), mean))  # 或使用 max, median 等
```

### 3. **更稳健的写法**
```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

anno <- data.frame(ID = rownames(expr), stringsAsFactors = FALSE)
# 保存原始ID
anno$original_ID <- anno$ID
# 移除版本号
anno$ID <- sub("\\..*", "", anno$ID)

# 映射到基因符号
gene_map <- mapIds(org.Hs.eg.db, 
                   keys = anno$ID, 
                   column = "SYMBOL",
                   keytype = "ENSEMBLTRANS", 
                   multiVals = "first")

anno$symbol <- gene_map[anno$ID]

# 查看映射情况
cat("总转录本数:", nrow(anno), "\n")
cat("成功映射数:", sum(!is.na(anno$symbol)), "\n")
cat("未映射数:", sum(is.na(anno$symbol)), "\n")
cat("唯一基因数:", length(unique(anno$symbol[!is.na(anno$symbol)])), "\n")
```

所以原代码在**keytype使用上是正确的**（假设数据是ENST开头），但需要注意：
1. 是否有未映射的转录本
2. 多个转录本映射到同一基因的处理策略

### 👤 User <sub>2025/10/14 18:42</sub>

 查看映射情况
> cat("总转录本数:", nrow(anno), "\n")
总转录本数: 187697 
> cat("成功映射数:", sum(!is.na(anno$symbol)), "\n")
成功映射数: 14570 
> cat("未映射数:", sum(is.na(anno$symbol)), "\n")
未映射数: 173127 
> cat("唯一基因数:", length(unique(anno$symbol[!is.na(anno$symbol)])), "\n")
唯一基因数: 5397 

### 🤖 Copilot <sub>2025/10/14 18:42</sub>

看到这个映射结果，有**严重的问题**！

## 问题分析

```
总转录本数: 187,697
成功映射数: 14,570 (仅 7.8%)
未映射数: 173,127 (92.2% 失败！)
唯一基因数: 5,397
```

**92.2% 的转录本ID无法映射**，这不正常！可能的原因：

### 1. **ID 格式问题**
让我们检查一下您的ID实际格式：

```r
# 查看原始ID的前几个
head(rownames(expr), 20)

# 查看处理后的ID
head(anno$ID, 20)

# 查看未映射的ID示例
head(anno$ID[is.na(anno$symbol)], 20)

# 查看成功映射的ID示例
head(anno$ID[!is.na(anno$symbol)], 20)
```

### 2. **可能的原因和解决方案**

#### 原因A：ID 不是标准的 Ensembl 转录本ID
```r
# 检查ID是否真的是ENST开头
table(substr(anno$ID, 1, 4))
```

#### 原因B：版本号处理问题
```r
# 尝试不移除版本号
gene_map_with_version <- mapIds(org.Hs.eg.db, 
                                keys = rownames(expr),  # 使用原始ID
                                column = "SYMBOL",
                                keytype = "ENSEMBLTRANS", 
                                multiVals = "first")
sum(!is.na(gene_map_with_version))
```

#### 原因C：数据库版本不匹配
```r
# 检查 org.Hs.eg.db 数据库信息
org.Hs.eg.db

# 查看支持的 keytype
keytypes(org.Hs.eg.db)

# 检查数据库中有多少 ENSEMBLTRANS
length(keys(org.Hs.eg.db, keytype = "ENSEMBLTRANS"))
```

### 3. **替代解决方案**

#### 方案1：使用 biomaRt（推荐）
```r
library(biomaRt)

# 连接到 Ensembl 数据库
ensembl <- useEnsembl(biomart = "genes", dataset = "hsapiens_gene_ensembl")

# 查看原始ID格式
head(rownames(expr))

# 根据ID格式选择对应的filter
# 如果是 ENST 开头（转录本ID）
gene_map_biomart <- getBM(
  attributes = c('ensembl_transcript_id', 'hgnc_symbol'),
  filters = 'ensembl_transcript_id',
  values = sub("\\..*", "", rownames(expr)),
  mart = ensembl
)

# 合并到 anno
anno <- anno %>%
  left_join(gene_map_biomart, 
            by = c("ID" = "ensembl_transcript_id")) %>%
  rename(symbol = hgnc_symbol)

# 查看新的映射情况
cat("成功映射数:", sum(!is.na(anno$symbol)), "\n")
```

#### 方案2：检查是否应该用其他 keytype
```r
# 如果ID实际是基因ID（ENSG开头）
gene_map_gene <- mapIds(org.Hs.eg.db, 
                        keys = anno$ID, 
                        column = "SYMBOL",
                        keytype = "ENSEMBL",  # 改用 ENSEMBL
                        multiVals = "first")
sum(!is.na(gene_map_gene))

# 或者尝试 REFSEQ
gene_map_refseq <- mapIds(org.Hs.eg.db, 
                          keys = anno$ID, 
                          column = "SYMBOL",
                          keytype = "REFSEQ",
                          multiVals = "first")
sum(!is.na(gene_map_refseq))
```

### 4. **诊断脚本（请运行）**

```r
# 完整诊断
cat("=== ID 格式诊断 ===\n")
cat("原始ID示例:\n")
print(head(rownames(expr), 10))

cat("\n处理后ID示例:\n")
print(head(anno$ID, 10))

cat("\nID前缀统计:\n")
print(table(substr(anno$ID, 1, 4)))

cat("\n=== 数据库信息 ===\n")
cat("org.Hs.eg.db 中的 ENSEMBLTRANS 数量:", 
    length(keys(org.Hs.eg.db, keytype = "ENSEMBLTRANS")), "\n")

cat("\n成功映射的ID示例:\n")
print(head(anno$ID[!is.na(anno$symbol)], 10))

cat("\n失败映射的ID示例:\n")
print(head(anno$ID[is.na(anno$symbol)], 10))
```

请运行这个诊断脚本，把结果发给我，我可以帮您确定确切的问题和解决方案！

### 👤 User <sub>2025/10/14 18:43</sub>

table(substr(anno$ID, 1, 4))

  ENST   MSTR 
168864  18833 

### 🤖 Copilot <sub>2025/10/14 18:43</sub>

找到问题了！

## 问题所在

您的数据中有**两种类型的ID**：
- **ENST**（168,864个）：Ensembl 转录本ID
- **MSTR**（18,833个）：MiTranscriptome 转录本ID（非编码RNA/新转录本）

`org.Hs.eg.db` **不支持 MSTR ID**，这就是为什么大量ID无法映射！

## 解决方案

### 方案1：分别处理两种ID（推荐）

```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

anno <- data.frame(ID = rownames(expr), stringsAsFactors = FALSE)
anno$ID <- sub("\\..*", "", anno$ID)

# 识别ID类型
anno$ID_type <- substr(anno$ID, 1, 4)

# 只对 ENST 开头的ID进行映射
enst_ids <- anno$ID[anno$ID_type == "ENST"]
gene_map <- mapIds(org.Hs.eg.db, 
                   keys = enst_ids, 
                   column = "SYMBOL",
                   keytype = "ENSEMBLTRANS", 
                   multiVals = "first")

# 初始化 symbol 列
anno$symbol <- NA

# 填充 ENST 的映射结果
anno$symbol[anno$ID_type == "ENST"] <- gene_map[enst_ids]

# 对于 MSTR，保留原ID或标记为未知
anno$symbol[anno$ID_type == "MSTR" & is.na(anno$symbol)] <- 
  paste0("MSTR_", anno$ID[anno$ID_type == "MSTR" & is.na(anno$symbol)])

# 查看映射情况
cat("=== 映射结果统计 ===\n")
cat("ENST 总数:", sum(anno$ID_type == "ENST"), "\n")
cat("ENST 成功映射:", sum(!is.na(anno$symbol) & anno$ID_type == "ENST" & 
                          !grepl("^MSTR_", anno$symbol)), "\n")
cat("MSTR 总数:", sum(anno$ID_type == "MSTR"), "\n")
cat("唯一基因符号数:", length(unique(anno$symbol[!grepl("^MSTR_", anno$symbol)])), "\n")
```

### 方案2：使用 biomaRt 提高 ENST 映射率

```r
library(biomaRt)
library(dplyr)

anno <- data.frame(ID = rownames(expr), stringsAsFactors = FALSE)
anno$ID <- sub("\\..*", "", anno$ID)
anno$ID_type <- substr(anno$ID, 1, 4)

# 使用 biomaRt 映射 ENST
ensembl <- useEnsembl(biomart = "genes", 
                      dataset = "hsapiens_gene_ensembl")

enst_ids <- anno$ID[anno$ID_type == "ENST"]

gene_map_biomart <- getBM(
  attributes = c('ensembl_transcript_id', 'hgnc_symbol', 'gene_biotype'),
  filters = 'ensembl_transcript_id',
  values = enst_ids,
  mart = ensembl
)

# 合并结果
anno <- anno %>%
  left_join(gene_map_biomart, 
            by = c("ID" = "ensembl_transcript_id"))

# 对于 MSTR，保留原ID
anno$symbol <- ifelse(is.na(anno$hgnc_symbol) & anno$ID_type == "MSTR",
                      paste0("MSTR_", anno$ID),
                      anno$hgnc_symbol)

# 查看结果
cat("ENST 映射成功:", sum(!is.na(anno$hgnc_symbol) & anno$ID_type == "ENST"), "\n")
cat("MSTR 保留为原ID:", sum(anno$ID_type == "MSTR"), "\n")
```

### 方案3：过滤掉 MSTR（如果不需要）

```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

anno <- data.frame(ID = rownames(expr), stringsAsFactors = FALSE)
anno$ID <- sub("\\..*", "", anno$ID)

# 只保留 ENST 开头的转录本
anno <- anno %>%
  filter(substr(ID, 1, 4) == "ENST")

# 同时过滤表达矩阵
expr_filtered <- expr[substr(sub("\\..*", "", rownames(expr)), 1, 4) == "ENST", ]

# 映射
gene_map <- mapIds(org.Hs.eg.db, 
                   keys = anno$ID, 
                   column = "SYMBOL",
                   keytype = "ENSEMBLTRANS", 
                   multiVals = "first")

anno$symbol <- gene_map[anno$ID]

cat("过滤后转录本数:", nrow(anno), "\n")
cat("成功映射数:", sum(!is.na(anno$symbol)), "\n")
cat("映射成功率:", round(sum(!is.na(anno$symbol))/nrow(anno)*100, 2), "%\n")
```

## 关于 MSTR ID

**MSTR** 是 [MiTranscriptome](http://mitranscriptome.org/) 数据库的ID，代表：
- 新发现的转录本
- 非编码RNA
- 未在 Ensembl 中注释的转录本

如果需要保留这些ID，建议：
1. 保留原始 MSTR ID作为标识
2. 或者访问 MiTranscriptome 数据库获取注释

**推荐使用方案1**，这样既能映射 ENST，又能保留 MSTR 信息。

### 👤 User <sub>2025/10/14 18:44</sub>

对于 MSTR，直接删除

### 🤖 Copilot <sub>2025/10/14 18:44</sub>

好的！直接删除 MSTR ID，只保留 ENST 转录本。以下是完整代码：

```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

# 1. 先过滤表达矩阵，只保留 ENST 开头的转录本
enst_mask <- substr(sub("\\..*", "", rownames(expr)), 1, 4) == "ENST"
expr <- expr[enst_mask, ]

# 2. 创建注释表
anno <- data.frame(ID = rownames(expr), stringsAsFactors = FALSE)
anno$ID <- sub("\\..*", "", anno$ID)

# 3. 映射到基因符号
gene_map <- mapIds(org.Hs.eg.db, 
                   keys = anno$ID, 
                   column = "SYMBOL",
                   keytype = "ENSEMBLTRANS", 
                   multiVals = "first")

anno$symbol <- gene_map[anno$ID]

# 4. 查看映射情况
cat("=== 过滤和映射结果 ===\n")
cat("保留的转录本数:", nrow(anno), "\n")
cat("成功映射数:", sum(!is.na(anno$symbol)), "\n")
cat("未映射数:", sum(is.na(anno$symbol)), "\n")
cat("映射成功率:", round(sum(!is.na(anno$symbol))/nrow(anno)*100, 2), "%\n")
cat("唯一基因数:", length(unique(anno$symbol[!is.na(anno$symbol)])), "\n")
```

## 简洁版（如果确定要删除MSTR）

```r
library(org.Hs.eg.db)
library(AnnotationDbi)

# 过滤：只保留 ENST 转录本
expr <- expr[substr(sub("\\..*", "", rownames(expr)), 1, 4) == "ENST", ]

# 创建注释并映射
anno <- data.frame(ID = sub("\\..*", "", rownames(expr)), 
                   stringsAsFactors = FALSE)

gene_map <- mapIds(org.Hs.eg.db, 
                   keys = anno$ID, 
                   column = "SYMBOL",
                   keytype = "ENSEMBLTRANS", 
                   multiVals = "first")

anno$symbol <- gene_map[anno$ID]

# 查看结果
cat("转录本数:", nrow(anno), "| 成功映射:", sum(!is.na(anno$symbol)), 
    "| 成功率:", round(sum(!is.na(anno$symbol))/nrow(anno)*100, 1), "%\n")
```

这样处理后：
- ✅ 删除了所有 18,833 个 MSTR ID
- ✅ 只保留 168,864 个 ENST ID
- ✅ 映射成功率会显著提高（预计从 7.8% 提升到约 8.6%）

运行后请告诉我映射成功率，如果还是很低，我们需要用 biomaRt 来提高映射率！

### 👤 User <sub>2025/10/14 18:51</sub>

expr的行名带后缀的 ENST，现在要求转成基因，重复的基因取平均值

### 🤖 Copilot <sub>2025/10/14 18:51</sub>

好的！完整流程：过滤MSTR → 映射到基因符号 → 处理重复基因（取平均值）

```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

# 1. 过滤：只保留 ENST 转录本
enst_mask <- substr(sub("\\..*", "", rownames(expr)), 1, 4) == "ENST"
expr <- expr[enst_mask, ]

# 2. 创建注释并映射到基因符号
anno <- data.frame(
  transcript_id = rownames(expr),
  ensembl_id = sub("\\..*", "", rownames(expr)),
  stringsAsFactors = FALSE
)

gene_map <- mapIds(org.Hs.eg.db, 
                   keys = anno$ensembl_id, 
                   column = "SYMBOL",
                   keytype = "ENSEMBLTRANS", 
                   multiVals = "first")

anno$symbol <- gene_map[anno$ensembl_id]

# 3. 移除无法映射的转录本
expr <- expr[!is.na(anno$symbol), ]
anno <- anno[!is.na(anno$symbol), ]

cat("成功映射的转录本数:", nrow(anno), "\n")
cat("唯一基因数:", length(unique(anno$symbol)), "\n")

# 4. 转换为基因水平：对重复基因取平均值
expr_gene <- expr %>%
  as.data.frame() %>%
  mutate(symbol = anno$symbol) %>%
  group_by(symbol) %>%
  summarise(across(everything(), mean)) %>%
  as.data.frame()

# 5. 设置基因符号为行名
rownames(expr_gene) <- expr_gene$symbol
expr_gene <- expr_gene[, -1]  # 移除 symbol 列

# 6. 查看结果
cat("最终基因表达矩阵维度:", nrow(expr_gene), "genes ×", ncol(expr_gene), "samples\n")
cat("前几个基因:\n")
print(head(rownames(expr_gene)))
```

## 方案2：使用更简洁的代码

```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

# 过滤 ENST + 映射基因符号
enst_mask <- grepl("^ENST", rownames(expr))
expr <- expr[enst_mask, ]

gene_map <- mapIds(
  org.Hs.eg.db,
  keys = sub("\\..*", "", rownames(expr)),
  column = "SYMBOL",
  keytype = "ENSEMBLTRANS",
  multiVals = "first"
)

# 转换为基因水平（取平均值）
expr_gene <- expr %>%
  as.data.frame() %>%
  mutate(gene = gene_map) %>%
  filter(!is.na(gene)) %>%
  group_by(gene) %>%
  summarise(across(where(is.numeric), mean)) %>%
  column_to_rownames("gene") %>%
  as.matrix()  # 如果需要保持矩阵格式

cat("转录本 → 基因转换完成\n")
cat("基因数:", nrow(expr_gene), "| 样本数:", ncol(expr_gene), "\n")
```

## 方案3：如果想用其他聚合方法

```r
# 取中位数
expr_gene <- expr %>%
  as.data.frame() %>%
  mutate(gene = gene_map) %>%
  filter(!is.na(gene)) %>%
  group_by(gene) %>%
  summarise(across(where(is.numeric), median)) %>%
  column_to_rownames("gene")

# 取最大值
expr_gene <- expr %>%
  as.data.frame() %>%
  mutate(gene = gene_map) %>%
  filter(!is.na(gene)) %>%
  group_by(gene) %>%
  summarise(across(where(is.numeric), max)) %>%
  column_to_rownames("gene")

# 取表达量最高的转录本
expr_gene <- expr %>%
  as.data.frame() %>%
  mutate(gene = gene_map,
         mean_expr = rowMeans(select(., where(is.numeric)))) %>%
  filter(!is.na(gene)) %>%
  group_by(gene) %>%
  slice_max(mean_expr, n = 1) %>%
  select(-gene, -mean_expr) %>%
  ungroup()
```

推荐使用**方案2（简洁版）**，它会：
1. ✅ 过滤掉 MSTR ID
2. ✅ 移除版本号
3. ✅ 映射到基因符号
4. ✅ 对重复基因取平均值
5. ✅ 返回基因水平的表达矩阵

### 👤 User <sub>2025/10/14 18:52</sub>

cat("转录本 → 基因转换完成\n")
转录本 → 基因转换完成
> cat("基因数:", nrow(expr_gene), "| 样本数:", ncol(expr_gene), "\n")```
Error: attempt to use zero-length variable name

### 🤖 Copilot <sub>2025/10/14 18:52</sub>

这个错误是因为在使用 `cat()` 时，变量名中包含了管道符 `|`，R 误解析了。修正代码：

```r
# 正确的写法：使用引号包裹管道符
cat("基因数:", nrow(expr_gene), "样本数:", ncol(expr_gene), "\n")

# 或者分开写
cat("基因数:", nrow(expr_gene), "\n")
cat("样本数:", ncol(expr_gene), "\n")
```

## 完整的修正代码

```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

# 过滤 ENST + 映射基因符号
enst_mask <- grepl("^ENST", rownames(expr))
expr <- expr[enst_mask, ]

gene_map <- mapIds(
  org.Hs.eg.db,
  keys = sub("\\..*", "", rownames(expr)),
  column = "SYMBOL",
  keytype = "ENSEMBLTRANS",
  multiVals = "first"
)

# 转换为基因水平（取平均值）
expr_gene <- expr %>%
  as.data.frame() %>%
  mutate(gene = gene_map) %>%
  filter(!is.na(gene)) %>%
  group_by(gene) %>%
  summarise(across(where(is.numeric), mean)) %>%
  column_to_rownames("gene") %>%
  as.matrix()

# 查看结果
cat("转录本 → 基因转换完成\n")
cat("基因数:", nrow(expr_gene), "\n")
cat("样本数:", ncol(expr_gene), "\n")
cat("前5个基因:\n")
print(head(rownames(expr_gene), 5))
```

或者更简洁的输出：

```r
# 使用 paste 或 sprintf
cat(sprintf("基因数: %d, 样本数: %d\n", nrow(expr_gene), ncol(expr_gene)))

# 或者
cat("基因数:", nrow(expr_gene), ", 样本数:", ncol(expr_gene), "\n")
```

试试这个修正后的代码！

### 👤 User <sub>2025/10/14 18:54</sub>

cat("转录本 → 基因转换完成\n")
转录本 → 基因转换完成
> cat("基因数:", nrow(expr_gene), "| 样本数:", ncol(expr_gene), "\n")
基因数: 5397 | 样本数: 0 
> View(anno)

### 🤖 Copilot <sub>2025/10/14 18:54</sub>

问题找到了！**样本数为 0**，说明在转换过程中丢失了所有样本列。

这是因为 `across(where(is.numeric), mean)` 可能没有正确识别到数值列，或者列名有问题。

## 诊断和修正

### 先诊断一下原始数据：

```r
# 检查原始 expr 的结构
cat("原始 expr 维度:", dim(expr), "\n")
cat("原始 expr 类型:", class(expr), "\n")
cat("列名前5个:\n")
print(head(colnames(expr)))
cat("是否有数值列:", any(sapply(expr, is.numeric)), "\n")
```

### 修正方案1：使用 `across(everything())`

```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

# 过滤 ENST + 映射基因符号
enst_mask <- grepl("^ENST", rownames(expr))
expr <- expr[enst_mask, ]

gene_map <- mapIds(
  org.Hs.eg.db,
  keys = sub("\\..*", "", rownames(expr)),
  column = "SYMBOL",
  keytype = "ENSEMBLTRANS",
  multiVals = "first"
)

# 转换为基因水平（取平均值）
expr_gene <- expr %>%
  as.data.frame() %>%
  mutate(gene = gene_map) %>%
  filter(!is.na(gene)) %>%
  group_by(gene) %>%
  summarise(across(everything(), mean)) %>%  # 改为 everything()
  column_to_rownames("gene") %>%
  as.matrix()

cat("基因数:", nrow(expr_gene), ", 样本数:", ncol(expr_gene), "\n")
```

### 修正方案2：更明确的写法

```r
library(org.Hs.eg.db)
library(AnnotationDbi)
library(dplyr)

# 过滤 ENST
enst_mask <- grepl("^ENST", rownames(expr))
expr <- expr[enst_mask, ]

# 映射基因符号
gene_map <- mapIds(
  org.Hs.eg.db,
  keys = sub("\\..*", "", rownames(expr)),
  column = "SYMBOL",
  keytype = "ENSEMBLTRANS",
  multiVals = "first"
)

# 添加基因列
expr_df <- as.data.frame(expr)
expr_df$gene <- gene_map

# 移除无法映射的行
expr_df <- expr_df[!is.na(expr_df$gene), ]

# 按基因分组取平均
expr_gene <- expr_df %>%
  group_by(gene) %>%
  summarise(across(-gene, mean)) %>%  # 对除 gene 外的所有列取平均
  column_to_rownames("gene") %>%
  as.matrix()

cat("基因数:", nrow(expr_gene), ", 样本数:", ncol(expr_gene), "\n")
```

### 修正方案3：不使用 dplyr（最稳妥）

```r
library(org.Hs.eg.db)
library(AnnotationDbi)

# 过滤 ENST
enst_mask <- grepl("^ENST", rownames(expr))
expr <- expr[enst_mask, ]

# 映射基因符号
gene_map <- mapIds(
  org.Hs.eg.db,
  keys = sub("\\..*", "", rownames(expr)),
  column = "SYMBOL",
  keytype = "ENSEMBLTRANS",
  multiVals = "first"
)

# 移除无法映射的行
keep <- !is.na(gene_map)
expr <- expr[keep, ]
gene_map <- gene_map[keep]

# 按基因聚合（取平均值）
expr_gene <- do.call(rbind, lapply(split(as.data.frame(expr), gene_map), colMeans))

cat("基因数:", nrow(expr_gene), ", 样本数:", ncol(expr_gene), "\n")
head(rownames(expr_gene))
```

### 修正方案4：使用 aggregate（简单高效）

```r
library(org.Hs.eg.db)
library(AnnotationDbi)

# 过滤 ENST
enst_mask <- grepl("^ENST", rownames(expr))
expr <- expr[enst_mask, ]

# 映射基因符号
gene_map <- mapIds(
  org.Hs.eg.db,
  keys = sub("\\..*", "", rownames(expr)),
  column = "SYMBOL",
  keytype = "ENSEMBLTRANS",
  multiVals = "first"
)

# 移除无法映射的行
keep <- !is.na(gene_map)
expr <- expr[keep, ]
genes <- gene_map[keep]

# 使用 aggregate 按基因取平均
expr_gene <- aggregate(expr, by = list(gene = genes), FUN = mean)
rownames(expr_gene) <- expr_gene$gene
expr_gene <- expr_gene[, -1]  # 移除 gene 列
expr_gene <- as.matrix(expr_gene)

cat("基因数:", nrow(expr_gene), ", 样本数:", ncol(expr_gene), "\n")
```

**推荐使用方案3或方案4**，它们不依赖 dplyr 的复杂逻辑，更稳定。

请先运行诊断代码看看原始数据结构，然后选择合适的修正方案！
