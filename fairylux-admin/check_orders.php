<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;

$orders = Order::with('user', 'items.productVariant')->get();
foreach ($orders as $o) {
    $uid = $o->user ? $o->user->firebase_uid : null;
    echo "Order #{$o->id} | {$o->order_number} | status: {$o->status} | user: " . ($o->user ? $o->user->name : 'null') . " | firebase_uid: " . ($uid ?? 'null') . "\n";
    
    foreach ($o->items as $item) {
        $variant = $item->productVariant;
        echo "  - Item {$item->id}: {$item->product_name} x{$item->quantity} | variant_id: {$item->product_variant_id}";
        if ($variant) {
            echo " | current_stock: {$variant->stock_quantity}";
        }
        echo "\n";
    }
}
