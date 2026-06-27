<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAuthorRequest;
use App\Http\Requests\UpdateAuthorRequest;
use App\Http\Resources\AuthorResource;
use App\Models\Author;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class AuthorController extends Controller
{
    /**
     * GET /api/v1/authors
     * List authors dengan pagination, search opsional, dan caching.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $page    = $request->integer('page', 1);
        $perPage = min($request->integer('per_page', 10), 50);
        $search  = $request->string('search')->trim()->value();

        $cacheKey = "authors:page:{$page}:per:{$perPage}:search:{$search}";

        $authors = Cache::remember($cacheKey, 60, function () use ($perPage, $search) {
            return Author::query()
                ->when($search, fn($q) =>
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                )
                ->withCount('books')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        });

        return AuthorResource::collection($authors);
    }

    /**
     * POST /api/v1/authors
     */
    public function store(StoreAuthorRequest $request): AuthorResource
    {
        $author = Author::create($request->validated());
        Cache::flush();

        return new AuthorResource($author->loadCount('books'));
    }

    /**
     * GET /api/v1/authors/{author}
     */
    public function show(Author $author): AuthorResource
    {
        return new AuthorResource($author->load('books'));
    }

    /**
     * PUT /api/v1/authors/{author}
     */
    public function update(UpdateAuthorRequest $request, Author $author): AuthorResource
    {
        $author->update($request->validated());
        Cache::flush();

        return new AuthorResource($author->fresh()->loadCount('books'));
    }

    /**
     * DELETE /api/v1/authors/{author}
     * Cascade delete books via foreign key ON DELETE CASCADE.
     */
    public function destroy(Author $author): JsonResponse
    {
        $author->delete();
        Cache::flush();

        return response()->json(null, 204);
    }
}
