# library(AnnotationDbi) > library(org.Hs.eg.db) # 明确使用人类数据库 > library(tibble) ...

| Field | Value |
|-------|-------|
| Session ID | `197e367c-630a-4668-9fc0-dc18b7742b71` |
| Workspace | Ensembl ID转换中的网络连接错误处理 |
| Start | 2025/10/26 23:30 |
| End | 2025/10/27 00:11 |
| Messages | 21 |

---

### 👤 User <sub>2025/10/26 23:30</sub>

library(AnnotationDbi)
> library(org.Hs.eg.db)  # 明确使用人类数据库
> library(tibble)
> library(stringr)
> 
> # ========== 数据准备 ==========
> anno <- GPL17586_anno
> anno <- anno[!(is.na(anno$SYMBOL) | anno$SYMBOL == ""), ]
> anno <- anno[anno$SYMBOL != "---", ]
> 
> # 保存原始ID和基因Symbol
> orig_id <- anno[[1]]
> gene_symbol <- anno$SYMBOL
> 
> # 数据探索
> cat("含下划线的ID数量:", sum(grepl("_", gene_symbol)), "\n")
含下划线的ID数量: 23447 
> cat("ENST类型的ID数量:", sum(grepl("^ENST", gene_symbol)), "\n")
ENST类型的ID数量: 3211 
> 
> # ========== 辅助函数定义 ==========
> 
> # 加载预处理映射表
> load_rdata_mapping <- function(rdata_file, verbose = TRUE) {
+     if (!file.exists(rdata_file)) {
+         if (verbose) cat("⚠️  RData文件不存在:", rdata_file, "\n")
+         return(NULL)
+     }
+     
+     if (verbose) cat("📂 加载RData映射文件...\n")
+     
+     tryCatch({
+         env <- new.env()  # 加载到独立环境
+         load(rdata_file, envir = env)
+         
+         if (exists("otthumt_to_symbol_mapping", envir = env)) {
+             mapping <- env$otthumt_to_symbol_mapping
+             if (verbose) cat("✅ 成功加载", length(mapping), "个OTTHUMT映射关系\n")
+             return(mapping)
+         } else {
+             if (verbose) cat("❌ RData文件中未找到映射变量\n")
+             return(NULL)
+         }
+     }, error = function(e) {
+         if (verbose) cat("❌ 加载失败:", e$message, "\n")
+         return(NULL)
+     })
+ }
> 
> # RefSeq ID转换
> convert_refseq <- function(refseq_ids) {
+     mapIds(org.Hs.eg.db,
+            keys = refseq_ids,
+            column = "SYMBOL",
+            keytype = "REFSEQ",
+            multiVals = "first")
+ }
> 
> # Ensembl转录本ID转换
> convert_enst <- function(enst_ids, mart = NULL) {
+     if (is.null(mart)) {
+         library(biomaRt)
+         mart <- useMart("ensembl", dataset = "hsapiens_gene_ensembl")
+     }
+     result <- getBM(attributes = c("ensembl_transcript_id", "hgnc_symbol"),
+                     filters = "ensembl_transcript_id",
+                     values = enst_ids,
+                     mart = mart)
+     setNames(result$hgnc_symbol, result$ensembl_transcript_id)[enst_ids]
+ }
> 
> # Ensembl基因ID转换
> convert_ensg <- function(ensg_ids) {
+     mapIds(org.Hs.eg.db,
+            keys = ensg_ids,
+            column = "SYMBOL",
+            keytype = "ENSEMBL",
+            multiVals = "first")
+ }
> 
> # AceView ID转换(取点前部分)
> convert_aceview <- function(ace_ids) {
+     sub("\\..*", "", ace_ids)
+ }
> 
> # GenBank ID转换
> convert_genbank <- function(gb_ids) {
+     library(rentrez)
+     sapply(gb_ids, function(id) {
+         tryCatch({
+             fetch <- entrez_fetch(db = "nucleotide", id = id, rettype = "gb", retmode = "text")
+             gene_match <- regmatches(fetch, regexpr('/gene="[^"]+"', fetch))
+             if (length(gene_match) > 0) sub('/gene="([^"]+)"', "\\1", gene_match[1]) else NA
+         }, error = function(e) NA)
+     }, USE.NAMES = FALSE)
+ }
> 
> # Havana ID转换
> convert_havana <- function(havana_ids, gtf_mapping = NULL, mart = NULL) {
+     if (!is.null(gtf_mapping)) {
+         return(gtf_mapping[havana_ids])
+     }
+     # 降级使用biomaRt
+     if (is.null(mart)) {
+         library(biomaRt)
+         mart <- useMart("ensembl", dataset = "hsapiens_gene_ensembl")
+     }
+     # biomaRt通常不直接支持OTTHUMT,返回NA
+     rep(NA_character_, length(havana_ids))
+ }
> 
> # UCSC转录本ID转换
> convert_ucsc <- function(ucsc_ids) {
+     library(TxDb.Hsapiens.UCSC.hg38.knownGene)
+     library(GenomicFeatures)
+     txdb <- TxDb.Hsapiens.UCSC.hg38.knownGene
+     tx <- transcripts(txdb, columns = c("tx_name", "gene_id"))
+     gene_map <- mapIds(org.Hs.eg.db,
+                       keys = tx$gene_id,
+                       column = "SYMBOL",
+                       keytype = "ENTREZID",
+                       multiVals = "first")
+     tx_to_symbol <- setNames(gene_map, tx$tx_name)
+     tx_to_symbol[ucsc_ids]
+ }
> 
> # ========== 主转换函数 ==========
> ids_to_symbol <- function(ids, gtf_mapping = NULL, use_rentrez = FALSE, 
+                          verbose = TRUE, mart = NULL) {
+     if (length(ids) == 0) {
+         return(tibble(id = character(0), symbol = character(0), source = character(0)))
+     }
+     
+     orig_ids <- ids
+     mapped <- rep(NA_character_, length(ids))
+     source <- rep("original", length(ids))
+     
+     # RefSeq转换
+     ref_idx <- grepl('^[NXA][MRK]_', ids)
+     if (any(ref_idx)) {
+         if (verbose) cat('🔄 RefSeq -> SYMBOL\n')
+         mapped[ref_idx] <- convert_refseq(ids[ref_idx])
+         source[ref_idx][!is.na(mapped[ref_idx])] <- "RefSeq"
+     }
+     
+     # ENST转换
+     enst_idx <- grepl('^ENST', ids)
+     if (any(enst_idx)) {
+         if (verbose) cat('🔄 ENST -> SYMBOL\n')
+         tmp <- convert_enst(ids[enst_idx], mart = mart)
+         mapped[enst_idx] <- tmp
+         source[enst_idx][!is.na(tmp)] <- "ENST"
+     }
+     
+     # ENSG转换
+     ensg_idx <- grepl('^ENSG', ids)
+     if (any(ensg_idx)) {
+         if (verbose) cat('🔄 ENSG -> SYMBOL\n')
+         tmp <- convert_ensg(ids[ensg_idx])
+         mapped[ensg_idx] <- tmp
+         source[ensg_idx][!is.na(tmp)] <- "ENSG"
+     }
+     
+     # AceView转换
+     ace_idx <- grepl('\\.', ids) & !enst_idx & !ref_idx
+     if (any(ace_idx)) {
+         if (verbose) cat('🔄 AceView -> SYMBOL\n')
+         tmp <- convert_aceview(ids[ace_idx])
+         mapped[ace_idx] <- tmp
+         source[ace_idx][!is.na(tmp)] <- "AceView"
+     }
+     
+     # GenBank转换(可选)
+     genbank_idx <- grepl('^BC\\d+', ids)
+     if (any(genbank_idx) && use_rentrez) {
+         if (verbose) cat('🔄 GenBank -> SYMBOL\n')
+         tmp <- convert_genbank(ids[genbank_idx])
+         mapped[genbank_idx] <- tmp
+         source[genbank_idx][!is.na(tmp)] <- "GenBank"
+     }
+     
+     # Havana转换
+     havana_idx <- grepl('^OTTHUMT', ids)
+     if (any(havana_idx)) {
+         if (verbose) cat('🔄 Havana -> SYMBOL\n')
+         tmp <- convert_havana(ids[havana_idx], gtf_mapping = gtf_mapping, mart = mart)
+         mapped[havana_idx] <- tmp
+         source[havana_idx][!is.na(tmp)] <- "Havana"
+     }
+     
+     # UCSC转换
+     ucsc_idx <- grepl('^uc\\d+', ids, ignore.case = TRUE)
+     if (any(ucsc_idx)) {
+         if (verbose) cat('🔄 UCSC -> SYMBOL\n')
+         tmp <- convert_ucsc(ids[ucsc_idx])
+         mapped[ucsc_idx] <- tmp
+         source[ucsc_idx][!is.na(tmp)] <- "UCSC"
+     }
+     
+     # 保留未转换的原ID
+     na_idx <- is.na(mapped)
+     mapped[na_idx] <- orig_ids[na_idx]
+     
+     tibble(
+         ID = orig_ids,
+         SYMBOL = mapped,
+         Source = source
+     )
+ }
> 
> # ========== 执行转换 ==========
> rdata_file_path <- "/Users/yuzuan/Desktop/2025_08_10 fastGEO/gencode.v46.annotation.gtf_havana_mapping.RData"
> cat("🚀 开始ID转换流程...\n\n")
🚀 开始ID转换流程...

