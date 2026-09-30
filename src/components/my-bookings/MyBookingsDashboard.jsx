"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  BriefcaseBusiness,
  Bus,
  CalendarDays,
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  CreditCard,
  FileText,
  Hotel,
  MapPin,
  PackageOpen,
  Plane,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import { generateBookingPdf } from "@/lib/pdf/pdfGenerator";
import useAuth from "@/lib/useAuth";

const filters = [
  { value: "all", label: "All" },
  { value: "Flight", label: "Flights" },
  { value: "Hotel", label: "Hotels" },
  { value: "Car", label: "Cars" },
  { value: "Bus", label: "Bus" },
  { value: "Package", label: "Packages" },
];

const navItems = [
  { label: "Explore", href: "/", icon: Compass },
  { label: "Booking", href: "/my-bookings", icon: BriefcaseBusiness },
  { label: "Profile", href: "/profile", icon: UserRound },
];

const typeIcons = { Flight: Plane, Hotel, Car: CarFront, Bus, Package: PackageOpen };

function safeParse(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function formatMoney(value, currency = "INR") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "N/A";
  return `${currency === "USD" ? "$" : "₹"}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "N/A";
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function detailsOf(booking) {
  return {
    ...booking,
    ...(safeParse(booking.booking_details) || safeParse(booking.bookingSnapshot) || safeParse(booking.bookingDetails) || {}),
  };
}

function roomOf(booking) {
  const rooms = safeParse(detailsOf(booking).roomDetails || booking.rooms);
  return (Array.isArray(rooms) ? safeParse(rooms[0]) : rooms) || {};
}

function pointOf(value) {
  const point = safeParse(value);
  if (!point) return typeof value === "string" ? { Name: value, Location: value } : {};
  return typeof point === "string" ? { Name: point, Location: point } : point;
}

function pointName(value) {
  const point = pointOf(value);
  return point.Name || point.Location || "—";
}

function passengersOf(booking) {
  const details = detailsOf(booking);
  const passengers = safeParse(booking.passenger_data || booking.passengers || details.passengers);
  const seats = safeParse(booking.seats) || [];
  return Array.isArray(passengers)
    ? passengers.map((passenger, index) => ({ ...passenger, seat: passenger.seat || seats[index]?.SeatName || seats[index]?.seatName || seats[index]?.SeatNumber }))
    : [];
}

function bookingTitle(booking) {
  const details = detailsOf(booking);
  if (booking.type === "Bus") return `${pointName(booking.boarding_point || booking.boardingPoint)} → ${pointName(booking.dropping_point || booking.droppingPoint)}`;
  if (booking.type === "Hotel") return booking.hotel_name || booking.hotelName || details.hotelName || "Hotel Booking";
  if (booking.type === "Flight") return `Flight ${booking.pnr || details.flightNumber || "Booking"}`;
  if (booking.type === "Car") return details.carName || booking.vehicleName || booking.car_category || "Car Booking";
  if (booking.type === "Package") return details.packageName || booking.packageName || booking.package_name || "Package Booking";
  return "Booking";
}

function bookingRoute(booking) {
  const details = detailsOf(booking);
  if (booking.type === "Bus") return `${pointName(booking.boarding_point || booking.boardingPoint)} → ${pointName(booking.dropping_point || booking.droppingPoint)}${booking.travel_date || booking.travelDate ? ` · ${formatDate(booking.travel_date || booking.travelDate)}` : ""}`;
  if (booking.type === "Hotel") return `${formatDate(details.checkin_date || booking.checkInDate || booking.checkin_date)} - ${formatDate(details.checkout_date || booking.checkOutDate || booking.checkout_date)}`;
  if (booking.type === "Flight") return `${details.originCode || booking.originCity || booking.origin || "—"} → ${details.destinationCode || booking.destinationCity || booking.destination || "—"}`;
  if (booking.type === "Car") return `${details.pickupLocation || booking.pickupLocation || booking.pickupCity || "—"} → ${details.dropLocation || booking.dropLocation || booking.dropCity || "—"}`;
  return `Travel: ${formatDate(details.travelDate || booking.travelDate || booking.travel_date)}`;
}

function StatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();
  const confirmed = ["success", "completed", "paid", "confirmed"].includes(normalized);
  const cancelled = ["cancelled", "canceled", "failed"].includes(normalized);
  const label = confirmed ? "Confirmed" : cancelled ? "Cancelled" : normalized[0]?.toUpperCase() + normalized.slice(1);
  const colors = confirmed ? "bg-[#E6F7EF] text-[#13A36B]" : cancelled ? "bg-[#FBE6E2] text-[#D9402B]" : "bg-[#FCEFD9] text-[#B97A12]";
  return <span className={`shrink-0 rounded-full px-[9px] py-1 text-[10.5px] font-bold uppercase ${colors}`}>{label || "Pending"}</span>;
}

function BookingCard({ booking, selected, onClick }) {
  const Icon = typeIcons[booking.type] || CircleHelp;
  return (
    <button type="button" onClick={onClick} className={`relative block w-full border-0 border-b border-[#EDE5D8] px-[22px] py-[14px] text-left ${selected ? "bg-[#FBF3E0] before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[#C8901A]" : "bg-transparent"}`}>
      <div className="flex items-start gap-3">
        <span className={`flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] text-white ${booking.type === "Bus" ? "bg-[#46AFC0]" : booking.type === "Car" ? "bg-[#EE6B52]" : "bg-[#C8901A]"}`}><Icon size={16}/></span>
        <span className="min-w-0 flex-1"><span className="block truncate text-[14.5px] font-bold">{bookingTitle(booking)}</span><span className="mt-0.5 block text-xs text-[#8A7A60]">{booking.type}</span></span>
        <StatusBadge status={booking.status}/>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2 pl-[50px]">
        <span className="min-w-0 truncate text-[12.5px] font-medium text-[#6B5A3A]">{bookingRoute(booking)}</span>
        <span className="shrink-0 text-right"><span className="block text-sm font-bold">{formatMoney(booking.amount, booking.currency)}</span><span className="mt-0.5 block text-[11px] text-[#8A7A60]">{formatDateTime(booking.payment_date || booking.created_at || booking.createdAt)}</span></span>
      </div>
    </button>
  );
}

