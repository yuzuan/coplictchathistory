# 帮我提取其中的 R代码，并形成 rmd 格式，其他的文字均为注释作用

| Field | Value |
|-------|-------|
| Session ID | `6d438a87-8ba1-4070-a332-b8891f8bbee8` |
| Workspace | (no workspace) |
| Start | 2025/05/22 20:45 |
| End | 2025/05/22 20:46 |
| Messages | 4 |

---

### 👤 User <sub>2025/05/22 20:45</sub>

帮我提取其中的 R代码，并形成 rmd 格式，其他的文字均为注释作用

### 🤖 Copilot <sub>2025/05/22 20:45</sub>

已为你将所有 R 代码提取并整理为 RMarkdown (Rmd) 格式，所有非代码部分均作为注释标题保留。由于当前环境为只读文件系统，无法直接生成文件，但你可以将以下内容复制到本地 `.Rmd` 文件中：

---
title: "CELL 图片复现 —— 点阵图加注释"
output: html_document
---

# CELL 图片复现 —— 点阵图加注释

```{r setup, message=FALSE}
library(tidyverse)
library(ggnewscale)

```

# 数据准备
```

{r 读取数据}
data <- readxl::read_excel('data/data.xlsx')

```

# 离散数据转为连续数据，方便位置调整
```

{r 坐标映射}
height <- c(0.6, 1)
gap <- 0.2
row_order <- structure(1:nrow(data), names = data$gene)
cancer_order <- structure(
    seq(height[1] * 3 + gap + height[2] * 8, height[1] * 3 + gap + height[2],
          length.out = 8),
    names = colnames(data)[2:9]
)
anno_order <- structure(
    seq(height[1], height[1] * 3, length.out = 3),
    names = rev(colnames(data)[10:12])
)

```

# 点图和色块图数据，以及分割线
```

{r 数据处理}
point.data <- dplyr::select(data, c(1:9)) %>%
    pivot_longer(CCRCC:UCEC) %>%
    dplyr::filter(!is.na(value)) %>%
    mutate(x = row_order[gene], y = cancer_order[name])

block.data <- dplyr::select(data, -c(2:9)) %>%
    pivot_longer(-1) %>%
    dplyr::filter(!is.na(value)) %>%
    mutate(x = row_order[gene], y = anno_order[name])

segment.data <- tibble(
    x = 1:nrow(data),
    xend = x,
    y = 0,
    yend = max(cancer_order)
)

```

# 文本标签数据
```

{r 标签数据}
label.point <- group_by(point.data, name, y) %>%
    reframe(count = n()) %>%
    mutate(label = paste0(name, ' (', count, ')'))
label.gene <- dplyr::select(point.data, gene, x) %>%
    distinct()
label.block <- group_by(block.data, name, y) %>%
    reframe(count = n())

```

# 边框数据
```

{r 边框数据}
cancer_border <- tibble(
    xmin = 0, xmax = nrow(data),
    ymin = max(anno_order) + gap, ymax = max(cancer_order)
)

anno_border <- tibble(
    xmin = 0, xmax = nrow(data),
    ymin = 0, ymax = max(anno_order)
)

```

# 颜色映射
```

{r 颜色映射}
drug <- structure(
    c('#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0'),
    names = paste0('T', 5:1)
)
pharos <- structure(
    c('#0a2239', '#01b287', '#ff9f1c', '#e5505a', '#854c9e',
      '#29c4d0', '#84afa2', '#72c427', '#f24c7c'),
    names = unique(data$`Pharos family`)
)
member <- c('Membrane' = '#f0ccb4')

cancer <- structure(
    c('#e35839', '#f0ad4e', '#033a8b', '#a66156', '#3be8b0', 
      '#30aabc', '#8e44ad', '#eb4962'),
    names = unique(point.data$name)
)

colorMap <- c(drug, pharos, member)

```

# 修改图例
```

{r 图例}
tier <- table(data$`Drug target tier`) %>%
    as.data.frame() %>%
    mutate(label = paste0(Var1, ' (', Freq, ')')) %>%
    pull(label, name = 'Var1')

pharos <- table(data$`Pharos family`) %>%
    as.data.frame() %>%
    mutate(label = paste0(Var1, ' (', Freq, ')')) %>%
    pull(label, name = 'Var1')

membrane <- table(data$Membrane) %>%
    as.data.frame() %>%
    mutate(label = paste0(Var1, ' (', Freq, ')')) %>%
    pull(label, name = 'Var1')

```

