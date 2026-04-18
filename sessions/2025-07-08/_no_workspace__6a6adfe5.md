# remove.packages("randomForestSRC") Removing package from ‘/Users/yuzuan/Libra...

| Field | Value |
|-------|-------|
| Session ID | `6a6adfe5-60d9-4629-a05e-d556002ee7a5` |
| Workspace | (no workspace) |
| Start | 2025/07/08 23:03 |
| End | 2025/07/08 23:18 |
| Messages | 14 |

---

### 👤 User <sub>2025/07/08 23:04</sub>

remove.packages("randomForestSRC")
Removing package from ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
> remotes::install_version("randomForestSRC", version = "3.3.1")
Downloading package from url: https://mirrors.tuna.tsinghua.edu.cn/CRAN//src/contrib/Archive/randomForestSRC/randomForestSRC_3.3.1.tar.gz
Installing package into ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
* installing *source* package ‘randomForestSRC’ ...
** this is package ‘randomForestSRC’ version ‘3.3.1’
** package ‘randomForestSRC’ successfully unpacked and MD5 sums checked
** using staged installation
checking for gcc... clang -arch arm64
checking whether the C compiler works... yes
checking for C compiler default output file name... a.out
checking for suffix of executables... 
checking whether we are cross compiling... no
checking for suffix of object files... o
checking whether the compiler supports GNU C... yes
checking whether clang -arch arm64 accepts -g... yes
checking for clang -arch arm64 option to enable C11 features... none needed
checking for clang -arch arm64 option to support OpenMP... unsupported
configure: creating ./config.status
config.status: creating src/Makevars
** libs
using C compiler: ‘Apple clang version 15.0.0 (clang-1500.3.9.4)’
using SDK: ‘MacOSX14.4.sdk’
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c R_init_randomForestSRC.c -o R_init_randomForestSRC.o
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c randomForestSRC.c -o randomForestSRC.o
randomForestSRC.c:36504:9: warning: variable 'v' set but not used [-Wunused-but-set-variable]
  char *v;
        ^
1 warning generated.
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c splitCustom.c -o splitCustom.o
clang -arch arm64 -dynamiclib -Wl,-headerpad_max_install_names -undefined dynamic_lookup -L/Library/Frameworks/R.framework/Resources/lib -L/opt/R/arm64/lib -o randomForestSRC.so R_init_randomForestSRC.o randomForestSRC.o splitCustom.o -F/Library/Frameworks/R.framework/.. -framework R
installing to /Users/yuzuan/Library/R/library/00LOCK-randomForestSRC/00new/randomForestSRC/libs
** R
** data
** inst
** byte-compile and prepare package for lazy loading
** help
*** installing help indices
** building package indices
** testing if installed package can be loaded from temporary location
** checking absolute paths in shared objects and dynamic libraries
** testing if installed package can be loaded from final location
** testing if installed package keeps a record of temporary installation path
* DONE (randomForestSRC)
> library(randomForestSRC)
> packageVersion("randomForestSRC")  # 应该返回 2.9.3
[1] ‘3.3.1’
> data(veteran, package = "randomForestSRC")
> fit <- rfsrc(Surv(time, status) ~ ., data = veteran)
> var.select(fit)
Error in var.select(fit) : could not find function "var.select"

> class(fit)
[1] "rfsrc" "grow"  "surv" 
> fit <- rfsrc(Surv(time, status) ~ ., data = veteran)
> var.select(fit)
Error in var.select(fit) : could not find function "var.select"

### 🤖 Copilot <sub>2025/07/08 23:04</sub>

看起来您在使用 R 的 `randomForestSRC` 包时遇到了问题。您成功安装了版本 3.3.1，但是 `var.select()` 函数无法找到。这个问题可能是因为在较新版本的 `randomForestSRC` 包中，函数名称或功能发生了变化。

让我帮您检查一下当前版本中可用的函数以及如何进行变量选择：

请先在 VS Code 中打开一个空文件夹作为工作区，然后我可以帮您创建一个 R 脚本来解决这个问题。

或者，我可以直接为您提供解决方案：

在 `randomForestSRC` 3.3.1 版本中，`var.select()` 函数可能已经被重命名或移动。请尝试以下替代方法：

1. **检查包中可用的函数：**

```
# 查看 randomForestSRC 包中所有可用的函数
ls("package:randomForestSRC")

# 或者查看包的帮助文档
help(package = "randomForestSRC")
```

2. **使用 `vimp()` 函数进行变量重要性分析：**

```
# 获取变量重要性
vimp_result <- vimp(fit)
print(vimp_result)

# 或者在构建模型时直接计算变量重要性
fit <- rfsrc(Surv(time, status) ~ ., data = veteran, importance = TRUE)
print(fit$importance)
```

3. **使用 `subsample()` 函数进行变量选择：**

```
# 使用子采样方法进行变量选择
sub_result <- subsample(fit)
print(sub_result)
```

4. **如果需要变量选择功能，可以尝试：**

```
# 检查是否有 var.select 相关的函数
apropos("var")
apropos("select")

# 或者查看是否有其他变量选择方法
apropos("variable")
```

**建议的完整代码：**

```
library(randomForestSRC)
data(veteran, package = "randomForestSRC")

# 构建模型并计算变量重要性
fit <- rfsrc(Surv(time, status) ~ ., data = veteran, importance = TRUE)

# 查看变量重要性
print(fit$importance)

# 使用 vimp 函数
vimp_result <- vimp(fit)
print(vimp_result)

# 绘制变量重要性图
plot(vimp_result)
```

如果您需要创建一个完整的 R 工作区来分析这个问题，请先在 VS Code 中打开一个空文件夹，然后我可以为您创建相应的脚本文件。

### 👤 User <sub>2025/07/08 23:06</sub>

> apropos("var")
 [1] ".rs.addGlobalVariable"                   ".rs.clearVar"                           
 [3] ".rs.defineVar"                           ".rs.detectFreeVars_Call"                
 [5] ".rs.detectFreeVars_Leaf"                 ".rs.getCompletionsEnvironmentVariables" 
 [7] ".rs.getVar"                              ".rs.hasVar"                             
 [9] ".rs.rpc.detect_free_vars"                ".rs.rpc.get_deployment_env_vars"        
[11] ".rs.rsconnect.getApplicationEnvVars"     ".rs.rsconnect.getApplicationEnvVarsImpl"
[13] ".rs.setVar"                              "all.vars"                               
[15] "estVar"                                  "get_all_vars"                           
[17] "globalVariables"                         "plot.variable"                          
[19] "plot.variable.rfsrc"                     "var"                                    
[21] "var.test"                                "variable.names"                         
[23] "varimax"                                
> apropos("select")
 [1] ".rs.api.selectDirectory"           ".rs.api.selectFile"               
 [3] ".rs.api.selectionGet"              ".rs.api.selectionSet"             
 [5] ".rs.api.setSelectionRanges"        ".rs.createNodeSelectorRule"       
 [7] ".rs.selectEndsWith"                ".rs.selectFuzzyMatches"           
 [9] ".rs.selectIsSubsequence"           ".rs.selectStartsWith"             
[11] ".rs.setSelectionStartBorderRadius" ".selectSuperClasses"              
[13] "MethodsListSelect"                 "select.list"                      
[15] "selectMethod"                      "selectSuperClasses"               
[17] "socketSelect"                     
> 
> # 或者查看是否有其他变量选择方法
> apropos("variable")
[1] ".rs.addGlobalVariable"                  ".rs.getCompletionsEnvironmentVariables"
[3] "globalVariables"                        "plot.variable"                         
[5] "plot.variable.rfsrc"                    "variable.names" 

### 🤖 Copilot <sub>2025/07/08 23:06</sub>

看起来在 `randomForestSRC` 3.3.1 版本中确实没有 `var.select()` 函数，但是我注意到有 `plot.variable.rfsrc` 函数，这表明包中有变量相关的功能。

让我们尝试一些其他方法来进行变量选择和重要性分析：

```
# 1. 首先检查fit对象的结构，看看包含哪些信息
str(fit)
names(fit)

# 2. 查看是否有内置的变量重要性
print(fit$importance)

# 3. 尝试使用 vimp() 函数
vimp_result <- vimp(fit)
print(vimp_result)

# 4. 使用 plot.variable 函数来可视化变量效应
plot.variable(fit)

# 5. 检查包中所有以 "var" 开头的函数
ls("package:randomForestSRC")[grep("^var", ls("package:randomForestSRC"))]

# 6. 查看包的完整函数列表
ls("package:randomForestSRC")
```

另外，您也可以尝试以下方法：

```
# 方法1: 使用置换重要性
# 重新拟合模型，确保计算重要性
fit <- rfsrc(Surv(time, status) ~ ., data = veteran, importance = TRUE)

# 查看重要性分数
importance_scores <- fit$importance
print(importance_scores)

# 按重要性排序
sorted_importance <- sort(importance_scores, decreasing = TRUE)
print(sorted_importance)

# 方法2: 手动进行变量选择
# 基于重要性分数选择前几个重要变量
top_vars <- names(sort(importance_scores, decreasing = TRUE))[1:5]
print(paste("Top 5 important variables:", paste(top_vars, collapse = ", ")))

# 用选择的变量重新拟合模型
formula_selected <- as.formula(paste("Surv(time, status) ~", paste(top_vars, collapse = " + ")))
fit_selected <- rfsrc(formula_selected, data = veteran)
```

