"use client";

import { X, Building2, User, Mail, Phone, MapPin, Globe, FileText } from "lucide-react";
import type { CompanyOrder } from "../types/orders";

interface CompanyOrderModalProps {
  order: CompanyOrder;
  onClose: () => void;
}

export default function CompanyOrderModal({ order, onClose }: CompanyOrderModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Building2 className="text-primary" size={28} />
              Company Order Details
            </h2>
            <p className="text-gray-400 text-sm mt-1">Order ID: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                order.confirmed
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {order.confirmed ? "Confirmed" : "Pending"}
            </span>
            <span className="text-gray-400 text-sm">
              Created: {new Date(order.created_at).toLocaleString()}
            </span>
          </div>

          {/* Company Information */}
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-primary" />
              Company Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Company Name</p>
                <p className="text-white font-medium">{order.company_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Industry</p>
                <p className="text-white font-medium">{order.industry || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Website</p>
                <p className="text-white font-medium">
                  {order.website ? (
                    <a
                      href={order.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <Globe size={14} />
                      {order.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Registration Number</p>
                <p className="text-white font-medium">{order.registration_number || "—"}</p>
              </div>
            </div>
          </div>

          {/* Tax & Legal Information */}
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Tax & Legal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Tax ID</p>
                <p className="text-white font-medium font-mono">{order.tax_id || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">NIF (Algerian Tax ID)</p>
                <p className="text-white font-medium font-mono">{order.nif || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">RC (Commercial Register)</p>
                <p className="text-white font-medium font-mono">{order.rc || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">ART (Tax Article)</p>
                <p className="text-white font-medium font-mono">{order.art || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">NIC (Commercial ID)</p>
                <p className="text-white font-medium font-mono">{order.nic || "—"}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User size={20} className="text-primary" />
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Contact Person</p>
                <p className="text-white font-medium">{order.person_name || order.contact_person || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Contact Title</p>
                <p className="text-white font-medium">{order.contact_title || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                  <Mail size={14} />
                  Email
                </p>
                <p className="text-white font-medium">
                  <a href={`mailto:${order.email}`} className="text-primary hover:underline">
                    {order.email}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1 flex items-center gap-1">
                  <Phone size={14} />
                  Phone
                </p>
                <p className="text-white font-medium">
                  <a href={`tel:${order.phone}`} className="text-primary hover:underline">
                    {order.phone}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              Address
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-gray-400 text-sm mb-1">Street Address</p>
                <p className="text-white font-medium">{order.address || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">City</p>
                <p className="text-white font-medium">{order.city || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Postal Code</p>
                <p className="text-white font-medium">{order.postal_code || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Country</p>
                <p className="text-white font-medium">{order.country || "—"}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Order Items</h3>
            {order.order_items && order.order_items.length > 0 ? (
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">Product ID: {item.product_id}</p>
                      <p className="text-gray-400 text-sm">Item ID: {item.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No items in this order</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
