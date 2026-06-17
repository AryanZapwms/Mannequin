"use client";

import { useEffect, useState } from "react";
import type { UserAddress } from "@/lib/services/address";
import { MapPin, Plus, Trash2, Star, Pencil, Check, X } from "lucide-react";

const inputClasses =
  "w-full rounded-lg border border-brand-sand bg-brand-cream/40 px-4 py-2.5 font-body text-sm text-brand-espresso transition-all focus:border-brand-gold-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold-200";

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

  const resetForm = () => {
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
  };

  if (loading) {
    return (
      <div className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-sand border-t-brand-gold-500" />
          <p className="font-sub text-sm text-brand-mocha">Loading addresses…</p>
        </div>
      </div>
    );
  }

  const shippingAddresses = addresses.filter((a) => a.type === "shipping");
  const billingAddresses = addresses.filter((a) => a.type === "billing");

  return (
    <div className="rounded-card border border-brand-sand bg-white p-5 shadow-soft sm:p-7">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-brand-espresso sm:text-xl">
          <MapPin className="h-5 w-5 text-brand-copper" strokeWidth={1.75} />
          Saved Addresses
        </h3>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded bg-brand-gold-500 px-5 py-2.5 font-sub text-xs font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Address
          </button>
        )}
      </div>

      {/* ── Address Form ────────────────────────────────────── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 space-y-4 rounded-card border border-brand-sand bg-brand-cream/40 p-5 sm:p-6"
        >
          <h4 className="font-sub text-xs font-semibold uppercase tracking-[0.12em] text-brand-copper">
            {editingId ? "Edit Address" : "New Address"}
          </h4>

          <div>
            <label className="mb-1.5 block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
              Address Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              disabled={!!editingId}
              className={`${inputClasses} disabled:opacity-50`}
            >
              <option value="shipping">Shipping</option>
              <option value="billing">Billing</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                Full Name <span className="text-brand-copper">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                placeholder="Your full name"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                Phone <span className="text-brand-copper">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+91 98765 43210"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
              Street Address <span className="text-brand-copper">*</span>
            </label>
            <input
              type="text"
              value={formData.street_address}
              onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
              required
              placeholder="House no., Street name, Area"
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                City <span className="text-brand-copper">*</span>
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                placeholder="City"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="mb-1.5 block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                State <span className="text-brand-copper">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                placeholder="State"
                className={inputClasses}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block font-sub text-[11px] font-medium uppercase tracking-[0.1em] text-brand-mocha">
                Postal Code <span className="text-brand-copper">*</span>
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                required
                placeholder="400001"
                className={inputClasses}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="h-4 w-4 rounded border-brand-sand text-brand-gold-500 focus:ring-brand-gold-300"
            />
            <span className="font-sub text-xs text-brand-mocha">Set as default address</span>
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded bg-brand-gold-500 px-6 py-3 font-sub text-xs font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-600 hover:shadow-gold"
            >
              <Check className="h-3.5 w-3.5" />
              {editingId ? "Update Address" : "Save Address"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded border border-brand-sand px-6 py-3 font-sub text-xs font-semibold uppercase tracking-[0.08em] text-brand-espresso transition-all duration-200 hover:bg-brand-cream hover:shadow-soft"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Address Cards ───────────────────────────────────── */}
      <div className="space-y-6">
        {/* Shipping */}
        {shippingAddresses.length > 0 && (
          <div>
            <h4 className="mb-3 font-sub text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-mocha">
              Shipping Addresses
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {shippingAddresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          </div>
        )}

        {/* Billing */}
        {billingAddresses.length > 0 && (
          <div>
            <h4 className="mb-3 font-sub text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-mocha">
              Billing Addresses
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {billingAddresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          </div>
        )}

        {addresses.length === 0 && !showForm && (
          <div className="rounded-thumb bg-brand-cream/60 p-6 text-center">
            <MapPin className="mx-auto mb-2 h-8 w-8 text-brand-sand" strokeWidth={1.5} />
            <p className="font-body text-sm text-brand-body">No addresses saved yet.</p>
            <p className="mt-1 font-body text-xs text-brand-mocha">
              Add a shipping or billing address to speed up checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Individual address card ──────────────────────────────────── */
function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: UserAddress;
  onEdit: (address: UserAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string, type: "shipping" | "billing") => void;
}) {
  return (
    <div className="group relative rounded-thumb border border-brand-sand/80 bg-brand-cream/30 p-4 transition-all duration-200 hover:border-brand-gold-300 hover:shadow-soft">
      {/* Default badge */}
      {address.is_default && (
        <div className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-brand-gold-500 px-2.5 py-0.5 font-sub text-[10px] font-semibold uppercase tracking-wider text-brand-espresso shadow-sm">
          <Star className="h-2.5 w-2.5" fill="currentColor" />
          Default
        </div>
      )}

      <p className="font-display text-sm font-semibold text-brand-espresso">
        {address.full_name}
      </p>
      <p className="mt-1 font-body text-xs leading-relaxed text-brand-body">
        {address.street_address}
      </p>
      <p className="font-body text-xs text-brand-body">
        {address.city}, {address.state} {address.postal_code}
      </p>
      <p className="mt-1 font-mono text-[11px] text-brand-mocha">
        {address.phone}
      </p>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2 border-t border-brand-sand/60 pt-3">
        <button
          onClick={() => onEdit(address)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-sub text-[10px] font-medium uppercase tracking-wider text-brand-copper transition-colors hover:bg-brand-gold-50"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
        {!address.is_default && (
          <button
            onClick={() => onSetDefault(address.id, address.type)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-sub text-[10px] font-medium uppercase tracking-wider text-brand-copper transition-colors hover:bg-brand-gold-50"
          >
            <Star className="h-3 w-3" />
            Set Default
          </button>
        )}
        <button
          onClick={() => onDelete(address.id)}
          className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 font-sub text-[10px] font-medium uppercase tracking-wider text-brand-mocha/50 transition-colors hover:bg-brand-blush/30 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </div>
    </div>
  );
}