function Panel({ title, icon: Icon, children }) {
  return <section className="mb-[18px] rounded-2xl border border-[#EDE5D8] bg-white p-5"><h3 className="mb-[14px] flex items-center gap-[9px] font-[Poppins] text-[14.5px] font-bold"><Icon size={16} className="text-[#C8901A]"/>{title}</h3>{children}</section>;
}

function ValueGrid({ items, columns = 3 }) {
  return <div className={`grid grid-cols-2 gap-[14px] ${columns === 3 ? "min-[700px]:grid-cols-3" : ""}`}>{items.map(([label, value]) => <div key={label} className="min-w-0 rounded-[10px] bg-[#FAF7F2] p-3"><div className="text-[10.5px] font-bold uppercase text-[#8A7A60]">{label}</div><div className="mt-1 break-words text-[14.5px] font-bold">{value ?? "N/A"}</div></div>)}</div>;
}

function Timeline({ fromLabel, fromName, fromTime, toLabel, toName, toTime, date, icon: Icon }) {
  return <div className="rounded-[14px] bg-[#1A1205] p-[22px] text-white"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><div className="text-[10.5px] uppercase text-[#8A7A60]">{fromLabel}</div>{fromTime && <div className="mt-1 font-[Poppins] text-[22px] font-extrabold">{formatTime(fromTime)}</div>}<div className="mt-1 break-words text-xs text-[#B7AA90]">{fromName || "—"}</div></div><div className="min-w-10 flex-1 px-2 text-center"><div className="relative mt-1 h-0.5 bg-[#3A2E18]"><span className="absolute left-1/2 top-1/2 flex h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#C8901A]"><Icon size={14}/></span></div>{date && <div className="mt-4 text-[11px] text-[#8A7A60]">{formatDate(date)}</div>}</div><div className="min-w-0 text-right"><div className="text-[10.5px] uppercase text-[#8A7A60]">{toLabel}</div>{toTime && <div className="mt-1 font-[Poppins] text-[22px] font-extrabold">{formatTime(toTime)}</div>}<div className="mt-1 break-words text-xs text-[#B7AA90]">{toName || "—"}</div></div></div></div>;
}

function PersonRows({ people, bus = false }) {
  if (!people.length) return <p className="text-[13px] text-[#8A7A60]">No passenger details.</p>;
  return people.map((person, index) => {
    const name = [person.title || person.Title, person.firstName || person.FirstName, person.lastName || person.LastName].filter(Boolean).join(" ") || person.name || "Guest";
    const seat = person.SeatDetails || {};
    const seatName = seat.SeatNumber || seat.SeatName || person.seat || "";
    const email = person.email || person.Email || "";
    const phone = person.mobile || person.Mobile || person.contactNo || "";
    return <div key={`${name}-${index}`} className="flex items-center justify-between gap-3 border-b border-[#EDE5D8] py-[10px] last:border-0"><div className="flex min-w-0 items-center gap-2.5"><span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#C8901A] text-xs font-bold text-white">{name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><span className="min-w-0 text-[13.5px] font-semibold">{name}{(email || phone) && <span className="mt-0.5 block break-all text-xs font-normal text-[#8A7A60]">{email}{email && phone ? " · " : ""}{phone}</span>}{person.age || person.Age ? <span className="mt-0.5 block text-xs font-normal text-[#8A7A60]">Age: {person.age || person.Age}</span> : null}</span></div>{seatName && <span className="shrink-0 rounded-[7px] border border-[#F5D98A] bg-[#FBF3E0] px-2.5 py-1 text-xs font-bold text-[#9E6F10]">Seat {seatName}{bus && (seat.SeatType || seat.Deck) && <small className="mt-1 block text-[10.5px] font-medium">{[seat.SeatType, seat.Deck].filter(Boolean).join(" · ")}</small>}</span>}</div>;
  });
}

