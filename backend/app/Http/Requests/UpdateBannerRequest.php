<?php

namespace App\Http\Requests;

use App\Support\BannerValues;
use Illuminate\Validation\Validator;

class UpdateBannerRequest extends StoreBannerRequest
{
    public function rules(): array
    {
        $rules = parent::rules();

        foreach (['title', 'banner_image', 'actual_price', 'offer_price', 'from_date', 'to_date'] as $field) {
            array_unshift($rules[$field], 'sometimes');
        }

        // Compare against the stored counterpart when only one field changes.
        $rules['offer_price'] = array_diff($rules['offer_price'], ['lte:actual_price']);
        $rules['to_date'] = array_diff($rules['to_date'], ['after_or_equal:from_date']);

        return $rules;
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $values = BannerValues::validator($this->only(array_keys(BannerValues::rules())), $this->route('banner'));

            foreach ($values->errors()->messages() as $field => $messages) {
                foreach ($messages as $message) {
                    $validator->errors()->add($field, $message);
                }
            }
        }];
    }
}
