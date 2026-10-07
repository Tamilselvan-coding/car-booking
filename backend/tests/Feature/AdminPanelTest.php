<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use DatabaseMigrations;

    public function test_guests_are_sent_to_sign_in_and_can_view_the_login_page(): void
    {
        $this->get('/')->assertRedirect('/admin');
        $this->get('/admin')->assertRedirect('/admin/login');
        $this->get('/admin/login')->assertOk()->assertSee('Welcome back.')->assertSee('name="_token"', false);
    }

    public function test_admin_can_sign_in_without_issuing_a_bearer_token_and_sign_out(): void
    {
        $admin = User::factory()->admin()->create();
        $this->post('/admin/login', ['email' => $admin->email, 'password' => 'test-password-123'])
            ->assertRedirect('/admin');
        $this->assertAuthenticatedAs($admin, 'web');
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->get('/admin')->assertOk()->assertSee('Offer banners')->assertSee('Create banner');
        $this->withHeader('Referer', 'http://localhost:8000/admin')->getJson('/api/admin/banners')->assertOk();
        $this->post('/admin/logout')->assertRedirect('/admin/login');
        $this->assertGuest('web');
    }

    public function test_bad_passwords_and_customers_cannot_sign_in_to_the_panel(): void
    {
        $customer = User::factory()->create();
        $this->from('/admin/login')->post('/admin/login', ['email' => $customer->email, 'password' => 'wrong'])
            ->assertRedirect('/admin/login')->assertSessionHasErrors('email');
        $this->from('/admin/login')->post('/admin/login', ['email' => $customer->email, 'password' => 'test-password-123'])
            ->assertRedirect('/admin/login')->assertSessionHasErrors('email');
        $this->assertGuest('web');
        $this->actingAs($customer, 'web')->get('/admin')->assertForbidden();
    }

    public function test_session_users_can_logout_through_the_api_without_a_token_error(): void
    {
        $this->actingAs(User::factory()->admin()->create(), 'web')
            ->withHeader('Referer', 'http://localhost:8000/admin')
            ->postJson('/api/admin/logout')->assertOk();
        $this->assertGuest('web');
    }

    public function test_banner_search_and_status_filters_have_global_summary_counts(): void
    {
        $this->actingAs(User::factory()->admin()->create(), 'web');
        Banner::factory()->create(['title' => 'Chennai to Madurai', 'is_active' => true]);
        Banner::factory()->create(['title' => 'Coimbatore getaway', 'is_active' => false]);
        $this->getJson('/api/admin/banners?search=Madurai&status=active')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('meta.total', 1)
            ->assertJsonPath('summary.total', 2)->assertJsonPath('summary.live', 1)
            ->assertJsonPath('summary.inactive', 1);
        $this->getJson('/api/admin/banners?status=inactive')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Coimbatore getaway');
    }

    public function test_offer_preview_only_shows_a_currently_live_banner_and_escapes_titles(): void
    {
        $this->get('/offers/preview')->assertOk()->assertSee('No offer is live right now.');
        Banner::factory()->create(['title' => '<script>alert(1)</script>', 'is_active' => true]);
        $this->get('/offers/preview')->assertOk()->assertSee('&lt;script&gt;alert(1)&lt;/script&gt;', false)
            ->assertDontSee('<script>alert(1)</script>', false);
    }
}