> 
> gtf_mapping <- load_rdata_mapping(rdata_file_path, verbose = TRUE)
📂 加载RData映射文件...
✅ 成功加载 211025 个OTTHUMT映射关系
> 
> if (is.null(gtf_mapping)) {
+     cat("⚠️  将使用标准方法进行Havana ID转换\n\n")
+ }
> 
> # 执行转换
> result <- ids_to_symbol(gene_symbol, gtf_mapping = gtf_mapping, 
+                        use_rentrez = FALSE, verbose = TRUE)
🔄 RefSeq -> SYMBOL
'select()' returned 1:1 mapping between keys and columns
🔄 ENST -> SYMBOL
Error in `req_perform()`:
! Failed to perform HTTP request.
Caused by error in `curl::curl_fetch_memory()`:
! SSL connect error [www.ensembl.org]:
Recv failure: Connection reset by peer
Run `rlang::last_trace()` to see where the error occurred.
Called from: signal_abort(cnd)
Browse[1]> 

### 🤖 Copilot <sub>2025/10/26 23:30</sub>

我将先建立一个可跟踪的 todo 列表来管理接下来的修复步骤（为什么/做什么/预期结果：确保按步骤处理问题并记录进度）。随后我会给出诊断、可行修复方案和具体代码补丁建议。

进展更新：我已把任务分解并记录在 todo（第1、2项已完成，第3项正在进行）。下面给出诊断、可行的短期修复、一个更健壮的 `convert_enst()` 实现、以及调试/替代方案和测试步骤。

## 问题诊断（简要）
你遇到的错误是：
! SSL connect error [www.ensembl.org]: Recv failure: Connection reset by peer

常见原因：
- 本地网络/防火墙或代理阻断到 www.ensembl.org 的 HTTPS 连接；
- 临时性 Ensembl 服务器或网络中断（可重试）；
- 本机的 curl / SSL 库与服务器协商 TLS 时失败（老版 curl/openssl）；
- biomaRt 默认连接点不可用，需要使用镜像或 archive host。

## 立即可试的短期修复（按简单到稳妥顺序）
1. 先重试（有时是短暂网络问题）。
2. 使用 biomaRt 的镜像（useEnsembl 的 mirror 参数 或者更改 host），示例：
   - try: useEnsembl(..., mirror = "useast") / mirror = "uswest" / mirror = "asia"
3. 若你有可用的本地 `gtf_mapping`（你已经加载了），优先用它来解析 ENST，避免访问 Ensembl。
4. 检查本机 curl/SSL：在 R 中运行 `curl::curl_version()`，以及系统层面的 curl/openssl 更新。
5. 作为最后手段并不推荐：临时关闭 SSL 验证以排查（安全性风险），仅作调试。

## 推荐改动（核心：把 ENST 解析改为先用本地映射，再尝试镜像并加上容错）
下面是一个稳健的 `convert_enst()` 实现（你可以直接替换你当前函数），它会：
- 优先使用传入的 `gtf_mapping`（如果有），
- 对未命中的 ENST 使用多个镜像依次尝试 biomaRt（并用 tryCatch 捕获错误），
- 保持输入顺序并返回一个与输入长度一致的字符向量（可能包含 NA）。

请在 R 中替换或添加此函数（保持缩进风格一致）：

```r
convert_enst <- function(enst_ids, gtf_mapping = NULL, mart = NULL, verbose = TRUE) {
    # 结果向量，保持与输入顺序一致
    out <- rep(NA_character_, length(enst_ids))
    names(out) <- enst_ids

    # 1) 优先用 gtf_mapping（如果提供，假定是 named vector/list: names = ensembl_transcript_id -> SYMBOL）
    if (!is.null(gtf_mapping)) {
        # 有些 mapping 可能没有完全相同的名称格式，尝试直接索引然后按存在性填充
        present <- enst_ids %in% names(gtf_mapping)
        if (any(present)) {
            out[enst_ids[present]] <- as.character(gtf_mapping[enst_ids[present]])
            if (verbose) message("使用 gtf_mapping 命中 ", sum(present), " 个 ENST")
        }
    }

    # 如果全都命中，直接返回
    if (all(!is.na(out))) return(unname(out))

    # 2) 针对未命中的 ID 尝试使用 biomaRt（多个镜像依次尝试）
    missing_ids <- enst_ids[is.na(out)]
    if (length(missing_ids) == 0) return(unname(out))

    # 如果外部已传入 mart，优先使用它
    bm <- NULL
    if (!is.null(mart)) {
        bm <- mart
    } else {
        # 尝试多个连接方式：先 useEnsembl 镜像（useast/uswest/asia），再回退到 useMart
        mirrors <- c("useast", "uswest", "asia", NA)  # NA 表示 useMart 默认
        for (mir in mirrors) {
            bm_try <- tryCatch({
                if (is.na(mir)) {
                    if (verbose) message("尝试 useMart 默认 host ...")
                    biomaRt::useMart("ensembl", dataset = "hsapiens_gene_ensembl")
                } else {
                    if (verbose) message("尝试 useEnsembl 镜像: ", mir, " ...")
                    biomaRt::useEnsembl(biomart = "ensembl", dataset = "hsapiens_gene_ensembl", mirror = mir)
                }
            }, error = function(e) {
                if (verbose) message("连接镜像失败（", mir, "）：", e$message)
                NULL
            })
            if (!is.null(bm_try)) { bm <- bm_try; break }
        }
    }

    # 如果没有成功建立 mart，直接返回当前结果（gtf_mapping 的命中结果）
    if (is.null(bm)) {
        if (verbose) message("⚠️ 无法建立 biomaRt 连接，跳过远程查询。")
        return(unname(out))
    }

    # 使用 getBM 查询
    res_df <- tryCatch({
        biomaRt::getBM(attributes = c("ensembl_transcript_id", "hgnc_symbol"),
                       filters = "ensembl_transcript_id",
                       values = missing_ids,
                       mart = bm)
    }, error = function(e) {
        if (verbose) message("getBM 查询失败：", e$message)
        NULL
    })

    if (!is.null(res_df) && nrow(res_df) > 0) {
        # 构造映射并按输入填回
        map <- setNames(as.character(res_df$hgnc_symbol), res_df$ensembl_transcript_id)
        hit <- intersect(names(map), missing_ids)
        if (length(hit) > 0) {
            out[hit] <- map[hit]
        }
    } else {
        if (verbose) message("getBM 未返回结果或出错。")
    }

    # 返回与输入同顺序的字符向量（不是命中用 NA）
    # 为兼容你当前 pipeline，需要返回未命中的原始 ID 或 NA？这里返回 NA（上层可以选择替换为原ID）。
    unname(out)
}
```

