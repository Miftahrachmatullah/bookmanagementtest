<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Author;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Book::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'isbn' => $this->faker->unique()->numerify('#############'),
            'published_year' => $this->faker->numberBetween(1990, (int) date('Y')),
            'description' => $this->faker->paragraph(),
            'status' => 'AVAILABLE',
            'cover_image_path' => null,
            'author_id' => Author::inRandomOrder()->first()?->id ?? AuthorFactory::new(),
        ];
    }
}
