<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAuthorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => ['required', 'string', 'max:255'],
            'email'         => ['required', 'email', 'unique:authors,email', 'max:255'],
            'birth_date'    => ['required', 'date', 'before_or_equal:today'],
            'bio'           => ['nullable', 'string', 'max:1000'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
