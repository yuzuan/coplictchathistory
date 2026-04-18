# 想把这个部分symbols <- mapIds( org.Rn.eg.db, keys = entrez_ids, keytype = "ENTREZID...

| Field | Value |
|-------|-------|
| Session ID | `18bb066d-82c7-4b23-86fb-ecdb08572b3a` |
| Workspace | 整合多种ID映射策略的R代码 |
| Start | 2026/01/06 10:40 |
| End | 2026/01/06 14:23 |
| Messages | 16 |

---

### 👤 User <sub>2026/01/06 10:41</sub>

想把这个部分symbols <- mapIds(
    org.Rn.eg.db,
    keys = entrez_ids,
    keytype = "ENTREZID",
    column = "SYMBOL",
    multiVals = "first"  # 如果一个ID对应多个Symbol，取第一个
)
也整合进library(AnnotationDbi)
library(org.Rn.eg.db)
library(org.Hs.eg.db)
anno <- data.frame(ID = rownames(exp))

symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                        keytype = "REFSEQ", multiVals = "first")

if (sum(!is.na(symbol_mapping)) < length(symbol_mapping) * 0.1) {
    symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                            keytype = "ENSEMBL", multiVals = "first")
}

### 🤖 Copilot <sub>2026/01/06 10:41</sub>

我理解了，您想将使用 `ENTREZID` 的 `mapIds` 调用也整合到现有的注释转换逻辑中。这样可以形成一个更完善的多重尝试策略：

```
library(AnnotationDbi)
library(org.Rn.eg.db)
library(org.Hs.eg.db)

anno <- data.frame(ID = rownames(exp))

# 策略1: 尝试 REFSEQ
symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                        keytype = "REFSEQ", multiVals = "first")

# 策略2: 如果 REFSEQ 匹配率低于10%，尝试 ENSEMBL
if (sum(!is.na(symbol_mapping)) < length(symbol_mapping) * 0.1) {
    symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                            keytype = "ENSEMBL", multiVals = "first")
}

# 策略3: 如果 ENSEMBL 匹配率仍然低于10%，尝试 ENTREZID
if (sum(!is.na(symbol_mapping)) < length(symbol_mapping) * 0.1) {
    symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                            keytype = "ENTREZID", multiVals = "first")
}
```

这样代码会按照 REFSEQ → ENSEMBL → ENTREZID 的顺序依次尝试，直到找到一个匹配率较高的 keytype。每个策略都使用 `multiVals = "first"` 来处理一对多的情况。

### 👤 User <sub>2026/01/06 10:42</sub>

除了这三种还有其他的吗

### 🤖 Copilot <sub>2026/01/06 10:42</sub>

是的，`org.Rn.eg.db` 还支持其他多种 keytype。可以查看所有可用的选项：

```
library(org.Rn.eg.db)
keytypes(org.Rn.eg.db)
```

常见的其他 keytype 包括：

- **ACCNUM** - GenBank 登录号
- **ALIAS** - 基因别名
- **ENSEMBLPROT** - Ensembl 蛋白质 ID
- **ENSEMBLTRANS** - Ensembl 转录本 ID
- **GENENAME** - 完整基因名称
- **UNIPROT** - UniProt ID
- **PROBEID** - 探针 ID（如果是芯片数据）
- **GO** - Gene Ontology ID
- **PATH** - KEGG 通路 ID

如果您的数据 ID 格式已知，可以添加更多策略：

```
# 策略4: 尝试 ENSEMBLTRANS (转录本)
if (sum(!is.na(symbol_mapping)) < length(symbol_mapping) * 0.1) {
    symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                            keytype = "ENSEMBLTRANS", multiVals = "first")
}

# 策略5: 尝试 ACCNUM (GenBank)
if (sum(!is.na(symbol_mapping)) < length(symbol_mapping) * 0.1) {
    symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                            keytype = "ACCNUM", multiVals = "first")
}
```

具体选择哪些 keytype 取决于您的 `rownames(exp)` 实际是什么格式的 ID。

### 👤 User <sub>2026/01/06 10:44</sub>

