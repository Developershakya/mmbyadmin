// ✅ FIXED CODE
import { callSrdvApi } from '../../../lib/srdvApi';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { traceId, resultIndex } = req.body;

  if (!traceId || !resultIndex) {
    return res.status(400).json({ success: false, message: 'traceId aur resultIndex zaroori hain' });
  }

  try {
const data = await callSrdvApi(process.env.BUS_API_URL, 'GetSeatLayout', {
  TraceId: traceId,
  ResultIndex: resultIndex,
});

console.log('RAW SEAT LAYOUT RESPONSE:', JSON.stringify(data, null, 2));   

    if (data?.Error && Number(data.Error.ErrorCode) !== 0) {
      return res.status(200).json({ success: false, message: data.Error.ErrorMessage });
    }
// SRDV response se seats dhoondo (chahe kisi bhi key/nesting ke andar ho)
function findSeatArray(obj) {
  if (Array.isArray(obj)) {
    const flat = obj.flat(Infinity);
    if (flat.length && flat[0] && typeof flat[0] === 'object' &&
        (flat[0].SeatName || flat[0].SeatIndex)) {
      return flat;
    }
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const found = findSeatArray(obj[key]);
      if (found) return found;
    }
  }
  return null;
}

const seatList = findSeatArray(data) || [];

if (seatList.length === 0) {
  return res.status(200).json({ success: false, message: 'Seat data available nahi hai.' });
}

    // Clean formatting for React UI
    const seats = seatList.map((seat) => ({
      seatName: seat.SeatName || seat.Name,
      seatIndex: seat.SeatIndex,
      rowNo: Number(seat.RowNo || 1),
      columnNo: Number(seat.ColumnNo || 1),
      isAvailable: seat.SeatStatus === true || seat.SeatStatus === 'true' || seat.SeatStatus === 1,
      isUpper: !!seat.IsUpper,
      isLadies: !!seat.IsLadiesSeat,
      price: seat.Price?.OfferedPrice ?? seat.Price?.PublishedPrice ?? seat.SeatFare ?? 0,
    }));

    return res.status(200).json({
      success: true,
      seats,
      boardingPoints: data?.GetSeatLayoutResult?.BoardingPointDetails || data?.BoardingPointDetails || [],
      droppingPoints: data?.GetSeatLayoutResult?.DroppingPointDetails || data?.DroppingPointDetails || [],
    });

  } catch (error) {
    console.error('Seat layout error:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
}