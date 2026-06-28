<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Author extends Model
{
    protected $fillable = [
        'name',
        'email',
        'birth_date',
        'bio',
        'profile_photo_path',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    /**
     * Relasi: satu author memiliki banyak books.
     */
    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }

    /**
     * Hitung total buku milik author ini.
     */
    public function getBooksCountAttribute(): int
    {
        return $this->books()->count();
    }
}
