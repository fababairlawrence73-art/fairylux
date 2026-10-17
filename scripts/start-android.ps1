param([string]$DeviceId)
. "$PSScriptRoot\environment.ps1"
Initialize-Tools -Android

$deviceLines = @(adb devices | Select-String '^\S+\s+device$')
$devices = @($deviceLines | ForEach-Object { ($_.Line -split '\s+')[0] })
if ($DeviceId) {
    if ($DeviceId -notin $devices) { throw "Device $DeviceId is not connected/authorized. Check adb devices." }
} elseif ($devices.Count -eq 1) {
    $DeviceId = $devices[0]
} else {
    throw 'Connect exactly one authorized Android device/emulator, or pass -DeviceId SERIAL (see adb devices).'
}

Invoke-Checked adb @('-s', $DeviceId, 'reverse', 'tcp:8000', 'tcp:8000')
Invoke-Checked adb @('-s', $DeviceId, 'reverse', 'tcp:8081', 'tcp:8081')
try {
    Set-Location (Join-Path $ProjectRoot 'fairylux-mobile')
    Invoke-Checked npm.cmd @('run', 'android', '--', '--device', $DeviceId, '--no-packager')
} finally {
    Set-Location $ProjectRoot
}
