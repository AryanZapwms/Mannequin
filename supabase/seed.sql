-- ============================================================
-- Mannequin Care — Seed Script
-- Categories + Products
--
-- Distribution:
--   Face Care  → 12 products  (5 sub-categories)
--   Body Care  → 24 products  (5 sub-categories)
--   Hair Care  →  8 products  (3 sub-categories)
--   Total      → 44 products
--
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

DO $$
DECLARE
  -- ── Main category IDs ────────────────────────────────────
  face_id  uuid;
  body_id  uuid;
  hair_id  uuid;

  -- ── Face Care sub-category IDs ───────────────────────────
  fc_moisturizers_id uuid;
  fc_serums_id       uuid;
  fc_cleansers_id    uuid;
  fc_oils_id         uuid;
  fc_eye_id          uuid;

  -- ── Body Care sub-category IDs ───────────────────────────
  bc_lotions_id  uuid;
  bc_oils_id     uuid;
  bc_stretch_id  uuid;
  bc_wash_id     uuid;
  bc_scrubs_id   uuid;

  -- ── Hair Care sub-category IDs ───────────────────────────
  hc_oils_id     uuid;
  hc_shampoo_id  uuid;
  hc_serums_id   uuid;

BEGIN

-- ============================================================
-- MAIN CATEGORIES
-- ============================================================

INSERT INTO public.product_categories (name, slug, description)
VALUES ('Face Care', 'face-care',
        'Vitamin E-powered face care products for radiant, healthy and youthful skin.')
RETURNING id INTO face_id;

INSERT INTO public.product_categories (name, slug, description)
VALUES ('Body Care', 'body-care',
        'Luxurious Vitamin E body care essentials for silky, supple and well-nourished skin.')
RETURNING id INTO body_id;

INSERT INTO public.product_categories (name, slug, description)
VALUES ('Hair Care', 'hair-care',
        'Vitamin E-enriched hair care solutions for stronger, shinier and healthier hair.')
RETURNING id INTO hair_id;


-- ============================================================
-- FACE CARE — SUB-CATEGORIES
-- ============================================================

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Moisturizers', 'face-moisturizers',
        'Deeply hydrating moisturizers enriched with Vitamin E for all skin types.', face_id)
RETURNING id INTO fc_moisturizers_id;

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Serums', 'face-serums',
        'Concentrated Vitamin E serums targeting dark spots, ageing and dullness.', face_id)
RETURNING id INTO fc_serums_id;

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Cleansers', 'face-cleansers',
        'Gentle, effective cleansers that remove impurities while retaining moisture.', face_id)
RETURNING id INTO fc_cleansers_id;

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Face Oils', 'face-oils',
        'Pure, nutrient-rich facial oils for a natural glow and deep nourishment.', face_id)
RETURNING id INTO fc_oils_id;

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Eye Care', 'face-eye-care',
        'Specialised treatments for the delicate eye area to reduce puffiness and dark circles.', face_id)
RETURNING id INTO fc_eye_id;


-- ============================================================
-- BODY CARE — SUB-CATEGORIES
-- ============================================================

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Body Lotions', 'body-lotions',
        'Rich, fast-absorbing body lotions for long-lasting all-day moisture.', body_id)
RETURNING id INTO bc_lotions_id;

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Body Oils', 'body-oils',
        'Luxurious body oils that lock in moisture and leave skin visibly radiant.', body_id)
RETURNING id INTO bc_oils_id;

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Stretch Mark Care', 'stretch-mark-care',
        'Proven Vitamin E treatments to reduce, prevent and fade stretch marks.', body_id)
RETURNING id INTO bc_stretch_id;

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Soaps & Washes', 'body-soaps-washes',
        'Cleansing soaps and shower gels infused with Vitamin E for soft, clean skin.', body_id)
RETURNING id INTO bc_wash_id;

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Body Scrubs', 'body-scrubs',
        'Exfoliating body scrubs for smooth, renewed and glowing skin.', body_id)
RETURNING id INTO bc_scrubs_id;


