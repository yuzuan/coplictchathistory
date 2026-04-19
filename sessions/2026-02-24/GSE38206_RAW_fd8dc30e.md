# 用 R代码将这个目录下的文件整合成一个行名为 gene，列名为样本的表达矩阵，列名为 GSM 开头的，保存时行名一定要为 gene，列名为样本，并确保我能...

| Field | Value |
|-------|-------|
| Session ID | `fd8dc30e-8050-48e9-8ab0-a85fce966102` |
| Workspace | GSE38206_RAW |
| Start | 2026/02/24 07:35 |
| End | 2026/02/24 07:35 |
| Messages | 2 |

---

### 👤 User <sub>2026/02/24 07:35</sub>

用 R代码将这个目录下的文件整合成一个行名为 gene，列名为样本的表达矩阵，列名为 GSM 开头的，保存时行名一定要为 gene，列名为样本，并确保我能准确用 R 代码读取

### 🤖 Copilot <sub>2026/02/24 07:35</sub>

文件格式复杂，先进一步确认关键列结构：

结构清楚：FEATURES 行第 10 行为列名，表达量用 `gProcessedSignal`，基因标识用 `ProbeName`，`ControlType==0` 为非对照探针。现在创建 R 脚本：

脚本已创建，现在运行验证：

子集化后 `$G` 降维，需改用矩阵下标。修复脚本：

`limma` 单通道数据表达量存储在 `$E`（不是 `$G`），`columns` 参数的键也需改为 `E`：

成功。最后验证读取是否正确：

CSV 中存在重复探针名，需用 `make.unique()` 处理后再保存：

全部成功。总结如下：

---

**生成文件**

| 文件 | 说明 |
|---|---|
|

| RDS 格式（推荐，读取快） |
|

| CSV 格式（通用） |
|

| 构建脚本 |

**矩阵规格**：58,717 个探针 × 36 个样本，行名为 Agilent `ProbeName`（如 `A_23_P326296`），列名为 `GSMxxxxxx`，表达值来自 `gProcessedSignal`（原始荧光信号，已过滤对照探针）。

---

**读取方式**

```
# 方式 1：RDS（推荐，行列名完整保留）
expr <- readRDS("/Users/yuzuan/Downloads/GSE38206_RAW/expression_matrix.rds")

# 方式 2：CSV（row.names=1 让第一列变行名，check.names=FALSE 防止列名被改写）
expr <- read.csv("/Users/yuzuan/Downloads/GSE38206_RAW/expression_matrix.csv",
                 row.names = 1, check.names = FALSE)

# 验证
dim(expr)           # 58717    36
rownames(expr)[1:3] # A_23_P326296 ...
colnames(expr)[1:3] # GSM936718 GSM936719 GSM936720
```
