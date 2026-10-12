$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$repoName = 'kk22lgy/word-atlas'
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Install GitHub CLI first: https://cli.github.com/' }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Install Git first: https://git-scm.com/' }
$account = gh api user --jq '.login'
if ($LASTEXITCODE -ne 0) { throw 'Run gh auth login --hostname github.com --web --git-protocol https, then sign in as kk22lgy.' }
if ($account.Trim() -ne 'kk22lgy') { throw "Current account is $account. Sign in as kk22lgy before publishing." }
gh repo view $repoName --json name 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) { throw 'kk22lgy/word-atlas already exists. Stopping to avoid overwriting an existing repository.' }
if (-not (Test-Path -LiteralPath '.git')) {
  git init -b main
  if ($LASTEXITCODE -ne 0) { throw 'Git initialization failed.' }
}
$gitName = git config user.name
if (-not $gitName) { git config user.name 'kk22lgy' }
$gitEmail = git config user.email
if (-not $gitEmail) { git config user.email 'kk22lgy@users.noreply.github.com' }
git add -- .
if ($LASTEXITCODE -ne 0) { throw 'Git staging failed.' }
git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
  git commit -m 'Build Word Atlas vocabulary learning project'
  if ($LASTEXITCODE -ne 0) { throw 'Git commit failed.' }
}
gh repo create $repoName --public --source . --remote origin --push --description 'English vocabulary learning for everyday life, global travel, business and battery energy storage.'
if ($LASTEXITCODE -ne 0) { throw 'GitHub upload failed. Check authentication and repository permissions.' }
Write-Host 'Uploaded: https://github.com/kk22lgy/word-atlas'