anno <- data.frame(ID = rownames(exp))
> 
> # 策略1: 尝试 REFSEQ
> symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
+                         keytype = "REFSEQ", multiVals = "first")
Error in .testForValidKeys(x, keys, keytype, fks) : 
  None of the keys entered are valid keys for 'REFSEQ'. Please use the keys method to see a listing of valid arguments.

### 🤖 Copilot <sub>2026/01/06 10:44</sub>

这个错误说明您的 ID 不是 REFSEQ 格式。需要先查看实际的 ID 格式来确定正确的 keytype：

```
# 查看前几个ID的格式
head(rownames(exp))

# 或者
head(anno$ID)
```

根据 ID 的格式特征来判断：

- **ENSEMBL**: 以 `ENSRNOG` 开头（大鼠基因）
- **ENSEMBLTRANS**: 以 `ENSRNOT` 开头（大鼠转录本）
- **REFSEQ**: 以 `NM_`, `NR_`, `XM_` 等开头
- **ENTREZID**: 纯数字，如 `12345`
- **SYMBOL**: 基因符号，如 `Actb`, `Gapdh`
- **ACCNUM**: GenBank 登录号

看到 ID 格式后，可以直接从合适的 keytype 开始：

```
library(AnnotationDbi)
library(org.Rn.eg.db)

anno <- data.frame(ID = rownames(exp))

# 根据实际格式选择起始策略
# 例如如果是 ENSRNOG 开头:
symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                        keytype = "ENSEMBL", multiVals = "first")

# 如果匹配率低，尝试其他格式
if (sum(!is.na(symbol_mapping)) < length(symbol_mapping) * 0.1) {
    symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                            keytype = "ENTREZID", multiVals = "first")
}

if (sum(!is.na(symbol_mapping)) < length(symbol_mapping) * 0.1) {
    symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                            keytype = "REFSEQ", multiVals = "first")
}
```

请先运行 `head(rownames(exp))` 看看 ID 格式，我可以帮您确定正确的策略顺序。

### 👤 User <sub>2026/01/06 10:45</sub>

能不能先出一个判断格式的

### 🤖 Copilot <sub>2026/01/06 10:45</sub>

可以，这里是一个自动判断ID格式的代码：

```
library(AnnotationDbi)
library(org.Rn.eg.db)

anno <- data.frame(ID = rownames(exp))

# 自动判断ID格式
detect_id_type <- function(ids) {
    # 取前几个非NA的ID进行判断
    sample_ids <- head(ids[!is.na(ids)], 10)
    
    if (length(sample_ids) == 0) return("UNKNOWN")
    
    # 检测各种格式
    if (any(grepl("^ENSRNOG[0-9]+$", sample_ids))) {
        return("ENSEMBL")
    } else if (any(grepl("^ENSRNOT[0-9]+$", sample_ids))) {
        return("ENSEMBLTRANS")
    } else if (any(grepl("^ENSRNOP[0-9]+$", sample_ids))) {
        return("ENSEMBLPROT")
    } else if (any(grepl("^(NM_|NR_|XM_|XR_)[0-9]+", sample_ids))) {
        return("REFSEQ")
    } else if (all(grepl("^[0-9]+$", sample_ids))) {
        return("ENTREZID")
    } else if (any(grepl("^[A-Z][A-Za-z0-9]+$", sample_ids))) {
        return("SYMBOL")
    } else {
        return("ACCNUM")  # 默认尝试 ACCNUM
    }
}

# 检测ID类型
detected_type <- detect_id_type(anno$ID)
cat("检测到的ID类型:", detected_type, "\n")

# 按检测结果设置尝试顺序
keytype_order <- switch(detected_type,
    "ENSEMBL" = c("ENSEMBL", "ENTREZID", "REFSEQ", "ACCNUM"),
    "ENSEMBLTRANS" = c("ENSEMBLTRANS", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "ENSEMBLPROT" = c("ENSEMBLPROT", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "REFSEQ" = c("REFSEQ", "ENSEMBL", "ENTREZID", "ACCNUM"),
    "ENTREZID" = c("ENTREZID", "ENSEMBL", "REFSEQ", "ACCNUM"),
    "SYMBOL" = c("SYMBOL", "ALIAS", "ENSEMBL", "ENTREZID"),
    c("ACCNUM", "ENSEMBL", "ENTREZID", "REFSEQ")  # 默认
)

# 依次尝试转换
symbol_mapping <- NULL
for (keytype in keytype_order) {
    tryCatch({
        cat("尝试使用 keytype:", keytype, "\n")
        symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                                keytype = keytype, multiVals = "first")
        match_rate <- sum(!is.na(symbol_mapping)) / length(symbol_mapping)
        cat("匹配率:", round(match_rate * 100, 2), "%\n")
        
        # 如果匹配率超过10%，就使用这个结果
        if (match_rate >= 0.1) {
            cat("使用 keytype:", keytype, "进行转换\n")
            break
        }
    }, error = function(e) {
        cat("keytype", keytype, "失败:", e$message, "\n")
    })
}

# 查看转换结果
cat("\n最终匹配率:", sum(!is.na(symbol_mapping)), "/", length(symbol_mapping), "\n")
```

