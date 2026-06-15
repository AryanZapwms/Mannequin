SYSTEM:
You are a world-class UI/UX designer and senior 
Next.js engineer with 15+ years of experience 
designing premium women's beauty and skincare 
e-commerce brands at the level of Fenty Beauty, 
Glossier, Forest Essentials, and Dot & Key India.
Your rules:
- Never produce generic AI-looking UI — every 
  design decision must feel intentional and 
  editorial, like it was art-directed by a 
  human designer who deeply understands 
  women's beauty aesthetics
- Never change any backend logic, API calls, 
  product data, routing, or cart/wishlist 
  functionality — only UI, styling, layout, 
  typography, animations, and visual design
- Never use Tailwind defaults without 
  customizing them — extend the config with 
  the exact brand tokens specified below
- Never skip micro-interactions — every hover, 
  tap, scroll reveal, and button press must 
  have a response that feels luxurious
- Never use flat static sections — every section 
  must have depth through layering, gradients, 
  or subtle texture
- Never use generic sans-serif body font — 
  this is a premium women's brand, typography 
  must feel elevated and intentional
- The UI must feel like it was made for women 
  who care about quality, ingredients, and 
  self-care rituals — not a generic beauty store
- Never produce incomplete code — every 
  component fully implemented, zero placeholders

---

USER:

Before writing any code, write your complete 
design rationale inside <thinking> tags covering:
- Why each color token was chosen for a 
  women's skincare brand
- Why each font pairing works for this 
  brand personality
- How each micro-interaction creates 
  a premium feel
- What makes each section feel editorial 
  rather than e-commerce generic

Deliver ALL complete working code inside <final>.

Here is the existing website context:
- Framework: Next.js App Router + TypeScript
- Styling: Tailwind CSS
- Current pages: Home, Shop, About Us, Contact, 
  Wishlist, Cart, Product pages, Category pages
- Current sections on homepage:
  Hero (5-image slider + headline + CTAs)
  Categories (Face Care, Body Care, Hair Care)
  Products grid (6 Vitamin E products)
  Footer
- Brand: Mannequin Care — women's Vitamin E 
  skincare (stretch marks, hair growth, 
  post-pregnancy care, body glow)
- Target audience: Indian women 22-45, 
  self-care conscious, value-driven but 
  aspirational
- Reference brands aesthetically: 
  Dot & Key, Mama Earth premium line, 
  Forest Essentials homepage, 
  The Ordinary (clean editorial), 
  Glossier (soft feminine)

---

TASK: Complete homepage UI redesign.
Zero logic changes. Only visual transformation.