function PolicyRows({ policies, bus = false }) {
  if (!Array.isArray(policies) || !policies.length) return <p className="text-[13px] text-[#8A7A60]">No cancellation policy available.</p>;
  return <div className="overflow-x-auto"><table className="w-full border-collapse text-[13px]"><thead><tr className="text-left text-[11px] uppercase text-[#8A7A60]"><th className="border-b border-[#EDE5D8] py-2">{bus ? "Timeframe" : "From"}</th><th className="border-b border-[#EDE5D8] py-2">{bus ? "Charge" : "To"}</th>{!bus && <th className="border-b border-[#EDE5D8] py-2">Charge</th>}</tr></thead><tbody>{policies.map((policy, index) => <tr key={index}><td className="border-b border-[#EDE5D8] py-2">{bus ? policy.PolicyString || "N/A" : formatDate(policy.FromDate)}</td><td className="border-b border-[#EDE5D8] py-2">{bus ? `${policy.CancellationCharge ?? "N/A"}${policy.CancellationChargeType === 2 ? "%" : "₹"}` : formatDate(policy.ToDate)}</td>{!bus && <td className="border-b border-[#EDE5D8] py-2 font-bold">{policy.Currency || "INR"} {policy.Charge ?? "N/A"}</td>}</tr>)}</tbody></table></div>;
}

function BusDetails({ booking }) {
  const boarding = pointOf(booking.boarding_point || booking.boardingPoint);
  const dropping = pointOf(booking.dropping_point || booking.droppingPoint);
  const passengers = passengersOf(booking);
  const travelDate = booking.travel_date || booking.travelDate;
  const policies = safeParse(booking.cancellation_policy || booking.cancellationPolicy) || [];
  const busType = booking.bus_type || booking.busType || booking.bus_number;
  return <>
    <Panel title="Journey Timeline" icon={Bus}><Timeline icon={Bus} fromLabel="Boarding" fromName={pointName(booking.boarding_point || booking.boardingPoint)} fromTime={boarding.Time || booking.departureTime} toLabel="Dropping" toName={pointName(booking.dropping_point || booking.droppingPoint)} toTime={dropping.Time || booking.arrivalTime} date={travelDate}/></Panel>
    <Panel title="Route Details" icon={MapPin}><ValueGrid columns={2} items={[["Boarding Point", <span key="boarding">{pointName(booking.boarding_point || booking.boardingPoint)}<small className="mt-1 block text-[11.5px] font-normal leading-relaxed text-[#8A7A60]">{boarding.Address || ""}</small>{(boarding.Landmark || boarding.ContactNumber || boarding.Contact) && <small className="mt-1 block text-[11px] font-normal text-[#8A7A60]">{[boarding.Landmark, boarding.ContactNumber || boarding.Contact].filter(Boolean).join(" · ")}</small>}</span>], ["Dropping Point", <span key="dropping">{pointName(booking.dropping_point || booking.droppingPoint)}<small className="mt-1 block text-[11.5px] font-normal text-[#8A7A60]">{dropping.Address || ""}</small></span>], ["Travel Date", formatDate(travelDate)], ["Bus Type", busType], ["Bus Number", booking.bus_number], ["Bus Operator", booking.bus_name || booking.operator], ["Ticket / PNR", booking.ticketNo || booking.operatorPnr || booking.bookingId]]}/></Panel>
    <Panel title="Passengers" icon={Users}><PersonRows people={passengers} bus/></Panel>
    <Panel title="Cancellation Policy" icon={ShieldCheck}><PolicyRows policies={policies} bus/></Panel>
    <Panel title="Payment" icon={CreditCard}><ValueGrid items={[["Fare", formatMoney(booking.fare, booking.currency)], ["Tax", formatMoney(booking.tax, booking.currency)], ["Total Amount", formatMoney(booking.amount, booking.currency)], ["Order ID", booking.order_id], ["Payment ID", booking.payment_id], ["Ticket Number", booking.ticketNo], ["Operator PNR", booking.operatorPnr], ["Trace ID", booking.traceId || booking.trace_id]]}/></Panel>
  </>;
}

