# 找到系统的剪切板共享文件位置

| Field | Value |
|-------|-------|
| Session ID | `dcac6efd-860e-4aec-85ad-a66d539618ee` |
| Workspace | 系统剪切板共享文件位置查询 |
| Start | 2026/03/13 04:38 |
| End | 2026/03/13 14:58 |
| Messages | 6 |

---

### 👤 User <sub>2026/03/13 14:47</sub>

找到系统的剪切板共享文件位置

### 🤖 Copilot <sub>2026/03/13 14:47</sub>

在 macOS 系统中，剪切板的内容通常存储在内存中，而不是一个具体的文件中。然而，macOS 提供了一个命令行工具 `pbpaste` 和 `pbcopy`，可以用来访问和操作剪切板内容。

如果你想查看剪切板的内容，可以在终端中运行以下命令：

```
pbpaste
```

如果你想将内容写入剪切板，可以使用以下命令：

```
echo "内容" | pbcopy
```

如果你需要进一步操作剪切板内容或将其保存到文件中，请告诉我，我可以提供更多帮助！

### 👤 User <sub>2026/03/13 14:49</sub>

帮我找到这个位置：/Library/Group\ Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/*

### 🤖 Copilot <sub>2026/03/13 14:49</sub>

我先检查你给出的系统路径和同名的用户库路径，确认这个 shared-pasteboard 目录实际存在于哪里。

系统级目录不存在；实际位置在当前用户的 Group Containers 下面。我继续展开 shared-pasteboard 目录，把可用的实际路径列出来。

我再把你原始通配写法对应到实际可访问的完整路径，避免只停留在目录层级。

你要找的实际位置不在系统级的 /Library 下，而是在当前用户目录下：

/Users/yuzuan/Library/Group Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/

你给出的通配路径对应到这些实际条目：

/Users/yuzuan/Library/Group Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/0434CF67-82B7-4E3F-B804-F5C8F680F910
/Users/yuzuan/Library/Group Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/95BE6834-F6DD-4C11-919A-D5865A1921D3
/Users/yuzuan/Library/Group Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/archives
/Users/yuzuan/Library/Group Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/items
/Users/yuzuan/Library/Group Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/type-clone

也就是说，你原来那条路径应改成：

/Users/yuzuan/Library/Group\ Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/*

如果你要，我可以继续帮你把这个目录里的文件结构展开，或者直接定位当前剪切板内容落在哪个子目录里。

### 👤 User <sub>2026/03/13 14:58</sub>

需要的

### 🤖 Copilot <sub>2026/03/13 14:58</sub>

我先展开 shared-pasteboard 的关键子目录，并检查 UUID 目录里的文件名，这样可以判断当前剪切板内容是按哪种结构落盘的。

那两个 UUID 项是文件，不是目录；我继续检查它们的文件类型和元数据，顺便对照当前剪切板文本，看看哪一个是活跃项。

我已经确认当前较新的活跃项很可能是那个 plist 文件；下一步把 plist 结构和另一个 data 文件里的可读字符串取出来，定位当前剪切板文本映射到哪一项。

plutil 直接解析失败，说明这个文件虽然被识别成 plist，但很可能是额外封装格式。我改看文件头和可读字符串，足够把位置与用途确认下来。

已经定位到这个目录的真实内容，并确认它存的是 shared/universal clipboard 的归档项，不是当前本机普通文本剪切板的直接落盘文件。接下来我给你结论，并附上可继续深入的操作选项。

shared-pasteboard 已定位完成，下一步要我继续做哪项？
Selected: 定位当前本机剪切板

我继续改查当前本机剪切板的落点，重点看 pboard 进程和它是否打开了某个临时文件或目录。

pboard 没有打开一个直接的数据文件，但它确实订阅了 Pasteboard.Change 的 Biome 流目录。我继续检查这个目录，看看有没有可读的变更记录或索引。

Biome 目录本身是空的；我补查用户库中和 pboard 相关的目录名，确认当前机器上有没有可见的本地落盘路径。

发现一个更相关的路径：Core Spotlight 的 PasteboardHistory 索引目录。我检查它的结构，判断它是不是你要找的“可见本地剪切板落盘位置”。

结论已经比较明确了：你最初要找的 shared clipboard 目录是用户目录下的那个 shared-pasteboard；而当前本机普通剪切板没有发现一个稳定、可直接读取的独立文件，现有可见痕迹主要是 pboard 进程本身、Biome 事件流目录，以及一个空的 Spotlight 历史索引目录。换句话说，shared-pasteboard 负责共享/接力剪切板项，当前本机的 pbpaste 文本并不直接落在那个目录里。

基于现在的定位结果，下一步要我继续哪种方式？

我已经确认当前较新的活跃项很可能是那个 plist 文件；下一步把 plist 结构和另一个 data 文件里的可读字符串取出来，定位当前剪切板文本映射到哪一项。

plutil 直接解析失败，说明这个文件虽然被识别成 plist，但很可能是额外封装格式。我改看文件头和可读字符串，足够把位置与用途确认下来。

已经定位到这个目录的真实内容，并确认它存的是 shared/universal clipboard 的归档项，不是当前本机普通文本剪切板的直接落盘文件。接下来我给你结论，并附上可继续深入的操作选项。

shared-pasteboard 已定位完成，下一步要我继续做哪项？
Selected: 定位当前本机剪切板

我继续改查当前本机剪切板的落点，重点看 pboard 进程和它是否打开了某个临时文件或目录。

pboard 没有打开一个直接的数据文件，但它确实订阅了 Pasteboard.Change 的 Biome 流目录。我继续检查这个目录，看看有没有可读的变更记录或索引。

Biome 目录本身是空的；我补查用户库中和 pboard 相关的目录名，确认当前机器上有没有可见的本地落盘路径。

发现一个更相关的路径：Core Spotlight 的 PasteboardHistory 索引目录。我检查它的结构，判断它是不是你要找的“可见本地剪切板落盘位置”。

结论已经比较明确了：你最初要找的 shared clipboard 目录是用户目录下的那个 shared-pasteboard；而当前本机普通剪切板没有发现一个稳定、可直接读取的独立文件，现有可见痕迹主要是 pboard 进程本身、Biome 事件流目录，以及一个空的 Spotlight 历史索引目录。换句话说，shared-pasteboard 负责共享/接力剪切板项，当前本机的 pbpaste 文本并不直接落在那个目录里。

基于现在的定位结果，下一步要我继续哪种方式？
