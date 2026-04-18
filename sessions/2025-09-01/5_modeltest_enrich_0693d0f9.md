# 绘制密度图和绘制柱状图要合并时在横向要一一对应

| Field | Value |
|-------|-------|
| Session ID | `0693d0f9-0850-4c31-b579-cacbfd37bc39` |
| Workspace | 5_modeltest_enrich |
| Start | 2025/09/01 22:21 |
| End | 2025/09/01 23:47 |
| Messages | 12 |

---

### 👤 User <sub>2025/09/01 22:23</sub>

绘制密度图和绘制柱状图要合并时在横向要一一对应

### 🤖 Copilot <sub>2025/09/01 22:23</sub>

我来查看您的代码，分析密度图和柱状图合并时的对应问题。

我发现问题了！在您的代码中，密度图和柱状图虽然都使用了相同的 `custom_order` 来排序，但是在创建密度图的数据时，可能会出现一些基因集在 `density_data` 中缺失的情况，导致两个图的 y 轴不完全对应。

让我修复这个问题，确保两个图的 y 轴完全一致：

我已经修复了代码中的关键问题。主要的修改包括：

## 修改内容：

1. **统一排序逻辑**：
   - 将 `custom_order` 的定义移到了数据处理之前
   - 确保两个图都使用相同的排序

2. **数据一致性**：
   - 在 `density_data` 创建时，确保所有的 `Description` 都被包含
   - 在数据处理阶段就将 `Description` 转换为 factor，使用统一的 `levels`

3. **y轴对齐**：
   - 在两个图中都添加了 `scale_y_discrete(limits = rev(custom_order))`
   - 直接使用已经是 factor 的 `Description` 变量
   - 使用 `rev()` 确保顺序从上到下与 NES 绝对值排序一致

4. **数据完整性检查**：
   - 添加了 `filter()` 确保只包含 `custom_order` 中的基因集
   - 在 `left_join` 时使用了更精确的连接条件

## 修改的核心要点：

- **统一的因子水平**：两个图现在都使用相同的 `custom_order` 来定义 y 轴的顺序
- **明确的 y 轴控制**：通过 `scale_y_discrete(limits = rev(custom_order))` 确保两个图的 y 轴完全对应
- **数据完整性**：确保密度图和柱状图包含完全相同的基因集

现在当您运行这段代码时，密度图和柱状图在横向合并时会完美对应，每一行都代表相同的基因集。

### 👤 User <sub>2025/09/01 23:29</sub>

library(clusterProfiler)
library(org.Hs.eg.db)
library(dplyr)
library(ggplot2)
library(stringr)
library(ggprism)
library(gground)
library(tibble)
library(tidyverse)

# 设置颜色
pal <- c('#7bc4e2', '#acd372', '#fbb05b', '#ed6ca4')  # BP, CC, MF, KEGG对应的颜色

# 使用已有的ekk和ego结果（已经从前面的代码中获得）
# 如果需要重新运行前面的富集分析，取消下面的注释
# load("risk_DEG.Rdata")
# deg = DEG1
# g = rownames(deg)[deg$change!="NOT"]
# output <- bitr(g, fromType = 'SYMBOL', toType = 'ENTREZID', OrgDb = 'org.Hs.eg.db')
# gene_diff = output$ENTREZID
# ekk <- enrichKEGG(gene = gene_diff, organism = 'hsa')
# ekk <- setReadable(ekk, OrgDb = org.Hs.eg.db, keyType = "ENTREZID")
# ego <- enrichGO(gene = gene_diff, OrgDb= org.Hs.eg.db, ont = "ALL", readable = TRUE)

# 转换结果为数据框
GO <- as.data.frame(ego)
KEGG <- as.data.frame(ekk)
  
# 整合GO和KEGG结果
use_pathway <- GO %>% 
  group_by(ONTOLOGY) %>%
  # 每个GO类别选择最显著的5个
  top_n(5, wt = -p.adjust) %>%
  # 在每个p值组内选择基因数最多的
  group_by(p.adjust) %>%
  top_n(1, wt = Count) %>%
  rbind(
    # 添加KEGG结果，选择最显著的5个
    KEGG %>% 
      top_n(5, -p.adjust) %>%
      group_by(p.adjust) %>%
      top_n(1, wt = Count) %>%
      mutate(ONTOLOGY = 'KEGG')
  ) %>%
  ungroup() %>%
  # 设置因子水平，调整显示顺序
  mutate(ONTOLOGY = factor(ONTOLOGY, 
                           levels = rev(c('BP', 'CC', 'MF', 'KEGG')))) %>%
  arrange(ONTOLOGY, p.adjust) %>%
  # 确保描述按照计划的顺序显示
  mutate(Description = factor(Description, levels = Description)) %>%
  # 添加索引列用于定位
  rowid_to_column('index')

