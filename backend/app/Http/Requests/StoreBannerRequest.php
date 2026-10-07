<?php

namespace App\Http\Requests;

use App\Support\BannerValues;
use Illuminate\Foundation\Http\FormRequest;

class StoreBannerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'banner_image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            ...BannerValues::rules(),
            'is_active' => ['sometimes', 'required', 'boolean'],
            'created_by' => ['prohibited'],
            'active_slot' => ['prohibited'],
        ];
    }
}
