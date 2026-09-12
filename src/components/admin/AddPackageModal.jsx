import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Plane,
  Hotel,
  Coffee,
  Car,
  Compass,
  Check
} from 'lucide-react';

export default function AddPackageModal({
  isOpen,
  onClose,
  onSavePackage,
  packageToEdit = null
}) {
  const [formData, setFormData] = useState(
    packageToEdit || {
      name: '',
      destination: 'Andaman & Nicobar',
      category: 'Beach & Island',
      duration: '6 Days / 5 Nights',
      price: 24999,
      originalPrice: 29999,
      type: 'Customizable',
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
      description: 'Experience pristine turquoise beaches, coral reefs, and historical landmarks with all transfers included.',
      included: ['Flight Tickets', '3-Star Beach Resort', 'Breakfast & Dinner', 'Private Airport Transfers', 'Snorkeling & Scuba Tour']
    }
  );

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newPkg = {
      ...formData,
      id: packageToEdit ? packageToEdit.id : `PKG-${Date.now().toString().slice(-4)}`,
      rating: packageToEdit?.rating || 4.8,
      reviewsCount: packageToEdit?.reviewsCount || 12,
      bookingsCount: packageToEdit?.bookingsCount || 0
    };

    onSavePackage(newPkg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {packageToEdit ? 'Edit Holiday Package' : 'Create New Holiday Package'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure package details, duration, pricing, and customization options
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Package Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Package Title *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Exotic Kashmir Paradise & Dal Lake Houseboat"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="e.g. Kashmir, Kerala, Ladakh"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white cursor-pointer"
              >
                <option value="Beach & Island">Beach & Island</option>
                <option value="Himalayan Adventure">Himalayan Adventure</option>
                <option value="Heritage & Culture">Heritage & Culture</option>
                <option value="Nature & Wildlife">Nature & Wildlife</option>
                <option value="Spiritual & Pilgrimage">Spiritual & Pilgrimage</option>
                <option value="Romantic & Honeymoon">Romantic & Honeymoon</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 6 Days / 5 Nights"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            {/* Type: Fixed or Customizable */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customization Mode
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white cursor-pointer"
              >
                <option value="Customizable">Customizable (Flights/Hotels/Cabs)</option>
                <option value="Fixed">Fixed Package (All-Inclusive)</option>
              </select>
            </div>

            {/* Price (INR) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Offer Price (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Banner Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Publish Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white cursor-pointer"
              >
                <option value="Active">Active (Visible)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Brief Itinerary / Overview
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-semibold hover:bg-orange-600 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {packageToEdit ? 'Update Package' : 'Save & Publish Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