这个代码会：
1. 自动检测ID格式
2. 根据检测结果设置最优的尝试顺序
3. 依次尝试直到找到匹配率>10%的结果
4. 显示每一步的尝试过程和匹配率

### 👤 User <sub>2026/01/06 10:47</sub>

也帮我来一个小鼠的

### 🤖 Copilot <sub>2026/01/06 10:47</sub>

好的，这是小鼠（Mus musculus）版本的代码：

```
library(AnnotationDbi)
library(org.Mm.eg.db)

anno <- data.frame(ID = rownames(exp))

# 自动判断ID格式（小鼠版本）
detect_id_type <- function(ids) {
    # 取前几个非NA的ID进行判断
    sample_ids <- head(ids[!is.na(ids)], 10)
    
    if (length(sample_ids) == 0) return("UNKNOWN")
    
    # 检测各种格式（小鼠）
    if (any(grepl("^ENSMUSG[0-9]+$", sample_ids))) {
        return("ENSEMBL")
    } else if (any(grepl("^ENSMUST[0-9]+$", sample_ids))) {
        return("ENSEMBLTRANS")
    } else if (any(grepl("^ENSMUSP[0-9]+$", sample_ids))) {
        return("ENSEMBLPROT")
    } else if (any(grepl("^(NM_|NR_|XM_|XR_)[0-9]+", sample_ids))) {
        return("REFSEQ")
    } else if (all(grepl("^[0-9]+$", sample_ids))) {
        return("ENTREZID")
    } else if (any(grepl("^[A-Z][A-Za-z0-9]+$", sample_ids))) {
        return("SYMBOL")
    } else {
        return("ACCNUM")  # 默认尝试 ACCNUM
    }
}

# 检测ID类型
detected_type <- detect_id_type(anno$ID)
cat("检测到的ID类型:", detected_type, "\n")

# 按检测结果设置尝试顺序
keytype_order <- switch(detected_type,
    "ENSEMBL" = c("ENSEMBL", "ENTREZID", "REFSEQ", "ACCNUM"),
    "ENSEMBLTRANS" = c("ENSEMBLTRANS", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "ENSEMBLPROT" = c("ENSEMBLPROT", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "REFSEQ" = c("REFSEQ", "ENSEMBL", "ENTREZID", "ACCNUM"),
    "ENTREZID" = c("ENTREZID", "ENSEMBL", "REFSEQ", "ACCNUM"),
    "SYMBOL" = c("SYMBOL", "ALIAS", "ENSEMBL", "ENTREZID"),
    c("ACCNUM", "ENSEMBL", "ENTREZID", "REFSEQ")  # 默认
)

# 依次尝试转换
symbol_mapping <- NULL
for (keytype in keytype_order) {
    tryCatch({
        cat("尝试使用 keytype:", keytype, "\n")
        symbol_mapping <- mapIds(org.Mm.eg.db, keys = anno$ID, column = "SYMBOL", 
                                keytype = keytype, multiVals = "first")
        match_rate <- sum(!is.na(symbol_mapping)) / length(symbol_mapping)
        cat("匹配率:", round(match_rate * 100, 2), "%\n")
        
        # 如果匹配率超过10%，就使用这个结果
        if (match_rate >= 0.1) {
            cat("使用 keytype:", keytype, "进行转换\n")
            break
        }
    }, error = function(e) {
        cat("keytype", keytype, "失败:", e$message, "\n")
    })
}

# 查看转换结果
cat("\n最终匹配率:", sum(!is.na(symbol_mapping)), "/", length(symbol_mapping), "\n")
```