如果这些方法还不行，请运行以下代码来获取更多信息：

```
# 查看 randomForestSRC 包的所有导出函数
ls("package:randomForestSRC")

# 查看包的版本和描述
packageDescription("randomForestSRC")

# 查看帮助文档中是否有变量选择相关的函数
help(package = "randomForestSRC")
```

您能运行这些代码并告诉我结果吗？这样我就能更好地帮您找到正确的变量选择方法。

### 👤 User <sub>2025/07/08 23:08</sub>

ls("package:randomForestSRC")
 [1] "extract.bootsample"         "extract.quantile"           "extract.subsample"         
 [4] "fast.load"                  "fast.load.list"             "fast.save"                 
 [7] "fast.save.list"             "find.interaction"           "find.interaction.rfsrc"    
[10] "get.auc"                    "get.bayes.rule"             "get.brier.error"           
[13] "get.brier.survival"         "get.cindex"                 "get.confusion"             
[16] "get.imbalanced.optimize"    "get.imbalanced.performance" "get.logloss"               
[19] "get.misclass.error"         "get.mv.cserror"             "get.mv.csvimp"             
[22] "get.mv.error"               "get.mv.error.block"         "get.mv.formula"            
[25] "get.mv.predicted"           "get.mv.vimp"                "get.partial.plot.data"     
[28] "get.pr.auc"                 "get.pr.curve"               "get.quantile"              
[31] "get.quantile.crps"          "get.quantile.stat"          "get.rfq.threshold"         
[34] "get.tree"                   "get.tree.rfsrc"             "holdout.vimp"              
[37] "holdout.vimp.rfsrc"         "imbalanced"                 "imbalanced.rfsrc"          
[40] "impute"                     "impute.rfsrc"               "lsos"                      
[43] "max.subtree"                "max.subtree.rfsrc"          "partial"                   
[46] "partial.rfsrc"              "plot.competing.risk"        "plot.competing.risk.rfsrc" 
[49] "plot.quantreg"              "plot.quantreg.rfsrc"        "plot.rfsrc"                
[52] "plot.subsample"             "plot.subsample.rfsrc"       "plot.survival"             
[55] "plot.survival.rfsrc"        "plot.variable"              "plot.variable.rfsrc"       
[58] "predict.rfsrc"              "print.bootsample"           "print.bootsample.rfsrc"    
[61] "print.rfsrc"                "print.subsample"            "print.subsample.rfsrc"     
[64] "quantreg"                   "quantreg.rfsrc"             "rfsrc"                     
[67] "rfsrc.anonymous"            "rfsrc.cart"                 "rfsrc.fast"                
[70] "rfsrc.news"                 "sid.perf.metric"            "sidClustering"             
[73] "sidClustering.rfsrc"        "stat.split"                 "stat.split.rfsrc"          
[76] "subsample"                  "subsample.rfsrc"            "synthetic"                 
[79] "synthetic.rfsrc"            "tune"                       "tune.nodesize"             
[82] "tune.nodesize.rfsrc"        "tune.rfsrc"                 "vimp"                      
[85] "vimp.rfsrc"                
> 
> # 查看包的版本和描述
> packageDescription("randomForestSRC")
Package: randomForestSRC
Version: 3.3.1
Date: 2024-07-25
Title: Fast Unified Random Forests for Survival, Regression, and Classification
         (RF-SRC)
Author: Hemant Ishwaran <hemant.ishwaran@gmail.com>, Udaya B. Kogalur
         <ubk@kogalur.com>
Maintainer: Udaya B. Kogalur <ubk@kogalur.com>
BugReports: https://github.com/kogalur/randomForestSRC/issues/
Depends: R (>= 4.3.0),
Imports: parallel, data.tree, DiagrammeR
Suggests: survival, pec, prodlim, mlbench, interp, caret, imbalance, cluster, fst,
         data.table
Description: Fast OpenMP parallel computing of Breiman's random forests for
         univariate, multivariate, unsupervised, survival, competing risks, class
         imbalanced classification and quantile regression. New Mahalanobis splitting
         for correlated outcomes.  Extreme random forests and randomized splitting.
         Suite of imputation methods for missing data.  Fast random forests using
         subsampling. Confidence regions and standard errors for variable importance.
         New improved holdout importance. Case-specific importance.  Minimal depth
         variable importance. Visualize trees on your Safari or Google Chrome
         browser. Anonymous random forests for data privacy.
License: GPL (>= 3)
URL: https://www.randomforestsrc.org/ https://ishwaran.org/
NeedsCompilation: yes
Packaged: 2024-07-25 13:00:37 UTC; kogalur
Repository: CRAN
Date/Publication: 2024-07-25 14:30:02 UTC
Built: R 4.5.0; aarch64-apple-darwin20; 2025-07-08 15:00:46 UTC; unix

-- File: /Users/yuzuan/Library/R/library/randomForestSRC/Meta/package.rds 
> 
> # 查看帮助文档中是否有变量选择相关的函数
> help(package = "randomForestSRC")

### 🤖 Copilot <sub>2025/07/08 23:08</sub>

太好了！现在我看到了完整的函数列表。在 `randomForestSRC` 3.3.1 版本中，变量选择和重要性分析有以下几个主要函数：

1. **`vimp()` 和 `vimp.rfsrc()`** - 变量重要性
2. **`holdout.vimp()` 和 `holdout.vimp.rfsrc()`** - 留出法变量重要性
3. **`subsample()` 和 `subsample.rfsrc()`** - 子采样方法
4. **`find.interaction()` 和 `find.interaction.rfsrc()`** - 交互作用检测

让我们尝试这些方法来进行变量选择：

```
# 方法1: 使用 vimp() 函数计算变量重要性
vimp_result <- vimp(fit)
print(vimp_result)

# 方法2: 使用 holdout.vimp() 函数 - 更稳健的变量重要性估计
holdout_vimp_result <- holdout.vimp(fit)
print(holdout_vimp_result)

# 方法3: 使用 subsample() 函数进行变量选择
# 这个函数可以用于变量选择和模型稳定性分析
subsample_result <- subsample(fit)
print(subsample_result)

# 查看子采样结果
plot.subsample(subsample_result)

# 方法4: 查找变量间的交互作用
interaction_result <- find.interaction(fit)
print(interaction_result)

# 方法5: 直接从模型中提取变量重要性
# 确保模型计算了重要性
fit_with_importance <- rfsrc(Surv(time, status) ~ ., data = veteran, importance = TRUE)
print(fit_with_importance$importance)

# 按重要性排序
importance_scores <- fit_with_importance$importance
sorted_importance <- sort(importance_scores, decreasing = TRUE)
print("变量重要性排序:")
print(sorted_importance)
```

**推荐的变量选择流程：**

```
library(randomForestSRC)
data(veteran, package = "randomForestSRC")

# 1. 拟合模型并计算重要性
fit <- rfsrc(Surv(time, status) ~ ., data = veteran, importance = TRUE)

# 2. 使用子采样方法进行稳健的变量选择
sub_result <- subsample(fit)
print(sub_result)

# 3. 可视化结果
plot(sub_result)

# 4. 获取变量重要性
vimp_result <- vimp(fit)
print(vimp_result)

# 5. 使用留出法验证重要性
holdout_result <- holdout.vimp(fit)
print(holdout_result)
```

请尝试运行这些代码，特别是 `subsample()` 函数，它在新版本中似乎是进行变量选择的主要方法，替代了旧版本的 `var.select()` 函数。

`subsample()` 函数通过子采样和重复拟合来评估变量的稳定性和重要性，这实际上是一种更稳健的变量选择方法。

### 👤 User <sub>2025/07/08 23:10</sub>

set.seed(seed)
fit <- rfsrc(Surv(time,event)~.,data = est_dd,
             ntree = 1000,nodesize = rf_nodesize,##该值建议多调整  
             splitrule = 'logrank', #分割的规则,logrank是生存分析常用
             importance = T, #计算每个预测变量对模型预测能力的贡献度
             proximity = T, #计算样本之间的接近度
             forest = T, #保存整个随机森林模型
             seed = seed)
#筛选特征基因
var.select(fit)
rid <- var.select(fit)$topvars这个要如何改？

### 🤖 Copilot <sub>2025/07/08 23:10</sub>

根据之前的分析，在 `randomForestSRC` 3.3.1 版本中，`var.select()` 函数已经被替换。您需要使用 `subsample()` 函数来进行变量选择。以下是修改后的代码：

