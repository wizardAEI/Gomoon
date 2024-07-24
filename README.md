<h1 align="center">Gomoon</h1>
<div align="center">
<img order-radius="100px" height="150px" src="https://github.com/wizardAEI/blog-images/blob/main/gomoon-icon.png" alt=""/>
<div><b>Gomoon</b> 是一款桌面端的大模型效率工具。</div>
</div>

<h1 align="center"> </h1>

## 招募招募！

<img order-radius="100px" align="left" height="160px" src="https://github.com/wizardAEI/Gomoon/assets/61337085/df3aab98-d40e-4e97-827f-7436ff6f823b" alt=""/>

Gomoon 是一个开源项目，目前处于初始阶段，还有很多功能有待完善。如果你想一起把 Gomoon 做得更好，欢迎加入我们！

未来，Gomoon 还将实现炫酷的主题功能，更加自定义的 Prompt 模板功能，在线获取好用的助手和知识库功能，以及第三方接入和万能的插件...

如果你也想要参与进来，欢迎加入 Gomoon 开发群：758015092。

## 介绍

<img order-radius="100px" align="right"  height="450px" src="https://github.com/wizardAEI/Gomoon/assets/61337085/fd5336ae-e8c1-4ec8-83f5-12eccdaae63f" alt=""/>

要使用 Gomoon，你只需要在 Gomoon 上配置好你的模型引擎，就可以快速让你的助手帮你回答问题，提高工作和学习效率。又或者...只是给你讲个笑话😋。

它同时支持：

- 创建属于自己的助手，选择多种大模型引擎（支持实时切换）
- 快速问答和连续的对话以及存取对话历史
- 对话可以复制，暂停 ⏸，以及重新生成，方便你的使用。更厉害的是你还可以直接编辑答案，让后续的对话更加的智能
- 快速唤起，快捷键，置顶等功能，例如你可以使用 `Ctrl + G` 快速唤起 Gomoon，双击复制(`Command + C +C`)快速问答
- 发送文件，图片和URL解析，联网查询，朗读等快捷功能
- 使用记忆胶囊储存你的本地知识库，更加安全可靠，最重要的是完全免费
- 下载对话记录，助手一键导入导出, 把你觉得实用的助手分享给你的朋友
- 在 Gomoon 划选一段文本，可以快速进行查找和朗读
- 在任何地方滑选字段后，可以使用召唤 Gomoon 快捷键快速将选中字段粘贴到输入框内
- 合集功能，用来记单词，记知识点，整理方案，等等!

更多实用的功能可以询问 Gomoon 中自带的『Gomoon使用指南』 记忆胶囊来探索！

## 已支持的模型

