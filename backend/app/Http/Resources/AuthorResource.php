<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'email'       => $this->email,
            'birth_date'  => $this->birth_date?->format('Y-m-d'),
            'bio'         => $this->bio,
            'books_count' => $this->whenLoaded('books',
                                fn() => $this->books->count(),
                                fn() => $this->books()->count()
                             ),
            'books'       => BookResource::collection(
                                 $this->whenLoaded('books')
                             ),
            'created_at'  => $this->created_at?->toISOString(),
            'updated_at'  => $this->updated_at?->toISOString(),
        ];
    }
}
