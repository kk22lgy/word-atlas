# Word Atlas · 词汇地图

一个可本地运行、自建词库的英语学习项目，面向日常生活、全球旅游、商业工作和电池储能。界面支持电脑与手机浏览器。

## 手机网页版：GitHub Pages

本项目现在有两种运行方式：本地 Node.js 后台用于统一导入、编辑、自动补全词汇；`docs/` 是可直接托管到 GitHub Pages 的完整学习网页，含全部已发布词库。手机和电脑访问同一网址即可学习，不需要后台服务器常驻。

网页版本的收藏、复习阶段与到期时间保存在当前浏览器，彼此不自动同步。设置中可备份、恢复学习记录。词库发布更新按单词保留已有进度。网页版本不接受直接修改统一词库，新增词汇在本地管理版处理后发布。

首次网页上传和启用 Pages 的详细步骤见 [网页上传说明.md](网页上传说明.md)。目标地址启用后为 **https://kk22lgy.github.io/word-atlas/**。

后续维护：在本地导入词汇并等待补全完成，然后双击 **Build-Pages.cmd**，或执行 `npm run build:pages`。将生成的 `docs/` 内容更新至 GitHub 仓库的 `docs/` 目录；两台设备刷新网页即可获取新词库。只发布已完成的词条，不发布个人学习进度、访问令牌、数据库或密钥。

`npm run preview:pages` 可在本机预览 Pages 版：`http://127.0.0.1:3213/word-atlas/`。不要直接双击 HTML 文件，以免浏览器阻止加载词库。

## 启动本地管理版

需要 **Node.js 24 或更高版本**。没有第三方运行依赖，不需要 npm install。

```powershell
cd "K:\创新一号门\英语\word-atlas"
npm start
```

打开 **http://127.0.0.1:3210**。Windows 也可以双击 `start.cmd`，保留运行窗口，再打开上述地址。

如端口被占用：PowerShell 中先执行 `$env:PORT='3211'`，再运行 `npm start`，访问对应端口。

## 已实现

- **5,000 个完整词条**：日常与通用词汇 3,638、全球旅游 380、商业工作 430、电池储能 552。其中单词 3,709 个、短语及搭配 1,291 个（含连字符词）。每条包含中文释义、词性、英文解释和英文例句。
- **排除基础独立词条**：a–z 单字母、基础冠词、代词、介词、数字等不进入学习列表或导出；批量导入时会提示这些基础词。AC、DC、SOC 等专业缩写和含基础词的完整短语仍可使用。基础词可在例句中点击查义。
- **美音朗读**：单词、短语、完整例句均可朗读；只选择 `en-US` 系统语音，支持调整语速。在线词典提供美音录音时也可使用该录音。美音音标仅在词典提供时显示，不伪造音标。
- **例句关联点击**：例句中的每个英文单词可点击，先查询本地词库，再查询在线词典；支持常见复数、动词变化与部分不规则词。可返回上一个词，或把查到的词加入自己的词库。
- **词库管理**：分类、搜索、收藏、手动新增、编辑、JSON / CSV 导出。
- **闪卡与间隔复习**：每轮最多 10 个词；“还需练习”安排 10 分钟后再见，“记住了 / 很熟悉”按学习阶段安排 1、3、7、14、30、60、120 天后的复习；记录保存在后台。
- **批量导入**：CSV、TSV、TXT、JSON；文件上传、拖入、粘贴文本；导入前预览、重复跳过和无效行提示。每批最多 2,000 个词条，最大 2 MB。
- **后台补全与保存**：导入后立即加入 SQLite 词库，异步查询英文释义和例句，支持可选 AI 补全。未完成的任务在重启后继续；未查到、网络失败或缺例句的词条标记为“待补充”，可编辑或重试。

## 内置词库与升级

