<?php

namespace App\Services;

use App\Models\Banner;
use App\Models\User;
use App\Support\BannerValues;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class BannerService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return Banner::query()
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->whereLike('title', '%'.$search.'%'))
            ->when(($filters['status'] ?? 'all') !== 'all', fn ($query) => $query->where('is_active', $filters['status'] === 'active'))
            ->latest('id')->paginate($filters['per_page'] ?? 15);
    }

    public function summary(): array
    {
        return [
            'total' => Banner::query()->count(),
            'active' => Banner::query()->where('is_active', true)->count(),
            'live' => Banner::query()->currentlyActive()->count(),
            'scheduled' => Banner::query()->where('is_active', true)->where('from_date', '>', today()->toDateString())->count(),
            'inactive' => Banner::query()->where('is_active', false)->count(),
        ];
    }

    public function create(array $data, User $admin): Banner
    {
        $imagePath = $this->storeImage($data['banner_image']);

        try {
            return DB::transaction(function () use ($data, $admin, $imagePath): Banner {
                $this->lockWrites();
                BannerValues::validator($data)->validate();

                if ((bool) ($data['is_active'] ?? false)) {
                    $this->deactivateOthers();
                }

                return Banner::query()->create([
                    ...Arr::except($data, ['banner_image', 'created_by', 'active_slot']),
                    'banner_image' => $imagePath,
                    'created_by' => $admin->id,
                ])->refresh();
            }, attempts: 3);
        } catch (Throwable $exception) {
            $this->deleteImage($imagePath);

            throw $exception;
        }
    }

    public function update(Banner $banner, array $data): Banner
    {
        $newImage = isset($data['banner_image']) ? $this->storeImage($data['banner_image']) : null;

        try {
            return DB::transaction(function () use ($banner, $data, $newImage): Banner {
                $this->lockWrites();
                $current = Banner::query()->lockForUpdate()->findOrFail($banner->id);

                // Recheck merged values after locking: another request may have
                // changed a counterpart since Form Request validation ran.
                BannerValues::validator($data, $current)->validate();

                if ((bool) ($data['is_active'] ?? false)) {
                    $this->deactivateOthers($current->id);
                }

                $oldImage = $current->banner_image;
                $current->fill(Arr::except($data, ['banner_image', 'created_by', 'active_slot']));

                if ($newImage !== null) {
                    $current->banner_image = $newImage;
                }

                $current->save();

                if ($newImage !== null) {
                    DB::afterCommit(fn () => $this->deleteImage($oldImage));
                }

                return $current->refresh();
            }, attempts: 3);
        } catch (Throwable $exception) {
            if ($newImage !== null) {
                $this->deleteImage($newImage);
            }

            throw $exception;
        }
    }

    public function setStatus(Banner $banner, bool $active): Banner
    {
        return $this->update($banner, ['is_active' => $active]);
    }

    public function delete(Banner $banner): void
    {
        DB::transaction(function () use ($banner): void {
            $this->lockWrites();
            $current = Banner::query()->lockForUpdate()->findOrFail($banner->id);
            $imagePath = $current->banner_image;
            $current->delete();
            DB::afterCommit(fn () => $this->deleteImage($imagePath));
        }, attempts: 3);
    }

    private function lockWrites(): void
    {
        $lock = DB::table('banner_activation_locks')->where('id', 1)->lockForUpdate()->first();

        if ($lock === null) {
            throw new RuntimeException('The banner activation lock is missing. Run the database migrations.');
        }
    }

    private function deactivateOthers(?int $exceptId = null): void
    {
        Banner::query()->where('is_active', true)
            ->when($exceptId !== null, fn ($query) => $query->whereKeyNot($exceptId))
            ->update(['is_active' => false]);
    }

    private function storeImage(UploadedFile $image): string
    {
        $path = $image->store('banners', 'public');

        if ($path === false) {
            throw new RuntimeException('The banner image could not be stored.');
        }

        return $path;
    }

    private function deleteImage(string $path): void
    {
        try {
            if (! Storage::disk('public')->delete($path)) {
                throw new RuntimeException('Could not remove banner image: '.$path);
            }
        } catch (Throwable $exception) {
            // Filesystems cannot participate in SQL transactions. Report a
            // cleanup failure without undoing or misreporting a committed save.
            report($exception);
        }
    }
}
