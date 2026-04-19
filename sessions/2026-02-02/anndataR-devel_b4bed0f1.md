# 从当前文件中帮我查看h5d 文件的多分辨率聚类结果和Seurat的分辨率结果是如何转换的

| Field | Value |
|-------|-------|
| Session ID | `b4bed0f1-db78-4036-a481-e1d23f485836` |
| Workspace | anndataR-devel |
| Start | 2026/02/02 00:13 |
| End | 2026/02/02 00:15 |
| Messages | 2 |

---

### 👤 User <sub>2026/02/02 00:15</sub>

从当前文件中帮我查看h5d 文件的多分辨率聚类结果和Seurat的分辨率结果是如何转换的

### 🤖 Copilot <sub>2026/02/02 00:15</sub>

我来帮你查看 h5ad 文件中的多分辨率聚类结果和 Seurat 的分辨率结果是如何转换的。

让我继续查看更多相关代码，特别是关于 obs 映射的处理：

让我查看 guess 函数，它们负责自动识别要转换的项：

现在让我查看测试文件，了解具体的使用场景：

现在让我创建一个综合说明文档来解释 h5ad 文件和 Seurat 对象之间关于聚类结果的转换机制：

根据我查看的代码，我来为你总结 h5ad 文件的多分辨率聚类结果和 Seurat 的分辨率结果是如何转换的：

## **转换机制总结**

### **1. 从 Seurat → AnnData (h5ad)**

在 from_Seurat.R 中，聚类结果的转换主要通过 **`obs` 映射**完成：

```
# Seurat 对象的细胞元数据（包括聚类结果）→ AnnData 的 obs
.from_Seurat_guess_obs <- function(seurat_obj, assay_name) {
  # 所有细胞元数据列（包括 seurat_clusters, RNA_snn_res.0.5 等）都会被转换
  setNames(names(seurat_obj[[]]), names(seurat_obj[[]]))
}
```

**具体过程：**
- Seurat 对象的 `obj[[]]` 中的所有细胞元数据列会被提取
- 包括：
  - `seurat_clusters`: 默认聚类结果
  - `RNA_snn_res.0.5`, `RNA_snn_res.0.8`, `RNA_snn_res.1.0` 等：多分辨率聚类结果
  - 其他元数据如 `nCount_RNA`, `nFeature_RNA` 等
- 这些列会直接复制到 AnnData 的 `obs` 数据框中，保持相同的列名

**示例：**

```
# Seurat 对象
obj$meta.data:
  orig.ident  nCount_RNA  seurat_clusters  RNA_snn_res.0.5  RNA_snn_res.0.8
  
# 转换后的 AnnData
adata$obs:
  orig.ident  nCount_RNA  seurat_clusters  RNA_snn_res.0.5  RNA_snn_res.0.8
```

### **2. 从 AnnData (h5ad) → Seurat**

在 as_Seurat.R 中，转换过程是反向的：

```
# AnnData 的 obs → Seurat 对象的细胞元数据
.as_Seurat_guess_object_metadata <- function(adata) {
  # 所有 obs 列都会被转换
  self_name(adata$obs_keys())
}
```

**具体过程：**
- AnnData 的 `obs` 数据框中的所有列会被提取
- 包括多分辨率聚类结果列（如果存在的话）
- 这些列会被添加到 Seurat 对象的 `obj[[]]` 元数据中

**示例：**

```
# AnnData 对象
adata$obs:
  cell_type  leiden_res_0.5  leiden_res_1.0  louvain_res_0.8
  
# 转换后的 Seurat
seurat[[]]:
  cell_type  leiden_res_0.5  leiden_res_1.0  louvain_res_0.8
```

### **3. 关键点**

#### **聚类结果在哪里存储？**
- **Seurat**: 存储在 `obj$meta.data` 或通过 `obj[[]]` 访问的细胞元数据中
- **AnnData/h5ad**: 存储在 `adata.obs` 数据框中

#### **命名约定**
- **Seurat 常见命名**:
  - `seurat_clusters`: 默认聚类
  - `<assay>_snn_res.<resolution>`: 多分辨率 SNN 聚类（如 `RNA_snn_res.0.5`）

- **Python scanpy 常见命名**:
  - `leiden`: Leiden 聚类
  - `leiden_res_<resolution>`: 多分辨率 Leiden（如 `leiden_res_0.5`）
  - `louvain`: Louvain 聚类

#### **自动转换规则**
默认情况下（`obs_mapping = TRUE` 或 `object_metadata_mapping = TRUE`）：
- **所有** `obs`/元数据列都会被转换
- 列名保持不变
- 数据类型保持不变（因子、整数、字符等）

#### **自定义映射**
你可以手动指定要转换哪些列：

```
# 从 Seurat 转换时只转换特定聚类
adata <- from_Seurat(
  seurat_obj,
  obs_mapping = c(
    "clusters_0.5" = "RNA_snn_res.0.5",
    "clusters_0.8" = "RNA_snn_res.0.8"
  )
)

# 从 AnnData 转换时重命名聚类列
seurat <- as_Seurat(
  adata,
  object_metadata_mapping = c(
    "seurat_clusters" = "leiden_res_0.5",
    "clusters_high_res" = "leiden_res_1.0"
  )
)
```

### **4. 测试验证**

在测试文件中可以看到验证过程：

```
# test-from_Seurat.R
for (obs_key in colnames(obj[[]])) {
  test_that(paste0("as_AnnData (Seurat) retains obs key: ", obs_key), {
    expect_equal(ad$obs[[obs_key]], obj[[obs_key]])
  })
}

# test-as_Seurat.R  
for (obs_key in colnames(ad$obs)) {
  test_that(paste0("as_Seurat retains obs key: ", obs_key), {
    expect_equal(seu[[]][[obs_key]], ad$obs[[obs_key]])
  })
}
```

### **总结**

多分辨率聚类结果的转换非常直接：
- **Seurat → h5ad**: `seurat_obj$meta.data` → `adata.obs`
- **h5ad → Seurat**: `adata.obs` → `seurat_obj$meta.data`
- 默认情况下所有列都会被转换，保持原始列名和数据类型
- 可以通过 `obs_mapping` 或 `object_metadata_mapping` 参数自定义映射规则

这种设计确保了不同聚类算法和分辨率的结果在两种格式之间能够无缝转换。