# 绘图
```

{r 绘图, fig.width=16, fig.height=5}
ggplot() +
    geom_segment(
        aes(x = x, y = y, xend = xend, yend = yend),
        data = segment.data,
        linewidth = 0.2
    ) +
    geom_rect(
        aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        data = cancer_border,
        fill = NA, colour = 'black', 
        linewidth = 0.5
    ) +
    geom_point(
        aes(x - 0.5, y - height[2]/2, colour = name), 
        data = point.data, 
        size = 6,
        show.legend = FALSE) +
    # gene name
    geom_text(
        aes(x = x - 0.5, y = -0.1, label = gene),
        data = label.gene,
        hjust = 1, angle = 90
    ) +
    # cancer type
    geom_text(
        aes(x = -.2, y = y - height[2] / 2 + 0.08, label = label),
        data = label.point,
        hjust = 1
    ) +
    geom_rect(
        aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        data = anno_border,
        fill = NA, colour = 'black', 
        linewidth = 0.5
    ) +
    # tier
    geom_tile(
        aes(x - 0.5, y - height[1] / 2, 
            height = height[1] * .8, width = .8, fill = value),
        data = dplyr::filter(block.data, name == 'Drug target tier')
    ) +
    scale_fill_manual(name = 'Drug\\ntarget\\ntier', values = colorMap,
                      labels = tier) +
    ggnewscale::new_scale_fill() +
    # pharos family
    geom_tile(
        aes(x - 0.5, y - height[1] / 2, 
            height = height[1] * .8, width = .8, fill = value),
        data = dplyr::filter(block.data, name == 'Pharos family')
    ) +
    scale_fill_manual(name = 'Pharos\\nfamily', values = colorMap,
                      labels = pharos) +
    ggnewscale::new_scale_fill() +
    # membrane
    geom_tile(
        aes(x - 0.5, y - height[1] / 2, 
            height = height[1] * .8, width = .8, fill = value),
        data = dplyr::filter(block.data, name == 'Membrane')
    ) +
    scale_fill_manual(name = 'Membrane', values = colorMap,
                      labels = membrane) +
    guides(
        fill = guide_legend(
          nrow = 2,  # 设置图例行数
          title.position = \"top\"  # 将图例标题放在图例上方
        )
    ) +
    # tier label
    geom_text(
        aes(x - 0.5, y - height[1] / 2, 
            label = value),
        data = dplyr::filter(block.data, name == 'Drug target tier')
    ) +
    # class name
    geom_text(
        aes(x = -.2, y = y - height[1] / 2 + 0.08, label = name),
        data = label.block,
        hjust = 1
    ) +
    scale_x_continuous(expand = expansion(c(0.1, 0))) +
    scale_y_continuous(expand = expansion(c(0.3, 0))) +
    scale_colour_manual(values = cancer) +
    theme(
        panel.grid.major = element_blank(),
        panel.border = element_blank(),
        panel.background = element_blank(),
        axis.title = element_blank(),
        axis.text = element_blank(),
        axis.ticks = element_blank(),
        legend.position = 'top',
        legend.title = element_text(size = 12)
    )
```

如需生成文件，请在本地新建 `.Rmd` 文件并粘贴以上内容即可。

### 👤 User <sub>2025/05/22 20:46</sub>

直接帮我生成

### 🤖 Copilot <sub>2025/05/22 20:46</sub>

以下是将你提供的 R 代码和注释整理为 RMarkdown (`.Rmd`) 文件的内容。你可以直接复制到本地 `.Rmd` 文件中使用，所有非代码部分均作为注释标题保留，代码块已用 Rmd 语法包裹：

---
title: "CELL 图片复现 —— 点阵图加注释"
output: html_document
---

# CELL 图片复现 —— 点阵图加注释

```{r setup, message=FALSE}
library(tidyverse)
library(ggnewscale)

```

# 数据准备
```

{r 读取数据}
data <- readxl::read_excel('data/data.xlsx')

```

# 离散数据转为连续数据，方便位置调整
```

{r 坐标映射}
height <- c(0.6, 1)
gap <- 0.2
row_order <- structure(1:nrow(data), names = data$gene)
cancer_order <- structure(
    seq(height[1] * 3 + gap + height[2] * 8, height[1] * 3 + gap + height[2],
          length.out = 8),
    names = colnames(data)[2:9]
)
anno_order <- structure(
    seq(height[1], height[1] * 3, length.out = 3),
    names = rev(colnames(data)[10:12])
)

```

# 点图和色块图数据，以及分割线
```

{r 数据处理}
point.data <- dplyr::select(data, c(1:9)) %>%
    pivot_longer(CCRCC:UCEC) %>%
    dplyr::filter(!is.na(value)) %>%
    mutate(x = row_order[gene], y = cancer_order[name])

block.data <- dplyr::select(data, -c(2:9)) %>%
    pivot_longer(-1) %>%
    dplyr::filter(!is.na(value)) %>%
    mutate(x = row_order[gene], y = anno_order[name])

segment.data <- tibble(
    x = 1:nrow(data),
    xend = x,
    y = 0,
    yend = max(cancer_order)
)

```

# 文本标签数据
```

{r 标签数据}
label.point <- group_by(point.data, name, y) %>%
    reframe(count = n()) %>%
    mutate(label = paste0(name, ' (', count, ')'))
label.gene <- dplyr::select(point.data, gene, x) %>%
    distinct()
label.block <- group_by(block.data, name, y) %>%
    reframe(count = n())

```

