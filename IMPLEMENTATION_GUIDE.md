# Mannequin Care - E-Commerce Implementation Guide

## Overview

This guide covers the complete implementation of cart, wishlist, checkout, Razorpay payment integration, email notifications, and admin dashboard for the Mannequin Care e-commerce platform.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Schema

The Supabase schema has been updated with:

**New Tables:**
- `user_addresses` - Stores customer shipping and billing addresses
  - Supports multiple addresses per user
  - Automatic default address management
  - Address type enum (shipping/billing)

**Updated Enums:**
- `address_type` - 'shipping' | 'billing'

Run the schema migration:
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the updated `supabase/schema.sql`
4. Execute all statements

### 3. Environment Variables

Ensure your `.env.local` has:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_key

# Email
GMAIL_EMAIL=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_app_password
EMAIL_FROM=your_email@mannequincare.in

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
```

### 4. Install New Dependencies

```bash
npm install nodemailer razorpay
npm install --save-dev @types/nodemailer
```

## Features Implemented

### ✅ Cart Management
- **Files**: `app/cart/page.tsx`, `components/cart-item-row.tsx`, `lib/services/cart.ts`
- Add/remove products from cart
- Update quantities
- Real-time cart count in header
- Pre-filled cart in checkout

**Features:**
- Persistent cart using Supabase
- Real-time sync with header badge
- Quantity limits based on stock
- Smooth add/remove animations

### ✅ Wishlist Management
- **Files**: `app/wishlist/page.tsx`, `lib/services/wishlist.ts`
- Add/remove products from wishlist
- Convert wishlist items to cart
- Real-time wishlist count in header

**Features:**
- Heart icon indicator on shop page
- Quick add to cart from wishlist
- Persistent wishlist storage

### ✅ Address Management
- **Files**: `components/address-manager.tsx`, `lib/services/address.ts`, `lib/schema.sql`
- Add multiple shipping and billing addresses
- Set default addresses per type
- Edit and delete addresses
- Pre-fill during checkout

**Features:**
- Separate shipping and billing addresses
- Default address per type
- Full address CRUD operations
- Integrated in account page and checkout

### ✅ Checkout Process
- **Files**: `app/checkout/page.tsx`, `components/checkout-form.tsx`, `components/bulk-order-modal.tsx`
- Address selection/creation
- Payment method selection (Razorpay/COD)
- Order summary display
- Bulk order modal (>5 products)

**Features:**
- Pre-fill from saved addresses
- Real-time order summary
- Payment method toggle
- Bulk order contact form
- Stripe-like UX

### ✅ Razorpay Payment Integration
- **Files**: `lib/services/razorpay.ts`
- Create Razorpay orders
- Verify payments
- Handle payment failures
- Store Razorpay order ID

**Features:**
- Automatic payment verification
- Secure signature validation
- Payment capture
- Error handling

### ✅ Email Notifications
- **Files**: `lib/services/email.ts`
- Order confirmation email to customer
- Admin notification email
- HTML formatted emails
- Automatic sending after order creation

**Features:**
- Beautiful HTML email templates
- Order details included
- Shipping address confirmation
- Admin dashboard link

### ✅ Admin Orders Dashboard
- **Files**: `app/(admin)/admin/orders/page.tsx`, `app/(admin)/admin/orders/actions.ts`
- View all orders
- Update order status
- Update payment status
- Customer information display
- Color-coded status badges

**Features:**
- Real-time order updates
- Status color indicators
- Customer details
- Quick status updates
- Date/time formatting

### ✅ Account Page Enhancement
- **Files**: `app/account/page.tsx`, `components/address-manager.tsx`
- Saved addresses management
- Add/edit/delete addresses
- Set default addresses
- Order history link

**Features:**
- Full address management interface
- Default address indicators
- Quick edit/delete actions
- Type-specific addresses

### ✅ Shop Page Integration
- **Files**: `app/shop/page.tsx`, `components/shop-product-card.tsx`
- Add to cart button
- Add to wishlist button
- Heart icon indicator
- Authentication required prompts

**Features:**
- Real-time wishlist toggling
- Smooth cart additions
- Out of stock handling
- Login redirects for unauthenticated users

### ✅ Order Confirmation Page
- **Files**: `app/order-confirmation/[id]/page.tsx`
- Order details display
- Order items list
- Shipping address confirmation
- Order summary

**Features:**
- Beautiful confirmation UI
- Complete order breakdown
- Status displays
- Navigation options

## File Structure

```
lib/
├── services/
│   ├── cart.ts           # Cart operations
│   ├── wishlist.ts       # Wishlist operations
│   ├── order.ts          # Order management
│   ├── address.ts        # Address management
│   ├── email.ts          # Email service
│   └── razorpay.ts       # Razorpay integration
└── supabase/
    └── schema.sql        # Database schema

app/
├── cart/
│   └── page.tsx
├── wishlist/
│   └── page.tsx
├── checkout/
│   └── page.tsx
├── order-confirmation/[id]/
│   └── page.tsx
├── account/
│   └── page.tsx
└── (admin)/admin/orders/
    ├── page.tsx
    └── actions.ts

