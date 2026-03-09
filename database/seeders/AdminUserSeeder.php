<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@mercedes-support.com'],
            [
                'name'     => 'Admin Mercedes',
                'password' => Hash::make('Mercedes@2026!'),
                'role'     => 'administrator',
            ]
        );
    }
}
