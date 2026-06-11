Now let's rewrite the cart page:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\cart\page.tsx
Removed 1 line
I'm realizing that getCartItems is a server-only function since it imports database connections and Mongoose models, but the cart page is a client component trying to call it directly. Unlike the Supabase setup where the client could query via REST API, Mongoose can't run in the browser, so I need to either create a server action or API route to handle the database query instead.

Bash List existing API route files
IN
cd "/c/Users/admin/Desktop/Varun/mannequincare.in" && find app/api -type f | sort

OUT
app/api/auth/[...nextauth]/route.ts
app/api/auth/forgot-password/route.ts
app/api/auth/register/route.ts
app/api/auth/reset-password/route.ts
app/api/orders/route.ts
app/api/test-rls/route.ts
app/api/upload/route.ts
I need to set up API routes for cart, wishlist, and address operations since Mongoose can't run client-side, plus potentially a coupon validation endpoint that checks site_settings during checkout. This is beyond what was originally planned, but it's necessary to handle these data operations properly.

I'm weighing whether to create dedicated API routes or convert these pages to Server Components with Server Actions instead — the latter would be more idiomatic for Next.js App Router. But since I need to minimize changes, I'll go with creating a focused set of API endpoints that let the existing client components work through fetch calls rather than direct Supabase browser access.

I need to ensure all protected routes use getCurrentUser() for authentication and return 401 if the user isn't logged in. The response shapes should match what the client expects — the snake_case DTOs that the services already return as plain objects. Let me build out these API routes first, then update the client pages to call them.

Writing API routes...

I'm realizing I need to add ownership verification for the update and delete operations — the cart item should belong to the authenticated user before allowing modifications. I could either check ownership at the route level by fetching the item first and comparing user IDs, or pass the user ID into the service functions so they filter by both the item ID and user ID. The second approach feels cleaner since it bakes the security check into the data layer itself.

I'll update the service function signatures for both cart and wishlist to accept the user ID, then modify the database queries to filter by both the item ID and user ID together.

Let me add ownership verification to the cart/wishlist service mutations — security-by-default for the new API routes I'm about to build:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\services\cart.ts (lines 99-133)
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\lib\services\cart.ts
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\lib\services\wishlist.ts
Modified
Now let's add ownership checks to the address service mutations too:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\lib\services\address.ts
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\lib\services\address.ts
Added 1 line
I need to clean up the function signatures that changed due to the ownership refactor, then move on to building out the API routes for cart, wishlist, addresses, and coupons.

Now let's create the API routes that the client components will call:

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\cart\route.ts
33 lines
Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\cart\[id]\route.ts
42 lines
Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\wishlist\route.ts
41 lines
Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\wishlist\[id]\route.ts
20 lines
Now the addresses API routes:

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\addresses\route.ts
56 lines
Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\addresses\[id]\route.ts
61 lines
I'm setting up a coupon validation endpoint that will replace the direct Supabase query, creating a dedicated route handler to check coupon codes during checkout.

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\coupons\[code]\route.ts
16 lines
Now let's rewrite the cart page properly to use the new API routes:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\cart\page.tsx (lines 2-96)
I need to swap out the cart functions to use API endpoints instead—replacing the direct database calls with fetch requests to /api/cart for retrieving items and to /api/cart/[id] for updating and removing items.

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\cart\page.tsx
Removed 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\cart\page.tsx
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\cart\page.tsx
Added 5 lines
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\cart\page.tsx
Added 1 line
Now let's rewrite the wishlist page:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\wishlist\page.tsx
Added 4 lines
Now let's rewrite cart-item-row.tsx (only needs the GuestCartItem & {id?} type — let's check it doesn't reference supabase):

Bash Check cart-item-row for supabase refs
IN
cd "/c/Users/admin/Desktop/Varun/mannequincare.in" && grep -n "supabase\|createClient" components/cart-item-row.tsx

OUT
(Bash completed with no output)
Good, no Supabase refs there. Now let's rewrite shop-product-card.tsx:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\shop-product-card.tsx
Removed 2 lines
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\shop-product-card.tsx
Added 17 lines
Now let's rewrite product-actions.tsx:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\product-actions.tsx
Removed 2 lines
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\product-actions.tsx
Removed 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\product-actions.tsx
Added 8 lines
The linter format change is noted. Moving on to address-manager.tsx now.

Now let's rewrite address-manager.tsx:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\address-manager.tsx
Removed 2 lines
The userId prop is now unused since the API derives it from the session, but I'm keeping it in the component signature for backward compatibility with the caller. However, this might trigger unused variable warnings, so I need to verify whether the linter will complain about the destructured but unreferenced parameter.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\address-manager.tsx (lines 29-128)
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\address-manager.tsx
Added 12 lines
I need to finish up the address-manager component, specifically the handleSetDefault function around line 138-139, and decide whether to keep or remove the userId prop. Let me check how it's being used in the account page to make sure I'm not breaking anything.

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\address-manager.tsx
Added 4 lines
I should look at how AddressManager is being used in the account page to determine if the userId prop is actually needed there.

Grep "AddressManager" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app)
2 lines of output
I need to remove the userId prop from the AddressManager component interface and also update the page that's passing it, since TypeScript will complain if the interface doesn't accept the prop but the parent component is still sending it.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\account\page.tsx (lines 121-130)
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\account\page.tsx
Modified
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\address-manager.tsx
Removed 4 lines
address-manager.tsx is done — fully converted to fetch-based API calls and the unused userId prop removed (and its caller in app/account/page.tsx updated).

Now moving to components/checkout-form.tsx.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\checkout-form.tsx
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\checkout-form.tsx
Removed 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\checkout-form.tsx
Removed 1 line
Now let me fix the loadAddresses effect and handleSubmit.

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\checkout-form.tsx
Added 2 lines
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\checkout-form.tsx
Added 6 lines
Now let's look at app/checkout/page.tsx.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\checkout\page.tsx
I need to swap out the imports to use getSessionUser instead of createClient, and handle the missing phone field since the session object only includes id, email, name, image, and role but not phone data. The User model has displayName and phone fields, so I'll need to figure out how to fetch the phone number client-side since it's not available in the session response.

Bash Check session route and auth.ts callbacks
IN
cat "C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\auth\session\route.ts" 2>/dev/null; echo ---; cat "C:\Users\admin\Desktop\Varun\mannequincare.in\auth.ts" 2>/dev/null | head -100

OUT
---
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  // Credentials provider requires JWT sessions — database sessions are not supported.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        await dbConnect();
        const user = await User.findOne({ email });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.displayName ?? user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // `user.id` is the Mongo ObjectId string from `authorize` — never use `token.sub` for lookups
        token.id = user.id as string;
        token.role = user.role!;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
I need to check if there's already an API endpoint available for fetching the current user's profile data, like /api/account, that would include their phone number.

Grep "phone|displayName" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\api)
6 lines of output
I need to check if there's an existing endpoint for fetching the user's profile with their phone number, since the checkout page is a client component and can't call getCurrentUser() directly like the server-rendered account page can. Let me look at what getCurrentUser() actually returns to see if phone data is already included.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\auth-helpers.ts
The session object from getCurrentUser() only includes basic fields like id, email, name, image, and role—no phone number. Since the checkout flow needs phone and display name from the user profile, I need to create a new endpoint to fetch those details from the User model, or check if there's already an account page that retrieves this information.

Bash Check account page for user profile fetching pattern
IN
grep -n "phone\|displayName\|getCurrentUser\|User\.\|dbConnect" "C:\Users\admin\Desktop\Varun\mannequincare.in\app\account\page.tsx" | head -30

