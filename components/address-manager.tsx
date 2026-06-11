"use client";

import { useEffect, useState } from "react";
import type { UserAddress } from "@/lib/services/address";
import { Plus, Trash2, Star } from "lucide-react";

async function fetchAddresses(): Promise<UserAddress[]> {
  const res = await fetch("/api/addresses");
  if (!res.ok) throw new Error("Failed to load addresses");
  const { addresses } = await res.json();
  return addresses ?? [];
}

export function AddressManager() {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "shipping" as "shipping" | "billing",
    full_name: "",
    phone: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false,
  });

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setAddresses(await fetchAddresses());
      } catch (error) {
        console.error("Error loading addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadAddresses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const res = await fetch(`/api/addresses/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: formData.full_name,
            phone: formData.phone,
            street_address: formData.street_address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            is_default: formData.is_default,
          }),
        });
        if (!res.ok) throw new Error("Failed to update address");
        const { address: updated } = await res.json();
        setAddresses(addresses.map((a) => (a.id === editingId ? updated : a)));
        setEditingId(null);
      } else {
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: formData.type,
            full_name: formData.full_name,
            phone: formData.phone,
            street_address: formData.street_address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: "India",
            is_default: formData.is_default,
          }),
        });
        if (!res.ok) throw new Error("Failed to create address");
        const { address: created } = await res.json();
        setAddresses([...addresses, created]);
      }

      setFormData({
        type: "shipping",
        full_name: "",
        phone: "",
        street_address: "",
        city: "",
        state: "",
        postal_code: "",
        is_default: false,
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address");
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/addresses/${addressId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete address");
      setAddresses(addresses.filter((a) => a.id !== addressId));
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address");
    }
  };

  const handleEdit = (address: UserAddress) => {
    setFormData({
      type: address.type,
      full_name: address.full_name,
      phone: address.phone,
      street_address: address.street_address,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      is_default: address.is_default,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSetDefault = async (addressId: string, type: "shipping" | "billing") => {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set-default", type }),
      });
      if (!res.ok) throw new Error("Failed to set default address");
      setAddresses(await fetchAddresses());
    } catch (error) {
      console.error("Error setting default address:", error);
      alert("Failed to set default address");
    }
  };

  if (loading) {
    return <div>Loading addresses...</div>;
  }

  const shippingAddresses = addresses.filter((a) => a.type === "shipping");
  const billingAddresses = addresses.filter((a) => a.type === "billing");

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold">Saved Addresses</h3>

      {showForm ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg border border-gray-300 p-4">
          <div>
            <label className="block text-sm font-medium">Address Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              disabled={!!editingId}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="shipping">Shipping</option>
              <option value="billing">Billing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Full Name *</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Street Address *</label>
            <input
              type="text"
              value={formData.street_address}
              onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              />
              <span className="text-sm">Set as default</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 font-medium text-white hover:bg-gray-800"
            >
              {editingId ? "Update Address" : "Add Address"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({
                  type: "shipping",
                  full_name: "",
                  phone: "",
                  street_address: "",
                  city: "",
                  state: "",
                  postal_code: "",
                  is_default: false,
                });
              }}
              className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex items-center gap-2 rounded-md bg-black px-4 py-2 font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      )}

      <div className="space-y-6">
        {shippingAddresses.length > 0 && (
          <div>
            <h4 className="mb-3 font-medium">Shipping Addresses</h4>
            <div className="space-y-2">
              {shippingAddresses.map((address) => (
                <div key={address.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{address.full_name}</p>
                      <p className="text-sm text-gray-600">{address.street_address}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                      {address.is_default && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          <Star className="h-3 w-3" />
                          Default
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(address)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id, address.type)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {billingAddresses.length > 0 && (
          <div>
            <h4 className="mb-3 font-medium">Billing Addresses</h4>
            <div className="space-y-2">
              {billingAddresses.map((address) => (
                <div key={address.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{address.full_name}</p>
                      <p className="text-sm text-gray-600">{address.street_address}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                      {address.is_default && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          <Star className="h-3 w-3" />
                          Default
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(address)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id, address.type)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {addresses.length === 0 && !showForm && (
          <p className="text-gray-600">No addresses saved yet</p>
        )}
      </div>
    </div>
  );
}
