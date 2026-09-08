import { callSrdvApi } from '@/lib/srdvApi';
import { NextResponse } from "next/server";
export async function POST(request) {
  const { pickupLocationCode, dropoffLocationCode, pickupDate, returnDate, tripType } = await request.json();

  try {
    const data = await callSrdvApi(process.env.CAR_API_URL, 'Search', {
      FormCity: pickupLocationCode,
      ToCity: dropoffLocationCode,
      PickUpDate: pickupDate,   // format: DD/MM/YYYY
      DropDate: returnDate || "",
      Hours: "8",
      TripType: tripType || "0"
    });

    if (data.Error && data.Error.ErrorCode !== "0") {
      return NextResponse.json({ success: false, message: data.Error.ErrorMessage });
    }

    if (data.Result && data.Result.TaxiData) {
      return NextResponse.json({
        success: true,
        traceId: data.Result.TraceID,
        cars: data.Result.TaxiData
      });
    }
    return NextResponse.json({ success: false, message: 'No cars found' });
  } catch (error) {
    console.error("Cab search API error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

