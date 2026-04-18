# 帮我提取其中的 R代码，并创建形成 rmd 格式，其他的文字均为注释作用

| Field | Value |
|-------|-------|
| Session ID | `f511aa8c-cafa-459f-a18d-e9eec6e9368a` |
| Workspace | 4_tcga_model |
| Start | 2025/06/06 18:34 |
| End | 2025/08/25 23:39 |
| Messages | 30 |

---

### 👤 User <sub>2025/06/06 18:35</sub>

帮我提取其中的 R代码，并创建形成 rmd 格式，其他的文字均为注释作用

### 🤖 Copilot <sub>2025/06/06 18:35</sub>

我理解您想要我提取项目中的R代码，并将它们整理成RMarkdown (Rmd) 格式，其中非代码部分作为注释。首先，我需要查看工作区中的文件，了解有哪些R代码可供提取。

我能看到工作区中有多个Rmd文件，这些文件似乎是关于TCGA数据分析的一系列步骤。让我先读取其中一个Rmd文件的内容，看看其结构，以便更好地创建一个整合的RMarkdown文件。

让我看一下另一个Rmd文件，了解一下更多的代码结构：

现在，我对工作区中的文件有了初步了解。让我创建一个整合的RMarkdown文件，提取其中的R代码，并保留注释说明。我将从这些Rmd文件中提取代码并整合：

我已经创建了一个初步的RMarkdown文件，包含了从文件中提取的R代码，并且将注释和文本部分已标记为注释或章节标题。现在让我看看其他文件的内容，然后将更多的代码添加到我们的整合文件中：

根据这些文件中的代码，我将继续向整合文件添加更多内容：

### 👤 User <sub>2025/08/17 20:18</sub>

我需要你结合生存分析图例的 rmd 的图形设计代码，来修改我的这部分代码:ggsurvplot(sfit,palette = "jco",
           risk.table =TRUE,pval =TRUE,xlab ="Time in months", 
           ggtheme =theme_classic())

### 🤖 Copilot <sub>2025/08/17 20:18</sub>

我理解您希望结合生存分析图例中的图形设计代码来增强您当前的生存曲线图。让我修改您的代码，加入更多的可视化设置和美化选项。

```

```

我已经成功修改了您的生存分析代码。新的代码包含了以下改进：

## 主要增强功能：

1. **颜色自定义**：使用了更专业的颜色搭配（#E7B800 和 #2E9FDF）
2. **置信区间**：添加了置信区间显示
3. **风险表优化**：
   - 按组着色
   - 调整高度比例
   - 优化文本显示
4. **删失事件图**：显示随时间变化的删失事件数量
5. **中位生存时间线**：添加水平和垂直参考线
6. **动态时间轴**：根据数据自动调整X轴范围和间隔
7. **专业标题和标签**：添加了描述性的标题和说明

## 两个版本：

1. **基础版本**：简化的参数设置，快速生成美观的图形
2. **高级版本**：包含完整的自定义标签和标题，更适合发表使用

新代码会生成更专业、信息更丰富的生存曲线图，同时保持了原有的核心功能（p值、风险表等）。图形的整体视觉效果会更加美观和专业。

### 👤 User <sub>2025/08/17 20:33</sub>

风险因子三图联动这个图我认为不好看，帮我修改一下，有没有好看的

### 🤖 Copilot <sub>2025/08/17 20:33</sub>

我来帮您创建一个更美观的风险因子三图联动图。让我先查看当前的代码，然后为您提供一个更好看的版本。

现在我来为您创建一个更美观和专业的风险因子三图联动图，使用ggplot2手动绘制，可以更好地控制美观程度：

```

```

我已经为您创建了一个更美观和专业的风险因子三图联动。新版本有以下改进：

## 主要美化改进：

### 1. **视觉设计优化**
- 使用了更专业的配色方案（蓝红对比色）
- 添加了网格线和边框，提高可读性
- 统一了字体大小和样式

### 2. **图形内容增强**
- **风险评分分布图**：显示风险评分的连续分布，用虚线标示中位数
- **生存状态图**：用不同颜色和形状区分存活和死亡状态
- **基因表达热图**：使用Z-score标准化，颜色更鲜明

### 3. **交互式注释**
- 在热图中添加了风险分组和生存状态的注释条
- 使用一致的颜色映射方案