OUT
31:  const phone = user.phone;
71:          {phone ? <p className="text-sm text-muted-foreground">{phone}</p> : null}
90:          {phone ? (
93:              <dd>{phone}</dd>
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\account\page.tsx (lines 2-41)
The account page still needs updating since it's using the old createClient from supabase/server, but I'll tackle that later. For the checkout page, I need to prefill the address form with the user's display name and phone number, so I'm thinking about extending the /api/auth/session endpoint—though I need to verify whether that's NextAuth's built-in handler or a custom route.

The session object currently only includes what's defined in the session callback (id, role, plus default name, email, image). I could add phone to the session via the jwt/session callbacks in auth.ts, which is technically a Phase 2 file, but since this is a small addition needed for Phase 4 functionality and Phase 2 is already completed, it seems reasonable to make this follow-on edit. Alternatively, I could create a separate /api/account/profile endpoint to fetch the phone number, but extending the session is cleaner and more consistent with existing patterns.

Let me verify the phone field name in the User model to make sure I'm using the right field.

Bash Check User model field names
IN
grep -n "phone\|displayName\|role\|email" "C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\User.ts" | head -20

OUT
8:    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
12:    displayName: { type: String, default: null },
13:    role: { type: String, enum: USER_ROLES, default: "customer", required: true },
14:    phone: { type: String, default: null },
16:    emailVerified: { type: Date, default: null },
22:userSchema.index({ role: 1 });
I need to add the phone field to the session through the auth.ts callbacks, so let me pull up the full auth.ts file to make the edit in the right place.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\auth.ts (lines 46-70)
I'm thinking it's better to keep this simple and avoid modifying auth.ts with type augmentation — instead I'll create a dedicated /api/account/profile GET route that returns the user's display name and phone by calling getCurrentUser() and querying the database with Mongoose. This follows the established pattern for Phase 4 where client components fetch data through new API routes, keeping things isolated and straightforward.

Bash List addresses API route dir to mirror pattern
IN
ls "C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\addresses\"

OUT
Exit code 2
/usr/bin/bash: eval: line 1: unexpected EOF while looking for matching `"'
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\addresses\route.ts
Now let me create a /api/account/profile route that returns the user's displayName/phone from the User model:

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\account\profile\route.ts
20 lines
Now let's update app/checkout/page.tsx:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\checkout\page.tsx
Removed 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\checkout\page.tsx
Removed 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\checkout\page.tsx
Added 1 line
Now let's fix the coupon lookup which used supabase.from("site_settings"):

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\checkout\page.tsx
Removed 3 lines
I should verify that userName and userPhone are being used consistently throughout the file, check if the state setters are wired up correctly, and scan for any other Supabase references or unused variables in the checkout page.

Bash Check for remaining supabase/unused references in checkout page
IN
grep -n "supabase\|userName\|userPhone\|getCartItems" "C:\Users\admin\Desktop\Varun\mannequincare.in\app\checkout\page.tsx"

OUT
79:  const [userName, setUserName] = useState<string | null>(null);
80:  const [userPhone, setUserPhone] = useState<string | null>(null);
I'm noticing that userName and userPhone are state variables that aren't being read anywhere else in the code, though they were likely unused before my changes too. Since TypeScript's noUnusedLocals isn't flagged, these probably aren't causing errors — they're part of the useState tuple so they're technically being used even if their values aren't referenced elsewhere.

Let me move on and check the orders page next.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\orders\page.tsx
I'm working with a server component that needs to fetch the current user via the auth helpers, then retrieve their orders using the updated getUserOrders function which no longer requires a Supabase parameter.

Bash Check getUserOrders signature
IN
grep -n "^export async function getUserOrders\|^export async function getOrderById\|^export async function getAllOrders" "C:\Users\admin\Desktop\Varun\mannequincare.in\lib\services\order.ts"

OUT
133:export async function getOrderById(orderId: string): Promise<Order> {
140:export async function getUserOrders(
153:export async function getAllOrders(
Read
Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\services\order.ts (lines 134-158)
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\orders\page.tsx
Modified
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\orders\page.tsx
Removed 3 lines
Now let's look at app/order-confirmation/[id]/page.tsx:

Globpattern: "app/order-confirmation/**/*.tsx"
Found 2 files
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\order-confirmation\[id]\page.tsx
I'm checking whether the API route for fetching individual orders already exists at /api/orders/[id].

Bash List existing order API routes
IN
find "C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\orders" -type f 2>/dev/null

OUT
C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\orders/route.ts
I need to create a GET endpoint for individual orders at app/api/orders/[id]/route.ts that retrieves an order while enforcing proper access control — checking whether the user owns the order, or has staff/admin privileges, or is a guest with a matching email. I should look at how the old getOrderById handled this with Supabase RLS to understand the auth pattern, since the current implementation just does a basic findById without any ownership validation.

Grep "getOrderById" (in C:\Users\admin\Desktop\Varun\mannequincare.in, glob: *.tsx)
2 lines of output
The order confirmation page is accessible to guests right after checkout without requiring login, so the API route should allow guest access too—probably using the order ID as a way to verify access rather than requiring authentication. This matches standard e-commerce patterns where confirmation pages are viewable immediately after placing an order. I should check how the orders POST route currently handles guest checkout to understand the pattern.

Bash Check old RLS policies for orders table
IN
grep -n -A3 -i "orders.*policy\|policy.*order" "C:\Users\admin\Desktop\Varun\mannequincare.in\supabase\schema.sql" | head -60

OUT
367:create policy "Admins manage orders" on public.orders
368-  for all using (public.is_admin());
369-
370:create policy "Admins manage order items" on public.order_items
371-  for all using (public.is_admin());
372-
373-create policy "Admins manage blogs" on public.blog_posts
--
389:create policy "Customers select own orders" on public.orders
390-  for select using (auth.uid() = user_id);
391-
392:create policy "Customers select own order items" on public.order_items
393-  for select using (
394-    exists (
395-      select 1 from public.orders o
--
439:create policy "Customers can place orders" on public.orders
440-  for insert with check (auth.uid() = user_id or user_id is null);
441-
442--- RLS: allow authenticated customers to insert their own order items
443:create policy "Customers can insert order items" on public.order_items
444-  for insert with check (
445-    exists (
446-      select 1 from public.orders o
I'm realizing the RLS logic gets tricky with guest orders — the old system only let the order's own user view it through the browser client, but guest orders have no user ID, so an authenticated user couldn't access them, and an unauthenticated guest wouldn't be able to query at all unless there's a special bypass.

Bash Search for additional select policies on orders
IN
grep -n -i "select.*using\|order_number\|anon" "C:\Users\admin\Desktop\Varun\mannequincare.in\supabase\schema.sql" | head -40

OUT
180:  order_number text not null unique,
330:  for select using (
346:  for select using (public.is_admin());
353:  for select using (true);
359:  for select using (status = 'active');
365:  for select using (true);
380:  for select using (status = 'approved');
383:  for select using (auth.uid() = user_id);
390:  for select using (auth.uid() = user_id);
393:  for select using (
There's no anonymous select policy for orders, so guests can't view order confirmations through RLS—they'd just get "Order not found." This seems like a pre-existing limitation in the old app rather than something introduced by the migration, so I should keep that behavior as-is per the instruction to not change anything else.

I'll create a GET route at /api/orders/[id] that mirrors the RLS logic: check if the user is authenticated, verify they own the order or have admin/staff privileges, and return 401 if unauthenticated or 403/404 if they lack permission. Then I'll rewire the order confirmation page to use this new route.

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\orders\[id]\route.ts
28 lines
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\order-confirmation\[id]\page.tsx
Removed 1 line
Now let's check cart-item-row.tsx:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\cart-item-row.tsx
Good — cart-item-row.tsx doesn't reference Supabase directly; nothing to change there. Now let's verify by checking for any remaining supabase/createClient references in the files this group covers:

Bash Check for remaining Supabase references in group 4 files
IN
cd "C:\Users\admin\Desktop\Varun\mannequincare.in" && grep -ln "supabase\|createClient\|createAdminClient\|@supabase" app/cart/page.tsx app/checkout/page.tsx app/wishlist/page.tsx app/orders/page.tsx "app/order-confirmation/[id]/page.tsx" components/cart-item-row.tsx components/shop-product-card.tsx components/product-actions.tsx components/address-manager.tsx components/checkout-form.tsx 2>/dev/null

OUT
(Bash completed with no output)
All clean. Let me mark item 4 complete and move to item 5 (Header.tsx and account/orders/order-confirmation pages).

Update Todos

Survey Phase 1 models and existing Supabase usage sites for Phase 4

Rewrite lib/services/{cart,wishlist,order,address}.ts to Mongoose

Add lib/auth-client.ts session helper for client components

Rewrite cart/checkout/wishlist/orders pages + cart-item-row, shop-product-card, product-actions, address-manager, checkout-form components

Rewrite Header.tsx and account/orders/order-confirmation pages

Rewrite shop, products/[slug], blog pages and OurProducts component

Rewrite admin server actions (products,orders,categories,blogs,reviews,users,settings)

Rewrite admin pages (dashboard, products, orders, categories, blogs, reviews, users, settings)

Rewrite app/api/orders/route.ts with Mongoose session transaction

Verify build/typecheck and smoke-test Phase 4
order-confirmation/[id]/page.tsx and app/orders/page.tsx are done. Now let's tackle Header.tsx and app/account/page.tsx.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx
The Header component currently relies on Supabase sessions with realtime channels for live updates to wishlist and cart counts. When migrating to Mongoose and Auth.js, I need to swap out the Supabase session imports for the custom SessionUser type, and replace the session retrieval and auth state listener with the useSession hook from next-auth/react, which requires wrapping the component tree with SessionProvider.

For the realtime Postgres subscriptions that currently push live count updates, there's no direct Mongo equivalent, so I'll need to either drop them and refetch counts periodically, or trigger refetches after mutations using custom events similar to the guest cart pattern. Let me check if SessionProvider is already configured in the layout file.

Bash Check if SessionProvider is set up
IN
grep -n "SessionProvider\|next-auth/react\|useSession" "C:\Users\admin\Desktop\Varun\mannequincare.in\app\layout.tsx" 2>/dev/null; echo "---"; grep -rn "SessionProvider" "C:\Users\admin\Desktop\Varun\mannequincare.in\app" "C:\Users\admin\Desktop\Varun\mannequincare.in\components" 2>/dev/null

OUT
---
I notice there's no SessionProvider set up, so useSession() from next-auth/react won't work without wrapping the app in it—that would require layout changes. The codebase already has an established pattern of fetching the session client-side via fetch("/api/auth/session"), which is what the login form uses, so I should follow that same approach for consistency.

Now I'm looking at how the login form handles navigation and re-renders after sign-in to see if there's a session change event I can hook into.

Bash Check login-form pattern for session handling
IN
grep -n "getSessionUser\|signIn\|signOut\|session\|router\." "C:\Users\admin\Desktop\Varun\mannequincare.in\components\login-form.tsx" 2>/dev/null | head -30

OUT
4:import { signIn } from "next-auth/react";
36:      const result = await signIn("credentials", {
46:      const sessionRes = await fetch("/api/auth/session");
47:      const session = await sessionRes.json();
48:      const role = session?.user?.role ?? "customer";
53:      router.push(destination);
54:      router.refresh();
Right, so signIn and signOut from next-auth work standalone without needing SessionProvider, but useSession() does require it. For the Header component, I need to swap out the Supabase auth calls: get the current session user instead of using supabase.auth.getSession(), listen for auth state changes to replace onAuthStateChange, and use signOut() from next-auth instead of the Supabase equivalent.

Beyond that, I'll need to replace the Supabase queries for wishlist and cart counts with new API routes, and swap out the realtime postgres_changes subscription for a simpler pattern that just refetches data when auth events happen. Since signIn and signOut typically trigger page navigation or refresh anyway, I can just refetch the session on mount and after those events. Let me check how the logout button is currently set up.

Bash Check logout-button implementation
IN
cat "C:\Users\admin\Desktop\Varun\mannequincare.in\components\logout-button.tsx" 2>/dev/null

OUT
"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const logout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return <Button onClick={logout}>Logout</Button>;
}
The signOut function navigates away via callbackUrl, so for the header we don't need live subscription—just fetch the session on mount and refetch whenever the pathname changes, since router.refresh() gets called after login. I could also add visibility change detection to handle cases where the user switches tabs.

Let me check how auth-button.tsx implements this with auth() and useSession().

Bash Check auth-button for session pattern
IN
cat "C:\Users\admin\Desktop\Varun\mannequincare.in\components\auth-button.tsx" 2>/dev/null

OUT
import Link from "next/link";
import { Button } from "./ui/button";
import { auth } from "@/auth";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const session = await auth();
  const user = session?.user;

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
The Header component will fetch the session on mount and whenever the pathname changes to handle navigation after login or logout. I can use the existing getWishlistCount and getCartCount service functions to populate those counts instead of creating new endpoints.

For real-time updates, I notice the logged-in cart path doesn't dispatch any events after mutations like the guest path does, so the counts would go stale until the next navigation. Without Supabase realtime channels, I need to add event dispatching to keep counts synchronized when users modify their cart or wishlist.

The cleanest approach is to dispatch the existing "storage" event after authenticated mutations too — that way Header can listen to a single event type regardless of guest or logged-in status. This requires adding one line after successful mutations in product-actions.tsx, shop-product-card.tsx, and the cart/wishlist pages, which is a minimal, surgical change that aligns with the current pattern.

Grep "dispatchEvent\(new Event\("storage"\)\)" (in C:\Users\admin\Desktop\Varun\mannequincare.in, glob: *.tsx)
5 lines of output
I need to extend the dispatch calls to cover the authenticated user paths as well, not just the guest cart flows. That means adding dispatches to the success handlers in the product actions, shop product card, and cart page components for both add-to-cart and wishlist operations when users are logged in.

Actually, I'm reconsidering the scope here. Rather than touching multiple files to add dispatches everywhere, I could keep this simpler by having the Header component poll the cart data on an interval—say every 20 seconds—along with fetching on mount and pathname changes. That's a common, lightweight approach that avoids the realtime subscription complexity without requiring changes across four different files. I'll also listen to storage events for guest cart parity. This way I can contain all the changes to just the Header component.

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx
Modified
Now let's update the UserMenu component:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx
Removed 5 lines
Now let's update the rest of UserMenu body to use user instead of session?.user:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx (lines 129-203)
This part already references user correctly (it was const user = session?.user ?? null before, now it's the prop directly). Now let's rewrite the Header function body:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx (lines 201-320)
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx
Removed 33 lines
Read
Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx (lines 356-450)
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx
Modified
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx
Modified
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx
Modified
Let's verify there's no remaining supabase/session/Session/useMemo references in the file:

Bash Check for remaining supabase/Session references in Header.tsx
IN
grep -n "supabase\|Session\b\|useMemo\|session\b" "C:\Users\admin\Desktop\Varun\mannequincare.in\components\Header.tsx"

OUT
252:    const loadSession = async () => {
259:    void loadSession();
Clean. Now let's rewrite app/account/page.tsx:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\account\page.tsx (lines 41-130)
I'm switching this to use the Mongoose User model server-side through getCurrentUser() and a database lookup, which I can do directly in the server component after connecting to the database. I'll need to map the old user metadata fields—like fullName from the auth metadata, avatarUrl, phone, createdAt, and the user ID—to the new Mongoose schema.

The new User model includes email, passwordHash, displayName, role, phone, avatarUrl, metadata, emailVerified, and timestamps, so I should verify the metadata field exists in the model before proceeding.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\User.ts
Now let's rewrite app/account/page.tsx:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\account\page.tsx
Added 3 lines
Now let's update the rest of the body to use user.id/user.email/metadata instead of user_metadata:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\account\page.tsx
Modified
Let's check for any remaining issues in the file:

Bash Check for remaining supabase/user_metadata references
IN
grep -n "supabase\|user_metadata\|user\.id\b" "C:\Users\admin\Desktop\Varun\mannequincare.in\app\account\page.tsx"

OUT
(Bash completed with no output)
Clean. Item 5 is complete. Let's mark it done and move to item 6 — shop, products/[slug], blog pages, and OurProducts component.

Update Todos

Survey Phase 1 models and existing Supabase usage sites for Phase 4

Rewrite lib/services/{cart,wishlist,order,address}.ts to Mongoose

Add lib/auth-client.ts session helper for client components

Rewrite cart/checkout/wishlist/orders pages + cart-item-row, shop-product-card, product-actions, address-manager, checkout-form components

Rewrite Header.tsx and account/orders/order-confirmation pages

Rewrite shop, products/[slug], blog pages and OurProducts component

Rewrite admin server actions (products,orders,categories,blogs,reviews,users,settings)

Rewrite admin pages (dashboard, products, orders, categories, blogs, reviews, users, settings)

Rewrite app/api/orders/route.ts with Mongoose session transaction

Verify build/typecheck and smoke-test Phase 4
Bash Find files in shop/products/blog/OurProducts referencing Supabase
IN
cd "C:\Users\admin\Desktop\Varun\mannequincare.in" && grep -rln "supabase\|createClient\|createAdminClient\|@supabase" app/shop app/products app/blog components/OurProducts.tsx 2>/dev/null

OUT
app/shop/page.tsx
app/products/[slug]/page.tsx
app/blog/page.tsx
app/blog/[slug]/page.tsx
components/OurProducts.tsx
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\shop\page.tsx
I need to clean up the commented-out code at the top of the file and refactor the implementation to use the Mongoose Product and ProductCategory models, so I should check what fields those models have to write the correct queries.

Bash View Product and ProductCategory models
IN
cat "C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\Product.ts"; echo "---CATEGORY---"; cat "C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\ProductCategory.ts"

OUT
import { Schema, model, models, type Model, type HydratedDocument, type InferSchemaType } from "mongoose";

export const PRODUCT_STATUSES = ["draft", "active", "archived"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

const productMediaSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: null },
    altText: { type: String, default: null },
    sortOrder: { type: Number, required: true, default: 0 },
  },
  { _id: true },
);

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: null },
    sku: { type: String, default: null },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number, default: null },
    stock: { type: Number, required: true, default: 0 },
    mainCategoryId: { type: Schema.Types.ObjectId, ref: "ProductCategory", default: null },
    subCategoryId: { type: Schema.Types.ObjectId, ref: "ProductCategory", default: null },
    status: { type: String, enum: PRODUCT_STATUSES, default: "draft", required: true },
    isFeatured: { type: Boolean, required: true, default: false },
    thumbnailUrl: { type: String, default: null },
    thumbnailPublicId: { type: String, default: null },
    media: { type: [productMediaSchema], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "products" },
);

productSchema.index({ mainCategoryId: 1 });
productSchema.index({ subCategoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ name: "text", slug: "text" });

export interface ProductModel extends Model<ProductDoc> {
  /** Atomically decrements stock, clamped at 0 — replaces the `decrement_stock` RPC */
  decrementStock(productId: string, quantity: number): Promise<HydratedDocument<ProductDoc> | null>;
}

productSchema.static(
  "decrementStock",
  async function decrementStock(productId: string, quantity: number) {
    return this.findByIdAndUpdate(
      productId,
      [{ $set: { stock: { $max: [0, { $subtract: ["$stock", quantity] }] } } }],
      { new: true },
    );
  },
);

export type ProductDoc = InferSchemaType<typeof productSchema>;

export const Product = (models.Product ??
  model<ProductDoc, ProductModel>("Product", productSchema)) as ProductModel;
---CATEGORY---
import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const productCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: null },
    parentId: { type: Schema.Types.ObjectId, ref: "ProductCategory", default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, collection: "product_categories" },
);

productCategorySchema.index({ parentId: 1 });

export type ProductCategoryDoc = InferSchemaType<typeof productCategorySchema>;

export const ProductCategory: Model<ProductCategoryDoc> =
  models.ProductCategory ?? model<ProductCategoryDoc>("ProductCategory", productCategorySchema);
I need to figure out how to convert Mongoose documents to the Product interface that ShopProductCard expects, which has fields like id, name, slug, price, compare_at_price, thumbnail_url, and stock. Let me check if there's already a converter pattern being used elsewhere in the codebase, like in the OurProducts component or product detail page, so I can follow the same approach.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\OurProducts.tsx
I'm noticing a mismatch between the data formats—the components expect snake_case fields like id, name, and thumbnail_url, but Mongoose documents use camelCase with _id instead. I need to create a converter function that transforms the Mongoose documents into the shape ShopProductCard expects.

Let me look for an existing converter pattern in the codebase, like the toCartItem function in lib/services/cart.ts, to see if there's a convention I should follow. Since both OurProducts and shop/page.tsx need the same transformation, I should probably create a shared helper function rather than duplicating the logic in each file.

Bash Check for product service / shared converters
IN
find "C:\Users\admin\Desktop\Varun\mannequincare.in\lib\services" -type f -iname "*product*" 2>/dev/null; echo "---"; grep -rln "toShopProduct\|main_category\|sub_category" "C:\Users\admin\Desktop\Varun\mannequincare.in\app" "C:\Users\admin\Desktop\Varun\mannequincare.in\components" "C:\Users\admin\Desktop\Varun\mannequincare.in\lib" 2>/dev/null | head -20

OUT
---
C:\Users\admin\Desktop\Varun\mannequincare.in\app/(admin)/admin/products/actions.ts
C:\Users\admin\Desktop\Varun\mannequincare.in\app/(admin)/admin/products/page.tsx
C:\Users\admin\Desktop\Varun\mannequincare.in\app/(admin)/admin/products/[id]/page.tsx
C:\Users\admin\Desktop\Varun\mannequincare.in\app/products/[slug]/page.tsx
C:\Users\admin\Desktop\Varun\mannequincare.in\app/shop/page.tsx
C:\Users\admin\Desktop\Varun\mannequincare.in\components/OurProducts.tsx
I'm debating whether to create a shared helper function for converting products to the shop format since I need the same mapping logic in two places. The duplication bothers me from a DRY perspective, but I'm hesitant to over-engineer. Still, since it's identical code in both files, I think a small helper in lib/services/product.ts makes sense—though that file doesn't exist yet and wasn't part of the original plan.

Looking ahead, the product detail page and admin sections will likely need similar utilities too, so consolidating product query helpers and converters like toShopProduct and toProductDetail in one place seems like it'll pay off across groups 6, 7, and 8. Let me check what the product detail page actually requires to scope this properly.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\products\[slug]\page.tsx
I need to examine the field names in the ProductReview and WishlistItem models, starting with checking the ProductReview.ts file.

Bash Check ProductReview and WishlistItem models
IN
cat "C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\ProductReview.ts"; echo "---WISHLIST---"; cat "C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\WishlistItem.ts"

OUT
import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

const productReviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: null },
    body: { type: String, default: null },
    status: { type: String, enum: REVIEW_STATUSES, default: "pending", required: true },
    adminResponse: { type: String, default: null },
  },
  { timestamps: true, collection: "product_reviews" },
);

productReviewSchema.index({ productId: 1 });
productReviewSchema.index({ userId: 1 });

export type ProductReviewDoc = InferSchemaType<typeof productReviewSchema>;

export const ProductReview: Model<ProductReviewDoc> =
  models.ProductReview ?? model<ProductReviewDoc>("ProductReview", productReviewSchema);
---WISHLIST---
import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const wishlistItemSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "wishlist_items" },
);

// Mirrors the Postgres `unique (user_id, product_id)` constraint —
// duplicate inserts raise a Mongo E11000 error (code 11000), the equivalent of
// Supabase's `error.code === "23505"`.
wishlistItemSchema.index({ userId: 1, productId: 1 }, { unique: true });

export type WishlistItemDoc = InferSchemaType<typeof wishlistItemSchema>;

export const WishlistItem: Model<WishlistItemDoc> =
  models.WishlistItem ?? model<WishlistItemDoc>("WishlistItem", wishlistItemSchema);
I'm setting up a product mapping service in lib/services/product.ts that will convert Firestore documents to the ShopProductCard DTO format, then planning out the refactor for the product detail page to use Mongoose models directly instead of the client creator.

For the product detail page, I need to handle metadata generation by querying for active products, fetch the current user, load product data with populated category references, map embedded media files with sort order, check wishlist status, retrieve approved reviews with user details, find the user's own review if it exists, and fetch related and suggested products based on category overlap and featured status. The submitReview server action will switch from Supabase upsert logic to Mongoose findOneAndUpdate or create operations.

Now I'm planning converter functions to transform product documents into the shop format. I'll create a shared service module that exports a toShopProduct function mapping Mongoose documents to the interface needed by product cards, extracting fields like ID, name, slug, pricing, thumbnail, and stock. Then I need to rewrite the shop page itself by removing legacy code and updating the category and product queries.

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\shop\page.tsx
308 lines
I need to verify that the required dependencies exist—toShopProduct from lib/services/product.ts, plus the Pagination and ShopSortSelect components—then create the product service file with the conversion function.

Globpattern: "lib/services/product.ts"
No files found
Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\Product.ts
I'm creating a product service module that converts data into the shop product format.

Write C:\Users\admin\Desktop\Varun\mannequincare.in\lib\services\product.ts
25 lines
Now let's check the Pagination and ShopSortSelect component prop signatures to ensure compatibility.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\pagination.tsx
Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\shop-sort-select.tsx
The sort options are compatible since ShopSortSelect's "newest" default maps to my switch statement's default case, which handles price sorting while falling back correctly. Now I'm moving on to rewrite the OurProducts component.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\OurProducts.tsx
Write C:\Users\admin\Desktop\Varun\mannequincare.in\components\OurProducts.tsx
45 lines
Now let's read app/products/[slug]/page.tsx (the most complex one) and the relevant models needed for the rewrite.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\products\[slug]\page.tsx
I should check the field names in the ProductReview.ts and WishlistItem.ts models to ensure consistency.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\ProductReview.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\WishlistItem.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\ProductCategory.ts
I need to examine the prop signatures for ProductGallery and ProductActions, and also check what shape getCurrentUser returns from the auth helpers.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\components\product-gallery.tsx
Bash
IN
grep -n "export" "C:\Users\admin\Desktop\Varun\mannequincare.in\lib\auth-helpers.ts" | head -30

OUT
7:export async function getCurrentUser() {
16:export async function requireStaff() {
28:export async function requireAdmin() {
Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\auth-helpers.ts
I'm setting up the product detail page with Mongoose, planning out the metadata generation to fetch the product name, description, and thumbnail, then building the main page component to get the current user and query the product with its category relationships populated.

I'll need to fetch the media gallery sorted by order, check if the product is in the user's wishlist, pull approved reviews with user details, get the user's own review if they've written one, and query for related and suggested products. I'm also planning to add a server action for submitting reviews.

For the display layer, I'll create converter functions to map the Mongoose documents to the format the markup expects, keeping the changes minimal by working with camelCase fields directly.

Writing the page component...

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\products\[slug]\page.tsx
525 lines
Now let's read the blog pages to complete the survey for this group.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\blog\page.tsx
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\blog\[slug]\page.tsx
Let me check the BlogPost model fields before rewriting these.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\BlogPost.ts
Now let's rewrite app/blog/page.tsx:

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\blog\page.tsx
209 lines
Now app/blog/[slug]/page.tsx:

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\blog\[slug]\page.tsx
230 lines
Now let's verify there are no remaining Supabase references in this group of files.

Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\shop\page.tsx)
1 line of output
Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\products\[slug]\page.tsx)
1 line of output
Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\blog)
1 line of output
Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\components\OurProducts.tsx)
1 line of output
All clean. Let me mark group 6 complete and move to group 7 — the admin server actions.

Update Todos

Survey Phase 1 models and existing Supabase usage sites for Phase 4

Rewrite lib/services/{cart,wishlist,order,address}.ts to Mongoose

Add lib/auth-client.ts session helper for client components

Rewrite cart/checkout/wishlist/orders pages + cart-item-row, shop-product-card, product-actions, address-manager, checkout-form components

Rewrite Header.tsx and account/orders/order-confirmation pages

Rewrite shop, products/[slug], blog pages and OurProducts component

Rewrite admin server actions (products,orders,categories,blogs,reviews,users,settings)

Rewrite admin pages (dashboard, products, orders, categories, blogs, reviews, users, settings)

Rewrite app/api/orders/route.ts with Mongoose session transaction

Verify build/typecheck and smoke-test Phase 4
I need to correct that—item 10 shouldn't be marked as done since the build and typecheck haven't actually run yet.

Update Todos

Survey Phase 1 models and existing Supabase usage sites for Phase 4

Rewrite lib/services/{cart,wishlist,order,address}.ts to Mongoose

Add lib/auth-client.ts session helper for client components

Rewrite cart/checkout/wishlist/orders pages + cart-item-row, shop-product-card, product-actions, address-manager, checkout-form components

Rewrite Header.tsx and account/orders/order-confirmation pages

Rewrite shop, products/[slug], blog pages and OurProducts component

Rewrite admin server actions (products,orders,categories,blogs,reviews,users,settings)

Rewrite admin pages (dashboard, products, orders, categories, blogs, reviews, users, settings)

Rewrite app/api/orders/route.ts with Mongoose session transaction

Verify build/typecheck and smoke-test Phase 4
Now let's find and survey all the admin server actions files.

Globpattern: "app/(admin)/admin/**/actions.ts"
Found 7 files
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\actions.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\categories\actions.ts
Now let's rewrite products/actions.ts:

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\actions.ts
144 lines
Now categories/actions.ts:

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\categories\actions.ts
79 lines
Now let's read the remaining actions files: orders, blogs, reviews, users, settings.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\orders\actions.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\blogs\actions.ts
I need to understand how the Order and User models are structured, particularly since the email field has moved from being nested in metadata to a direct field on the User model. Let me look at the User.ts model to see how this affects the orders actions implementation.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\Order.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\User.ts
Now let's rewrite orders/actions.ts:

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\orders\actions.ts
85 lines
Now blogs/actions.ts:

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\blogs\actions.ts
88 lines
Now let's read reviews, users, settings actions:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\reviews\actions.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\users\actions.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\settings\actions.ts
I'm looking at the fields in the SiteSetting model to understand what data I'm working with.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\SiteSetting.ts
Now let's write the reviews, users, and settings actions:

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\reviews\actions.ts
27 lines
Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\users\actions.ts
23 lines
Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\settings\actions.ts
48 lines
All 7 admin server action files are converted. Let's verify there are no remaining Supabase references in any of these:

Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\actions.ts)
1 line of output
Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\categories\actions.ts)
1 line of output
Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\orders\actions.ts)
1 line of output
Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\blogs\actions.ts)
1 line of output
Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\reviews\actions.ts)
1 line of output
Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\users\actions.ts)
1 line of output
Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\settings\actions.ts)
1 line of output
All admin server actions converted. Let's mark item 7 complete and move to item 8 — admin pages.

Update Todos

Survey Phase 1 models and existing Supabase usage sites for Phase 4

Rewrite lib/services/{cart,wishlist,order,address}.ts to Mongoose

Add lib/auth-client.ts session helper for client components

Rewrite cart/checkout/wishlist/orders pages + cart-item-row, shop-product-card, product-actions, address-manager, checkout-form components

Rewrite Header.tsx and account/orders/order-confirmation pages

Rewrite shop, products/[slug], blog pages and OurProducts component

Rewrite admin server actions (products,orders,categories,blogs,reviews,users,settings)

Rewrite admin layout and pages (dashboard, products, orders, categories, blogs, reviews, users, settings)

Rewrite app/api/orders/route.ts with Mongoose session transaction

Verify build/typecheck and smoke-test Phase 4
Now let's find all admin pages with Supabase usage:

Bash
IN
cd "/c/Users/admin/Desktop/Varun/mannequincare.in" && grep -rln "supabase\|createClient\|createAdminClient\|@supabase" "app/(admin)" 2>/dev/null

OUT
app/(admin)/admin/blogs/page.tsx
app/(admin)/admin/blogs/[id]/page.tsx
app/(admin)/admin/categories/page.tsx
app/(admin)/admin/categories/[id]/page.tsx
app/(admin)/admin/orders/page.tsx
app/(admin)/admin/page.tsx
app/(admin)/admin/products/new/page.tsx
app/(admin)/admin/products/page.tsx
app/(admin)/admin/products/[id]/page.tsx
app/(admin)/admin/reviews/page.tsx
app/(admin)/admin/settings/page.tsx
app/(admin)/admin/users/page.tsx
I need to check the full admin directory structure to see all the files involved, including the blogs/new subdirectory and its layout file.

Bash
IN
cd "/c/Users/admin/Desktop/Varun/mannequincare.in" && grep -rln "supabase\|createClient\|createAdminClient\|@supabase" "app/(admin)" --include="*.tsx" 2>/dev/null; echo "---layout---"; grep -ln "supabase\|createClient\|@supabase" "app/(admin)/admin/layout.tsx" 2>/dev/null; echo "---new---"; ls "app/(admin)/admin/products/new/" "app/(admin)/admin/blogs/new/" 2>/dev/null

OUT
app/(admin)/admin/blogs/page.tsx
app/(admin)/admin/blogs/[id]/page.tsx
app/(admin)/admin/categories/page.tsx
app/(admin)/admin/categories/[id]/page.tsx
app/(admin)/admin/orders/page.tsx
app/(admin)/admin/page.tsx
app/(admin)/admin/products/new/page.tsx
app/(admin)/admin/products/page.tsx
app/(admin)/admin/products/[id]/page.tsx
app/(admin)/admin/reviews/page.tsx
app/(admin)/admin/settings/page.tsx
app/(admin)/admin/users/page.tsx
---layout---
---new---
app/(admin)/admin/blogs/new/:
page.tsx

app/(admin)/admin/products/new/:
page.tsx
Layout.tsx is already converted with no Supabase references, confirming it was handled in the previous work. The admin blogs new page also shows as modified and the grep search didn't flag it, so it's likely already been converted too.

Now I need to go through each remaining admin page file, starting with the main dashboard at app/(admin)/admin/page.tsx.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\page.tsx
Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\page.tsx
145 lines
Now let's read products pages (page.tsx, [id]/page.tsx, new/page.tsx):

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\page.tsx
Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\page.tsx
190 lines
Now let's read products/[id]/page.tsx and products/new/page.tsx:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\[id]\page.tsx
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\[id]\page.tsx
Added 2 lines
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\[id]\page.tsx
Added 15 lines
Now let's check the mainCategoryId/subCategoryId defaultValue references in the JSX still use product.main_category_id ?? "" — let's verify that's compatible (it's now "" already, fine). Let's read products/new/page.tsx:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\new\page.tsx
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\new\page.tsx
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\products\new\page.tsx
Added 3 lines
Now let's look at categories pages:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\categories\page.tsx
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\categories\[id]\page.tsx
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\categories\page.tsx
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\categories\page.tsx
Added 3 lines
Now let's rewrite categories/[id]/page.tsx:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\categories\[id]\page.tsx
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\categories\[id]\page.tsx
Added 7 lines
Now let's read the orders page:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\orders\page.tsx
I need to switch this over to Mongoose, where the order items are stored as embedded documents, so I can get the item count directly from the items array. The customer details like name, phone, and email will come from the related User model.

Write C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\orders\page.tsx
183 lines
Moving on to rewrite the remaining page files—blogs, blog details, reviews, settings, and users sections.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\blogs\page.tsx
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\blogs\[id]\page.tsx
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\blogs\new\page.tsx
I can skip the new page since it doesn't use Supabase, but I need to focus on rewriting the blogs pages to integrate Supabase instead.

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\blogs\page.tsx
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\blogs\page.tsx
Added 8 lines
Now the blog edit page:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\blogs\[id]\page.tsx
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\blogs\[id]\page.tsx
Added 8 lines
Now let's read reviews, settings, and users pages:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\reviews\page.tsx
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\settings\page.tsx
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\users\page.tsx
I need to work through the reviews, settings, and users pages next. For the reviews page, I'll need to populate the Product data since the ProductReview model likely has a productId field, along with userId, adminResponse, and createdAt. Let me start building out the reviews page component.

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\reviews\page.tsx
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\reviews\page.tsx
Added 9 lines
Now the settings page:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\settings\page.tsx
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\settings\page.tsx
Added 3 lines
Now the users page:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\users\page.tsx
Added 1 line
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\users\page.tsx
Added 5 lines
Now let's update the JSX that referenced metadata-derived email:

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\users\page.tsx
Modified
Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin)\admin\layout.tsx
Already converted. Now let's grep for any remaining Supabase references in the admin pages directory to confirm group 8 is complete:

Grep "supabase|createClient|@supabase" (in C:\Users\admin\Desktop\Varun\mannequincare.in\app\(admin), glob: **/*.tsx)
1 line of output
Group 8 (admin pages) is complete and verified clean. Let's update the todo list and move to item 9 — the orders API route with the mandated transaction safety:

Update Todos

Survey Phase 1 models and existing Supabase usage sites for Phase 4

Rewrite lib/services/{cart,wishlist,order,address}.ts to Mongoose

Add lib/auth-client.ts session helper for client components

Rewrite cart/checkout/wishlist/orders pages + cart-item-row, shop-product-card, product-actions, address-manager, checkout-form components

Rewrite Header.tsx and account/orders/order-confirmation pages

Rewrite shop, products/[slug], blog pages and OurProducts component

Rewrite admin server actions (products,orders,categories,blogs,reviews,users,settings)

Rewrite admin layout and pages (dashboard, products, orders, categories, blogs, reviews, users, settings)

Rewrite app/api/orders/route.ts with Mongoose session transaction

Verify build/typecheck and smoke-test Phase 4
Now let's read the current app/api/orders/route.ts:

Read C:\Users\admin\Desktop\Varun\mannequincare.in\app\api\orders\route.ts
I need to look at the Order and Product models to see how decrementStock works and what the Order schema expects for items, plus check the CartItem model structure.

Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\Order.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\Product.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\CartItem.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\auth-helpers.ts
Read C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\connect.ts
I'm setting up the new orders route using Mongoose sessions and transactions. I need to get the current user, generate an order number, create the order with a session, then handle stock decrements for each product—though I'm realizing the decrementStock method doesn't currently accept a session parameter, so I'll need to modify how that update is called to pass the session through.

Grep "decrementStock" (in C:\Users\admin\Desktop\Varun\mannequincare.in)
3 lines of output
I need to update the Product.ts file to make the session parameter optional in the static method so it can work properly within transactions, since right now it's only defined in the type but not actually being used anywhere except potentially in the orders route.

Edit C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\Product.ts
Modified
Edit C:\Users\admin\Desktop\Varun\mannequincare.in\lib\db\models\Product.ts
Added 4 lines
You've hit your session limit · resets 2:30pm (Asia/Calcutta)


above is the chat hostory

and this was the plan
Ready for review
Select text to add comments on the plan
Migrate mannequincare.in from Supabase → MongoDB + Cloudinary
Context
The app currently runs entirely on Supabase: Postgres (11 tables, RLS policies, triggers, RPC functions like is_admin()/decrement_stock()), Supabase Auth (cookie-based sessions, profiles table sync), and Supabase Storage (product/blog image buckets with RLS-gated upload policies). The user wants to move the database to MongoDB and image hosting/CDN to Cloudinary, with credentials for both already present in .env.local (NEXT_MONGO_URL, CLOUDINARY_*).

Decisions confirmed with the user:

Auth: Auth.js (NextAuth v5) + @auth/mongodb-adapter, Credentials provider (email/password), JWT session strategy (required for Credentials).
Data access: Mongoose (schema validation + .populate() for relations, replacing Postgres FK joins and set_updated_at/handle_new_user triggers via timestamps: true and hooks).
Data: Starting fresh in MongoDB — no export/migration script needed; just a new seed script mirroring supabase/seed.sql's 3 categories / 13 subcategories / 44 products.
This is a full backend swap touching ~61 files. The plan below groups them by pattern (the conversion is mechanically similar within each group) rather than listing every file/line.

Phase 0 — Dependencies & config
Install: mongodb, mongoose, next-auth@beta, @auth/mongodb-adapter, bcryptjs (+@types/bcryptjs), cloudinary Remove: @supabase/ssr, @supabase/supabase-js

.env.example — replace Supabase vars with:

MONGODB_URI=
AUTH_SECRET=
AUTH_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
(keep Razorpay/Gmail vars as-is — unrelated to this migration)

next.config.ts — replace the qkbmccglvkhiidmvesqf.supabase.co remotePattern with res.cloudinary.com.

Phase 1 — MongoDB connections & Mongoose models
lib/mongodb.ts — cached native MongoClient singleton (the globalThis pattern, like the existing lib/supabase/client.ts singleton) for the Auth.js MongoDB adapter.
lib/db/connect.ts — cached Mongoose connect() singleton (same globalThis caching pattern, required for Next.js dev hot-reload).
lib/db/models/*.ts — one Mongoose model per collection, with { timestamps: true } replacing set_updated_at:
User — merges auth.users + profiles into one collection (email, passwordHash, displayName, role enum [customer/staff/admin], phone, avatarUrl, metadata). Eliminates the need for handle_new_user/handle_user_update sync triggers entirely.
Address — userId ref, type enum, name/phone/street/city/state/postalCode/country, isDefault (mirrors lib/services/address.ts shape)
ProductCategory — name, slug, description, parentId (self-ref)
Product — name, slug, description, sku, price, compareAtPrice, stock, mainCategoryId/subCategoryId refs, status enum, isFeatured, thumbnailUrl, thumbnailPublicId (Cloudinary), media: [{url, publicId, altText, sortOrder}] (embeds product_media), createdBy ref
Order — orderNumber, userId ref (nullable for guests), status/paymentStatus enums, totals, billingAddress/shippingAddress (embedded objects), items: [{productId, quantity, unitPrice, lineTotal, productSnapshot}] (embeds order_items — matches the existing select("*, items:order_items(*)") always-fetched-together pattern, so no populate needed for items)
BlogPost — title, slug, excerpt, content, coverImageUrl/coverImagePublicId, status enum, tags[], authorId ref, publishedAt
ProductReview — productId/userId refs, rating, title, body, status enum, adminResponse
SiteSetting — key (unique), value (Mixed)
CartItem / WishlistItem — userId/productId refs + compound unique index (replaces the Postgres unique(user_id, product_id) constraint and 23505 error handling)
A static helper on Product, e.g. Product.decrementStock(id, qty), using findByIdAndUpdate with a pipeline update ($max: [0, {$subtract: ['$stock', qty]}]) replaces the decrement_stock RPC.
Phase 2 — Auth (Auth.js v5)
auth.ts (project root) — NextAuth({ adapter: MongoDBAdapter(client), session: { strategy: "jwt" }, providers: [Credentials({ authorize: ... })], callbacks: { jwt, session } }). The authorize callback looks up User by email via Mongoose, compares password with bcrypt.compare, returns {id, email, role, name}. jwt/session callbacks propagate id+role onto session.user (replacing the profiles.role lookups sprinkled through login-form.tsx/admin/layout.tsx).
app/api/auth/[...nextauth]/route.ts — export const { GET, POST } = handlers
app/api/auth/register/route.ts — new endpoint (Auth.js doesn't handle registration): validates input, hashes password with bcryptjs, creates User doc. Replaces supabase.auth.signUp.
Password reset (replaces resetPasswordForEmail/verifyOtp/updateUser): app/api/auth/forgot-password/route.ts generates a random token, stores {tokenHash, userId, expiresAt} (a small PasswordResetToken model or reuse Auth.js's verificationtokens collection via the adapter), emails the reset link via the existing lib/services/email.ts (nodemailer — untouched). New app/auth/reset-password/[token]/page.tsx + form validates the token and writes a new passwordHash.
Helper: lib/auth-helpers.ts exporting requireAdmin()/getCurrentUser() wrapping Auth.js's auth() — the single replacement for both supabase.auth.getUser() and the is_admin() RPC/RLS checks scattered through every admin server action.
Middleware: rewrite middleware.ts using Auth.js's auth wrapper (export { auth as middleware } from "@/auth" + a callback checking req.auth?.user.role against the same protected-route list /account, /checkout, /admin, /order-confirmation, redirecting to /auth/login?next=... like today). Delete lib/supabase/middleware.ts.
Components (mechanical rewrites, same UI/markup):
login-form.tsx → signIn("credentials", { email, password, redirect: false }), then route by session.user.role
sign-up-form.tsx → fetch("/api/auth/register", ...) then signIn
forgot-password-form.tsx → POST to /api/auth/forgot-password
update-password-form.tsx → replace with the new reset-password form (token-based, not session-based)
logout-button.tsx → signOut()
auth-button.tsx → auth() / useSession()
Delete: app/auth/confirm/route.ts (Supabase OTP email-confirmation callback — not used by the new Credentials flow)
Phase 3 — Image uploads (Cloudinary)
lib/cloudinary.ts — cloudinary.config({ cloud_name, api_key, api_secret })
app/api/upload/route.ts — POST (and DELETE): checks requireAdmin(), validates type/size (mirrors current 5 MB / jpeg-png-webp-gif checks), uploads the buffer via cloudinary.uploader.upload_stream into folders equivalent to today's buckets (product-images/thumbnails, blog-images/covers), returns { url: secure_url, publicId: public_id }. DELETE calls cloudinary.uploader.destroy(publicId).
components/image-upload.tsx — replace the supabase.storage.from(bucket).upload() + getPublicUrl() block with a fetch("/api/upload", { method: "POST", body: formData }) call; store both url and publicId (two hidden inputs) so admin forms can pass the Cloudinary publicId through to the Product/BlogPost documents and the remove button can call DELETE /api/upload.
Delete: supabase/storage-setup.sql (and the rest of supabase/, see Phase 5)
Phase 4 — Data-layer rewrite (Supabase query-builder → Mongoose)
This is the bulk of the work, but the conversions are mechanical and repeat the same handful of patterns across all ~50 files:

Supabase pattern	Mongoose equivalent
.from(t).select(c).eq(k,v).single()/.maybeSingle()	Model.findOne({k:v}).select(c)
.select(c, {count:'exact', head:true})	Model.countDocuments(filter)
.range(offset, offset+size-1)	.skip(offset).limit(size)
.select("*, items:order_items(*)") (embedded join)	direct field access — items is now embedded on Order, no populate
.select("product:product_id(name, price, ...)") (FK join)	.populate('productId', 'name price thumbnailUrl stock')
.or("name.ilike.%x%,slug.ilike.%x%")	{ $or: [{name: {$regex: x, $options:'i'}}, {slug: {...}}] }
.rpc('decrement_stock', {...})	Product.decrementStock(id, qty) (Phase 1 static)
supabase.auth.getUser() + is_admin()/RLS check	requireAdmin()/getCurrentUser() (Phase 2)
error.code === '23505' (unique violation)	Mongoose duplicate-key error err.code === 11000
error.code === 'PGRST116' (no row)	findOne returning null
Files to convert, grouped:

Service layer — lib/services/{cart,wishlist,order,address}.ts: drop the SupabaseClient parameter, call Mongoose models directly (these are already nicely isolated, so this is the cleanest group to start with and validates the model design)
Admin server actions — app/(admin)/admin/{products,orders,categories,blogs,reviews,users,settings}/actions.ts: swap createClient()/createAdminClient() for requireAdmin() + Mongoose calls; revalidatePath calls stay as-is
Server-component pages fetching data — app/(admin)/admin/{page,products/*,orders,categories/*,blogs/*,reviews,users,settings}/page.tsx and customer-facing app/{shop,products/[slug],account,orders,cart,wishlist,blog/*,order-confirmation/[id]}/page.tsx
Data-fetching components — components/{OurProducts,Header,shop-product-card,product-actions,checkout-form,address-manager}.tsx
app/(admin)/admin/layout.tsx — replace getUser() + profiles lookup with auth()/requireAdmin() (role now lives directly on the User doc — no separate profile fetch)
app/api/orders/route.ts — replace createClient()/createAdminClient() with getCurrentUser() (optional, guests allowed) + Mongoose Order.create()/Product.decrementStock()/CartItem.deleteMany(); nodemailer email calls stay untouched
Phase 5 — Cleanup (delete Supabase-only files)
lib/supabase/ — entire folder (client.ts, server.ts, admin.ts, middleware.ts)
supabase/ — entire folder (schema.sql, seed.sql, storage-setup.sql)
app/api/test-rls/route.ts, app/test-admin/route.ts — Supabase RLS debug routes
app/protected/ and components/tutorial/ — leftover Supabase starter-template boilerplate (confirmed unused outside each other)
app/auth/confirm/route.ts — Supabase OTP confirmation callback (Phase 2)
lib/utils.ts — remove the now-unused hasEnvVars Supabase env check
Phase 6 — Seed script
New scripts/seed.ts (run via tsx scripts/seed.ts or an npm script) — connects via lib/db/connect.ts and inserts the same data set as supabase/seed.sql (3 main categories → 13 subcategories → 44 products: 12 Face Care / 24 Body Care / 8 Hair Care, same names/SKUs/prices), adapted to Mongoose (ObjectId refs instead of RETURNING id INTO, embedded media[] instead of separate product_media rows).
Verification
npm run build — confirm no leftover @supabase/* imports / type errors
Run scripts/seed.ts against the MongoDB URI in .env.local, confirm 3 categories / 13 subcategories / 44 products in the DB
Manual smoke test through the dev server:
Sign up → role-based redirect → log out → log in → forgot/reset password
Browse /shop, product detail, add to cart/wishlist, checkout (COD + Razorpay), confirm order email
Admin: log in as admin/staff, create/edit a product with an image upload (verify it lands in Cloudinary and renders via the new res.cloudinary.com remote pattern), edit categories/blogs/orders/reviews, confirm dashboard stats
Confirm /admin, /account, /checkout, /order-confirmation route protection still redirects unauthenticated users

which was approve 
he plan is approved with these corrections. Implement in strict phase gates — complete each phase, show me the result, then wait for my explicit "proceed" before the next phase.
Phase 0 only first. Show me the updated package.json and .env.example after completing it. Do not touch any other files.
Before you begin any phase, apply these corrections across the full implementation:

Order transaction safety: In app/api/orders/route.ts, wrap the entire order creation flow (Order.create(), Product.decrementStock(), CartItem.deleteMany()) in a Mongoose session transaction using session.startTransaction() / session.commitTransaction() / session.abortTransaction() in a try/finally block. This requires MongoDB replica set mode — Atlas free tier supports it.
Cloudinary DELETE security: In DELETE /api/upload, do NOT destroy based on the publicId from the request body alone. First fetch the relevant Product or BlogPost document from MongoDB and verify its stored thumbnailPublicId or coverImagePublicId matches the incoming publicId. Only then call cloudinary.uploader.destroy(). Reject with 403 if it doesn't match.
Auth.js ObjectId wiring: In the authorize callback, return { id: user._id.toString(), email: user.email, role: user.role, name: user.displayName }. In the jwt callback, store token.id = user.id (not token.sub). In the session callback, set session.user.id = token.id as string. Never use token.sub for MongoDB ObjectId lookups anywhere in the codebase.
Password reset token: Use a dedicated Mongoose model PasswordResetToken with schema { tokenHash: String, userId: ObjectId ref User, expiresAt: Date } and a TTL index { expiresAt: 1 }, { expireAfterSeconds: 0 }. Do NOT use or extend the Auth.js adapter's verificationtokens collection.
Role granularity: Create two auth helpers — requireAdmin() (role === 'admin' only) and requireStaff() (role === 'admin' OR role === 'staff'). Apply them as follows: products, orders, categories, blogs, reviews admin actions → requireStaff(). Users and settings admin actions → requireAdmin(). Do not use a single requireAdmin() everywhere.
Phase gates (non-negotiable): Do Phase 0 → stop. Phase 1 (models only) → stop. Phase 2 (auth only, including smoke-test instructions) → stop. Phase 3 (Cloudinary) → stop. Phase 4 (data layer rewrite) → stop. Phase 5 (cleanup + seed) → stop. Do not proceed to the next phase without my explicit "proceed" message.

Do not change anything else.







o the ai agent got stop in the mid way of phase 5
now tell me what he was about to do?




