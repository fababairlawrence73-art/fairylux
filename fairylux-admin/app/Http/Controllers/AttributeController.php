<?php

namespace App\Http\Controllers;

use App\Models\Color;
use App\Models\Size;
use Illuminate\Http\Request;

class AttributeController extends Controller
{
    // ──────────── SIZES ────────────

    /**
     * Get all sizes.
     */
    public function sizes()
    {
        return response()->json(Size::orderBy('sort_order')->get());
    }

    /**
     * Store a new size.
     */
    public function storeSize(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:10|unique:sizes,code',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $size = Size::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return back()->with('success', "Size '{$size->name}' created successfully.");
    }

    /**
     * Update a size.
     */
    public function updateSize(Request $request, Size $size)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:10|unique:sizes,code,' . $size->id,
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $size->update([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'sort_order' => $validated['sort_order'] ?? $size->sort_order,
        ]);

        return back()->with('success', "Size '{$size->name}' updated successfully.");
    }

    /**
     * Delete a size (only if not used in any variants).
     */
    public function destroySize(Size $size)
    {
        if ($size->variants()->count() > 0) {
            return back()->withErrors([
                'general' => "Cannot delete size '{$size->name}': it is used in {$size->variants()->count()} product variant(s)."
            ]);
        }

        $size->delete();
        return back()->with('success', "Size '{$size->name}' deleted successfully.");
    }

    // ──────────── COLORS ────────────

    /**
     * Get all colors.
     */
    public function colors()
    {
        return response()->json(Color::orderBy('name')->get());
    }

    /**
     * Store a new color.
     */
    public function storeColor(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:colors,name',
            'hex_code' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $color = Color::create([
            'name' => $validated['name'],
            'hex_code' => $validated['hex_code'],
        ]);

        return back()->with('success', "Color '{$color->name}' created successfully.");
    }

    /**
     * Update a color.
     */
    public function updateColor(Request $request, Color $color)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:colors,name,' . $color->id,
            'hex_code' => 'required|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $color->update([
            'name' => $validated['name'],
            'hex_code' => $validated['hex_code'],
        ]);

        return back()->with('success', "Color '{$color->name}' updated successfully.");
    }

    /**
     * Delete a color (only if not used in any variants).
     */
    public function destroyColor(Color $color)
    {
        if ($color->variants()->count() > 0) {
            return back()->withErrors([
                'general' => "Cannot delete color '{$color->name}': it is used in {$color->variants()->count()} product variant(s)."
            ]);
        }

        $color->delete();
        return back()->with('success', "Color '{$color->name}' deleted successfully.");
    }
}
