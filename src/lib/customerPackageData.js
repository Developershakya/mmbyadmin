/**
 * Centralized Single Source of Truth for Customer-Facing Package Data
 * Ensures Customer Preview, Download PDF, and Copy JSON represent the EXACT same configured data and visibility settings.
 */

export const DEFAULT_POLICY_VISIBILITY = {
  terms: true,
  cancellation: true,
  dateChange: true,
  booking: true,
  payment: true,
  refund: true,
  child: true,
  hotel: true,
  transportation: true
};

export const DEFAULT_CANCELLATION_RULES = [
  { timeframe: '30+ Days Before Departure', charge: '10% of Package Value', refund: '90% Refund within 7 working days' },
  { timeframe: '15 to 29 Days Before Departure', charge: '25% of Package Value', refund: '75% Refund within 7 working days' },
  { timeframe: '7 to 14 Days Before Departure', charge: '50% of Package Value', refund: '50% Refund within 7 working days' },
  { timeframe: 'Within 7 Days of Departure / No Show', charge: '100% of Package Value', refund: 'Non-refundable' }
];

export const DEFAULT_DATE_CHANGE_RULES = [
  { timeframe: 'Up to 15 Days Before Departure', charge: 'Free Date Rescheduling', remark: 'Hotel & airline fare difference applies' },
  { timeframe: '7 to 14 Days Before Departure', charge: '₹1,500 per person change fee', remark: '+ airline/hotel fare difference' },
  { timeframe: 'Less than 7 Days Before Departure', charge: 'Subject to Supplier Approval', remark: 'Treated as cancellation if not approved' }
];

export const DEFAULT_PRICE_BREAKDOWN_VISIBILITY = {
  showBreakdown: true,
  flights: true,
  hotels: true,
  cabs: true,
  buses: true,
  sightseeing: true,
  activities: true,
  meals: true,
  markup: true,
  tax: true,
  discount: true,
  grandTotal: true
};

/**
 * Returns normalized customer-facing package data based on visibility toggles.
 * @param {Object} rawPackageData - The full builder or saved package state.
 * @returns {Object} Customer-facing package data object.
 */
