# FairyLux - Bridal & Evening Gown Boutique Platform

FairyLux is an end-to-end couture boutique platform consisting of:
1. **`fairylux-admin`**: Laravel 12 + Inertia.js + React admin portal & REST API backend.
2. **`fairylux-mobile`**: React Native mobile application for customers (Firebase Authentication & Firestore notifications).

---

## 📋 System Prerequisites on the New Laptop

Before running the project on another laptop, make sure the following are installed:
- **Git**
- **Node.js** (v20+ recommended, React Native engine requires >= 22.11.0) & **npm**
- **PHP** (v8.2+) with extensions: `pdo_mysql`, `curl`, `mbstring`, `openssl`, `bcmath`, `fileinfo`
- **Composer** (PHP dependency manager)
- **XAMPP / MySQL Server**
- **Android Studio** (with Android SDK Platform 34/35, Build-Tools, and Emulator)
- **Java Development Kit (JDK 17)**

---

## 🚀 Setup & Run Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/fababairlawrence73-art/fairylux.git
cd fairylux
```

---

### 2. Backend / Admin Setup (`fairylux-admin`)

1. **Navigate to admin directory:**
   ```bash
   cd fairylux-admin
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies:**
   ```bash
   npm install
   ```

4. **Setup Environment Configuration:**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Create & Setup MySQL Database:**
   - Open XAMPP Control Panel and start **Apache** and **MySQL**.
   - Open phpMyAdmin (`http://localhost/phpmyadmin`) or MySQL CLI and create a database named:
     ```sql
     CREATE DATABASE fairylux_db;
     ```
   - Ensure `.env` matches your MySQL credentials:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=fairylux_db
     DB_USERNAME=root
     DB_PASSWORD=
     ```

6. **Run Migrations & Seeders:**
   ```bash
   php artisan migrate --seed
   ```
   *Default Admin credentials:*
   - **Email:** `admin@fairylux.com`
   - **Password:** `password`

   *Default Customer credentials:*
   - **Email:** `customer@fairylux.com`
   - **Password:** `password`

7. **Create Storage Symbolic Link:**
   ```bash
   php artisan storage:link
   ```

8. **Start Backend Servers:**
   - Option A: Run concurrently:
     ```bash
     composer run dev
     ```
   - Option B: Run in separate terminals:
     - Terminal 1 (Laravel server):
       ```bash
       php artisan serve
       ```
     - Terminal 2 (Vite for React frontend):
       ```bash
       npm run dev
       ```

   Access admin panel at: `http://127.0.0.1:8000`

---

### 3. Mobile App Setup (`fairylux-mobile`)

1. **Navigate to mobile directory:**
   ```bash
   cd ../fairylux-mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Firebase Configuration:**
   - `google-services.json` is already included in `android/app/google-services.json`.

4. **Connect Device / Emulator & Port Forwarding:**
   - Launch your Android Emulator in Android Studio or connect an Android device with USB debugging enabled.
   - Run port reverse so the mobile app can reach the local Laravel backend (`http://127.0.0.1:8000`):
     ```bash
     adb reverse tcp:8000 tcp:8000
     ```

5. **Start Metro Bundler:**
   ```bash
   npm start
   ```

6. **Build & Run on Android:**
   (In another terminal inside `fairylux-mobile`)
   ```bash
   npm run android
   ```

---

## 📌 Checklist for Another Laptop

- [ ] XAMPP MySQL is running and `fairylux_db` database is created.
- [ ] `fairylux-admin/.env` created from `.env.example` with `APP_KEY` generated.
- [ ] Database migrated & seeded (`php artisan migrate --seed`).
- [ ] Symlink created (`php artisan storage:link`).
- [ ] `fairylux-mobile` dependencies installed via `npm install`.
- [ ] `adb reverse tcp:8000 tcp:8000` executed while device/emulator is connected.