# 边框数据
```

{r 边框数据}
cancer_border <- tibble(
    xmin = 0, xmax = nrow(data),
    ymin = max(anno_order) + gap, ymax = max(cancer_order)
)

anno_border <- tibble(
    xmin = 0, xmax = nrow(data),
    ymin = 0, ymax = max(anno_order)
)

```

# 颜色映射
```

{r 颜色映射}
drug <- structure(
    c('#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0'),
    names = paste0('T', 5:1)
)
pharos <- structure(
    c('#0a2239', '#01b287', '#ff9f1c', '#e5505a', '#854c9e',
      '#29c4d0', '#84afa2', '#72c427', '#f24c7c'),
    names = unique(data$`Pharos family`)
)
member <- c('Membrane' = '#f0ccb4')

cancer <- structure(
    c('#e35839', '#f0ad4e', '#033a8b', '#a66156', '#3be8b0', 
      '#30aabc', '#8e44ad', '#eb4962'),
    names = unique(point.data$name)
)

colorMap <- c(drug, pharos, member)

```

# 修改图例
```

{r 图例}
tier <- table(data$`Drug target tier`) %>%
    as.data.frame() %>%
    mutate(label = paste0(Var1, ' (', Freq, ')')) %>%
    pull(label, name = 'Var1')

pharos <- table(data$`Pharos family`) %>%
    as.data.frame() %>%
    mutate(label = paste0(Var1, ' (', Freq, ')')) %>%
    pull(label, name = 'Var1')

membrane <- table(data$Membrane) %>%
    as.data.frame() %>%
    mutate(label = paste0(Var1, ' (', Freq, ')')) %>%
    pull(label, name = 'Var1')

```

# 绘图
```

{r 绘图, fig.width=16, fig.height=5}
ggplot() +
    geom_segment(
        aes(x = x, y = y, xend = xend, yend = yend),
        data = segment.data,
        linewidth = 0.2
    ) +
    geom_rect(
        aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        data = cancer_border,
        fill = NA, colour = 'black', 
        linewidth = 0.5
    ) +
    geom_point(
        aes(x - 0.5, y - height[2]/2, colour = name), 
        data = point.data, 
        size = 6,
        show.legend = FALSE) +
    # gene name
    geom_text(
        aes(x = x - 0.5, y = -0.1, label = gene),
        data = label.gene,
        hjust = 1, angle = 90
    ) +
    # cancer type
    geom_text(
        aes(x = -.2, y = y - height[2] / 2 + 0.08, label = label),
        data = label.point,
        hjust = 1
    ) +
    geom_rect(
        aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        data = anno_border,
        fill = NA, colour = 'black', 
        linewidth = 0.5
    ) +
    # tier
    geom_tile(
        aes(x - 0.5, y - height[1] / 2, 
            height = height[1] * .8, width = .8, fill = value),
        data = dplyr::filter(block.data, name == 'Drug target tier')
    ) +
    scale_fill_manual(name = 'Drug\\ntarget\\ntier', values = colorMap,
                      labels = tier) +
    ggnewscale::new_scale_fill() +
    # pharos family
    geom_tile(
        aes(x - 0.5, y - height[1] / 2, 
            height = height[1] * .8, width = .8, fill = value),
        data = dplyr::filter(block.data, name == 'Pharos family')
    ) +
    scale_fill_manual(name = 'Pharos\\nfamily', values = colorMap,
                      labels = pharos) +
    ggnewscale::new_scale_fill() +
    # membrane
    geom_tile(
        aes(x - 0.5, y - height[1] / 2, 
            height = height[1] * .8, width = .8, fill = value),
        data = dplyr::filter(block.data, name == 'Membrane')
    ) +
    scale_fill_manual(name = 'Membrane', values = colorMap,
                      labels = membrane) +
    guides(
        fill = guide_legend(
          nrow = 2,  # 设置图例行数
          title.position = \"top\"  # 将图例标题放在图例上方
        )
    ) +
    # tier label
    geom_text(
        aes(x - 0.5, y - height[1] / 2, 
            label = value),
        data = dplyr::filter(block.data, name == 'Drug target tier')
    ) +
    # class name
    geom_text(
        aes(x = -.2, y = y - height[1] / 2 + 0.08, label = name),
        data = label.block,
        hjust = 1
    ) +
    scale_x_continuous(expand = expansion(c(0.1, 0))) +
    scale_y_continuous(expand = expansion(c(0.3, 0))) +
    scale_colour_manual(values = cancer) +
    theme(
        panel.grid.major = element_blank(),
        panel.border = element_blank(),
        panel.background = element_blank(),
        axis.title = element_blank(),
        axis.text = element_blank(),
        axis.ticks = element_blank(),
        legend.position = 'top',
        legend.title = element_text(size = 12)
    )
```

如需生成文件，请在本地新建 `.Rmd` 文件并粘贴以上内容即可。
