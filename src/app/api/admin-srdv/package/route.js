import { NextResponse } from 'next/server';
import Package from '@/models/Package';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = getUserFromRequest({
      cookies: {
        token: request.cookies.get('token')?.value,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const numericId = Number(id);
      if (!Number.isFinite(numericId) || numericId <= 0) {
        return NextResponse.json({ success: false, message: 'Invalid package id' }, { status: 400 });
      }

      const pkg = await Package.findByPk(numericId);
      if (!pkg) {
        return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, package: pkg });
    }

    const packages = await Package.findAll({ order: [['createdAt', 'DESC']] });
    return NextResponse.json({ success: true, total: packages.length, packages });
  } catch (error) {
    console.error('Admin SRDV package get error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch package' },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const user = getUserFromRequest({
      cookies: {
        token: request.cookies.get('token')?.value,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid package payload' }, { status: 400 });
    }

    const created = await Package.create({
      packageName: String(body.packageName || body.title || 'Untitled Package').trim(),
      coverLocation: Array.isArray(body.coverLocation) ? body.coverLocation : [],
      city: String(body.city || body.destination || 'Custom Destination').trim() || 'Custom Destination',
      state: String(body.state || 'India').trim() || 'India',
      totalPrice: Number(body.totalPrice || 0) || 0,
      offerPrice: Number(body.offerPrice || body.totalPrice || 0) || 0,
      hotel: body.hotel || null,
      foodType: Array.isArray(body.foodType) ? body.foodType : [],
      totalTransfer: Number(body.totalTransfer || 1) || 1,
      rating: String(body.rating || '4.8').trim() || '4.8',
      days: String(body.days || '1 Days / 0 Nights').trim(),
      tagType: String(body.tagType || 'Customized').trim() || 'Customized',
      coverImage: String(body.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb').trim(),
      description: String(body.description || '').trim(),
      status: String(body.status || 'Draft').trim() || 'Draft',
      destination: String(body.destination || body.city || 'Custom Destination').trim() || 'Custom Destination',
      originCity: String(body.originCity || 'Delhi').trim() || 'Delhi',
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      nights: Number(body.nights || body.durationNights || 1) || 1,
      travelers: body.travelers && typeof body.travelers === 'object' ? body.travelers : { adults: 2, children: 0, infants: 0 },
      customerInfo: body.customerInfo || null,
      pricingBreakdown: body.pricingBreakdown || null,
      pricingRules: body.pricingRules || body.pricing || null,
      itineraryData: body.itineraryData || null,
      dayWiseItinerary: Array.isArray(body.dayWiseItinerary) ? body.dayWiseItinerary : [],
      destinationWiseItinerary: Array.isArray(body.destinationWiseItinerary) ? body.destinationWiseItinerary : [],
      hotelsList: Array.isArray(body.hotelsList) ? body.hotelsList : [],
      flightsList: Array.isArray(body.flightsList) ? body.flightsList : [],
      cabsList: Array.isArray(body.cabsList) ? body.cabsList : [],
      busesList: Array.isArray(body.busesList) ? body.busesList : [],
      mealsList: Array.isArray(body.mealsList) ? body.mealsList : [],
      activitiesList: Array.isArray(body.activitiesList) ? body.activitiesList : [],
      sightseeingList: Array.isArray(body.sightseeingList) ? body.sightseeingList : [],
      inclusions: Array.isArray(body.inclusions) ? body.inclusions : [],
      exclusions: Array.isArray(body.exclusions) ? body.exclusions : [],
      termsAndConditions: Array.isArray(body.termsAndConditions) ? body.termsAndConditions : Array.isArray(body.terms) ? body.terms : [],
      cancellationPolicy: body.cancellationPolicy || null,
      dateChangePolicy: body.dateChangePolicy || null,
      otherPolicies: Array.isArray(body.otherPolicies) ? body.otherPolicies : [],
      policyVisibility: body.policyVisibility || null,
      priceBreakdownVisibility: body.priceBreakdownVisibility || null,
      customization: body.customization || null,
      highlights: Array.isArray(body.highlights) ? body.highlights : [],
      consultantName: String(body.consultantName || '').trim(),
      referenceId: body.referenceId || null,
      tripId: body.tripId || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : [],
    });

    return NextResponse.json({ success: true, message: 'Package created successfully', package: created, id: created?.id ?? null });
  } catch (error) {
    console.error('Admin SRDV package create error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to create package' },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const user = getUserFromRequest({
      cookies: {
        token: request.cookies.get('token')?.value,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Login required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid package payload' }, { status: 400 });
    }

    const id = body.id ?? body.packageId;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Package id is required for update' }, { status: 400 });
    }

    const pkg = await Package.findByPk(Number(id));
    if (!pkg) {
      return NextResponse.json({ success: false, message: 'Package not found' }, { status: 404 });
    }

    await pkg.update({
      packageName: String(body.packageName || body.title || pkg.packageName || 'Untitled Package').trim(),
      coverLocation: Array.isArray(body.coverLocation) ? body.coverLocation : pkg.coverLocation || [],
      city: String(body.city || body.destination || pkg.city || 'Custom Destination').trim() || 'Custom Destination',
      state: String(body.state || pkg.state || 'India').trim() || 'India',
      totalPrice: Number(body.totalPrice || pkg.totalPrice || 0) || 0,
      offerPrice: Number(body.offerPrice || body.totalPrice || pkg.offerPrice || 0) || 0,
      hotel: body.hotel || pkg.hotel || null,
      foodType: Array.isArray(body.foodType) ? body.foodType : pkg.foodType || [],
      totalTransfer: Number(body.totalTransfer || pkg.totalTransfer || 1) || 1,
      rating: String(body.rating || pkg.rating || '4.8').trim() || '4.8',
      days: String(body.days || pkg.days || '1 Days / 0 Nights').trim(),
      tagType: String(body.tagType || pkg.tagType || 'Customized').trim() || 'Customized',
      coverImage: String(body.coverImage || pkg.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb').trim(),
      description: String(body.description ?? pkg.description ?? '').trim(),
      status: String(body.status || pkg.status || 'Draft').trim() || 'Draft',
      destination: String(body.destination || body.city || pkg.destination || 'Custom Destination').trim() || 'Custom Destination',
      originCity: String(body.originCity || pkg.originCity || 'Delhi').trim() || 'Delhi',
      startDate: body.startDate ?? pkg.startDate ?? null,
      endDate: body.endDate ?? pkg.endDate ?? null,
      nights: Number(body.nights || pkg.nights || body.durationNights || 1) || 1,
      travelers: body.travelers && typeof body.travelers === 'object' ? body.travelers : pkg.travelers || { adults: 2, children: 0, infants: 0 },
      customerInfo: body.customerInfo || pkg.customerInfo || null,
      pricingBreakdown: body.pricingBreakdown || pkg.pricingBreakdown || null,
      pricingRules: body.pricingRules || body.pricing || pkg.pricingRules || null,
      itineraryData: body.itineraryData || pkg.itineraryData || null,
      dayWiseItinerary: Array.isArray(body.dayWiseItinerary) ? body.dayWiseItinerary : pkg.dayWiseItinerary || [],
      destinationWiseItinerary: Array.isArray(body.destinationWiseItinerary) ? body.destinationWiseItinerary : pkg.destinationWiseItinerary || [],
      hotelsList: Array.isArray(body.hotelsList) ? body.hotelsList : pkg.hotelsList || [],
      flightsList: Array.isArray(body.flightsList) ? body.flightsList : pkg.flightsList || [],
      cabsList: Array.isArray(body.cabsList) ? body.cabsList : pkg.cabsList || [],
      busesList: Array.isArray(body.busesList) ? body.busesList : pkg.busesList || [],
      mealsList: Array.isArray(body.mealsList) ? body.mealsList : pkg.mealsList || [],
      activitiesList: Array.isArray(body.activitiesList) ? body.activitiesList : pkg.activitiesList || [],
      sightseeingList: Array.isArray(body.sightseeingList) ? body.sightseeingList : pkg.sightseeingList || [],
      inclusions: Array.isArray(body.inclusions) ? body.inclusions : pkg.inclusions || [],
      exclusions: Array.isArray(body.exclusions) ? body.exclusions : pkg.exclusions || [],
      termsAndConditions: Array.isArray(body.termsAndConditions)
        ? body.termsAndConditions
        : Array.isArray(body.terms)
          ? body.terms
          : pkg.termsAndConditions || [],
      cancellationPolicy: body.cancellationPolicy || pkg.cancellationPolicy || null,
      dateChangePolicy: body.dateChangePolicy || pkg.dateChangePolicy || null,
      otherPolicies: Array.isArray(body.otherPolicies) ? body.otherPolicies : pkg.otherPolicies || [],
      policyVisibility: body.policyVisibility || pkg.policyVisibility || null,
      priceBreakdownVisibility: body.priceBreakdownVisibility || pkg.priceBreakdownVisibility || null,
      customization: body.customization || pkg.customization || null,
      highlights: Array.isArray(body.highlights) ? body.highlights : pkg.highlights || [],
      consultantName: String(body.consultantName ?? pkg.consultantName ?? '').trim(),
      referenceId: body.referenceId || pkg.referenceId || null,
      tripId: body.tripId || pkg.tripId || null,
      tags: Array.isArray(body.tags) ? body.tags : pkg.tags || [],
      galleryImages: Array.isArray(body.galleryImages) ? body.galleryImages : pkg.galleryImages || [],
    });

    return NextResponse.json({ success: true, message: 'Package updated successfully', package: pkg, id: pkg.id });
  } catch (error) {
    console.error('Admin SRDV package update error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to update package' },
      { status: 500 },
    );
  }
}
