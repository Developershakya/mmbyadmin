import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Utensils,
  Mountain,
  Compass,
  DollarSign,
  Clock,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Upload,
  Trash2
} from 'lucide-react';

const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

/* =========================================================================
   1. MEAL MODAL (Add / Edit Day-wise Meal Plan)
   ========================================================================= */
export function MealModal({
  isOpen,
  onClose,
  dayNumber,
  dayDate,
  initialData = null,
  onSaveMeal
}) {
  const [mealType, setMealType] = useState('Breakfast');
  const [status, setStatus] = useState('Included'); // 'Included' | 'Paid' | 'Optional'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [dietary, setDietary] = useState('Multi-Cuisine');
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (initialData) {
      setMealType(initialData.mealType || initialData.type || 'Breakfast');
      setStatus(initialData.status || (initialData.price > 0 ? 'Paid' : 'Included'));
      setTitle(initialData.title || initialData.name || '');
      setDescription(initialData.description || '');
      setRestaurant(initialData.restaurant || '');
      setDietary(initialData.dietary || 'Multi-Cuisine');
      setPrice(initialData.price || 0);
    } else {
      setMealType('Breakfast');
      setStatus('Included');
      setTitle('Complimentary Buffet Breakfast');
      setDescription('Lavish buffet breakfast with hot tea/coffee, eggs, dosas, and fresh juice at hotel dining hall.');
      setRestaurant('');
      setDietary('Multi-Cuisine');
      setPrice(0);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleMealTypeSelect = (type) => {
    setMealType(type);
    if (!initialData) {
      if (type === 'Breakfast') {
        setTitle('Complimentary Buffet Breakfast');
        setDescription('Lavish buffet spread at the hotel restaurant with live counters.');
        setPrice(0);
        setStatus('Included');
      } else if (type === 'Lunch') {
        setTitle('Traditional Himachali / Indian Lunch');
        setDescription('Delightful multi-course hot lunch at an authentic scenic restaurant.');
        setPrice(status === 'Included' ? 0 : 450);
      } else if (type === 'Dinner') {
        setTitle('Grand Multi-Cuisine Dinner');
        setDescription('Chef special buffet dinner featuring North Indian & Continental delights.');
        setPrice(status === 'Included' ? 0 : 650);
      } else if (type === 'Evening Snacks') {
        setTitle('High Tea & Local Snacks');
        setDescription('Evening tea/coffee served with hot piping pakoras and cookies.');
        setPrice(status === 'Included' ? 0 : 250);
      } else if (type === 'All Meals (AP)') {
        setTitle('Complete Full-Board Meal Plan (Breakfast, Lunch & Dinner)');
        setDescription('All three daily meals included with unlimited buffet spreads.');
        setPrice(status === 'Included' ? 0 : 1200);
      }
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveMeal({
      id: initialData?.id || `meal-${Date.now()}`,
      mealType,
      type: mealType,
      title: title.trim(),
      name: title.trim(),
      description: description.trim(),
      restaurant: restaurant.trim(),
      dietary,
      status,
      price: status === 'Included' ? 0 : Number(price) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {initialData ? 'Edit Meal Service' : 'Add Meal to Itinerary'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Day {dayNumber || 1} {dayDate ? `· ${dayDate}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Meal Type Quick Selector */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">Meal Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {['Breakfast', 'Lunch', 'Dinner', 'Evening Snacks', 'All Meals (AP)'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleMealTypeSelect(t)}
                  className={`px-2.5 py-2 rounded-xl text-center font-semibold text-[11px] transition border cursor-pointer ${
                    mealType === t
                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Title */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Meal Name / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Candlelight Dinner with Wine, Buffet Breakfast"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
            />
          </div>

          {/* Status & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Inclusion Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (e.target.value === 'Included') setPrice(0);
                }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              >
                <option value="Included">Included in Tour Package</option>
                <option value="Paid">Paid Extra / Add-On</option>
                <option value="Optional">Optional / Pay on Spot</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Cost per Person {status === 'Included' ? '(Included = ₹0)' : '(INR)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  disabled={status === 'Included'}
                  value={status === 'Included' ? 0 : price}
                  onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-medium text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Dietary Preference & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Dietary Specialization</label>
              <select
                value={dietary}
                onChange={(e) => setDietary(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              >
                <option value="Multi-Cuisine">Multi-Cuisine (Veg & Non-Veg)</option>
                <option value="Pure Vegetarian">Pure Vegetarian (No Onion/Garlic option)</option>
                <option value="Jain Meal">Jain Preparation</option>
                <option value="Continental / Western">Continental / Western</option>
                <option value="Authentic Regional Thali">Authentic Regional Thali</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Restaurant / Venue (Optional)</label>
              <input
                type="text"
                value={restaurant}
                onChange={(e) => setRestaurant(e.target.value)}
                placeholder="e.g. Resort Pine View Restaurant"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Menu Inclusions / Highlights</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe menu items, welcome drink, or special dining experience..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Update Meal' : 'Save Meal to Day'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   2. SIGHTSEEING MODAL (Add / Edit Sightseeing Spot)
   ========================================================================= */
export function SightseeingModal({
  isOpen,
  onClose,
  dayNumber,
  dayLocation = '',
  initialData = null,
  onSaveSightseeing
}) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState(dayLocation || 'Local Destination');
  const [duration, setDuration] = useState('2 - 3 Hours');
  const [category, setCategory] = useState('Scenic & Heritage');
  const [price, setPrice] = useState(0);
  const [isIncluded, setIsIncluded] = useState(true);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageName, setImageName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImage(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setLocation(initialData.location || dayLocation || 'Local Destination');
      setDuration(initialData.duration || '2 - 3 Hours');
      setCategory(initialData.category || 'Scenic & Heritage');
      setPrice(initialData.price || 0);
      setIsIncluded(initialData.price ? false : true);
      setDescription(initialData.description || initialData.masterDescription || '');
      setImage(initialData.image || '');
    } else {
      setName('');
      setLocation(dayLocation || 'Local Destination');
      setDuration('2 - 3 Hours');
      setCategory('Scenic & Heritage');
      setPrice(0);
      setIsIncluded(true);
      setDescription('Guided exploration with scenic viewpoints, iconic photo-stops, and cultural heritage insights.');
      setImage('https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5');
    }
  }, [initialData, isOpen, dayLocation]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveSightseeing({
      id: initialData?.id || `sight-${Date.now()}`,
      name: name.trim(),
      location: location.trim(),
      duration,
      category,
      price: isIncluded ? 0 : Number(price) || 0,
      description: description.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-teal-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {initialData ? 'Edit Sightseeing Spot' : 'Add Sightseeing to Day'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Day {dayNumber || 1} {location ? `· ${location}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Sightseeing Name <span className="text-teal-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Solang Valley Snow Point, Hadimba Temple, Rohtang Pass"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Location / Area</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Manali, Himachal Pradesh"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Estimated Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              >
                <option value="1 - 2 Hours">1 - 2 Hours</option>
                <option value="2 - 3 Hours">2 - 3 Hours</option>
                <option value="Half Day (4 - 5 Hours)">Half Day (4 - 5 Hours)</option>
                <option value="Full Day (6 - 8 Hours)">Full Day (6 - 8 Hours)</option>
                <option value="Evening Walk / Sunset">Evening Walk / Sunset</option>
              </select>
            </div>
          </div>

          {/* Pricing & Inclusion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tour Inclusions</label>
              <select
                value={isIncluded ? 'yes' : 'no'}
                onChange={(e) => {
                  const inc = e.target.value === 'yes';
                  setIsIncluded(inc);
                  if (inc) setPrice(0);
                }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              >
                <option value="yes">Entry / Sightseeing Included</option>
                <option value="no">Ticket / Permit Extra Charge</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Entry Ticket / Permit Fee {isIncluded ? '(Included = ₹0)' : '(INR)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  disabled={isIncluded}
                  value={isIncluded ? 0 : price}
                  onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-medium text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Image & Photo Upload */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 block">Sightseeing Photo</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold cursor-pointer text-xs transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
              <input
                type="text"
                value={image && !image.startsWith('data:') ? image : ''}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="flex-1 min-w-[180px] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
              />
            </div>

            {image && (
              <div className="relative inline-block mt-1 border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white p-1">
                <img
                  src={image}
                  alt="Sightseeing Preview"
                  className="h-24 w-auto object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => { setImage(''); setImageName(''); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-xs"
                  title="Remove image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {imageName && (
                  <p className="text-[10px] text-slate-500 px-1 pt-0.5 truncate max-w-xs">{imageName}</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Highlights &amp; Tour Details</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe iconic viewpoints, photography spots, and entry notes..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Update Sightseeing' : 'Save Sightseeing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   3. ACTIVITY MODAL (Add / Edit Adventure / Activity)
   ========================================================================= */
export function ActivityModal({
  isOpen,
  onClose,
  dayNumber,
  dayLocation = '',
  initialData = null,
  onSaveActivity
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Adventure Sports');
  const [duration, setDuration] = useState('1 - 2 Hours');
  const [price, setPrice] = useState(1500);
  const [difficulty, setDifficulty] = useState('Moderate');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [imageName, setImageName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setImage(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'Adventure Sports');
      setDuration(initialData.duration || '1 - 2 Hours');
      setPrice(initialData.price || 0);
      setDifficulty(initialData.difficulty || 'Moderate');
      setDescription(initialData.description || '');
      setImage(initialData.image || '');
    } else {
      setName('');
      setCategory('Adventure Sports');
      setDuration('1 - 2 Hours');
      setPrice(1500);
      setDifficulty('Moderate');
      setDescription('Exciting outdoor adventure activity with certified instructors and safety gear.');
      setImage('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveActivity({
      id: initialData?.id || `act-${Date.now()}`,
      name: name.trim(),
      category,
      duration,
      price: Number(price) || 0,
      difficulty,
      description: description.trim(),
      image: image.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {initialData ? 'Edit Activity' : 'Add Activity to Itinerary'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Day {dayNumber || 1} {dayLocation ? `· ${dayLocation}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Activity Name <span className="text-purple-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Paragliding at Solang, River Rafting in Beas, ATV Quad Ride"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
              >
                <option value="Adventure Sports">Adventure Sports</option>
                <option value="Water Sports">Water Sports & Rafting</option>
                <option value="Trekking & Hiking">Trekking & Hiking</option>
                <option value="Cultural & Heritage">Cultural & Heritage Experience</option>
                <option value="Wildlife Safari">Wildlife Safari</option>
                <option value="Wellness & Spa">Wellness & Spa</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
              >
                <option value="30 Minutes">30 Minutes</option>
                <option value="1 - 2 Hours">1 - 2 Hours</option>
                <option value="Half Day">Half Day</option>
                <option value="Full Day">Full Day</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Price per Person (INR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Intensity / Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
              >
                <option value="Easy / Family Friendly">Easy / Family Friendly</option>
                <option value="Moderate">Moderate</option>
                <option value="High Thrill / Adventure">High Thrill / Adventure</option>
              </select>
            </div>
          </div>

          {/* Activity Photo Upload */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-700 block">Activity Photo</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold cursor-pointer text-xs transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
              <input
                type="text"
                value={image && !image.startsWith('data:') ? image : ''}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="flex-1 min-w-[180px] border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
              />
            </div>

            {image && (
              <div className="relative inline-block mt-1 border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white p-1">
                <img
                  src={image}
                  alt="Activity Preview"
                  className="h-24 w-auto object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => { setImage(''); setImageName(''); }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition cursor-pointer shadow-xs"
                  title="Remove image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                {imageName && (
                  <p className="text-[10px] text-slate-500 px-1 pt-0.5 truncate max-w-xs">{imageName}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description &amp; Safety Inclusions</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail safety equipment, certified guides, age restrictions, and meeting points..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialData ? 'Update Activity' : 'Save Activity to Day'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================================
   4. UNSAVED CHANGES CONFIRMATION MODAL (Clean, Exact 3 Options)
   ========================================================================= */
export function UnsavedChangesModal({
  isOpen,
  isSaving,
  onDiscard,
  onSaveAndNext,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#0F172A]">Unsaved Changes</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You have unsaved changes in this stage. How would you like to proceed?
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer text-center"
          >
            Discard Changes &amp; Next
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onSaveAndNext}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50 text-center"
          >
            {isSaving ? 'Saving...' : 'Save & Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
