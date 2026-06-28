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
use Illuminate\Support\Facades\Storage;

/**
 * Class AuthorController
 *
 * Handles API actions related to authors.
 *
 * @package App\Http\Controllers\Api\V1
 */
class AuthorController extends Controller
{
    /**
     * Display a listing of the authors.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min($request->integer('per_page', 10), 50);
        $search  = $request->string('search')->trim()->value();

        $authors = Author::query()
            ->when($search, fn($q) =>
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
            )
            ->withCount('books')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return AuthorResource::collection($authors);
    }

    /**
     * Store a newly created author in storage.
     *
     * @param  \App\Http\Requests\StoreAuthorRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreAuthorRequest $request): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('profile_photo')) {
            $path = $request->file('profile_photo')->store('authors', 'public');
            $data['profile_photo_path'] = $path;
        }

        $author = Author::create($data);

        return (new AuthorResource($author->loadCount('books')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified author.
     *
     * @param  \App\Models\Author  $author
     * @return \App\Http\Resources\AuthorResource
     */
    public function show(Author $author): AuthorResource
    {
        return new AuthorResource($author->load('books'));
    }

    /**
     * Update the specified author in storage.
     *
     * @param  \App\Http\Requests\UpdateAuthorRequest  $request
     * @param  \App\Models\Author  $author
     * @return \App\Http\Resources\AuthorResource
     */
    public function update(UpdateAuthorRequest $request, Author $author): AuthorResource
    {
        $data = $request->validated();

        if ($request->has('profile_photo_remove') && $request->input('profile_photo_remove') == '1') {
            if ($author->profile_photo_path) {
                Storage::disk('public')->delete($author->profile_photo_path);
            }
            $data['profile_photo_path'] = null;
        }

        if ($request->hasFile('profile_photo')) {
            if ($author->profile_photo_path) {
                Storage::disk('public')->delete($author->profile_photo_path);
            }
            $path = $request->file('profile_photo')->store('authors', 'public');
            $data['profile_photo_path'] = $path;
        }

        $author->update($data);

        return new AuthorResource($author->fresh()->loadCount('books'));
    }

    /**
     * Remove the specified author from storage.
     *
     * @param  \App\Models\Author  $author
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Author $author): JsonResponse
    {
        $author->delete();

        return response()->json(null, 204);
    }
}
