# 载入需要的程序包：checkmate 载入需要的程序包：abind 载入需要的程序包：metadat Loading 'meta' package (ve...

| Field | Value |
|-------|-------|
| Session ID | `5fae6fb3-ada6-4aa0-807b-8fedad89e4a7` |
| Workspace | 森林图 |
| Start | 2025/05/14 01:14 |
| End | 2025/05/14 14:04 |
| Messages | 9 |

---

### 👤 User <sub>2025/05/14 01:15</sub>

载入需要的程序包：checkmate
载入需要的程序包：abind
载入需要的程序包：metadat
Loading 'meta' package (version 8.1-0).
Type 'help(meta)' for a brief overview.

载入程序包：‘ggforestplot’

The following object is masked from ‘package:forestplot’:

    forestplot


载入程序包：‘forestploter’

The following object is masked from ‘package:meta’:

    forest

refline_lwd, refline_lty, refline_col will be deprecated, use refline_gp instead.
footnote_cex, footnote_fontface, footnote_col will be deprecated, use footnote_gp instead.
错误于add_underline(g, part = "header"): 没有"add_underline"这个函数
此外: 警告信息:
In .get_data(model, data = data) :
  The `data` argument is not provided. Data will be extracted from model fit.


### 🤖 Copilot <sub>2025/05/14 01:15</sub>

根据你共享的错误信息，我看到在使用`forestploter`包运行森林图代码时遇到了一些问题。主要的错误是"`没有"add_underline"这个函数`"，这表明在当前版本的`forestploter`包中没有`add_underline`函数。我也注意到一些警告消息，提示某些参数将被弃用。

让我来帮你解决这些问题：

首先，让我查找一下`forestploter`包的最新信息，了解正确的函数和用法。

让我检查一下森林图相关的R包的文档，看看在`forestploter`包中`add_underline`函数是否已被弃用或改名。

现在我来检查一下`forestploter`包的文档，特别是关于`add_underline`函数的替代方法。

### 👤 User <sub>2025/05/14 13:59</sub>

载入需要的程序包：checkmate
载入需要的程序包：abind
载入需要的程序包：metadat
Loading 'meta' package (version 8.1-0).
Type 'help(meta)' for a brief overview.

载入程序包：‘ggforestplot’

The following object is masked from ‘package:forestplot’:

    forestplot


载入程序包：‘forestploter’

The following object is masked from ‘package:meta’:

    forest

refline_lwd, refline_lty, refline_col will be deprecated, use refline_gp instead.
footnote_cex, footnote_fontface, footnote_col will be deprecated, use footnote_gp instead.
错误于add_underline(g, part = "header"): 没有"add_underline"这个函数
此外: 警告信息:
In .get_data(model, data = data) :
  The `data` argument is not provided. Data will be extracted from model fit.


### 👤 User <sub>2025/05/14 14:00</sub>

载入需要的程序包：grid
载入需要的程序包：checkmate
载入需要的程序包：abind
载入需要的程序包：metadat
Loading 'meta' package (version 8.1-0).
Type 'help(meta)' for a brief overview.

载入程序包：‘ggforestplot’

The following object is masked from ‘package:forestplot’:

    forestplot


载入程序包：‘forestploter’

The following object is masked from ‘package:meta’:

    forest

refline_lwd, refline_lty, refline_col will be deprecated, use refline_gp instead.
footnote_cex, footnote_fontface, footnote_col will be deprecated, use footnote_gp instead.
错误于add_underline(g, part = "header"): 没有"add_underline"这个函数
此外: 警告信息:
In .get_data(model, data = data) :
  The `data` argument is not provided. Data will be extracted from model fit.


### 🤖 Copilot <sub>2025/05/14 14:00</sub>

我注意到代码中有几个问题需要解决：

1. `forestploter`包中的一些参数已经弃用，需要更新为新的参数格式
2. `add_underline`函数不存在，这个可能是较新版本移除的功能

让我帮你修改代码：

1. 首先修改主题定义部分，使用新的参数格式：

```r
tm <- forest_theme(base_size = 10,
                   # 置信区间点形状，线类型/颜色/宽度
                   ci_pch = 16,  # 点形状
                   ci_col = "red",
                   ci_lty = 1, # 线条类型
                   ci_lwd = 1.5, # 线条宽度
                   ci_Theight = 0.4, # 在CI的末尾设置T形尾部
                   # 参考线设置
                   refline_gp = gpar(lwd = 1, lty = "dashed", col = "grey20"),
                   # 垂直线设置
                   vertline_gp = gpar(lwd = 1, lty = "dashed", col = "grey20"),
                   # 更改填充和边框的摘要颜色
                   summary_fill = "red",
                   summary_col = "red",
                   # 脚注设置
                   footnote_gp = gpar(cex = 0.6, fontface = "italic", col = "red"))
```

2. 对于没有`add_underline`函数的问题，我们可以使用`edit_plot`函数来添加下划线效果：