-- ============================================================
-- HAIR CARE — SUB-CATEGORIES
-- ============================================================

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Hair Oils', 'hair-oils',
        'Nourishing Vitamin E hair oils to stimulate growth and restore shine.', hair_id)
RETURNING id INTO hc_oils_id;

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Shampoos & Conditioners', 'hair-shampoos-conditioners',
        'Gentle cleansing and deep conditioning formulas for healthy, strong hair.', hair_id)
RETURNING id INTO hc_shampoo_id;

INSERT INTO public.product_categories (name, slug, description, parent_id)
VALUES ('Hair Serums', 'hair-serums',
        'Lightweight Vitamin E serums for frizz control, shine and damage repair.', hair_id)
RETURNING id INTO hc_serums_id;


-- ============================================================
-- FACE CARE PRODUCTS (12)
-- ============================================================

-- ── Moisturizers (4) ─────────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Daily Moisturizer SPF 15',
   'vitamin-e-daily-moisturizer-spf-15',
   'A lightweight daily moisturizer with Vitamin E and broad-spectrum SPF 15. Hydrates, protects from UV damage and leaves skin with a healthy, dewy glow. Suitable for all skin types.',
   'MC-FC-001', 399.00, 499.00, 75,
   face_id, fc_moisturizers_id, 'active', true),

  ('Vitamin E Intensive Repair Night Cream',
   'vitamin-e-intensive-repair-night-cream',
   'An overnight repair cream enriched with high-potency Vitamin E and retinol. Works while you sleep to regenerate skin cells, reduce fine lines and restore a plump, youthful texture.',
   'MC-FC-002', 449.00, 579.00, 60,
   face_id, fc_moisturizers_id, 'active', false),

  ('Vitamin E Radiance Gel Cream',
   'vitamin-e-radiance-gel-cream',
   'A refreshing gel-cream formulation that combines Vitamin E with niacinamide to brighten dull skin, minimise pores and provide long-lasting hydration without a greasy feel.',
   'MC-FC-003', 379.00, 479.00, 80,
   face_id, fc_moisturizers_id, 'active', false),

  ('Vitamin E & Aloe Vera Soothing Moisturizer',
   'vitamin-e-aloe-vera-soothing-moisturizer',
   'A calming, fragrance-free moisturizer blending Vitamin E with pure Aloe Vera extract. Ideal for sensitive and acne-prone skin — reduces redness, soothes irritation and maintains the skin barrier.',
   'MC-FC-004', 349.00, NULL, 90,
   face_id, fc_moisturizers_id, 'active', false);

-- ── Serums (3) ───────────────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Brightening Serum',
   'vitamin-e-brightening-serum',
   'A powerful brightening serum with Vitamin E, kojic acid and licorice root extract. Fades dark spots, evens skin tone and delivers a luminous, glass-skin radiance with consistent use.',
   'MC-FC-005', 599.00, 749.00, 55,
   face_id, fc_serums_id, 'active', true),

  ('Vitamin E Anti-Ageing Peptide Serum',
   'vitamin-e-anti-ageing-peptide-serum',
   'A clinically-inspired anti-ageing serum combining Vitamin E with copper peptides and collagen boosters. Visibly reduces wrinkles, firms skin and improves elasticity within 4 weeks.',
   'MC-FC-006', 699.00, 899.00, 45,
   face_id, fc_serums_id, 'active', false),

  ('Vitamin E Hyaluronic Acid Serum',
   'vitamin-e-hyaluronic-acid-serum',
   'A deeply hydrating serum that pairs Vitamin E with 3 molecular weights of hyaluronic acid. Plumps fine lines instantly, improves skin bounce and maintains optimal moisture levels throughout the day.',
   'MC-FC-007', 549.00, 699.00, 65,
   face_id, fc_serums_id, 'active', false);

-- ── Cleansers (2) ────────────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Gentle Foam Cleanser',
   'vitamin-e-gentle-foam-cleanser',
   'A pH-balanced foaming cleanser with Vitamin E and chamomile extract. Removes makeup, excess oil and impurities without stripping the skin''s natural moisture barrier. Suitable for daily use.',
   'MC-FC-008', 299.00, 379.00, 100,
   face_id, fc_cleansers_id, 'active', false),

  ('Vitamin E Micellar Water Cleanser',
   'vitamin-e-micellar-water-cleanser',
   'A no-rinse micellar water enhanced with Vitamin E and rose water. Effortlessly dissolves makeup, sunscreen and pollution while conditioning skin — no rubbing, no rinsing required.',
   'MC-FC-009', 279.00, NULL, 85,
   face_id, fc_cleansers_id, 'active', false);