主要区别：
- 使用 `org.Mm.eg.db` 而不是 `org.Rn.eg.db`
- 检测 Ensembl ID 时匹配 `ENSMUSG`、`ENSMUST`、`ENSMUSP`（小鼠）而不是 `ENSRNOG`、`ENSRNOT`、`ENSRNOP`（大鼠）

其他逻辑完全相同。

### 👤 User <sub>2026/01/06 10:49</sub>

人的也来一个

### 🤖 Copilot <sub>2026/01/06 10:49</sub>

好的，这是人类（Homo sapiens）版本的代码：

```
library(AnnotationDbi)
library(org.Hs.eg.db)

anno <- data.frame(ID = rownames(exp))

# 自动判断ID格式（人类版本）
detect_id_type <- function(ids) {
    # 取前几个非NA的ID进行判断
    sample_ids <- head(ids[!is.na(ids)], 10)
    
    if (length(sample_ids) == 0) return("UNKNOWN")
    
    # 检测各种格式（人类）
    if (any(grepl("^ENSG[0-9]+$", sample_ids))) {
        return("ENSEMBL")
    } else if (any(grepl("^ENST[0-9]+$", sample_ids))) {
        return("ENSEMBLTRANS")
    } else if (any(grepl("^ENSP[0-9]+$", sample_ids))) {
        return("ENSEMBLPROT")
    } else if (any(grepl("^(NM_|NR_|XM_|XR_)[0-9]+", sample_ids))) {
        return("REFSEQ")
    } else if (all(grepl("^[0-9]+$", sample_ids))) {
        return("ENTREZID")
    } else if (any(grepl("^[A-Z][A-Za-z0-9]+$", sample_ids))) {
        return("SYMBOL")
    } else {
        return("ACCNUM")  # 默认尝试 ACCNUM
    }
}

# 检测ID类型
detected_type <- detect_id_type(anno$ID)
cat("检测到的ID类型:", detected_type, "\n")

# 按检测结果设置尝试顺序
keytype_order <- switch(detected_type,
    "ENSEMBL" = c("ENSEMBL", "ENTREZID", "REFSEQ", "ACCNUM"),
    "ENSEMBLTRANS" = c("ENSEMBLTRANS", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "ENSEMBLPROT" = c("ENSEMBLPROT", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "REFSEQ" = c("REFSEQ", "ENSEMBL", "ENTREZID", "ACCNUM"),
    "ENTREZID" = c("ENTREZID", "ENSEMBL", "REFSEQ", "ACCNUM"),
    "SYMBOL" = c("SYMBOL", "ALIAS", "ENSEMBL", "ENTREZID"),
    c("ACCNUM", "ENSEMBL", "ENTREZID", "REFSEQ")  # 默认
)

# 依次尝试转换
symbol_mapping <- NULL
for (keytype in keytype_order) {
    tryCatch({
        cat("尝试使用 keytype:", keytype, "\n")
        symbol_mapping <- mapIds(org.Hs.eg.db, keys = anno$ID, column = "SYMBOL", 
                                keytype = keytype, multiVals = "first")
        match_rate <- sum(!is.na(symbol_mapping)) / length(symbol_mapping)
        cat("匹配率:", round(match_rate * 100, 2), "%\n")
        
        # 如果匹配率超过10%，就使用这个结果
        if (match_rate >= 0.1) {
            cat("使用 keytype:", keytype, "进行转换\n")
            break
        }
    }, error = function(e) {
        cat("keytype", keytype, "失败:", e$message, "\n")
    })
}

# 查看转换结果
cat("\n最终匹配率:", sum(!is.na(symbol_mapping)), "/", length(symbol_mapping), "\n")
```

主要区别：
- 使用 `org.Hs.eg.db` 而不是 `org.Rn.eg.db` 或 `org.Mm.eg.db`
- 检测 Ensembl ID 时匹配 `ENSG`、`ENST`、`ENSP`（人类）

其他逻辑完全相同。

### 👤 User <sub>2026/01/06 10:51</sub>