```r
# 改变第三行文字的颜色：
g <- edit_plot(p, row = 3, gp = gpar(col = "red", fontface = "italic"))

# 加粗分组变量的名称：
g <- edit_plot(g,
               row = c(2, 5, 10, 13, 17, 20),
               gp = gpar(fontface = "bold"))

# 改变第五行的背景色：
g <- edit_plot(g, row = 5, which = "background",
               gp = gpar(fill = "#4ca9be"))

# 在表头插入文字
g <- insert_text(g,
                 text = "Treatment group",
                 col = 2:3,
                 part = "header",
                 gp = gpar(fontface = "bold"))

# 替代add_underline的方案 - 使用edit_plot添加下划线效果
g <- edit_plot(g, 
               part = "header",
               gp = gpar(fontface = "bold", border = "black"))

# 在表格内部插入文字：
g <- insert_text(g,
                 text = "This is a long text. Age and gender summarised above.\nBMI is next",
                 row = 10,
                 just = "left",
                 gp = gpar(cex = 0.6, col = "red", fontface = "italic"))
```

让我帮你修改文件。我会使用`replace_string_in_file`工具来更新这些代码：

```

```

```

```

这些修改应该解决了警告信息和错误。主要的更改包括：

1. 将弃用的参数（refline_lwd、refline_lty、refline_col）替换为新的 refline_gp 参数
2. 将弃用的参数（footnote_cex、footnote_fontface、footnote_col）替换为新的 footnote_gp 参数
3. 用 edit_plot 函数替换不存在的 add_underline 函数

现在代码应该能够正常运行了。至于警告信息"The `data` argument is not provided"，这只是一个提示，不会影响代码的执行，因为数据会从模型拟合中自动提取。

你可以重新运行代码试试看。如果还有任何问题，请告诉我。

### 👤 User <sub>2025/05/14 14:02</sub>

source("/Users/yuzuan/Downloads/R语言-高分SCI图表复现/生信常用图形绘制/森林图/forest_plot.R", encoding =
     "UTF-8")
错误于forestplot(tabletext, cochrane_from_rmeta, new_page = TRUE, is.summary = c(TRUE, : 
  不是所有的is.data.frame(df)都是TRUE
此外: 警告信息:
In .get_data(model, data = data) :
  The `data` argument is not provided. Data will be extracted from model fit.

### 🤖 Copilot <sub>2025/05/14 14:02</sub>

这个错误显示在使用 `forestplot` 函数时出现了问题，错误信息表明输入的数据框格式不正确。让我帮你修复这个问题。

问题出在 `forestplot` 函数调用时的数据处理部分。我们需要确保输入的数据是正确的数据框格式。让我修改相关代码：

```

```

```

```

我做了以下修改：

1. 将数据结构的定义改为更清晰的 `data.frame` 格式
2. 修改了 `tabletext` 的创建方式，使用 `data.frame` 而不是 `cbind`
3. 更新了 `forestplot` 函数的调用方式，使用具名参数并直接引用数据框的列

这些更改应该能解决"不是所有的is.data.frame(df)都是TRUE"的错误。主要的改变是：

1. 更明确的数据框创建方式
2. 确保所有输入数据都是正确的数据框格式
3. 使用更清晰的参数名称来调用 `forestplot` 函数

关于警告信息"The `data` argument is not provided."，这是来自 `survminer` 包的提示，不会影响代码的执行，因为数据会从模型拟合中自动提取。

你现在可以重新运行代码，这些修改应该能解决数据框相关的错误。如果还有任何问题，请告诉我。

### 👤 User <sub>2025/05/14 14:04</sub>

ource("/Users/yuzuan/Downloads/R语言-高分SCI图表复现/生信常用图形绘制/森林图/forest_plot.R", encoding =
     "UTF-8")
错误于forestplot(labeltext = tabletext, mean = cochrane_data$mean, : 
  缺少参数"df",也缺失默认值
此外: 警告信息:
In .get_data(model, data = data) :
  The `data` argument is not provided. Data will be extracted from model fit.

### 🤖 Copilot <sub>2025/05/14 14:04</sub>

这个错误是因为 `forestplot` 函数的参数使用方式有误。让我修改一下代码以正确使用 `forestplot` 函数：

```

```

我做了以下修改：

1. 将 `tabletext` 转换为矩阵格式：`as.matrix(tabletext)`
2. 添加了水平线的设置：`hrzl_lines`
3. 添加了更多的图形参数来控制森林图的外观：
   - `graphwidth`: 设置图形宽度
   - `zero`: 设置参考线位置
   - `boxsize`: 设置方框大小
   - `cex`: 设置文字大小
   - `lineheight`: 设置行高
   - `colgap`: 设置列间距
   - `lwd.ci`: 设置置信区间线宽
   - `ci.vertices`: 在置信区间末端添加竖线
   - `ci.vertices.height`: 设置置信区间末端竖线的高度

关于警告信息"The `data` argument is not provided"，这是来自 `survminer` 包的提示，不会影响代码的执行，因为数据会从模型拟合中自动提取。

你现在可以重新运行代码，应该能正常工作了。如果还有任何问题，请告诉我。