注意：
- 该函数返回与输入顺序一致的字符向量（包含 NA 表示未找到 symbol）。在你的 `ids_to_symbol()` 中，你目前是把未命中的 mapped 用原始 ID 替换；你可以保留这一策略（在上层处理 NA 的地方把 NA 替成原 ID）。
- 在 `ids_to_symbol()` 中，请把 ENST 调用改为传入 `gtf_mapping`：  
  原来： `tmp <- convert_enst(ids[enst_idx], mart = mart)`  
  修改为： `tmp <- convert_enst(ids[enst_idx], gtf_mapping = gtf_mapping, mart = mart, verbose = verbose)`

## 其它长期/稳妥替代方案
1. 使用 EnsDb（离线、生物信息学更稳定）：
   - 安装并使用 Bioconductor 的 EnsDb 注释包，例如 `EnsDb.Hsapiens.v105`（版本需匹配你想要的 Ensembl 版本）。
   - 优点：本地数据库，无需访问在线 Ensembl；性能好。
2. 使用 AnnotationHub / AnnotationDbi 下载并缓存映射文件（例如 ensembl->symbol 映射表），在脚本中使用本地表格做映射。
3. 直接使用你已有的 `gencode.v46` 的 GTF 来构建 transcript->gene_symbol 映射（如果 GTF 包含 gene_name 或 gene_symbol 字段），这对 gencode 数据最好。

示例：用 GTF 构建简单 mapping（如果你愿意把 gtf 文件解析一次并保存为 RData，后续直接加载）：
```r
library(rtracklayer)
gtf <- rtracklayer::import("gencode.v46.annotation.gtf")
# 从 gtf 的 attributes 中提取 transcript_id 与 gene_name（或 gene_symbol）
# 构造 named vector: names = transcript_id, value = gene_name
```

## 调试步骤 / 本地命令（请在本地 R 会话中运行）
1. 检查 curl/SSL 版本：
```r
# 在 R 中运行
curl::curl_version()
```
预期：显示 libcurl / SSL 支持信息；若过旧请更新系统 curl 或 R 的 curl 库。

2. 测试能否访问 Ensembl（在 R 中）：
```r
httr::GET("https://www.ensembl.org")  # 仅测试是否能建立 HTTPS 连接
```
预期：返回 200 或至少不报 SSL 错误。

3. 在不调用整段脚本前用小样本测试改写后的函数：
```r
# 假设 enst_tests 是一些 ENST ID 的向量
enst_tests <- c("ENST00000367770","ENST00000448914")  # 示例
res <- convert_enst(enst_tests, gtf_mapping = gtf_mapping, verbose = TRUE)
print(res)
```

4. 若你确定是网络或临时性问题，可尝试用镜像：
```r
library(biomaRt)
mart <- tryCatch(useEnsembl(biomart="ensembl", dataset="hsapiens_gene_ensembl", mirror="useast"), error=function(e) NULL)
```

## 如何把建议应用到你的脚本（最小修改）
- 把上面新的 `convert_enst()` 函数替换到你的脚本中。
- 修改 `ids_to_symbol()` 中 ENST 那段为：
```r
tmp <- convert_enst(ids[enst_idx], gtf_mapping = gtf_mapping, mart = mart, verbose = verbose)
```
- 重新运行 `result <- ids_to_symbol(...)`。

## 我接下来可以帮你做的事（你选其一）
- 我可以把上述补丁直接写成 R 文件或给出完整替换补丁（如果你把工作区/文件上传或粘贴我可以用编辑工具替你修改）。
- 如果你愿意，可以把 `curl::curl_version()` 与 `httr::GET("https://www.ensembl.org")` 的输出贴上来，我帮你更具体定位（例如是证书问题还是被 reset）。

## 小结
- 问题由 biomaRt 与 Ensembl 的 HTTPS 连接失败引起，可能是网络、服务器、或本机 curl/SSL 问题。  
- 最直接且稳妥的修复：优先用你已有的 `gtf_mapping` 映射 ENST；为未命中的 ID 增加多个 biomaRt 镜像尝试并用 tryCatch 容错。  
- 我已经为你写好一个更健壮的 `convert_enst()` 函数和修改建议。若你愿意，我可以把这些修改写入你的脚本（需要你提供文件或允许我访问工作区文件）。或者你在本地替换后把测试输出贴上来，我会继续跟进直到问题完全解决。

### 👤 User <sub>2025/10/26 23:32</sub>

不需要联网的版本呢，直接用本地的

### 🤖 Copilot <sub>2025/10/26 23:32</sub>

完全理解！我会给你一个完全离线的版本，直接使用本地资源（org.Hs.eg.db + 你的 gtf_mapping）。

我将创建一个完全离线的版本，移除所有需要联网的部分（biomaRt、rentrez 等），只使用本地资源。

### 👤 User <sub>2025/10/26 23:33</sub>

不需要联网的版本呢，直接用本地的

### 🤖 Copilot <sub>2025/10/26 23:33</sub>

**Offline Mapping**  
- 重写了整套转换流程，完全离线：所有 ID→SYMBOL 映射都使用本地包（`org.Hs.eg.db`, `TxDb.Hsapiens.UCSC.hg38.knownGene`）以及你已有的 `gtf_mapping`。对 Ensembl transcript ID（ENST）只走本地 GTF 派生的表，完全不调用 biomaRt。

