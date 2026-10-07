<?php

namespace App\Http\Controllers;

use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;

class ActiveBannerController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $banner = Banner::query()->currentlyActive()->first();

        return response()->json([
            'status' => true,
            'data' => $banner ? new BannerResource($banner) : null,
        ])->header('Cache-Control', 'no-store');
    }
}