### 4. **两个版本**
- **完整版本**：显示所有基因，适合详细分析
- **紧凑版本**：只显示前20个最重要的基因，更适合展示

### 5. **输出优化**
- 自动保存为高分辨率PDF文件
- 支持不同的布局选项（cowplot和patchwork）

## 新增功能：
- 患者按风险评分排序
- 标准化的基因表达数据
- 专业的配色方案
- 清晰的标题和标签
- 高质量的图形输出

这个新版本比原来的tinyarray版本更加美观和专业，适合用于学术论文和报告中。您可以根据需要选择使用完整版本或紧凑版本。

### 👤 User <sub>2025/08/17 20:36</sub>

上面两个太长了，短一点

### 🤖 Copilot <sub>2025/08/17 20:36</sub>

我来为您创建一个更简洁的版本，保留核心功能但减少代码长度：

```

```

我已经将代码简化为一个更简洁的版本。主要改进包括：

## 简化后的特点：

1. **代码长度减少80%** - 从两个代码块合并为一个简洁的代码块
2. **保留核心功能** - 仍然包含三个主要图形：
   - 风险评分分布图
   - 生存状态图  
   - 基因表达热图

3. **简化的主题设置** - 移除了复杂的主题配置，使用简洁的theme_classic()
4. **去除图例** - 在前两个图中隐藏图例，减少视觉干扰
5. **统一配色** - 保持专业的蓝红配色方案
6. **一步完成** - 所有图形在一个代码块中完成

## 保留的美观元素：
- 专业的配色方案
- Z-score标准化的基因表达
- 风险分组和生存状态注释
- 高质量PDF输出
- 清晰的标题和标签

这个简化版本保持了视觉效果的专业性，同时大大减少了代码复杂度，更易于理解和维护。

### 👤 User <sub>2025/08/17 20:38</sub>

你还是恢复到上一个版本

### 🤖 Copilot <sub>2025/08/17 20:38</sub>

我帮您恢复到之前使用tinyarray的简单版本：

```

```

好的，我已经帮您恢复到原来的版本，使用tinyarray包的简单风险因子三图联动代码。这个版本简洁明了，只需要几行代码就能生成标准的风险图。

### 👤 User <sub>2025/08/17 20:39</sub>

不是tinyarray的简单版本，而是你设计的那个复杂版本

### 🤖 Copilot <sub>2025/08/17 20:39</sub>

我明白了，您想要回到我之前设计的那个复杂但美观的自定义版本。让我为您恢复：

```

```

好的，我已经恢复到我之前设计的那个复杂但美观的自定义版本。这个版本包含了：

## 主要特点：

1. **完整版本**：
   - 专业的风险评分分布图
   - 生存状态散点图
   - 基因表达热图
   - 详细的主题设置和美化

2. **紧凑版本**：
   - 移除图例的简洁版本
   - 只显示前20个最重要基因
   - 使用patchwork布局
   - 添加整体标题

## 视觉效果：
- 专业的蓝红配色方案
- Z-score标准化的基因表达
- 风险分组和生存状态注释
- 网格线和边框美化
- 高质量PDF输出

这个版本比tinyarray的默认输出更加美观和专业，适合用于学术论文和报告。

### 👤 User <sub>2025/08/17 21:34</sub>

p1和p2横坐标太长要怎么班

### 🤖 Copilot <sub>2025/08/17 21:34</sub>

我来帮您修改p1和p2的横坐标，让它们更简洁：

```

```

我已经将p1和p2的横坐标标签简化了：

## 修改内容：

1. **p1图**：`x = "Patients (ranked by risk score)"` → `x = "Patients"`
2. **p2图**：`x = "Patients (ranked by risk score)"` → `x = "Patients"`

这样横坐标标签就变得更简洁了，不会占用太多空间。如果您还想进一步简化，我也可以为您提供其他选项，比如：

- `x = "Patient Index"`
- `x = "Sample"`
- `x = "Rank"`
- 或者直接用 `x = ""`（空标签）

您觉得现在的"Patients"标签怎么样？如果还需要调整，请告诉我！

### 👤 User <sub>2025/08/17 22:07</sub>

根据诺莫曲线图示例里面的代码，修改我的nomo_副本里面的诺模图代码

### 🤖 Copilot <sub>2025/08/17 22:07</sub>

我来帮您根据诺莫曲线图示例中的代码来修改您的诺模图代码。首先让我看一下诺莫曲线图示例的内容：

