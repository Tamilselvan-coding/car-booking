<?php

use App\Models\Banner;
use App\Services\BannerService;
use Illuminate\Contracts\Console\Kernel;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
config([
    'database.default' => 'mysql',
    'database.connections.mysql' => json_decode(getenv('BANNER_TEST_DATABASE_CONFIG'), true, flags: JSON_THROW_ON_ERROR),
]);

while (microtime(true) < (float) $argv[2]) {
    usleep(10000);
}

for ($iteration = 0; $iteration < 10; $iteration++) {
    app(BannerService::class)->setStatus(Banner::query()->findOrFail($argv[1]), true);
}