然后再加上这个expr_final <- expr[, c("SYMBOL", colnames(anno)[-1])] %>% 
  dplyr::filter(!is.na(SYMBOL) & SYMBOL != "") %>%      # 过滤行
  dplyr::select(SYMBOL, all_of(numeric_cols)) %>%      # 选择列
  dplyr::group_by(SYMBOL) %>% 
  dplyr::summarise(
    dplyr::across(everything(), ~ mean(.x, na.rm = TRUE)),
    .groups = "drop"
  ) %>% 
  as.data.frame()
rownames(expr_final) <- expr_final$SYMBOL
expr_final <- expr_final[, -1]
colnames(expr_final) <- sub("_.*", "", colnames(expr_final))

### 🤖 Copilot <sub>2026/01/06 10:51</sub>

好的，这是整合后的完整代码，包含ID转换和数据处理：

**大鼠版本：**

```
library(AnnotationDbi)
library(org.Rn.eg.db)
library(dplyr)

anno <- data.frame(ID = rownames(exp))

# 自动判断ID格式
detect_id_type <- function(ids) {
    sample_ids <- head(ids[!is.na(ids)], 10)
    if (length(sample_ids) == 0) return("UNKNOWN")
    
    if (any(grepl("^ENSRNOG[0-9]+$", sample_ids))) {
        return("ENSEMBL")
    } else if (any(grepl("^ENSRNOT[0-9]+$", sample_ids))) {
        return("ENSEMBLTRANS")
    } else if (any(grepl("^ENSRNOP[0-9]+$", sample_ids))) {
        return("ENSEMBLPROT")
    } else if (any(grepl("^(NM_|NR_|XM_|XR_)[0-9]+", sample_ids))) {
        return("REFSEQ")
    } else if (all(grepl("^[0-9]+$", sample_ids))) {
        return("ENTREZID")
    } else if (any(grepl("^[A-Z][A-Za-z0-9]+$", sample_ids))) {
        return("SYMBOL")
    } else {
        return("ACCNUM")
    }
}

detected_type <- detect_id_type(anno$ID)
cat("检测到的ID类型:", detected_type, "\n")

keytype_order <- switch(detected_type,
    "ENSEMBL" = c("ENSEMBL", "ENTREZID", "REFSEQ", "ACCNUM"),
    "ENSEMBLTRANS" = c("ENSEMBLTRANS", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "ENSEMBLPROT" = c("ENSEMBLPROT", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "REFSEQ" = c("REFSEQ", "ENSEMBL", "ENTREZID", "ACCNUM"),
    "ENTREZID" = c("ENTREZID", "ENSEMBL", "REFSEQ", "ACCNUM"),
    "SYMBOL" = c("SYMBOL", "ALIAS", "ENSEMBL", "ENTREZID"),
    c("ACCNUM", "ENSEMBL", "ENTREZID", "REFSEQ")
)

# 依次尝试转换
symbol_mapping <- NULL
for (keytype in keytype_order) {
    tryCatch({
        cat("尝试使用 keytype:", keytype, "\n")
        symbol_mapping <- mapIds(org.Rn.eg.db, keys = anno$ID, column = "SYMBOL", 
                                keytype = keytype, multiVals = "first")
        match_rate <- sum(!is.na(symbol_mapping)) / length(symbol_mapping)
        cat("匹配率:", round(match_rate * 100, 2), "%\n")
        
        if (match_rate >= 0.1) {
            cat("使用 keytype:", keytype, "进行转换\n")
            break
        }
    }, error = function(e) {
        cat("keytype", keytype, "失败:", e$message, "\n")
    })
}

cat("\n最终匹配率:", sum(!is.na(symbol_mapping)), "/", length(symbol_mapping), "\n")

# 添加SYMBOL到表达矩阵
expr <- cbind(SYMBOL = symbol_mapping, exp)

# 识别数值列
numeric_cols <- colnames(exp)

# 数据处理和聚合
expr_final <- expr %>% 
  dplyr::filter(!is.na(SYMBOL) & SYMBOL != "") %>%      
  dplyr::select(SYMBOL, all_of(numeric_cols)) %>%      
  dplyr::group_by(SYMBOL) %>% 
  dplyr::summarise(
    dplyr::across(everything(), ~ mean(.x, na.rm = TRUE)),
    .groups = "drop"
  ) %>% 
  as.data.frame()

rownames(expr_final) <- expr_final$SYMBOL
expr_final <- expr_final[, -1]
colnames(expr_final) <- sub("_.*", "", colnames(expr_final))
```