新增词库已随源码完整打包，无需联网下载。英文释义与例句主要来自 [WordNet 3.1](https://wordnet.princeton.edu/)，中文词义来自 [ECDICT](https://github.com/skywind3000/ECDICT)；另有原创专业概念、旅游和商业搭配。词条详情显示来源，并提供[许可声明](public/licenses.html)。第三方资料不属于本项目原创。

词库装配优先选择 WordNet 的首义，筛选含目标词的例句，排除基础独立词条、狭窄分类学义项等，再补入明确列出的领域搭配。中文词义可能包含多个义项，应结合英文解释和例句理解。词库不是逐词人工审定的教材，可以通过“编辑词条”修正自己的资料。

从原 190 条版本升级：重启应用即可自动扩充；不覆盖已编辑词条、收藏、复习阶段和到期时间。被排除的基础词只从学习列表移出，数据库中的原始记录与复习历史保留。已有手动新增的非基础词会额外保留，因此个人词库总数可能超过 5,000。

完整源材料授权声明保存在 `lib/data/licenses/` 和网页许可页；词条统计与源文件校验值在 `lib/data/manifest.json`。重建方法见 [tools/README.md](tools/README.md)。运行应用无需源数据缓存。

## 发音设置

在“发音与设置”选择美音声线。语音来自当前浏览器与操作系统；部分在线声线需要网络。

如果未检测到美音，请在 Windows 的语言与语音设置中安装 **英语（美国）** 语音，重新打开 Edge / Chrome。项目不会把英音或其他语音冒充美音。没有可用美音时会明确提示。

## 词汇表格式

可以在界面下载模板，也可以使用 `examples/words.csv`、`examples/words.txt`、`examples/words.json`。

CSV / TSV 必须包含 `word` 或 `单词` 表头。其余字段均可选：

| 字段         | 说明                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| word         | 英文单词或短语，最长 120 字符                                                    |
| category     | daily / travel / business / energy，或 日常生活 / 全球旅游 / 商业工作 / 电池储能 |
| chinese      | 中文释义                                                                         |
| definition   | 英文解释                                                                         |
| example      | 英文例句                                                                         |
| partOfSpeech | noun / verb / adjective 等                                                       |
| phonetic     | 已核实的音标                                                                     |

```csv
word,category,chinese,definition,example
resilience,business,韧性,The ability to recover from difficulty.,Resilience helps a team adapt to change.
thermal conductivity,energy,导热系数,,
```

TXT 每行一个单词或短语。JSON 可以是字符串数组、词条对象数组，或 `{"words": [...]}`。文件使用 UTF-8；Excel 请另存为 **CSV UTF-8** 后上传。当前不直接解析 `.xlsx`。

同一单词忽略大小写与多余空格，只保留一份；重复导入不会覆盖已有资料或进度。导入出现无效行时请先修正，再重新预览和提交。

## 自动补全

默认使用 [Free Dictionary API](https://dictionaryapi.dev/)，无需密钥；外部词典需要网络，查询结果会缓存在本地。该词典不保证覆盖全部专业短语，也不保证每个词有中文、音标或例句。

不在词典中的词汇仍会加入词库，并明确标记待补充。专业词建议同时上传自己的英文解释与例句。

可选配置 OpenAI 兼容的 AI 服务，以补全专业词资料。复制 `.env.example` 为 `.env`，填入你自己的配置，然后运行：

```powershell
node --env-file=.env server.mjs
```

```dotenv
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=你的服务支持的模型名称
AI_API_KEY=你的密钥
```

服务需要支持 `/chat/completions` 和 JSON 对象输出。AI 自动生成内容会标记来源，应核对专业术语。配置服务后，在设置里点击“重试所有待补充词条”。AI 调用可能产生服务商费用。密钥只在服务端使用，`.env` 不进入 Git。

## 数据与部署

数据保存在 `data/word-atlas.sqlite`。完整备份请先停止服务，再复制整个 `data/` 文件夹；词库、收藏和复习记录均在其中。界面导出的是词汇学习资料，不包含收藏和复习进度。

此版本是**个人共享词库**，不包含多账号系统。默认仅监听 `127.0.0.1`。若需要在局域网或云服务器使用，设置 `HOST=0.0.0.0` 和强随机 `APP_TOKEN`，并在浏览器设置中输入令牌。对公网部署还应使用 HTTPS 和持久化磁盘。

本地管理版包含 Node.js 后台；Pages 学习版从发布的 JSON 词库读取资料，个人进度保存在浏览器。两种模式均包含发音、释义、例句查词、收藏和复习。若未来需要跨设备同步个人学习进度，再部署完整 Node.js 后台与持久化数据库。

Docker 示例：

```sh
docker build -t word-atlas .
docker run -d --name word-atlas -p 127.0.0.1:3210:3210 -e APP_TOKEN=replace-with-a-long-random-token -v word-atlas-data:/app/data word-atlas
```

## 上传到 GitHub

目标仓库：`kk22lgy/word-atlas`。项目没有包含你的其他英语文件、数据库或密钥。

先在终端通过 `gh auth login --hostname github.com --web --git-protocol https` 登录 **kk22lgy**。然后执行：

```powershell
./Publish-GitHub.ps1
```

脚本检查当前登录账号是否为 kk22lgy，创建独立的公开仓库并推送源码与 Pages 网页；若仓库已存在则停止，避免覆盖。免费 Pages 方案需使用公开仓库；网页发布内容也会公开，请只发布你希望公开的词汇资料。手动网页上传无需运行该脚本。

## 检查

```sh
npm run check
npm test
```

自动测试覆盖 5,000 条唯一性、词条完整度、基础词排除、190 条旧库升级及记录保留、CSV / JSON / TXT 解析、中文列名、重复词、无效导入、词形关联、异步补全成功和失败、手动编辑、收藏、复习到期、导出、令牌与跨站写入检查、重启后持久化。测试使用独立临时数据库和模拟词典，不依赖外网或 AI 密钥。

## 项目结构

```text
public/              界面、样式、浏览器交互
lib/vocabulary.mjs   加载四领域内置词库
lib/data/            5000 条完整资料、统计、第三方许可
lib/learning-policy.mjs 基础词筛选规则
lib/import.mjs       格式解析、校验、标准化
lib/enrich.mjs       词典查询、缓存、后台队列、可选 AI
lib/store.mjs        SQLite 初始化与保留学习记录的升级
server.mjs           HTTP 服务和 API
examples/            可上传的词汇表示例
test/                单元、数据升级与接口集成测试
tools/               词库装配、Pages 生成与预览
docs/                可直接托管的完整学习网页
Build-Pages.cmd      从本地词库生成待发布网页
```

技术依据：[Node SQLite](https://nodejs.org/api/sqlite.html)、[Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance)、[Free Dictionary API](https://dictionaryapi.dev/)。