```r
# offline_id_mapping.R
suppressPackageStartupMessages({
    library(AnnotationDbi)
    library(org.Hs.eg.db)
    library(TxDb.Hsapiens.UCSC.hg38.knownGene)
    library(GenomicFeatures)
    library(tibble)
})

load_rdata_mapping <- function(rdata_file, verbose = TRUE) {
    if (!file.exists(rdata_file)) {
        if (verbose) message("⚠️  RData 文件不存在: ", rdata_file)
        return(NULL)
    }
    if (verbose) message("📂 加载 RData 映射文件...")
    env <- new.env()
    load(rdata_file, envir = env)
    if (!exists("otthumt_to_symbol_mapping", envir = env)) {
        if (verbose) message("❌ RData 中未找到 otthumt_to_symbol_mapping")
        return(NULL)
    }
    mapping <- env$otthumt_to_symbol_mapping
    if (verbose) message("✅ 成功加载 ", length(mapping), " 个 OTTHUMT 映射关系")
    mapping
}

build_gtf_transcript_mapping <- function(gtf_path,
                                         cache_path = NULL,
                                         force = FALSE,
                                         verbose = TRUE) {
    if (!is.null(cache_path) && file.exists(cache_path) && !force) {
        if (verbose) message("📦 读取缓存的 transcript→symbol 映射: ", cache_path)
        return(readRDS(cache_path))
    }
    if (!file.exists(gtf_path))
        stop("GTF 文件不存在: ", gtf_path)
    suppressPackageStartupMessages(library(rtracklayer))
    if (verbose) message("🧬 从 GTF 提取 transcript → gene_name...")
    gtf <- rtracklayer::import(gtf_path, format = "gtf")
    tx_rows <- gtf[gtf$type == "transcript"]
    transcript_id <- mcols(tx_rows)$transcript_id
    gene_symbol  <- mcols(tx_rows)$gene_name
    keep <- !is.na(transcript_id) & transcript_id != "" &
            !is.na(gene_symbol)  & gene_symbol  != ""
    mapping <- gene_symbol[keep]
    names(mapping) <- transcript_id[keep]
    if (!is.null(cache_path)) {
        if (verbose) message("💾 写入缓存: ", cache_path)
        saveRDS(mapping, cache_path)
    }
    mapping
}

convert_refseq <- function(refseq_ids) {
    mapIds(org.Hs.eg.db,
           keys = refseq_ids,
           column = "SYMBOL",
           keytype = "REFSEQ",
           multiVals = "first")
}

convert_enst <- function(enst_ids, transcript_mapping = NULL) {
    if (is.null(transcript_mapping)) {
        return(rep(NA_character_, length(enst_ids)))
    }
    unname(transcript_mapping[enst_ids])
}

convert_ensg <- function(ensg_ids) {
    mapIds(org.Hs.eg.db,
           keys = ensg_ids,
           column = "SYMBOL",
           keytype = "ENSEMBL",
           multiVals = "first")
}

convert_aceview <- function(ace_ids) sub("\\..*", "", ace_ids)

convert_genbank <- function(gb_ids, genbank_mapping = NULL) {
    if (is.null(genbank_mapping)) return(rep(NA_character_, length(gb_ids)))
    unname(genbank_mapping[gb_ids])
}

local({
    ucsc_cache <- NULL
    get_ucsc_map <- function() {
        if (is.null(ucsc_cache)) {
            txdb <- TxDb.Hsapiens.UCSC.hg38.knownGene
            tx <- transcripts(txdb, columns = c("tx_name", "gene_id"))
            gene_map <- mapIds(org.Hs.eg.db,
                               keys = tx$gene_id,
                               column = "SYMBOL",
                               keytype = "ENTREZID",
                               multiVals = "first")
            ucsc_cache <<- setNames(gene_map[match(tx$gene_id, names(gene_map))], tx$tx_name)
        }
        ucsc_cache
    }
    convert_ucsc <<- function(ucsc_ids) {
        tx_to_symbol <- get_ucsc_map()
        unname(tx_to_symbol[ucsc_ids])
    }
})

convert_havana <- function(havana_ids, gtf_mapping = NULL) {
    if (is.null(gtf_mapping)) return(rep(NA_character_, length(havana_ids)))
    unname(gtf_mapping[havana_ids])
}

ids_to_symbol <- function(ids,
                          gtf_mapping = NULL,
                          transcript_mapping = NULL,
                          genbank_mapping = NULL,
                          use_rentrez = FALSE,
                          verbose = TRUE) {

    if (length(ids) == 0) {
        return(tibble(ID = character(), SYMBOL = character(), Source = character()))
    }

    orig_ids <- ids
    mapped  <- rep(NA_character_, length(ids))
    source  <- rep("original", length(ids))

    ref_idx <- grepl('^[NXA][MRK]_', ids)
    if (any(ref_idx)) {
        if (verbose) message("🔄 RefSeq → SYMBOL")
        tmp <- convert_refseq(ids[ref_idx])
        mapped[ref_idx] <- tmp
        source[ref_idx][!is.na(tmp)] <- "RefSeq"
    }

    enst_idx <- grepl('^ENST', ids)
    if (any(enst_idx)) {
        if (verbose) message("🔄 ENST → SYMBOL (本地 GTF 映射)")
        tmp <- convert_enst(ids[enst_idx], transcript_mapping = transcript_mapping)
        mapped[enst_idx] <- tmp
        source[enst_idx][!is.na(tmp)] <- "ENST-GTF"
    }

    ensg_idx <- grepl('^ENSG', ids)
    if (any(ensg_idx)) {
        if (verbose) message("🔄 ENSG → SYMBOL")
        tmp <- convert_ensg(ids[ensg_idx])
        mapped[ensg_idx] <- tmp
        source[ensg_idx][!is.na(tmp)] <- "ENSG"
    }

    ace_idx <- grepl('\\.', ids) & !enst_idx & !ref_idx
    if (any(ace_idx)) {
        if (verbose) message("🔄 AceView → SYMBOL")
        tmp <- convert_aceview(ids[ace_idx])
        mapped[ace_idx] <- tmp
        source[ace_idx][!is.na(tmp)] <- "AceView"
    }

    genbank_idx <- grepl('^BC\\d+', ids)
    if (any(genbank_idx) && !is.null(genbank_mapping)) {
        if (verbose) message("🔄 GenBank → SYMBOL (自备映射)")
        tmp <- convert_genbank(ids[genbank_idx], genbank_mapping = genbank_mapping)
        mapped[genbank_idx] <- tmp
        source[genbank_idx][!is.na(tmp)] <- "GenBank"
    }

    havana_idx <- grepl('^OTTHUMT', ids)
    if (any(havana_idx)) {
        if (verbose) message("🔄 Havana → SYMBOL (gtf_mapping)")
        tmp <- convert_havana(ids[havana_idx], gtf_mapping = gtf_mapping)
        mapped[havana_idx] <- tmp
        source[havana_idx][!is.na(tmp)] <- "Havana"
    }

    ucsc_idx <- grepl('^uc\\d+', ids, ignore.case = TRUE)
    if (any(ucsc_idx)) {
        if (verbose) message("🔄 UCSC → SYMBOL")
        tmp <- convert_ucsc(ids[ucsc_idx])
        mapped[ucsc_idx] <- tmp
        source[ucsc_idx][!is.na(tmp)] <- "UCSC"
    }

    na_idx <- is.na(mapped)
    mapped[na_idx] <- orig_ids[na_idx]

    tibble(
        ID     = orig_ids,
        SYMBOL = mapped,
        Source = source
    )
}
```

**本地准备要点**  
- ENST 映射：第一次运行前执行  
  ```r
  tx_map <- build_gtf_transcript_mapping(
      gtf_path   = "/Users/yuzuan/Desktop/2025_08_10 fastGEO/gencode.v46.annotation.gtf",
      cache_path = "/Users/yuzuan/Desktop/2025_08_10 fastGEO/gencode.v46.tx2symbol.rds"
  )
  ```  
  之后用 `readRDS` 直接加载到 `transcript_mapping` 参数即可。
- OTTHUMT：继续使用你已有的 `gtf_mapping <- load_rdata_mapping("...RData")`。
- GenBank：若有 CSV/RDS，可读入为命名向量传入 `genbank_mapping`。没有的话会返回 NA（保留原 ID）。

**调用示例**  
```r
source("offline_id_mapping.R")

gtf_mapping <- load_rdata_mapping("/path/to/gencode.v46.annotation.gtf_havana_mapping.RData")
transcript_mapping <- readRDS("/path/to/gencode.v46.tx2symbol.rds")

result <- ids_to_symbol(
    ids                = gene_symbol,
    gtf_mapping        = gtf_mapping,
    transcript_mapping = transcript_mapping,
    verbose            = TRUE
)
```

**本地验证步骤**  
1. 构建/读取 transcript 映射并查看命中数量：
   ```r
   length(transcript_mapping)
   head(transcript_mapping)
   ```
2. 用少量 ENST 先试：
   ```r
   test_ids <- c("ENST00000367770", "ENST00000448914")
   ids_to_symbol(test_ids, gtf_mapping, transcript_mapping, verbose = TRUE)
   ```
3. 全量跑完后统计各 Source 命中情况：
   ```r
   table(result$Source)
   sum(result$SYMBOL == result$ID)  # 未转换数量
   ```

**下一步建议**  
1. 若还需要其它数据库 ID（GenBank、AceView 等）的离线映射，考虑把 GTF/CSV 先整理成统一的 named vector 并保存成 RDS，后续直接加载。  
2. 跑完转换后加一个 QA 步骤：检查是否仍存在含下划线或 ENST 前缀的 SYMBOL，确认离线映射覆盖情况。

### 👤 User <sub>2025/10/26 23:38</sub>

直接根据这个帮我修改一下

### 👤 User <sub>2025/10/26 23:38</sub>

直接根据这个帮我修改一下

### 🤖 Copilot <sub>2025/10/26 23:38</sub>

- 把 `untitled:Untitled-1` 里的 ENST、Havana、GenBank 转换都改成纯本地映射：新增 GTF→symbol 构建/缓存函数，`convert_enst()` 只查内存映射，`convert_genbank()` 改为读取命名向量，不再触网；删除了所有 `biomaRt` 与 `rentrez` 依赖。
- `ids_to_symbol()` 接受 `transcript_mapping`、`genbank_mapping`，在 ENST、OTTHUMT、GenBank 命中时写入来源标签，其余落空仍回退到原始 ID。