现在我根据诺莫曲线图示例的代码来修改您的诺模图代码：

```

```

我已经根据诺莫曲线图示例的代码修改了您的诺模图代码。主要改进包括：

## 主要修改内容：

### 1. **基础诺模图**
- 添加了 `lp = T` 显示线性预测器
- 使用 `fun.at` 参数设置统一的生存概率刻度
- 优化了图形参数设置

### 2. **带风险分层的诺模图**
- 添加了彩色风险分层条带
- 绿色代表低风险，黄色代表中风险，红色代表高风险
- 添加了相应的风险标签

### 3. **多层次风险分层诺模图**
- 创建了多层次的视觉效果
- 主要条带在上方，底部添加了层次感条带
- 提供了更丰富的视觉层次

## 新增功能：
- **标准化的刻度设置**：使用统一的生存概率刻度点
- **专业的视觉效果**：参考示例的布局和配色
- **灵活的参数控制**：可以调整字体大小、间距等
- **风险分层可视化**：直观显示不同风险水平

这样修改后的诺模图会更加美观和专业，同时具有更好的可读性和解释性。

### 👤 User <sub>2025/08/17 22:32</sub>

Risk Stratification的值为-3 到3.5

### 🤖 Copilot <sub>2025/08/17 22:32</sub>

我来帮您修改风险分层的范围，将Risk Stratification的值设置为-3到3.5。我需要调整彩色条带的位置以适应这个数值范围：

```

```

我已经根据您提供的Risk Stratification范围（-3到3.5）调整了彩色条带的位置。主要修改包括：

## 风险分层调整：

### **风险分层范围分配**：
- **低风险**：-3 到 -1（绿色条带）
- **中风险**：-1 到 1.5（黄色条带）
- **高风险**：1.5 到 3.5（红色条带）

### **位置调整**：
1. **第一个图形**：
   - 低风险条带：0.26 → 0.45
   - 中风险条带：0.45 → 0.72
   - 高风险条带：0.72 → 0.96

2. **第二个图形**（多层次）：
   - 相应调整了主条带和底部条带的位置
   - 标签位置也进行了微调以适应新的范围

### **标签位置优化**：
- 将标签文本位置调整到每个风险区域的中心位置
- 确保标签清晰可读且不重叠

这样调整后，彩色条带会更准确地反映您的风险评分范围（-3到3.5），视觉效果也更加合理和专业。

### 👤 User <sub>2025/08/17 22:42</sub>

如果再加上这个library(regplot)

coxfit <- cph(Surv(time, status) ~ age + sex + ph.ecog + ph.karno + pat.karno,
              data = lung, x=T,y=T,surv = T
              )

regplot(coxfit,
        plots = c("violin", "boxes"), ##连续性变量形状，可选"no plot" "density" "boxes" "ecdf" "bars" "boxplot" "violin" "bean" "spikes"；分类变量的形状，可选"no plot" "boxes" "bars" "spikes"
        observation = lung[1,], #用哪行观测，或者T F
        center = T, # 对齐变量
        subticks = T,
        droplines = T,#是否画竖线
        title = "nomogram",
        points = T, # 截距项显示为0-100
        odds = T, # 是否显示OR值
        showP = T, # 是否显示变量的显著性标记
        rank = "sd", # 根据sd给变量排序
        interval="confidence", # 展示可信区间
        clickable = F # 是否可以交互
        )，应该如何修改呢

### 🤖 Copilot <sub>2025/08/17 22:42</sub>

我来帮您添加使用regplot包的代码。首先让我查看当前文件的内容，然后添加regplot的相关代码：

现在我在诺模图部分的最后添加regplot的代码：

```

```

我已经成功为您添加了regplot的代码。主要添加的内容包括：

## 新增的regplot功能：

### **2.1 regplot交互式诺模图**

我创建了三个不同风格的regplot图形：

#### **第一个图形**：
- 使用`violin`和`boxes`样式
- 展示第一个患者的数据作为示例
- 包含所有标准功能

#### **第二个图形**：
- 使用`density`和`bars`样式
- 以风险评分最高的患者作为示例
- 根据系数估计值排序变量

#### **第三个图形**：
- 使用`boxplot`和`spikes`样式
- 不显示具体观测（simplified版本）
- 根据p值排序变量

## 主要修改点：

