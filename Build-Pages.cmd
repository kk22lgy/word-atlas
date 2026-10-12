@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在生成手机网页版，读取本地已补全的词汇，不导出收藏、复习记录或密钥。
node tools/build-pages.mjs
if errorlevel 1 (
  echo 生成失败，请检查上面的提示。
) else (
  echo 已生成 docs 文件夹。请将更新后的 docs 文件夹内容上传到 GitHub 仓库中的 docs 目录。
  echo 两台设备刷新同一网址即可读取新词库。未补全的词条不会发布。
)
pause
