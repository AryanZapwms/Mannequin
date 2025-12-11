"use client";

import { useState } from "react";
import { X, Mail } from "lucide-react";

interface BulkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkOrderModal({ isOpen, onClose }: BulkOrderModalProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subject = "Bulk Order Inquiry";
    const body = `Hello,\n\nI would like to place a bulk order for Mannequin Care products.\n\nMessage: ${message}\n\nPlease contact me at: ${email}`;
    
    window.location.href = `mailto:sales@mannequincare.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setMessage("");
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-2 text-2xl font-semibold">Bulk Order?</h2>
        <p className="mb-6 text-gray-600">
          For orders exceeding 5 products, please contact our sales team for special pricing and arrangements.
        </p>

        {submitted ? (
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-green-700">
              Thank you! Our sales team will contact you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your bulk order needs..."
                rows={4}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 font-medium text-white hover:bg-gray-800"
            >
              <Mail className="h-4 w-4" />
              Contact Sales Team
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
