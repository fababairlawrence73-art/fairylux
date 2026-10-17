. "$PSScriptRoot\environment.ps1"
Initialize-Tools
try {
    Set-Location (Join-Path $ProjectRoot 'fairylux-admin')
    Invoke-Checked composer @('run', 'dev')
} finally {
    Set-Location $ProjectRoot
}
