<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListBannersRequest;
use App\Http\Requests\StoreBannerRequest;
use App\Http\Requests\UpdateBannerRequest;
use App\Http\Requests\UpdateBannerStatusRequest;
use App\Http\Resources\AdminBannerResource;
use App\Models\Banner;
use App\Services\BannerService;
use Illuminate\Http\JsonResponse;

class BannerController extends Controller
{
    public function __construct(private readonly BannerService $banners) {}

    public function index(ListBannersRequest $request): JsonResponse
    {
        $banners = $this->banners->paginate($request->validated());

        return response()->json([
            'status' => true,
            'data' => AdminBannerResource::collection($banners->items()),
            'summary' => $this->banners->summary(),
            'meta' => [
                'current_page' => $banners->currentPage(),
                'last_page' => $banners->lastPage(),
                'per_page' => $banners->perPage(),
                'total' => $banners->total(),
                'today' => today()->toDateString(),
            ],
        ]);
    }

    public function store(StoreBannerRequest $request): JsonResponse
    {
        $banner = $this->banners->create($request->validated(), $request->user());

        return response()->json([
            'status' => true,
            'message' => 'Banner created successfully.',
            'data' => new AdminBannerResource($banner),
        ], 201)->header('Location', route('admin.banners.show', $banner));
    }

    public function show(Banner $banner): JsonResponse
    {
        return response()->json(['status' => true, 'data' => new AdminBannerResource($banner)]);
    }

    public function update(UpdateBannerRequest $request, Banner $banner): JsonResponse
    {
        $updated = $this->banners->update($banner, $request->validated());

        return response()->json([
            'status' => true,
            'message' => 'Banner updated successfully.',
            'data' => new AdminBannerResource($updated),
        ]);
    }

    public function destroy(Banner $banner): JsonResponse
    {
        $this->banners->delete($banner);

        return response()->json(['status' => true, 'message' => 'Banner deleted successfully.']);
    }

    public function status(UpdateBannerStatusRequest $request, Banner $banner): JsonResponse
    {
        $updated = $this->banners->setStatus($banner, $request->boolean('is_active'));

        return response()->json([
            'status' => true,
            'message' => 'Banner status updated successfully.',
            'data' => new AdminBannerResource($updated),
        ]);
    }
}