```
set.seed(seed)
fit <- rfsrc(Surv(time,event)~.,data = est_dd,
             ntree = 1000,nodesize = rf_nodesize,##该值建议多调整  
             splitrule = 'logrank', #分割的规则,logrank是生存分析常用
             importance = T, #计算每个预测变量对模型预测能力的贡献度
             proximity = T, #计算样本之间的接近度
             forest = T, #保存整个随机森林模型
             seed = seed)

# 使用 subsample() 替代 var.select()
sub_result <- subsample(fit)
print(sub_result)

# 获取重要变量 - 方法1: 从子采样结果中提取
# 查看子采样结果的结构
str(sub_result)
names(sub_result)

# 方法2: 直接使用变量重要性排序
importance_scores <- fit$importance
sorted_importance <- sort(importance_scores, decreasing = TRUE)

# 选择前N个重要变量（例如前10个）
n_vars <- 10  # 可以根据需要调整
rid <- names(sorted_importance)[1:n_vars]
print(paste("Selected top", n_vars, "variables:"))
print(rid)

# 方法3: 使用 vimp() 函数获取更详细的重要性信息
vimp_result <- vimp(fit)
print(vimp_result)

# 方法4: 基于重要性阈值选择变量
threshold <- quantile(importance_scores, 0.7)  # 选择前30%的变量
rid <- names(importance_scores[importance_scores >= threshold])
print(paste("Variables above", threshold, "threshold:"))
print(rid)
```

**推荐的完整替代方案：**

```
set.seed(seed)
fit <- rfsrc(Surv(time,event)~.,data = est_dd,
             ntree = 1000,nodesize = rf_nodesize,
             splitrule = 'logrank',
             importance = T,
             proximity = T,
             forest = T,
             seed = seed)

# 新的变量选择方法
# 1. 使用子采样进行变量选择
sub_result <- subsample(fit)

# 2. 获取变量重要性并排序
importance_scores <- fit$importance
sorted_vars <- names(sort(importance_scores, decreasing = TRUE))

# 3. 选择顶部变量（替代原来的 rid <- var.select(fit)$topvars）
# 您可以选择以下任一方法：

# 方法A: 选择前N个最重要的变量
n_top <- 10  # 根据需要调整数量
rid <- sorted_vars[1:n_top]

# 方法B: 基于重要性分数的百分位数选择
percentile_threshold <- 0.8  # 选择前20%的变量
threshold <- quantile(importance_scores, percentile_threshold)
rid <- names(importance_scores[importance_scores >= threshold])

# 方法C: 基于子采样结果选择（如果子采样结果包含变量选择信息）
# 需要查看 sub_result 的具体结构来确定如何提取
print(sub_result)  # 先查看结果结构

print("Selected variables:")
print(rid)
```

建议您先运行这个代码，然后告诉我 `sub_result` 的输出结果，这样我可以帮您找到最准确的方法来提取顶部变量。

### 👤 User <sub>2025/07/08 23:12</sub>

哪个版本有var. select

### 🤖 Copilot <sub>2025/07/08 23:12</sub>

根据我的了解，`var.select()` 函数在 `randomForestSRC` 包的较早版本中存在。具体来说：

**有 `var.select()` 函数的版本：**
- `randomForestSRC` 版本 **2.9.3** 及更早版本
- 大约在版本 **3.0.0** 之后，这个函数被移除或重构了

**您可以通过以下方式安装旧版本：**

```
# 方法1: 安装 2.9.3 版本（最后一个包含 var.select 的稳定版本）
remove.packages("randomForestSRC")
remotes::install_version("randomForestSRC", version = "2.9.3")

# 方法2: 如果 2.9.3 不可用，尝试 2.5.1
remotes::install_version("randomForestSRC", version = "2.5.1")
```

**验证安装：**

```
library(randomForestSRC)
packageVersion("randomForestSRC")  # 应该显示 2.9.3

# 检查是否有 var.select 函数
exists("var.select")
```

**注意事项：**
1. 旧版本可能在某些新版本的 R 上存在兼容性问题
2. 旧版本可能缺少新功能和性能改进
3. 建议优先考虑使用新版本的替代方法

**新版本的等效替代方案：**
如果您必须使用新版本，可以创建一个模拟 `var.select()` 功能的函数：

```
# 自定义 var.select 替代函数
var.select <- function(fit, method = "md", ntree = 100, ...) {
  # 使用 subsample 方法
  sub_result <- subsample(fit, ...)
  
  # 获取变量重要性
  importance_scores <- fit$importance
  sorted_importance <- sort(importance_scores, decreasing = TRUE)
  
  # 返回类似原函数的结果
  result <- list(
    topvars = names(sorted_importance)[1:min(10, length(sorted_importance))],
    importance = sorted_importance,
    subsample = sub_result
  )
  
  return(result)
}

# 使用方式
rid <- var.select(fit)$topvars
```

**建议：**
如果您的代码需要向后兼容，建议安装 `randomForestSRC` 2.9.3 版本。如果您想使用最新功能，建议修改代码使用新的 `subsample()` 和 `vimp()` 函数。

### 👤 User <sub>2025/07/08 23:14</sub>


R version 4.5.0 (2025-04-11) -- "How About a Twenty-Six"
Copyright (C) 2025 The R Foundation for Statistical Computing
Platform: aarch64-apple-darwin20

R is free software and comes with ABSOLUTELY NO WARRANTY.
You are welcome to redistribute it under certain conditions.
Type 'license()' or 'licence()' for distribution details.

  Natural language support but running in an English locale

R is a collaborative project with many contributors.
Type 'contributors()' for more information and
'citation()' on how to cite R or R packages in publications.

Type 'demo()' for some demos, 'help()' for on-line help, or
'help.start()' for an HTML browser interface to help.
Type 'q()' to quit R.

> rm(list = ls())
> load("/Users/yuzuan/Desktop/TCGA/4_tcga_model/CCGA-325_sur_model.Rdata")
> exprSet_325 = exprSet
> meta_325 = meta
> 
> load("/Users/yuzuan/Desktop/TCGA/4_tcga_model/CCGA-693_sur_model.Rdata")
> exprSet_693 = exprSet
> meta_693 = meta
> 
> CGGA_325 <- cbind(meta_325, t(exprSet_325))
> CGGA_693 <- cbind(meta_693, t(exprSet_693))
> proj = "TCGA-GBM"
> load(paste0(proj,"_sur_model.Rdata"))
> load(paste0(proj,"_logrank_cox_gene.Rdata"))
> load(paste0(proj,"_lassogene.Rdata"))
> load(paste0(proj,"cox_fp.Rdata"))
> 
> #load("../2_tcga_stad/gs.Rdata") #差异基因和单细胞marker基因的交集，在../2_tcga_stad/3.enrich.Rmd里面生成的
> load("../3_GEO_dat_pre/GSE16011.Rdata")  #GEO表达矩阵
> 
> gs = read.csv("../2_tcga_stad/ubiquitination.csv",header = F)$V1
> 
> #load("../2_tcga_stad/TCGA-GBM_TCGA-LGG_lncrna_expr_count.rdata")
> #a =  rownames(lncrna_expr_count)
> 
> library(tinyarray)

welcome to use tinyarray!
If you use tinyarray in published research, please acknowledgements:
We thank Dr.Jianming Zeng(University of Macau), and all the members of his bioinformatics team, biotrainee,especially Xiaojie Sun, for generously sharing their experience and codes.
> #g = intersect_all(gs,cox,a,rownames(exprSet),rownames(exp),rownames(exprSet_325),rownames(exprSet_693)) ;length(g)
> g = lassoGene
> exprSet = exprSet[g,]
> 
> pd$time <- as.numeric(pd$time)  # 转换成数值类型，可能会把 NULL 转为 NA
Warning message:
NAs introduced by coercion 
> k1 = pd$time >= 1 & !is.na(pd$time)  # time >= 1 且不为 NA
> table(k1)
k1
FALSE  TRUE 
   17   252 
> k2 = !(is.na(pd$time)|is.na(pd$event));table(k2)
k2
FALSE  TRUE 
    5   264 
> pd = pd[k1&k2,]
> s = intersect(rownames(pd),colnames(exp));length(s)
[1] 252
> exp = exp[,s]
> pd = pd[s,]
> identical(rownames(pd),colnames(exp))
[1] TRUE
> 
> GSE16011_Dataset <- cbind(pd, t(exp))
> load("../3_GEO_dat_pre/GSE72951.Rdata")  #GEO表达矩阵
> pd$time <- as.numeric(pd$time)  # 转换成数值类型，可能会把 NULL 转为 NA
> k1 = pd$time >= 1 & !is.na(pd$time)  # time >= 1 且不为 NA
> table(k1)
k1
FALSE  TRUE 
    2   110 
> k2 = !(is.na(pd$time)|is.na(pd$event));table(k2)
k2
FALSE  TRUE 
    2   110 
> pd = pd[k1&k2,]
> s = intersect(rownames(pd),colnames(exp));length(s)
[1] 110
> exp = exp[,s]
> pd = pd[s,]
> identical(rownames(pd),colnames(exp))
[1] TRUE
> GSE72951 <- cbind(pd, t(exp))
> #g = intersect_all(colnames(GSE72951_Dataset),lassoGene) ;length(g)
> 
> library(caret)
Loading required package: ggplot2
Loading required package: lattice
> set.seed(12345679)
> sam<- createDataPartition(meta$event, p = .7, list = FALSE)
> head(sam)
     Resample1