**小鼠版本：**

```
library(AnnotationDbi)
library(org.Mm.eg.db)
library(dplyr)

anno <- data.frame(ID = rownames(exp))

detect_id_type <- function(ids) {
    sample_ids <- head(ids[!is.na(ids)], 10)
    if (length(sample_ids) == 0) return("UNKNOWN")
    
    if (any(grepl("^ENSMUSG[0-9]+$", sample_ids))) {
        return("ENSEMBL")
    } else if (any(grepl("^ENSMUST[0-9]+$", sample_ids))) {
        return("ENSEMBLTRANS")
    } else if (any(grepl("^ENSMUSP[0-9]+$", sample_ids))) {
        return("ENSEMBLPROT")
    } else if (any(grepl("^(NM_|NR_|XM_|XR_)[0-9]+", sample_ids))) {
        return("REFSEQ")
    } else if (all(grepl("^[0-9]+$", sample_ids))) {
        return("ENTREZID")
    } else if (any(grepl("^[A-Z][A-Za-z0-9]+$", sample_ids))) {
        return("SYMBOL")
    } else {
        return("ACCNUM")
    }
}

detected_type <- detect_id_type(anno$ID)
cat("检测到的ID类型:", detected_type, "\n")

keytype_order <- switch(detected_type,
    "ENSEMBL" = c("ENSEMBL", "ENTREZID", "REFSEQ", "ACCNUM"),
    "ENSEMBLTRANS" = c("ENSEMBLTRANS", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "ENSEMBLPROT" = c("ENSEMBLPROT", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "REFSEQ" = c("REFSEQ", "ENSEMBL", "ENTREZID", "ACCNUM"),
    "ENTREZID" = c("ENTREZID", "ENSEMBL", "REFSEQ", "ACCNUM"),
    "SYMBOL" = c("SYMBOL", "ALIAS", "ENSEMBL", "ENTREZID"),
    c("ACCNUM", "ENSEMBL", "ENTREZID", "REFSEQ")
)

symbol_mapping <- NULL
for (keytype in keytype_order) {
    tryCatch({
        cat("尝试使用 keytype:", keytype, "\n")
        symbol_mapping <- mapIds(org.Mm.eg.db, keys = anno$ID, column = "SYMBOL", 
                                keytype = keytype, multiVals = "first")
        match_rate <- sum(!is.na(symbol_mapping)) / length(symbol_mapping)
        cat("匹配率:", round(match_rate * 100, 2), "%\n")
        
        if (match_rate >= 0.1) {
            cat("使用 keytype:", keytype, "进行转换\n")
            break
        }
    }, error = function(e) {
        cat("keytype", keytype, "失败:", e$message, "\n")
    })
}

cat("\n最终匹配率:", sum(!is.na(symbol_mapping)), "/", length(symbol_mapping), "\n")

expr <- cbind(SYMBOL = symbol_mapping, exp)
numeric_cols <- colnames(exp)

expr_final <- expr %>% 
  dplyr::filter(!is.na(SYMBOL) & SYMBOL != "") %>%      
  dplyr::select(SYMBOL, all_of(numeric_cols)) %>%      
  dplyr::group_by(SYMBOL) %>% 
  dplyr::summarise(
    dplyr::across(everything(), ~ mean(.x, na.rm = TRUE)),
    .groups = "drop"
  ) %>% 
  as.data.frame()

rownames(expr_final) <- expr_final$SYMBOL
expr_final <- expr_final[, -1]
colnames(expr_final) <- sub("_.*", "", colnames(expr_final))
```

**人类版本：**

