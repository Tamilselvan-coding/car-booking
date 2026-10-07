<?php

namespace App\Support;

use App\Models\Banner;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Validator as ValidatorInstance;

class BannerValues
{
    public static function rules(): array
    {
        return [
            'actual_price' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999.99'],
            'offer_price' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999.99', 'lte:actual_price'],
            'from_date' => ['required', 'date_format:Y-m-d'],
            'to_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:from_date'],
        ];
    }

    public static function validator(array $changes, ?Banner $banner = null): ValidatorInstance
    {
        $existing = $banner ? [
            'actual_price' => $banner->actual_price,
            'offer_price' => $banner->offer_price,
            'from_date' => $banner->from_date->toDateString(),
            'to_date' => $banner->to_date->toDateString(),
        ] : [];

        return Validator::make(array_replace($existing, $changes), self::rules());
    }
}
