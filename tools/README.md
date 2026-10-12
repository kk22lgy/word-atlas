# 内置词库装配

应用直接读取 `lib/data/core-5000.json`，本目录工具仅用于维护词库。

源材料使用固定版本，不属于运行依赖：

- `wordnet-db@3.1.14` npm 包内的 WordNet 3.1 `dict/` 文件。
- `ecdict@0.0.4` npm 包内的 `assets/ecdict.csv`。
- `authored-collocations.mjs` 中明确编写的专业概念和领域搭配。
- `lib/original-vocabulary.mjs` 中原有资料，先排除基础独立词条。

从 npm 官方注册表取得上述两个固定版本的 tarball。下载缓存不进入 Git。将 WordNet tarball 保存为 `tools/cache/wordnet-db-3.1.14.tgz`，解压至 `tools/cache/package/`；将 ECDICT tarball 解压至 `tools/cache/ecdict-package/package/`。仅读取数据文件，无需安装或运行这两个包。源数据校验值保存在 `lib/data/manifest.json`。

然后运行：

```powershell
node tools/build-vocabulary.mjs
npm test
```

脚本使用首义索引、词频、中文资料、包含目标词的英文例句和基础词规则筛选数据，按词条去重并写入恰好 5,000 条完整资料。候选中间结果保存在忽略提交的 `tools/cache/candidates.json`。领域搭配逐项列明，不按词表做笛卡尔积生成。

WordNet 的英文义项可能包含专业或历史用法，ECDICT 的中文字段可能列出多个义项；自动筛选不等同于全部人工审校。维护时应检查词义与例句是否一致，保留来源及完整许可证。WordNet 3.1 的授权文字在其 `dict/index.noun` 文件开头；ECDICT 使用上游项目的 MIT 授权文本。
