import fs from "fs";
import path from "path";
import dns from "dns";
import mongoose from "mongoose";

// Set DNS servers to resolve MongoDB Atlas SRV records in environments with problematic DNS settings
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Failed to set DNS servers:", e);
}

// Manually parse .env.local if NEXT_MONGO_URL is not present in process.env
if (!process.env.NEXT_MONGO_URL) {
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").trim().replace(/^['"]|['"]$/g, '');
        process.env[key.trim()] = value;
      }
    }
  }
}

async function main() {
  const { dbConnect } = await import("../lib/db/connect");
  const { ProductCategory } = await import("../lib/db/models/ProductCategory");
  const { Product } = await import("../lib/db/models/Product");

  const categoriesData = [
  // Main Categories
  { name: 'Face Care', slug: 'face-care', description: 'Vitamin E-powered face care products for radiant, healthy and youthful skin.', parentSlug: null },
  { name: 'Body Care', slug: 'body-care', description: 'Luxurious Vitamin E body care essentials for silky, supple and well-nourished skin.', parentSlug: null },
  { name: 'Hair Care', slug: 'hair-care', description: 'Vitamin E-enriched hair care solutions for stronger, shinier and healthier hair.', parentSlug: null },

  // Face Care subcategories
  { name: 'Moisturizers', slug: 'face-moisturizers', description: 'Deeply hydrating moisturizers enriched with Vitamin E for all skin types.', parentSlug: 'face-care' },
  { name: 'Serums', slug: 'face-serums', description: 'Concentrated Vitamin E serums targeting dark spots, ageing and dullness.', parentSlug: 'face-care' },
  { name: 'Cleansers', slug: 'face-cleansers', description: 'Gentle, effective cleansers that remove impurities while retaining moisture.', parentSlug: 'face-care' },
  { name: 'Face Oils', slug: 'face-oils', description: 'Pure, nutrient-rich facial oils for a natural glow and deep nourishment.', parentSlug: 'face-care' },
  { name: 'Eye Care', slug: 'face-eye-care', description: 'Specialised treatments for the delicate eye area to reduce puffiness and dark circles.', parentSlug: 'face-care' },

  // Body Care subcategories
  { name: 'Body Lotions', slug: 'body-lotions', description: 'Rich, fast-absorbing body lotions for long-lasting all-day moisture.', parentSlug: 'body-care' },
  { name: 'Body Oils', slug: 'body-oils', description: 'Luxurious body oils that lock in moisture and leave skin visibly radiant.', parentSlug: 'body-care' },
  { name: 'Stretch Mark Care', slug: 'stretch-mark-care', description: 'Proven Vitamin E treatments to reduce, prevent and fade stretch marks.', parentSlug: 'body-care' },
  { name: 'Soaps & Washes', slug: 'body-soaps-washes', description: 'Cleansing soaps and shower gels infused with Vitamin E for soft, clean skin.', parentSlug: 'body-care' },
  { name: 'Body Scrubs', slug: 'body-scrubs', description: 'Exfoliating body scrubs for smooth, renewed and glowing skin.', parentSlug: 'body-care' },

  // Hair Care subcategories
  { name: 'Hair Oils', slug: 'hair-oils', description: 'Nourishing Vitamin E hair oils to stimulate growth and restore shine.', parentSlug: 'hair-care' },
  { name: 'Shampoos & Conditioners', slug: 'hair-shampoos-conditioners', description: 'Gentle cleansing and deep conditioning formulas for healthy, strong hair.', parentSlug: 'hair-care' },
  { name: 'Hair Serums', slug: 'hair-serums', description: 'Lightweight Vitamin E serums for frizz control, shine and damage repair.', parentSlug: 'hair-care' }
];

const productsData = [
  // Face Care - Moisturizers
  {
    name: 'Vitamin E Daily Moisturizer SPF 15',
    slug: 'vitamin-e-daily-moisturizer-spf-15',
    description: 'A lightweight daily moisturizer with Vitamin E and broad-spectrum SPF 15. Hydrates, protects from UV damage and leaves skin with a healthy, dewy glow. Suitable for all skin types.',
    sku: 'MC-FC-001',
    price: 399.00,
    compareAtPrice: 499.00,
    stock: 75,
    status: 'active',
    isFeatured: true,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-moisturizers'
  },
  {
    name: 'Vitamin E Intensive Repair Night Cream',
    slug: 'vitamin-e-intensive-repair-night-cream',
    description: 'An overnight repair cream enriched with high-potency Vitamin E and retinol. Works while you sleep to regenerate skin cells, reduce fine lines and restore a plump, youthful texture.',
    sku: 'MC-FC-002',
    price: 449.00,
    compareAtPrice: 579.00,
    stock: 60,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-moisturizers'
  },
  {
    name: 'Vitamin E Radiance Gel Cream',
    slug: 'vitamin-e-radiance-gel-cream',
    description: 'A refreshing gel-cream formulation that combines Vitamin E with niacinamide to brighten dull skin, minimise pores and provide long-lasting hydration without a greasy feel.',
    sku: 'MC-FC-003',
    price: 379.00,
    compareAtPrice: 479.00,
    stock: 80,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-moisturizers'
  },
  {
    name: 'Vitamin E & Aloe Vera Soothing Moisturizer',
    slug: 'vitamin-e-aloe-vera-soothing-moisturizer',
    description: 'A calming, fragrance-free moisturizer blending Vitamin E with pure Aloe Vera extract. Ideal for sensitive and acne-prone skin — reduces redness, soothes irritation and maintains the skin barrier.',
    sku: 'MC-FC-004',
    price: 349.00,
    compareAtPrice: null,
    stock: 90,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-moisturizers'
  },

  // Face Care - Serums
  {
    name: 'Vitamin E Brightening Serum',
    slug: 'vitamin-e-brightening-serum',
    description: 'A powerful brightening serum with Vitamin E, kojic acid and licorice root extract. Fades dark spots, evens skin tone and delivers a luminous, glass-skin radiance with consistent use.',
    sku: 'MC-FC-005',
    price: 599.00,
    compareAtPrice: 749.00,
    stock: 55,
    status: 'active',
    isFeatured: true,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-serums'
  },
  {
    name: 'Vitamin E Anti-Ageing Peptide Serum',
    slug: 'vitamin-e-anti-ageing-peptide-serum',
    description: 'A clinically-inspired anti-ageing serum combining Vitamin E with copper peptides and collagen boosters. Visibly reduces wrinkles, firms skin and improves elasticity within 4 weeks.',
    sku: 'MC-FC-006',
    price: 699.00,
    compareAtPrice: 899.00,
    stock: 45,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-serums'
  },
  {
    name: 'Vitamin E Hyaluronic Acid Serum',
    slug: 'vitamin-e-hyaluronic-acid-serum',
    description: 'A deeply hydrating serum that pairs Vitamin E with 3 molecular weights of hyaluronic acid. Plumps fine lines instantly, improves skin bounce and maintains optimal moisture levels throughout the day.',
    sku: 'MC-FC-007',
    price: 549.00,
    compareAtPrice: 699.00,
    stock: 65,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-serums'
  },

  // Face Care - Cleansers
  {
    name: 'Vitamin E Gentle Foam Cleanser',
    slug: 'vitamin-e-gentle-foam-cleanser',
    description: 'A pH-balanced foaming cleanser with Vitamin E and chamomile extract. Removes makeup, excess oil and impurities without stripping the skin\'s natural moisture barrier. Suitable for daily use.',
    sku: 'MC-FC-008',
    price: 299.00,
    compareAtPrice: 379.00,
    stock: 100,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-cleansers'
  },
  {
    name: 'Vitamin E Micellar Water Cleanser',
    slug: 'vitamin-e-micellar-water-cleanser',
    description: 'A no-rinse micellar water enhanced with Vitamin E and rose water. Effortlessly dissolves makeup, sunscreen and pollution while conditioning skin — no rubbing, no rinsing required.',
    sku: 'MC-FC-009',
    price: 279.00,
    compareAtPrice: null,
    stock: 85,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-cleansers'
  },

  // Face Care - Face Oils
  {
    name: 'Pure Vitamin E Facial Oil 30ml',
    slug: 'pure-vitamin-e-facial-oil-30ml',
    description: 'A 100% pure Vitamin E facial oil cold-pressed to preserve maximum potency. Repairs the skin barrier, fades acne scars and dark spots, and delivers an intense overnight glow. A cult-favourite.',
    sku: 'MC-FC-010',
    price: 499.00,
    compareAtPrice: 649.00,
    stock: 50,
    status: 'active',
    isFeatured: true,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-oils'
  },
  {
    name: 'Vitamin E & Rosehip Glow Oil',
    slug: 'vitamin-e-rosehip-glow-oil',
    description: 'A luxurious dry facial oil blending Vitamin E with rosehip seed oil and sea buckthorn. Rich in antioxidants, it brightens skin, reduces hyperpigmentation and gives a natural lit-from-within radiance.',
    sku: 'MC-FC-011',
    price: 549.00,
    compareAtPrice: 699.00,
    stock: 40,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-oils'
  },

  // Face Care - Eye Care
  {
    name: 'Vitamin E Eye Repair Cream',
    slug: 'vitamin-e-eye-repair-cream',
    description: 'A rich yet gentle eye cream with Vitamin E, caffeine and peptides. Reduces dark circles, puffiness and crow\'s feet — the delicate eye area looks visibly rested and rejuvenated from the first application.',
    sku: 'MC-FC-012',
    price: 449.00,
    compareAtPrice: 599.00,
    stock: 55,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'face-care',
    subCategorySlug: 'face-eye-care'
  },

  // Body Care - Body Lotions
  {
    name: 'Vitamin E Intensive Body Lotion 250ml',
    slug: 'vitamin-e-intensive-body-lotion-250ml',
    description: 'An intensely moisturising body lotion with Vitamin E and shea butter. Absorbs quickly, locks in moisture for up to 48 hours and leaves skin visibly softer and smoother from the first use.',
    sku: 'MC-BC-001',
    price: 349.00,
    compareAtPrice: 449.00,
    stock: 120,
    status: 'active',
    isFeatured: true,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-lotions'
  },
  {
    name: 'Vitamin E Shea Butter Body Lotion',
    slug: 'vitamin-e-shea-butter-body-lotion',
    description: 'A deeply nourishing body lotion combining Vitamin E with unrefined shea butter, cocoa butter and sweet almond oil. Ideal for dry, rough skin — softens heels, elbows and knees overnight.',
    sku: 'MC-BC-002',
    price: 379.00,
    compareAtPrice: 499.00,
    stock: 95,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-lotions'
  },
  {
    name: 'Vitamin E Brightening Body Lotion',
    slug: 'vitamin-e-brightening-body-lotion',
    description: 'A daily body lotion infused with Vitamin E, niacinamide and licorice root extract. Gradually fades body dark spots, hyperpigmentation and uneven skin tone for a brighter, more even complexion.',
    sku: 'MC-BC-003',
    price: 399.00,
    compareAtPrice: 499.00,
    stock: 85,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-lotions'
  },
  {
    name: 'Vitamin E Deep Moisture Body Cream',
    slug: 'vitamin-e-deep-moisture-body-cream',
    description: 'A thick, luxurious body cream with Vitamin E, ceramides and hyaluronic acid. Designed for very dry or dehydrated skin — restores the moisture barrier, soothes flakiness and provides long-lasting comfort.',
    sku: 'MC-BC-004',
    price: 429.00,
    compareAtPrice: 549.00,
    stock: 70,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-lotions'
  },
  {
    name: 'Vitamin E Cocoa Butter Body Lotion',
    slug: 'vitamin-e-cocoa-butter-body-lotion',
    description: 'A sumptuous body lotion blending Vitamin E with pure cocoa butter for deep moisturisation and a subtle, natural chocolate scent. Leaves skin velvety soft and beautifully fragrant all day.',
    sku: 'MC-BC-005',
    price: 359.00,
    compareAtPrice: 449.00,
    stock: 90,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-lotions'
  },
  {
    name: 'Vitamin E Aloe Vera Cooling Body Lotion',
    slug: 'vitamin-e-aloe-vera-cooling-body-lotion',
    description: 'A refreshing, lightweight lotion combining Vitamin E with Aloe Vera gel and menthol. Perfect after sun exposure or for sensitive, irritated skin — instantly cools, soothes and hydrates.',
    sku: 'MC-BC-006',
    price: 329.00,
    compareAtPrice: null,
    stock: 110,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-lotions'
  },

  // Body Care - Body Oils
  {
    name: 'Pure Vitamin E Body Oil 100ml',
    slug: 'pure-vitamin-e-body-oil-100ml',
    description: 'Cold-pressed, 100% pure Vitamin E body oil that deeply nourishes skin, repairs damage and delivers a luminous sheen. Use as a massage oil, bath oil or overnight treatment for silky, glowing skin.',
    sku: 'MC-BC-007',
    price: 499.00,
    compareAtPrice: 649.00,
    stock: 65,
    status: 'active',
    isFeatured: true,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-oils'
  },
  {
    name: 'Vitamin E & Sweet Almond Body Oil',
    slug: 'vitamin-e-sweet-almond-body-oil',
    description: 'A light, fast-absorbing body oil blending Vitamin E with sweet almond and lavender. Rich in essential fatty acids, it softens and nourishes skin without a greasy residue. Ideal for sensitive skin.',
    sku: 'MC-BC-008',
    price: 549.00,
    compareAtPrice: 699.00,
    stock: 55,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-oils'
  },
  {
    name: 'Vitamin E Jojoba Glow Body Oil',
    slug: 'vitamin-e-jojoba-glow-body-oil',
    description: 'A golden, multi-use body oil that combines Vitamin E with jojoba, sea buckthorn and vitamin C. Imparts a subtle, sun-kissed shimmer while deeply moisturising and protecting against environmental damage.',
    sku: 'MC-BC-009',
    price: 579.00,
    compareAtPrice: 749.00,
    stock: 45,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-oils'
  },
  {
    name: 'Vitamin E Dry Body Oil Mist',
    slug: 'vitamin-e-dry-body-oil-mist',
    description: 'A revolutionary spray-on dry oil infused with Vitamin E and rosehip. Applies as a mist and absorbs instantly — no greasy feeling, just silky-smooth, deeply moisturised skin with a beautiful natural glow.',
    sku: 'MC-BC-010',
    price: 449.00,
    compareAtPrice: 549.00,
    stock: 75,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-oils'
  },
  {
    name: 'Vitamin E Argan Luxury Body Oil',
    slug: 'vitamin-e-argan-luxury-body-oil',
    description: 'A premium body oil combining the antioxidant power of Vitamin E with Moroccan argan oil and jasmine essence. Restores skin elasticity, reduces the appearance of stretch marks and leaves a luxurious satin finish.',
    sku: 'MC-BC-011',
    price: 599.00,
    compareAtPrice: 799.00,
    stock: 40,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-oils'
  },

  // Body Care - Stretch Mark Care
  {
    name: 'Vitamin E Stretch Mark Prevention Cream',
    slug: 'vitamin-e-stretch-mark-prevention-cream',
    description: 'A clinically tested prevention cream with high-dose Vitamin E, centella asiatica and hyaluronic acid. Keeps skin supple and elastic during weight changes or pregnancy — significantly reduces the risk of new stretch marks.',
    sku: 'MC-BC-012',
    price: 549.00,
    compareAtPrice: 699.00,
    stock: 80,
    status: 'active',
    isFeatured: true,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'stretch-mark-care'
  },
  {
    name: 'Vitamin E Stretch Mark Repair Serum',
    slug: 'vitamin-e-stretch-mark-repair-serum',
    description: 'A targeted serum formulated to visibly fade existing stretch marks. Vitamin E combined with retinol and collagen stimulators breaks down scar tissue and stimulates fresh, healthy skin growth.',
    sku: 'MC-BC-013',
    price: 599.00,
    compareAtPrice: 799.00,
    stock: 60,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'stretch-mark-care'
  },
  {
    name: 'Vitamin E Tummy Butter for Pregnancy',
    slug: 'vitamin-e-tummy-butter-pregnancy',
    description: 'A safe, pregnancy-approved tummy butter with Vitamin E, shea butter and rosehip oil. Relieves itching, keeps skin elastic and hydrated throughout all trimesters — gentle enough for sensitive skin.',
    sku: 'MC-BC-014',
    price: 479.00,
    compareAtPrice: 599.00,
    stock: 70,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'stretch-mark-care'
  },
  {
    name: 'Vitamin E Scar & Stretch Mark Oil',
    slug: 'vitamin-e-scar-stretch-mark-oil',
    description: 'A concentrated repair oil combining Vitamin E with bio-fermented rosehip, sea buckthorn and carrot seed oil. Actively reduces the appearance of old stretch marks, surgical scars and skin discoloration.',
    sku: 'MC-BC-015',
    price: 529.00,
    compareAtPrice: 679.00,
    stock: 55,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'stretch-mark-care'
  },
  {
    name: 'Vitamin E Firming & Toning Body Lotion',
    slug: 'vitamin-e-firming-toning-body-lotion',
    description: 'A firming lotion that combines Vitamin E with caffeine and collagen-boosting peptides to tighten loose skin and diminish the look of stretch marks. Use twice daily for visible results in 6–8 weeks.',
    sku: 'MC-BC-016',
    price: 499.00,
    compareAtPrice: 649.00,
    stock: 65,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'stretch-mark-care'
  },
  {
    name: 'Vitamin E Post-Delivery Repair Cream',
    slug: 'vitamin-e-post-delivery-repair-cream',
    description: 'A specially formulated post-partum cream with Vitamin E and soothing botanicals. Helps the skin recover after childbirth — repairs stretch marks, restores elasticity and deeply nourishes tired skin.',
    sku: 'MC-BC-017',
    price: 549.00,
    compareAtPrice: 699.00,
    stock: 50,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'stretch-mark-care'
  },

  // Body Care - Soaps & Washes
  {
    name: 'Vitamin E Nourishing Body Wash 250ml',
    slug: 'vitamin-e-nourishing-body-wash-250ml',
    description: 'A creamy, sulphate-free body wash enriched with Vitamin E and glycerin. Gently cleanses without stripping moisture, leaving skin feeling soft, smooth and beautifully conditioned after every shower.',
    sku: 'MC-BC-018',
    price: 279.00,
    compareAtPrice: 349.00,
    stock: 130,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-soaps-washes'
  },
  {
    name: 'Vitamin E Luxury Soap Bar (Pack of 3)',
    slug: 'vitamin-e-luxury-soap-bar-pack-3',
    description: 'Handcrafted glycerin soap bars loaded with Vitamin E and shea butter. Cold-process method preserves all nutrients — cleans, moisturises and leaves a gentle, fresh scent. Pack contains 3 bars of 100g each.',
    sku: 'MC-BC-019',
    price: 249.00,
    compareAtPrice: 299.00,
    stock: 150,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-soaps-washes'
  },
  {
    name: 'Vitamin E & Milk Shower Gel 300ml',
    slug: 'vitamin-e-milk-shower-gel-300ml',
    description: 'An indulgent shower gel combining Vitamin E with milk proteins and oat extract. Creates a rich lather that moisturises as it cleanses — skin feels wrapped in softness long after the shower.',
    sku: 'MC-BC-020',
    price: 299.00,
    compareAtPrice: 379.00,
    stock: 100,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-soaps-washes'
  },
  {
    name: 'Vitamin E Antibacterial Hand Wash',
    slug: 'vitamin-e-antibacterial-hand-wash',
    description: 'An effective antibacterial hand wash enriched with Vitamin E and aloe vera. Kills 99.9% of germs while keeping hands soft and hydrated — no harsh dryness or irritation, even with frequent washing.',
    sku: 'MC-BC-021',
    price: 199.00,
    compareAtPrice: null,
    stock: 200,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-soaps-washes'
  },

  // Body Care - Body Scrubs
  {
    name: 'Vitamin E Brown Sugar Body Scrub',
    slug: 'vitamin-e-brown-sugar-body-scrub',
    description: 'A gentle yet effective sugar scrub combining Vitamin E oil with brown sugar crystals and sweet almond oil. Buffs away dead skin cells, unclogs pores and leaves skin deeply nourished and radiantly smooth.',
    sku: 'MC-BC-022',
    price: 349.00,
    compareAtPrice: 449.00,
    stock: 85,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-scrubs'
  },
  {
    name: 'Vitamin E Coffee & Walnut Scrub',
    slug: 'vitamin-e-coffee-walnut-scrub',
    description: 'An invigorating body scrub with Vitamin E, finely ground coffee and crushed walnut shell. Stimulates circulation, reduces the appearance of cellulite and exfoliates to reveal fresh, glowing skin.',
    sku: 'MC-BC-023',
    price: 379.00,
    compareAtPrice: 479.00,
    stock: 70,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-scrubs'
  },
  {
    name: 'Vitamin E Sea Salt Exfoliating Scrub',
    slug: 'vitamin-e-sea-salt-exfoliating-scrub',
    description: 'A mineral-rich sea salt scrub infused with Vitamin E and coconut oil. Fine sea salt granules polish away roughness from elbows, knees and feet while Vitamin E and coconut oil deeply hydrate and soften.',
    sku: 'MC-BC-024',
    price: 399.00,
    compareAtPrice: 499.00,
    stock: 75,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'body-care',
    subCategorySlug: 'body-scrubs'
  },

  // Hair Care - Hair Oils
  {
    name: 'Vitamin E Hair Growth Oil 100ml',
    slug: 'vitamin-e-hair-growth-oil-100ml',
    description: 'A potent hair growth oil blending Vitamin E with bhringraj, amla and castor oil. Massaged into the scalp, it stimulates hair follicles, reduces breakage and promotes thicker, longer and stronger hair growth.',
    sku: 'MC-HC-001',
    price: 449.00,
    compareAtPrice: 549.00,
    stock: 90,
    status: 'active',
    isFeatured: true,
    mainCategorySlug: 'hair-care',
    subCategorySlug: 'hair-oils'
  },
  {
    name: 'Vitamin E & Onion Black Seed Hair Oil',
    slug: 'vitamin-e-onion-black-seed-hair-oil',
    description: 'A powerful hair fall control oil combining Vitamin E with onion extract and black seed (kalonji) oil. Clinically shown to reduce hair fall by up to 73% — strengthens roots, nourishes the scalp and boosts volume.',
    sku: 'MC-HC-002',
    price: 399.00,
    compareAtPrice: 499.00,
    stock: 80,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'hair-care',
    subCategorySlug: 'hair-oils'
  },
  {
    name: 'Vitamin E & Castor Nourishment Hair Oil',
    slug: 'vitamin-e-castor-nourishment-hair-oil',
    description: 'A rich, deeply conditioning hair oil that pairs Vitamin E with cold-pressed castor oil and argan oil. Tames frizz, adds mirror-like shine, heals split ends and restores life to damaged, over-processed hair.',
    sku: 'MC-HC-003',
    price: 429.00,
    compareAtPrice: 529.00,
    stock: 75,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'hair-care',
    subCategorySlug: 'hair-oils'
  },

  // Hair Care - Shampoos & Conditioners
  {
    name: 'Vitamin E Strengthening Shampoo 250ml',
    slug: 'vitamin-e-strengthening-shampoo-250ml',
    description: 'A gentle, sulphate-free shampoo enriched with Vitamin E, keratin and biotin. Cleanses thoroughly without stripping natural oils — strengthens each strand from root to tip and significantly reduces breakage.',
    sku: 'MC-HC-004',
    price: 299.00,
    compareAtPrice: 379.00,
    stock: 110,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'hair-care',
    subCategorySlug: 'hair-shampoos-conditioners'
  },
  {
    name: 'Vitamin E Deep Conditioning Hair Mask',
    slug: 'vitamin-e-deep-conditioning-hair-mask',
    description: 'An intensive weekly conditioning mask with Vitamin E, argan oil and hydrolysed silk proteins. Penetrates deep into the hair shaft to repair damage, restore elasticity and leave hair impossibly soft and shiny.',
    sku: 'MC-HC-005',
    price: 349.00,
    compareAtPrice: 449.00,
    stock: 80,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'hair-care',
    subCategorySlug: 'hair-shampoos-conditioners'
  },
  {
    name: 'Vitamin E Anti-Hair Fall Shampoo & Conditioner Duo',
    slug: 'vitamin-e-anti-hair-fall-shampoo-conditioner-duo',
    description: 'A complementary shampoo and conditioner duo infused with Vitamin E, caffeine and ginseng root extract. Together they cleanse, strengthen and dramatically reduce hair fall — a complete hair care routine in two steps.',
    sku: 'MC-HC-006',
    price: 549.00,
    compareAtPrice: 699.00,
    stock: 60,
    status: 'active',
    isFeatured: true,
    mainCategorySlug: 'hair-care',
    subCategorySlug: 'hair-shampoos-conditioners'
  },

  // Hair Care - Hair Serums
  {
    name: 'Vitamin E Frizz Control Hair Serum',
    slug: 'vitamin-e-frizz-control-hair-serum',
    description: 'A professional-grade hair serum combining Vitamin E with silicones and argan oil. Tames frizz and flyaways in high humidity, adds brilliant shine and provides heat protection up to 230°C for styled hair.',
    sku: 'MC-HC-007',
    price: 349.00,
    compareAtPrice: 449.00,
    stock: 85,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'hair-care',
    subCategorySlug: 'hair-serums'
  },
  {
    name: 'Vitamin E Split-End Repair Hair Serum',
    slug: 'vitamin-e-split-end-repair-hair-serum',
    description: 'A lightweight, leave-in serum with Vitamin E and hydrolysed keratin that seals and repairs split ends. Apply to dry ends for an instant smoothing effect, reduced breakage and noticeably healthier-looking hair.',
    sku: 'MC-HC-008',
    price: 299.00,
    compareAtPrice: 399.00,
    stock: 90,
    status: 'active',
    isFeatured: false,
    mainCategorySlug: 'hair-care',
    subCategorySlug: 'hair-serums'
  }
];

async function seed() {
  try {
    console.log("Connecting to database...");
    await dbConnect();
    console.log("Connected. Clearing existing products and categories...");

    await Product.deleteMany({});
    await ProductCategory.deleteMany({});
    console.log("Cleared existing data.");

    const mainCategoryMap: { [slug: string]: any } = {};
    const subCategoryMap: { [slug: string]: any } = {};

    console.log("Seeding main categories...");
    const mainCategories = categoriesData.filter(c => c.parentSlug === null);
    for (const cat of mainCategories) {
      const created = await ProductCategory.create({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parentId: null
      });
      mainCategoryMap[cat.slug] = created._id;
      console.log(`Created Main Category: ${cat.name} (${created._id})`);
    }

    console.log("Seeding sub-categories...");
    const subCategories = categoriesData.filter(c => c.parentSlug !== null);
    for (const cat of subCategories) {
      const parentId = mainCategoryMap[cat.parentSlug!];
      if (!parentId) {
        throw new Error(`Parent category not found for slug: ${cat.parentSlug}`);
      }
      const created = await ProductCategory.create({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parentId: parentId
      });
      subCategoryMap[cat.slug] = created._id;
      console.log(`Created Sub Category: ${cat.name} (${created._id}) under parent ${cat.parentSlug}`);
    }

    console.log("Seeding products...");
    const insertDocs = productsData.map(p => {
      const mainCategoryId = mainCategoryMap[p.mainCategorySlug];
      const subCategoryId = subCategoryMap[p.subCategorySlug];

      if (!mainCategoryId || !subCategoryId) {
        throw new Error(`Category mapping failed for product: ${p.name}`);
      }

      return {
        name: p.name,
        slug: p.slug,
        description: p.description,
        sku: p.sku,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        mainCategoryId,
        subCategoryId,
        status: p.status,
        isFeatured: p.isFeatured,
        thumbnailUrl: null,
        thumbnailPublicId: null,
        media: [],
        metadata: {}
      };
    });

    const inserted = await Product.insertMany(insertDocs);
    console.log(`Successfully seeded ${inserted.length} products!`);

    console.log("Seeding complete. Closing database connection...");
    await mongoose.disconnect();
    console.log("Database disconnected.");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}
}
main();