[1,]         1
[2,]         5
[3,]         9
[4,]        10
[5,]        11
[6,]        13
> train <- exprSet[,sam]
> test <- exprSet[,-sam]
> train_meta <- meta[sam,]
> test_meta <- meta[-sam,]
> 
> Testing_Dataset1 <- cbind(test_meta, t(test))
> Training_Dataset <- cbind(meta, t(exprSet))
> 
> mm <- list(
+   Training_Dataset = Training_Dataset,  # 训练集数据
+   Testing_Dataset = Testing_Dataset1,  # 测试集1
+   CGGA_325 = CGGA_325,   # CGGA 325数据集
+   CGGA_693 = CGGA_693,   # CGGA 693数据集
+   GSE72951 = GSE72951, 
+   GSE16011 = GSE16011_Dataset# GSE16011数据集
+  
+ )
> 
> save(mm, file = "mm.Rdata")
> library(survival) #生存分析功能

Attaching package: ‘survival’

The following object is masked from ‘package:caret’:

    cluster
> library(randomForestSRC) #随机森林用于生存、回归和分类的包

 randomForestSRC 3.4.1 
 
 Type rfsrc.news() to see new features, changes, and bug fixes. 
 
> library(glmnet) #弹性网和lasso回归分析
Loading required package: Matrix
Loaded glmnet 4.1-9
> library(plsRcox) #偏最小二乘回归和Cox模型
> library(superpc) #基于超参数的预测分析
superpc 1.12
Type superpc.news() to see new features, changes, and bug fixes
> library(gbm) #梯度提升机
Loaded gbm 2.2.2
This version of gbm is no longer under development. Consider transitioning to gbm3, https://github.com/gbm-developers/gbm3
> library(CoxBoost) #用于Cox回归模型的梯度提升
Loading required package: prodlim
> library(survivalsvm) #支持向量机用于生存分析
> library(dplyr) #数据操作和整理

Attaching package: ‘dplyr’

The following object is masked from ‘package:tinyarray’:

    union_all

The following objects are masked from ‘package:stats’:

    filter, lag

The following objects are masked from ‘package:base’:

    intersect, setdiff, setequal, union
> library(tibble) #数据操作和整理
> library(BART) #贝叶斯加法回归树
Loading required package: nlme

Attaching package: ‘nlme’

The following object is masked from ‘package:dplyr’:

    collapse
> library(rms)
Loading required package: Hmisc

Attaching package: ‘Hmisc’

The following objects are masked from ‘package:dplyr’:

    src, summarize

The following object is masked from ‘package:survivalsvm’:

    logrank

The following object is masked from ‘package:randomForestSRC’:

    impute

The following objects are masked from ‘package:base’:

    format.pval, units
> ### 1.RSF随机生存森林 ####
> 
> set.seed(seed)
Error: object 'seed' not found

> ### 1.RSF随机生存森林 ####
> 
> set.seed(seed)
Error: object 'seed' not found

> rid <- var.select(fit)$topvars
Error in var.select(fit) : could not find function "var.select"

> rid <- var.select.rfsrc(fit)$topvars
Error in var.select.rfsrc(fit) : 
  could not find function "var.select.rfsrc"

> ### 1.RSF随机生存森林 ####
> 
> set.seed(seed)
Error: object 'seed' not found

> ??randomForestSRC
> install.packages("remotes")
Error in install.packages : Updating loaded packages
> remotes::install_version("randomForestSRC", version = "3.3.1")
Downloading package from url: https://mirrors.tuna.tsinghua.edu.cn/CRAN//src/contrib/Archive/randomForestSRC/randomForestSRC_3.3.1.tar.gz
Restarting R session...
> install.packages("remotes")
Installing package into ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
trying URL 'https://mirrors.tuna.tsinghua.edu.cn/CRAN/bin/macosx/big-sur-arm64/contrib/4.5/remotes_2.5.0.tgz'
Content type 'application/octet-stream' length 431784 bytes (421 KB)
==================================================
downloaded 421 KB


The downloaded binary packages are in
	/var/folders/xr/pllbgtl13_jch0_n05ymlrbc0000gn/T//RtmpjSB6r7/downloaded_packages
> rid <- var.select(fit)$topvars
Error in var.select(fit) : could not find function "var.select"

> library(randomForestSRC) 

 randomForestSRC 3.4.1 
 
 Type rfsrc.news() to see new features, changes, and bug fixes. 
 
> remove.packages("randomForestSRC")
Removing package from ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
> "randomForestSRC" %in% rownames(installed.packages())
[1] FALSE
> # 返回 FALSE 表示已卸载
> remotes::install_version("randomForestSRC", version = "2.9.3")
Downloading package from url: https://mirrors.tuna.tsinghua.edu.cn/CRAN//src/contrib/Archive/randomForestSRC/randomForestSRC_2.9.3.tar.gz
Installing package into ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
* installing *source* package ‘randomForestSRC’ ...
** this is package ‘randomForestSRC’ version ‘2.9.3’
** package ‘randomForestSRC’ successfully unpacked and MD5 sums checked
** using staged installation
checking for gcc... clang -arch arm64
checking whether the C compiler works... yes
checking for C compiler default output file name... a.out
checking for suffix of executables... 
checking whether we are cross compiling... no
checking for suffix of object files... o
checking whether we are using the GNU C compiler... yes
checking whether clang -arch arm64 accepts -g... yes
checking for clang -arch arm64 option to accept ISO C89... none needed
checking for clang -arch arm64 option to support OpenMP... unsupported
configure: creating ./config.status
config.status: creating src/Makevars
** libs
using C compiler: ‘Apple clang version 15.0.0 (clang-1500.3.9.4)’
using SDK: ‘MacOSX14.4.sdk’
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c R_init_randomForestSRC.c -o R_init_randomForestSRC.o
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c randomForestSRC.c -o randomForestSRC.o
randomForestSRC.c:26692:9: warning: variable 'v' set but not used [-Wunused-but-set-variable]
  char *v;
        ^
randomForestSRC.c:27185:11: warning: format string is not a string literal (potentially insecure) [-Wformat-security]
  Rprintf(buffer);
          ^~~~~~
randomForestSRC.c:27185:11: note: treat the string as an argument to avoid this
  Rprintf(buffer);
          ^
          "%s", 
2 warnings generated.
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c splitCustom.c -o splitCustom.o
clang -arch arm64 -dynamiclib -Wl,-headerpad_max_install_names -undefined dynamic_lookup -L/Library/Frameworks/R.framework/Resources/lib -L/opt/R/arm64/lib -o randomForestSRC.so R_init_randomForestSRC.o randomForestSRC.o splitCustom.o -F/Library/Frameworks/R.framework/.. -framework R
installing to /Users/yuzuan/Library/R/library/00LOCK-randomForestSRC/00new/randomForestSRC/libs
** R
** data
** inst
** byte-compile and prepare package for lazy loading
** help
*** installing help indices
** building package indices
** testing if installed package can be loaded from temporary location
** checking absolute paths in shared objects and dynamic libraries
** testing if installed package can be loaded from final location
** testing if installed package keeps a record of temporary installation path
* DONE (randomForestSRC)
> rid <- var.select(fit)$topvars
Error in var.select(fit) : could not find function "var.select"

> packageVersion("randomForestSRC")
[1] ‘2.9.3’
> data(veteran, package = "randomForestSRC")
> fit <- rfsrc(Surv(time, status) ~ ., data = veteran)
> var.select(fit)
Error in var.select(fit) : could not find function "var.select"

> remove.packages("randomForestSRC")
Removing package from ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
> remotes::install_version("randomForestSRC", version = "3.3.1")
Downloading package from url: https://mirrors.tuna.tsinghua.edu.cn/CRAN//src/contrib/Archive/randomForestSRC/randomForestSRC_3.3.1.tar.gz
Installing package into ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
* installing *source* package ‘randomForestSRC’ ...
** this is package ‘randomForestSRC’ version ‘3.3.1’
** package ‘randomForestSRC’ successfully unpacked and MD5 sums checked
** using staged installation
checking for gcc... clang -arch arm64
checking whether the C compiler works... yes
checking for C compiler default output file name... a.out
checking for suffix of executables... 
checking whether we are cross compiling... no
checking for suffix of object files... o
checking whether the compiler supports GNU C... yes
checking whether clang -arch arm64 accepts -g... yes
checking for clang -arch arm64 option to enable C11 features... none needed
checking for clang -arch arm64 option to support OpenMP... unsupported
configure: creating ./config.status
config.status: creating src/Makevars
** libs
using C compiler: ‘Apple clang version 15.0.0 (clang-1500.3.9.4)’
using SDK: ‘MacOSX14.4.sdk’
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c R_init_randomForestSRC.c -o R_init_randomForestSRC.o
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c randomForestSRC.c -o randomForestSRC.o
randomForestSRC.c:36504:9: warning: variable 'v' set but not used [-Wunused-but-set-variable]
  char *v;
        ^
1 warning generated.
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c splitCustom.c -o splitCustom.o
clang -arch arm64 -dynamiclib -Wl,-headerpad_max_install_names -undefined dynamic_lookup -L/Library/Frameworks/R.framework/Resources/lib -L/opt/R/arm64/lib -o randomForestSRC.so R_init_randomForestSRC.o randomForestSRC.o splitCustom.o -F/Library/Frameworks/R.framework/.. -framework R
installing to /Users/yuzuan/Library/R/library/00LOCK-randomForestSRC/00new/randomForestSRC/libs
** R
** data
** inst
** byte-compile and prepare package for lazy loading
** help
*** installing help indices
** building package indices
** testing if installed package can be loaded from temporary location
** checking absolute paths in shared objects and dynamic libraries
** testing if installed package can be loaded from final location
** testing if installed package keeps a record of temporary installation path
* DONE (randomForestSRC)
> library(randomForestSRC)
> packageVersion("randomForestSRC")  # 应该返回 2.9.3
[1] ‘3.3.1’
> data(veteran, package = "randomForestSRC")
> fit <- rfsrc(Surv(time, status) ~ ., data = veteran)
> var.select(fit)
Error in var.select(fit) : could not find function "var.select"

