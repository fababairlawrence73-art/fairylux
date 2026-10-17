<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

Artisan::command('fairylux:database', function () {
    if (! app()->environment('local', 'testing')) {
        $this->error('This setup command is only available in local/testing environments.');
        return 1;
    }

    $connection = config('database.default');
    $settings = config("database.connections.{$connection}");
    $database = $settings['database'] ?? '';

    if ($connection === 'sqlite') {
        if ($database !== ':memory:' && ! File::exists($database)) {
            File::ensureDirectoryExists(dirname($database));
            File::put($database, '');
        }
    } elseif ($connection === 'mysql') {
        if (! preg_match('/^[a-zA-Z0-9_]+$/', $database)) {
            $this->error('DB_DATABASE must contain only letters, numbers and underscores.');
            return 1;
        }
        try {
            DB::connection()->getPdo();
            $this->info("Database [{$database}] is ready. Existing data has been preserved.");
            return 0;
        } catch (\PDOException $exception) {
            if ((int) ($exception->errorInfo[1] ?? 0) !== 1049) {
                throw $exception;
            }
        }
        // Connect to the server without selecting a database first.
        $settings['database'] = null;
        $settings['url'] = null;
        config(['database.connections.fairylux_setup' => $settings]);
        try {
            DB::connection('fairylux_setup')->statement(
                "CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            );
        } finally {
            DB::purge('fairylux_setup');
        }
    } else {
        $this->error('Local setup supports MySQL/MariaDB or SQLite. Check DB_CONNECTION in .env.');
        return 1;
    }

    $this->info("Database [{$database}] is ready. Existing data has been preserved.");
    return 0;
})->purpose('Create the local FairyLux database if it does not exist');

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('admin:reset {email=admin@fairylux.com} {password=password}', function (string $email, string $password) {
    $role = \App\Models\Role::firstOrCreate(['slug' => 'admin'], [
        'name' => 'Administrator',
        'description' => 'Full access to FairyLux boutique admin portal',
    ]);

    $user = \App\Models\User::firstOrNew(['email' => $email]);
    $user->name = $user->name ?: 'FairyLux Admin';
    $user->role_id = $role->id;
    $user->password = \Illuminate\Support\Facades\Hash::make($password);
    $user->is_active = true;
    $user->email_verified_at = now();
    $user->save();

    \Illuminate\Support\Facades\Cache::flush();

    $this->info("Admin account [{$email}] successfully updated with password [{$password}]. Rate limit cache cleared.");
})->purpose('Reset or create an admin account password and clear rate limit cache');