```r
library(AnnotationDbi)
library(org.Hs.eg.db)
library(TxDb.Hsapiens.UCSC.hg38.knownGene)
library(GenomicFeatures)
library(tibble)
library(stringr)

build_transcript_mapping_from_gtf <- function(gtf_path, verbose = TRUE) {
    if (!file.exists(gtf_path)) {
        if (verbose) message("⚠️  GTF 文件不存在: ", gtf_path)
        return(NULL)
    }
    if (verbose) message("🧬 从 GTF 构建 ENST → SYMBOL 映射...")
    suppressPackageStartupMessages(library(rtracklayer))
    gtf <- rtracklayer::import(gtf_path, format = "gtf")
    tx_rows <- gtf[gtf$type == "transcript"]

    transcript_id <- mcols(tx_rows)$transcript_id
    gene_symbol   <- mcols(tx_rows)$gene_name
    keep <- !is.na(transcript_id) & transcript_id != "" &
            !is.na(gene_symbol)   & gene_symbol   != ""

    mapping <- gene_symbol[keep]
    names(mapping) <- transcript_id[keep]
    mapping
}

load_transcript_mapping <- function(rds_path = NULL,
                                    gtf_path = NULL,
                                    force = FALSE,
                                    verbose = TRUE) {
    if (!is.null(rds_path) && file.exists(rds_path) && !force) {
        if (verbose) message("📦 从缓存加载 transcript 映射: ", rds_path)
        return(readRDS(rds_path))
    }
    if (is.null(gtf_path)) {
        if (verbose) message("⚠️  未提供 GTF 路径，无法构建 transcript 映射")
        return(NULL)
    }
    mapping <- build_transcript_mapping_from_gtf(gtf_path, verbose = verbose)
    if (!is.null(rds_path) && !is.null(mapping)) {
        if (verbose) message("💾 写入 transcript 映射缓存: ", rds_path)
        saveRDS(mapping, rds_path)
    }
    mapping
}

load_rdata_mapping <- function(rdata_file, verbose = TRUE) {
    if (!file.exists(rdata_file)) {
        if (verbose) message("⚠️  RData 文件不存在: ", rdata_file)
        return(NULL)
    }
    if (verbose) message("📂 加载 RData 映射文件...")
    env <- new.env()
    load(rdata_file, envir = env)

    if (!exists("otthumt_to_symbol_mapping", envir = env)) {
        if (verbose) message("❌ RData 中未找到 otthumt_to_symbol_mapping")
        return(NULL)
    }
    mapping <- env$otthumt_to_symbol_mapping
    if (verbose) message("✅ 成功加载 ", length(mapping), " 个 OTTHUMT 映射关系")
    mapping
}

load_genbank_mapping <- function(rds_path = NULL) {
    if (is.null(rds_path) || !file.exists(rds_path)) return(NULL)
    readRDS(rds_path)
}

convert_refseq <- function(refseq_ids) {
    mapIds(org.Hs.eg.db,
           keys     = refseq_ids,
           column   = "SYMBOL",
           keytype  = "REFSEQ",
           multiVals = "first")
}

convert_enst <- function(enst_ids, transcript_mapping = NULL) {
    if (is.null(transcript_mapping)) return(rep(NA_character_, length(enst_ids)))
    unname(transcript_mapping[enst_ids])
}

convert_ensg <- function(ensg_ids) {
    mapIds(org.Hs.eg.db,
           keys     = ensg_ids,
           column   = "SYMBOL",
           keytype  = "ENSEMBL",
           multiVals = "first")
}

convert_aceview <- function(ace_ids) sub("\\..*", "", ace_ids)

convert_genbank <- function(gb_ids, genbank_mapping = NULL) {
    if (is.null(genbank_mapping)) return(rep(NA_character_, length(gb_ids)))
    unname(genbank_mapping[gb_ids])
}

local({
    ucsc_cache <- NULL
    get_ucsc_map <- function() {
        if (is.null(ucsc_cache)) {
            txdb <- TxDb.Hsapiens.UCSC.hg38.knownGene
            tx   <- transcripts(txdb, columns = c("tx_name", "gene_id"))
            gene_map <- mapIds(org.Hs.eg.db,
                               keys     = tx$gene_id,
                               column   = "SYMBOL",
                               keytype  = "ENTREZID",
                               multiVals = "first")
            ucsc_cache <<- setNames(gene_map[match(tx$gene_id, names(gene_map))], tx$tx_name)
        }
        ucsc_cache
    }
    convert_ucsc <<- function(ucsc_ids) {
        tx_to_symbol <- get_ucsc_map()
        unname(tx_to_symbol[ucsc_ids])
    }
})

convert_havana <- function(havana_ids, gtf_mapping = NULL) {
    if (is.null(gtf_mapping)) return(rep(NA_character_, length(havana_ids)))
    unname(gtf_mapping[havana_ids])
}

ids_to_symbol <- function(ids,
                          gtf_mapping = NULL,
                          transcript_mapping = NULL,
                          genbank_mapping = NULL,
                          verbose = TRUE) {
    if (length(ids) == 0) {
        return(tibble(ID = character(), SYMBOL = character(), Source = character()))
    }

    orig_ids <- ids
    mapped   <- rep(NA_character_, length(ids))
    source   <- rep("original", length(ids))

    ref_idx <- grepl('^[NXA][MRK]_', ids)
    if (any(ref_idx)) {
        if (verbose) message("🔄 RefSeq → SYMBOL")
        tmp <- convert_refseq(ids[ref_idx])
        mapped[ref_idx] <- tmp
        source[ref_idx][!is.na(tmp)] <- "RefSeq"
    }

    enst_idx <- grepl('^ENST', ids)
    if (any(enst_idx)) {
        if (verbose) message("🔄 ENST → SYMBOL (本地 GTF 映射)")
        tmp <- convert_enst(ids[enst_idx], transcript_mapping = transcript_mapping)
        mapped[enst_idx] <- tmp
        source[enst_idx][!is.na(tmp)] <- "ENST-GTF"
    }

    ensg_idx <- grepl('^ENSG', ids)
    if (any(ensg_idx)) {
        if (verbose) message("🔄 ENSG → SYMBOL")
        tmp <- convert_ensg(ids[ensg_idx])
        mapped[ensg_idx] <- tmp
        source[ensg_idx][!is.na(tmp)] <- "ENSG"
    }

    ace_idx <- grepl('\\.', ids) & !enst_idx & !ref_idx
    if (any(ace_idx)) {
        if (verbose) message("🔄 AceView → SYMBOL")
        tmp <- convert_aceview(ids[ace_idx])
        mapped[ace_idx] <- tmp
        source[ace_idx][!is.na(tmp)] <- "AceView"
    }

    genbank_idx <- grepl('^BC\\d+', ids)
    if (any(genbank_idx) && !is.null(genbank_mapping)) {
        if (verbose) message("🔄 GenBank → SYMBOL (本地映射)")
        tmp <- convert_genbank(ids[genbank_idx], genbank_mapping = genbank_mapping)
        mapped[genbank_idx] <- tmp
        source[genbank_idx][!is.na(tmp)] <- "GenBank"
    }

    havana_idx <- grepl('^OTTHUMT', ids)
    if (any(havana_idx)) {
        if (verbose) message("🔄 Havana → SYMBOL (gtf_mapping)")
        tmp <- convert_havana(ids[havana_idx], gtf_mapping = gtf_mapping)
        mapped[havana_idx] <- tmp
        source[havana_idx][!is.na(tmp)] <- "Havana"
    }

    ucsc_idx <- grepl('^uc\\d+', ids, ignore.case = TRUE)
    if (any(ucsc_idx)) {
        if (verbose) message("🔄 UCSC → SYMBOL")
        tmp <- convert_ucsc(ids[ucsc_idx])
        mapped[ucsc_idx] <- tmp
        source[ucsc_idx][!is.na(tmp)] <- "UCSC"
    }

    na_idx <- is.na(mapped)
    mapped[na_idx] <- orig_ids[na_idx]

    tibble(
        ID     = orig_ids,
        SYMBOL = mapped,
        Source = source
    )
}

# ==== 数据准备 ====
anno <- GPL17586_anno
anno <- anno[!(is.na(anno$SYMBOL) | anno$SYMBOL == ""), ]
anno <- anno[anno$SYMBOL != "---", ]

orig_id     <- anno[[1]]
gene_symbol <- anno$SYMBOL

cat("含下划线的ID数量:", sum(grepl("_", gene_symbol)), "\n")
cat("ENST类型的ID数量:", sum(grepl("^ENST", gene_symbol)), "\n")

# ==== 载入本地映射 ====
rdata_file_path <- "/Users/yuzuan/Desktop/2025_08_10 fastGEO/gencode.v46.annotation.gtf_havana_mapping.RData"
gtf_mapping <- load_rdata_mapping(rdata_file_path, verbose = TRUE)

gtf_path <- "/Users/yuzuan/Desktop/2025_08_10 fastGEO/gencode.v46.annotation.gtf"
tx_map_cache <- "/Users/yuzuan/Desktop/2025_08_10 fastGEO/gencode.v46.tx2symbol.rds"
transcript_mapping <- load_transcript_mapping(tx_map_cache, gtf_path, verbose = TRUE)

genbank_map_path <- NULL  # 如果你准备了 GenBank 映射 RDS，填入路径
genbank_mapping <- load_genbank_mapping(genbank_map_path)

message("🚀 开始 ID 转换流程...\n")
result <- ids_to_symbol(
    gene_symbol,
    gtf_mapping        = gtf_mapping,
    transcript_mapping = transcript_mapping,
    genbank_mapping    = genbank_mapping,
    verbose            = TRUE
)
```

