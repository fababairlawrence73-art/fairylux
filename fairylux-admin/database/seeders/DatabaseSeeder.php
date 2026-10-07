<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use App\Models\Size;
use App\Models\Color;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Inventory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles
        $adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            [
                'name' => 'Administrator',
                'description' => 'Full access to FairyLux boutique admin portal',
            ]
        );

        $staffRole = Role::firstOrCreate(
            ['slug' => 'staff'],
            [
                'name' => 'Staff / Stylist',
                'description' => 'Boutique staff for managing fittings and stock',
            ]
        );

        $customerRole = Role::firstOrCreate(
            ['slug' => 'customer'],
            [
                'name' => 'Customer',
                'description' => 'Mobile app registered customer',
            ]
        );

        // 2. Users
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@fairylux.com'],
            [
                'role_id' => $adminRole->id,
                'name' => 'FairyLux Admin',
                'phone_number' => '+639170000001',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );

        $customerUser = User::firstOrCreate(
            ['email' => 'customer@fairylux.com'],
            [
                'role_id' => $customerRole->id,
                'name' => 'Sophia Loren (Customer)',
                'phone_number' => '+639170000002',
                'password' => bcrypt('password'),
                'is_active' => true,
            ]
        );

        // 3. Sizes (XS, S, M, L, XL)
        $sizesData = [
            ['name' => 'Extra Small (US 2)', 'code' => 'XS', 'sort_order' => 1],
            ['name' => 'Small (US 4)', 'code' => 'S', 'sort_order' => 2],
            ['name' => 'Medium (US 6)', 'code' => 'M', 'sort_order' => 3],
            ['name' => 'Large (US 8)', 'code' => 'L', 'sort_order' => 4],
            ['name' => 'Extra Large (US 10)', 'code' => 'XL', 'sort_order' => 5],
        ];

        $sizes = [];
        foreach ($sizesData as $s) {
            $sizes[$s['code']] = Size::firstOrCreate(['code' => $s['code']], $s);
        }

        // 4. Colors
        $colorsData = [
            ['name' => 'Ivory White', 'hex_code' => '#FFFFF0', 'code' => 'IVR'],
            ['name' => 'Champagne Gold', 'hex_code' => '#F7E7CE', 'code' => 'CHM'],
            ['name' => 'Blush Pink', 'hex_code' => '#FFD1DC', 'code' => 'BLS'],
            ['name' => 'Rose Quartz', 'hex_code' => '#F7CAC9', 'code' => 'RSQ'],
            ['name' => 'Midnight Navy', 'hex_code' => '#001F3F', 'code' => 'NVY'],
            ['name' => 'Royal Emerald', 'hex_code' => '#046A38', 'code' => 'EMR'],
            ['name' => 'Burgundy Wine', 'hex_code' => '#800020', 'code' => 'BRG'],
            ['name' => 'Classic Black', 'hex_code' => '#1A1A1A', 'code' => 'BLK'],
            ['name' => 'Lavender Mist', 'hex_code' => '#E6E6FA', 'code' => 'LAV'],
            ['name' => 'Silver Mist', 'hex_code' => '#C0C0C0', 'code' => 'SLV'],
        ];

        $colors = [];
        $colorCodes = [];
        foreach ($colorsData as $c) {
            $colors[$c['name']] = Color::firstOrCreate(['name' => $c['name']], [
                'name' => $c['name'],
                'hex_code' => $c['hex_code'],
            ]);
            $colorCodes[$c['name']] = $c['code'];
        }

        // 5. Categories (The 5 requested categories)
        $categoriesData = [
            [
                'name' => 'Wedding Gowns',
                'slug' => 'wedding-gowns',
                'description' => 'Haute couture bridal creations, dramatic cathedral trains, and hand-embroidered wedding masterpieces.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Prom Gowns',
                'slug' => 'prom-gowns',
                'description' => 'Glamorous silhouettes, sparkling sequin finishes, modern corsetry, and unforgettable graduation formals.',
                'sort_order' => 2,
            ],
            [
                'name' => 'Evening Gowns',
                'slug' => 'evening-gowns',
                'description' => 'Sophisticated black-tie gowns, liquid crepe draping, opulent velvets, and red carpet couture.',
                'sort_order' => 3,
            ],
            [
                'name' => 'Bridesmaid Gowns',
                'slug' => 'bridesmaid-gowns',
                'description' => 'Cohesive bridal party dresses featuring multi-way styling, fluid chiffon, and complementary palettes.',
                'sort_order' => 4,
            ],
            [
                'name' => 'Ball Gowns',
                'slug' => 'ball-gowns',
                'description' => 'Voluminous royal silhouettes, boned basque waists, structured duchess satin, and fairy-tale fullness.',
                'sort_order' => 5,
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $catData) {
            $categories[$catData['slug']] = Category::updateOrCreate(
                ['slug' => $catData['slug']],
                array_merge($catData, ['is_active' => true])
            );
        }

        // 6. Products Catalog (5 products per category = 25 gowns)
        // Images left empty/null per instructions: "Do NOT add actual product images to the seeded products."
        $catalog = [
            // --- WEDDING GOWNS (5 products) ---
            [
                'category_slug' => 'wedding-gowns',
                'name' => 'Aurelia Royal Cathedral Lace Gown',
                'sku' => 'FL-WED-001',
                'material' => 'French Chantilly Lace & Silk Organza',
                'occasion' => 'Royal Cathedral Ceremony',
                'base_price' => 3450.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => true,
                'description' => 'An opulent cathedral gown featuring delicate French Chantilly lace across an illusion sweetheart neckline. Complete with a 3-meter scalloped lace train.',
                'short_description' => 'French Chantilly lace wedding gown with dramatic 3-meter cathedral train.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Ivory White', 'stock' => 3, 'price' => 3450.00],
                    ['size' => 'S', 'color' => 'Ivory White', 'stock' => 5, 'price' => 3450.00],
                    ['size' => 'M', 'color' => 'Ivory White', 'stock' => 4, 'price' => 3450.00],
                    ['size' => 'L', 'color' => 'Ivory White', 'stock' => 2, 'price' => 3450.00],
                    ['size' => 'S', 'color' => 'Champagne Gold', 'stock' => 3, 'price' => 3600.00],
                    ['size' => 'M', 'color' => 'Champagne Gold', 'stock' => 2, 'price' => 3600.00],
                ]
            ],
            [
                'category_slug' => 'wedding-gowns',
                'name' => 'Seraphina Off-Shoulder Mikado Gown',
                'sku' => 'FL-WED-002',
                'material' => 'Heavy Italian Mikado Silk',
                'occasion' => 'Black Tie Traditional Ceremony',
                'base_price' => 2890.00,
                'sale_price' => 2690.00,
                'status' => 'active',
                'is_featured' => true,
                'description' => 'Architectural elegance defined. Crafted from lustrous heavy Italian Mikado silk with a folded off-the-shoulder portrait collar and concealed pockets.',
                'short_description' => 'Architectural Mikado silk wedding gown with folded portrait collar.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Ivory White', 'stock' => 4, 'price' => 2890.00],
                    ['size' => 'M', 'color' => 'Ivory White', 'stock' => 6, 'price' => 2890.00],
                    ['size' => 'L', 'color' => 'Ivory White', 'stock' => 3, 'price' => 2890.00],
                    ['size' => 'XL', 'color' => 'Ivory White', 'stock' => 2, 'price' => 2990.00],
                ]
            ],
            [
                'category_slug' => 'wedding-gowns',
                'name' => 'Genevieve 3D Floral Appliqué Mermaid Gown',
                'sku' => 'FL-WED-003',
                'material' => '3D Hand-Beaded Tulle & Crepe',
                'occasion' => 'Destination Botanical Ceremony',
                'base_price' => 3150.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Form-fitting mermaid silhouette embellished with hand-cut 3D silk organza petals, micro-pearls, and an illusion plunging back.',
                'short_description' => 'Hand-cut 3D floral mermaid gown with illusion plunging back.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Ivory White', 'stock' => 2, 'price' => 3150.00],
                    ['size' => 'S', 'color' => 'Ivory White', 'stock' => 4, 'price' => 3150.00],
                    ['size' => 'M', 'color' => 'Ivory White', 'stock' => 3, 'price' => 3150.00],
                    ['size' => 'S', 'color' => 'Blush Pink', 'stock' => 2, 'price' => 3250.00],
                ]
            ],
            [
                'category_slug' => 'wedding-gowns',
                'name' => 'Vivienne Minimalist Liquid Crepe Column Gown',
                'sku' => 'FL-WED-004',
                'material' => 'Double-Faced Silk Crepe',
                'occasion' => 'Modern City & Intimate Ceremony',
                'base_price' => 2250.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Clean lines and modern romance. Featuring a high boat neckline, low scoop back, and a column skirt that flares gracefully into a chapel puddle train.',
                'short_description' => 'Sleek double-faced silk crepe gown with sculptural scoop back.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Ivory White', 'stock' => 3, 'price' => 2250.00],
                    ['size' => 'S', 'color' => 'Ivory White', 'stock' => 5, 'price' => 2250.00],
                    ['size' => 'M', 'color' => 'Ivory White', 'stock' => 4, 'price' => 2250.00],
                    ['size' => 'L', 'color' => 'Ivory White', 'stock' => 2, 'price' => 2250.00],
                ]
            ],
            [
                'category_slug' => 'wedding-gowns',
                'name' => 'Celestia Shimmering Tulle A-Line Gown',
                'sku' => 'FL-WED-005',
                'material' => 'Sparkle Tulle & Delicate Guipure Lace',
                'occasion' => 'Sunset Vineyard Wedding',
                'base_price' => 2780.00,
                'sale_price' => null,
                'status' => 'inactive', // Seeded as inactive for status filtering test
                'is_featured' => false,
                'description' => 'A whimsical A-line dream bathed in starry glitter tulle layers with delicate guipure vine lace cascading down the romantic bodice.',
                'short_description' => 'Glitter tulle A-line gown with cascading guipure lace vines.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Ivory White', 'stock' => 3, 'price' => 2780.00],
                    ['size' => 'M', 'color' => 'Ivory White', 'stock' => 2, 'price' => 2780.00],
                    ['size' => 'S', 'color' => 'Rose Quartz', 'stock' => 1, 'price' => 2850.00],
                ]
            ],

            // --- PROM GOWNS (5 products) ---
            [
                'category_slug' => 'prom-gowns',
                'name' => 'Cassiopeia Backless Iridescent Sequin Gown',
                'sku' => 'FL-PRM-001',
                'material' => 'Micro-Sequin Stretch Mesh',
                'occasion' => 'Senior Prom & Red Carpet Gala',
                'base_price' => 1450.00,
                'sale_price' => 1299.00,
                'status' => 'active',
                'is_featured' => true,
                'description' => 'Turn heads under the prom lights. Shimmering multidimensional sequins with an open crisscross lace-up back and daring side leg slit.',
                'short_description' => 'Iridescent sequin prom gown with lace-up back and high slit.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Midnight Navy', 'stock' => 4, 'price' => 1450.00],
                    ['size' => 'S', 'color' => 'Midnight Navy', 'stock' => 6, 'price' => 1450.00],
                    ['size' => 'M', 'color' => 'Midnight Navy', 'stock' => 5, 'price' => 1450.00],
                    ['size' => 'S', 'color' => 'Rose Quartz', 'stock' => 4, 'price' => 1450.00],
                    ['size' => 'M', 'color' => 'Rose Quartz', 'stock' => 3, 'price' => 1450.00],
                ]
            ],
            [
                'category_slug' => 'prom-gowns',
                'name' => 'Rosalie Tiered Corset Tulle Gown',
                'sku' => 'FL-PRM-002',
                'material' => 'Tiered Pleated Tulle & Boned Satin Corset',
                'occasion' => 'Prom Coronation & Formal Dance',
                'base_price' => 1680.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Fairy-core elegance featuring an exposed boned corset bodice and voluminous ruffled tiered tulle skirt creating instant high-drama silhouette.',
                'short_description' => 'Exposed corset gown with dramatic tiered ruffled tulle skirt.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Blush Pink', 'stock' => 3, 'price' => 1680.00],
                    ['size' => 'S', 'color' => 'Blush Pink', 'stock' => 5, 'price' => 1680.00],
                    ['size' => 'M', 'color' => 'Blush Pink', 'stock' => 4, 'price' => 1680.00],
                    ['size' => 'S', 'color' => 'Classic Black', 'stock' => 3, 'price' => 1680.00],
                ]
            ],
            [
                'category_slug' => 'prom-gowns',
                'name' => 'Mirabelle High-Slit Liquid Metallic Gown',
                'sku' => 'FL-PRM-003',
                'material' => 'Lurex Metallic Jersey',
                'occasion' => 'Prom Dance & Afterparty Glamour',
                'base_price' => 1320.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Gleaming metallic stretch jersey that drapes fluidly over curves with a halter neckline and gathered waist accent.',
                'short_description' => 'Liquid metallic stretch jersey gown with halter collar.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Champagne Gold', 'stock' => 5, 'price' => 1320.00],
                    ['size' => 'M', 'color' => 'Champagne Gold', 'stock' => 4, 'price' => 1320.00],
                    ['size' => 'S', 'color' => 'Silver Mist', 'stock' => 4, 'price' => 1320.00],
                    ['size' => 'M', 'color' => 'Silver Mist', 'stock' => 2, 'price' => 1320.00],
                ]
            ],
            [
                'category_slug' => 'prom-gowns',
                'name' => 'Ophelia Sweetheart Floral Embroidered Gown',
                'sku' => 'FL-PRM-004',
                'material' => 'Botanical Embroidered Organza',
                'occasion' => 'Springtime Formal Prom',
                'base_price' => 1590.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Embroidered with pastel flora on delicate sheer organza, featuring a timeless sweetheart neckline and gentle A-line flare.',
                'short_description' => 'Pastel floral embroidery on sheer organza with sweetheart neck.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Lavender Mist', 'stock' => 2, 'price' => 1590.00],
                    ['size' => 'S', 'color' => 'Lavender Mist', 'stock' => 4, 'price' => 1590.00],
                    ['size' => 'M', 'color' => 'Lavender Mist', 'stock' => 3, 'price' => 1590.00],
                    ['size' => 'L', 'color' => 'Lavender Mist', 'stock' => 2, 'price' => 1590.00],
                ]
            ],
            [
                'category_slug' => 'prom-gowns',
                'name' => 'Scarlett Asymmetric Draped Satin Gown',
                'sku' => 'FL-PRM-005',
                'material' => 'Duchess Silk Satin',
                'occasion' => 'Prom Royalty & High Fashion Evening',
                'base_price' => 1280.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => true,
                'description' => 'A sculptural one-shoulder silhouette in vibrant jewel tones with hand-folded satin pleats across the waistline.',
                'short_description' => 'Asymmetric one-shoulder satin gown with hand-folded pleats.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Burgundy Wine', 'stock' => 6, 'price' => 1280.00],
                    ['size' => 'M', 'color' => 'Burgundy Wine', 'stock' => 5, 'price' => 1280.00],
                    ['size' => 'L', 'color' => 'Burgundy Wine', 'stock' => 3, 'price' => 1280.00],
                    ['size' => 'S', 'color' => 'Royal Emerald', 'stock' => 4, 'price' => 1280.00],
                ]
            ],

            // --- EVENING GOWNS (5 products) ---
            [
                'category_slug' => 'evening-gowns',
                'name' => 'Nocturne Velvet High-Slit Gala Gown',
                'sku' => 'FL-EVN-001',
                'material' => 'Premium Silk Velvet & Crystal Trim',
                'occasion' => 'Winter Symphony & Opera Gala',
                'base_price' => 2650.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => true,
                'description' => 'Deep plush silk velvet trimmed with baguette crystal embroidery along the sweetheart bust and thigh-high side slit.',
                'short_description' => 'Silk velvet gala gown adorned with crystal baguette embroidery.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Midnight Navy', 'stock' => 3, 'price' => 2650.00],
                    ['size' => 'S', 'color' => 'Midnight Navy', 'stock' => 5, 'price' => 2650.00],
                    ['size' => 'M', 'color' => 'Midnight Navy', 'stock' => 4, 'price' => 2650.00],
                    ['size' => 'S', 'color' => 'Classic Black', 'stock' => 4, 'price' => 2650.00],
                    ['size' => 'M', 'color' => 'Classic Black', 'stock' => 3, 'price' => 2650.00],
                ]
            ],
            [
                'category_slug' => 'evening-gowns',
                'name' => 'Elysian Pleated Chiffon Goddess Gown',
                'sku' => 'FL-EVN-002',
                'material' => 'Fortuny-Pleated Silk Chiffon',
                'occasion' => 'Red Carpet Premiere & Charity Gala',
                'base_price' => 2100.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Ethereal Grecian silhouette with micro-pleated chiffon, plunge V-neckline, and an empire waist cinched with a metallic braided cord.',
                'short_description' => 'Grecian goddess pleated chiffon gown with empire metallic cord.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Champagne Gold', 'stock' => 4, 'price' => 2100.00],
                    ['size' => 'M', 'color' => 'Champagne Gold', 'stock' => 5, 'price' => 2100.00],
                    ['size' => 'L', 'color' => 'Champagne Gold', 'stock' => 3, 'price' => 2100.00],
                    ['size' => 'S', 'color' => 'Burgundy Wine', 'stock' => 3, 'price' => 2100.00],
                ]
            ],
            [
                'category_slug' => 'evening-gowns',
                'name' => 'Belladonna Structured Crepe Cape Gown',
                'sku' => 'FL-EVN-003',
                'material' => 'Sculptural Wool Silk Crepe',
                'occasion' => 'State Dinner & Ambassadorial Gala',
                'base_price' => 2950.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => true,
                'description' => 'A commanding presence. Tailored crepe sheath dress crowned with a cascading floor-length cape that sweeps gracefully with every stride.',
                'short_description' => 'Tailored crepe gown featuring dramatic cascading floor-length cape.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Classic Black', 'stock' => 5, 'price' => 2950.00],
                    ['size' => 'M', 'color' => 'Classic Black', 'stock' => 4, 'price' => 2950.00],
                    ['size' => 'L', 'color' => 'Classic Black', 'stock' => 2, 'price' => 2950.00],
                    ['size' => 'S', 'color' => 'Royal Emerald', 'stock' => 3, 'price' => 2950.00],
                ]
            ],
            [
                'category_slug' => 'evening-gowns',
                'name' => 'Solstice Cowl-Back Metallic Slip Gown',
                'sku' => 'FL-EVN-004',
                'material' => 'Liquid Gold Lamé Charmeuse',
                'occasion' => 'Cannes Film Festival & Awards Night',
                'base_price' => 1980.00,
                'sale_price' => 1850.00,
                'status' => 'active',
                'is_featured' => false,
                'description' => '90s glamour reimagined with molten metallic shine. A bias-cut slip gown featuring a plunging low back with delicate draped chain accents.',
                'short_description' => 'Molten gold lamé bias slip gown with draped back chain detail.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Champagne Gold', 'stock' => 3, 'price' => 1980.00],
                    ['size' => 'S', 'color' => 'Champagne Gold', 'stock' => 5, 'price' => 1980.00],
                    ['size' => 'M', 'color' => 'Champagne Gold', 'stock' => 3, 'price' => 1980.00],
                    ['size' => 'S', 'color' => 'Silver Mist', 'stock' => 2, 'price' => 1980.00],
                ]
            ],
            [
                'category_slug' => 'evening-gowns',
                'name' => 'Paloma Pearl-Encrusted Column Gown',
                'sku' => 'FL-EVN-005',
                'material' => 'Heavy Crepe with Hand-Strung Pearls',
                'occasion' => 'Black Tie Diplomatic Banquet',
                'base_price' => 3200.00,
                'sale_price' => null,
                'status' => 'inactive', // Seeded as inactive for status filtering test
                'is_featured' => false,
                'description' => 'Thousands of graduated freshwater pearls painstakingly sewn along the high collar and cap sleeves of this streamlined column gown.',
                'short_description' => 'Heavy crepe column gown with hand-strung graduated pearls.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Ivory White', 'stock' => 2, 'price' => 3200.00],
                    ['size' => 'M', 'color' => 'Ivory White', 'stock' => 2, 'price' => 3200.00],
                    ['size' => 'L', 'color' => 'Ivory White', 'stock' => 1, 'price' => 3200.00],
                ]
            ],

            // --- BRIDESMAID GOWNS (5 products) ---
            [
                'category_slug' => 'bridesmaid-gowns',
                'name' => 'Juliette Flutter-Sleeve Chiffon Gown',
                'sku' => 'FL-BMD-001',
                'material' => 'Featherlight Mulberry Chiffon',
                'occasion' => 'Bridal Entourage & Garden Wedding',
                'base_price' => 780.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Universally flattering A-line with flutter sleeves, pleated surplice bodice, and an airy slit skirt crafted for effortless movement.',
                'short_description' => 'Airy chiffon bridesmaid gown with romantic flutter sleeves.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Blush Pink', 'stock' => 6, 'price' => 780.00],
                    ['size' => 'S', 'color' => 'Blush Pink', 'stock' => 10, 'price' => 780.00],
                    ['size' => 'M', 'color' => 'Blush Pink', 'stock' => 8, 'price' => 780.00],
                    ['size' => 'L', 'color' => 'Blush Pink', 'stock' => 5, 'price' => 780.00],
                    ['size' => 'XL', 'color' => 'Blush Pink', 'stock' => 4, 'price' => 780.00],
                    ['size' => 'S', 'color' => 'Lavender Mist', 'stock' => 6, 'price' => 780.00],
                    ['size' => 'M', 'color' => 'Lavender Mist', 'stock' => 5, 'price' => 780.00],
                ]
            ],
            [
                'category_slug' => 'bridesmaid-gowns',
                'name' => 'Camille Convertible Multi-Way Satin Gown',
                'sku' => 'FL-BMD-002',
                'material' => 'Lustrous Soft Charmeuse',
                'occasion' => 'Bridal Retinue & Rehearsal Dinner',
                'base_price' => 820.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => true,
                'description' => 'One gown, infinite necklines. Dual extra-long satin sashes allow bridesmaids to wrap strapless, one-shoulder, halter, or cap-sleeve styles.',
                'short_description' => 'Convertible multi-way satin gown adaptable to 10+ necklines.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Champagne Gold', 'stock' => 6, 'price' => 820.00],
                    ['size' => 'S', 'color' => 'Champagne Gold', 'stock' => 12, 'price' => 820.00],
                    ['size' => 'M', 'color' => 'Champagne Gold', 'stock' => 10, 'price' => 820.00],
                    ['size' => 'L', 'color' => 'Champagne Gold', 'stock' => 6, 'price' => 820.00],
                    ['size' => 'S', 'color' => 'Rose Quartz', 'stock' => 8, 'price' => 820.00],
                    ['size' => 'M', 'color' => 'Rose Quartz', 'stock' => 7, 'price' => 820.00],
                ]
            ],
            [
                'category_slug' => 'bridesmaid-gowns',
                'name' => 'Adelaide One-Shoulder Georgette Gown',
                'sku' => 'FL-BMD-003',
                'material' => 'Stretch Crepe Georgette',
                'occasion' => 'Modern Bridal Party & Receptions',
                'base_price' => 890.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Contemporary chic with an asymmetric single shoulder strap featuring delicate fabric rosettes and a clean column silhouette.',
                'short_description' => 'Asymmetric one-shoulder georgette gown with clean silhouette.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Lavender Mist', 'stock' => 5, 'price' => 890.00],
                    ['size' => 'M', 'color' => 'Lavender Mist', 'stock' => 6, 'price' => 890.00],
                    ['size' => 'L', 'color' => 'Lavender Mist', 'stock' => 4, 'price' => 890.00],
                    ['size' => 'S', 'color' => 'Royal Emerald', 'stock' => 4, 'price' => 890.00],
                ]
            ],
            [
                'category_slug' => 'bridesmaid-gowns',
                'name' => 'Felicity Ruched Bodice Sweetheart Gown',
                'sku' => 'FL-BMD-004',
                'material' => 'Fine Georgette & Boned Bodice',
                'occasion' => 'Ballroom & Country Club Bridal Party',
                'base_price' => 750.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Intricately hand-ruched sweetheart bodice supported by soft interior boning, paired with an ethereal full flowing skirt.',
                'short_description' => 'Hand-ruched boned sweetheart bodice with flowing skirt.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Blush Pink', 'stock' => 4, 'price' => 750.00],
                    ['size' => 'S', 'color' => 'Blush Pink', 'stock' => 7, 'price' => 750.00],
                    ['size' => 'M', 'color' => 'Blush Pink', 'stock' => 6, 'price' => 750.00],
                    ['size' => 'L', 'color' => 'Blush Pink', 'stock' => 3, 'price' => 750.00],
                ]
            ],
            [
                'category_slug' => 'bridesmaid-gowns',
                'name' => 'Eloise High-Neck Soft Crepe Maxi Gown',
                'sku' => 'FL-BMD-005',
                'material' => 'Micro-Pleated Soft Crepe',
                'occasion' => 'Cathedral & Church Bridal Entourage',
                'base_price' => 860.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Sophisticated modesty. Featuring a mock neck collar, cutaway armholes, keyhole back, and an ankle-skimming maxi skirt with pockets.',
                'short_description' => 'Mock-neck soft crepe bridesmaid gown with keyhole back.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Midnight Navy', 'stock' => 6, 'price' => 860.00],
                    ['size' => 'M', 'color' => 'Midnight Navy', 'stock' => 5, 'price' => 860.00],
                    ['size' => 'L', 'color' => 'Midnight Navy', 'stock' => 4, 'price' => 860.00],
                    ['size' => 'XL', 'color' => 'Midnight Navy', 'stock' => 2, 'price' => 860.00],
                ]
            ],

            // --- BALL GOWNS (5 products) ---
            [
                'category_slug' => 'ball-gowns',
                'name' => 'Majestic Duchess Satin Grand Ball Gown',
                'sku' => 'FL-BAL-001',
                'material' => 'Royal Heavy Duchess Satin',
                'occasion' => 'Debutante & Coronation Ball',
                'base_price' => 4200.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => true,
                'description' => 'The epitome of aristocratic grand ball luxury. Structured basque waistline with hand-pleated box pleats holding an expansive crinoline dome.',
                'short_description' => 'Heavy Duchess satin grand ball gown with basque waist & box pleats.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Ivory White', 'stock' => 2, 'price' => 4200.00],
                    ['size' => 'S', 'color' => 'Ivory White', 'stock' => 4, 'price' => 4200.00],
                    ['size' => 'M', 'color' => 'Ivory White', 'stock' => 3, 'price' => 4200.00],
                    ['size' => 'S', 'color' => 'Royal Emerald', 'stock' => 2, 'price' => 4400.00],
                    ['size' => 'M', 'color' => 'Royal Emerald', 'stock' => 2, 'price' => 4400.00],
                ]
            ],
            [
                'category_slug' => 'ball-gowns',
                'name' => 'Versailles Gold Brocade Basque Gown',
                'sku' => 'FL-BAL-002',
                'material' => 'Gold-Threaded Baroque Brocade',
                'occasion' => 'European Debutante & Royal Masquerade',
                'base_price' => 4850.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => true,
                'description' => 'Woven with real gilded metallic threads in an 18th-century French damask motif, accented by a velvet corset and voluminous floor-skimming skirt.',
                'short_description' => 'Baroque gold brocade ball gown with velvet corset bodice.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Champagne Gold', 'stock' => 3, 'price' => 4850.00],
                    ['size' => 'M', 'color' => 'Champagne Gold', 'stock' => 3, 'price' => 4850.00],
                    ['size' => 'L', 'color' => 'Champagne Gold', 'stock' => 2, 'price' => 4850.00],
                    ['size' => 'S', 'color' => 'Burgundy Wine', 'stock' => 2, 'price' => 4850.00],
                ]
            ],
            [
                'category_slug' => 'ball-gowns',
                'name' => 'Anastasia Crystal-Embroidered Princess Gown',
                'sku' => 'FL-BAL-003',
                'material' => 'Multi-Layer Tulle & Austrian Crystals',
                'occasion' => 'Charity Debutante Ball',
                'base_price' => 3950.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Encrusted with over 5,000 sparkling crystals across an illusion bodice that diffuses into twelve cloud-like tiers of French tulle.',
                'short_description' => 'Austrian crystal bodice flowing into 12 cloud tiers of tulle.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Ivory White', 'stock' => 2, 'price' => 3950.00],
                    ['size' => 'S', 'color' => 'Ivory White', 'stock' => 4, 'price' => 3950.00],
                    ['size' => 'M', 'color' => 'Ivory White', 'stock' => 3, 'price' => 3950.00],
                    ['size' => 'S', 'color' => 'Blush Pink', 'stock' => 3, 'price' => 3950.00],
                ]
            ],
            [
                'category_slug' => 'ball-gowns',
                'name' => 'Guinevere Tiered Ruffle Dramatic Ball Gown',
                'sku' => 'FL-BAL-004',
                'material' => 'Pleated Horsehair & Soft Tulle',
                'occasion' => 'Vienna Opera Ball',
                'base_price' => 3600.00,
                'sale_price' => 3350.00,
                'status' => 'active',
                'is_featured' => false,
                'description' => 'Architectural tiered flounces edged with horsehair braid to maintain breathtaking spherical fullness during ballroom waltzes.',
                'short_description' => 'Tiered horsehair ruffle ball gown designed for ballroom movement.',
                'variants' => [
                    ['size' => 'S', 'color' => 'Classic Black', 'stock' => 3, 'price' => 3600.00],
                    ['size' => 'M', 'color' => 'Classic Black', 'stock' => 4, 'price' => 3600.00],
                    ['size' => 'L', 'color' => 'Classic Black', 'stock' => 2, 'price' => 3600.00],
                    ['size' => 'S', 'color' => 'Royal Emerald', 'stock' => 2, 'price' => 3600.00],
                ]
            ],
            [
                'category_slug' => 'ball-gowns',
                'name' => 'Victoria Corseted Jacquard Sovereign Gown',
                'sku' => 'FL-BAL-005',
                'material' => 'Silk Jacquard & Hand-Boned Bodice',
                'occasion' => 'High Society Coronation Ball',
                'base_price' => 4400.00,
                'sale_price' => null,
                'status' => 'active',
                'is_featured' => true,
                'description' => 'Regal floral silk jacquard with hand-carved steel boning in the Victorian stays, pleated drop-waist skirt, and detachable sweeping train.',
                'short_description' => 'Victorian stays silk jacquard ball gown with detachable royal train.',
                'variants' => [
                    ['size' => 'XS', 'color' => 'Burgundy Wine', 'stock' => 2, 'price' => 4400.00],
                    ['size' => 'S', 'color' => 'Burgundy Wine', 'stock' => 3, 'price' => 4400.00],
                    ['size' => 'M', 'color' => 'Burgundy Wine', 'stock' => 3, 'price' => 4400.00],
                    ['size' => 'S', 'color' => 'Midnight Navy', 'stock' => 2, 'price' => 4400.00],
                ]
            ],
        ];

        foreach ($catalog as $item) {
            $cat = $categories[$item['category_slug']];
            $slug = Str::slug($item['name']);

            $product = Product::updateOrCreate(
                ['sku' => $item['sku']],
                [
                    'category_id' => $cat->id,
                    'name' => $item['name'],
                    'slug' => $slug,
                    'material' => $item['material'],
                    'occasion' => $item['occasion'],
                    'base_price' => $item['base_price'],
                    'sale_price' => $item['sale_price'],
                    'status' => $item['status'],
                    'is_featured' => $item['is_featured'],
                    'description' => $item['description'],
                    'short_description' => $item['short_description'],
                    'featured_image' => null, // Empty per prompt: "Do NOT add actual product images yet"
                    'images' => [],
                ]
            );

            // Seed variants for this product
            foreach ($item['variants'] as $v) {
                $sizeModel = $sizes[$v['size']];
                $colorModel = $colors[$v['color']];
                $colorCode = $colorCodes[$v['color']] ?? strtoupper(substr($v['color'], 0, 3));
                $variantSku = "{$product->sku}-{$v['size']}-{$colorCode}";

                $variant = ProductVariant::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'size_id' => $sizeModel->id,
                        'color_id' => $colorModel->id,
                    ],
                    [
                        'sku' => $variantSku,
                        'price' => $v['price'],
                        'stock_quantity' => $v['stock'],
                        'image_path' => null,
                        'is_active' => true,
                    ]
                );

                // Initial inventory log for tracking
                Inventory::firstOrCreate(
                    [
                        'product_variant_id' => $variant->id,
                        'type' => 'restock',
                        'reference_note' => 'Initial boutique stock receipt',
                    ],
                    [
                        'user_id' => $adminUser->id,
                        'quantity_change' => $v['stock'],
                        'new_stock_level' => $v['stock'],
                    ]
                );
            }
        }
    }
}
