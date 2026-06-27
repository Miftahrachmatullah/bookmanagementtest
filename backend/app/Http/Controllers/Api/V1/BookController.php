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

class BookController extends Controller
{
    /**
     * GET /api/v1/books
     * List books dengan pagination dan filter opsional by author_id.
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
     * POST /api/v1/books
     */
    public function store(StoreBookRequest $request): BookResource
    {
        $book = Book::create($request->validated());

        return new BookResource($book->load('author'));
    }

    /**
     * GET /api/v1/books/{book}
     */
    public function show(Book $book): BookResource
    {
        return new BookResource($book->load('author'));
    }

    /**
     * PUT /api/v1/books/{book}
     */
    public function update(UpdateBookRequest $request, Book $book): BookResource
    {
        $book->update($request->validated());

        return new BookResource($book->fresh()->load('author'));
    }

    /**
     * DELETE /api/v1/books/{book}
     */
    public function destroy(Book $book): JsonResponse
    {
        $book->delete();

        return response()->json(null, 204);
    }
}
