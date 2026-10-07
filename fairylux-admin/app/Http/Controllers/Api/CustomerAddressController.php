<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CustomerAddressController extends Controller
{
    /**
     * List all addresses for the authenticated customer.
     */
    public function index()
    {
        $user = Auth::user();

        $addresses = CustomerAddress::where('user_id', $user->id)
            ->orderByDesc('is_default')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $addresses,
        ]);
    }

    /**
     * Store a new address for the authenticated customer.
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'recipient_name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:50',
            'street_address' => 'required|string|max:255',
            'apartment_suite' => 'nullable|string|max:255',
            'barangay' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state_province' => 'required|string|max:255',
            'postal_code' => 'required|string|max:20',
            'country' => 'nullable|string|max:100',
            'landmark' => 'nullable|string|max:500',
            'is_default' => 'nullable|boolean',
        ]);

        return DB::transaction(function () use ($user, $validated) {
            $isFirst = CustomerAddress::where('user_id', $user->id)->count() === 0;
            $isDefault = $isFirst || (!empty($validated['is_default']) && $validated['is_default'] == true);

            if ($isDefault) {
                CustomerAddress::where('user_id', $user->id)->update(['is_default' => false]);
            }

            $address = CustomerAddress::create([
                'user_id' => $user->id,
                'recipient_name' => $validated['recipient_name'],
                'phone_number' => $validated['phone_number'],
                'address_type' => 'shipping',
                'street_address' => $validated['street_address'],
                'apartment_suite' => $validated['apartment_suite'] ?? null,
                'barangay' => $validated['barangay'] ?? null,
                'city' => $validated['city'],
                'state_province' => $validated['state_province'],
                'postal_code' => $validated['postal_code'],
                'country' => $validated['country'] ?? 'Philippines',
                'landmark' => $validated['landmark'] ?? null,
                'is_default' => $isDefault,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Delivery address saved successfully.',
                'data' => $address,
            ], 201);
        });
    }

    /**
     * Update an address belonging to the authenticated customer.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $address = CustomerAddress::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$address) {
            return response()->json([
                'status' => 'error',
                'message' => 'Address not found.',
            ], 404);
        }

        $validated = $request->validate([
            'recipient_name' => 'sometimes|required|string|max:255',
            'phone_number' => 'sometimes|required|string|max:50',
            'street_address' => 'sometimes|required|string|max:255',
            'apartment_suite' => 'nullable|string|max:255',
            'barangay' => 'nullable|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'state_province' => 'sometimes|required|string|max:255',
            'postal_code' => 'sometimes|required|string|max:20',
            'country' => 'nullable|string|max:100',
            'landmark' => 'nullable|string|max:500',
            'is_default' => 'nullable|boolean',
        ]);

        return DB::transaction(function () use ($user, $address, $validated) {
            if (isset($validated['is_default']) && $validated['is_default']) {
                CustomerAddress::where('user_id', $user->id)
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
                $address->is_default = true;
            }

            $address->update($validated);

            return response()->json([
                'status' => 'success',
                'message' => 'Address updated successfully.',
                'data' => $address,
            ]);
        });
    }

    /**
     * Delete an address belonging to the authenticated customer.
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $address = CustomerAddress::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$address) {
            return response()->json([
                'status' => 'error',
                'message' => 'Address not found.',
            ], 404);
        }

        $wasDefault = $address->is_default;
        $address->delete();

        // If the deleted address was default, make the next newest address default
        if ($wasDefault) {
            $next = CustomerAddress::where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->first();
            if ($next) {
                $next->is_default = true;
                $next->save();
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Address deleted successfully.',
        ]);
    }
}
