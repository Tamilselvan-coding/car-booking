<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminAuthService
{
    public function login(array $credentials): string
    {
        $user = $this->authenticate($credentials);

        return $user->createToken($credentials['device_name'] ?? 'admin-panel', ['*'])->plainTextToken;
    }

    public function authenticate(array $credentials): User
    {
        $user = User::query()->where('email', $credentials['email'])->first();

        // Check a real hash even for unknown emails to avoid a fast missing-user path.
        $hash = $user?->password ?? '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
        $validPassword = Hash::check($credentials['password'], $hash);
        abort_unless($user && $validPassword, 401, 'Invalid email or password.');
        abort_unless($user->is_admin, 403, 'Admin access is required.');

        return $user;
    }
}