**本地校验命令（R 会话中执行）**
```r
length(transcript_mapping)               # 查看 ENST 缓存规模
head(transcript_mapping, 3)

table(result$Source)                     # 统计各类 ID 命中情况
sum(result$SYMBOL == result$ID)          # 未转换的条目数
subset(result, Source == "original")[1:5, ]
```

**可选后续步骤**
1. 若没有 GenBank 映射，可用手头注释表整理成 named vector，保存为 RDS 再填入 `genbank_map_path`。
2. 将 `result` 写入 CSV 或合并回表达矩阵，验证下游分析是否得到预期基因符号。

### 👤 User <sub>2025/10/26 23:47</sub>

ENSG开头的呢

### 🤖 Copilot <sub>2025/10/26 23:47</sub>

- 你的当前 `convert_ensg()` 已经是离线的：`org.Hs.eg.db` 内置了 ENSG→SYMBOL 映射，调用 `mapIds` 不会访问网络。  
- 如果你想和 GTF 完全一致，可用 GTF 额外构建 gene 级映射（`gene_id`→`gene_name`）并在 `convert_ensg()` 里优先使用它，再回退到 `org.Hs.eg.db`。示例：

```r
build_gene_mapping_from_gtf <- function(gtf_path, verbose = TRUE) {
    suppressPackageStartupMessages(library(rtracklayer))
    if (!file.exists(gtf_path)) {
        if (verbose) message("⚠️  GTF 文件不存在: ", gtf_path)
        return(NULL)
    }
    if (verbose) message("🧬 从 GTF 构建 ENSG → SYMBOL 映射...")
    gtf <- rtracklayer::import(gtf_path, format = "gtf")
    gene_rows <- gtf[gtf$type == "gene"]
    gene_id   <- mcols(gene_rows)$gene_id
    gene_name <- mcols(gene_rows)$gene_name
    keep <- !is.na(gene_id) & gene_id != "" &
            !is.na(gene_name) & gene_name != ""
    mapping <- gene_name[keep]
    names(mapping) <- gene_id[keep]
    mapping
}

convert_ensg <- function(ensg_ids, gene_mapping = NULL) {
    if (!is.null(gene_mapping)) {
        hits <- gene_mapping[ensg_ids]
        missing <- is.na(hits)
        if (any(!missing)) return(unname(hits))
        # 对未命中的补用 org.Hs.eg.db
        ensg_ids <- ensg_ids[missing]
    }
    fallback <- mapIds(org.Hs.eg.db,
                       keys     = ensg_ids,
                       column   = "SYMBOL",
                       keytype  = "ENSEMBL",
                       multiVals = "first")
    if (!is.null(gene_mapping)) {
        hits[missing] <- fallback
        return(unname(hits))
    }
    unname(fallback)
}
```

- 使用时先构建/缓存 `gene_mapping <- build_gene_mapping_from_gtf(gtf_path, verbose = TRUE)`，然后在 `ids_to_symbol()` 调用 `convert_ensg(ids[ensg_idx], gene_mapping = gene_mapping)`，即可保持完全离线且版本匹配。

### 👤 User <sub>2025/10/26 23:48</sub>

ENST，ENSG 的都写到source("offline_id_mapping.R")


### 🤖 Copilot <sub>2025/10/26 23:48</sub>

- 编好了 `offline_id_mapping.R`，其中 `convert_enst()`/`convert_ensg()` 直接从本地 GTF 衍生映射或 `org.Hs.eg.db` 取数，整个 `ids_to_symbol()` 流程保持离线；最后给出可选示例加载方式。

