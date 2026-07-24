param(
  [string]$Project = "planit-hub",
  [string]$Target = "legal",
  [string]$Channel = "",
  [string]$Expires = "30d",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

if (-not $SkipBuild) {
  npm.cmd run build:firebase
}

$outDir = Join-Path $repoRoot "out"
if (-not (Test-Path -LiteralPath $outDir -PathType Container)) {
  throw "Build output folder was not found: $outDir"
}

if ($Channel) {
  firebase.cmd hosting:channel:deploy $Channel --expires $Expires --only $Target --project $Project
} else {
  firebase.cmd deploy --only "hosting:$Target" --project $Project
}