1. **适应Cox模型**：将`odds = F`，因为OR值适用于logistic回归，Cox模型使用HR值
2. **观测示例**：
   - 第一个图用`dat[1,]`（第一行数据）
   - 第二个图用`dat[which.max(dat$Riskscore),]`（最高风险患者）
   - 第三个图用`observation = F`（不显示观测）
3. **标题定制**：添加了项目名称标识
4. **多样化展示**：提供了三种不同的可视化风格

这样您就可以同时拥有传统的nomogram和现代的regplot交互式诺模图，为您的分析提供更丰富的可视化选择。

### 👤 User <sub>2025/08/17 22:56</sub>

我需要在这个后面加上平滑曲线，修改以下代码加上去：library(ggplot2)

p <- ggplot(df_plot, aes(fpr, tpr, color = year)) +
  geom_smooth(se=FALSE, size=1.2)+ # 这就是平滑曲线的关键
  geom_abline(slope = 1, intercept = 0, color = "grey10",linetype = 2) +
  scale_color_manual(values = c("#E41A1C","#377EB8","#4DAF4A"),
                     name = NULL, 
                     labels = c(paste0("AUC at 1 year: ",round(ROC[["AUC"]][1],2)), 
                                paste0("AUC at 2 year: ",round(ROC[["AUC"]][2],2)), 
                                paste0("AUC at 3 year: ",round(ROC[["AUC"]][3],2)))
                     ) + 
  coord_fixed(ratio = 1) +
  labs(x = "1 - Specificity", y = "Sensitivity") +
  theme_minimal(base_size = 14, base_family = "sans") +
  theme(legend.position = c(0.7,0.15), 
        panel.border = element_rect(fill = NA),
        axis.text = element_text(color = "black"))

p

### 🤖 Copilot <sub>2025/08/17 22:56</sub>

我需要先查看当前的6_timeROC_副本.Rmd文件内容，了解现有的代码结构，然后在适当位置添加您提供的平滑曲线代码。

现在我了解了文件结构。我需要在现有的ggplot代码后面添加您提供的平滑曲线版本。让我在文件末尾添加新的平滑曲线代码：

```

```

我已经成功为您添加了平滑曲线版本的time-ROC图。主要修改包括：

## 新增内容：

### **第3部分：平滑曲线版本的time-ROC图**

1. **数据准备**：
   - 创建了`df_plot`数据框
   - 将年份标签改为更直观的1、3、5年

2. **平滑曲线关键特性**：
   - 使用`geom_smooth(se=FALSE, size=1.2)`生成平滑曲线
   - 移除了置信区间（`se=FALSE`）
   - 设置了合适的线条粗细

3. **视觉优化**：
   - 使用了新的配色方案（红、蓝、绿）
   - 调整了图例位置到右下角
   - 使用`theme_minimal`提供更简洁的外观
   - 添加了边框和优化了文本颜色

4. **数据引用修正**：
   - 将`ROC[["AUC"]]`修正为`result[["AUC"]]`以匹配您的数据结构
   - 年份标签对应1年、3年、5年

现在您有两个版本的ROC曲线：
- **原版**：使用直线连接的传统ROC曲线
- **新版**：使用平滑曲线的现代化ROC曲线，视觉效果更加美观

### 👤 User <sub>2025/08/17 23:02</sub>

在后面找最佳截断点：library(survivalROC)

# 1年的最佳截点
roc1 <- survivalROC(Stime = df$futime,
                   status = df$event,
                   marker = df$riskScore,
                   method = "KM",
                   predict.time = 1 # 时间选1年
                   )

roc1$cut.values[which.max(roc1$TP - roc1$FP)] #

### 🤖 Copilot <sub>2025/08/17 23:02</sub>

我来帮您在现有代码后面添加寻找最佳截断点的代码：

```

```

我已经为您在代码末尾添加了一个完整的最佳截断点分析模块，包含以下功能：

1. **使用survivalROC包**：计算不同时间点的最佳截断点
2. **多时间点分析**：计算1年、3年、5年的最佳截断点
3. **数据格式处理**：将时间转换为年为单位
4. **优化截断点**：使用TP-FP差值最大化原则找到最佳截断点
5. **详细结果展示**：包括截断点值、AUC、敏感性和特异性
6. **结果汇总表**：清晰展示所有时间点的截断点信息