# 标准化基因ID格式，确保它们使用逗号分隔
use_pathway$geneID <- str_replace_all(use_pathway$geneID, "/", ",")

# 设置布局参数
width <- 5  # 左侧基因数量点的宽度
xaxis_max <- max(-log10(use_pathway$p.adjust)) + 1  # x轴最大长度

# 创建左侧分类标签数据
rect.data <- group_by(use_pathway, ONTOLOGY) %>%
  summarize(n = n()) %>%
  ungroup() %>%
  mutate(
    xmin = -3 * width,
    xmax = -2 * width,
    ymax = cumsum(n),
    ymin = lag(ymax, default = 0) + 0.6,
    ymax = ymax + 0.4
  )

# 创建整合的富集分析可视化
pathway_plot <- use_pathway %>%
  ggplot(aes(-log10(p.adjust), y = index, fill = ONTOLOGY)) +
  # 主要显示条形
  geom_round_col(
    aes(y = Description), width = 0.6, alpha = 0.8
  ) +
  # 通路/GO Term名称
  geom_text(
    aes(x = 0.05, label = Description),
    hjust = 0, size = 5
  ) +
  # 显示基因（仅显示前面部分，防止过长）
  geom_text(
    aes(x = 0.1, label = substr(geneID, 1, 40), colour = ONTOLOGY),  # 限制字符长度
    hjust = 0, vjust = 2.6, size = 3.5, fontface = 'italic', 
    show.legend = FALSE
  ) +
  # 基因数量
  geom_point(
    aes(x = -width, size = Count),
    shape = 21
  ) +
  geom_text(
    aes(x = -width, label = Count)
  ) +
  scale_size_continuous(name = 'Count', range = c(5, 16)) +
  # 分类标签
  geom_round_rect(
    aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax,
        fill = ONTOLOGY),
    data = rect.data,
    radius = unit(2, 'mm'),
    inherit.aes = FALSE
  ) +
  geom_text(
    aes(x = (xmin + xmax) / 2, y = (ymin + ymax) / 2, label = ONTOLOGY),
    data = rect.data,
    inherit.aes = FALSE
  ) +
  # 添加x轴基线
  geom_segment(
    aes(x = 0, y = 0, xend = xaxis_max, yend = 0),
    linewidth = 1.5,
    inherit.aes = FALSE
  ) +
  # 图表标签和样式
  labs(
    y = NULL,
    title = "Pathway Enrichment Analysis",
    x = "-log10(adjusted p-value)"
  ) +
  scale_fill_manual(name = 'Category', values = pal) +
  scale_colour_manual(values = pal) +
  scale_x_continuous(
    breaks = seq(0, xaxis_max, 10), 
    expand = expansion(c(0, 0))
  ) +
  theme_prism() +
  theme(
    axis.text.y = element_blank(),
    axis.line = element_blank(),
    axis.ticks.y = element_blank(),
    legend.title = element_text(),
    plot.title = element_text(hjust = 0.5, size = 16)
  )

# 显示图表
pathway_plot
我这边计算了一下，基因数目在 2-7 个左右，帮我改一下这个代码

### 🤖 Copilot <sub>2025/09/01 23:29</sub>

我理解了，您的基因数目在2-7个左右，需要调整代码中的一些参数来适应这个范围。主要需要调整的是点的大小范围和布局参数。让我帮您优化这个代码：

我已经根据您的基因数目范围（2-7个）对代码进行了以下优化：

## 主要修改：

1. **调整布局参数**：
   - `width` 从 5 减小到 3，适应较小的基因数量
   - 左侧分类标签位置相应调整（`xmin` 和 `xmax`）

2. **优化点大小范围**：
   - `scale_size_continuous` 的范围从 `c(5, 16)` 调整为 `c(3, 8)`
   - 这样更适合显示2-7个基因的差异

3. **调整文字大小**：
   - 通路名称字体从 `size = 5` 调整为 `size = 4`
   - 基因数量标签添加了 `size = 3.5`
   - 基因名称字体从 `size = 3.5` 调整为 `size = 3`