function HotelDetails({ booking, onOpenImage }) {
  const details = detailsOf(booking);
  const room = roomOf(booking);
  const imagesRaw = room.RoomImages || details.RoomImages || [];
  const images = Array.isArray(imagesRaw) ? imagesRaw.map((image) => typeof image === "string" ? image : image?.Image).filter(Boolean) : [];
  const amenities = Array.isArray(room.Amenities) ? room.Amenities : Array.isArray(booking.inclusions || details.inclusions) ? booking.inclusions || details.inclusions : [];
  const guests = safeParse(details.passengerDetails || booking.guests || details.guests) || [];
  const policies = safeParse(room.CancellationPolicies || booking.cancellationPolicy || details.cancellationPolicy) || [];
  const address = details.address || [details.city, details.state, details.country].filter(Boolean).join(", ");
  const hotelName = booking.hotel_name || booking.hotelName || details.hotelName || "Hotel";
  const checkIn = details.checkin_date || booking.checkInDate || booking.checkin_date;
  const checkOut = details.checkout_date || booking.checkOutDate || booking.checkout_date;
  return <>
    <div className="mb-4"><div className="relative h-[260px] overflow-hidden rounded-2xl bg-[#1A1205]">{images[0] && <button type="button" onClick={() => onOpenImage(images, 0)} className="h-full w-full"><img src={images[0]} alt={hotelName} className="h-full w-full object-cover"/></button>}<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0602]/90 via-[#0a0602]/35 to-transparent p-5 text-white"><div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-white/75">{details.rating ? `${details.rating} star · ${Number(details.rating) >= 4 ? "Luxury" : "Standard"}` : ""}{room.BedTypes && <span>{room.BedTypes}</span>}</div><h3 className="text-[22px] font-extrabold">{hotelName}</h3><div className="mt-2 flex items-center justify-between gap-2 text-xs text-white/80"><span>{address}</span>{details.latitude && details.longitude && <a href={`https://www.google.com/maps?q=${details.latitude},${details.longitude}`} target="_blank" rel="noreferrer">View on Map</a>}</div></div></div>{images.length > 1 && <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{images.map((image, index) => <button key={`${image}-${index}`} type="button" onClick={() => onOpenImage(images, index)} className="h-12 w-16 shrink-0 overflow-hidden rounded-lg"><img src={image} alt={`Room ${index + 1}`} className="h-full w-full object-cover"/></button>)}</div>}</div>
    <div className="mb-[22px] grid grid-cols-3 gap-3">{[["Check-in", checkIn], ["Check-out", checkOut], ["Bed Type", room.BedTypes || booking.bedType]].map(([label, value]) => <div key={label} className="rounded-xl border border-[#EDE5D8] bg-white p-3 text-center"><CalendarDays size={16} className="mx-auto mb-1 text-[#C8901A]"/><span className="block text-[11px] text-[#8A7A60]">{label}</span><b className="mt-1 block text-sm">{label.includes("in") || label.includes("out") ? formatDate(value) : value || "N/A"}</b></div>)}</div>
    <Panel title="Room Details" icon={BedDouble}><ValueGrid columns={2} items={[["Room Type", room.RoomTypeName || booking.roomTypeName], ["Bed Type", room.BedTypes || booking.bedType], ["Guests", booking.guestCount || details.adults || guests.length], ["Rooms", booking.roomsCount], ["Booking Reference", booking.bookingRefNo || booking.confirmationNo || booking.bookingId], ["Address", address]]}/></Panel>
    <Panel title="Guest Profiles" icon={Users}>{guests.length ? <PersonRows people={guests}/> : <div className="text-[13px]">{details.customerName || "Guest"}<div className="mt-1 text-xs text-[#8A7A60]">{details.customerEmail || ""} {details.customerPhone ? `· ${details.customerPhone}` : ""}</div></div>}</Panel>
    {amenities.length > 0 && <Panel title="Amenities" icon={Check}><div className="flex flex-wrap gap-2">{amenities.map((amenity, index) => <span key={`${amenity}-${index}`} className="flex items-center gap-2 rounded-[9px] bg-[#FAF7F2] px-3 py-2 text-xs font-semibold"><Check size={14} className="text-[#C8901A]"/>{amenity.Name || amenity}</span>)}</div></Panel>}
    <Panel title="Cancellation Policy" icon={ShieldCheck}><PolicyRows policies={policies}/></Panel>
    <Panel title="Pricing" icon={CreditCard}><ValueGrid items={[["Price / Night", formatMoney(booking.pricePerNight, booking.currency)], ["Base Price", formatMoney(booking.basePrice, booking.currency)], ["Tax", formatMoney(booking.tax, booking.currency)], ["Total Amount", formatMoney(booking.amount, booking.currency)], ["Payment ID", booking.paymentId], ["Booking Reference", booking.bookingRefNo || booking.confirmationNo || booking.bookingId]]}/></Panel>
    <Panel title="Booking Timeline" icon={CalendarDays}><div className="divide-y divide-[#EDE5D8]">{[["Booking Created", formatDateTime(booking.created_at || booking.createdAt)], ["Check-in", formatDate(checkIn)], ["Check-out", formatDate(checkOut)], ["Status", booking.status]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 py-2 text-[13px]"><span className="text-[#8A7A60]">{label}</span><b>{value}</b></div>)}</div></Panel>
  </>;
}

function OtherDetails({ booking }) {
  const details = detailsOf(booking);
  const passengers = passengersOf(booking);
  if (booking.type === "Flight") {
    const origin = details.originCode || booking.originCity || booking.origin || "—";
    const originName = details.originName || booking.originCity || "";
    const destination = details.destinationCode || booking.destinationCity || booking.destination || "—";
    const destinationName = details.destinationName || booking.destinationCity || "";
    const segments = safeParse(booking.segments) || [];
    const returnFlight = details.returnDetails || booking.return_details || segments[1] || null;
    const fareRules = safeParse(booking.fareRules || details.fareRule) || [];
    return <>
    <Panel title="Journey Timeline" icon={Plane}><Timeline icon={Plane} fromLabel="Departure" fromName={`${origin} · ${originName}`} fromTime={details.departureTime || booking.departureTime} toLabel="Arrival" toName={`${destination} · ${destinationName}`} toTime={details.arrivalTime || booking.arrivalTime} date={details.departureDate || details.departureTime}/></Panel>
    {returnFlight && <Panel title="Return Journey" icon={ArrowLeft}><Timeline icon={Plane} fromLabel="Departure" fromName={`${returnFlight.originCode || returnFlight.Origin?.AirportCode || returnFlight.Origin?.CityCode || "—"} · ${returnFlight.originName || returnFlight.Origin?.AirportName || returnFlight.Origin?.CityName || ""}`} fromTime={returnFlight.departureTime || returnFlight.DepartureTime || returnFlight.DepTime} toLabel="Arrival" toName={`${returnFlight.destinationCode || returnFlight.Destination?.AirportCode || returnFlight.Destination?.CityCode || "—"} · ${returnFlight.destinationName || returnFlight.Destination?.AirportName || returnFlight.Destination?.CityName || ""}`} toTime={returnFlight.arrivalTime || returnFlight.ArrivalTime || returnFlight.ArrTime} date={returnFlight.departureTime || returnFlight.DepartureTime || returnFlight.DepTime}/></Panel>}
    <Panel title="Flight Information" icon={Plane}><ValueGrid items={[["Airline", details.airline], ["Flight Number", details.flightNumber], ["Origin", `${originName || origin} (${origin})`], ["Destination", `${destinationName || destination} (${destination})`], ["Duration", details.duration], ["Stops", details.stops], ["Cabin", details.cabinClass], ["PNR", booking.pnr], ["Ticket Number", booking.ticketNumber], ["Booking Reference", booking.bookingId]]}/></Panel>
    <Panel title="Passenger Information" icon={Users}><PersonRows people={passengers}/></Panel>
    <Panel title="Fare & Payment" icon={CreditCard}><ValueGrid items={[["Base Fare", formatMoney(booking.baseFare || details.fare?.baseFare, booking.currency)], ["Taxes & Fees", formatMoney(booking.tax || details.fare?.tax, booking.currency)], ["Total", formatMoney(booking.amount, booking.currency)], ["Payment ID", booking.paymentId || booking.payment_id], ["Invoice Number", booking.invoiceNumber]]}/></Panel>
    <Panel title="Fare Rules & Policies" icon={FileText}>{Array.isArray(fareRules) && fareRules.length ? <ul className="space-y-2 text-[13px] text-[#4A3A20]">{fareRules.map((rule, index) => <li key={index} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-[#13A36B]"/><span>{typeof rule === "string" ? rule : rule.timeframe || rule.PolicyString || `${rule.fee || rule.CancellationCharge || "Policy"}`}</span></li>)}</ul> : <p className="text-[13px] text-[#8A7A60]">No fare rules available.</p>}</Panel>
  </>;
  }
  if (booking.type === "Car") {
    const carTraveler = passengers[0] || {};
    const customerName = details.customerName || booking.customerName || carTraveler.name || [carTraveler.firstName, carTraveler.lastName].filter(Boolean).join(" ");
    const customerEmail = details.customerEmail || booking.customerEmail || carTraveler.email;
    const customerPhone = details.customerPhone || booking.customerPhone || carTraveler.phone || carTraveler.mobile;
    return <>
    <Panel title="Journey Timeline" icon={CarFront}><Timeline icon={CarFront} fromLabel="Pickup" fromName={details.pickupLocation || details.pickupCity} fromTime={`${details.pickupDate || ""} ${details.pickupTime || ""}`} toLabel="Drop-off" toName={details.dropLocation || details.dropCity} toTime={`${details.dropDate || ""} ${details.dropTime || ""}`} date={details.pickupDate}/></Panel>
    <Panel title="Trip Details" icon={CarFront}><ValueGrid items={[["Vehicle", details.carName || booking.vehicleName], ["Category", details.carType || booking.category || booking.type], ["Passengers", Array.isArray(details.passengers) ? details.passengers.length : details.passengers || booking.passengersCount], ["Pickup", details.pickupLocation || details.pickupCity], ["Drop-off", details.dropLocation || details.dropCity], ["Pickup Date", formatDate(details.pickupDate)], ["Pickup Time", details.pickupTime], ["Trip Type", booking.tripType], ["Driver", details.driverName || safeParse(booking.driverDetails)?.driverName], ["Driver Contact", details.driverPhone || safeParse(booking.driverDetails)?.contact], ["Vehicle Number", safeParse(booking.driverDetails)?.vehicleNumber], ["Booking Reference", booking.referenceNo || booking.confirmationNo || booking.bookingId]]}/></Panel>
    <Panel title="Customer Information" icon={UserRound}>{customerName || "N/A"}<div className="mt-1 text-xs text-[#8A7A60]">{customerEmail || ""} {customerPhone ? `· ${customerPhone}` : ""}</div></Panel>
    <Panel title="Pricing" icon={CreditCard}><ValueGrid items={[["Base Fare", formatMoney(booking.baseFare, booking.currency)], ["Driver Allowance", formatMoney(booking.driverAllowance, booking.currency)], ["Total Amount", formatMoney(booking.amount, booking.currency)], ["Payment ID", booking.paymentId]]}/></Panel>
  </>;
  }
  const inclusions = safeParse(details.inclusions || booking.servicesBooked) || [];
  return <>
    <Panel title="Package Details" icon={PackageOpen}><ValueGrid items={[["Package", details.packageName || booking.packageName], ["Destination", details.destination || booking.destination], ["Duration", details.duration], ["Travel Date", formatDate(details.travelDate || booking.travelDate)], ["Adults", details.adults ?? details.travelers?.adults], ["Children", details.children ?? details.travelers?.children], ["Hotel", details.hotel || booking.hotel], ["Customer", booking.customerName], ["Email", booking.customerEmail], ["Phone", booking.customerPhone], ["Booking Reference", booking.bookingId]]}/></Panel>
    <Panel title="Inclusions" icon={Check}>{Array.isArray(inclusions) && inclusions.length ? <div className="flex flex-wrap gap-2">{inclusions.map((item, index) => <span key={index} className="rounded-[9px] bg-[#FAF7F2] px-3 py-2 text-xs font-semibold">{typeof item === "string" ? item : item.title || item.name || item.type || "Included service"}</span>)}</div> : <p className="text-[13px] text-[#8A7A60]">No inclusions provided.</p>}</Panel>
    <Panel title="Pricing" icon={CreditCard}><ValueGrid items={[["Total Amount", formatMoney(booking.amount, booking.currency)], ["Payment ID", booking.paymentId], ["Booking Reference", booking.bookingId]]}/></Panel>
  </>;
}

function BookingDetails({ booking, mobile, user, onBack, onCancel, onOpenImage }) {
  if (!booking) return <div className="hidden h-full items-center justify-center text-[#8A7A60] min-[992px]:flex"><div className="text-center"><BriefcaseBusiness size={50} className="mx-auto mb-4 opacity-30"/><p>Select a booking to see details</p></div></div>;
  return <BookingDetailsContent booking={booking} mobile={mobile} user={user} onBack={onBack} onCancel={onCancel} onOpenImage={onOpenImage}/>;
}

function BookingDetailsContent({ booking, mobile, user, onBack, onCancel, onOpenImage }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const canCancel = ["CONFIRMED", "SUCCESS", "COMPLETED", "PAID"].includes(String(booking.status).toUpperCase());
  async function download() {
    setDownloading(true);
    setDownloadError("");
    try {
      await generateBookingPdf(booking, user);
    } catch (error) {
      setDownloadError(error.message || "Could not generate booking PDF.");
    } finally {
      setDownloading(false);
    }
  }
  return <section className="h-full overflow-y-auto px-4 pb-24 pt-4 min-[992px]:px-9 min-[992px]:pb-[60px] min-[992px]:pt-7">{mobile && <button type="button" onClick={onBack} className="mb-4 flex items-center gap-2 text-sm font-bold text-[#C8901A] min-[992px]:hidden"><ArrowLeft size={16}/>Back to bookings</button>}<div className="mb-[22px] flex flex-wrap items-start justify-between gap-3.5"><div><h2 className="text-[23px] font-bold">{bookingTitle(booking)}</h2><p className="mt-1 flex items-center gap-2 text-[13px] text-[#8A7A60]"><StatusBadge status={booking.status}/>Created {formatDateTime(booking.created_at || booking.createdAt)}</p></div><div className="flex gap-2.5"><button type="button" disabled={downloading} onClick={download} className="flex items-center gap-2 rounded-[10px] border border-[#EDE5D8] bg-white px-4 py-2.5 text-[13.5px] font-semibold disabled:opacity-60"><FileText size={15}/>{downloading ? "Preparing PDF..." : "Download"}</button>{canCancel && <button type="button" onClick={onCancel} className="flex items-center gap-2 rounded-[10px] border border-[#F3C9C0] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#D9402B]"><X size={15}/>Cancel</button>}</div></div>{downloadError && <p role="alert" className="mb-4 rounded-lg bg-[#FBE6E2] px-3 py-2 text-sm text-[#A32A17]">{downloadError}</p>}{booking.type === "Bus" ? <BusDetails booking={booking}/> : booking.type === "Hotel" ? <HotelDetails booking={booking} onOpenImage={onOpenImage}/> : <OtherDetails booking={booking}/>}</section>;
}

function CancellationModal({ booking, onClose, onRequested }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const reasons = ["Schedule change", "Found cheaper option", "Medical emergency", "Change in plans", "Other"];
  const policies = booking.type === "Bus"
    ? safeParse(booking.cancellation_policy || booking.cancellationPolicy) || []
    : booking.type === "Hotel"
      ? safeParse(roomOf(booking).CancellationPolicies || booking.cancellationPolicy) || []
      : [];

  async function submitRequest() {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/my-bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: booking.id, type: booking.type, reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Cancellation request failed.");
      onRequested(data.booking);
    } catch (requestError) {
      setError(requestError.message || "Cancellation request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1205]/55 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="max-h-[88vh] w-full max-w-[440px] overflow-y-auto rounded-2xl bg-white"><div className="flex items-center justify-between border-b border-[#EDE5D8] px-5 py-[18px]"><h3 className="text-base font-bold">Cancel {booking.type} Booking</h3><button type="button" onClick={onClose} aria-label="Close"><X size={17}/></button></div><div className="p-5"><h4 className="mb-2 text-[13px] font-bold"><ShieldCheck size={15} className="mr-1 inline text-[#C8901A]"/>Cancellation Policy</h4><PolicyRows policies={policies} bus={booking.type === "Bus"}/><label className="mb-1.5 mt-4 block text-[12.5px] font-bold" htmlFor="cancel-reason">Select Cancellation Reason</label><select id="cancel-reason" value={reason} onChange={(event) => setReason(event.target.value)} className="w-full rounded-[9px] border border-[#EDE5D8] px-3 py-2.5 text-[13.5px]"><option value="" disabled>-- Select a reason --</option>{reasons.map((item) => <option key={item}>{item}</option>)}</select><p className="mt-3 rounded-[10px] bg-[#FBF3E0] px-3.5 py-3 text-[13px] text-[#7A5010]">This submits a cancellation request. The supplier must confirm cancellation and refund eligibility.</p>{error && <p role="alert" className="mt-3 text-[13px] text-[#A32A17]">{error}</p>}</div><div className="flex justify-end gap-2.5 border-t border-[#EDE5D8] px-5 py-3.5"><button type="button" disabled={submitting} onClick={onClose} className="rounded-[10px] border border-[#EDE5D8] bg-white px-4 py-2.5 text-[13px] font-semibold">Keep Booking</button><button type="button" disabled={!reason || submitting} onClick={submitRequest} className="rounded-[10px] border border-[#F3C9C0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#D9402B] disabled:opacity-50">{submitting ? "Submitting..." : "Submit Cancellation Request"}</button></div></div></div>;
}

export default function MyBookingsDashboard() {
  const router = useRouter();
  const authenticatedUser = useAuth();
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [cancelBooking, setCancelBooking] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const filteredBookings = useMemo(() => bookings.filter((booking) => activeFilter === "all" || booking.type === activeFilter).slice().sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0)), [activeFilter, bookings]);
  const selectedBooking = filteredBookings.find((booking) => booking.id === selectedId) || null;

  useEffect(() => {
    if (authenticatedUser === undefined) return undefined;
    if (!authenticatedUser) {
      router.replace("/login");
      return undefined;
    }

    const controller = new AbortController();
    setBookingsLoading(true);
    fetch("/api/my-bookings", { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load bookings.");
        setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        setBookingsError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setBookingsError(error.message || "Unable to load bookings.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setBookingsLoading(false);
      });
    return () => controller.abort();
  }, [authenticatedUser, router]);

  useEffect(() => {
    if (mobileDetail && window.matchMedia("(min-width: 992px)").matches) {
      setMobileDetail(false);
    }
  }, [mobileDetail]);

  useEffect(() => {
    if (!gallery) return undefined;
    function handleGalleryKeys(event) {
      if (event.key === "Escape") setGallery(null);
      if (event.key === "ArrowLeft") setGalleryIndex((index) => (index + gallery.length - 1) % gallery.length);
      if (event.key === "ArrowRight") setGalleryIndex((index) => (index + 1) % gallery.length);
    }
    document.addEventListener("keydown", handleGalleryKeys);
    return () => document.removeEventListener("keydown", handleGalleryKeys);
  }, [gallery]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1205]" style={{ fontFamily: "Inter, sans-serif" }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      <Header dashboard />
      <main className="min-[992px]:grid min-[992px]:h-[calc(100vh-84px)] min-[992px]:grid-cols-[84px_380px_minmax(0,1fr)] min-[992px]:overflow-hidden">
        <aside className="hidden flex-col items-center gap-2 bg-[#1A1205] py-6 min-[992px]:flex">
          {navItems.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} className={`flex h-16 w-14 flex-col items-center justify-center gap-1.5 rounded-[14px] text-[11px] font-semibold ${label === "Booking" ? "bg-[#C8901A]/[0.18] text-white" : "text-[#8A7A60] hover:text-white"}`}>
              <Icon size={18} className={label === "Booking" ? "text-[#C8901A]" : ""} />{label}
            </a>
          ))}
        </aside>

        <section className={`${mobileDetail ? "hidden" : "flex"} min-h-[calc(100vh-84px)] flex-col border-r border-[#EDE5D8] bg-white min-[992px]:flex min-[992px]:min-h-0 min-[992px]:overflow-hidden`}>
          <div className="border-b border-[#EDE5D8] px-[22px] pb-[14px] pt-[22px]">
            <h1 className="font-[Poppins] text-xl font-bold">My Bookings</h1>
            <p className="mt-1 text-[13px] text-[#8A7A60]">{bookingsLoading ? "Loading bookings..." : bookingsError || `${filteredBookings.length} booking${filteredBookings.length === 1 ? "" : "s"} found`}</p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto border-b border-[#EDE5D8] px-[18px] py-[14px] [scrollbar-width:none]">
            {filters.map((filter) => (
              <button key={filter.value} type="button" onClick={() => { setActiveFilter(filter.value); setMobileDetail(false); }} className={`shrink-0 whitespace-nowrap rounded-full border px-[14px] py-[7px] text-[13px] font-semibold ${activeFilter === filter.value ? "border-[#1A1205] bg-[#1A1205] text-white" : "border-transparent bg-[#FAF7F2] text-[#8A7A60]"}`}>
                {filter.label}
              </button>
            ))}
          </div>
          <div className="pb-24 min-[992px]:flex-1 min-[992px]:overflow-y-auto min-[992px]:pb-[90px]" aria-live="polite">
            {bookingsLoading ? (
              <p className="px-6 py-10 text-center text-[13px] text-[#8A7A60]">Loading your bookings...</p>
            ) : bookingsError ? (
              <div className="px-6 py-10 text-center text-[13px] text-[#A32A17]" role="alert">{bookingsError}</div>
            ) : filteredBookings.length ? (
              filteredBookings.map((booking) => (
                <BookingCard key={`${booking.type}-${booking.id}`} booking={booking} selected={selectedBooking?.id === booking.id} onClick={() => { setSelectedId(booking.id); setMobileDetail(true); }} />
              ))
            ) : (
              <div className="px-6 py-[60px] text-center text-[#8A7A60]"><BriefcaseBusiness size={42} className="mx-auto mb-4 opacity-40"/><h2 className="text-[15px] font-bold">No bookings found</h2><p className="mt-1 text-[13px]">Nothing here yet.</p></div>
            )}
          </div>
        </section>

        <div className={`${mobileDetail ? "block" : "hidden"} min-h-[calc(100vh-84px)] min-[992px]:block min-[992px]:min-h-0 min-[992px]:overflow-hidden`}>
          <BookingDetails booking={selectedBooking} mobile={mobileDetail} user={authenticatedUser} onBack={() => setMobileDetail(false)} onCancel={() => setCancelBooking(selectedBooking)} onOpenImage={(images, index) => { setGallery(images); setGalleryIndex(index); }} />
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-[#EDE5D8] bg-white px-0 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_20px_rgba(26,18,5,0.06)] min-[992px]:hidden">
        {navItems.map(({ label, href, icon: Icon }) => <a key={label} href={href} className={`flex flex-1 flex-col items-center gap-1 text-[11px] font-semibold ${label === "Booking" ? "text-[#C8901A]" : "text-[#8A7A60]"}`}><Icon size={18} />{label}</a>)}
      </nav>

      {cancelBooking && <CancellationModal key={cancelBooking.id} booking={cancelBooking} onClose={() => setCancelBooking(null)} onRequested={(updated) => { setBookings((current) => current.map((item) => String(item.id) === String(updated.id) && item.type === updated.type ? { ...item, status: updated.status } : item)); setCancelBooking(null); }} />}
      {gallery?.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(10,7,2,0.94)] p-4" onClick={() => setGallery(null)}>
          <button type="button" aria-label="Close image" onClick={() => setGallery(null)} className="absolute right-5 top-4 text-3xl text-white"><X /></button>
          <button type="button" aria-label="Previous image" onClick={(event) => { event.stopPropagation(); setGalleryIndex((galleryIndex + gallery.length - 1) % gallery.length); }} className="absolute left-3 top-1/2 text-white"><ChevronLeft size={34} /></button>
          <img src={gallery[galleryIndex]} alt="Hotel room" className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain" onClick={(event) => event.stopPropagation()} />
          <button type="button" aria-label="Next image" onClick={(event) => { event.stopPropagation(); setGalleryIndex((galleryIndex + 1) % gallery.length); }} className="absolute right-3 top-1/2 text-white"><ChevronRight size={34} /></button>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[13px] text-white">{galleryIndex + 1} / {gallery.length}</span>
        </div>
      )}
    </div>
  );
}