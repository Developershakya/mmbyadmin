import { callSrdvApi } from '@/lib/srdvApi';
import { handleApiError } from "@/lib/apiError";
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { pickupLocationCode, dropoffLocationCode, pickupDate, returnDate, tripType } = req.body;

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
      return res.status(200).json({ success: false, message: data.Error.ErrorMessage });
    }

    if (data.Result && data.Result.TaxiData) {
      return res.status(200).json({
        success: true,
        traceId: data.Result.TraceID,
        cars: data.Result.TaxiData
      });
    }
    return res.status(200).json({ success: false, message: 'No cars found' });
  } catch (error) {
    return handleApiError(res, error, "Something went wrong");
  }
}

export async function GET(req, res) { return handler(req, res); }
export async function POST(req, res) { return handler(req, res); }
