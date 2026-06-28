<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

/**
 * Class BookController
 *
 * Handles API actions related to books.
 *
 * @package App\Http\Controllers\Api\V1
 */
class BookController extends Controller
{
    /**
     * Display a listing of the books.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage  = min($request->integer('per_page', 10), 50);
        $search   = $request->string('search')->trim()->value();
        $authorId = $request->integer('author_id') ?: null;

        $books = Book::query()
            ->with('author')
            ->when($search, fn($q) =>
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('isbn', 'like', "%{$search}%")
            )
            ->when($authorId, fn($q) => $q->where('author_id', $authorId))
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return BookResource::collection($books);
    }

    /**
     * Store a newly created book in storage.
     *
     * @param  \App\Http\Requests\StoreBookRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreBookRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('cover_image')) {
            $path = $request->file('cover_image')->store('books', 'public');
            $data['cover_image_path'] = $path;
        }

        $book = Book::create($data);

        return (new BookResource($book->load('author')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified book.
     *
     * @param  \App\Models\Book  $book
     * @return \App\Http\Resources\BookResource
     */
    public function show(Book $book): BookResource
    {
        return new BookResource($book->load('author'));
    }

    /**
     * Update the specified book in storage.
     *
     * @param  \App\Http\Requests\UpdateBookRequest  $request
     * @param  \App\Models\Book  $book
     * @return \App\Http\Resources\BookResource
     */
    public function update(UpdateBookRequest $request, Book $book): BookResource
    {
        $data = $request->validated();

        if ($request->has('cover_image_remove') && $request->input('cover_image_remove') == '1') {
            if ($book->cover_image_path) {
                Storage::disk('public')->delete($book->cover_image_path);
            }
            $data['cover_image_path'] = null;
        }

        if ($request->hasFile('cover_image')) {
            if ($book->cover_image_path) {
                Storage::disk('public')->delete($book->cover_image_path);
            }
            $path = $request->file('cover_image')->store('books', 'public');
            $data['cover_image_path'] = $path;
        }

        $book->update($data);

        return new BookResource($book->fresh()->load('author'));
    }

    /**
     * Remove the specified book from storage.
     *
     * @param  \App\Models\Book  $book
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Book $book): JsonResponse
    {
        $book->delete();

        return response()->json(null, 204);
    }
}
