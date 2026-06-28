<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $book = $this->route('book');
        $bookId = is_object($book) ? $book->id : $book;

        return [
            'author_id'      => ['required', 'integer', 'exists:authors,id'],
            'title'          => ['required', 'string', 'max:255'],
            'isbn'           => ['required', 'string', 'max:20', "unique:books,isbn,{$bookId}"],
            'published_year' => ['required', 'integer', 'min:1000', 'max:' . date('Y')],
            'description'    => ['nullable', 'string', 'max:2000'],
            'status'         => ['required', 'string', 'in:AVAILABLE,LOANED,RESERVED'],
            'cover_image'    => ['nullable', 'image', 'max:5120'],
        ];
    }
}