-- ── Face Oils (2) ────────────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Pure Vitamin E Facial Oil 30ml',
   'pure-vitamin-e-facial-oil-30ml',
   'A 100% pure Vitamin E facial oil cold-pressed to preserve maximum potency. Repairs the skin barrier, fades acne scars and dark spots, and delivers an intense overnight glow. A cult-favourite.',
   'MC-FC-010', 499.00, 649.00, 50,
   face_id, fc_oils_id, 'active', true),

  ('Vitamin E & Rosehip Glow Oil',
   'vitamin-e-rosehip-glow-oil',
   'A luxurious dry facial oil blending Vitamin E with rosehip seed oil and sea buckthorn. Rich in antioxidants, it brightens skin, reduces hyperpigmentation and gives a natural lit-from-within radiance.',
   'MC-FC-011', 549.00, 699.00, 40,
   face_id, fc_oils_id, 'active', false);

-- ── Eye Care (1) ─────────────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Eye Repair Cream',
   'vitamin-e-eye-repair-cream',
   'A rich yet gentle eye cream with Vitamin E, caffeine and peptides. Reduces dark circles, puffiness and crow''s feet — the delicate eye area looks visibly rested and rejuvenated from the first application.',
   'MC-FC-012', 449.00, 599.00, 55,
   face_id, fc_eye_id, 'active', false);


-- ============================================================
-- BODY CARE PRODUCTS (24)
-- ============================================================

-- ── Body Lotions (6) ─────────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Intensive Body Lotion 250ml',
   'vitamin-e-intensive-body-lotion-250ml',
   'An intensely moisturising body lotion with Vitamin E and shea butter. Absorbs quickly, locks in moisture for up to 48 hours and leaves skin visibly softer and smoother from the first use.',
   'MC-BC-001', 349.00, 449.00, 120,
   body_id, bc_lotions_id, 'active', true),

  ('Vitamin E Shea Butter Body Lotion',
   'vitamin-e-shea-butter-body-lotion',
   'A deeply nourishing body lotion combining Vitamin E with unrefined shea butter, cocoa butter and sweet almond oil. Ideal for dry, rough skin — softens heels, elbows and knees overnight.',
   'MC-BC-002', 379.00, 499.00, 95,
   body_id, bc_lotions_id, 'active', false),

  ('Vitamin E Brightening Body Lotion',
   'vitamin-e-brightening-body-lotion',
   'A daily body lotion infused with Vitamin E, niacinamide and licorice root extract. Gradually fades body dark spots, hyperpigmentation and uneven skin tone for a brighter, more even complexion.',
   'MC-BC-003', 399.00, 499.00, 85,
   body_id, bc_lotions_id, 'active', false),

  ('Vitamin E Deep Moisture Body Cream',
   'vitamin-e-deep-moisture-body-cream',
   'A thick, luxurious body cream with Vitamin E, ceramides and hyaluronic acid. Designed for very dry or dehydrated skin — restores the moisture barrier, soothes flakiness and provides long-lasting comfort.',
   'MC-BC-004', 429.00, 549.00, 70,
   body_id, bc_lotions_id, 'active', false),

  ('Vitamin E Cocoa Butter Body Lotion',
   'vitamin-e-cocoa-butter-body-lotion',
   'A sumptuous body lotion blending Vitamin E with pure cocoa butter for deep moisturisation and a subtle, natural chocolate scent. Leaves skin velvety soft and beautifully fragrant all day.',
   'MC-BC-005', 359.00, 449.00, 90,
   body_id, bc_lotions_id, 'active', false),

  ('Vitamin E Aloe Vera Cooling Body Lotion',
   'vitamin-e-aloe-vera-cooling-body-lotion',
   'A refreshing, lightweight lotion combining Vitamin E with Aloe Vera gel and menthol. Perfect after sun exposure or for sensitive, irritated skin — instantly cools, soothes and hydrates.',
   'MC-BC-006', 329.00, NULL, 110,
   body_id, bc_lotions_id, 'active', false);

