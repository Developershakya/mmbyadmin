import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plane,
  Building2,
  Car,
  Bus,
  Mountain,
  Compass,
  Utensils,
  Plus,
  Trash2,
  Copy,
  Edit2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  GripVertical,
  Save,
  Eye,
  FileDown,
  Rocket,
  MoreVertical,
  RotateCcw,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  LayoutDashboard,
  PlaneTakeoff,
  Package as PackageIcon,
  Briefcase,
  SlidersHorizontal,
  MapPin,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  ArrowRight,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import {
  FlightSearchModal,
  HotelSearchModal,
  CabSearchModal,
  BusSearchModal
} from './SearchModals.jsx';
import {
  SightseeingModal,
  ActivityModal,
  MealModal
} from './ItineraryModals.jsx';
import PackageInfoForm from './PackageInfoForm.jsx';
import PricingRulesForm from './PricingRulesForm.jsx';
import PoliciesForm from './PoliciesForm.jsx';
import CustomerPreviewView from './CustomerPreviewView.jsx';
import PublishView from './PublishView.jsx';
import StepperControl from './StepperControl.jsx';
import { generatePackagePdf, downloadElementAsPdf } from '../../lib/pdfGenerator.js';
import { fetchPackageById, savePackage, deletePackageApi } from '../../lib/api/packages.js';

// Format INR currency
const inr = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