```r
# offline_id_mapping.R
suppressPackageStartupMessages({
    library(AnnotationDbi)
    library(org.Hs.eg.db)
    library(TxDb.Hsapiens.UCSC.hg38.knownGene)
    library(GenomicFeatures)
    library(tibble)
})

build_transcript_mapping_from_gtf <- function(gtf_path, verbose = TRUE) {
    if (!file.exists(gtf_path)) {
        if (verbose) message("⚠️  GTF 文件不存在: ", gtf_path)
        return(NULL)
    }
    if (verbose) message("🧬 从 GTF 构建 ENST → SYMBOL 映射...")
    suppressPackageStartupMessages(library(rtracklayer))
    gtf <- rtracklayer::import(gtf_path, format = "gtf")
    tx_rows <- gtf[gtf$type == "transcript"]
    transcript_id <- mcols(tx_rows)$transcript_id
    gene_symbol   <- mcols(tx_rows)$gene_name
    keep <- !is.na(transcript_id) & transcript_id != "" &
            !is.na(gene_symbol)   & gene_symbol   != ""
    mapping <- gene_symbol[keep]
    names(mapping) <- transcript_id[keep]
    mapping
}

build_gene_mapping_from_gtf <- function(gtf_path, verbose = TRUE) {
    if (!file.exists(gtf_path)) {
        if (verbose) message("⚠️  GTF 文件不存在: ", gtf_path)
        return(NULL)
    }
    if (verbose) message("🧬 从 GTF 构建 ENSG → SYMBOL 映射...")
    suppressPackageStartupMessages(library(rtracklayer))
    gtf <- rtracklayer::import(gtf_path, format = "gtf")
    gene_rows <- gtf[gtf$type == "gene"]
    gene_id   <- mcols(gene_rows)$gene_id
    gene_name <- mcols(gene_rows)$gene_name
    keep <- !is.na(gene_id) & gene_id != "" &
            !is.na(gene_name) & gene_name != ""
    mapping <- gene_name[keep]
    names(mapping) <- gene_id[keep]
    mapping
}

load_transcript_mapping <- function(rds_path = NULL,
                                    gtf_path = NULL,
                                    force = FALSE,
                                    verbose = TRUE) {
    if (!is.null(rds_path) && file.exists(rds_path) && !force) {
        if (verbose) message("📦 从缓存加载 transcript 映射: ", rds_path)
        return(readRDS(rds_path))
    }
    if (is.null(gtf_path)) {
        if (verbose) message("⚠️  未提供 GTF 路径，无法构建 transcript 映射")
        return(NULL)
    }
    mapping <- build_transcript_mapping_from_gtf(gtf_path, verbose = verbose)
    if (!is.null(rds_path) && !is.null(mapping)) {
        if (verbose) message("💾 写入 transcript 映射缓存: ", rds_path)
        saveRDS(mapping, rds_path)
    }
    mapping
}

load_gene_mapping <- function(rds_path = NULL,
                              gtf_path = NULL,
                              force = FALSE,
                              verbose = TRUE) {
    if (!is.null(rds_path) && file.exists(rds_path) && !force) {
        if (verbose) message("📦 从缓存加载 gene 映射: ", rds_path)
        return(readRDS(rds_path))
    }
    if (is.null(gtf_path)) {
        if (verbose) message("⚠️  未提供 GTF 路径，无法构建 gene 映射")
        return(NULL)
    }
    mapping <- build_gene_mapping_from_gtf(gtf_path, verbose = verbose)
    if (!is.null(rds_path) && !is.null(mapping)) {
        if (verbose) message("💾 写入 gene 映射缓存: ", rds_path)
        saveRDS(mapping, rds_path)
    }
    mapping
}

load_rdata_mapping <- function(rdata_file, verbose = TRUE) {
    if (!file.exists(rdata_file)) {
        if (verbose) message("⚠️  RData 文件不存在: ", rdata_file)
        return(NULL)
    }
    if (verbose) message("📂 加载 RData 映射文件...")
    env <- new.env()
    load(rdata_file, envir = env)
    if (!exists("otthumt_to_symbol_mapping", envir = env)) {
        if (verbose) message("❌ RData 中未找到 otthumt_to_symbol_mapping")
        return(NULL)
    }
    mapping <- env$otthumt_to_symbol_mapping
    if (verbose) message("✅ 成功加载 ", length(mapping), " 个 OTTHUMT 映射关系")
    mapping
}

load_genbank_mapping <- function(rds_path = NULL) {
    if (is.null(rds_path) || !file.exists(rds_path)) return(NULL)
    readRDS(rds_path)
}

convert_refseq <- function(refseq_ids) {
    mapIds(org.Hs.eg.db,
           keys     = refseq_ids,
           column   = "SYMBOL",
           keytype  = "REFSEQ",
           multiVals = "first")
}

convert_enst <- function(enst_ids, transcript_mapping = NULL) {
    res <- rep(NA_character_, length(enst_ids))
    names(res) <- enst_ids
    if (!is.null(transcript_mapping)) {
        hits <- transcript_mapping[enst_ids]
        res[!is.na(hits)] <- hits[!is.na(hits)]
    }
    unname(res)
}

convert_ensg <- function(ensg_ids, gene_mapping = NULL) {
    res <- rep(NA_character_, length(ensg_ids))
    names(res) <- ensg_ids
    if (!is.null(gene_mapping)) {
        hits <- gene_mapping[ensg_ids]
        res[!is.na(hits)] <- hits[!is.na(hits)]
    }
    missing <- is.na(res)
    if (any(missing)) {
        fallback <- mapIds(org.Hs.eg.db,
                           keys     = ensg_ids[missing],
                           column   = "SYMBOL",
                           keytype  = "ENSEMBL",
                           multiVals = "first")
        res[missing] <- fallback[ensg_ids[missing]]
    }
    unname(res)
}

convert_aceview <- function(ace_ids) sub("\\..*", "", ace_ids)

convert_genbank <- function(gb_ids, genbank_mapping = NULL) {
    if (is.null(genbank_mapping)) return(rep(NA_character_, length(gb_ids)))
    unname(genbank_mapping[gb_ids])
}

local({
    ucsc_cache <- NULL
    get_ucsc_map <- function() {
        if (is.null(ucsc_cache)) {
            txdb <- TxDb.Hsapiens.UCSC.hg38.knownGene
            tx   <- transcripts(txdb, columns = c("tx_name", "gene_id"))
            gene_map <- mapIds(org.Hs.eg.db,
                               keys     = tx$gene_id,
                               column   = "SYMBOL",
                               keytype  = "ENTREZID",
                               multiVals = "first")
            ucsc_cache <<- setNames(gene_map[match(tx$gene_id, names(gene_map))], tx$tx_name)
        }
        ucsc_cache
    }
    convert_ucsc <<- function(ucsc_ids) {
        tx_to_symbol <- get_ucsc_map()
        unname(tx_to_symbol[ucsc_ids])
    }
})

convert_havana <- function(havana_ids, gtf_mapping = NULL) {
    if (is.null(gtf_mapping)) return(rep(NA_character_, length(havana_ids)))
    unname(gtf_mapping[havana_ids])
}

ids_to_symbol <- function(ids,
                          gtf_mapping = NULL,
                          transcript_mapping = NULL,
                          gene_mapping = NULL,
                          genbank_mapping = NULL,
                          verbose = TRUE) {
    if (length(ids) == 0) {
        return(tibble(ID = character(), SYMBOL = character(), Source = character()))
    }
    orig_ids <- ids
    mapped   <- rep(NA_character_, length(ids))
    source   <- rep("original", length(ids))

    ref_idx <- grepl('^[NXA][MRK]_', ids)
    if (any(ref_idx)) {
        if (verbose) message("🔄 RefSeq → SYMBOL")
        tmp <- convert_refseq(ids[ref_idx])
        mapped[ref_idx] <- tmp
        source[ref_idx][!is.na(tmp)] <- "RefSeq"
    }

    enst_idx <- grepl('^ENST', ids)
    if (any(enst_idx)) {
        if (verbose) message("🔄 ENST → SYMBOL (本地 GTF 映射)")
        tmp <- convert_enst(ids[enst_idx], transcript_mapping = transcript_mapping)
        mapped[enst_idx] <- tmp
        source[enst_idx][!is.na(tmp)] <- "ENST-GTF"
    }

    ensg_idx <- grepl('^ENSG', ids)
    if (any(ensg_idx)) {
        if (verbose) message("🔄 ENSG → SYMBOL (本地/库映射)")
        tmp <- convert_ensg(ids[ensg_idx], gene_mapping = gene_mapping)
        mapped[ensg_idx] <- tmp
        source[ensg_idx][!is.na(tmp)] <- "ENSG"
    }

    ace_idx <- grepl('\\.', ids) & !enst_idx & !ref_idx
    if (any(ace_idx)) {
        if (verbose) message("🔄 AceView → SYMBOL")
        tmp <- convert_aceview(ids[ace_idx])
        mapped[ace_idx] <- tmp
        source[ace_idx][!is.na(tmp)] <- "AceView"
    }

    genbank_idx <- grepl('^BC\\d+', ids)
    if (any(genbank_idx) && !is.null(genbank_mapping)) {
        if (verbose) message("🔄 GenBank → SYMBOL (本地映射)")
        tmp <- convert_genbank(ids[genbank_idx], genbank_mapping = genbank_mapping)
        mapped[genbank_idx] <- tmp
        source[genbank_idx][!is.na(tmp)] <- "GenBank"
    }

    havana_idx <- grepl('^OTTHUMT', ids)
    if (any(havana_idx)) {
        if (verbose) message("🔄 Havana → SYMBOL (gtf_mapping)")
        tmp <- convert_havana(ids[havana_idx], gtf_mapping = gtf_mapping)
        mapped[havana_idx] <- tmp
        source[havana_idx][!is.na(tmp)] <- "Havana"
    }

    ucsc_idx <- grepl('^uc\\d+', ids, ignore.case = TRUE)
    if (any(ucsc_idx)) {
        if (verbose) message("🔄 UCSC → SYMBOL")
        tmp <- convert_ucsc(ids[ucsc_idx])
        mapped[ucsc_idx] <- tmp
        source[ucsc_idx][!is.na(tmp)] <- "UCSC"
    }

    na_idx <- is.na(mapped)
    mapped[na_idx] <- orig_ids[na_idx]

    tibble(
        ID     = orig_ids,
        SYMBOL = mapped,
        Source = source
    )
}

# 使用示例 (自选):
# gtf_path  <- "/path/to/gencode.v46.annotation.gtf"
# tx_cache  <- "/path/to/gencode.v46.tx2symbol.rds"
# gene_cache <- "/path/to/gencode.v46.gene2symbol.rds"
# transcript_mapping <- load_transcript_mapping(tx_cache, gtf_path, verbose = TRUE)
# gene_mapping <- load_gene_mapping(gene_cache, gtf_path, verbose = TRUE)
# gtf_mapping <- load_rdata_mapping("/path/to/gencode.v46.annotation.gtf_havana_mapping.RData")
# result <- ids_to_symbol(ids_vector,
#                         gtf_mapping        = gtf_mapping,
#                         transcript_mapping = transcript_mapping,
#                         gene_mapping       = gene_mapping,
#                         verbose            = TRUE)
```

- 验证建议：
  ```r
  table(result$Source)
  sum(result$SYMBOL == result$ID)
  ```
- 下一步可选：  
  1. 若后面还需要离线缓存，执行 `saveRDS(transcript_mapping, tx_cache)` 与 `saveRDS(gene_mapping, gene_cache)`。  
  2. 用 `identical` 对照旧表，确保替换后 ENST/ENSG 都映射到期望基因符号。

