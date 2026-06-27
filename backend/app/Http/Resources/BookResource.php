<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'author_id'      => $this->author_id,
            'author'         => new AuthorResource(
                                    $this->whenLoaded('author')
                                ),
            'title'          => $this->title,
            'isbn'           => $this->isbn,
            'published_year' => $this->published_year,
            'description'    => $this->description,
            'created_at'     => $this->created_at?->toISOString(),
            'updated_at'     => $this->updated_at?->toISOString(),
        ];
    }
}
