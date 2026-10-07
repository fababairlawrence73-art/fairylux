<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

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