<design_system>

  BRAND COLOR TOKENS 
  (extend tailwind.config.ts with these):
  
  PRIMARY PALETTE — Warm Gold/Yellow:
  --brand-gold-50:  #FFFDF0   (page background tint)
  --brand-gold-100: #FFF9D6   (soft section bg)
  --brand-gold-200: #FFF0A0   (hover tints)
  --brand-gold-300: #FFE45A   (light accent)
  --brand-gold-400: #FFD700   (primary yellow)
  --brand-gold-500: #F5C400   (main brand yellow)
  --brand-gold-600: #E0A800   (darker accent)
  --brand-gold-700: #B8860B   (dark gold)
  
  WARM NEUTRALS:
  --brand-cream:    #FDF6EC   (warm white bg)
  --brand-linen:    #F5ECD7   (section separator)
  --brand-sand:     #E8D5B0   (border/divider)
  --brand-mocha:    #8B6914   (text on light bg)
  --brand-espresso: #3D2B1F   (primary dark text)
  
  ACCENT POPS:
  --brand-blush:    #F9C7C7   (gentle pink accent)
  --brand-sage:     #B5C9A8   (natural/organic feel)
  --brand-copper:   #C47A2B   (premium metallic feel)
  
  USAGE RULES:
  - Page background: brand-cream (#FDF6EC) — 
    NEVER pure white
  - Primary CTAs: brand-gold-500 with 
    espresso text
  - Section alternating: cream ↔ gold-50 ↔ linen
  - Headings: brand-espresso (#3D2B1F)
  - Body text: #5C4033 (warm dark brown — 
    NEVER pure black)
  - Links and hover: brand-copper (#C47A2B)

  TYPOGRAPHY SYSTEM:
  
  Import from Google Fonts:
  Heading font: 'Cormorant Garamond' 
    (weights 300, 400, 500, 600, 700)
    — elegant, feminine, editorial, luxury feel
  
  Sub-heading font: 'Jost'
    (weights 300, 400, 500, 600)
    — modern, clean, geometric balance
  
  Body font: 'Nunito Sans'
    (weights 300, 400, 600)
    — warm, friendly, readable for skincare copy
  
  Monospace (prices, badge labels): 
    'DM Mono' (weights 300, 400)
  
  Scale:
  --text-hero:    clamp(42px, 6vw, 80px)
    font: Cormorant Garamond 300, italic
  
  --text-display: clamp(32px, 4vw, 56px)
    font: Cormorant Garamond 500
  
  --text-heading: clamp(22px, 3vw, 36px)
    font: Cormorant Garamond 600
  
  --text-subhead: clamp(13px, 1.5vw, 16px)
    font: Jost 500, letter-spacing 0.12em, 
    uppercase
  
  --text-body:    16px/1.7
    font: Nunito Sans 400
  
  --text-small:   13px
    font: Jost 400, letter-spacing 0.04em
  
  --text-price:   18px
    font: DM Mono 400
  
  SPACING AND SHAPE:
  Section padding: clamp(60px, 8vw, 120px) 
    top and bottom
  Container max-width: 1280px, padding 0 24px
  Card border-radius: 16px (products), 
    24px (featured cards), 4px (buttons)
  Image border-radius: 12px (product thumbs),
    0px (full-bleed hero)

  SHADOW SYSTEM:
  --shadow-soft: 0 4px 24px rgba(61,43,31,0.06)
  --shadow-card: 0 8px 40px rgba(61,43,31,0.10)
  --shadow-hover: 0 16px 56px rgba(61,43,31,0.16)
  --shadow-gold: 0 4px 24px rgba(245,196,0,0.25)

</design_system>

---

<section_redesigns>

  SECTION 1 — NAVBAR REDESIGN:
  
  Height: 72px desktop, 60px mobile
  Background: rgba(253,246,236,0.92) — 
    semi-transparent brand-cream
  Backdrop-filter: blur(12px) saturate(1.5)
  Border-bottom: 1px solid rgba(232,213,176,0.6)
  
  Layout:
  Left: Logo (increase size — min 120px wide)
  Center: Navigation links (desktop)
  Right: Search icon + Wishlist + Cart
  
  Logo treatment:
  If logo image looks low quality or generic,
  add a CSS text fallback: 
  "Mannequin" in Cormorant Garamond 600 italic 
  + "CARE" in Jost 400 letter-spacing 0.3em
  in brand-espresso color
  
  Nav links:
  Font: Jost 500, 13px, letter-spacing 0.08em
  Color: brand-espresso
  Hover: color brand-copper + 
    1px underline that draws in from left 
    (CSS animation, 250ms ease)
  
  Cart and Wishlist icons:
  Size: 22px Lucide icons 
    (ShoppingBag for cart, Heart for wishlist)
  Badge: gold-500 background, espresso text, 
    8px pill, position absolute top-right
  
  Announcement bar ABOVE navbar:
  Height: 36px
  Background: brand-gold-500
  Text: Jost 500, 12px, letter-spacing 0.1em
    "✦ FREE DELIVERY ON ORDERS ABOVE ₹499 
     ✦ VITAMIN E SPECIALLY FORMULATED FOR 
     INDIAN WOMEN ✦"
  Marquee animation: scrolls left continuously
  Text color: brand-espresso
  
  Mobile menu:
  Hamburger → full-screen overlay
  Background: brand-cream
  Links large: Cormorant Garamond 48px
  Slides in from right with 
  cubic-bezier(0.4, 0, 0.2, 1) 350ms

  ---

  SECTION 2 — HERO REDESIGN:
  
  Layout: SPLIT LAYOUT not full-bleed slider
  
  Left half (55% width):
  Background: brand-cream
  Vertical padding: 120px top, 80px bottom
  
  Content stacking:
  1. Eyebrow label (Jost 500, 11px, 
     letter-spacing 0.2em, brand-copper):
     "INDIA'S VITAMIN E SKINCARE SPECIALIST"
     With small ✦ decorative element before text
  
  2. Hero headline (Cormorant Garamond 300 italic,
     clamp(44px, 5vw, 76px), brand-espresso):
     Line 1: "Crafted for"
     Line 2: "Every Woman's" 
              (word "Every" in brand-gold-500)
     Line 3: "Skin Story"
  
  3. Sub-copy (Nunito Sans 400, 16px, 
     line-height 1.8, max-width 420px,
     color #5C4033):
     "Fade stretch marks. Grow stronger hair.
      Reveal radiant skin — with Vitamin E
      formulated for Indian skin tones."
  
  4. Benefit pills (horizontal row):
     Each pill: brand-gold-100 background,
     brand-mocha text, Jost 500 12px,
     letter-spacing 0.06em, border-radius 20px,
     padding 8px 16px, border 1px solid brand-sand
     Pills: "✓ Stretch Mark Repair" 
            "✓ Hair Strengthening" 
            "✓ Post-Pregnancy Care"
  
  5. CTA buttons (row):
     Primary: brand-gold-500 background,
       brand-espresso text, Jost 600 14px,
       letter-spacing 0.08em, padding 16px 36px,
       border-radius 4px
       Hover: brand-gold-600, translateY(-2px),
       shadow-gold, transition 200ms
       Text: "SHOP ALL PRODUCTS"
     
     Secondary: transparent background,
       brand-espresso text, 1px solid brand-sand,
       same sizing
       Hover: brand-cream bg, shadow-soft
       Text: "Our Story →"
  
  6. Social proof strip below buttons:
     "⭐⭐⭐⭐⭐ 4.8 · Loved by 12,000+ women"
     Tiny avatar stack (3 circles) + rating text
     Jost 400, 13px, brand-mocha color
  
  Right half (45% width):
  Full-height image container, 
  overflow hidden, no border-radius on hero
  
  Image styling:
  Current slider images displayed as:
  Main large image takes 70% of height
  Two smaller thumbnails stacked on right edge
  Auto-rotates the active image every 4s
  Active thumbnail gets gold border highlight
  
  Floating ingredient card (absolute positioned,
  bottom-left of image area, overlapping left half):
  Width: 200px
  Background: rgba(253,246,236,0.95)
  Backdrop-filter: blur(8px)
  Border: 1px solid brand-sand
  Border-radius: 16px
  Padding: 16px
  Content: 
    "KEY INGREDIENT" (Jost 500, 10px, copper)
    "Vitamin E" (Cormorant Garamond 600, 24px)
    "α-Tocopherol — clinically proven 
     to repair skin barrier" 
    (Nunito Sans 400, 11px)
  This card has a subtle float animation:
  keyframe: translateY(0) → translateY(-8px) 
  → translateY(0), 4s ease-in-out infinite

  ---

  SECTION 3 — TRUST STRIP:
  (New section — insert between Hero and Categories)
  
  Background: brand-gold-500
  Height: 72px desktop, auto mobile
  
  4 trust items in a row (flex, justify evenly):
  Each item: icon + text side by side
  
  Item 1: 🌿 "100% Natural Ingredients"
  Item 2: 🧪 "Dermatologist Tested"
  Item 3: 🚚 "Free Delivery Above ₹499"
  Item 4: ↩ "30-Day Easy Returns"
  
  Typography: Jost 600, 12px, 
    letter-spacing 0.08em, brand-espresso
  Separator between items: 1px solid 
    rgba(61,43,31,0.2) — vertical line
  On mobile: 2x2 grid, 2 rows

  ---

  SECTION 4 — CATEGORIES REDESIGN:
  
  Section background: brand-cream
  
  Header:
  Eyebrow: "EXPLORE" (Jost 500, 11px, 
    letter-spacing 0.2em, brand-copper)
  Heading: "Shop by Concern" 
    (Cormorant Garamond 600, 42px, brand-espresso)
  Subtext: "Find exactly what your skin needs"
    (Nunito Sans 400, 16px, #5C4033)
  
  Category cards layout: 3 cards in a row
  
  Each card design (NOT a simple image+label):
  
  Card container:
  Border-radius: 20px
  overflow: hidden
  Background: brand-linen (#F5ECD7)
  border: 1px solid brand-sand
  transition: all 300ms cubic-bezier(0.4,0,0.2,1)
  Hover: translateY(-6px), shadow-hover, 
    border-color brand-gold-500
  
  Card structure:
  Top: Full-width image, height 260px, 
    object-fit cover
    On hover: scale(1.04) with overflow hidden
    transition 400ms ease
  
  Bottom content area (padding 24px):
  Category label: Jost 600, 12px, 
    letter-spacing 0.15em, uppercase, brand-copper
  Category name: Cormorant Garamond 600, 28px,
    brand-espresso (e.g. "Face Care")
  Item count: Nunito Sans 400, 14px, 
    color #8B6914 (e.g. "12 Products")
  
  Bottom row:
  "Explore →" link in brand-copper, 
    Jost 500, 13px
  Arrow slides right 4px on hover (200ms)
  
  The middle card (Body Care) is slightly larger:
  Height of image: 300px (vs 260px others)
  A small "BESTSELLER" badge top-right:
    background brand-gold-500, 
    brand-espresso text, Jost 700 10px,
    letter-spacing 0.1em, padding 4px 10px,
    border-radius 0 20px 0 12px

  ---

  SECTION 5 — PRODUCTS GRID REDESIGN:
  
  Section background: brand-gold-50 (#FFFDF0)
  
  Header layout:
  Left: 
    Eyebrow: "TOP BRAND" 
      (Jost 500, 11px, letter-spacing 0.2em, 
      brand-copper)
    Heading: "Beauty Care Products"
      (Cormorant Garamond 600, 42px, brand-espresso)
  Right:
    "View All →" button 
    (Jost 500, 14px, brand-copper, 
    1px underline, hover arrow slides)
  
  Grid: 3 columns desktop, 2 tablet, 1 mobile
  Gap: 24px
  
  Product card redesign:
  
  Background: white (pure white on the 
    warm section background creates contrast)
  Border-radius: 16px
  Border: 1px solid brand-sand
  overflow: hidden
  box-shadow: shadow-soft
  Transition: all 300ms ease
  
  Hover state:
  translateY(-4px)
  shadow-hover
  border-color: brand-gold-400
  
  Image area (top of card):
  Height: 280px
  Background: brand-gold-50 
    (warm tint when no image, better than grey)
  object-fit: contain, padding: 20px
  
  When image is missing (currently "NO IMAGE"):
  Instead of broken placeholder, show:
  Brand-gold-50 background
  A large "VE" monogram in Cormorant Garamond 
    600, 64px, brand-sand
  Subtle "Product Image Coming Soon" in 
    Jost 400, 11px, brand-mocha
  This looks intentional not broken
  
  Discount badge (top-left absolute):
  Background: brand-espresso
  Text: DM Mono 400, 12px, white
  Content: "-25%" (show actual discount %)
  Padding: 4px 10px
  Border-radius: 0 0 8px 0
  
  "NEW" badge (top-right absolute):
  Background: brand-gold-500
  Text: Jost 700, 10px, brand-espresso,
    letter-spacing 0.1em
  Padding: 4px 10px
  Border-radius: 0 0 0 8px
  
  Quick-add overlay on image hover:
  Semi-transparent overlay slides up 
  from bottom of image:
  Background: rgba(61,43,31,0.85)
  "QUICK ADD" button: white text, Jost 600, 
    13px, letter-spacing 0.1em
  Transition: translateY(100%) → translateY(0),
    300ms ease
  
  Card body (padding: 20px):
  
  Product name:
  Font: Nunito Sans 600, 15px, brand-espresso
  Max 2 lines, line-clamp: 2
  Margin-bottom: 8px
  
  Rating row:
  Gold stars (⭐) + "(0 reviews)" text
  Jost 400, 12px, brand-mocha
  
  Price row:
  Sale price: DM Mono 400, 20px, brand-copper
  Original price: DM Mono 400, 14px, 
    color #9E9E9E, text-decoration line-through
  Price: "₹299" — format with ₹ symbol
  
  Add to Cart button:
  Full width, brand-gold-500 background
  Brand-espresso text, Jost 600, 13px,
    letter-spacing 0.08em
  Padding: 12px
  Border-radius: 8px
  Hover: brand-gold-600, translateY(-1px),
    shadow-gold, 200ms ease
  
  Wishlist heart icon (absolute top-right 
  of card body):
  Size: 18px Lucide Heart icon
  Color: brand-sand, filled brand-blush on active
  Hover: scale(1.2), 150ms spring ease

  ---

  SECTION 6 — BRAND PROMISE STRIP:
  (New section — insert after Products)
  
  Full-bleed section, 
  Background: brand-espresso (#3D2B1F)
  
  Layout: 2 columns
  Left (50%):
  Large italic quote in Cormorant Garamond 
    300 italic, clamp(28px, 3vw, 44px), white:
    "True radiance begins"
    "with self-care."
  Below quote:
  Small attribution: Jost 400, 13px, 
    brand-gold-300: "— The Mannequin Care Promise"
  CTA: "Discover Our Story →" 
    white text, 1px white underline,
    Jost 500, 14px
  
  Right (50%):
  2x2 grid of ingredient highlights:
  Each item:
    Icon (simple SVG — leaf, droplet, 
      shield, sparkle)
    Title: Jost 600, 14px, white
    Text: Nunito Sans 400, 13px, 
      rgba(255,255,255,0.7)
  
  Items:
  🌿 "Plant-Based" / "Sourced from nature"
  💧 "Hydrating" / "12-hour skin moisture"  
  🛡 "Dermatologist Approved" / "Clinically tested"
  ✨ "Results in 4 Weeks" / "Visible improvement"

  ---

  SECTION 7 — FOOTER REDESIGN:
  
  Background: brand-espresso (#3D2B1F)
  Top border: 3px solid brand-gold-500
  
  Top row: full-width brand tagline
  Padding: 48px 0 32px
  Text: Cormorant Garamond 300 italic,
    clamp(20px, 2.5vw, 32px), white, 
    text-align center
  "Skincare · Crafted for Indian Women"
  Separator: brand-gold-500 color for "·"
  
  Main footer: 4 columns
  (Logo+desc | Company | Categories | Find Us)
  
  Column 1 (logo + description):
  Logo (white version or text logo)
  Description: Nunito Sans 400, 14px, 
    rgba(255,255,255,0.6), max-width 260px
  Social icons: Instagram, Facebook, YouTube
    Each: 36px circle, rgba(255,255,255,0.1) bg,
    white icon, hover brand-gold-500 bg, 
    200ms transition
  
  Other columns:
  Column header: Jost 600, 12px, letter-spacing 0.2em,
    brand-gold-400, uppercase
  Links: Nunito Sans 400, 14px, 
    rgba(255,255,255,0.6)
    Hover: white, translateX(4px), 200ms
  
  Address block:
  Each line has a small icon 
  (MapPin, Phone, Mail, Clock from Lucide)
  Icon: brand-gold-500, 14px
  Text: Nunito Sans 400, 13px, 
    rgba(255,255,255,0.6)
  
  Payment strip:
  Background: rgba(0,0,0,0.2)
  Padding: 16px 0
  Left: "© 2025 Mannequincare.in · 
    All rights reserved"
    Jost 400, 12px, rgba(255,255,255,0.4)
  Right: Payment badges (COD + Razorpay)
    styled as small pill badges

</section_redesigns>

---

<micro_interactions>

  SCROLL REVEAL ANIMATIONS:
  Every section fades up on scroll 
  using Intersection Observer:
  
  Config:
  Initial: opacity 0, translateY(32px)
  Animated: opacity 1, translateY(0)
  Duration: 600ms
  Easing: cubic-bezier(0.4, 0, 0.2, 1)
  Stagger: 100ms per child element
  Threshold: 0.15 (triggers when 15% visible)
  
  Implement as a reusable 
  useScrollReveal() hook or 
  <RevealWrapper> component.
  
  PRODUCT CARD INTERACTIONS:
  - Hover: card lifts (translateY -4px), 
    shadow deepens, border turns gold
  - Image hover: scale(1.04) inside overflow:hidden
  - Quick-add overlay slides up
  - Heart icon pulses when wishlisted:
    scale(1) → scale(1.3) → scale(1.0), 
    200ms spring
  - Add to cart: button briefly 
    shows "✓ Added" with green flash, 
    then returns to normal after 1.5s
  
  HERO INTERACTIONS:
  - Thumbnail click: smooth crossfade 
    between images (300ms opacity)
  - Ingredient card: continuous float animation
  - CTA buttons: hover lifts + glow
  
  ANNOUNCEMENT BAR:
  - Infinite marquee scroll
  - Pauses on hover
  
  CATEGORY CARDS:
  - Arrow in "Explore →" slides right 4px
  - Image gently scales on hover

</micro_interactions>

---

<what_not_to_change>
  DO NOT TOUCH:
  - Any API routes or data fetching
  - Cart logic (add/remove/update)
  - Wishlist logic
  - Authentication
  - Product data or schema
  - URL routing structure
  - Checkout flow
  - Next.js config
  - Payment integration (COD + Razorpay)

  SAFE TO CHANGE:
  ✅ All className values
  ✅ tailwind.config.ts tokens
  ✅ globals.css
  ✅ Font imports
  ✅ Component layout and structure
  ✅ New wrapper divs for sections
  ✅ Animation and transition CSS
  ✅ Icon swaps (keep same actions)
  ✅ New visual-only sections 
     (trust strip, brand promise strip)
</what_not_to_change>

---

Deliver in this structure:

<answer>

  <design_rationale>
    [Why every major decision — 
     color, font, layout — specifically 
     serves Indian women aged 22-45 
     buying skincare online]
  </design_rationale>

  <tailwind_config>
    [Complete extended tailwind.config.ts 
     with all brand tokens]
  </tailwind_config>

  <globals_css>
    [Font imports + CSS variables + 
     base styles + scroll reveal keyframes + 
     announcement bar marquee animation]
  </globals_css>

  <components>
    [Every redesigned component fully coded:
     - AnnouncementBar.tsx
     - Navbar.tsx (redesigned)
     - HeroSection.tsx (redesigned)
     - TrustStrip.tsx (new)
     - CategoriesSection.tsx (redesigned)
     - ProductsGrid.tsx (redesigned)
     - ProductCard.tsx (redesigned)
     - BrandPromiseStrip.tsx (new)
     - Footer.tsx (redesigned)
     - RevealWrapper.tsx (scroll animation)
     Each with complete code, zero placeholders]
  </components>

  <homepage_layout>
    [Updated app/page.tsx showing 
     complete section order with 
     all new and redesigned components]
  </homepage_layout>

</answer>

After generating your answer:
1. Confirm brand-cream (#FDF6EC) is 
   used as page background, NEVER pure white
2. Confirm Cormorant Garamond is used 
   for ALL headline text
3. Confirm the "NO IMAGE" placeholder 
   is replaced with the VE monogram treatment
4. Confirm scroll reveal is implemented 
   as a reusable component not copy-pasted
5. Confirm the announcement bar has 
   a working marquee animation
6. Confirm zero cart or wishlist logic 
   was changed in any file
7. If any check fails, fix before 
   delivering output