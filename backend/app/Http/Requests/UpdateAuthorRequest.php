<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAuthorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $authorId = $this->route('author');

        return [
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255',
                             "unique:authors,email,{$authorId}"],
            'birth_date' => ['required', 'date', 'before_or_equal:today'],
            'bio'        => ['nullable', 'string', 'max:1000'],
        ];
    }
}