components/
├── cart-item-row.tsx
├── checkout-form.tsx
├── bulk-order-modal.tsx
├── address-manager.tsx
└── shop-product-card.tsx
```

## Workflow Overview

### Customer Journey

1. **Browse Products** → Shop page with Add to Cart/Wishlist
2. **Add to Cart** → Stored in `cart_items` table
3. **View Cart** → `/cart` page with quantity adjustments
4. **Checkout** → Select/create shipping address
5. **Payment** → Choose Razorpay or COD
6. **Razorpay** → Secure payment processing
7. **Confirmation** → Order details page + email
8. **Account** → View orders and manage addresses

### Admin Workflow

1. **Orders Dashboard** → `/admin/orders`
2. **View Details** → Customer info, items, address
3. **Update Status** → pending → processing → completed
4. **Payment Status** → Track payment (pending/paid)
5. **Email Sync** → Customer notified automatically

## Key Services API

### Cart Service
```typescript
await getCartItems(supabase, userId)
await addToCart(supabase, userId, productId, quantity)
await updateCartQuantity(supabase, itemId, quantity)
await removeFromCart(supabase, itemId)
await getCartCount(supabase, userId)
```

### Wishlist Service
```typescript
await getWishlistItems(supabase, userId)
await addToWishlist(supabase, userId, productId)
await removeFromWishlist(supabase, itemId)
await isInWishlist(supabase, userId, productId)
```

### Address Service
```typescript
await getAddresses(supabase, userId, type?)
await createAddress(supabase, userId, address)
await updateAddress(supabase, addressId, updates)
await deleteAddress(supabase, addressId)
await setDefaultAddress(supabase, addressId, type)
```

### Order Service
```typescript
await createOrder(supabase, orderData, items)
await getOrderById(supabase, orderId)
await getUserOrders(supabase, userId)
await updateOrderStatus(supabase, orderId, status)
await updatePaymentStatus(supabase, orderId, status)
```

### Email Service
```typescript
await sendOrderConfirmationEmail(email, orderData)
await sendAdminOrderNotification(orderData)
```

### Razorpay Service
```typescript
await createRazorpayOrder(options)
await verifyPayment(orderId, paymentId, signature)
```

## Security Features

✅ **Row Level Security (RLS)**
- Users can only access their own cart items, wishlist, addresses, and orders
- Admins can view all orders and manage statuses
- Sensitive data protected at database level

✅ **Payment Security**
- Razorpay signature verification
- Secure payment gateway integration
- PCI compliance through Razorpay

✅ **Email Security**
- Gmail app-specific passwords (not account password)
- Server-side email sending (no client exposure)
- Encrypted credential storage in env

✅ **Authentication**
- Supabase Auth integration
- Login required for cart, wishlist, checkout
- Session management

## Restrictions & Validations

✅ **Bulk Order Limit**
- Maximum 5 products per order
- Modal shown when exceeded
- Contact sales form for bulk orders

✅ **Stock Management**
- Products can't be added if out of stock
- Quantity limited to available stock
- Button disabled when stock = 0

✅ **Address Validation**
- All required fields mandatory
- Phone number validation
- Postal code validation

## Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication on your Google Account
2. Create App Password:
   - Go to myaccount.google.com/apppasswords
   - Select Mail and Windows Computer
   - Copy the 16-character password
   - Store in `GMAIL_APP_PASSWORD`

### Email Templates

**Order Confirmation Email:**
- Sent to customer immediately after order
- Includes order number, items, total, shipping address
- Estimated delivery date

**Admin Notification Email:**
- Sent to admin email
- Includes customer details, payment method
- Link to admin dashboard

## Testing Checklist

- [ ] Cart add/remove/update
- [ ] Wishlist add/remove
- [ ] Address create/edit/delete
- [ ] Checkout with new address
- [ ] Checkout with saved address
- [ ] Razorpay payment flow
- [ ] COD order flow
- [ ] Email notifications received
- [ ] Admin order status updates
- [ ] Bulk order modal appears (>5 items)
- [ ] Stock limits enforced
- [ ] Authentication redirects work

## Troubleshooting

### Emails not sending
- Check Gmail app password is correct
- Enable "Less secure app access" if 2FA not set up
- Check GMAIL_EMAIL is correct in env
- Monitor console for nodemailer errors

### Razorpay payment failing
- Verify RAZORPAY_KEY_ID and SECRET are correct
- Check Razorpay test/live mode
- Ensure checkout.razorpay.com is accessible
- Verify callback signatures

### Cart items not persisting
- Check user is authenticated
- Verify Supabase connection
- Check RLS policies allow INSERT
- Review browser console for errors

### Addresses not loading in checkout
- Verify user_addresses table exists in Supabase
- Check RLS policies for user_addresses
- Ensure user ID is correct
- Check for database connection errors

## Production Checklist

- [ ] Update RAZORPAY_KEY_ID to production key
- [ ] Update RAZORPAY_KEY_SECRET to production secret
- [ ] Update Gmail email address for admin notifications
- [ ] Update NEXT_PUBLIC_APP_URL in env
- [ ] Run full email configuration test
- [ ] Test payment flow end-to-end
- [ ] Set up email backup/forwarding
- [ ] Configure CSP headers for Razorpay
- [ ] Enable HTTPS (required for Razorpay)
- [ ] Set up error logging/monitoring
- [ ] Backup database before going live

## Future Enhancements

- [ ] Inventory management dashboard
- [ ] Customer reviews and ratings
- [ ] Coupon/discount codes
- [ ] Wishlist sharing
- [ ] Gift cards
- [ ] Subscription products
- [ ] Return/exchange management
- [ ] SMS notifications
- [ ] Analytics dashboard
- [ ] Abandoned cart recovery emails

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs
3. Check Supabase dashboard for data
4. Verify environment variables
5. Contact development team

---

**Last Updated:** November 13, 2025
**Version:** 1.0