### 👤 User <sub>2025/10/27 00:07</sub>

目前除了gencode.v46.annotation，还有什么常用的基因对应表

### 🤖 Copilot <sub>2025/10/27 00:07</sub>

- **Ensembl releases**: 最新的 GRCh38/GRCh37 注释（例如 v111、v110 等）直接在 Ensembl FTP，给出 GTF/GFF3/GENCODE 风格文件，字段包含 `gene_id`、`gene_name` 等，适合构建 ENSG→Symbol 映射。  
- **NCBI RefSeq**: `Homo_sapiens.GRCh38.gene_info` 与 RefSeq GFF，可获得 GeneID、Symbol、Synonym 以及 RefSeq 转录本；Bioconductor 的 `org.Hs.eg.db` 与 NCBI Annotation Packages 就是基于此。  
- **HGNC 完整表**: HGNC 官方提供的 TSV（`hgnc_complete_set.txt`），用于人类基因标准命名，字段含 Approved Symbol、Name、Aliases、Ensembl ID、Entrez ID 等。  
- **UCSC Known Genes / Gencode-to-UCSC 映射**: UCSC 提供 `knownGene`、`kgXref`、`refGene` 等表，可从 Genome Browser Table Browser 下载，方便获得 ucXXXX 或 RefSeq/ENST 与 Symbol 对应。  
- **BioMart/biomaRt 离线导出**: 可以在 Ensembl Biomart 中批量导出 transcript/gene 与 HGNC symbol、一致的 chrom 坐标，保存为 TSV 供离线使用。  
- **Bioconductor EnsDb/TxDb 包**: 比如 `EnsDb.Hsapiens.v105`、`TxDb.Hsapiens.UCSC.hg38.knownGene`，已经把 Ensembl 或 UCSC 注释打包成 R 数据库，可直接用 AnnotationDbi 接口查询。

### 👤 User <sub>2025/10/27 00:08</sub>

他们下载地址分别是什么

### 🤖 Copilot <sub>2025/10/27 00:08</sub>

- **Ensembl GTF/GFF3** — Ensembl FTP mirrors当前 release（例如 v111）：  
  `https://ftp.ensembl.org/pub/release-111/gtf/homo_sapiens/`  
  `https://ftp.ensembl.org/pub/release-111/gff3/homo_sapiens/`  
  （老版本可在 `.../pub/release-<version>/`，GRCh37 维护在 `https://ftp.ensembl.org/pub/grch37/...`。）

- **GENCODE** — 官方人类注释（primary/annotation）：  
  `https://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_46/`  
  更新版把 `release_46` 换成最新编号；GTF、GFF3、基因/转录本表都在同目录。

- **NCBI RefSeq Gene_info/GFF** — RefSeq FTP：  
  Gene_info TSV: `https://ftp.ncbi.nih.gov/gene/DATA/GENE_INFO/Mammalia/Homo_sapiens.gene_info.gz`  
  RefSeq GFF: `https://ftp.ncbi.nlm.nih.gov/refseq/H_sapiens/annotation/latest/`（目录内含 `GCF_*.gff.gz` 等文件）。

- **HGNC complete set** — 官方 TSV：  
  `https://storage.googleapis.com/hgnc-downloads/hgnc_complete_set.txt`  
  （也可从 `https://www.genenames.org/download/statistics-and-files/` 进入下载页面。）

- **UCSC Known Gene / RefGene** — Table Browser dumps：  
  GTF/GenePred 等直接在 `https://hgdownload.soe.ucsc.edu/goldenPath/hg38/database/`，常用文件：`knownGene.txt.gz`, `kgXref.txt.gz`, `refGene.txt.gz`, `refFlat.txt.gz`。  
  若想要 GTF，可取 `https://hgdownload.soe.ucsc.edu/goldenPath/hg38/bigZips/genes/`。

- **BiomaRt 离线导出** — 需网页操作：`https://www.ensembl.org/biomart/martview` 选择数据集后可导出 TSV；若想自动化，可以在 R 中调用 `biomaRt::useEnsembl()` 并使用 `getBM()`，或在网站保存 query 并使用 `wget`/`curl` 访问提供的 XML API 链接。

- **Bioconductor EnsDb/TxDb 包** — 通过 Bioconductor 安装：  
  EnsDb（e.g. v105）：  
  ```r
  if (!requireNamespace("BiocManager", quietly = TRUE)) install.packages("BiocManager")
  BiocManager::install("EnsDb.Hsapiens.v105")
  ```  
  TxDb（UCSC hg38 knownGene）：  
  ```r
  BiocManager::install("TxDb.Hsapiens.UCSC.hg38.knownGene")
  ```  
  （包下载自 Bioconductor CDN：`https://bioconductor.org/packages/release/data/annotation/`。）

如需脚本化批量下载，可用 `curl -O`/`wget` 结合上述 URL 直接拉取。

### 👤 User <sub>2025/10/27 00:11</sub>

是否这部分也可以加到offline_id_mapping.R里面去呢

### 🤖 Copilot <sub>2025/10/27 00:11</sub>


### 👤 User <sub>2025/10/27 00:11</sub>

是否这部分也可以加到offline_id_mapping.R里面去呢

### 🤖 Copilot <sub>2025/10/27 00:11</sub>

可以，把常用注释来源和下载地址直接整理成一个小工具函数放在 `offline_id_mapping.R` 里，随时 `source()` 后就能查看。以下是建议加入到 `offline_id_mapping.R`（放在函数区靠后位置即可）的一段代码，并不依赖联网，纯粹提供元数据：

```r
annotation_sources_catalog <- function() {
    tibble::tibble(
        provider = c(
            "Ensembl",
            "GENCODE",
            "NCBI RefSeq (gene_info)",
            "NCBI RefSeq (GFF)",
            "HGNC",
            "UCSC Known Gene",
            "Bioconductor EnsDb",
            "Bioconductor TxDb"
        ),
        description = c(
            "Ensembl 官方 GTF/GFF3，含 gene/transcript/exon 等层级注释",
            "GENCODE 主发布版（与 Ensembl 同步但含小差异），含更完整的 biotype 信息",
            "NCBI gene_info，提供 Entrez GeneID 与标准符号、同义名",
            "RefSeq 参考基因组注释 GFF，带 RefSeq transcript/gene 对应关系",
            "HGNC 官方人类基因命名表，含符号、别名、Ensembl/Entrez 对应",
            "UCSC knownGene / kgXref / refGene 等注释表，可获取 ucXXXX / RefSeq / Symbol 对应",
            "Bioconductor EnsDb H. sapiens 注释包（按 Ensembl 版本封装）",
            "Bioconductor TxDb H. sapiens 注释包（UCSC knownGene 封装）"
        ),
        primary_format = c(
            "GTF / GFF3",
            "GTF / GFF3 / TSV",
            "TSV",
            "GFF3",
            "TSV",
            "genePred / TXT / GTF",
            "R / SQLite 数据库包",
            "R / SQLite 数据库包"
        ),
        release_hint = c(
            "https://ftp.ensembl.org/pub/release-111/gtf/homo_sapiens/",
            "https://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_human/release_46/",
            "https://ftp.ncbi.nih.gov/gene/DATA/GENE_INFO/Mammalia/Homo_sapiens.gene_info.gz",
            "https://ftp.ncbi.nlm.nih.gov/refseq/H_sapiens/annotation/latest/",
            "https://storage.googleapis.com/hgnc-downloads/hgnc_complete_set.txt",
            "https://hgdownload.soe.ucsc.edu/goldenPath/hg38/database/",
            "BiocManager::install(\"EnsDb.Hsapiens.v105\")（替换版本号）",
            "BiocManager::install(\"TxDb.Hsapiens.UCSC.hg38.knownGene\")"
        )
    )
}
```

用法示例：

```r
source("offline_id_mapping.R")
annotation_sources_catalog()
```

这样你的脚本就内置了常见注释库的来源与下载入口（可以继续添加你常用的版本），后续维护时也更直观。若还想补充自动下载，可在此基础上再写一个 `download_annotation_resource(provider, dest)` 包装 `curl::curl_download()`，但保留为纯信息表最简洁、最安全。
