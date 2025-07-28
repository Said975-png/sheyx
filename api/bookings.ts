import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBooking,
  deleteBooking,
} from '../server/routes/bookings';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Добавляем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, user-id');
  
  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { bookingId } = req.query;

  // Роутинг по методам и путям
  if (req.method === 'POST') {
    return createBooking(req as any, res as any);
  } else if (req.method === 'GET') {
    if (req.url?.includes('/all')) {
      return getAllBookings(req as any, res as any);
    } else {
      return getUserBookings(req as any, res as any);
    }
  } else if (req.method === 'PUT' && bookingId) {
    (req as any).params = { bookingId };
    return updateBooking(req as any, res as any);
  } else if (req.method === 'DELETE' && bookingId) {
    (req as any).params = { bookingId };
    return deleteBooking(req as any, res as any);
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