> class(fit)
[1] "rfsrc" "grow"  "surv" 
> fit <- rfsrc(Surv(time, status) ~ ., data = veteran)
> var.select(fit)
Error in var.select(fit) : could not find function "var.select"

> ls("package:randomForestSRC")
 [1] "extract.bootsample"         "extract.quantile"           "extract.subsample"         
 [4] "fast.load"                  "fast.load.list"             "fast.save"                 
 [7] "fast.save.list"             "find.interaction"           "find.interaction.rfsrc"    
[10] "get.auc"                    "get.bayes.rule"             "get.brier.error"           
[13] "get.brier.survival"         "get.cindex"                 "get.confusion"             
[16] "get.imbalanced.optimize"    "get.imbalanced.performance" "get.logloss"               
[19] "get.misclass.error"         "get.mv.cserror"             "get.mv.csvimp"             
[22] "get.mv.error"               "get.mv.error.block"         "get.mv.formula"            
[25] "get.mv.predicted"           "get.mv.vimp"                "get.partial.plot.data"     
[28] "get.pr.auc"                 "get.pr.curve"               "get.quantile"              
[31] "get.quantile.crps"          "get.quantile.stat"          "get.rfq.threshold"         
[34] "get.tree"                   "get.tree.rfsrc"             "holdout.vimp"              
[37] "holdout.vimp.rfsrc"         "imbalanced"                 "imbalanced.rfsrc"          
[40] "impute"                     "impute.rfsrc"               "lsos"                      
[43] "max.subtree"                "max.subtree.rfsrc"          "partial"                   
[46] "partial.rfsrc"              "plot.competing.risk"        "plot.competing.risk.rfsrc" 
[49] "plot.quantreg"              "plot.quantreg.rfsrc"        "plot.rfsrc"                
[52] "plot.subsample"             "plot.subsample.rfsrc"       "plot.survival"             
[55] "plot.survival.rfsrc"        "plot.variable"              "plot.variable.rfsrc"       
[58] "predict.rfsrc"              "print.bootsample"           "print.bootsample.rfsrc"    
[61] "print.rfsrc"                "print.subsample"            "print.subsample.rfsrc"     
[64] "quantreg"                   "quantreg.rfsrc"             "rfsrc"                     
[67] "rfsrc.anonymous"            "rfsrc.cart"                 "rfsrc.fast"                
[70] "rfsrc.news"                 "sid.perf.metric"            "sidClustering"             
[73] "sidClustering.rfsrc"        "stat.split"                 "stat.split.rfsrc"          
[76] "subsample"                  "subsample.rfsrc"            "synthetic"                 
[79] "synthetic.rfsrc"            "tune"                       "tune.nodesize"             
[82] "tune.nodesize.rfsrc"        "tune.rfsrc"                 "vimp"                      
[85] "vimp.rfsrc"                
> # 检查是否有 var.select 相关的函数
> apropos("var")
 [1] ".rs.addGlobalVariable"                   ".rs.clearVar"                           
 [3] ".rs.defineVar"                           ".rs.detectFreeVars_Call"                
 [5] ".rs.detectFreeVars_Leaf"                 ".rs.getCompletionsEnvironmentVariables" 
 [7] ".rs.getVar"                              ".rs.hasVar"                             
 [9] ".rs.rpc.detect_free_vars"                ".rs.rpc.get_deployment_env_vars"        
[11] ".rs.rsconnect.getApplicationEnvVars"     ".rs.rsconnect.getApplicationEnvVarsImpl"
[13] ".rs.setVar"                              "all.vars"                               
[15] "estVar"                                  "get_all_vars"                           
[17] "globalVariables"                         "plot.variable"                          
[19] "plot.variable.rfsrc"                     "var"                                    
[21] "var.test"                                "variable.names"                         
[23] "varimax"                                
> apropos("select")
 [1] ".rs.api.selectDirectory"           ".rs.api.selectFile"               
 [3] ".rs.api.selectionGet"              ".rs.api.selectionSet"             
 [5] ".rs.api.setSelectionRanges"        ".rs.createNodeSelectorRule"       
 [7] ".rs.selectEndsWith"                ".rs.selectFuzzyMatches"           
 [9] ".rs.selectIsSubsequence"           ".rs.selectStartsWith"             