export default function TravelProPackageBuilder({
  initialPackage = null,
  onNavigate,
  onSavePackage,
  showToast = (msg) => console.log(msg)
}) {
  const [activeStep, setActiveStep] = useState(initialPackage ? 'itinerary' : 'info');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Helper to parse package data safely
  const parsePackageIntoState = (pkg) => {
    if (!pkg) {
      return {
        title: '',
        destination: '',
        city: '',
        originCity: '',
        startDate: '',
        endDate: '',
        customerName: '',
        customerInfo: { name: '', email: '', phone: '' },
        referenceId: '',
        tripId: '',
        consultantName: '',
        coverImage: '',
        nights: 1,
        highlights: [],
        inclusions: [
          'Accommodation in selected hotel / resort',
          'Daily breakfast and meals as per package plan',
          'All sightseeing and transfers by private vehicle',
          'Toll taxes, state permits, parking fees, and driver allowances'
        ],
        exclusions: [
          'Airfare or train fare unless explicitly added to itinerary',
          'Personal expenses such as laundry, calls, and minibar',
          'Monument entry fees, camera charges, and activity passes',
          'Any item not specified in package inclusions'
        ],
        terms: [],
        travelers: {
          adults: 2,
          children: 0,
          infants: 0
        },
        pricing: {
          markup: 0,
          tax: 0,
          discount: 0
        },
        customization: {
          flight: true,
          hotel: true,
          cab: true,
          bus: true,
          sightseeing: true,
          activity: true,
          meal: true
        },
        days: []
      };
    }

    const days = pkg.itineraryData?.days || pkg.dayWiseItinerary || pkg.days || [];
    return {
      id: pkg.id,
      title: pkg.title || pkg.packageName || '',
      destination: pkg.destination || pkg.city || '',
      city: pkg.city || pkg.destination || '',
      originCity: pkg.originCity || '',
      startDate: pkg.startDate || '',
      endDate: pkg.endDate || '',
      customerName: pkg.customerName || pkg.customerInfo?.name || '',
      customerInfo: pkg.customerInfo || { name: pkg.customerName || '' },
      referenceId: pkg.referenceId || (pkg.id ? `PKG-${pkg.id}` : ''),
      tripId: pkg.tripId || (pkg.id ? String(pkg.id) : ''),
      consultantName: pkg.consultantName || '',
      coverImage: pkg.coverImage || '',
      nights: pkg.durationNights || pkg.nights || (Array.isArray(days) && days.length > 0 ? Math.max(days.length - 1, 1) : 1),
      highlights: pkg.highlights || [],
      inclusions: pkg.inclusions || [
        'Accommodation in selected hotel / resort',
        'Daily breakfast and meals as per package plan',
        'All sightseeing and transfers by private vehicle',
        'Toll taxes, state permits, parking fees, and driver allowances'
      ],
      exclusions: pkg.exclusions || [
        'Airfare or train fare unless explicitly added to itinerary',
        'Personal expenses such as laundry, calls, and minibar',
        'Monument entry fees, camera charges, and activity passes',
        'Any item not specified in package inclusions'
      ],
      terms: pkg.terms || [
        'All package rates are subject to availability at the time of confirmed booking.',
        'Standard hotel check-in time is 12:00 PM / 02:00 PM and check-out is 10:00 AM / 11:00 AM.',
        'Valid Government ID proof (Aadhar / Passport / Voter ID) is mandatory for all travelers at check-in.',
        'AC will not operate in hill stations or when vehicle is parked/idle.',
        'Any changes or deviations in route requested by the traveler will attract additional charges.'
      ],
      cancellationPolicy: pkg.cancellationPolicy || {
        rules: [
          { timeframe: '30+ Days Before Departure', charge: '10% of Package Value', refund: '90% Refund within 7 working days' },
          { timeframe: '15 to 29 Days Before Departure', charge: '25% of Package Value', refund: '75% Refund within 7 working days' },
          { timeframe: '7 to 14 Days Before Departure', charge: '50% of Package Value', refund: '50% Refund within 7 working days' },
          { timeframe: 'Within 7 Days of Departure / No Show', charge: '100% of Package Value', refund: 'Non-refundable' }
        ],
        notes: 'Refund processing will take 5 to 7 business working days to the original mode of payment.'
      },
      dateChangePolicy: pkg.dateChangePolicy || {
        rules: [
          { timeframe: 'Up to 15 Days Before Departure', charge: 'Free Date Rescheduling', remark: 'Hotel & airline fare difference applies' },
          { timeframe: '7 to 14 Days Before Departure', charge: '₹1,500 per person change fee', remark: '+ airline/hotel fare difference' },
          { timeframe: 'Less than 7 Days Before Departure', charge: 'Subject to Supplier Approval', remark: 'Treated as cancellation if not approved' }
        ],
        notes: 'Date change requests are subject to hotel and transport availability during requested revised dates.'
      },
      travelers: pkg.travelers || {
        adults: 2,
        children: 0,
        infants: 0
      },
      pricing: pkg.pricingRules || pkg.pricingBreakdown || pkg.pricing || {
        markup: 0,
        tax: 0,
        discount: 0
      },
      customization: pkg.customization || {
        flight: true,
        hotel: true,
        cab: true,
        bus: true,
        sightseeing: true,
        activity: true,
        meal: true
      },
      days: Array.isArray(days) ? days : []
    };
  };

  // Package Data State (Clean dynamic zero-state or existing package)
  const [packageData, setPackageData] = useState(() => parsePackageIntoState(initialPackage));

  // Track last saved state to detect unsaved modifications
  const [lastSavedData, setLastSavedData] = useState(() => JSON.parse(JSON.stringify(packageData)));
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedModalState, setUnsavedModalState] = useState({
    isOpen: false,
    targetStep: null
  });

  // Calculate whether current stage has unsaved edits
  const isDirty = useMemo(() => {
    return JSON.stringify(packageData) !== JSON.stringify(lastSavedData);
  }, [packageData, lastSavedData]);

  // Handle stage transition with unsaved changes prompt
  const handleStepTransition = (targetStep) => {
    if (targetStep === activeStep) return;
    if (isDirty) {
      setUnsavedModalState({
        isOpen: true,
        targetStep
      });
    } else {
      setActiveStep(targetStep);
    }
  };

  // Synchronize when initialPackage prop updates or loads from DB
  useEffect(() => {
    if (initialPackage) {
      const parsed = parsePackageIntoState(initialPackage);
      setPackageData(parsed);
      setLastSavedData(JSON.parse(JSON.stringify(parsed)));
    } else {
      const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const urlId = searchParams.get('id');
      if (urlId) {
        fetchPackageById(urlId).then((dbPkg) => {
          if (dbPkg) {
            const parsed = parsePackageIntoState(dbPkg);
            setPackageData(parsed);
            setLastSavedData(JSON.parse(JSON.stringify(parsed)));
          }
        }).catch((err) => console.warn('Could not fetch package for edit:', err));
      }
    }
  }, [initialPackage]);

  // Modal States
  const [modalState, setModalState] = useState({
    flight: { isOpen: false, dayId: null, serviceId: null, initialData: {} },
    hotel: { isOpen: false, dayId: null, serviceId: null, initialData: {} },
    cab: { isOpen: false, dayId: null, serviceId: null, initialData: {} },
    bus: { isOpen: false, dayId: null, serviceId: null, initialData: {} },
    addService: { isOpen: false, dayId: null },
    editDay: { isOpen: false, day: null },
    sightseeing: { isOpen: false, dayId: null, serviceId: null, item: null },
    activity: { isOpen: false, dayId: null, serviceId: null, item: null },
    meal: { isOpen: false, dayId: null, serviceId: null, item: null },
    customerPreview: { isOpen: false },
    resetConfirm: { isOpen: false }
  });

  // Ticket / Attachment Image Preview Modal State
  const [ticketViewer, setTicketViewer] = useState({ isOpen: false, url: '', title: '' });

  // Reordering state for services within a day
  const [draggedServiceInfo, setDraggedServiceInfo] = useState(null); // { dayId, svcIndex }

  // Calculated Pricing Breakdown
  const pricingBreakdown = useMemo(() => {
    let flights = 0;
    let hotels = 0;
    let cabs = 0;
    let buses = 0;
    let sightseeing = 0;
    let activities = 0;
    let meals = 0;

    const adults = packageData.travelers.adults || 2;
    const children = packageData.travelers.children || 0;
    const totalTravelers = adults + children;

    packageData.days.forEach((day) => {
      (day.services || []).forEach((svc) => {
        if (!svc.selected) return;

        if (svc.type === 'flight') {
          flights += (Number(svc.data?.fare) || 0) * totalTravelers;
        } else if (svc.type === 'hotel') {
          const price = Number(svc.data?.price) || 0;
          const nights = Number(svc.data?.nights) || 1;
          hotels += price * nights;
        } else if (svc.type === 'cab') {
          cabs += Number(svc.data?.price) || 0;
        } else if (svc.type === 'bus') {
          buses += (Number(svc.data?.price) || 0) * totalTravelers;
        } else if (svc.type === 'sightseeing') {
          (svc.data?.items || []).forEach((item) => {
            sightseeing += (Number(item.price) || 0) * totalTravelers;
          });
        } else if (svc.type === 'activity') {
          (svc.data?.items || []).forEach((item) => {
            activities += (Number(item.price) || 0) * totalTravelers;
          });
        } else if (svc.type === 'meal') {
          (svc.data?.items || []).forEach((item) => {
            if (item.enabled !== false) {
              meals += (Number(item.price) || 0) * totalTravelers;
            }
          });
        }
      });
    });

    const base = flights + hotels + cabs + buses + sightseeing + activities + meals;
    const markup = Number(packageData.pricing.markup) || 0;
    const tax = Number(packageData.pricing.tax) || 0;
    const discount = Number(packageData.pricing.discount) || 0;
    const final = Math.max(base + markup + tax - discount, 0);
    const perPerson = Math.round(final / Math.max(totalTravelers, 1));

    return {
      flights,
      hotels,
      cabs,
      buses,
      sightseeing,
      activities,
      meals,
      base,
      markup,
      tax,
      discount,
      final,
      perPerson
    };
  }, [packageData]);

  // Total included count badges
  const serviceCounts = useMemo(() => {
    let f = 0, h = 0, c = 0, b = 0, s = 0, a = 0, m = 0;
    packageData.days.forEach((day) => {
      (day.services || []).forEach((svc) => {
        if (!svc.selected) return;
        if (svc.type === 'flight') f++;
        else if (svc.type === 'hotel') h++;
        else if (svc.type === 'cab') c++;
        else if (svc.type === 'bus') b++;
        else if (svc.type === 'sightseeing') s += (svc.data?.items?.length || 1);
        else if (svc.type === 'activity') a += (svc.data?.items?.length || 1);
        else if (svc.type === 'meal') m += (svc.data?.items?.filter((i) => i.enabled !== false).length || 1);
      });
    });
    return { flights: f, hotels: h, cabs: c, buses: b, sightseeing: s, activities: a, meals: m };
  }, [packageData]);

  /* =========================================================================
     DAY MANAGEMENT ACTIONS
     ========================================================================= */
  const handleAddDay = () => {
    const dayNum = packageData.days.length + 1;
    const newDay = {
      id: `day-${Date.now()}`,
      title: `Day ${dayNum} - Sightseeing & Leisure`,
      location: packageData.destination || 'Manali',
      description: 'Explore scenic viewpoints and enjoy local leisure activities.',
      collapsed: false,
      services: []
    };

    setPackageData((prev) => ({
      ...prev,
      days: [...prev.days, newDay]
    }));
    showToast(`Added Day ${dayNum} to itinerary.`, 'success');
  };

  const handleDuplicateDay = (dayId) => {
    const day = packageData.days.find((d) => d.id === dayId);
    if (!day) return;

    const cloned = JSON.parse(JSON.stringify(day));
    cloned.id = `day-${Date.now()}`;
    cloned.title = `${day.title} (Copy)`;

    const index = packageData.days.findIndex((d) => d.id === dayId);
    const updated = [...packageData.days];
    updated.splice(index + 1, 0, cloned);

    setPackageData((prev) => ({ ...prev, days: updated }));
    showToast(`Duplicated Day ${index + 1}.`, 'success');
  };

  const handleDeleteDay = (dayId) => {
    if (packageData.days.length <= 1) {
      showToast('A package must have at least one day.', 'error');
      return;
    }
    setPackageData((prev) => ({
      ...prev,
      days: prev.days.filter((d) => d.id !== dayId)
    }));
    showToast('Day removed from package.', 'info');
  };

  const handleToggleDayCollapse = (dayId) => {
    setPackageData((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === dayId ? { ...d, collapsed: !d.collapsed } : d))
    }));
  };

  const handleMoveDay = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= packageData.days.length) return;

    const updated = [...packageData.days];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setPackageData((prev) => ({ ...prev, days: updated }));
  };

  // Day Drag & drop reordering handlers
  const [draggedDayIndex, setDraggedDayIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedDayIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedDayIndex === null || draggedDayIndex === targetIndex) return;
    const updated = [...packageData.days];
    const [removed] = updated.splice(draggedDayIndex, 1);
    updated.splice(targetIndex, 0, removed);
    setPackageData((prev) => ({ ...prev, days: updated }));
    setDraggedDayIndex(null);
    showToast(`Reordered Day to Position ${targetIndex + 1}`, 'success');
  };

  const handleDragEnd = () => {
    setDraggedDayIndex(null);
  };

  // Service within Day Drag & Drop Reordering handlers
  const handleMoveService = (dayId, svcIndex, direction) => {
    setPackageData((prev) => {
      const day = prev.days.find((d) => d.id === dayId);
      if (!day) return prev;
      const targetIndex = svcIndex + direction;
      if (targetIndex < 0 || targetIndex >= (day.services || []).length) return prev;
      const updatedServices = [...day.services];
      const temp = updatedServices[svcIndex];
      updatedServices[svcIndex] = updatedServices[targetIndex];
      updatedServices[targetIndex] = temp;
      return {
        ...prev,
        days: prev.days.map((d) => (d.id === dayId ? { ...d, services: updatedServices } : d))
      };
    });
  };

  const handleServiceDragStart = (e, dayId, svcIndex) => {
    e.stopPropagation();
    setDraggedServiceInfo({ dayId, svcIndex });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/service', JSON.stringify({ dayId, svcIndex }));
  };

  const handleServiceDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleServiceDrop = (e, targetDayId, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedServiceInfo) return;
    const { dayId: sourceDayId, svcIndex: sourceIndex } = draggedServiceInfo;
    if (sourceDayId === targetDayId && sourceIndex === targetIndex) {
      setDraggedServiceInfo(null);
      return;
    }
    setPackageData((prev) => {
      const sourceDay = prev.days.find((d) => d.id === sourceDayId);
      const targetDay = prev.days.find((d) => d.id === targetDayId);
      if (!sourceDay || !targetDay) return prev;

      if (sourceDayId === targetDayId) {
        const updatedServices = [...sourceDay.services];
        const [moved] = updatedServices.splice(sourceIndex, 1);
        updatedServices.splice(targetIndex, 0, moved);
        return {
          ...prev,
          days: prev.days.map((d) => (d.id === targetDayId ? { ...d, services: updatedServices } : d))
        };
      } else {
        const sourceServices = [...sourceDay.services];
        const targetServices = [...targetDay.services];
        const [moved] = sourceServices.splice(sourceIndex, 1);
        targetServices.splice(targetIndex, 0, moved);
        return {
          ...prev,
          days: prev.days.map((d) => {
            if (d.id === sourceDayId) return { ...d, services: sourceServices };
            if (d.id === targetDayId) return { ...d, services: targetServices };
            return d;
          })
        };
      }
    });
    setDraggedServiceInfo(null);
    showToast('Reordered service inside day', 'success');
  };

  const handleServiceDragEnd = (e) => {
    if (e) e.stopPropagation();
    setDraggedServiceInfo(null);
  };

  // Modal Open Handlers (Flight, Hotel, Cab, Bus, Sightseeing, Activity, Meal)
  const handleOpenSearchModal = (dayId, type, initialSvc = null) => {
    const targetDay = packageData.days.find((d) => d.id === dayId);
    const dayLoc = targetDay?.location || packageData.destination || 'Destination';

    if (type === 'flight') {
      setModalState((prev) => ({
        ...prev,
        flight: {
          isOpen: true,
          dayId,
          serviceId: initialSvc?.id || null,
          initialData: initialSvc?.data || {
            fromName: packageData.originCity || 'Delhi',
            toName: packageData.destination || 'Manali'
          }
        }
      }));
    } else if (type === 'hotel') {
      setModalState((prev) => ({
        ...prev,
        hotel: {
          isOpen: true,
          dayId,
          serviceId: initialSvc?.id || null,
          initialData: initialSvc?.data || { location: dayLoc }
        }
      }));
    } else if (type === 'cab') {
      setModalState((prev) => ({
        ...prev,
        cab: {
          isOpen: true,
          dayId,
          serviceId: initialSvc?.id || null,
          initialData: initialSvc?.data || {
            pickup: `${dayLoc} Airport / Station`,
            drop: `${dayLoc} Hotel`
          }
        }
      }));
    } else if (type === 'bus') {
      setModalState((prev) => ({
        ...prev,
        bus: {
          isOpen: true,
          dayId,
          serviceId: initialSvc?.id || null,
          initialData: initialSvc?.data || {
            from: packageData.originCity || 'Delhi',
            to: dayLoc
          }
        }
      }));
    } else if (type === 'sightseeing') {
      setModalState((prev) => ({
        ...prev,
        sightseeing: {
          isOpen: true,
          dayId,
          serviceId: initialSvc?.id || null,
          item: null,
          dayLocation: dayLoc
        }
      }));
    } else if (type === 'activity') {
      setModalState((prev) => ({
        ...prev,
        activity: {
          isOpen: true,
          dayId,
          serviceId: initialSvc?.id || null,
          item: null,
          dayLocation: dayLoc
        }
      }));
    } else if (type === 'meal') {
      setModalState((prev) => ({
        ...prev,
        meal: {
          isOpen: true,
          dayId,
          serviceId: initialSvc?.id || null,
          item: null
        }
      }));
    }
  };

  // Callback when a flight is chosen from FlightSearchModal
  const handleSelectFlight = (flightData) => {
    const dayId = modalState.flight.dayId;
    const serviceId = modalState.flight.serviceId;
    if (!dayId) return;

    const flightPayload = {
      from: flightData.from || flightData.fromCode || 'DEL',
      fromName: flightData.fromName || 'Origin',
      to: flightData.to || flightData.toCode || 'DEST',
      toName: flightData.toName || 'Destination',
      departure: flightData.departure || '09:00',
      arrival: flightData.arrival || '11:15',
      duration: flightData.duration || '2h',
      airline: flightData.airline || 'Airline',
      flightNumber: flightData.flightNumber || 'FL-001',
      cabin: flightData.cabin || 'Economy',
      fare: Number(flightData.fare) || 0,
      tax: Number(flightData.tax) || 0,
      flightImage: flightData.flightImage || flightData.image || null,
      apiSelected: flightData.apiSelected !== false
    };

    if (serviceId) {
      handleUpdateServiceData(dayId, serviceId, flightPayload);
    } else {
      const newService = {
        id: `svc-${Date.now()}-flight`,
        type: 'flight',
        customizable: true,
        selected: true,
        data: flightPayload
      };
      setPackageData((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, services: [...(d.services || []), newService] } : d
        )
      }));
    }
    setModalState((prev) => ({ ...prev, flight: { isOpen: false, dayId: null, serviceId: null, initialData: {} } }));
    showToast(`Saved flight details!`, 'success');
  };

  // Callback when a hotel is chosen from HotelSearchModal
  const handleSelectHotel = (hotelData) => {
    const dayId = modalState.hotel.dayId;
    const serviceId = modalState.hotel.serviceId;
    if (!dayId) return;

    const hotelPayload = {
      name: hotelData.name || 'Hotel Stay',
      stars: hotelData.stars || 4,
      room: hotelData.room || hotelData.roomType || 'Standard Room',
      meal: hotelData.meal || hotelData.mealPlan || 'Room Only',
      price: Number(hotelData.price) || 0,
      rating: hotelData.rating || 4.0,
      reviews: hotelData.reviews || 0,
      image: hotelData.image || '',
      location: hotelData.location || packageData.destination || '',
      nights: Number(hotelData.nights) || 1,
      apiSelected: hotelData.apiSelected !== false
    };

    if (serviceId) {
      handleUpdateServiceData(dayId, serviceId, hotelPayload);
    } else {
      const newService = {
        id: `svc-${Date.now()}-hotel`,
        type: 'hotel',
        customizable: true,
        selected: true,
        data: hotelPayload
      };
      setPackageData((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, services: [...(d.services || []), newService] } : d
        )
      }));
    }
    setModalState((prev) => ({ ...prev, hotel: { isOpen: false, dayId: null, serviceId: null, initialData: {} } }));
    showToast(`Saved hotel accommodation!`, 'success');
  };

  // Callback when a cab is chosen from CabSearchModal
  const handleSelectCab = (cabData) => {
    const dayId = modalState.cab.dayId;
    const serviceId = modalState.cab.serviceId;
    if (!dayId) return;

    const cabPayload = {
      vehicle: cabData.vehicle || 'Cab Transfer',
      category: cabData.category || 'Sedan',
      seats: cabData.seats || 4,
      luggage: cabData.luggage || 2,
      pickup: cabData.pickup || 'Pickup Location',
      drop: cabData.drop || 'Drop Location',
      date: cabData.date || '',
      time: cabData.time || '10:00 AM',
      duration: cabData.duration || '',
      distance: cabData.distance || '',
      ac: cabData.ac !== false,
      price: Number(cabData.price) || 0,
      tollIncluded: cabData.tollIncluded !== false,
      image: cabData.image || null,
      voucherImage: cabData.voucherImage || cabData.image || null,
      apiSelected: cabData.apiSelected !== false
    };

    if (serviceId) {
      handleUpdateServiceData(dayId, serviceId, cabPayload);
    } else {
      const newService = {
        id: `svc-${Date.now()}-cab`,
        type: 'cab',
        customizable: true,
        selected: true,
        data: cabPayload
      };
      setPackageData((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, services: [...(d.services || []), newService] } : d
        )
      }));
    }
    setModalState((prev) => ({ ...prev, cab: { isOpen: false, dayId: null, serviceId: null, initialData: {} } }));
    showToast(`Saved cab transfer!`, 'success');
  };

  // Callback when a bus is chosen from BusSearchModal
  const handleSelectBus = (busData) => {
    const dayId = modalState.bus.dayId;
    const serviceId = modalState.bus.serviceId;
    if (!dayId) return;

    const busPayload = {
      operator: busData.operator || 'Bus Operator',
      busType: busData.busType || 'AC Sleeper',
      from: busData.from || packageData.originCity || 'Origin',
      to: busData.to || packageData.destination || 'Destination',
      departure: busData.departure || '20:00',
      arrival: busData.arrival || '06:00',
      duration: busData.duration || '',
      rating: busData.rating || 4.0,
      seatsLeft: busData.seatsLeft || 10,
      price: Number(busData.price) || 0,
      image: busData.image || null,
      voucherImage: busData.voucherImage || busData.image || null,
      apiSelected: busData.apiSelected !== false
    };

    if (serviceId) {
      handleUpdateServiceData(dayId, serviceId, busPayload);
    } else {
      const newService = {
        id: `svc-${Date.now()}-bus`,
        type: 'bus',
        customizable: true,
        selected: true,
        data: busPayload
      };
      setPackageData((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.id === dayId ? { ...d, services: [...(d.services || []), newService] } : d
        )
      }));
    }
    setModalState((prev) => ({ ...prev, bus: { isOpen: false, dayId: null, serviceId: null, initialData: {} } }));
    showToast(`Saved bus journey!`, 'success');
  };

  // Callback for saving Sightseeing item
  const handleSaveSightseeing = (sightData) => {
    const dayId = modalState.sightseeing.dayId;
    const serviceId = modalState.sightseeing.serviceId;
    if (!dayId) return;

    setPackageData((prev) => {
      const day = prev.days.find((d) => d.id === dayId);
      if (!day) return prev;

      let updatedServices = [...(day.services || [])];
      let existingSvc = serviceId
        ? updatedServices.find((s) => s.id === serviceId)
        : updatedServices.find((s) => s.type === 'sightseeing');

      if (existingSvc) {
        const existingItems = existingSvc.data?.items || [];
        const itemIdx = existingItems.findIndex((i) => i.id === sightData.id);
        let newItems;
        if (itemIdx >= 0) {
          newItems = existingItems.map((item, idx) => (idx === itemIdx ? { ...item, ...sightData } : item));
        } else {
          newItems = [...existingItems, sightData];
        }
        updatedServices = updatedServices.map((s) =>
          s.id === existingSvc.id
            ? { ...s, selected: true, data: { ...s.data, items: newItems } }
            : s
        );
      } else {
        const newSvc = {
          id: `svc-${Date.now()}-sightseeing`,
          type: 'sightseeing',
          selected: true,
          customizable: true,
          data: {
            items: [sightData]
          }
        };
        updatedServices.push(newSvc);
      }

      return {
        ...prev,
        days: prev.days.map((d) => (d.id === dayId ? { ...d, services: updatedServices } : d))
      };
    });

    setModalState((prev) => ({ ...prev, sightseeing: { isOpen: false, dayId: null, serviceId: null, item: null } }));
    showToast(`Sightseeing spot saved to Day!`, 'success');
  };

  // Callback for saving Adventure / Activity item
  const handleSaveActivity = (activityData) => {
    const dayId = modalState.activity.dayId;
    const serviceId = modalState.activity.serviceId;
    if (!dayId) return;

    setPackageData((prev) => {
      const day = prev.days.find((d) => d.id === dayId);
      if (!day) return prev;

      let updatedServices = [...(day.services || [])];
      let existingSvc = serviceId
        ? updatedServices.find((s) => s.id === serviceId)
        : updatedServices.find((s) => s.type === 'activity');

      if (existingSvc) {
        const existingItems = existingSvc.data?.items || [];
        const itemIdx = existingItems.findIndex((i) => i.id === activityData.id);
        let newItems;
        if (itemIdx >= 0) {
          newItems = existingItems.map((item, idx) => (idx === itemIdx ? { ...item, ...activityData } : item));
        } else {
          newItems = [...existingItems, activityData];
        }
        updatedServices = updatedServices.map((s) =>
          s.id === existingSvc.id
            ? { ...s, selected: true, data: { ...s.data, items: newItems } }
            : s
        );
      } else {
        const newSvc = {
          id: `svc-${Date.now()}-activity`,
          type: 'activity',
          selected: true,
          customizable: true,
          data: {
            items: [activityData]
          }
        };
        updatedServices.push(newSvc);
      }

      return {
        ...prev,
        days: prev.days.map((d) => (d.id === dayId ? { ...d, services: updatedServices } : d))
      };
    });

    setModalState((prev) => ({ ...prev, activity: { isOpen: false, dayId: null, serviceId: null, item: null } }));
    showToast(`Activity saved to Day!`, 'success');
  };

  // Callback for saving Meal item
  const handleSaveMeal = (mealData) => {
    const dayId = modalState.meal.dayId;
    const serviceId = modalState.meal.serviceId;
    if (!dayId) return;

    setPackageData((prev) => {
      const day = prev.days.find((d) => d.id === dayId);
      if (!day) return prev;

      let updatedServices = [...(day.services || [])];
      let existingSvc = serviceId
        ? updatedServices.find((s) => s.id === serviceId)
        : updatedServices.find((s) => s.type === 'meal');

      if (existingSvc) {
        const existingItems = existingSvc.data?.items || [];
        const itemIdx = existingItems.findIndex((i) => i.id === mealData.id);
        let newItems;
        if (itemIdx >= 0) {
          newItems = existingItems.map((item, idx) => (idx === itemIdx ? { ...item, ...mealData } : item));
        } else {
          newItems = [...existingItems, mealData];
        }
        updatedServices = updatedServices.map((s) =>
          s.id === existingSvc.id
            ? { ...s, selected: true, data: { ...s.data, items: newItems } }
            : s
        );
      } else {
        const newSvc = {
          id: `svc-${Date.now()}-meal`,
          type: 'meal',
          selected: true,
          customizable: true,
          data: {
            items: [mealData]
          }
        };
        updatedServices.push(newSvc);
      }

      return {
        ...prev,
        days: prev.days.map((d) => (d.id === dayId ? { ...d, services: updatedServices } : d))
      };
    });

    setModalState((prev) => ({ ...prev, meal: { isOpen: false, dayId: null, serviceId: null, item: null } }));
    showToast(`Meal plan saved to Day!`, 'success');
  };

  /* =========================================================================
     SERVICE MANAGEMENT ACTIONS
     ========================================================================= */
  // Direct entry trigger for adding services (Opens search/entry modal without hardcoded mock records)
  const handleAddServiceToDay = (dayId, serviceType) => {
    handleOpenSearchModal(dayId, serviceType);
  };

  const handleUpdateServiceData = (dayId, serviceId, updatedData) => {
    setPackageData((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          services: (day.services || []).map((s) => (s.id === serviceId ? { ...s, data: { ...s.data, ...updatedData } } : s))
        };
      })
    }));
  };

  const handleDeleteService = (dayId, serviceId) => {
    setPackageData((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          services: (day.services || []).filter((s) => s.id !== serviceId)
        };
      })
    }));
    showToast('Service removed from day.', 'info');
  };

  const handleDuplicateService = (dayId, serviceId) => {
    const day = packageData.days.find((d) => d.id === dayId);
    if (!day) return;
    const svc = (day.services || []).find((s) => s.id === serviceId);
    if (!svc) return;

    const cloned = JSON.parse(JSON.stringify(svc));
    cloned.id = `svc-${Date.now()}-${svc.type}`;

    setPackageData((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.id === dayId ? { ...d, services: [...d.services, cloned] } : d))
    }));
    showToast(`Duplicated ${svc.type.toUpperCase()} service.`, 'success');
  };

  const handleToggleServiceCustomizable = (dayId, serviceId) => {
    setPackageData((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          services: (day.services || []).map((s) => (s.id === serviceId ? { ...s, customizable: !s.customizable } : s))
        };
      })
    }));
  };

  /* =========================================================================
     PDF EXPORT & SAVE ACTIONS
     ========================================================================= */
  const handleDownloadPdf = async () => {
    try {
      showToast('Rendering high-resolution package PDF...', 'info');
      const docElement = document.getElementById('pdf-document-root');
      const titleSlug = (packageData.title || packageData.destination || 'Holiday-Package').replace(/[^a-zA-Z0-9]/g, '-');
      const filename = `${titleSlug}-Voucher.pdf`;

      if (docElement) {
        await downloadElementAsPdf(docElement, filename, { ...packageData, pricingBreakdown });
      } else {
        generatePackagePdf({ ...packageData, pricingBreakdown }, filename);
      }
      showToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('Failed to generate PDF.', 'error');
    }
  };

  const handleSavePackage = async (status = 'Draft') => {
    setIsSaving(true);
    try {
      const payload = {
        id: packageData.id,
        packageName: packageData.title || 'Untitled Package',
        title: packageData.title || 'Untitled Package',
        city: packageData.destination || packageData.city || '',
        destination: packageData.destination || packageData.city || '',
        originCity: packageData.originCity || '',
        state: packageData.state || '',
        totalPrice: pricingBreakdown.final,
        offerPrice: pricingBreakdown.final,
        costPrice: pricingBreakdown.base,
        markupAmount: pricingBreakdown.markup,
        taxAmount: pricingBreakdown.tax,
        discountAmount: pricingBreakdown.discount,
        coverImage: packageData.coverImage || '',
        durationDays: packageData.days.length,
        durationNights: packageData.nights || Math.max(packageData.days.length - 1, 1),
        days: `${packageData.days.length} Days / ${packageData.nights || Math.max(packageData.days.length - 1, 1)} Nights`,
        startDate: packageData.startDate || '',
        endDate: packageData.endDate || '',
        customerName: packageData.customerName || packageData.customerInfo?.name || '',
        customerInfo: packageData.customerInfo || { name: packageData.customerName || '' },
        referenceId: packageData.referenceId || (packageData.id ? `PKG-${packageData.id}` : ''),
        tripId: packageData.tripId || (packageData.id ? String(packageData.id) : ''),
        consultantName: packageData.consultantName || '',
        highlights: packageData.highlights || [],
        inclusions: packageData.inclusions || [],
        exclusions: packageData.exclusions || [],
        terms: packageData.terms || [],
        cancellationPolicy: packageData.cancellationPolicy,
        dateChangePolicy: packageData.dateChangePolicy,
        status,
        itineraryData: {
          days: packageData.days,
          customization: packageData.customization,
          travelers: packageData.travelers,
          cancellationPolicy: packageData.cancellationPolicy,
          dateChangePolicy: packageData.dateChangePolicy
        },
        pricingRules: packageData.pricing,
        pricingBreakdown: pricingBreakdown
      };

      const saved = await savePackage(payload);
      const newId = saved?.id || packageData.id;

      const updatedState = {
        ...packageData,
        id: newId,
        referenceId: packageData.referenceId || (newId ? `PKG-${newId}` : ''),
        tripId: newId ? String(newId) : ''
      };

      setPackageData(updatedState);
      setLastSavedData(JSON.parse(JSON.stringify(updatedState)));

      if (onSavePackage) {
        onSavePackage({
          ...payload,
          id: newId,
          name: packageData.title,
          totalPrice: pricingBreakdown.final,
          offerPrice: pricingBreakdown.final
        });
      }

      showToast(
        status === 'Published'
          ? 'Package successfully published to website catalog!'
          : 'Package draft saved successfully.',
        'success'
      );
      return { success: true, package: saved };
    } catch (err) {
      console.error('Save package error:', err);
      showToast('Could not save to database. Preserved in memory.', 'error');
      return { success: false, error: err };
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPackage = () => {
    const cleanPackage = parsePackageIntoState(null);
    setPackageData(cleanPackage);
    setLastSavedData(JSON.parse(JSON.stringify(cleanPackage)));
    setModalState((prev) => ({ ...prev, resetConfirm: { isOpen: false } }));
    setMoreMenuOpen(false);
    showToast('Package reset to empty template.', 'info');
  };

  const handleDiscardAndProceed = () => {
    if (unsavedModalState.targetStep) {
      setActiveStep(unsavedModalState.targetStep);
    }
    setUnsavedModalState({ isOpen: false, targetStep: null });
  };

  const handleSaveAndProceed = async () => {
    const res = await handleSavePackage('Draft');
    if (res?.success) {
      if (unsavedModalState.targetStep) {
        setActiveStep(unsavedModalState.targetStep);
      }
      setUnsavedModalState({ isOpen: false, targetStep: null });
    }
  };

  return (
    <div id="package-builder-workspace" className="w-full bg-[#F6F7FB] text-[#0F172A] font-sans antialiased flex flex-col min-h-full">
      {/* =====================================================================
          1. PACKAGE BUILDER ACTION HEADER & BREADCRUMB
          ===================================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl mb-6 shadow-xs sticky top-0 z-30">
        <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/admin/packages')}
                className="text-blue-600 hover:underline cursor-pointer font-medium"
              >
                Holiday Packages
              </button>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-700 font-medium">Package Builder</span>
            </p>
            <h1 className="text-lg sm:text-xl font-bold text-[#0F172A]">
              {packageData.title || 'Create Holiday Package'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              id="btn-save-draft"
              onClick={() => handleSavePackage('Draft')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-medium transition cursor-pointer text-slate-700 shadow-xs"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              id="btn-preview"
              onClick={() => handleStepTransition('preview')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-medium transition cursor-pointer shadow-xs"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>

            <button
              type="button"
              id="btn-download-pdf"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-medium text-slate-700 transition cursor-pointer shadow-xs"
            >
              <FileDown className="w-4 h-4 text-orange-600" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              type="button"
              id="btn-publish"
              onClick={() => handleSavePackage('Published')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition cursor-pointer shadow-sm"
            >
              <Rocket className="w-4 h-4" />
              <span>Publish</span>
            </button>

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                id="btn-builder-more"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                title="More actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {moreMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-sm z-50 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setMoreMenuOpen(false);
                      setModalState((prev) => ({ ...prev, resetConfirm: { isOpen: true } }));
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left cursor-pointer font-medium"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Package</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEP NAVIGATION (Image-matched connected pill stepper) */}
        <div className="px-5 py-2.5 flex items-center gap-2 sm:gap-3 border-t border-slate-100 overflow-x-auto scrollbar-none bg-slate-50/70 rounded-b-xl">
          {[
            { id: 'info', label: 'Package Information', num: '01' },
            { id: 'itinerary', label: 'Itinerary Builder', num: '02' },
            { id: 'pricing', label: 'Pricing & Rules', num: '03' },
            { id: 'preview', label: 'Customer Preview', num: '04' },
            { id: 'publish', label: 'Publish', num: '05' }
          ].map((step, idx, arr) => {
            const activeIndex = arr.findIndex((s) => s.id === activeStep);
            const isCompleted = idx < activeIndex;
            const isActive = step.id === activeStep;

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <div
                    className={`w-3 sm:w-6 h-[2px] shrink-0 transition ${
                      idx <= activeIndex ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                  />
                )}

                <button
                  type="button"
                  id={`step-tab-${step.id}`}
                  onClick={() => handleStepTransition(step.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {isCompleted ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : isActive ? (
                    <span className="w-5 h-5 rounded-full bg-white/25 text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                      {step.num}
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[11px] font-bold shrink-0">
                      {step.num}
                    </span>
                  )}
                  <span>{step.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ===================================================================
          2. WORKSPACE & SUMMARY (TAB-DRIVEN VIEWS)
          =================================================================== */}
      <div className="flex-1 w-full">
          {/* TAB 1: PACKAGE INFORMATION FORM */}
          {activeStep === 'info' && (
            <PackageInfoForm
              packageData={packageData}
              setPackageData={setPackageData}
              onContinue={() => handleStepTransition('itinerary')}
              showToast={showToast}
            />
          )}

          {/* TAB 3: PRICING & COMMERCIAL RULES FORM */}
          {activeStep === 'pricing' && (
            <PricingRulesForm
              packageData={packageData}
              setPackageData={setPackageData}
              onBack={() => handleStepTransition('itinerary')}
              onContinue={() => handleStepTransition('preview')}
              showToast={showToast}
            />
          )}

          {/* TAB 4: CUSTOMER PREVIEW VOUCHER VIEW */}
          {activeStep === 'preview' && (
            <CustomerPreviewView
              packageData={{ ...packageData, pricingBreakdown }}
              onBack={() => handleStepTransition('pricing')}
              onContinue={() => handleStepTransition('publish')}
              showToast={showToast}
            />
          )}

          {/* TAB 5: PUBLISH VIEW */}
          {activeStep === 'publish' && (
            <PublishView
              packageData={packageData}
              onSavePackage={handleSavePackage}
              onBack={() => handleStepTransition('preview')}
              showToast={showToast}
            />
          )}

          {/* TAB 2: ITINERARY BUILDER (DUAL-COLUMN WORKSPACE) */}
          {activeStep === 'itinerary' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
            {/* LEFT COLUMN: ITINERARY WORKSPACE (8 COLUMNS) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Package Title & Travelers Card (Using Stepper Controls) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">
                      Package Title
                    </label>
                    <input
                      type="text"
                      value={packageData.title}
                      onChange={(e) => setPackageData({ ...packageData, title: e.target.value })}
                      placeholder="e.g. Magical Manali & Rohtang Pass Tour"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">
                      Destination City
                    </label>
                    <input
                      type="text"
                      value={packageData.destination}
                      onChange={(e) => setPackageData({ ...packageData, destination: e.target.value, city: e.target.value })}
                      placeholder="e.g. Manali"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <StepperControl
                      id="stepper-itinerary-adults"
                      label="Adults (12+ yrs)"
                      value={packageData.travelers?.adults || 2}
                      onChange={(val) =>
                        setPackageData((prev) => ({
                          ...prev,
                          travelers: { ...(prev.travelers || {}), adults: val }
                        }))
                      }
                      min={1}
                      max={20}
                      subLabel="Count"
                    />
                  </div>
                  <div>
                    <StepperControl
                      id="stepper-itinerary-children"
                      label="Children (2-11 yrs)"
                      value={packageData.travelers?.children || 0}
                      onChange={(val) =>
                        setPackageData((prev) => ({
                          ...prev,
                          travelers: { ...(prev.travelers || {}), children: val }
                        }))
                      }
                      min={0}
                      max={15}
                      subLabel="Count"
                    />
                  </div>
                  <div>
                    <StepperControl
                      id="stepper-itinerary-days"
                      label="Tour Duration"
                      value={packageData.days.length}
                      onChange={(val) => {
                        if (val > packageData.days.length) {
                          handleAddDay();
                        } else if (val < packageData.days.length && packageData.days.length > 1) {
                          handleDeleteDay(packageData.days[packageData.days.length - 1].id);
                        }
                      }}
                      min={1}
                      max={30}
                      suffix="Days"
                      subLabel={`${Math.max(packageData.days.length - 1, 1)} Nights`}
                    />
                  </div>
                </div>
              </div>

              {/* DAYS LIST CONTAINER */}
              <div id="days-container" className="space-y-5">
                {packageData.days.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-4 shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">No Itinerary Days Added Yet</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                        Start structuring this holiday package by adding Day 1. Search and add real flights, hotels, cabs, buses, activities, and sightseeings.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddDay}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Day 1
                    </button>
                  </div>
                ) : (
                  packageData.days.map((day, dayIndex) => (
                  <div
                    key={day.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, dayIndex)}
                    onDragOver={(e) => handleDragOver(e, dayIndex)}
                    onDrop={(e) => handleDrop(e, dayIndex)}
                    onDragEnd={handleDragEnd}
                    className={`day-card bg-white border rounded-xl overflow-hidden shadow-xs transition duration-150 ${
                      draggedDayIndex === dayIndex
                        ? 'opacity-40 border-orange-500 ring-2 ring-orange-400 scale-[0.99]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50/80 border-b border-slate-200">
                      {/* Drag / Reorder Buttons */}
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleMoveDay(dayIndex, -1)}
                          disabled={dayIndex === 0}
                          aria-label="Move day up"
                          title="Move day up"
                          className="hover:text-slate-800 disabled:opacity-20 cursor-pointer text-xs font-bold transition p-0.5"
                        >
                          ▲
                        </button>
                        <span className="cursor-grab active:cursor-grabbing p-0.5" title="Drag to reorder day">
                          <GripVertical className="w-4 h-4 text-slate-400 hover:text-orange-500 transition" />
                        </span>
                        <button
                          type="button"
                          onClick={() => handleMoveDay(dayIndex, 1)}
                          disabled={dayIndex === packageData.days.length - 1}
                          aria-label="Move day down"
                          title="Move day down"
                          className="hover:text-slate-800 disabled:opacity-20 cursor-pointer text-xs font-bold transition p-0.5"
                        >
                          ▼
                        </button>
                      </div>

                      {/* Day Number Badge */}
                      <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold text-xs shrink-0 tracking-wide">
                        DAY {dayIndex + 1}
                      </span>

                      {/* Day Title & Location */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-[#0F172A] truncate">{day.title}</p>
                          {day.location && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-200/80 text-slate-700">
                              {day.location}
                            </span>
                          )}
                        </div>
                        {day.description && !day.collapsed && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{day.description}</p>
                        )}
                      </div>

                      {/* Included Service Badges */}
                      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                        {(day.services || []).map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize"
                          >
                            {s.type}
                          </span>
                        ))}
                      </div>

                      {/* Day Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0 text-slate-400">
                        <button
                          onClick={() => handleDuplicateDay(day.id)}
                          aria-label="Duplicate Day"
                          title="Duplicate Day"
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setModalState((prev) => ({ ...prev, editDay: { isOpen: true, day } }))}
                          aria-label="Edit Day Information"
                          title="Edit Day Title & Details"
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleDayCollapse(day.id)}
                          aria-label={day.collapsed ? 'Expand Day' : 'Collapse Day'}
                          className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                        >
                          {day.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteDay(day.id)}
                          aria-label="Delete Day"
                          title="Delete Day"
                          className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Day Body (Collapsed / Expanded) */}
                    {!day.collapsed && (
                      <div className="p-5 space-y-4">
                        {/* Quick Add Service Bar */}
                        <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 px-2">
                            <Plus className="w-3.5 h-3.5 text-blue-600" /> Add Service:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenSearchModal(day.id, 'flight')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs text-slate-700 hover:text-blue-600 transition cursor-pointer font-medium shadow-2xs hover:shadow-xs"
                          >
                            <Plane className="w-3 h-3 text-blue-500" /> Flight
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSearchModal(day.id, 'hotel')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-xs text-slate-700 hover:text-indigo-600 transition cursor-pointer font-medium shadow-2xs hover:shadow-xs"
                          >
                            <Building2 className="w-3 h-3 text-indigo-500" /> Hotel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSearchModal(day.id, 'cab')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-xs text-slate-700 hover:text-emerald-600 transition cursor-pointer font-medium shadow-2xs hover:shadow-xs"
                          >
                            <Car className="w-3 h-3 text-emerald-500" /> Cab
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSearchModal(day.id, 'bus')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-xs text-slate-700 hover:text-amber-600 transition cursor-pointer font-medium shadow-2xs hover:shadow-xs"
                          >
                            <Bus className="w-3 h-3 text-amber-500" /> Bus
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddServiceToDay(day.id, 'sightseeing')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-400 text-xs text-slate-700 hover:text-teal-600 transition cursor-pointer font-medium shadow-2xs hover:shadow-xs"
                          >
                            <Mountain className="w-3 h-3 text-teal-500" /> Sightseeing
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddServiceToDay(day.id, 'activity')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-400 text-xs text-slate-700 hover:text-purple-600 transition cursor-pointer font-medium shadow-2xs hover:shadow-xs"
                          >
                            <Compass className="w-3 h-3 text-purple-500" /> Activity
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddServiceToDay(day.id, 'meal')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-400 text-xs text-slate-700 hover:text-rose-600 transition cursor-pointer font-medium shadow-2xs hover:shadow-xs"
                          >
                            <Utensils className="w-3 h-3 text-rose-500" /> Meal
                          </button>
                        </div>

                        {/* Service Cards List */}
                        <div className="space-y-4">
                          {(day.services || []).map((svc) => (
                            <div
                              key={svc.id}
                              className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
                            >
                              {/* Service Card Header */}
                              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/70 border-b border-slate-200">
                                <div className="flex items-center gap-2">
                                  {svc.type === 'flight' && <Plane className="w-4 h-4 text-blue-600" />}
                                  {svc.type === 'hotel' && <Building2 className="w-4 h-4 text-indigo-600" />}
                                  {svc.type === 'cab' && <Car className="w-4 h-4 text-emerald-600" />}
                                  {svc.type === 'bus' && <Bus className="w-4 h-4 text-amber-600" />}
                                  {svc.type === 'sightseeing' && <Mountain className="w-4 h-4 text-teal-600" />}
                                  {svc.type === 'activity' && <Compass className="w-4 h-4 text-purple-600" />}
                                  {svc.type === 'meal' && <Utensils className="w-4 h-4 text-rose-600" />}
                                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    {svc.type === 'cab' ? 'CAB / TRANSFER' : svc.type}
                                  </span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                                    Included
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 text-xs">
                                  <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={svc.customizable}
                                      onChange={() => handleToggleServiceCustomizable(day.id, svc.id)}
                                      className="rounded text-orange-500 focus:ring-orange-400 w-3.5 h-3.5"
                                    />
                                    <span>Customizable</span>
                                  </label>

                                  <button
                                    onClick={() => handleDuplicateService(day.id, svc.id)}
                                    aria-label="Duplicate Service"
                                    className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteService(day.id, svc.id)}
                                    aria-label="Delete Service"
                                    className="text-slate-400 hover:text-red-600 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Service Card Body */}
                              <div className="p-4">
                                {/* 1. FLIGHT BODY */}
                                {svc.type === 'flight' && (
                                  <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-3">
                                        <span className="font-bold text-base text-[#0F172A]">
                                          {svc.data?.from || 'DEL'}
                                        </span>
                                        <div className="flex items-center gap-1 text-slate-400 text-xs">
                                          <span>{svc.data?.departure || '09:20'}</span>
                                          <ArrowRight className="w-3 h-3" />
                                          <span>{svc.data?.arrival || '11:35'}</span>
                                        </div>
                                        <span className="font-bold text-base text-[#0F172A]">
                                          {svc.data?.to || 'KUU'}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-500">
                                        {svc.data?.airline || 'IndiGo'} · {svc.data?.flightNumber || '6E 1234'} · {svc.data?.duration || '2h 15m'} · {svc.data?.cabin || 'Economy'}
                                      </p>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-base font-bold text-[#0F172A]">
                                        {inr(svc.data?.fare || 5500)}
                                        <span className="text-xs font-normal text-slate-500"> / person</span>
                                      </p>
                                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                                        <Check className="w-3 h-3" /> API Selected
                                      </span>
                                    </div>

                                    <button
                                      onClick={() =>
                                        setModalState((prev) => ({
                                          ...prev,
                                          flight: {
                                            isOpen: true,
                                            dayId: day.id,
                                            serviceId: svc.id,
                                            initialData: svc.data || {}
                                          }
                                        }))
                                      }
                                      className="px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-semibold transition cursor-pointer"
                                    >
                                      Change Flight
                                    </button>
                                  </div>
                                )}

                                {/* 2. HOTEL BODY */}
                                {svc.type === 'hotel' && (
                                  <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <img
                                        src={
                                          svc.data?.image ||
                                          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=400&auto=format&fit=crop'
                                        }
                                        alt={svc.data?.name}
                                        className="w-16 h-16 rounded-lg object-cover shrink-0 bg-slate-100"
                                      />
                                      <div className="min-w-0">
                                        <p className="font-semibold text-sm text-[#0F172A] truncate">
                                          {svc.data?.name || 'Snow Valley Resort'}
                                        </p>
                                        <div className="flex items-center gap-1 text-amber-500 text-xs">
                                          {'★'.repeat(svc.data?.stars || 4)}
                                          <span className="text-slate-500 ml-1">
                                            {svc.data?.rating || 4.2} ({svc.data?.reviews || 1420} reviews)
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                          {svc.data?.room || 'Deluxe Room'} · <span className="text-emerald-700 font-medium">{svc.data?.meal || 'Breakfast Included'}</span>
                                        </p>
                                      </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                      <p className="text-sm font-bold text-[#0F172A]">
                                        {inr(svc.data?.price || 4500)}
                                        <span className="text-xs font-normal text-slate-500"> / night</span>
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Total ({svc.data?.nights || 1}N): {inr((svc.data?.price || 4500) * (svc.data?.nights || 1))}
                                      </p>
                                    </div>

                                    <button
                                      onClick={() =>
                                        setModalState((prev) => ({
                                          ...prev,
                                          hotel: {
                                            isOpen: true,
                                            dayId: day.id,
                                            serviceId: svc.id,
                                            initialData: svc.data || {}
                                          }
                                        }))
                                      }
                                      className="px-3 py-1.5 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold transition cursor-pointer shrink-0"
                                    >
                                      Change Hotel
                                    </button>
                                  </div>
                                )}

                                {/* 3. CAB BODY */}
                                {svc.type === 'cab' && (
                                  <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <span className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Car className="w-5 h-5" />
                                      </span>
                                      <div>
                                        <p className="font-semibold text-sm text-[#0F172A]">
                                          {svc.data?.vehicle || 'Toyota Etios'} ({svc.data?.category || 'Sedan'})
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {svc.data?.pickup || 'Airport'} → {svc.data?.drop || 'Resort'} · {svc.data?.seats || 4} Seats {svc.data?.ac ? '· AC' : ''}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-base font-bold text-[#0F172A]">
                                        {inr(svc.data?.price || 2500)}
                                      </p>
                                      <p className="text-[11px] text-slate-500">Tolls &amp; Driver Included</p>
                                    </div>

                                    <button
                                      onClick={() =>
                                        setModalState((prev) => ({
                                          ...prev,
                                          cab: {
                                            isOpen: true,
                                            dayId: day.id,
                                            serviceId: svc.id,
                                            initialData: svc.data || {}
                                          }
                                        }))
                                      }
                                      className="px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-xs font-semibold transition cursor-pointer shrink-0"
                                    >
                                      Change Cab
                                    </button>
                                  </div>
                                )}

                                {/* 4. BUS BODY */}
                                {svc.type === 'bus' && (
                                  <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <span className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                        <Bus className="w-5 h-5" />
                                      </span>
                                      <div>
                                        <p className="font-semibold text-sm text-[#0F172A]">
                                          {svc.data?.operator || 'HRTC Volvo'} ({svc.data?.busType || 'AC Sleeper'})
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {svc.data?.from || 'Delhi'} → {svc.data?.to || 'Manali'} · Dep: {svc.data?.departure || '21:00'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-base font-bold text-[#0F172A]">
                                        {inr(svc.data?.price || 1400)}
                                        <span className="text-xs font-normal text-slate-500"> / person</span>
                                      </p>
                                      <p className="text-[11px] text-slate-500">Confirmed Seat</p>
                                    </div>

                                    <button
                                      onClick={() =>
                                        setModalState((prev) => ({
                                          ...prev,
                                          bus: {
                                            isOpen: true,
                                            dayId: day.id,
                                            serviceId: svc.id,
                                            initialData: svc.data || {}
                                          }
                                        }))
                                      }
                                      className="px-3 py-1.5 rounded-lg border border-amber-600 text-amber-600 hover:bg-amber-50 text-xs font-semibold transition cursor-pointer shrink-0"
                                    >
                                      Change Bus
                                    </button>
                                  </div>
                                )}

                                {/* 5. SIGHTSEEING BODY */}
                                {svc.type === 'sightseeing' && (
                                  <div className="space-y-3">
                                    {(svc.data?.items || []).map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                                      >
                                        <div className="flex items-center gap-3">
                                          {item.image && (
                                            <img
                                              src={item.image}
                                              alt={item.name}
                                              className="w-12 h-12 rounded-lg object-cover"
                                            />
                                          )}
                                          <div>
                                            <p className="font-semibold text-xs text-[#0F172A]">{item.name}</p>
                                            <p className="text-[11px] text-slate-500">{item.location} · {item.duration}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs font-bold text-slate-800">
                                            {item.price ? inr(item.price) : 'Free'}
                                          </span>
                                          <button
                                            onClick={() => {
                                              const updated = (svc.data?.items || []).filter((i) => i.id !== item.id);
                                              handleUpdateServiceData(day.id, svc.id, { items: updated });
                                            }}
                                            aria-label="Remove sight"
                                            className="text-slate-400 hover:text-red-600 text-xs cursor-pointer"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      onClick={() =>
                                        setModalState((prev) => ({
                                          ...prev,
                                          sightseeing: { isOpen: true, dayId: day.id, serviceId: svc.id, item: null }
                                        }))
                                      }
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Add Sightseeing Place
                                    </button>
                                  </div>
                                )}

                                {/* 6. ACTIVITY BODY */}
                                {svc.type === 'activity' && (
                                  <div className="space-y-3">
                                    {(svc.data?.items || []).map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Compass className="w-4 h-4 text-purple-600" />
                                          <div>
                                            <p className="font-semibold text-xs text-[#0F172A]">{item.name}</p>
                                            <p className="text-[11px] text-slate-500">Duration: {item.duration || '1-2 hrs'}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs font-bold text-slate-800">{inr(item.price)}</span>
                                          <button
                                            onClick={() => {
                                              const updated = (svc.data?.items || []).filter((i) => i.id !== item.id);
                                              handleUpdateServiceData(day.id, svc.id, { items: updated });
                                            }}
                                            aria-label="Remove activity"
                                            className="text-slate-400 hover:text-red-600 text-xs cursor-pointer"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      onClick={() =>
                                        setModalState((prev) => ({
                                          ...prev,
                                          activity: { isOpen: true, dayId: day.id, serviceId: svc.id, item: null }
                                        }))
                                      }
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Add Adventure Activity
                                    </button>
                                  </div>
                                )}

                                {/* 7. MEAL BODY */}
                                {svc.type === 'meal' && (
                                  <div className="space-y-2">
                                    {(svc.data?.items || []).map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-50"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Utensils className="w-3.5 h-3.5 text-rose-500" />
                                          <div>
                                            <p className="font-medium text-xs text-[#0F172A]">{item.name}</p>
                                            <p className="text-[11px] text-slate-500">{item.description}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-xs font-bold text-slate-800">
                                            {item.price > 0 ? inr(item.price) : 'Included'}
                                          </span>
                                          <button
                                            onClick={() => {
                                              const updated = (svc.data?.items || []).filter((i) => i.id !== item.id);
                                              handleUpdateServiceData(day.id, svc.id, { items: updated });
                                            }}
                                            aria-label="Remove meal"
                                            className="text-slate-400 hover:text-red-600 text-xs cursor-pointer"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      onClick={() =>
                                        setModalState((prev) => ({
                                          ...prev,
                                          meal: { isOpen: true, dayId: day.id, serviceId: svc.id, item: null }
                                        }))
                                      }
                                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer pt-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Add Meal Plan
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              </div>

              {/* Add Day & Duplicate Last Day Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddDay}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-sm font-semibold text-blue-600 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Day
                </button>
                <button
                  onClick={() => {
                    const lastDay = packageData.days[packageData.days.length - 1];
                    if (lastDay) handleDuplicateDay(lastDay.id);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-sm font-medium text-slate-700 transition cursor-pointer"
                >
                  <Copy className="w-4 h-4" /> Duplicate Last Day
                </button>
              </div>

              {/* Pricing & Rules Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <h3 className="font-semibold text-sm text-[#0F172A] mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                  Pricing &amp; Agency Rules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">
                      Markup (₹)
                    </label>
                    <input
                      type="number"
                      value={packageData.pricing.markup}
                      onChange={(e) =>
                        setPackageData({
                          ...packageData,
                          pricing: { ...packageData.pricing, markup: Number(e.target.value) || 0 }
                        })
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">
                      Taxes &amp; GST (₹)
                    </label>
                    <input
                      type="number"
                      value={packageData.pricing.tax}
                      onChange={(e) =>
                        setPackageData({
                          ...packageData,
                          pricing: { ...packageData.pricing, tax: Number(e.target.value) || 0 }
                        })
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={packageData.pricing.discount}
                      onChange={(e) =>
                        setPackageData({
                          ...packageData,
                          pricing: { ...packageData.pricing, discount: Number(e.target.value) || 0 }
                        })
                      }
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Stage Navigation: Back and Continue */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleStepTransition('info')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  ← Back to Package Info
                </button>
                <button
                  type="button"
                  onClick={() => handleStepTransition('pricing')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <span>Continue to Pricing &amp; Rules</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: STICKY SUMMARY PANEL (4 COLUMNS) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Hero Cover Image Card */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="relative h-44 group">
                    <img
                      src={packageData.coverImage}
                      alt={packageData.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-500 text-white uppercase tracking-wider">
                          {packageData.destination}
                        </span>
                        <h3 className="text-white font-bold text-sm mt-1 leading-tight">
                          {packageData.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <p className="text-slate-400 text-[11px]">Duration</p>
                      <p className="font-semibold text-slate-800">
                        {packageData.days.length}D / {Math.max(packageData.days.length - 1, 1)}N
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[11px]">Travelers</p>
                      <p className="font-semibold text-slate-800">
                        {packageData.travelers.adults} Adults · {packageData.travelers.children} Child
                      </p>
                    </div>
                  </div>
                </div>

                {/* Included Services Checklist */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-3">
                    Included Components
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Plane className="w-3.5 h-3.5 text-blue-500" /> Flights ({serviceCounts.flights})
                      </span>
                      {serviceCounts.flights > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Hotels ({serviceCounts.hotels})
                      </span>
                      {serviceCounts.hotels > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Car className="w-3.5 h-3.5 text-emerald-500" /> Cabs &amp; Transfers ({serviceCounts.cabs})
                      </span>
                      {serviceCounts.cabs > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Bus className="w-3.5 h-3.5 text-amber-500" /> Buses ({serviceCounts.buses})
                      </span>
                      {serviceCounts.buses > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Mountain className="w-3.5 h-3.5 text-teal-500" /> Sightseeing ({serviceCounts.sightseeing})
                      </span>
                      {serviceCounts.sightseeing > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Compass className="w-3.5 h-3.5 text-purple-500" /> Activities ({serviceCounts.activities})
                      </span>
                      {serviceCounts.activities > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-slate-700">
                        <Utensils className="w-3.5 h-3.5 text-rose-500" /> Meals ({serviceCounts.meals})
                      </span>
                      {serviceCounts.meals > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Cost Breakdown Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500">
                    Pricing Breakdown
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Flights Total:</span>
                      <span className="font-medium text-slate-800">{inr(pricingBreakdown.flights)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hotels Total:</span>
                      <span className="font-medium text-slate-800">{inr(pricingBreakdown.hotels)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cabs Total:</span>
                      <span className="font-medium text-slate-800">{inr(pricingBreakdown.cabs)}</span>
                    </div>
                    {pricingBreakdown.buses > 0 && (
                      <div className="flex justify-between">
                        <span>Buses Total:</span>
                        <span className="font-medium text-slate-800">{inr(pricingBreakdown.buses)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Sightseeing:</span>
                      <span className="font-medium text-slate-800">{inr(pricingBreakdown.sightseeing)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Activities:</span>
                      <span className="font-medium text-slate-800">{inr(pricingBreakdown.activities)}</span>
                    </div>
                    {pricingBreakdown.meals > 0 && (
                      <div className="flex justify-between">
                        <span>Meals:</span>
                        <span className="font-medium text-slate-800">{inr(pricingBreakdown.meals)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-100 pt-2 flex justify-between font-semibold text-slate-700">
                      <span>Base Services Cost:</span>
                      <span>{inr(pricingBreakdown.base)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Agency Markup:</span>
                      <span>+{inr(pricingBreakdown.markup)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Taxes &amp; GST:</span>
                      <span>+{inr(pricingBreakdown.tax)}</span>
                    </div>
                    {pricingBreakdown.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount:</span>
                        <span>-{inr(pricingBreakdown.discount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Final Package Price</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {inr(pricingBreakdown.final)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Per Person</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {inr(pricingBreakdown.perPerson)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Primary Summary Action Buttons */}
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => handleStepTransition('preview')}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold transition cursor-pointer"
                    >
                      <Eye className="w-4 h-4" /> Preview Package
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition cursor-pointer shadow-sm"
                    >
                      <FileDown className="w-4 h-4" /> Download Package PDF
                    </button>
                  </div>
                </div>

                {/* Package Customization Switches */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Customer Customization Permissions
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Allow travelers to modify these components during customer checkout.
                  </p>
                  <div className="space-y-3 text-xs">
                    {['flight', 'hotel', 'cab', 'bus', 'sightseeing', 'activity', 'meal'].map((key) => (
                      <label key={key} className="flex items-center justify-between cursor-pointer">
                        <span className="capitalize font-medium text-slate-700">{key} Customization</span>
                        <input
                          type="checkbox"
                          checked={Boolean(packageData.customization[key])}
                          onChange={(e) =>
                            setPackageData({
                              ...packageData,
                              customization: { ...packageData.customization, [key]: e.target.checked }
                            })
                          }
                          className="rounded text-orange-500 focus:ring-orange-400 w-4 h-4"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

      {/* =====================================================================
          4. SEARCH MODALS (FLIGHT, HOTEL, CAB, BUS) WIRED WITH AUTOCOMPLETE
          ===================================================================== */}
      <FlightSearchModal
        isOpen={modalState.flight.isOpen}
        initialData={modalState.flight.initialData}
        onClose={() => setModalState((prev) => ({ ...prev, flight: { ...prev.flight, isOpen: false } }))}
        onSelectFlight={(selectedFlight) => {
          if (modalState.flight.serviceId) {
            handleUpdateServiceData(modalState.flight.dayId, modalState.flight.serviceId, selectedFlight);
          } else {
            handleSelectFlight(selectedFlight);
          }
        }}
        showToast={showToast}
      />

      <HotelSearchModal
        isOpen={modalState.hotel.isOpen}
        initialData={modalState.hotel.initialData}
        onClose={() => setModalState((prev) => ({ ...prev, hotel: { ...prev.hotel, isOpen: false } }))}
        onSelectHotel={(selectedHotel) => {
          if (modalState.hotel.serviceId) {
            handleUpdateServiceData(modalState.hotel.dayId, modalState.hotel.serviceId, selectedHotel);
          } else {
            handleSelectHotel(selectedHotel);
          }
        }}
        showToast={showToast}
      />

      <CabSearchModal
        isOpen={modalState.cab.isOpen}
        initialData={modalState.cab.initialData}
        onClose={() => setModalState((prev) => ({ ...prev, cab: { ...prev.cab, isOpen: false } }))}
        onSelectCab={(selectedCab) => {
          if (modalState.cab.serviceId) {
            handleUpdateServiceData(modalState.cab.dayId, modalState.cab.serviceId, selectedCab);
          } else {
            handleSelectCab(selectedCab);
          }
        }}
        showToast={showToast}
      />

      <BusSearchModal
        isOpen={modalState.bus.isOpen}
        initialData={modalState.bus.initialData}
        onClose={() => setModalState((prev) => ({ ...prev, bus: { ...prev.bus, isOpen: false } }))}
        onSelectBus={(selectedBus) => {
          if (modalState.bus.serviceId) {
            handleUpdateServiceData(modalState.bus.dayId, modalState.bus.serviceId, selectedBus);
          } else {
            handleSelectBus(selectedBus);
          }
        }}
        showToast={showToast}
      />

      {/* =====================================================================
          5. CUSTOMER PREVIEW MODAL WITH DIRECT PDF DOWNLOAD
          ===================================================================== */}
      {modalState.customerPreview.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 sm:p-6 overflow-y-auto flex justify-center items-start animate-in fade-in duration-150">
          <div className="bg-slate-50 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-4 relative">
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                  TP
                </span>
                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">Customer Package Preview</h2>
                  <p className="text-[11px] text-slate-500">Official PDF-Style Itinerary Voucher</p>
                </div>
              </div>
              <button
                onClick={() => setModalState((prev) => ({ ...prev, customerPreview: { isOpen: false } }))}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <CustomerPreviewView
                packageData={{ ...packageData, pricingBreakdown }}
                onBack={() => setModalState((prev) => ({ ...prev, customerPreview: { isOpen: false } }))}
                onContinue={() => {
                  setModalState((prev) => ({ ...prev, customerPreview: { isOpen: false } }));
                  setActiveStep('publish');
                }}
                showToast={showToast}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. DAY EDIT MODAL
          ===================================================================== */}
      {modalState.editDay.isOpen && modalState.editDay.day && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-[#0F172A]">Edit Day Details</h3>
              <button
                onClick={() => setModalState((prev) => ({ ...prev, editDay: { isOpen: false, day: null } }))}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
                <input
                  type="text"
                  value={modalState.editDay.day.title}
                  onChange={(e) =>
                    setModalState((prev) => ({
                      ...prev,
                      editDay: { ...prev.editDay, day: { ...prev.editDay.day, title: e.target.value } }
                    }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Location</label>
                <input
                  type="text"
                  value={modalState.editDay.day.location || ''}
                  onChange={(e) =>
                    setModalState((prev) => ({
                      ...prev,
                      editDay: { ...prev.editDay, day: { ...prev.editDay.day, location: e.target.value } }
                    }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
                <textarea
                  rows="3"
                  value={modalState.editDay.day.description || ''}
                  onChange={(e) =>
                    setModalState((prev) => ({
                      ...prev,
                      editDay: { ...prev.editDay, day: { ...prev.editDay.day, description: e.target.value } }
                    }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalState((prev) => ({ ...prev, editDay: { isOpen: false, day: null } }))}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const updatedDay = modalState.editDay.day;
                  setPackageData((prev) => ({
                    ...prev,
                    days: prev.days.map((d) => (d.id === updatedDay.id ? updatedDay : d))
                  }));
                  setModalState((prev) => ({ ...prev, editDay: { isOpen: false, day: null } }));
                  showToast('Day details updated.', 'success');
                }}
                className="px-4 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          7. RESET CONFIRMATION MODAL
          ===================================================================== */}
      {modalState.resetConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#0F172A]">Reset Package Builder?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to reset all days and services? This action will clear current edits.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setModalState((prev) => ({ ...prev, resetConfirm: { isOpen: false } }))}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPackage}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          8. UNSAVED CHANGES PROMPT MODAL
          ===================================================================== */}
      {unsavedModalState.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-200 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#0F172A]">Unsaved Changes</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You have made changes in the current step that have not been saved. Would you like to save your draft before navigating away?
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUnsavedModalState({ isOpen: false, targetStep: null })}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition cursor-pointer text-center"
              >
                Stay Here
              </button>
              <button
                type="button"
                onClick={handleDiscardAndProceed}
                className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer text-center"
              >
                Discard &amp; Leave
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveAndProceed}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition cursor-pointer shadow-xs disabled:opacity-50 text-center"
              >
                {isSaving ? 'Saving Draft...' : 'Save Draft & Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Off-screen Customer Preview container for high-fidelity PDF capture when not in preview tab */}
      {activeStep !== 'preview' && (
        <div
          className="fixed -left-[9999px] top-0 w-[800px] pointer-events-none opacity-0 overflow-hidden"
          aria-hidden="true"
        >
          <CustomerPreviewView
            packageData={{ ...packageData, pricingBreakdown }}
            onBack={() => {}}
            onContinue={() => {}}
            showToast={() => {}}
          />
        </div>
      )}
    </div>
  );
}
