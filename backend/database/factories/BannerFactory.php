<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BannerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => 'Special Offer',
            'banner_image' => 'banners/'.fake()->uuid().'.jpg',
            'actual_price' => 6500,
            'offer_price' => 5000,
            'from_date' => today()->subDay()->toDateString(),
            'to_date' => today()->addDay()->toDateString(),
            'is_active' => false,
            'created_by' => User::factory()->admin(),
        ];
    }
}
