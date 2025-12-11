export interface GuestCartItem {
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    thumbnail_url?: string;
    stock: number;
  };
}

const GUEST_CART_KEY = "guest_cart";

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem(GUEST_CART_KEY);
  return cart ? JSON.parse(cart) : [];
}

export function saveGuestCart(items: GuestCartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function addToGuestCart(productId: string, quantity: number = 1, product?: GuestCartItem["product"]): void {
  const cart = getGuestCart();
  const existingItem = cart.find((item) => item.product_id === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ product_id: productId, quantity, product });
  }

  saveGuestCart(cart);
}

export function removeFromGuestCart(productId: string): void {
  const cart = getGuestCart();
  const filtered = cart.filter((item) => item.product_id !== productId);
  saveGuestCart(filtered);
}

export function updateGuestCartQuantity(productId: string, quantity: number): void {
  const cart = getGuestCart();
  const item = cart.find((item) => item.product_id === productId);

  if (item) {
    if (quantity <= 0) {
      removeFromGuestCart(productId);
    } else {
      item.quantity = quantity;
      saveGuestCart(cart);
    }
  }
}

export function clearGuestCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
}

export function getGuestCartCount(): number {
  return getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
}

export function getGuestCartTotal(productsData: Record<string, { price: number }>): number {
  return getGuestCart().reduce((total, item) => {
    const product = productsData[item.product_id];
    return total + (product?.price || 0) * item.quantity;
  }, 0);
}
