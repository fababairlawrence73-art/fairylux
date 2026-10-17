# FairyLux

Laravel 12 + Inertia/React admin and API (`fairylux-admin`), with a React Native 0.87 Android customer app (`fairylux-mobile`). This handoff supports **Windows + XAMPP/MySQL + Android** and includes migrations, demo accounts, 25 demo gowns and 24 sets of product photos (Adelaide has no supplied photo).

## 1. Install on the new laptop

| Tool | Requirement |
| --- | --- |
| Git | Available in PowerShell |
| Node.js + npm | **22.17.0 recommended**, also in `.nvmrc`. Supported: `^22.13.0`, `^24.3.0`, or `>=26`. Node 20 is insufficient. |
| XAMPP / PHP | **8.2+** with PDO MySQL, cURL, OpenSSL, fileinfo, mbstring and DOM/XML. Start **MySQL**; Apache is unnecessary with `artisan serve`. |
| Composer | Composer 2, in PATH |
| JDK | **17** recommended; set `JAVA_HOME` to its installation folder, not `bin`. Android Studio's bundled JDK 21 is also compatible with this Gradle version. |
| Android Studio | Install SDK components below and an emulator, or use a USB Android phone with USB debugging enabled. |

In Android Studio > SDK Manager, enable **Show Package Details** and install:

- Android SDK Platform **37**.
- Build-Tools **37.0.0**.
- NDK (Side by side) **27.1.12297006**.
- CMake **3.22.1**.
- Platform-Tools and Command-line Tools (latest).

Set `ANDROID_HOME` to the SDK folder, normally `%LOCALAPPDATA%\Android\Sdk`. Helpers also discover that default directory and standard XAMPP PHP. Accept SDK licenses in Android Studio. Use a **Google Play** emulator image for Google Sign-In; devices must run API 24 or later. ARM64 phones and x86_64 emulators are supported.

See the [React Native installation guide](https://reactnative.dev/docs/set-up-your-environment) for installing tools. The exact SDK versions above are specific to this repository's Gradle configuration.

## 2. Clone and set up

Use a short path outside OneDrive, such as `C:\src\fairylux`. In PowerShell:

```powershell
git clone https://github.com/fababairlawrence73-art/fairylux.git C:\src\fairylux
cd C:\src\fairylux
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

**Start XAMPP MySQL first.** Setup installs locked dependencies, creates a missing `.env`/app key/database, migrates and seeds the database, copies demo photos, links public storage and builds the admin frontend. Downloads and the first Android build require internet and can take several minutes.

The default local MySQL configuration is:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=fairylux_db
DB_USERNAME=root
DB_PASSWORD=
```

For different credentials/ports, copy `fairylux-admin/.env.example` to `fairylux-admin/.env` and edit it before setup. Existing `.env`, app keys, product edits and stock quantities are preserved on reruns. The database user needs CREATE permission, or an administrator can create `fairylux_db` beforehand.

For admin/API only (no Android tools required):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup.ps1 -SkipMobile
```

## 3. Run in three terminals

**Terminal 1**, from the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-backend.ps1
```

Open **http://127.0.0.1:8000**. Demo admin: **admin@fairylux.com / password**.

`composer run dev` now works on Windows without Pail/pcntl. Alternatively run `php artisan serve` and `npm.cmd run dev` in separate terminals inside `fairylux-admin`.

**Terminal 2**, from the repository root, for Metro:

```powershell
cd fairylux-mobile
npm.cmd start
```

**Terminal 3**, from the repository root, with an emulator running or an authorized USB phone connected:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-android.ps1
```

The helper forwards ports **8000** (API/images) and **8081** (Metro), then builds/installs for the connected device's CPU. With several devices, pass `-DeviceId SERIAL` using a serial from `adb devices`. Keep Laravel and Metro running. Rerun this helper after reconnecting/restarting the device.

The mobile API uses `http://127.0.0.1:8000/api` with USB/emulator port reversal. For Wi-Fi, run Laravel with `--host=0.0.0.0`, change `API_BASE_URL` in `fairylux-mobile/src/services/api.js` to the laptop's LAN IP, and allow port 8000 through the local firewall.

## 4. Firebase and customer login

Android `google-services.json`, the OAuth web client ID and the development debug keystore are included for the existing **fairylux** Firebase project. Keep the included debug key for the class demo; a different signing key needs its certificate fingerprints registered in Firebase. Auth and Firestore require internet, enabled providers and working rules in that Firebase project.

**Register a customer through the mobile app**, or use an existing Firebase login. SQL seed account `customer@fairylux.com / password` is a backend fixture, **not automatically a Firebase/mobile login**. The admin login above belongs to the web portal.

For backend **order-status notifications**, the project owner must privately provide a Firebase service-account JSON key for this project. Keep it outside Git, for example `fairylux-admin/storage/app/firebase-service-account.json`, and set these in the new laptop's `.env`:

```dotenv
FIREBASE_PROJECT_ID=fairylux
FIREBASE_SERVICE_ACCOUNT_PATH="C:/src/fairylux/fairylux-admin/storage/app/firebase-service-account.json"
```

Run `php artisan config:clear` in `fairylux-admin` afterward. Without this key, the admin/catalog/cart/checkout can run, but backend Firestore notification writes are skipped. **Never commit `.env`, private service-account keys or customer database dumps.** Cloning uses the existing cloud project; it does not copy Firestore into a new Firebase project.

The iOS folder is scaffolding. This handoff targets Windows/Android; iOS additionally needs macOS/Xcode and its own Firebase iOS configuration.

## 5. Verification and troubleshooting

```powershell
cd fairylux-admin
composer validate --no-check-publish
composer check-platform-reqs --lock
php artisan test
npm.cmd run build
cd ..\fairylux-mobile
npm.cmd test -- --runInBand --watch=false
```

Backend tests use isolated in-memory SQLite and do not reset development MySQL. Mobile tests mock native Firebase/Google boundaries and do not log into real accounts.

| Problem | Fix |
| --- | --- |
| MySQL connection refused/access denied | Start MySQL and check `DB_*` in `.env`, then rerun setup. |
| `npm.ps1 cannot be loaded` | Use `npm.cmd` or the documented process-only PowerShell commands. |
| Storage symlink permission denied | Enable Windows Developer Mode or run `php artisan storage:link` once in an elevated terminal. |
| SDK/NDK/CMake missing | Install exact packages above. `android/local.properties` is generated per laptop and ignored by Git. |
| Native build folder permission/path error | Native build files use a short `flx` folder on the checkout's drive. If necessary set `FAIRYLUX_NATIVE_BUILD_DIR` to another short, writable folder before building. |
| Device unauthorized | Unlock the phone and accept USB debugging. |
| API timeout/no products | Keep Laravel running and rerun `scripts/start-android.ps1` to restore forwarding. |
| Google login failure | Check Google Play Services, enabled Google provider and registered signing fingerprints/OAuth client. |
| Old environment values | Run `php artisan config:clear`, then restart Laravel. |

Demo photos live in `fairylux-admin/database/seeders/assets/products` and the seeder copies them into public storage. Live database records, new uploads, credentials, `vendor`, `node_modules`, local SDK paths, compiled bundles and caches are intentionally excluded. Existing customer/order records are not part of the demo seed.