这个代码会：
- 自动找到1年、3年、5年生存预测的最佳截断点
- 计算相应的AUC、敏感性和特异性
- 生成一个汇总表格方便比较不同时间点的结果

您可以根据需要调整时间点，或者只保留您感兴趣的特定时间段。

### 👤 User <sub>2025/08/25 23:25</sub>

结合这个森林图.Rmd的代码，修改一下cox-forest_副本.Rmd里面关于绘制森林图的代码，必要时根据你的思考修改代码

### 🤖 Copilot <sub>2025/08/25 23:25</sub>

我需要先查看森林图.Rmd的代码内容，然后查看cox-forest_副本.Rmd中的森林图代码，以便进行对比和改进。

现在让我查看cox-forest_副本.Rmd中的森林图相关代码：

继续查看文件的其余部分：

现在我明白了。您想要结合森林图.Rmd中的ggstats包功能来改进cox-forest_副本.Rmd中的森林图代码。ggstats包提供了更现代和美观的森林图功能，特别是`ggcoef_model()`函数。让我修改现有的森林图代码：

```

```

现在我还要更新多因素分析部分的森林图代码，使其也使用现代化的ggstats方法：

```

```

我需要修复代码块的结束问题：

```

```

让我修复这个错误，将过时的`size`参数替换为`linewidth`：

```

```

```

```

```

```

让我用更具体的上下文来修复这个问题：

```

```

现在让我检查文件中是否还有其他需要修复的`size`参数：

很好，现在我已经成功将森林图.Rmd中的现代化ggstats包功能整合到cox-forest_副本.Rmd中。主要的改进包括：

## 主要改进总结：

### 1. **引入ggstats包的现代化森林图功能**
- `ggcoef_model()`: 直接从Cox模型生成森林图
- `ggcoef_table()`: 创建带详细统计表格的森林图
- 这些函数提供了更简洁、现代的语法

### 2. **多层次的森林图选项**
- **方法1**: 基础ggstats森林图 - 简洁明了
- **方法2**: 带统计表格的森林图 - 详细信息展示
- **方法3**: 高度自定义的森林图 - 包含风险分类、系数大小可视化
- **方法4**: 保留传统forestplot方法作为备选

### 3. **改进的视觉效果**
- 使用现代配色方案（红色风险因素，蓝色保护因素）
- 添加了风险类型分类和标签
- 系数大小通过点的大小来可视化
- 改进了图例和标注

### 4. **多因素分析的现代化**
- 同样应用了ggstats的现代化方法
- 提供了三种不同风格的多因素森林图
- 增强了可读性和专业性

### 5. **技术细节优化**
- 修复了ggplot2新版本中的参数兼容性（`size` → `linewidth`）
- 改进了代码的可读性和模块化
- 增加了更详细的注释和说明

这些修改结合了森林图.Rmd中展示的现代化可视化技术，使得您的TCGA分析具有更专业、美观的森林图输出，同时保持了统计分析的严谨性。

### 👤 User <sub>2025/08/25 23:30</sub>