| 模型类型   | 模型名称                                                                    |
| ---------- | --------------------------------------------------------------------------- |
| ChatGPT    | GPT3，GPT4 Mini，GPT4，支持 OpenAI API 模式的模型                           |
| 文心       | 文心3.5，文心4.0，文心128k                                                  |
| DeepSeek   | DeepSeek Coder 和 DeepSeek Coder 最新版本                                   |
| 千问       | 千问Turbo，千问Plus，千问Max                                                |
| Gemini     | Gemini Pro 和 Gemini 自定义模型                                             |
| Kimi       | Kimi 8k，Kimi 32k，Kimi 128k                                                |
| Llama      | [node-llama-cpp](https://withcatai.github.io/node-llama-cpp) 支持的所有模型 |
| Ollama     | [ollama](https://ollama.com/) 支持的所有模型                                |
| 自定义模型 | 任何支持 OpenAI 接口的模型，如DeepSeek，豆包，Kimi，讯飞星火等              |

由于 ChatGPT 国内访问不易，这里推荐一下 [ChatAnywhere](https://peiqishop.me/)，价格十分实惠的国内 ChatGPT 提供商。

## 安装指南

[官网下载地址](https://gomoon.top)

**Tips:**mac 用户由于没有上架 mac 应用市场，需要在『**访达**→应用』中找到 Gomoon 右键打开并二次确认才可以使用。『Command + C +C 双击复制』和『发送文件』功能需要用户允许 Gomoon 的权限请求，并且**重启**应用。

## 灵感来源

<img align="right" height="180px" src="https://github.com/wizardAEI/Gomoon/assets/61337085/8c4a7dd2-0956-4c60-ab11-378d7df47937" alt="lucy"/>

使用过很多大模型应用，但是他们总是局限于一个网页端，我想让他离我近一些，更好用一些。

寻找了很多应用，我还是没有找到适合自己的，于是我选择做一个。Gomoon 就诞生了。

Gomoon 的名字来源于 _赛博朋克：边缘行者_ 的中 Lucy 的愿望：『去月球』。希望 Gomoon 能够帮助你去往那颗属于自己的月球。

## 交流

如果你有任何问题或者想交流一下使用体验，分享自己的助手，欢迎加入QQ群:758015092（后续 Gomoon 更新通知也会发布在群内）。

## 鸣谢

感谢以下开发者的支持：

| 贡献者                                                                                          | 贡献内容                          |
| ----------------------------------------------------------------------------------------------- | --------------------------------- |
| [![e9ab98e991ab](https://github.com/e9ab98e991ab.png?size=50)](https://github.com/e9ab98e991ab) | 协助完成 mac 端 x86_64 架构的适配 |
| [![zhengxs2018](https://github.com/zhengxs2018.png?size=50)](https://github.com/zhengxs2018)    | 支持通义千问模型                  |

## 开发/贡献指南

项目本身还有很多新功能需要开发，非常欢迎大家加入项目组，一起来贡献代码。

node 版本要求：v20.11.1 及以上 （开启Corepack，终端执行：`corepack enable` ）
pnpm 版本要求：v8.3.1 （终端执行： `pnpm install` ）

安装过程中会出现 `prebuild-install` 时间过长的情况，原因是其过程会去 github 拉取文件，解决方：暂时设置终端代理：
`export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890`（其中端口 7890 根据实际情况更换）

由于仓库大小限制，默认的资源没有上传到 Github，开发者可以在本地安装的 Gomoon 中找到 `resources`文件夹（mac用户可以通过 Finder，右键点击应用，选择“显示包内容”来浏览到 `Contents`目录，`resource`文件夹存储于 `Contents/Resource/app.asar.unpacked/resources`; windows系统中，这个路径通常是在用户数据资源内，例如 `C:\Users\Lenovo\AppData\Local\Programs\gomoon\resources\app.asar.unpacked\resources`），将里面的资源文件复制到项目根目录的 `resources`文件夹中。

`resources` 文件夹结构如下：

```bash
resources/
├── assistants.json # 默认助手配置文件
├── eventTracker # 事件追踪文件，根据系统不同也可能为 `eventTracker.exe` 或者 `eventTracker-x86`
├── icon.png # 应用图标
├── icon@20.png # 应用图标
├── lines.json # 默认标题栏配置文件
├── memories.json # 默认记忆文件
└── models # 模型配置文件
    └── Xenova
        └── jina-embeddings-v2-base-zh
            └── ....
```

同时也可以使用[云盘](https://www.123pan.com/s/Cwttjv-29lXv.html)下载

后续就可以正常启动项目进行开发了。

## llama-cpp 支持 CUDA（NVIDIA 显卡调用）

1. 确保你的显卡支持 CUDA，并且已经安装了 CUDA 驱动和 CUDA Toolkit（版本12以上）
2. 克隆该项目，获取 resource 文件，并放在项目根目录
3. 在根目录执行 `yarn`（确保电脑已经安装 node 和 全局依赖 yarn），安装项目所需依赖
4. 在根目录执行 `npx --no node-llama-cpp download --cuda` 安装 `node-llama-cpp` CUDA 支持依赖
5. 如需修改显卡使用大小，可以修改 `src/lib/utils.ts`中 `ChatLlamaCpp`的 `gpuLayers`参数
6. 执行 `yarn dev` 测试效果没有问题后，执行 `yarn build` 打包项目，在 dist 目录可以看到 `setup.exe` 软件安装文件

## 相关介绍

[八个月后，我终于做出了自己满意的大模型工具](https://juejin.cn/post/7388444606457757715)

[一键本地使用上百款开源大模型，不挑配置，2分钟学会！](https://www.bilibili.com/video/BV1uM4m127hV)