4. **增加基因显示长度**：
   - 基因名称显示长度从40个字符增加到50个字符
   - 因为基因数量较少，可以显示更多信息

5. **优化x轴刻度**：
   - x轴刻度间隔从10调整为2，提供更精细的刻度显示

这些调整将使图表更适合显示少量基因（2-7个）的富集分析结果，点的大小差异更明显，文字布局更合理。

### 👤 User <sub>2025/09/01 23:32</sub>

三个距离太长了，可以搞小一点

### 🤖 Copilot <sub>2025/09/01 23:32</sub>

我理解您想要缩短左侧基因数量点、分类标签和主图之间的距离。让我帮您调整这些参数：

我已经帮您缩短了三个元素之间的距离：

## 主要调整：

1. **整体距离缩短**：
   - `width` 从 3 减小到 1.5，大幅缩短整体距离

2. **分类标签位置调整**：
   - `xmin` 从 `-2.5 * width` 调整为 `-2.2 * width`
   - `xmax` 从 `-1.8 * width` 调整为 `-1.6 * width`
   - 缩短了分类标签到基因数量点的距离

3. **文字位置调整**：
   - 通路名称的 x 位置从 `0.05` 调整为 `0.02`
   - 基因名称的 x 位置从 `0.1` 调整为 `0.05`
   - 缩短了文字到主图条形的距离

现在整个图表会更加紧凑，三个部分（分类标签、基因数量点、主图）之间的距离都被缩短了，视觉效果会更加整洁。

### 👤 User <sub>2025/09/01 23:40</sub>

三个部分（分类标签、基因数量点、主图）之间的距离要更短

### 🤖 Copilot <sub>2025/09/01 23:40</sub>

我理解您需要进一步缩短三个部分之间的距离。让我进一步压缩这些距离：

我已经进一步大幅缩短了三个部分之间的距离：

## 主要调整：

1. **大幅减小基础距离**：
   - `width` 从 1.5 减小到 0.8，距离缩短约一半

2. **分类标签位置进一步调整**：
   - `xmin` 从 `-2.2 * width` 调整为 `-1.8 * width`
   - `xmax` 从 `-1.6 * width` 调整为 `-1.3 * width`
   - 分类标签更靠近基因数量点

3. **文字位置极大缩短**：
   - 通路名称的 x 位置从 `0.02` 调整为 `0.01`
   - 基因名称的 x 位置从 `0.05` 调整为 `0.02`
   - 文字几乎紧贴主图条形

现在三个部分（分类标签、基因数量点、主图）之间的距离已经被压缩到最小，整个图表会非常紧凑。如果您觉得还需要更进一步的调整，可以告诉我具体的需求。

### 👤 User <sub>2025/09/01 23:44</sub>

基因数量点、主图之间的距离压缩一点

### 🤖 Copilot <sub>2025/09/01 23:44</sub>

我理解您想要进一步压缩基因数量点和主图之间的距离。让我调整基因数量点的位置：

我已经将 `width` 从 0.8 进一步减小到 0.5，这样基因数量点和主图之间的距离就被进一步压缩了。

## 调整效果：

- **基因数量点位置**：现在位于 `x = -0.5` 的位置，更靠近主图（主图从 x=0 开始）
- **分类标签位置**：相应地也会更靠近基因数量点，整体布局更加紧凑

这样基因数量点和主图条形之间只有 0.5 个单位的距离，视觉上会非常紧凑。如果您觉得还需要进一步调整，可以继续告诉我。

### 👤 User <sub>2025/09/01 23:47</sub>

分类标签、基因数量点之间距离大一点

### 🤖 Copilot <sub>2025/09/01 23:47</sub>

我理解您想要增加分类标签和基因数量点之间的距离。让我调整分类标签的位置：

我已经调整了分类标签的位置，增加了与基因数量点之间的距离：

## 调整效果：

- **分类标签位置**：
  - `xmin` 从 `-1.8 * width` 调整为 `-2.8 * width`
  - `xmax` 从 `-1.3 * width` 调整为 `-2.0 * width`
  - 现在分类标签位于 x = -1.4 到 -1.0 的位置

- **距离效果**：
  - 分类标签右边缘（-1.0）到基因数量点（-0.5）之间现在有 0.5 个单位的距离
  - 比之前的距离增加了约 0.3 个单位

这样分类标签和基因数量点之间就有了更合适的间距，同时保持了基因数量点和主图之间的紧凑距离。
