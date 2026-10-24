param(
  [string]$Project = "",
  [string]$Target = "",
  [string]$Account = "",
  [string]$Channel = "",
  [string]$Expires = "30d",
  [string]$LegalSourceRoot = "",
  [switch]$SyncLegalDocuments,
  [switch]$SkipDeploy,
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot
$releaseArgs = @((Join-Path $PSScriptRoot "site-update.mjs"))
if ($Project) { $releaseArgs += @("--project", $Project) }
if ($Target) { $releaseArgs += @("--target", $Target) }
if ($Account) { $releaseArgs += @("--account", $Account) }
if ($Channel) { $releaseArgs += @("--channel", $Channel, "--expires", $Expires) }
if ($SkipDeploy) { $releaseArgs += "--check" }
if ($SkipBuild) { $releaseArgs += "--skip-build" }
if ($LegalSourceRoot) { $releaseArgs += @("--legal-source", $LegalSourceRoot) }
elseif ($SyncLegalDocuments) { $releaseArgs += @("--legal-source", "../PlanIt") }
node @releaseArgs
if ($LASTEXITCODE -ne 0) { throw "Website workflow failed. See the error above." }