export function getCustomerFacingPackageData(rawPackageData = {}) {
  const pkg = rawPackageData || {};

  // 1. Resolve visibility settings
  const policyVis = {
    ...DEFAULT_POLICY_VISIBILITY,
    ...(pkg.policyVisibility || pkg.itineraryData?.policyVisibility || {})
  };

  const priceBreakdownVis = {
    ...DEFAULT_PRICE_BREAKDOWN_VISIBILITY,
    ...(pkg.priceBreakdownVisibility || pkg.itineraryData?.priceBreakdownVisibility || {})
  };

  // 2. Count service totals and compute dynamic pricing breakdown if not provided
  let flights = 0, hotels = 0, cabs = 0, buses = 0, sightseeing = 0, activities = 0, meals = 0;
  let countFlights = 0, countHotels = 0, countCabs = 0, countBuses = 0, countSightseeing = 0, countActivities = 0, countMeals = 0;

  const travelers = pkg.travelers || { adults: 2, children: 0, infants: 0 };
  const adults = Number(travelers.adults) || 2;
  const children = Number(travelers.children) || 0;
  const totalTravelers = Math.max(adults + children, 1);

  const days = Array.isArray(pkg.days) ? pkg.days : (pkg.itineraryData?.days || []);

  days.forEach((day) => {
    (day.services || []).forEach((svc) => {
      if (!svc.selected) return;
      if (svc.type === 'flight') {
        countFlights++;
        const apiTotal = svc.data?.totalFare ?? svc.data?.totalPrice;
        if (apiTotal != null && !svc.data?.isManual) {
          flights += Number(apiTotal) || 0;
        } else if (svc.data?.apiSelected) {
          flights += Number(svc.data?.fare || svc.data?.price || 0);
        } else {
          flights += (Number(svc.data?.fare || 0) + Number(svc.data?.tax || 0)) * totalTravelers;
        }
      } else if (svc.type === 'hotel') {
        countHotels++;
        const apiTotal = svc.data?.totalPrice ?? svc.data?.totalFare;
        if (apiTotal != null) {
          hotels += Number(apiTotal) || 0;
        } else {
          const price = Number(svc.data?.price) || 0;
          const nights = Number(svc.data?.nights) || 1;
          hotels += price * nights;
        }
      } else if (svc.type === 'cab') {
        countCabs++;
        cabs += Number(svc.data?.totalPrice ?? svc.data?.price) || 0;
      } else if (svc.type === 'bus') {
        countBuses++;
        const apiTotal = svc.data?.totalPrice ?? svc.data?.totalFare;
        if (apiTotal != null && !svc.data?.isManual) {
          buses += Number(apiTotal) || 0;
        } else if (Array.isArray(svc.data?.selectedSeats) && svc.data.selectedSeats.length > 0) {
          const seatSum = svc.data.selectedSeats.reduce((acc, s) => acc + (Number(s.Fare) || 0), 0);
          buses += seatSum > 0 ? seatSum : Number(svc.data?.price || 0);
        } else if (svc.data?.apiSelected) {
          buses += Number(svc.data?.price || 0);
        } else {
          buses += (Number(svc.data?.price) || 0) * totalTravelers;
        }
      } else if (svc.type === 'sightseeing') {
        (svc.data?.items || []).forEach((item) => {
          countSightseeing++;
          sightseeing += (Number(item.price) || 0) * totalTravelers;
        });
      } else if (svc.type === 'activity') {
        (svc.data?.items || []).forEach((item) => {
          countActivities++;
          activities += (Number(item.price) || 0) * totalTravelers;
        });
      } else if (svc.type === 'meal') {
        (svc.data?.items || []).forEach((item) => {
          if (item.enabled !== false) {
            countMeals++;
            meals += (Number(item.price) || 0) * totalTravelers;
          }
        });
      }
    });
  });

  const pricingRules = pkg.pricing || pkg.pricingRules || {};
  const baseCost = flights + hotels + cabs + buses + sightseeing + activities + meals;
  const markup = Number(pricingRules.markup) || 0;
  const tax = Number(pricingRules.tax) || 0;
  const discount = Number(pricingRules.discount) || 0;
  const finalPrice = Math.max(baseCost + markup + tax - discount, 0);
  const perPersonPrice = Math.round(finalPrice / totalTravelers);

  // Active pricing object (prefer precomputed pricingBreakdown if available)
  const activePricing = {
    flights: pkg.pricingBreakdown?.flights ?? flights,
    hotels: pkg.pricingBreakdown?.hotels ?? hotels,
    cabs: pkg.pricingBreakdown?.cabs ?? cabs,
    buses: pkg.pricingBreakdown?.buses ?? buses,
    sightseeing: pkg.pricingBreakdown?.sightseeing ?? sightseeing,
    activities: pkg.pricingBreakdown?.activities ?? activities,
    meals: pkg.pricingBreakdown?.meals ?? meals,
    base: pkg.pricingBreakdown?.base ?? baseCost,
    markup: pkg.pricingBreakdown?.markup ?? markup,
    tax: pkg.pricingBreakdown?.tax ?? tax,
    discount: pkg.pricingBreakdown?.discount ?? discount,
    final: pkg.pricingBreakdown?.final ?? (pkg.totalPrice || finalPrice),
    perPerson: pkg.pricingBreakdown?.perPerson ?? perPersonPrice
  };

  // 3. Filter Price Breakdown Items according to priceBreakdownVis
  const showPriceBreakdown = priceBreakdownVis.showBreakdown !== false;
  const rawBreakdownItems = [
    {
      key: 'flights',
      label: 'Flights / Airfare',
      amount: activePricing.flights,
      count: countFlights,
      enabled: priceBreakdownVis.flights !== false
    },
    {
      key: 'hotels',
      label: 'Hotel Accommodations',
      amount: activePricing.hotels,
      count: countHotels,
      enabled: priceBreakdownVis.hotels !== false
    },
    {
      key: 'cabs',
      label: 'Private Transfers & Cabs',
      amount: activePricing.cabs,
      count: countCabs,
      enabled: priceBreakdownVis.cabs !== false
    },
    {
      key: 'buses',
      label: 'Volvo / Intercity Buses',
      amount: activePricing.buses,
      count: countBuses,
      enabled: priceBreakdownVis.buses !== false
    },
    {
      key: 'sightseeing',
      label: 'Sightseeing Tours',
      amount: activePricing.sightseeing,
      count: countSightseeing,
      enabled: priceBreakdownVis.sightseeing !== false
    },
    {
      key: 'activities',
      label: 'Adventure Activities',
      amount: activePricing.activities,
      count: countActivities,
      enabled: priceBreakdownVis.activities !== false
    },
    {
      key: 'meals',
      label: 'Meal Inclusions',
      amount: activePricing.meals,
      count: countMeals,
      enabled: priceBreakdownVis.meals !== false
    },
    {
      key: 'markup',
      label: 'Agency Margin / Markup',
      amount: activePricing.markup,
      count: null,
      enabled: priceBreakdownVis.markup !== false
    },
    {
      key: 'tax',
      label: 'Taxes & GST',
      amount: activePricing.tax,
      count: null,
      enabled: priceBreakdownVis.tax !== false
    },
    {
      key: 'discount',
      label: 'Promotional Discount',
      amount: activePricing.discount ? -activePricing.discount : 0,
      isNegative: true,
      count: null,
      enabled: priceBreakdownVis.discount !== false
    }
  ];

  const visibleBreakdownItems = showPriceBreakdown
    ? rawBreakdownItems.filter(
        (item) => item.enabled && (item.amount !== 0 || (item.count && item.count > 0))
      )
    : [];

  // 4. Filter Policies according to policyVis
  const visiblePolicies = [];

  // Terms & Conditions
  const rawTerms = Array.isArray(pkg.terms)
    ? pkg.terms
    : (Array.isArray(pkg.termsAndConditions) ? pkg.termsAndConditions : []);
  if (policyVis.terms !== false && rawTerms.length > 0) {
    visiblePolicies.push({
      key: 'terms',
      title: 'Terms & Conditions',
      type: 'list',
      items: rawTerms
    });
  }

  // Cancellation Policy
  const rawCancellation = pkg.cancellationPolicy;
  if (policyVis.cancellation !== false) {
    const rules = Array.isArray(rawCancellation?.rules) && rawCancellation.rules.length > 0
      ? rawCancellation.rules
      : DEFAULT_CANCELLATION_RULES;
    visiblePolicies.push({
      key: 'cancellation',
      title: 'Cancellation & Refund Policy',
      type: 'rules',
      rules,
      notes: rawCancellation?.notes || ''
    });
  }

  // Date Change Policy
  const rawDateChange = pkg.dateChangePolicy;
  if (policyVis.dateChange !== false) {
    const rules = Array.isArray(rawDateChange?.rules) && rawDateChange.rules.length > 0
      ? rawDateChange.rules
      : DEFAULT_DATE_CHANGE_RULES;
    visiblePolicies.push({
      key: 'dateChange',
      title: 'Date Change & Rescheduling Policy',
      type: 'rules',
      rules,
      notes: rawDateChange?.notes || ''
    });
  }

  // Custom / Other Policies (including Booking, Payment, Child, Hotel, Transportation if configured in otherPolicies)
  const rawOtherPolicies = Array.isArray(pkg.otherPolicies) ? pkg.otherPolicies : [];
  rawOtherPolicies.forEach((pol, idx) => {
    const polKey = pol.key || pol.id || `custom-${idx}`;
    const titleLower = (pol.title || '').toLowerCase();
    let matchingVisKey = polKey;
    if (titleLower.includes('booking')) matchingVisKey = 'booking';
    else if (titleLower.includes('payment')) matchingVisKey = 'payment';
    else if (titleLower.includes('refund')) matchingVisKey = 'refund';
    else if (titleLower.includes('child')) matchingVisKey = 'child';
    else if (titleLower.includes('hotel')) matchingVisKey = 'hotel';
    else if (titleLower.includes('transport')) matchingVisKey = 'transportation';

    // Check if explicitly disabled either on the item or via policyVis dictionary
    const isVisible =
      pol.enabled !== false &&
      pol.visible !== false &&
      policyVis[polKey] !== false &&
      policyVis[matchingVisKey] !== false &&
      policyVis[pol.title] !== false;

    const hasPoints = Array.isArray(pol.points) && pol.points.length > 0;
    const hasRules = Array.isArray(pol.rules) && pol.rules.length > 0;
    const hasContent = Boolean(pol.content);

    if (isVisible && (hasPoints || hasRules || hasContent)) {
      visiblePolicies.push({
        key: polKey,
        title: pol.title || `Policy Section ${idx + 1}`,
        type: hasPoints ? 'list' : (hasRules ? 'rules' : 'text'),
        items: hasPoints ? pol.points : undefined,
        rules: hasRules ? pol.rules : undefined,
        content: pol.content || '',
        notes: pol.notes || ''
      });
    }
  });

  // 5. Extract all covered locations (destination + day locations + sightseeing spots)
  let coverLocations = [];
  if (Array.isArray(pkg.coverLocation) && pkg.coverLocation.length > 0) {
    coverLocations = pkg.coverLocation;
  } else {
    const locSet = new Set();
    const primary = (pkg.destination || pkg.city || '').trim();
    if (primary) locSet.add(primary);

    days.forEach((day) => {
      if (day.location && typeof day.location === 'string' && day.location.trim()) {
        locSet.add(day.location.trim());
      }
      (day.services || []).forEach((svc) => {
        if (svc.type === 'sightseeing') {
          (svc.data?.items || []).forEach((item) => {
            if (item.location && typeof item.location === 'string') {
              item.location.split(',').map((p) => p.trim()).filter(Boolean).forEach((p) => locSet.add(p));
            } else if (item.name && typeof item.name === 'string') {
              locSet.add(item.name.trim());
            }
          });
        }
      });
    });

    const res = Array.from(locSet).filter(Boolean);
    coverLocations = res.length > 0 ? res : [primary || 'Custom Destination'];
  }

  // 6. Build Sanitized Data for "Copy JSON" (Strictly excludes internal secrets, keys, or private auth tokens)
  const sanitizedForExport = {
    id: pkg.id || pkg.referenceId || 'PKG-EXPORT',
    referenceId: pkg.referenceId || (pkg.id ? `PKG-${pkg.id}` : 'PKG-DRAFT'),
    packageName: pkg.title || pkg.packageName || 'Holiday Tour Package',
    destination: pkg.destination || pkg.city || '',
    originCity: pkg.originCity || 'Delhi',
    duration: `${days.length} Days / ${pkg.nights || Math.max(days.length - 1, 1)} Nights`,
    dates: {
      startDate: pkg.startDate || 'Flexible',
      endDate: pkg.endDate || 'Flexible'
    },
    customer: {
      name: pkg.customerName || pkg.customerInfo?.name || 'Valued Traveler',
      consultant: pkg.consultantName || 'TravelPro Specialist'
    },
    travelers: {
      adults,
      children,
      total: totalTravelers
    },
    coverLocations,
    inclusions: pkg.inclusions || [],
    exclusions: pkg.exclusions || [],
    pricingSummary: {
      currency: 'INR',
      finalPackageTotal: activePricing.final,
      perPerson: activePricing.perPerson,
      showBreakdown: showPriceBreakdown,
      breakdown: visibleBreakdownItems.map((item) => ({
        component: item.label,
        amount: item.amount,
        count: item.count
      }))
    },
    dayWiseItinerary: days.map((day, idx) => ({
      dayNumber: idx + 1,
      title: day.title || `Day ${idx + 1}`,
      location: day.location || '',
      description: day.description || '',
      date: day.date || '',
      services: (day.services || [])
        .filter((s) => s.selected !== false)
        .map((s) => ({
          type: s.type,
          data: s.data
        }))
    })),
    policies: visiblePolicies.map((p) => ({
      title: p.title,
      type: p.type,
      items: p.items,
      rules: p.rules,
      content: p.content,
      notes: p.notes
    }))
  };

  return {
    raw: pkg,
    title: pkg.title || pkg.packageName || 'Holiday Package',
    destination: pkg.destination || pkg.city || '',
    coverLocations,
    originCity: pkg.originCity || 'Delhi',
    durationNights: pkg.nights || Math.max(days.length - 1, 1),
    durationDays: days.length,
    startDate: pkg.startDate || '',
    endDate: pkg.endDate || '',
    customerName: pkg.customerName || pkg.customerInfo?.name || 'Valued Traveler',
    referenceId: pkg.referenceId || (pkg.id ? `PKG-${pkg.id}` : 'PKG-DRAFT'),
    tripId: pkg.tripId || (pkg.id ? String(pkg.id) : ''),
    consultantName: pkg.consultantName || 'TravelPro Specialist',
    coverImage: pkg.coverImage || '',
    inclusions: pkg.inclusions || [],
    exclusions: pkg.exclusions || [],
    travelers,
    days,
    serviceCounts: {
      flights: countFlights,
      hotels: countHotels,
      cabs: countCabs,
      buses: countBuses,
      sightseeing: countSightseeing,
      activities: countActivities,
      meals: countMeals
    },
    pricing: activePricing,
    policyVisibility: policyVis,
    priceBreakdownVisibility: priceBreakdownVis,
    showPriceBreakdown,
    visibleBreakdownItems,
    visiblePolicies,
    sanitizedForExport
  };
}
