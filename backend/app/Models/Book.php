<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    protected $fillable = [
        'author_id',
        'title',
        'isbn',
        'published_year',
        'description',
    ];

    protected $casts = [
        'published_year' => 'integer',
        'author_id'      => 'integer',
    ];

    /**
     * Relasi: setiap book milik satu author.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }
}