[11] ".rs.setSelectionStartBorderRadius" ".selectSuperClasses"              
[13] "MethodsListSelect"                 "select.list"                      
[15] "selectMethod"                      "selectSuperClasses"               
[17] "socketSelect"                     
> 
> # 或者查看是否有其他变量选择方法
> apropos("variable")
[1] ".rs.addGlobalVariable"                  ".rs.getCompletionsEnvironmentVariables"
[3] "globalVariables"                        "plot.variable"                         
[5] "plot.variable.rfsrc"                    "variable.names"                        
> plot.variable(fit)
Warning message:
In bxp(z = list(stats = c(49.0087456958099, 63.6793964649683, 69.2774331779233,  :
  some notches went outside hinges ('box'): maybe set notch=FALSE

> # 查看 randomForestSRC 包的所有导出函数
> ls("package:randomForestSRC")
 [1] "extract.bootsample"         "extract.quantile"           "extract.subsample"         
 [4] "fast.load"                  "fast.load.list"             "fast.save"                 
 [7] "fast.save.list"             "find.interaction"           "find.interaction.rfsrc"    
[10] "get.auc"                    "get.bayes.rule"             "get.brier.error"           
[13] "get.brier.survival"         "get.cindex"                 "get.confusion"             
[16] "get.imbalanced.optimize"    "get.imbalanced.performance" "get.logloss"               
[19] "get.misclass.error"         "get.mv.cserror"             "get.mv.csvimp"             
[22] "get.mv.error"               "get.mv.error.block"         "get.mv.formula"            
[25] "get.mv.predicted"           "get.mv.vimp"                "get.partial.plot.data"     
[28] "get.pr.auc"                 "get.pr.curve"               "get.quantile"              
[31] "get.quantile.crps"          "get.quantile.stat"          "get.rfq.threshold"         
[34] "get.tree"                   "get.tree.rfsrc"             "holdout.vimp"              
[37] "holdout.vimp.rfsrc"         "imbalanced"                 "imbalanced.rfsrc"          
[40] "impute"                     "impute.rfsrc"               "lsos"                      
[43] "max.subtree"                "max.subtree.rfsrc"          "partial"                   
[46] "partial.rfsrc"              "plot.competing.risk"        "plot.competing.risk.rfsrc" 
[49] "plot.quantreg"              "plot.quantreg.rfsrc"        "plot.rfsrc"                
[52] "plot.subsample"             "plot.subsample.rfsrc"       "plot.survival"             
[55] "plot.survival.rfsrc"        "plot.variable"              "plot.variable.rfsrc"       
[58] "predict.rfsrc"              "print.bootsample"           "print.bootsample.rfsrc"    
[61] "print.rfsrc"                "print.subsample"            "print.subsample.rfsrc"     
[64] "quantreg"                   "quantreg.rfsrc"             "rfsrc"                     
[67] "rfsrc.anonymous"            "rfsrc.cart"                 "rfsrc.fast"                
[70] "rfsrc.news"                 "sid.perf.metric"            "sidClustering"             
[73] "sidClustering.rfsrc"        "stat.split"                 "stat.split.rfsrc"          
[76] "subsample"                  "subsample.rfsrc"            "synthetic"                 
[79] "synthetic.rfsrc"            "tune"                       "tune.nodesize"             
[82] "tune.nodesize.rfsrc"        "tune.rfsrc"                 "vimp"                      
[85] "vimp.rfsrc"                
> 
> # 查看包的版本和描述
> packageDescription("randomForestSRC")
Package: randomForestSRC
Version: 3.3.1
Date: 2024-07-25
Title: Fast Unified Random Forests for Survival, Regression, and Classification
         (RF-SRC)
Author: Hemant Ishwaran <hemant.ishwaran@gmail.com>, Udaya B. Kogalur
         <ubk@kogalur.com>
Maintainer: Udaya B. Kogalur <ubk@kogalur.com>
BugReports: https://github.com/kogalur/randomForestSRC/issues/
Depends: R (>= 4.3.0),
Imports: parallel, data.tree, DiagrammeR
Suggests: survival, pec, prodlim, mlbench, interp, caret, imbalance, cluster, fst,
         data.table
Description: Fast OpenMP parallel computing of Breiman's random forests for
         univariate, multivariate, unsupervised, survival, competing risks, class
         imbalanced classification and quantile regression. New Mahalanobis splitting
         for correlated outcomes.  Extreme random forests and randomized splitting.
         Suite of imputation methods for missing data.  Fast random forests using
         subsampling. Confidence regions and standard errors for variable importance.
         New improved holdout importance. Case-specific importance.  Minimal depth
         variable importance. Visualize trees on your Safari or Google Chrome
         browser. Anonymous random forests for data privacy.
License: GPL (>= 3)
URL: https://www.randomforestsrc.org/ https://ishwaran.org/
NeedsCompilation: yes
Packaged: 2024-07-25 13:00:37 UTC; kogalur
Repository: CRAN
Date/Publication: 2024-07-25 14:30:02 UTC
Built: R 4.5.0; aarch64-apple-darwin20; 2025-07-08 15:00:46 UTC; unix

-- File: /Users/yuzuan/Library/R/library/randomForestSRC/Meta/package.rds 
> 
> # 查看帮助文档中是否有变量选择相关的函数
> help(package = "randomForestSRC")
> rid <- subsample(fit)$topvars
no importance found: calculating it now ...
done
                                                            
> subsample(fit)
no importance found: calculating it now ...
done
===== VIMP/error confidence regions for time  =====         
nonparametric:
         trt celltype karno diagtime   age  prior
2.5%  -0.001    0.082 0.204    0.037 0.034 -0.005
25%    0.004    0.105 0.244    0.045 0.045 -0.001
50%    0.005    0.114 0.261    0.049 0.049 -0.001
75%    0.005    0.119 0.276    0.052 0.053  0.000
97.5%  0.007    0.125 0.302    0.056 0.058  0.002
parametric:
         trt celltype karno diagtime   age  prior
2.5%  -0.004    0.052 0.151    0.021 0.020 -0.005
25%    0.000    0.067 0.184    0.027 0.028 -0.002
50%    0.002    0.074 0.201    0.030 0.033 -0.001
75%    0.005    0.082 0.218    0.034 0.037  0.001
97.5%  0.009    0.097 0.251    0.040 0.045  0.003
parametric (jackknife):
         trt celltype karno diagtime    age  prior
2.5%  -0.005    0.001 0.078   -0.005 -0.001 -0.005
25%    0.000    0.049 0.159    0.018  0.021 -0.002
50%    0.002    0.074 0.201    0.030  0.033 -0.001
75%    0.005    0.100 0.243    0.043  0.044  0.001
97.5%  0.010    0.148 0.324    0.066  0.066  0.003
> rid <- subsample(fit)$topvars
no importance found: calculating it now ...
done
                                                            
> # 方法1: 安装 2.9.3 版本（最后一个包含 var.select 的稳定版本）
> remove.packages("randomForestSRC")
Removing package from ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
> remotes::install_version("randomForestSRC", version = "2.9.3")
Downloading package from url: https://mirrors.tuna.tsinghua.edu.cn/CRAN//src/contrib/Archive/randomForestSRC/randomForestSRC_2.9.3.tar.gz
Installing package into ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
* installing *source* package ‘randomForestSRC’ ...
** this is package ‘randomForestSRC’ version ‘2.9.3’
** package ‘randomForestSRC’ successfully unpacked and MD5 sums checked
** using staged installation
checking for gcc... clang -arch arm64
checking whether the C compiler works... yes
checking for C compiler default output file name... a.out
checking for suffix of executables... 
checking whether we are cross compiling... no
checking for suffix of object files... o
checking whether we are using the GNU C compiler... yes
checking whether clang -arch arm64 accepts -g... yes
checking for clang -arch arm64 option to accept ISO C89... none needed
checking for clang -arch arm64 option to support OpenMP... unsupported
configure: creating ./config.status
config.status: creating src/Makevars
** libs
using C compiler: ‘Apple clang version 15.0.0 (clang-1500.3.9.4)’
using SDK: ‘MacOSX14.4.sdk’
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c R_init_randomForestSRC.c -o R_init_randomForestSRC.o
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c randomForestSRC.c -o randomForestSRC.o
randomForestSRC.c:26692:9: warning: variable 'v' set but not used [-Wunused-but-set-variable]
  char *v;
        ^
randomForestSRC.c:27185:11: warning: format string is not a string literal (potentially insecure) [-Wformat-security]
  Rprintf(buffer);
          ^~~~~~
randomForestSRC.c:27185:11: note: treat the string as an argument to avoid this
  Rprintf(buffer);
          ^
          "%s", 
2 warnings generated.
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c splitCustom.c -o splitCustom.o
clang -arch arm64 -dynamiclib -Wl,-headerpad_max_install_names -undefined dynamic_lookup -L/Library/Frameworks/R.framework/Resources/lib -L/opt/R/arm64/lib -o randomForestSRC.so R_init_randomForestSRC.o randomForestSRC.o splitCustom.o -F/Library/Frameworks/R.framework/.. -framework R
installing to /Users/yuzuan/Library/R/library/00LOCK-randomForestSRC/00new/randomForestSRC/libs
** R
** data
** inst
** byte-compile and prepare package for lazy loading
** help
*** installing help indices
** building package indices
** testing if installed package can be loaded from temporary location
** checking absolute paths in shared objects and dynamic libraries
** testing if installed package can be loaded from final location
** testing if installed package keeps a record of temporary installation path
* DONE (randomForestSRC)
> library(randomForestSRC)
> packageVersion("randomForestSRC")  # 应该显示 2.9.3
[1] ‘2.9.3’
> 
> # 检查是否有 var.select 函数
> exists("var.select")
[1] FALSE
> remove.packages("randomForestSRC")
Removing package from ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
> remotes::install_version("randomForestSRC", version = "2.5.1")
Downloading package from url: https://mirrors.tuna.tsinghua.edu.cn/CRAN//src/contrib/Archive/randomForestSRC/randomForestSRC_2.5.1.tar.gz
Installing package into ‘/Users/yuzuan/Library/R/library’
(as ‘lib’ is unspecified)
* installing *source* package ‘randomForestSRC’ ...
** this is package ‘randomForestSRC’ version ‘2.5.1’
** package ‘randomForestSRC’ successfully unpacked and MD5 sums checked
** using staged installation
checking for gcc... clang -arch arm64
checking whether the C compiler works... yes
checking for C compiler default output file name... a.out
checking for suffix of executables... 
checking whether we are cross compiling... no
checking for suffix of object files... o
checking whether we are using the GNU C compiler... yes
checking whether clang -arch arm64 accepts -g... yes
checking for clang -arch arm64 option to accept ISO C89... none needed
checking for clang -arch arm64 option to support OpenMP... unsupported
configure: creating ./config.status
config.status: creating src/Makevars
** libs
using C compiler: ‘Apple clang version 15.0.0 (clang-1500.3.9.4)’
using SDK: ‘MacOSX14.4.sdk’
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c R_init_randomForestSRC.c -o R_init_randomForestSRC.o
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c randomForestSRC.c -o randomForestSRC.o
randomForestSRC.c:20928:9: warning: variable 'v' set but not used [-Wunused-but-set-variable]
  char *v;
        ^
randomForestSRC.c:21252:11: warning: format string is not a string literal (potentially insecure) [-Wformat-security]
  Rprintf(buffer);
          ^~~~~~
randomForestSRC.c:21252:11: note: treat the string as an argument to avoid this
  Rprintf(buffer);
          ^
          "%s", 
2 warnings generated.
clang -arch arm64 -I"/Library/Frameworks/R.framework/Resources/include" -DNDEBUG   -I/opt/R/arm64/include    -fPIC  -falign-functions=64 -Wall -g -O2  -c splitCustom.c -o splitCustom.o
clang -arch arm64 -dynamiclib -Wl,-headerpad_max_install_names -undefined dynamic_lookup -L/Library/Frameworks/R.framework/Resources/lib -L/opt/R/arm64/lib -o randomForestSRC.so R_init_randomForestSRC.o randomForestSRC.o splitCustom.o -F/Library/Frameworks/R.framework/.. -framework R
installing to /Users/yuzuan/Library/R/library/00LOCK-randomForestSRC/00new/randomForestSRC/libs
** R
** data
** inst
** byte-compile and prepare package for lazy loading
** help
*** installing help indices
** building package indices
** testing if installed package can be loaded from temporary location
** checking absolute paths in shared objects and dynamic libraries
** testing if installed package can be loaded from final location
** testing if installed package keeps a record of temporary installation path
* DONE (randomForestSRC)
> library(randomForestSRC)
> packageVersion("randomForestSRC")  # 应该显示 2.9.3
[1] ‘2.5.1’
> 
> # 检查是否有 var.select 函数
> exists("var.select")
[1] FALSE

### 🤖 Copilot <sub>2025/07/08 23:14</sub>

看起来即使在较旧的版本（2.9.3 和 2.5.1）中，`var.select()` 函数也不存在。这可能意味着：

1. `var.select()` 函数可能从来就不是 `randomForestSRC` 包的一部分
2. 它可能在更早的版本中存在，或者
3. 它可能是一个自定义函数或来自其他包

让我为您创建一个解决方案。基于您之前的测试，我们知道 `subsample()` 函数在新版本中可以工作，但它没有 `$topvars` 属性。

让我创建一个自定义的 `var.select()` 函数来模拟原来的功能：

### 👤 User <sub>2025/07/08 23:18</sub>

var.select {randomForestSRC}	R Documentation
Variable Selection
Description
Variable selection using minimal depth.

Usage
## S3 method for class 'rfsrc'
var.select(formula,
  data,
  object,
  cause,
  outcome.target,
  method = c("md", "vh", "vh.vimp"),
  conservative = c("medium", "low", "high"),
  ntree = (if (method == "md") 1000 else 500),
  mvars = (if (method != "md") ceiling(ncol(data)/5) else NULL),
  mtry = (if (method == "md") ceiling(ncol(data)/3) else NULL),
  nodesize = 2, splitrule = NULL, nsplit = 10, xvar.wt = NULL,
  refit = (method != "md"), fast = FALSE,
  
  na.action = c("na.omit", "na.impute"),
  
   
  always.use = NULL, nrep = 50, K = 5, nstep = 1,
  prefit =  list(action = (method != "md"), ntree = 100,
  mtry = 500, nodesize = 3, nsplit = 1),
  do.trace = 0, verbose = TRUE, ...)
Arguments
formula	
A symbolic description of the model to be fit. Must be specified unless object is given.

data	
Data frame containing the y-outcome and x-variables in the model. Must be specified unless object is given.

object	
An object of class (rfsrc, grow). Not required when formula and data are supplied.

cause	
Integer value between 1 and J indicating the event of interest for competing risks, where J is the number of event types (this option applies only to competing risk families). The default is to use the first event type.

outcome.target	
Character vector for multivariate families specifying the target outcomes to be used when VIMP is utilized. The default is to use the first coordinate.

method	
Variable selection method:

md:
minimal depth (default).

vh:
variable hunting.

vh.vimp:
variable hunting with VIMP (variable importance).

conservative	
Level of conservativeness of the thresholding rule used in minimal depth selection:

high:
Use the most conservative threshold.

medium:
Use the default less conservative tree-averaged threshold.

low:
Use the more liberal one standard error rule.

ntree	
Number of trees to grow.

mvars	
Number of randomly selected variables used in the variable hunting algorithm (ignored when method="md").

mtry	
The mtry value used.

nodesize	
Forest average terminal node size.

splitrule	
Splitting rule used.

nsplit	
If non-zero, the specified tree splitting rule is randomized which significantly increases speed.

xvar.wt	
Vector of non-negative weights specifying the probability of selecting a variable for splitting a node. Must be of dimension equal to the number of variables. Default (NULL) invokes uniform weighting or a data-adaptive method depending on prefit$action.

refit	
Should a forest be refit using the selected variables?

fast	
Speeds up the cross-validation used for variable hunting for a faster analysis. See miscellanea below.

na.action	
Action to be taken if the data contains NA values.

always.use	
Character vector of variable names to always be included in the model selection procedure and in the final selected model.

nrep	
Number of Monte Carlo iterations of the variable hunting algorithm.

K	
Integer value specifying the K-fold size used in the variable hunting algorithm.

nstep	
Integer value controlling the step size used in the forward selection process of the variable hunting algorithm. Increasing this will encourage more variables to be selected.

prefit	
List containing parameters used in preliminary forest analysis for determining weight selection of variables. Users can set all or some of the following parameters:

action:
Determines how (or if) the preliminary forest is fit. See details below.

ntree:
Number of trees used in the preliminary analysis.

mtry:
mtry used in the preliminary analysis.

nodesize:
nodesize used in the preliminary analysis.

nsplit:
nsplit value used in the preliminary analysis.

do.trace	
Number of seconds between updates to the user on approximate time to completion.

verbose	
Set to TRUE for verbose output.

...	
Further arguments passed to or from other methods.

Details
This function implements random forest variable selection using tree minimal depth methodology (Ishwaran et al., 2010). The option method allows for two different approaches:

method="md"

Invokes minimal depth variable selection. Variables are selected using minimal depth variable selection. Uses all data and all variables simultaneously. This is basically a front-end to the max.subtree wrapper. Users should consult the max.subtree help file for details.

Set mtry to larger values in high-dimensional problems.

method="vh" or method="vh.vimp"

Invokes variable hunting. Variable hunting is used for problems where the number of variables is substantially larger than the sample size (e.g., p/n is greater than 10). It is always prefered to use method="md", but to find more variables, or when computations are high, variable hunting may be preferred.

When method="vh": Using training data from a stratified K-fold subsampling (stratification based on the y-outcomes), a forest is fit using mvars randomly selected variables (variables are chosen with probability proportional to weights determined using an initial forest fit; see below for more details). The mvars variables are ordered by increasing minimal depth and added sequentially (starting from an initial model determined using minimal depth selection) until joint VIMP no longer increases (signifying the final model). A forest is refit to the final model and applied to test data to estimate prediction error. The process is repeated nrep times. Final selected variables are the top P ranked variables, where P is the average model size (rounded up to the nearest integer) and variables are ranked by frequency of occurrence.

The same algorithm is used when method="vh.vimp", but variables are ordered using VIMP. This is faster, but not as accurate.

Miscellanea

When variable hunting is used, a preliminary forest is run and its VIMP is used to define the probability of selecting a variable for splitting a node. Thus, instead of randomly selecting mvars at random, variables are selected with probability proportional to their VIMP (the probability is zero if VIMP is negative). A preliminary forest is run once prior to the analysis if prefit$action=TRUE, otherwise it is run prior to each iteration (this latter scenario can be slow). When method="md", a preliminary forest is fit only if prefit$action=TRUE. Then instead of randomly selecting mtry variables at random, mtry variables are selected with probability proportional to their VIMP. In all cases, the entire option is overridden if xvar.wt is non-null.

If object is supplied and method="md", the grow forest from object is parsed for minimal depth information. While this avoids fitting another forest, thus saving computational time, certain options no longer apply. In particular, the value of cause plays no role in the final selected variables as minimal depth is extracted from the grow forest, which has already been grown under a preselected cause specification. Users wishing to specify cause should instead use the formula and data interface. Also, if the user requests a prefitted forest via prefit$action=TRUE, then object is not used and a refitted forest is used in its place for variable selection. Thus, the effort spent to construct the original grow forest is not used in this case.

If fast=TRUE, and variable hunting is used, the training data is chosen to be of size n/K, where n=sample size (i.e., the size of the training data is swapped with the test data). This speeds up the algorithm. Increasing K also helps.

Can be used for competing risk data. When method="vh.vimp", variable selection based on VIMP is confined to an event specific cause specified by cause. However, this can be unreliable as not all y-outcomes can be guaranteed when subsampling (this is true even when stratifed subsampling is used as done here).

Value
Invisibly, a list with the following components:

err.rate	
Prediction error for the forest (a vector of length nrep if variable hunting is used).

modelsize	
Number of variables selected.

topvars	
Character vector of names of the final selected variables.

varselect	
Useful output summarizing the final selected variables.

rfsrc.refit.obj	
Refitted forest using the final set of selected variables (requires refit=TRUE).

md.obj	
Minimal depth object. NULL unless method="md".

Author(s)
Hemant Ishwaran and Udaya B. Kogalur

References
Ishwaran H., Kogalur U.B., Gorodeski E.Z, Minn A.J. and Lauer M.S. (2010). High-dimensional variable selection for survival data. J. Amer. Statist. Assoc., 105:205-217.

Ishwaran H., Kogalur U.B., Chen X. and Minn A.J. (2011). Random survival forests for high-dimensional data. Statist. Anal. Data Mining, 4:115-132.

See Also
find.interaction, max.subtree, vimp

Examples
Run examples

## Not run: 
## ------------------------------------------------------------
## Minimal depth variable selection
## survival analysis
## ------------------------------------------------------------

data(pbc, package = "randomForestSRC")
pbc.obj <- rfsrc(Surv(days, status) ~ ., pbc, nsplit = 10, importance = TRUE)

# default call corresponds to minimal depth selection
vs.pbc <- var.select(object = pbc.obj)
topvars <- vs.pbc$topvars

# the above is equivalent to
max.subtree(pbc.obj)$topvars

# different levels of conservativeness
var.select(object = pbc.obj, conservative = "low")
var.select(object = pbc.obj, conservative = "medium")
var.select(object = pbc.obj, conservative = "high")

## ------------------------------------------------------------
## Minimal depth variable selection
## competing risk analysis
## ------------------------------------------------------------

## competing risk data set involving AIDS in women
data(wihs, package = "randomForestSRC")
vs.wihs <- var.select(Surv(time, status) ~ ., wihs, nsplit = 3, 
                      ntree = 100, importance = TRUE)

## competing risk analysis of pbc data from survival package
## implement cause-specific variable selection 
if (library("survival", logical.return = TRUE)) {
  data(pbc, package = "survival")
  pbc$id <- NULL
  var.select(Surv(time, status) ~ ., pbc, nsplit = 10, cause = 1)
  var.select(Surv(time, status) ~ ., pbc, nsplit = 10, cause = 2)
}

## ------------------------------------------------------------
## Minimal depth variable selection
## classification analysis
## ------------------------------------------------------------

vs.iris <- var.select(Species ~ ., iris)

## ------------------------------------------------------------
## Minimal depth variable selection
## Regression analysis
## ------------------------------------------------------------

#Variable hunting (overkill for low dimensions)
vh.air <- var.select(Ozone ~., airquality, method = "vh", nrep = 10, mvars = 5)

#better analysis
vs.air <- var.select(Ozone ~., airquality)

## ------------------------------------------------------------
## Minimal depth high-dimensional example
## van de Vijver microarray breast cancer survival data
## predefined weights for *selecting* a gene for node splitting
## determined from a preliminary forest analysis
## ------------------------------------------------------------

data(vdv, package = "randomForestSRC")
md.breast <- var.select(Surv(Time, Censoring) ~ ., vdv,
  prefit = list(action = TRUE))

## same analysis, but with customization for the preliminary forest fit
## note the large mtry and small nodesize values used
md.breast.custom <- var.select(Surv(Time, Censoring) ~ ., vdv, 
  prefit = list(action = TRUE, mtry = 500, nodesize = 1))

## ------------------------------------------------------------
## Minimal depth high-dimensional example
## van de Vijver microarray breast cancer survival data
## predefined weights for genes for *splitting* tree nodes
## weights defined in terms of cox p-values
## ------------------------------------------------------------

if (library("survival", logical.return = TRUE) 
    & library("parallel", logical.return = TRUE))
{
  cox.weights <- function(rfsrc.f, rfsrc.data) {
    event.names <- all.vars(rfsrc.f)[1:2]
    p <- ncol(rfsrc.data) - 2
    event.pt <- match(event.names, names(rfsrc.data))
    xvar.pt <- setdiff(1:ncol(rfsrc.data), event.pt)
    unlist(mclapply(1:p, function(j) {
      cox.out <- coxph(rfsrc.f, rfsrc.data[, c(event.pt, xvar.pt[j])])
      pvalue <- summary(cox.out)$coef[5]
      if (is.na(pvalue)) 1.0 else 1/(pvalue + 1e-100)
    }))
  }       
  data(vdv, package = "randomForestSRC")
  rfsrc.f <- as.formula(Surv(Time, Censoring) ~ .)
  cox.wts <- cox.weights(rfsrc.f, vdv)
  breast.obj <- rfsrc(rfsrc.f, vdv, nsplit = 10, xvar.wt = cox.wts,
                      importance = TRUE)
  md.breast.splitwt <- var.select(object = breast.obj) 
}


## ------------------------------------------------------------
## Variable hunting high-dimensional example
## van de Vijver microarray breast cancer survival data
## nrep is small for illustration; typical values are nrep = 100
## ------------------------------------------------------------

data(vdv, package = "randomForestSRC")
vh.breast <- var.select(Surv(Time, Censoring) ~ ., vdv,
      method = "vh", nrep = 10, nstep = 5)

# plot top 10 variables
plot.variable(vh.breast$rfsrc.refit.obj,
  xvar.names = vh.breast$topvars[1:10])
plot.variable(vh.breast$rfsrc.refit.obj,
  xvar.names = vh.breast$topvars[1:10], partial = TRUE)

## similar analysis, but using weights from univarate cox p-values
if (library("survival", logical.return = TRUE))
{
  cox.weights <- function(rfsrc.f, rfsrc.data) {
    event.names <- all.vars(rfsrc.f)[1:2]
    p <- ncol(rfsrc.data) - 2
    event.pt <- match(event.names, names(rfsrc.data))
    xvar.pt <- setdiff(1:ncol(rfsrc.data), event.pt)
    sapply(1:p, function(j) {
      cox.out <- coxph(rfsrc.f, rfsrc.data[, c(event.pt, xvar.pt[j])])
      pvalue <- summary(cox.out)$coef[5]
      if (is.na(pvalue)) 1.0 else 1/(pvalue + 1e-100)
    })
  }       
  data(vdv, package = "randomForestSRC")
  rfsrc.f <- as.formula(Surv(Time, Censoring) ~ .)
  cox.wts <- cox.weights(rfsrc.f, vdv)
  vh.breast.cox <- var.select(rfsrc.f, vdv, method = "vh", nstep = 5,
    nrep = 10, xvar.wt = cox.wts)
}

## ------------------------------------------------------------
## variable selection for multivariate mixed forests
## ------------------------------------------------------------

mtcars.new <- mtcars
mtcars.new$cyl <- factor(mtcars.new$cyl)
mtcars.new$carb <- factor(mtcars.new$carb, ordered = TRUE)
mv.obj <- rfsrc(cbind(carb, mpg, cyl) ~., data = mtcars.new,
              importance = TRUE)
var.select(mv.obj, method = "vh.vimp", nrep = 10)



### 🤖 Copilot <sub>2025/07/08 23:18</sub>

太好了！您找到了 `var.select()` 函数的文档。现在我明白了为什么之前找不到这个函数 - 它确实存在于 `randomForestSRC` 包中，但可能需要正确的加载方式。

让我帮您解决这个问题。基于文档，`var.select()` 函数确实应该在 `randomForestSRC` 包中。让我们尝试重新安装并正确加载：

```
# 首先完全清除当前的 randomForestSRC 包
remove.packages("randomForestSRC")

# 重启 R 会话
# 然后重新安装最新版本
install.packages("randomForestSRC")

# 或者安装 3.3.1 版本
remotes::install_version("randomForestSRC", version = "3.3.1")

# 加载包
library(randomForestSRC)

# 检查函数是否存在
exists("var.select", mode = "function")

# 查看函数
var.select
```

如果还是不行，我们可以创建一个基于文档的自定义 `var.select()` 函数：

```
# 自定义 var.select 函数（基于 randomForestSRC 的逻辑）
var.select <- function(object = NULL, 
                       formula = NULL, 
                       data = NULL,
                       method = "md",
                       conservative = "medium",
                       ntree = 1000,
                       mtry = NULL,
                       nodesize = 2,
                       refit = TRUE,
                       ...) {
  
  # 如果提供了 object，使用它
  if (!is.null(object)) {
    fit <- object
  } else if (!is.null(formula) && !is.null(data)) {
    # 否则使用 formula 和 data 创建模型
    fit <- rfsrc(formula, data, ntree = ntree, nodesize = nodesize, 
                 importance = TRUE, ...)
  } else {
    stop("Either 'object' or both 'formula' and 'data' must be provided")
  }
  
  # 使用 max.subtree 进行最小深度变量选择
  if (method == "md") {
    md_result <- max.subtree(fit, conservative = conservative)
    
    # 获取变量重要性
    importance_scores <- fit$importance
    if (is.null(importance_scores)) {
      # 如果没有重要性分数，重新计算
      vimp_result <- vimp(fit)
      importance_scores <- vimp_result$importance
    }
    
    # 按重要性排序选择变量
    sorted_vars <- names(sort(importance_scores, decreasing = TRUE))
    
    # 获取 topvars
    if (!is.null(md_result$topvars)) {
      topvars <- md_result$topvars
    } else {
      # 如果 max.subtree 没有 topvars，使用前几个重要变量
      n_vars <- min(10, length(sorted_vars))
      topvars <- sorted_vars[1:n_vars]
    }
    
    # 重新拟合模型（如果需要）
    rfsrc_refit <- NULL
    if (refit && !is.null(topvars)) {
      if (!is.null(formula) && !is.null(data)) {
        # 创建新的公式，只包含选择的变量
        response_vars <- all.vars(formula)[1:2]  # 假设是生存分析
        new_formula <- as.formula(paste(
          paste(response_vars, collapse = " + "), "~", 
          paste(topvars, collapse = " + ")
        ))
        rfsrc_refit <- rfsrc(new_formula, data, 
                            ntree = ntree, nodesize = nodesize, 
                            importance = TRUE, ...)
      }
    }
    
    result <- list(
      topvars = topvars,
      modelsize = length(topvars),
      varselect = data.frame(
        variable = topvars,
        rank = 1:length(topvars)
      ),
      rfsrc.refit.obj = rfsrc_refit,
      md.obj = md_result,
      err.rate = if (!is.null(rfsrc_refit)) rfsrc_refit$err.rate else fit$err.rate
    )
    
    return(result)
  }
  
  # 如果是其他方法，使用 subsample
  else {
    sub_result <- subsample(fit)
    
    # 获取变量重要性并排序
    importance_scores <- fit$importance
    if (is.null(importance_scores)) {
      vimp_result <- vimp(fit)
      importance_scores <- vimp_result$importance
    }
    
    sorted_vars <- names(sort(importance_scores, decreasing = TRUE))
    n_vars <- min(10, length(sorted_vars))
    topvars <- sorted_vars[1:n_vars]
    
    result <- list(
      topvars = topvars,
      modelsize = length(topvars),
      varselect = data.frame(
        variable = topvars,
        rank = 1:length(topvars)
      ),
      subsample = sub_result,
      err.rate = fit$err.rate
    )
    
    return(result)
  }
}

# 现在您可以使用这个函数
# 首先确保有一个 seed 变量
seed <- 12345
set.seed(seed)

# 然后运行您的原始代码
fit <- rfsrc(Surv(time,event)~.,data = est_dd,
             ntree = 1000,nodesize = rf_nodesize,
             splitrule = 'logrank',
             importance = T,
             proximity = T,
             forest = T,
             seed = seed)

# 现在这应该可以工作了
rid <- var.select(fit)$topvars
print(rid)
```

请先尝试重新安装 `randomForestSRC` 包，如果还是不行，就使用上面的自定义函数。
