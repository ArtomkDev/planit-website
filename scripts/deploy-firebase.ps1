param(
  [string]$Project = "planit-hub",
  [string]$Target = "legal",
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

if ($SkipBuild -and ($SyncLegalDocuments -or $LegalSourceRoot)) {
  throw "Localized legal publication requires a website build. Remove -SkipBuild."
}

if ($SyncLegalDocuments -or $LegalSourceRoot) {
  $syncScript = Join-Path $repoRoot "scripts\sync-legal-documents.mjs"
  if ($LegalSourceRoot) {
    node $syncScript --source $LegalSourceRoot
  } else {
    node $syncScript
  }
  if ($LASTEXITCODE -ne 0) { throw "Legal document synchronization failed." }
}

if (-not $SkipBuild) {
  npm.cmd run build:firebase
  if ($LASTEXITCODE -ne 0) { throw "Website build failed. Deployment stopped." }
}

$outDir = Join-Path $repoRoot "out"
if (-not (Test-Path -LiteralPath $outDir -PathType Container)) {
  throw "Build output folder was not found: $outDir"
}

if ($SkipDeploy) {
  Write-Host "Prepared website and legal documents in $outDir. Firebase deploy skipped."
  return
}

if ($Channel) {
  firebase.cmd hosting:channel:deploy $Channel --expires $Expires --only $Target --project $Project
} else {
  firebase.cmd deploy --only "hosting:$Target" --project $Project
}
if ($LASTEXITCODE -ne 0) { throw "Firebase Hosting deployment failed." }
