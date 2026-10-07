<?php

namespace Tests\Feature;

use App\Models\Banner;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class MySqlBannerConcurrencyTest extends TestCase
{
    use DatabaseMigrations;

    public function test_competing_activations_succeed_and_leave_one_active_banner(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            $this->markTestSkipped('Run against a dedicated MySQL test database to exercise InnoDB row locks.');
        }

        $banners = Banner::factory()->count(2)->create();
        $startAt = microtime(true) + 2;
        $workers = [];

        foreach ($banners as $banner) {
            $worker = new Process([
                PHP_BINARY,
                base_path('tests/Support/activate-banner.php'),
                (string) $banner->id,
                (string) $startAt,
            ], base_path(), [
                'APP_ENV' => 'testing',
                'BANNER_TEST_DATABASE_CONFIG' => json_encode(config('database.connections.mysql'), JSON_THROW_ON_ERROR),
            ]);
            $worker->setTimeout(30);
            $worker->start();
            $workers[] = $worker;
        }

        try {
            foreach ($workers as $worker) {
                $worker->wait();
                $this->assertSame(0, $worker->getExitCode(), $worker->getErrorOutput().$worker->getOutput());
            }
        } finally {
            foreach ($workers as $worker) {
                if ($worker->isRunning()) {
                    $worker->stop();
                }
            }
        }

        $this->assertSame(1, Banner::query()->where('is_active', true)->count());
    }
}
