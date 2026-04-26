<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\ImageService;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    protected $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    public function index()
    {
        return response()->json(Banner::where('is_active', true)->orderBy('order')->get());
    }

    public function adminIndex()
    {
        return response()->json(Banner::orderBy('order')->get());
    }

    public function store(Request $request)
    {
        if (Banner::count() >= 5) {
            return response()->json(['message' => 'Maximum limit of 5 banners reached. Please delete an existing one.'], 422);
        }

        $request->validate([
            'image' => 'required|image|max:2048',
            'order' => 'nullable|integer'
        ]);

        $path = $this->imageService->store($request->file('image'), 'banner');

        $banner = Banner::create([
            'image_path' => $path,
            'order' => $request->order ?? 0,
            'is_active' => true
        ]);

        return response()->json(['message' => 'Banner added successfully', 'banner' => $banner], 201);
    }

    public function update(Request $request, $id)
    {
        $banner = Banner::findOrFail($id);

        $request->validate([
            'image' => 'nullable|image|max:2048',
            'order' => 'nullable|integer',
            'is_active' => 'nullable|boolean'
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            $this->imageService->delete($banner->image_path);
            $path = $this->imageService->store($request->file('image'), 'banner');
            $banner->image_path = $path;
        }

        if ($request->has('order')) {
            $banner->order = $request->order;
        }

        if ($request->has('is_active')) {
            $banner->is_active = $request->is_active;
        }

        $banner->save();

        return response()->json(['message' => 'Banner updated successfully', 'banner' => $banner]);
    }

    public function destroy($id)
    {
        $banner = Banner::findOrFail($id);
        $this->imageService->delete($banner->image_path);
        $banner->delete();

        return response()->json(['message' => 'Banner deleted successfully']);
    }
}
