<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AdminBannerResource extends BannerResource
{
    public function toArray(Request $request): array
    {
        return [
            ...parent::toArray($request),
            'created_by' => $this->created_by,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
