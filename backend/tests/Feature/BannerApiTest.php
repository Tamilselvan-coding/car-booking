<?php

namespace Tests\Feature;

use App\Models\Banner;
use App\Models\User;
use App\Services\BannerService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\TestCase;

class BannerApiTest extends TestCase
{
    use DatabaseMigrations;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->travelTo(now()->setDate(2026, 9, 15)->startOfDay()->addHours(12));
    }

    public function test_all_admin_banner_actions_require_authentication_and_admin_role(): void
    {
        $banner = Banner::factory()->create();
        $routes = [
            ['GET', '/api/admin/banners'],
            ['POST', '/api/admin/banners'],
            ['GET', "/api/admin/banners/{$banner->id}"],
            ['PUT', "/api/admin/banners/{$banner->id}"],
            ['DELETE', "/api/admin/banners/{$banner->id}"],
            ['PATCH', "/api/admin/banners/{$banner->id}/status"],
        ];

        foreach ($routes as [$method, $url]) {
            $this->json($method, $url)->assertUnauthorized()->assertJsonPath('status', false);
        }

        Sanctum::actingAs(User::factory()->create());

        foreach ($routes as [$method, $url]) {
            $this->json($method, $url)->assertForbidden()->assertJsonPath('status', false);
        }
    }

    public function test_authentication_errors_are_json_without_accept_header(): void
    {
        $this->get('/api/admin/banners')->assertUnauthorized()->assertJsonPath('status', false);
    }

    public function test_admin_can_create_list_and_view_a_banner(): void
    {
        $admin = $this->admin();
        $response = $this->postJson('/api/admin/banners', $this->payload())
            ->assertCreated()->assertJsonPath('status', true)
            ->assertJsonPath('data.created_by', $admin->id)
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.actual_price', 6500);

        $banner = Banner::query()->findOrFail($response->json('data.id'));
        Storage::disk('public')->assertExists($banner->banner_image);
        $this->assertSame('http://localhost:8000/storage/'.$banner->banner_image, $response->json('data.banner_image'));
        $this->assertNotEmpty($response->headers->get('Location'));
        $this->getJson('/api/admin/banners?per_page=1')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('meta.total', 1);
        $this->getJson('/api/admin/banners/'.$banner->id)->assertOk()
            ->assertJsonPath('data.title', 'Special Offer');
    }

    public function test_public_response_matches_the_frontend_contract(): void
    {
        $banner = Banner::factory()->create(['is_active' => true, 'from_date' => '2026-09-14', 'to_date' => '2026-09-30']);

        $this->getJson('/api/banners/active')->assertOk()->assertExactJson([
            'status' => true,
            'data' => [
                'id' => $banner->id,
                'title' => 'Special Offer',
                'banner_image' => 'http://localhost:8000/storage/'.$banner->banner_image,
                'actual_price' => 6500,
                'offer_price' => 5000,
                'from_date' => '2026-09-14',
                'to_date' => '2026-09-30',
                'is_active' => true,
            ],
        ])->assertHeader('Cache-Control', 'no-store, private');
    }

    #[DataProvider('unavailableBanners')]
    public function test_public_endpoint_excludes_unavailable_banners(array $attributes): void
    {
        Banner::factory()->create($attributes);
        $this->getJson('/api/banners/active')->assertOk()->assertExactJson(['status' => true, 'data' => null]);
    }

    public static function unavailableBanners(): array
    {
        return [
            'inactive' => [['is_active' => false]],
            'future' => [['is_active' => true, 'from_date' => '2026-09-16', 'to_date' => '2026-09-20']],
            'expired' => [['is_active' => true, 'from_date' => '2026-09-01', 'to_date' => '2026-09-14']],
        ];
    }

    public function test_dates_are_inclusive_in_the_application_timezone(): void
    {
        $banner = Banner::factory()->create(['is_active' => true, 'from_date' => '2026-09-15', 'to_date' => '2026-09-15']);

        foreach (['2026-09-15 00:00:00', '2026-09-15 23:59:59'] as $time) {
            $this->travelTo(new Carbon($time, 'Asia/Kolkata'));
            $this->getJson('/api/banners/active')->assertJsonPath('data.id', $banner->id);
        }

        $this->travelTo(new Carbon('2026-09-16 00:00:00', 'Asia/Kolkata'));
        $this->getJson('/api/banners/active')->assertJsonPath('data', null);
    }

    public function test_public_endpoint_returns_null_when_no_banners_exist(): void
    {
        $this->getJson('/api/banners/active')->assertOk()->assertExactJson(['status' => true, 'data' => null]);
    }

    #[DataProvider('activationMethods')]
    public function test_each_activation_path_deactivates_the_previous_banner(string $method): void
    {
        $this->admin();
        $previous = Banner::factory()->create(['is_active' => true]);

        if ($method === 'create') {
            $response = $this->postJson('/api/admin/banners', $this->payload(['is_active' => true]))->assertCreated();
        } else {
            $next = Banner::factory()->create();
            $url = '/api/admin/banners/'.$next->id.($method === 'status' ? '/status' : '');
            $response = $this->json($method === 'status' ? 'PATCH' : 'PUT', $url, ['is_active' => true])->assertOk();
        }

        $this->assertFalse($previous->fresh()->is_active);
        $this->assertSame(1, Banner::query()->where('is_active', true)->count());
        $this->getJson('/api/banners/active')->assertJsonPath('data.id', $response->json('data.id'));
    }

    public static function activationMethods(): array
    {
        return [['create'], ['update'], ['status']];
    }

    public function test_status_is_idempotent_and_can_disable_the_last_active_banner(): void
    {
        $this->admin();
        $banner = Banner::factory()->create(['is_active' => true]);
        $url = '/api/admin/banners/'.$banner->id.'/status';

        $this->patchJson($url, ['is_active' => true])->assertOk();
        $this->patchJson($url, ['is_active' => true])->assertOk();
        $this->patchJson($url, ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
        $this->getJson('/api/banners/active')->assertJsonPath('data', null);
    }

    public function test_database_rejects_two_active_rows_even_outside_the_service(): void
    {
        Banner::factory()->create(['is_active' => true]);
        Banner::factory()->count(3)->create();
        $this->expectException(QueryException::class);
        Banner::factory()->create(['is_active' => true]);
    }

    #[DataProvider('invalidValues')]
    public function test_create_rejects_invalid_values(array $changes, string $field): void
    {
        $this->admin();
        $this->postJson('/api/admin/banners', $this->payload($changes))
            ->assertUnprocessable()->assertJsonValidationErrors($field)->assertJsonPath('status', false);
        $this->assertDatabaseCount('banners', 0);
        $this->assertCount(0, Storage::disk('public')->allFiles('banners'));
    }

    public static function invalidValues(): array
    {
        return [
            'missing title' => [['title' => null], 'title'],
            'nonnumeric price' => [['actual_price' => 'free'], 'actual_price'],
            'negative price' => [['offer_price' => -1], 'offer_price'],
            'too expensive' => [['offer_price' => 6501], 'offer_price'],
            'excess precision' => [['offer_price' => '5000.001'], 'offer_price'],
            'overflow' => [['actual_price' => '10000000000'], 'actual_price'],
            'missing start date' => [['from_date' => null], 'from_date'],
            'missing end date' => [['to_date' => null], 'to_date'],
            'invalid date' => [['from_date' => '2026-02-30'], 'from_date'],
            'reversed dates' => [['to_date' => '2026-09-13'], 'to_date'],
            'invalid boolean' => [['is_active' => 'yes'], 'is_active'],
            'forged creator' => [['created_by' => 999], 'created_by'],
            'forged active slot' => [['active_slot' => 1], 'active_slot'],
            'missing image' => [['banner_image' => null], 'banner_image'],
        ];
    }

    public function test_images_must_be_supported_and_at_most_five_megabytes(): void
    {
        $this->admin();

        foreach ([UploadedFile::fake()->create('payload.php', 1, 'text/plain'), UploadedFile::fake()->image('large.jpg')->size(5121)] as $image) {
            $this->postJson('/api/admin/banners', $this->payload(['banner_image' => $image]))
                ->assertUnprocessable()->assertJsonValidationErrors('banner_image');
        }
    }

    public function test_partial_updates_validate_against_existing_prices_and_dates(): void
    {
        $this->admin();
        $banner = Banner::factory()->create();
        $url = '/api/admin/banners/'.$banner->id;
        $this->putJson($url, ['actual_price' => 4000])->assertUnprocessable()->assertJsonValidationErrors('offer_price');
        $this->putJson($url, ['offer_price' => 7000])->assertUnprocessable()->assertJsonValidationErrors('offer_price');
        $this->putJson($url, ['from_date' => '2026-10-01'])->assertUnprocessable()->assertJsonValidationErrors('to_date');
        $this->putJson($url, ['to_date' => '2026-09-01'])->assertUnprocessable()->assertJsonValidationErrors('to_date');
        $this->putJson($url, ['title' => 'Chennai', 'offer_price' => 4999.95])->assertOk()
            ->assertJsonPath('data.title', 'Chennai')->assertJsonPath('data.offer_price', 4999.95);
        $this->putJson($url, ['actual_price' => 0, 'offer_price' => 0])->assertOk();
    }

    public function test_multipart_method_override_replaces_image_and_preserves_creator(): void
    {
        $this->admin();
        $banner = Banner::factory()->create();
        Storage::disk('public')->put($banner->banner_image, 'old image');
        $oldPath = $banner->banner_image;

        $this->post('/api/admin/banners/'.$banner->id, [
            '_method' => 'PUT',
            'banner_image' => UploadedFile::fake()->image('replacement.png'),
            'is_active' => '1',
        ], ['Accept' => 'application/json'])->assertOk()
            ->assertJsonPath('data.created_by', $banner->created_by)->assertJsonPath('data.is_active', true);

        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($banner->fresh()->banner_image);
    }

    public function test_deleting_a_banner_removes_its_image_and_returns_json(): void
    {
        $this->admin();
        $banner = Banner::factory()->create(['is_active' => true]);
        Storage::disk('public')->put($banner->banner_image, 'image');
        $this->deleteJson('/api/admin/banners/'.$banner->id)->assertOk()->assertJsonPath('status', true);
        $this->assertDatabaseMissing('banners', ['id' => $banner->id]);
        Storage::disk('public')->assertMissing($banner->banner_image);
        $this->getJson('/api/banners/active')->assertJsonPath('data', null);
    }

    public function test_failed_create_restores_previous_active_banner_and_removes_new_upload(): void
    {
        $this->admin();
        $previous = Banner::factory()->create(['is_active' => true]);
        $event = 'eloquent.creating: '.Banner::class;
        Event::listen($event, fn () => throw new RuntimeException('Simulated database failure with private details'));

        try {
            $this->postJson('/api/admin/banners', $this->payload(['is_active' => true]))
                ->assertInternalServerError()->assertExactJson([
                    'status' => false,
                    'message' => 'An unexpected error occurred. Please try again.',
                ]);
        } finally {
            Event::forget($event);
        }

        $this->assertTrue($previous->fresh()->is_active);
        $this->assertDatabaseCount('banners', 1);
        $this->assertCount(0, Storage::disk('public')->allFiles('banners'));
    }

    public function test_failed_update_keeps_original_image_and_cleans_new_upload(): void
    {
        $this->admin();
        $banner = Banner::factory()->create();
        Storage::disk('public')->put($banner->banner_image, 'original');
        $event = 'eloquent.updating: '.Banner::class;
        Event::listen($event, fn () => throw new RuntimeException('Simulated update failure'));

        try {
            $this->putJson('/api/admin/banners/'.$banner->id, ['banner_image' => UploadedFile::fake()->image('new.jpg')])
                ->assertInternalServerError();
        } finally {
            Event::forget($event);
        }

        $this->assertSame($banner->banner_image, $banner->fresh()->banner_image);
        Storage::disk('public')->assertExists($banner->banner_image);
        $this->assertCount(1, Storage::disk('public')->allFiles('banners'));
    }

    public function test_service_revalidates_a_stale_banner_after_locking(): void
    {
        $banner = Banner::factory()->create();
        DB::table('banners')->where('id', $banner->id)->update(['actual_price' => 5500]);
        $this->expectException(ValidationException::class);
        app(BannerService::class)->update($banner, ['offer_price' => 6000]);
    }

    public function test_missing_banners_and_invalid_status_and_pagination_return_correct_errors(): void
    {
        $this->admin();
        $banner = Banner::factory()->create();
        $this->getJson('/api/admin/banners/999999')->assertNotFound()->assertJsonPath('status', false);
        $this->putJson('/api/admin/banners/999999', ['title' => 'missing'])->assertNotFound();
        $this->deleteJson('/api/admin/banners/999999')->assertNotFound();
        $this->patchJson('/api/admin/banners/'.$banner->id.'/status', [])->assertUnprocessable()->assertJsonValidationErrors('is_active');
        $this->getJson('/api/admin/banners?per_page=101')->assertUnprocessable();
    }

    private function admin(): User
    {
        $user = User::factory()->admin()->create();
        Sanctum::actingAs($user);

        return $user;
    }

    private function payload(array $changes = []): array
    {
        return array_replace([
            'title' => 'Special Offer',
            'banner_image' => UploadedFile::fake()->image('banner.jpg'),
            'actual_price' => '6500',
            'offer_price' => '5000',
            'from_date' => '2026-09-14',
            'to_date' => '2026-09-30',
        ], $changes);
    }
}
