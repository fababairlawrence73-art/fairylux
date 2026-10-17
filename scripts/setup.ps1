param([switch]$SkipMobile, [switch]$SkipBackend)
. "$PSScriptRoot\environment.ps1"

Initialize-Tools -Android:(-not $SkipMobile)
try {
    if (-not $SkipBackend) {
        foreach ($command in @('php', 'composer')) {
            if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
                throw "Install $command and add it to PATH. See README.md."
            }
        }
        Set-Location (Join-Path $ProjectRoot 'fairylux-admin')
        if (-not (Test-Path .env)) { Copy-Item .env.example .env }
        Invoke-Checked composer @('install', '--no-interaction', '--prefer-dist')
        Invoke-Checked php @('artisan', 'config:clear')
        if (-not (Select-String -Path .env -Pattern '^APP_KEY=.+$' -Quiet)) {
            Invoke-Checked php @('artisan', 'key:generate')
        }
        Invoke-Checked php @('artisan', 'fairylux:database')
        Invoke-Checked php @('artisan', 'migrate', '--seed')
        Invoke-Checked php @('artisan', 'storage:link')
        Invoke-Checked npm.cmd @('ci', '--no-audit', '--no-fund')
        Invoke-Checked npm.cmd @('run', 'build')
    }
    if (-not $SkipMobile) {
        Set-Location (Join-Path $ProjectRoot 'fairylux-mobile')
        Invoke-Checked npm.cmd @('ci', '--no-audit', '--no-fund')
    }
    Write-Host 'Setup complete. Run scripts/start-backend.ps1, start Metro, then scripts/start-android.ps1 as described in README.md.' -ForegroundColor Green
} finally {
    Set-Location $ProjectRoot
}
