<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create();

        // Buat 10 Author
        for ($i = 1; $i <= 10; $i++) {
            $author = Author::create([
                'name'       => $faker->name(),
                'email'      => $faker->unique()->safeEmail(),
                'birth_date' => $faker->date('Y-m-d', '2000-01-01'),
                'bio'        => $faker->sentence(15),
            ]);

            // Buat 1-3 Book per Author
            $bookCount = rand(1, 3);
            for ($j = 1; $j <= $bookCount; $j++) {
                Book::create([
                    'author_id'      => $author->id,
                    'title'          => ucwords($faker->words(rand(2, 5), true)),
                    'isbn'           => $faker->unique()->isbn13(),
                    'published_year' => $faker->numberBetween(2010, date('Y')),
                    'description'    => $faker->paragraph(),
                ]);
            }
        }
    }
}