-- ── Body Oils (5) ────────────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Pure Vitamin E Body Oil 100ml',
   'pure-vitamin-e-body-oil-100ml',
   'Cold-pressed, 100% pure Vitamin E body oil that deeply nourishes skin, repairs damage and delivers a luminous sheen. Use as a massage oil, bath oil or overnight treatment for silky, glowing skin.',
   'MC-BC-007', 499.00, 649.00, 65,
   body_id, bc_oils_id, 'active', true),

  ('Vitamin E & Sweet Almond Body Oil',
   'vitamin-e-sweet-almond-body-oil',
   'A light, fast-absorbing body oil blending Vitamin E with sweet almond and lavender. Rich in essential fatty acids, it softens and nourishes skin without a greasy residue. Ideal for sensitive skin.',
   'MC-BC-008', 549.00, 699.00, 55,
   body_id, bc_oils_id, 'active', false),

  ('Vitamin E Jojoba Glow Body Oil',
   'vitamin-e-jojoba-glow-body-oil',
   'A golden, multi-use body oil that combines Vitamin E with jojoba, sea buckthorn and vitamin C. Imparts a subtle, sun-kissed shimmer while deeply moisturising and protecting against environmental damage.',
   'MC-BC-009', 579.00, 749.00, 45,
   body_id, bc_oils_id, 'active', false),

  ('Vitamin E Dry Body Oil Mist',
   'vitamin-e-dry-body-oil-mist',
   'A revolutionary spray-on dry oil infused with Vitamin E and rosehip. Applies as a mist and absorbs instantly — no greasy feeling, just silky-smooth, deeply moisturised skin with a beautiful natural glow.',
   'MC-BC-010', 449.00, 549.00, 75,
   body_id, bc_oils_id, 'active', false),

  ('Vitamin E Argan Luxury Body Oil',
   'vitamin-e-argan-luxury-body-oil',
   'A premium body oil combining the antioxidant power of Vitamin E with Moroccan argan oil and jasmine essence. Restores skin elasticity, reduces the appearance of stretch marks and leaves a luxurious satin finish.',
   'MC-BC-011', 599.00, 799.00, 40,
   body_id, bc_oils_id, 'active', false);

-- ── Stretch Mark Care (6) ────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Stretch Mark Prevention Cream',
   'vitamin-e-stretch-mark-prevention-cream',
   'A clinically tested prevention cream with high-dose Vitamin E, centella asiatica and hyaluronic acid. Keeps skin supple and elastic during weight changes or pregnancy — significantly reduces the risk of new stretch marks.',
   'MC-BC-012', 549.00, 699.00, 80,
   body_id, bc_stretch_id, 'active', true),

  ('Vitamin E Stretch Mark Repair Serum',
   'vitamin-e-stretch-mark-repair-serum',
   'A targeted serum formulated to visibly fade existing stretch marks. Vitamin E combined with retinol and collagen stimulators breaks down scar tissue and stimulates fresh, healthy skin growth.',
   'MC-BC-013', 599.00, 799.00, 60,
   body_id, bc_stretch_id, 'active', false),

  ('Vitamin E Tummy Butter for Pregnancy',
   'vitamin-e-tummy-butter-pregnancy',
   'A safe, pregnancy-approved tummy butter with Vitamin E, shea butter and rosehip oil. Relieves itching, keeps skin elastic and hydrated throughout all trimesters — gentle enough for sensitive skin.',
   'MC-BC-014', 479.00, 599.00, 70,
   body_id, bc_stretch_id, 'active', false),

  ('Vitamin E Scar & Stretch Mark Oil',
   'vitamin-e-scar-stretch-mark-oil',
   'A concentrated repair oil combining Vitamin E with bio-fermented rosehip, sea buckthorn and carrot seed oil. Actively reduces the appearance of old stretch marks, surgical scars and skin discoloration.',
   'MC-BC-015', 529.00, 679.00, 55,
   body_id, bc_stretch_id, 'active', false),

  ('Vitamin E Firming & Toning Body Lotion',
   'vitamin-e-firming-toning-body-lotion',
   'A firming lotion that combines Vitamin E with caffeine and collagen-boosting peptides to tighten loose skin and diminish the look of stretch marks. Use twice daily for visible results in 6–8 weeks.',
   'MC-BC-016', 499.00, 649.00, 65,
   body_id, bc_stretch_id, 'active', false),

  ('Vitamin E Post-Delivery Repair Cream',
   'vitamin-e-post-delivery-repair-cream',
   'A specially formulated post-partum cream with Vitamin E and soothing botanicals. Helps the skin recover after childbirth — repairs stretch marks, restores elasticity and deeply nourishes tired skin.',
   'MC-BC-017', 549.00, 699.00, 50,
   body_id, bc_stretch_id, 'active', false);

