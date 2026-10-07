<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminAuthTest extends TestCase
{
    use DatabaseMigrations;

    public function test_admin_can_login_use_a_real_bearer_token_and_revoke_it(): void
    {
        $admin = User::factory()->admin()->create(['email' => 'admin@example.com']);
        $login = $this->postJson('/api/admin/login', [
            'email' => 'ADMIN@example.com',
            'password' => 'test-password-123',
        ])->assertOk()->assertJsonPath('data.token_type', 'Bearer');
        $token = $login->json('data.token');
        $this->assertNotEmpty($token);
        $this->assertNotSame($token, $admin->tokens()->first()->token);

        $this->withToken($token)->getJson('/api/admin/banners')->assertOk();
        $this->withToken($token)->postJson('/api/admin/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/admin/banners')->assertUnauthorized();
    }

    public function test_bad_credentials_and_non_admin_login_cannot_issue_tokens(): void
    {
        User::factory()->create(['email' => 'customer@example.com']);
        $this->postJson('/api/admin/login', ['email' => 'customer@example.com', 'password' => 'wrong'])
            ->assertUnauthorized()->assertJsonPath('status', false);
        $this->postJson('/api/admin/login', ['email' => 'missing@example.com', 'password' => 'wrong'])
            ->assertUnauthorized();
        $this->postJson('/api/admin/login', ['email' => 'customer@example.com', 'password' => 'test-password-123'])
            ->assertForbidden();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_login_validation_and_throttling(): void
    {
        $this->postJson('/api/admin/login', [])->assertUnprocessable()->assertJsonValidationErrors(['email', 'password']);
        $this->postJson('/api/admin/login', ['email' => ['invalid'], 'password' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/admin/login', ['email' => 'rate@example.com', 'password' => 'wrong'])->assertUnauthorized();
        }

        $this->postJson('/api/admin/login', ['email' => 'rate@example.com', 'password' => 'wrong'])
            ->assertStatus(429)->assertJsonPath('status', false)->assertHeader('Retry-After');
    }

    public function test_expired_and_demoted_admin_tokens_are_rejected(): void
    {
        $admin = User::factory()->admin()->create();
        $expired = $admin->createToken('expired', ['*'], now()->subMinute())->plainTextToken;
        $this->withToken($expired)->getJson('/api/admin/banners')->assertUnauthorized();
        $token = $admin->createToken('valid')->plainTextToken;
        $admin->is_admin = false;
        $admin->save();
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/admin/banners')->assertForbidden();
    }

    public function test_admin_command_creates_a_user_without_a_default_password(): void
    {
        $this->artisan('admin:create', ['email' => 'admin@example.com', '--name' => 'Banner Admin'])
            ->expectsQuestion('Password (at least 12 characters)', 'a-long-test-password')
            ->expectsQuestion('Confirm password', 'a-long-test-password')
            ->assertSuccessful();
        $admin = User::query()->where('email', 'admin@example.com')->firstOrFail();
        $this->assertTrue($admin->is_admin);
        $this->assertTrue(Hash::check('a-long-test-password', $admin->password));
    }

    public function test_browser_public_api_cors_preflight(): void
    {
        $this->options('/api/banners/active', [], [
            'Origin' => 'http://localhost:3000',
            'Access-Control-Request-Method' => 'GET',
        ])->assertSuccessful()->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    }
}
