# 这个是我的森林图的代码: # 创建多因素分析结果数据框 multi_results <- data.frame( var = rownames(multi...

| Field | Value |
|-------|-------|
| Session ID | `c598bf65-78c8-4da9-8fe3-b218b0aca3d9` |
| Workspace | (no workspace) |
| Start | 2025/05/09 15:16 |
| End | 2025/05/09 15:17 |
| Messages | 1 |

---

### 👤 User <sub>2025/05/09 15:17</sub>

这个是我的森林图的代码:  # 创建多因素分析结果数据框
  multi_results <- data.frame(
    var = rownames(multi_summary$coefficients),
    HR = round(multi_summary$coefficients[, "exp(coef)"], 2),
    HR.95L = round(multi_summary$conf.int[, "lower .95"], 2),
    HR.95H = round(multi_summary$conf.int[, "upper .95"], 2),
    pvalue = round(multi_summary$coefficients[, "Pr(>|z|)"], 4)
  )
  
  # 显示多因素分析结果
  print(multi_results)
  
  # 绘制多因素分析的森林图
  multi_results$HR_CI <- paste0(multi_results$HR, " (", 
                              multi_results$HR.95L, "-", 
                              multi_results$HR.95H, ")")
  
  forest_data_multi <- data.frame(
    var = multi_results$var,
    hr = multi_results$HR,
    lower = multi_results$HR.95L,
    upper = multi_results$HR.95H,
    pvalue = multi_results$pvalue,
    hr_text = multi_results$HR_CI
  )
  
  # 创建多因素分析的森林图
  ggplot(data=forest_data_multi, aes(y=var, x=hr, xmin=lower, xmax=upper)) +
    geom_pointrange() +
    geom_vline(xintercept=1, linetype="dashed", color="red") +
    xlab("Hazard Ratio (95% CI)") +
    ylab("Variables") +
    ggtitle("多因素Cox回归分析") +
    theme_bw() +
    theme(axis.text.y=element_text(size=12)) +
    scale_x_continuous(trans='log10') +
    annotate("text", x=max(forest_data_multi$upper)*1.1, 
             y=1:nrow(forest_data_multi), 
             label=paste0("P=", forest_data_multi$pvalue), hjust=0)
} else {
  print("没有变量在单因素分析中达到统计学显著性")
}
但是我想要的效果的代码是如下:# 定义主题：
tm <- forest_theme(base_size = 10,
                   # 置信区间点形状，线类型/颜色/宽度
                   ci_pch = 16,  # 点形状
                   ci_col = "red",
                   ci_lty = 1, # 线条类型
                   ci_lwd = 1.5, # 线条宽度
                   ci_Theight = 0.4, # 在CI的末尾设置T形尾部
                   # 参考线宽/类型/颜色
                   refline_lwd = 1,
                   refline_lty = "dashed",
                   refline_col = "grey20",
                   # 垂直的线宽/类型/颜色
                   vertline_lwd = 1,
                   vertline_lty = "dashed",
                   vertline_col = "grey20",
                   # 更改填充和边框的摘要颜色
                   summary_fill = "red",
                   summary_col = "red",
                   # 脚注字体大小/字形/颜色
                   footnote_cex = 0.6,
                   footnote_fontface = "italic",
                   footnote_col = "red")

# 绘图：
pdf("forest_plot05.pdf", height = 7, width = 10)
forest(dt_tmp[,c(1:3, 20:21)],
       est = dt_tmp$est,
       lower = dt_tmp$low, 
       upper = dt_tmp$hi,
       sizes = dt_tmp$se,
       is_summary = c(rep(FALSE, nrow(dt_tmp)-1), TRUE),
       ci_column = 4,
       ref_line = 1,
       arrow_lab = c("Placebo Better", "Treatment Better"),
       xlim = c(0, 4),
       ticks_at = c(0.5, 1, 2, 3),
       footnote = "This is the demo data. Please feel free to change\nanything you want.",
       theme = tm)
dev.off().请根据我想要的代码效果修改我的森林图代码
