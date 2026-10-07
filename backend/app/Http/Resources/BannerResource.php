<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class BannerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'banner_image' => url(Storage::disk('public')->url($this->banner_image)),
            'actual_price' => (float) $this->actual_price,
            'offer_price' => (float) $this->offer_price,
            'from_date' => $this->from_date->toDateString(),
            'to_date' => $this->to_date->toDateString(),
            'is_active' => $this->is_active,
        ];
    }
}