-- ── Soaps & Washes (4) ───────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Nourishing Body Wash 250ml',
   'vitamin-e-nourishing-body-wash-250ml',
   'A creamy, sulphate-free body wash enriched with Vitamin E and glycerin. Gently cleanses without stripping moisture, leaving skin feeling soft, smooth and beautifully conditioned after every shower.',
   'MC-BC-018', 279.00, 349.00, 130,
   body_id, bc_wash_id, 'active', false),

  ('Vitamin E Luxury Soap Bar (Pack of 3)',
   'vitamin-e-luxury-soap-bar-pack-3',
   'Handcrafted glycerin soap bars loaded with Vitamin E and shea butter. Cold-process method preserves all nutrients — cleans, moisturises and leaves a gentle, fresh scent. Pack contains 3 bars of 100g each.',
   'MC-BC-019', 249.00, 299.00, 150,
   body_id, bc_wash_id, 'active', false),

  ('Vitamin E & Milk Shower Gel 300ml',
   'vitamin-e-milk-shower-gel-300ml',
   'An indulgent shower gel combining Vitamin E with milk proteins and oat extract. Creates a rich lather that moisturises as it cleanses — skin feels wrapped in softness long after the shower.',
   'MC-BC-020', 299.00, 379.00, 100,
   body_id, bc_wash_id, 'active', false),

  ('Vitamin E Antibacterial Hand Wash',
   'vitamin-e-antibacterial-hand-wash',
   'An effective antibacterial hand wash enriched with Vitamin E and aloe vera. Kills 99.9% of germs while keeping hands soft and hydrated — no harsh dryness or irritation, even with frequent washing.',
   'MC-BC-021', 199.00, NULL, 200,
   body_id, bc_wash_id, 'active', false);

-- ── Body Scrubs (3) ──────────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Brown Sugar Body Scrub',
   'vitamin-e-brown-sugar-body-scrub',
   'A gentle yet effective sugar scrub combining Vitamin E oil with brown sugar crystals and sweet almond oil. Buffs away dead skin cells, unclogs pores and leaves skin deeply nourished and radiantly smooth.',
   'MC-BC-022', 349.00, 449.00, 85,
   body_id, bc_scrubs_id, 'active', false),

  ('Vitamin E Coffee & Walnut Scrub',
   'vitamin-e-coffee-walnut-scrub',
   'An invigorating body scrub with Vitamin E, finely ground coffee and crushed walnut shell. Stimulates circulation, reduces the appearance of cellulite and exfoliates to reveal fresh, glowing skin.',
   'MC-BC-023', 379.00, 479.00, 70,
   body_id, bc_scrubs_id, 'active', false),

  ('Vitamin E Sea Salt Exfoliating Scrub',
   'vitamin-e-sea-salt-exfoliating-scrub',
   'A mineral-rich sea salt scrub infused with Vitamin E and coconut oil. Fine sea salt granules polish away roughness from elbows, knees and feet while Vitamin E and coconut oil deeply hydrate and soften.',
   'MC-BC-024', 399.00, 499.00, 75,
   body_id, bc_scrubs_id, 'active', false);


-- ============================================================
-- HAIR CARE PRODUCTS (8)
-- ============================================================