```
library(AnnotationDbi)
library(org.Hs.eg.db)
library(dplyr)

anno <- data.frame(ID = rownames(exp))

detect_id_type <- function(ids) {
    sample_ids <- head(ids[!is.na(ids)], 10)
    if (length(sample_ids) == 0) return("UNKNOWN")
    
    if (any(grepl("^ENSG[0-9]+$", sample_ids))) {
        return("ENSEMBL")
    } else if (any(grepl("^ENST[0-9]+$", sample_ids))) {
        return("ENSEMBLTRANS")
    } else if (any(grepl("^ENSP[0-9]+$", sample_ids))) {
        return("ENSEMBLPROT")
    } else if (any(grepl("^(NM_|NR_|XM_|XR_)[0-9]+", sample_ids))) {
        return("REFSEQ")
    } else if (all(grepl("^[0-9]+$", sample_ids))) {
        return("ENTREZID")
    } else if (any(grepl("^[A-Z][A-Za-z0-9]+$", sample_ids))) {
        return("SYMBOL")
    } else {
        return("ACCNUM")
    }
}

detected_type <- detect_id_type(anno$ID)
cat("检测到的ID类型:", detected_type, "\n")

keytype_order <- switch(detected_type,
    "ENSEMBL" = c("ENSEMBL", "ENTREZID", "REFSEQ", "ACCNUM"),
    "ENSEMBLTRANS" = c("ENSEMBLTRANS", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "ENSEMBLPROT" = c("ENSEMBLPROT", "ENSEMBL", "ENTREZID", "REFSEQ"),
    "REFSEQ" = c("REFSEQ", "ENSEMBL", "ENTREZID", "ACCNUM"),
    "ENTREZID" = c("ENTREZID", "ENSEMBL", "REFSEQ", "ACCNUM"),
    "SYMBOL" = c("SYMBOL", "ALIAS", "ENSEMBL", "ENTREZID"),
    c("ACCNUM", "ENSEMBL", "ENTREZID", "REFSEQ")
)

symbol_mapping <- NULL
for (keytype in keytype_order) {
    tryCatch({
        cat("尝试使用 keytype:", keytype, "\n")
        symbol_mapping <- mapIds(org.Hs.eg.db, keys = anno$ID, column = "SYMBOL", 
                                keytype = keytype, multiVals = "first")
        match_rate <- sum(!is.na(symbol_mapping)) / length(symbol_mapping)
        cat("匹配率:", round(match_rate * 100, 2), "%\n")
        
        if (match_rate >= 0.1) {
            cat("使用 keytype:", keytype, "进行转换\n")
            break
        }
    }, error = function(e) {
        cat("keytype", keytype, "失败:", e$message, "\n")
    })
}

cat("\n最终匹配率:", sum(!is.na(symbol_mapping)), "/", length(symbol_mapping), "\n")

expr <- cbind(SYMBOL = symbol_mapping, exp)
numeric_cols <- colnames(exp)

expr_final <- expr %>% 
  dplyr::filter(!is.na(SYMBOL) & SYMBOL != "") %>%      
  dplyr::select(SYMBOL, all_of(numeric_cols)) %>%      
  dplyr::group_by(SYMBOL) %>% 
  dplyr::summarise(
    dplyr::across(everything(), ~ mean(.x, na.rm = TRUE)),
    .groups = "drop"
  ) %>% 
  as.data.frame()

rownames(expr_final) <- expr_final$SYMBOL
expr_final <- expr_final[, -1]
colnames(expr_final) <- sub("_.*", "", colnames(expr_final))
```

这样就完成了从ID检测、转换到数据聚合的完整流程。

### 👤 User <sub>2026/01/06 14:23</sub>

ENST这种也包括了吗？

### 🤖 Copilot <sub>2026/01/06 14:23</sub>

是的，已经包括了。在人类版本的代码中：

**检测部分：**

```
} else if (any(grepl("^ENST[0-9]+$", sample_ids))) {
    return("ENSEMBLTRANS")
```

**转换部分：**

```
"ENSEMBLTRANS" = c("ENSEMBLTRANS", "ENSEMBL", "ENTREZID", "REFSEQ"),
```

所以如果检测到 `ENST` 开头的 ID（如 `ENST00000123456`），会：
1. 识别为 `ENSEMBLTRANS` 类型
2. 首先尝试用 `ENSEMBLTRANS` 作为 keytype 转换
3. 如果失败或匹配率低，依次尝试 `ENSEMBL`、`ENTREZID`、`REFSEQ`

类似的：
- 大鼠：`ENSRNOT` → `ENSEMBLTRANS`
- 小鼠：`ENSMUST` → `ENSEMBLTRANS`
- 人类：`ENST` → `ENSEMBLTRANS`

都已包含在内。
