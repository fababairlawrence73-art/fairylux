$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot

function Invoke-Checked {
    param([string]$Command, [string[]]$Arguments)
    $executable = (Get-Command $Command -ErrorAction Stop).Source
    $previousPreference = $ErrorActionPreference
    try {
        # Windows PowerShell 5 treats native stderr (including npm warnings) as
        # ErrorRecords. Display it as text and use the actual process exit code.
        $ErrorActionPreference = 'Continue'
        & $executable @Arguments 2>&1 | ForEach-Object { Write-Host $_ }
        $commandExit = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousPreference
    }
    if ($commandExit -ne 0) {
        throw "$Command failed (exit $commandExit). Fix the error above, then run the command again."
    }
}

function Initialize-Tools {
    param([switch]$Android)
    if (-not (Get-Command php -ErrorAction SilentlyContinue) -and (Test-Path 'C:\xampp\php\php.exe')) {
        $env:PATH = 'C:\xampp\php;' + $env:PATH
    }
    foreach ($command in @('node', 'npm.cmd')) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
            throw "Install Node.js 22.17.0 (or a compatible version listed in README.md), then reopen PowerShell. Missing: $command"
        }
    }
    Invoke-Checked node @('-e', 'const [a,b]=process.versions.node.split(String.fromCharCode(46)).map(Number); if(!((a===22&&b>=13)||(a===24&&b>=3)||a>=26)){console.error(process.versions.node);process.exit(1)}')

    if ($Android) {
        $sdk = $env:ANDROID_HOME
        if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
        if (-not $sdk) { $sdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
        if (-not (Test-Path -LiteralPath "$sdk\platform-tools\adb.exe")) {
            throw 'Android SDK was not found. Install Android Studio and Platform-Tools, then set ANDROID_HOME to your SDK folder.'
        }
        $env:ANDROID_HOME = $sdk
        $env:PATH = "$sdk\platform-tools;" + $env:PATH
        if (-not $env:JAVA_HOME) {
            foreach ($candidate in @('C:\Program Files\Java\jdk-17', 'C:\Program Files\Android\Android Studio\jbr')) {
                if (Test-Path -LiteralPath "$candidate\bin\java.exe") {
                    $env:JAVA_HOME = $candidate
                    break
                }
            }
        }
        if (-not $env:JAVA_HOME -or -not (Test-Path -LiteralPath "$env:JAVA_HOME\bin\java.exe")) {
            throw 'Install JDK 17 or 21 and set JAVA_HOME to its installation folder.'
        }
        $env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
        foreach ($component in @('build-tools\37.0.0', 'ndk\27.1.12297006', 'cmake\3.22.1')) {
            if (-not (Test-Path -LiteralPath "$sdk\$component")) {
                throw "Missing Android SDK component: $component. Install it using Android Studio > SDK Manager (Show Package Details)."
            }
        }
        if (-not ((Test-Path -LiteralPath "$sdk\platforms\android-37") -or (Test-Path -LiteralPath "$sdk\platforms\android-37.0"))) {
            throw 'Install Android SDK Platform 37 using Android Studio > SDK Manager.'
        }
        # This file is deliberately ignored by Git and generated for this laptop only.
        $properties = Join-Path $ProjectRoot 'fairylux-mobile\android\local.properties'
        if (-not (Test-Path -LiteralPath $properties)) {
            [IO.File]::WriteAllText($properties, 'sdk.dir=' + $sdk.Replace('\', '/') + "`n", [Text.UTF8Encoding]::new($false))
        }
    }
}