-- ── Hair Oils (3) ────────────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Hair Growth Oil 100ml',
   'vitamin-e-hair-growth-oil-100ml',
   'A potent hair growth oil blending Vitamin E with bhringraj, amla and castor oil. Massaged into the scalp, it stimulates hair follicles, reduces breakage and promotes thicker, longer and stronger hair growth.',
   'MC-HC-001', 449.00, 549.00, 90,
   hair_id, hc_oils_id, 'active', true),

  ('Vitamin E & Onion Black Seed Hair Oil',
   'vitamin-e-onion-black-seed-hair-oil',
   'A powerful hair fall control oil combining Vitamin E with onion extract and black seed (kalonji) oil. Clinically shown to reduce hair fall by up to 73% — strengthens roots, nourishes the scalp and boosts volume.',
   'MC-HC-002', 399.00, 499.00, 80,
   hair_id, hc_oils_id, 'active', false),

  ('Vitamin E & Castor Nourishment Hair Oil',
   'vitamin-e-castor-nourishment-hair-oil',
   'A rich, deeply conditioning hair oil that pairs Vitamin E with cold-pressed castor oil and argan oil. Tames frizz, adds mirror-like shine, heals split ends and restores life to damaged, over-processed hair.',
   'MC-HC-003', 429.00, 529.00, 75,
   hair_id, hc_oils_id, 'active', false);

-- ── Shampoos & Conditioners (3) ──────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Strengthening Shampoo 250ml',
   'vitamin-e-strengthening-shampoo-250ml',
   'A gentle, sulphate-free shampoo enriched with Vitamin E, keratin and biotin. Cleanses thoroughly without stripping natural oils — strengthens each strand from root to tip and significantly reduces breakage.',
   'MC-HC-004', 299.00, 379.00, 110,
   hair_id, hc_shampoo_id, 'active', false),

  ('Vitamin E Deep Conditioning Hair Mask',
   'vitamin-e-deep-conditioning-hair-mask',
   'An intensive weekly conditioning mask with Vitamin E, argan oil and hydrolysed silk proteins. Penetrates deep into the hair shaft to repair damage, restore elasticity and leave hair impossibly soft and shiny.',
   'MC-HC-005', 349.00, 449.00, 80,
   hair_id, hc_shampoo_id, 'active', false),

  ('Vitamin E Anti-Hair Fall Shampoo & Conditioner Duo',
   'vitamin-e-anti-hair-fall-shampoo-conditioner-duo',
   'A complementary shampoo and conditioner duo infused with Vitamin E, caffeine and ginseng root extract. Together they cleanse, strengthen and dramatically reduce hair fall — a complete hair care routine in two steps.',
   'MC-HC-006', 549.00, 699.00, 60,
   hair_id, hc_shampoo_id, 'active', true);

-- ── Hair Serums (2) ──────────────────────────────────────

INSERT INTO public.products
  (name, slug, description, sku, price, compare_at_price, stock,
   main_category_id, sub_category_id, status, is_featured)
VALUES
  ('Vitamin E Frizz Control Hair Serum',
   'vitamin-e-frizz-control-hair-serum',
   'A professional-grade hair serum combining Vitamin E with silicones and argan oil. Tames frizz and flyaways in high humidity, adds brilliant shine and provides heat protection up to 230°C for styled hair.',
   'MC-HC-007', 349.00, 449.00, 85,
   hair_id, hc_serums_id, 'active', false),

  ('Vitamin E Split-End Repair Hair Serum',
   'vitamin-e-split-end-repair-hair-serum',
   'A lightweight, leave-in serum with Vitamin E and hydrolysed keratin that seals and repairs split ends. Apply to dry ends for an instant smoothing effect, reduced breakage and noticeably healthier-looking hair.',
   'MC-HC-008', 299.00, 399.00, 90,
   hair_id, hc_serums_id, 'active', false);


-- ============================================================
-- Done ✓  Categories: 3 main + 13 sub  |  Products: 44
-- ============================================================

RAISE NOTICE 'Seed complete: 3 main categories, 13 sub-categories, 44 products inserted.';

END;
$$;
