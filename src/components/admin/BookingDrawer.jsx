import React, { useState } from 'react';
import {
  X,
  FileText,
  Settings as SettingsIcon,
  User,
  Mail,
  Phone,
  Plane,
  Hotel,
  Car,
  Compass,
  CheckCircle2,
  Clock,
  Ban,
  MapPin,
  Calendar,
  Ticket,
  Luggage,
  ShieldCheck,
  CreditCard,
  Download,
  Printer,
  Bus
} from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export default function BookingDrawer({
  booking,
  isOpen,
  onClose,
  onViewInvoice,
  onViewTicket,
  onCancelBooking,
  onEditBooking,
  type = 'package' // 'package' | 'bus' | 'flight' | 'hotel' | 'cab'
}) {
  const [remarks, setRemarks] = useState('');
  const [showRemarksInput, setShowRemarksInput] = useState(false);

  if (!booking) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs text-center">
        <p className="text-sm font-bold text-slate-800">No Booking Selected</p>
        <p className="text-xs text-slate-400 mt-1">Select any booking from the table to view its full details.</p>
      </div>
    );
  }

  // Derive base fare and taxes
  const baseFare = booking.basePrice || booking.baseFare || Math.round((booking.amount || 10000) * 0.82);
  const taxes = booking.taxes || booking.gst || Math.round((booking.amount || 10000) * 0.18);
  const convenienceFee = booking.convenienceFee || (type === 'bus' ? 150 : 0);
  const totalAmount = booking.amount || (baseFare + taxes + convenienceFee);

  return (
    <div
      id="booking-details-panel"
      className="bg-white rounded-2xl border border-slate-200/80 p-5 lg:p-6 shadow-xs flex flex-col justify-between space-y-5"
    >
      <div className="space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {type === 'package' && 'Package Booking Details'}
              {type === 'bus' && 'Bus Reservation Details'}
              {type === 'flight' && 'Flight PNR Details'}
              {type === 'hotel' && 'Hotel Stay Details'}
              {type === 'cab' && 'Cab Transfer Details'}
            </h3>
            <StatusBadge status={booking.status} />
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Media Banner / Title */}
        <div className="flex gap-3.5 items-start">
          {booking.image ? (
            <img
              src={booking.image}
              alt={booking.packageName || booking.route || booking.hotel || booking.vehicle}
              className="w-20 h-20 rounded-xl object-cover ring-1 ring-slate-200/80 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
              {type === 'bus' ? <Bus className="w-8 h-8" /> :
               type === 'flight' ? <Plane className="w-8 h-8" /> :
               type === 'hotel' ? <Hotel className="w-8 h-8" /> :
               type === 'cab' ? <Car className="w-8 h-8" /> :
               <Compass className="w-8 h-8" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900 leading-snug">
              {booking.packageName || booking.route || booking.hotel || booking.vehicle || `${booking.operator || 'Express'} Bus`}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {booking.duration || booking.busDetails || booking.airline || booking.room || booking.carType}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {booking.route || `${booking.fromCity || 'Delhi'} → ${booking.toCity || 'Jaipur'}`}
            </p>
          </div>
        </div>

        {/* Booking ID & Date Meta */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Booking ID</span>
            <p className="font-mono font-bold text-slate-800 text-xs truncate">{booking.id}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Booking Date</span>
            <p className="font-medium text-slate-700 text-xs truncate">
              {booking.bookingDate || '12 Sep 2025, 10:24 AM'}
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <User className="w-3.5 h-3.5 text-orange-600" />
            <span>Customer Information</span>
          </div>

          <div className="space-y-1 text-xs text-slate-600 pl-5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
            <p className="font-bold text-slate-800">{booking.customer?.name || 'Rahul Sharma'}</p>
            <p className="text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-slate-400" />
              <span>{booking.customer?.email || 'rahul@gmail.com'}</span>
            </p>
            <p className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>{booking.customer?.phone || '+91 98765 43210'}</span>
            </p>
            {type === 'bus' && (
              <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                Passengers: <strong className="text-slate-700">{booking.passengersCount || 2} Persons</strong>
              </p>
            )}
          </div>
        </div>

        {/* TYPE SPECIFIC DETAILS */}

        {/* 1. PACKAGE BOOKING SPECIFIC */}
        {type === 'package' && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Compass className="w-3.5 h-3.5 text-orange-600" />
              <span>Travel Details</span>
            </div>

            <div className="space-y-2 text-xs pl-5 divide-y divide-slate-100">
              {booking.flight && (
                <div className="pt-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Plane className="w-3 h-3 text-blue-600" />
                    Flight: {booking.flight.airline} ({booking.flight.flightNo})
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{booking.flight.route}</p>
                </div>
              )}

              {booking.hotel && (
                <div className="pt-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Hotel className="w-3 h-3 text-amber-600" />
                    Hotel: {booking.hotel.name}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {booking.hotel.nights} • {booking.hotel.room}
                  </p>
                </div>
              )}

              {booking.transfer && (
                <div className="pt-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Car className="w-3 h-3 text-emerald-600" />
                    Transfer: {booking.transfer.type}
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{booking.transfer.desc}</p>
                </div>
              )}

              {booking.sightseeing && (
                <div className="pt-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-orange-600" />
                    Sightseeing: Included Guided Tours
                  </span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{booking.sightseeing.spots || '4 Key Attractions'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. BUS BOOKING SPECIFIC */}
        {type === 'bus' && (
          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Route & Distance:</span>
                <span className="font-bold text-slate-800">{booking.route} ({booking.distance || '450 km'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Departure:</span>
                <span className="font-bold text-slate-800">{booking.travelDate}, {booking.departureTime || '09:30 PM'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seat Numbers:</span>
                <span className="font-mono font-bold text-orange-600 bg-white px-2 py-0.5 rounded border border-orange-200">
                  {booking.seatNumbers ? booking.seatNumbers.join(', ') : 'A1, A2'}
                </span>
              </div>
            </div>

            {/* Booking Status Timeline */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Booking Status Timeline
              </span>
              <div className="space-y-2.5 pl-2 border-l-2 border-slate-200 text-xs">
                {(booking.timeline || [
                  { step: "Booking Confirmed", time: "09 Sep 2025, 10:30 AM", completed: true },
                  { step: "Boarding Pass Issued", time: "12 Sep 2025, 08:00 PM", completed: booking.status === 'Confirmed' },
                  { step: "Trip Completed", time: "13 Sep 2025, 06:00 AM", completed: false }
                ]).map((t, idx) => (
                  <div key={idx} className="relative pl-3">
                    <span
                      className={`absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        t.completed ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <p className={`font-semibold ${t.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {t.step}
                    </p>
                    <p className="text-[10px] text-slate-400">{t.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes / Remarks */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowRemarksInput(!showRemarksInput)}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                {showRemarksInput ? 'Hide Remarks' : '+ Add Notes / Remarks'}
              </button>
              {showRemarksInput && (
                <div className="mt-2 space-y-2">
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add operational notes or passenger requests..."
                    className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRemarksInput(false)}
                    className="px-3 py-1 bg-slate-800 text-white rounded-lg text-[11px] font-semibold hover:bg-slate-900 cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. FLIGHT BOOKING SPECIFIC */}
        {type === 'flight' && (
          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">PNR Number:</span>
                <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  {booking.pnr || 'PNR-8832'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Flight:</span>
                <span className="font-bold text-slate-800">{booking.airline} ({booking.flightNo})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sector:</span>
                <span className="font-semibold text-slate-700">{booking.route}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class & Baggage:</span>
                <span className="font-medium text-slate-700">{booking.cabinClass || 'Economy'} • {booking.baggage || '15kg Check-in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Seat Number:</span>
                <span className="font-mono font-bold text-slate-800">{booking.seat || '12B'}</span>
              </div>
            </div>

            {/* Flight Timeline */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Flight Status Timeline
              </span>
              <div className="space-y-2.5 pl-2 border-l-2 border-slate-200">
                {[
                  { step: "Ticket Confirmed", time: "10 Sep 2025, 08:30 AM", completed: true },
                  { step: "Web Check-in Open", time: "11 Sep 2025, 06:00 AM", completed: true },
                  { step: "Boarding Gate Assigned", time: "12 Sep 2025, 05:30 AM", completed: false },
                  { step: "Flight Departed", time: "12 Sep 2025, 06:15 AM", completed: false }
                ].map((t, idx) => (
                  <div key={idx} className="relative pl-3">
                    <span
                      className={`absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        t.completed ? 'bg-blue-500' : 'bg-slate-300'
                      }`}
                    />
                    <p className={`font-semibold ${t.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {t.step}
                    </p>
                    <p className="text-[10px] text-slate-400">{t.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. HOTEL BOOKING SPECIFIC */}
        {type === 'hotel' && (
          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Hotel Name:</span>
                <span className="font-bold text-slate-800">{booking.hotel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Room Category:</span>
                <span className="font-semibold text-slate-700">{booking.room || 'Deluxe Room AC'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guests:</span>
                <span className="font-semibold text-slate-700">{booking.guests || '2 Adults, 1 Child'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check-in / Check-out:</span>
                <span className="font-semibold text-slate-700">{booking.checkIn || booking.travelDate} to {booking.checkOut || '15 Sep 2025'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold text-amber-700">{booking.nights || '3 Nights'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Meal Plan:</span>
                <span className="font-medium text-slate-700">{booking.mealPlan || 'Free Breakfast (CP Plan)'}</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. CAB BOOKING SPECIFIC */}
        {type === 'cab' && (
          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle:</span>
                <span className="font-bold text-slate-800">{booking.vehicle || 'Toyota Innova Crysta'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle Type:</span>
                <span className="font-semibold text-slate-700">{booking.carType || 'SUV 6-Seater AC'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pickup Location:</span>
                <span className="font-semibold text-slate-700">{booking.pickup || 'Airport Terminal 3'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Drop Destination:</span>
                <span className="font-semibold text-slate-700">{booking.drop || 'Hotel Taj Palace'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chauffeur / Driver:</span>
                <span className="font-bold text-slate-800">{booking.driver || 'Mukesh Kumar'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Driver Phone:</span>
                <span className="font-mono text-slate-700">{booking.driverPhone || '+91 94140 12345'}</span>
              </div>
            </div>

            {/* Cab Timeline */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Dispatch Timeline
              </span>
              <div className="space-y-2.5 pl-2 border-l-2 border-slate-200">
                {[
                  { step: "Booking Confirmed", time: "11 Sep 2025, 04:00 PM", completed: true },
                  { step: "Driver & Cab Assigned", time: "12 Sep 2025, 08:00 AM", completed: true },
                  { step: "Vehicle Dispatched", time: "12 Sep 2025, 08:30 AM", completed: false },
                  { step: "Trip Completed", time: "Pending", completed: false }
                ].map((t, idx) => (
                  <div key={idx} className="relative pl-3">
                    <span
                      className={`absolute -left-[11px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        t.completed ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <p className={`font-semibold ${t.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {t.step}
                    </p>
                    <p className="text-[10px] text-slate-400">{t.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fare Breakdown (Section 17, 18, 19, 20) */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Fare Breakdown
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Base Fare:</span>
            <span>₹{baseFare.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Applicable GST (18%):</span>
            <span>₹{taxes.toLocaleString('en-IN')}</span>
          </div>

          {convenienceFee > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Convenience Fee:</span>
              <span>₹{convenienceFee.toLocaleString('en-IN')}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
            <span>Total Amount:</span>
            <span className="text-[#F97316] font-extrabold text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
        {onViewInvoice && (
          <button
            type="button"
            onClick={() => onViewInvoice(booking)}
            className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-orange-600" />
            <span>{type === 'hotel' ? 'View Voucher' : 'View Invoice'}</span>
          </button>
        )}

        {onViewTicket && (
          <button
            type="button"
            onClick={() => onViewTicket(booking)}
            className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>{type === 'hotel' ? 'Download Voucher' : 'View Ticket'}</span>
          </button>
        )}

        {onEditBooking && (
          <button
            type="button"
            onClick={() => onEditBooking(booking)}
            className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Manage Booking</span>
          </button>
        )}

        {onCancelBooking && (
          <button
            type="button"
            onClick={() => onCancelBooking(booking)}
            className="py-2.5 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1"
            title="Cancel Booking"
          >
            <Ban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
}
