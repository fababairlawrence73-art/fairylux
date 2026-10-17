# FairyLux Android customer app

Follow the [repository setup guide](../README.md) for exact Node/JDK/SDK versions, Firebase and device networking.

Keep Laravel running, start Metro here with `npm.cmd start`, then run `scripts/start-android.ps1` from the repository root in another terminal. This forwards ports 8000/8081 and builds for the connected ARM64 phone or x86_64 emulator.

Register in the app or use an existing Firebase account; the SQL seed customer is not a mobile login.

Checks: `npm.cmd test -- --runInBand --watch=false`.

iOS needs macOS/Xcode and additional Firebase configuration. This handoff targets Android.
