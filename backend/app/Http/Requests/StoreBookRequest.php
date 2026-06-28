<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'author_id'      => ['required', 'integer', 'exists:authors,id'],
            'title'          => ['required', 'string', 'max:255'],
            'isbn'           => ['required', 'string', 'max:20', 'unique:books,isbn'],
            'published_year' => ['required', 'integer', 'min:1000', 'max:' . date('Y')],
            'description'    => ['nullable', 'string', 'max:2000'],
            'status'         => ['required', 'string', 'in:AVAILABLE,LOANED,RESERVED'],
            'cover_image'    => ['nullable', 'image', 'max:5120'],
        ];
    }
}
