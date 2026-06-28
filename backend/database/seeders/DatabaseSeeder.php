<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run(): void
    {
        // Define builder macro to support Model::factory() dynamically without modifying the Model classes.
        \Illuminate\Database\Eloquent\Builder::macro('factory', function ($count = null, $state = []) {
            $model = get_class($this->getModel());
            $factory = \Illuminate\Database\Eloquent\Factories\Factory::factoryForModel($model);
            return $factory
                ->count(is_numeric($count) ? $count : null)
                ->state(is_callable($count) || is_array($count) ? $count : $state);
        });

        // Seed exactly 20 authors, and assign 1 to 3 random books to each author
        Author::factory(20)
            ->create()
            ->each(function ($author) {
                Book::factory(rand(1, 3))->create([
                    'author_id' => $author->id
                ]);
            });

        // Ensure we have at least exactly 40 books total
        $currentCount = Book::count();
        if ($currentCount < 40) {
            $needed = 40 - $currentCount;
            Book::factory($needed)->create([
                'author_id' => function () {
                    return Author::inRandomOrder()->first()->id;
                }
            ]);
        }
    }
}