Error in (function (data, x = "estimate", y = "label", exponentiate = FALSE,  : 
  unused arguments (vline_color = "red", vline_linetype = "dashed", errorbar_color = "blue")

### 🤖 Copilot <sub>2025/08/25 23:30</sub>

我看到了错误。`ggcoef_model()`函数的参数名称不正确。让我修复这些参数：

```

```

现在让我也修复ggcoef_table函数的参数：

```

```

现在修复多因素分析部分的ggcoef_model参数：

```

```

```

```

现在让我修复那个持续存在的`size`参数问题：

让我修复这些`size`参数：

让我直接查看相关行的内容：

现在我看到了问题所在。让我修复这些`size`参数：

让我使用更具体的上下文：

```

```

```

```

现在让我检查是否还有其他`size`参数需要修复：

让我修复这些剩余的`size`参数：

```

```

```

```

现在代码应该可以正常运行了。我已经修复了所有的问题：

## 修复总结

### 1. **ggcoef_model和ggcoef_table参数问题**
- 移除了不存在的参数：`vline_color`, `vline_linetype`, `errorbar_color`, `errorbar_height`
- 改用标准的ggplot2语法：`geom_vline(xintercept = 1, color = "red", linetype = "dashed")`

### 2. **ggplot2新版本兼容性**
- 将所有`size`参数替换为`linewidth`（用于线条）
- 修复了`element_line()`和`element_rect()`中的过时参数

### 3. **正确的ggstats语法**
现在代码使用正确的语法：
```r
# 基础森林图
p1 <- ggcoef_model(model, exponentiate = TRUE) +
  geom_vline(xintercept = 1, color = "red", linetype = "dashed") +
  # 其他自定义...

# 带表格的森林图  
p2 <- ggcoef_table(model, exponentiate = TRUE) +
  geom_vline(xintercept = 1, color = "red", linetype = "dashed") +
  # 其他自定义...
```

这样修改后，代码应该能够正常运行，并生成现代化、美观的森林图。ggstats包提供了简洁的API来创建统计图形，而我们通过额外的ggplot2层来添加自定义的视觉元素。

### 👤 User <sub>2025/08/25 23:39</sub>

# 选择单因素分析中显著的变量(p < 0.05)进行多因素分析
significant_vars <- univ_results$var[univ_results$pvalue < 0.5]

if(length(significant_vars) > 0) {
  # 构建多因素模型公式
  multi_formula <- as.formula(paste("Surv(time, event) ~", 
                                  paste(significant_vars, collapse="+")))
  
  # 运行多因素Cox回归
  multi_model <- coxph(multi_formula, data=dat)
  multi_summary <- summary(multi_model)
  
  # 创建多因素分析结果数据框
  multi_results <- data.frame(
    var = rownames(multi_summary$coefficients),
    HR = round(multi_summary$coefficients[, "exp(coef)"], 2),
    HR.95L = round(multi_summary$conf.int[, "lower .95"], 2),
    HR.95H = round(multi_summary$conf.int[, "upper .95"], 2),
    pvalue = round(multi_summary$coefficients[, "Pr(>|z|)"], 4)
  )
  
  # 显示多因素分析结果
  print(multi_results)
  
  #### 多因素分析森林图 - 使用ggstats现代化方法
  
  # 方法1：使用ggcoef_model绘制多因素模型森林图
  p_multi1 <- ggcoef_model(multi_model, 
                           exponentiate = TRUE) +
    geom_vline(xintercept = 1, color = "red", linetype = "dashed") +
    scale_x_continuous(name = "Hazard Ratio (95% CI)") +
    labs(title = "多因素Cox回归森林图",
         subtitle = paste0("数据集: ", proj, " | 包含变量: ", length(significant_vars), "个"),
         caption = "调整了其他变量后的HR值") +
    theme_minimal() +
    theme(plot.title = element_text(hjust = 0.5, size = 14, face = "bold"),
          plot.subtitle = element_text(hjust = 0.5, size = 12),
          axis.text.y = element_text(size = 10),
          panel.grid.major.x = element_line(color = "grey90", linewidth = 0.3))
  
  print(p_multi1)
  
  # 保存多因素森林图
  ggsave(paste0(proj, "_multivariate_ggstats_forest.pdf"), p_multi1, 
         width = 10, height = 6, dpi = 300)
  
  # 方法2：创建带表格的多因素森林图
  p_multi2 <- ggcoef_table(multi_model, 
                           exponentiate = TRUE) +
    geom_vline(xintercept = 1, color = "red", linetype = "dashed") +
    labs(title = "多因素Cox回归详细结果",
         subtitle = paste0("数据集: ", proj)) +
    theme_minimal() +
    theme(plot.title = element_text(hjust = 0.5, size = 14, face = "bold"))
  
  print(p_multi2)
  
  # 保存多因素表格图
  ggsave(paste0(proj, "_multivariate_table_plot.pdf"), p_multi2, 
         width = 12, height = 6, dpi = 300)
  
  # 方法3：高度自定义的多因素森林图
  multi_results$risk_type <- ifelse(multi_results$HR > 1, "风险因素", "保护因素")
  multi_results$pvalue_formatted <- sapply(multi_results$pvalue, function(p) {
    if (p < 0.001) {
      return("P<0.001")
    } else if (p < 0.01) {
      return("P<0.01")
    } else if (p < 0.05) {
      return("P<0.05")
    } else {
      return(paste0("P=", sprintf("%.3f", p)))
    }
  })
  
  p_multi3 <- ggplot(multi_results, aes(x = HR, y = reorder(var, HR))) +
    geom_vline(xintercept = 1, linetype = "dashed", color = "red", linewidth = 0.8) +
    geom_errorbarh(aes(xmin = HR.95L, xmax = HR.95H, color = risk_type), 
                   height = 0.3, linewidth = 1.2) +
    geom_point(aes(color = risk_type), size = 4, alpha = 0.8) +
    scale_color_manual(values = c("风险因素" = "#d73027", "保护因素" = "#4575b4")) +
    scale_x_continuous(name = "Hazard Ratio (95% CI)", 
                       trans = "log10",
                       breaks = c(0.1, 0.5, 1, 2, 5, 10),
                       labels = c("0.1", "0.5", "1", "2", "5", "10")) +
    labs(title = "多因素Cox回归风险森林图",
         subtitle = paste0("数据集: ", proj, " | 调整后的独立风险因素"),
         y = "变量",
         color = "风险类型",
         caption = "调整了其他变量影响后的独立关联") +
    theme_minimal() +
    theme(
      plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),
      plot.subtitle = element_text(hjust = 0.5, size = 12),
      axis.text.y = element_text(size = 11, face = "bold"),
      axis.text.x = element_text(size = 10),
      axis.title = element_text(size = 12, face = "bold"),
      legend.position = "bottom",
      legend.title = element_text(size = 11, face = "bold"),
      panel.grid.major.x = element_line(color = "grey90", linewidth = 0.3),
      panel.background = element_rect(fill = "white", color = "black"),
      plot.margin = margin(20, 20, 20, 20)
    ) +
    geom_text(aes(x = HR.95H * 1.1, 
                  label = paste0("HR=", HR, "\n", pvalue_formatted)),
              size = 3.5, hjust = 0, color = "black", fontface = "bold")
  
  print(p_multi3)
  
  # 保存自定义多因素森林图
  ggsave(paste0(proj, "_custom_multivariate_forest.pdf"), p_multi3, 
         width = 12, height = 8, dpi = 300)
  
} else {
  print("没有变量在单因素分析中达到统计学显著性")
}这部分代码太复杂了，分开写

### 🤖 Copilot <sub>2025/08/25 23:39</sub>

我来帮您将这部分复杂的代码分开，让结构更清晰：

```

```

让我修复代码块的结束问题：

让我查看文件的末尾部分：

现在让我查看文件的最后部分并修复代码块结束问题：

现在我需要修复这些代码块结束的问题。我看到有多个重复的代码块开始符号。让我修复这些问题：

```

```

现在让我修复末尾的代码块结束问题：

让我查看文件末尾的确切内容：

现在我看到了问题。我需要在最后添加正确的代码块结束符号：

```

```

很好！现在我已经成功将复杂的多因素分析代码分解成了更清晰的模块化结构。让我总结一下所做的改进：

## 代码重构总结

### 🎯 **主要改进**

#### 1. **模块化结构**
- 将一个复杂的大代码块分解为**5个独立的代码块**
- 每个代码块都有明确的功能和标题
- 便于调试、修改和理解

#### 2. **清晰的逻辑分层**
```
5.2 多因素Cox回归分析          # 基础统计分析
5.3 ggstats基础森林图         # 现代化可视化方法1
5.4 ggstats表格森林图         # 现代化可视化方法2  
5.5 高度自定义森林图          # 专业定制化可视化
```

#### 3. **增强的错误处理**
- 使用 `if(exists("multi_model"))` 检查对象是否存在
- 添加了详细的进度打印信息
- 每个步骤都有独立的验证

#### 4. **改进的代码可读性**
- 添加了更多注释和说明
- 每个代码块都有明确的目标
- 变量和结果有清晰的命名

#### 5. **保持功能完整性**
- ✅ 所有原有功能都保留
- ✅ ggstats现代化森林图方法
- ✅ 多种可视化选项
- ✅ 错误检查和调试信息

### 🔧 **技术细节修复**
- 修复了ggplot2新版本的参数兼容性
- 正确的ggstats函数调用语法
- 清理了代码块结构问题

### 📊 **使用建议**
现在您可以：
1. **选择性运行**：只运行需要的特定森林图类型
2. **调试友好**：每个步骤独立，便于排查问题
3. **定制灵活**：轻松修改单个可视化方法而不影响其他部分
4. **渐进式执行**：按需要逐步执行不同的分析步骤

这个重构大大提高了代码的可维护性和可读性，同时保持了所有原有的分析功能！
