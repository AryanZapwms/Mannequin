"use client";

import { useState, useEffect } from "react";
import { getSessionUser } from "@/lib/auth-client";
import type { UserAddress } from "@/lib/services/address";
import type { CartItem } from "@/lib/services/cart";

interface CheckoutFormProps {
  cartItems: CartItem[];
  total: number;
  onSubmit: (data: CheckoutData) => Promise<void>;
  loading?: boolean;
}

export interface CheckoutData {
  shippingAddressId: string | "new";
  billingAddressId?: string | "new";
  paymentMethod: "razorpay" | "cod";
  shippingAddress?: Omit<UserAddress, "id" | "user_id" | "type" | "created_at" | "updated_at">;
}

export function CheckoutForm({
  cartItems,
  total,
  onSubmit,
  loading: isLoading = false,
}: CheckoutFormProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string | "new">("new");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
  });

  useEffect(() => {
    const loadAddresses = async () => {
      const user = await getSessionUser();
      if (user) {
        setUserId(user.id);
        try {
          const res = await fetch("/api/addresses?type=shipping");
          if (!res.ok) throw new Error("Failed to load addresses");
          const { addresses: userAddresses } = await res.json();
          setAddresses(userAddresses ?? []);
          if (userAddresses?.length > 0) {
            setSelectedAddress(userAddresses[0].id);
            setShowNewAddressForm(false);
          } else {
            setShowNewAddressForm(true);
          }
        } catch (error) {
          console.error("Error loading addresses:", error);
          setShowNewAddressForm(true);
        }
      }
      setLoading(false);
    };

    void loadAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let addressId = selectedAddress;
    let newAddress: CheckoutData["shippingAddress"] | undefined;

    if (selectedAddress === "new") {
      if (!formData.full_name || !formData.phone || !formData.street_address) {
        alert("Please fill in all required fields");
        return;
      }

      try {
        if (userId) {
          const res = await fetch("/api/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "shipping",
              full_name: formData.full_name,
              phone: formData.phone,
              street_address: formData.street_address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.postal_code,
              country: "India",
              is_default: addresses.length === 0,
            }),
          });
          if (!res.ok) throw new Error("Failed to create address");
          const { address } = await res.json();
          addressId = address.id;
        }
      } catch (error) {
        console.error("Error creating address:", error);
        alert("Failed to create address");
        return;
      }
    }

    await onSubmit({
      shippingAddressId: addressId,
      paymentMethod,
    });
  };

  if (loading) {
    return <div>Loading checkout...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Shipping Address</h3>

        {addresses.length > 0 && !showNewAddressForm && (
          <div className="mb-4 space-y-2">
            {addresses.map((address) => (
              <label key={address.id} className="flex items-start gap-3">
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={selectedAddress === address.id}
                  onChange={() => setSelectedAddress(address.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium">{address.full_name}</p>
                  <p className="text-sm text-gray-600">
                    {address.street_address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.postal_code}
                  </p>
                  <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {(showNewAddressForm || selectedAddress === "new") && (
          <div className="space-y-4 rounded-lg border border-gray-300 p-4">
            <div>
              <label className="block text-sm font-medium">Full Name *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.street_address}
                onChange={(e) =>
                  setFormData({ ...formData, street_address: e.target.value })
                }
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">State *</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Postal Code *</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
        )}

        {addresses.length > 0 && !showNewAddressForm && (
          <button
            type="button"
            onClick={() => {
              setShowNewAddressForm(true);
              setSelectedAddress("new");
            }}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Use a different address
          </button>
        )}
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Payment Method</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="payment"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={() => setPaymentMethod("razorpay")}
            />
            <span>Razorpay (Online Payment)</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            <span>Cash on Delivery</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? "Processing..." : `Place Order - ₹${total.toFixed(2)}`}
      </button>
    </form>
  );
}
