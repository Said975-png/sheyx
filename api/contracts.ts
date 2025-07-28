import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createContract,
  getUserContracts,
  getContract,
} from '../server/routes/contracts';

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

  // Роутинг по методам
  if (req.method === 'POST') {
    return createContract(req as any, res as any);
  } else if (req.method === 'GET') {
    const { contractId } = req.query;
    if (contractId && typeof contractId === 'string') {
      // Имитируем req.params для getContract
      (req as any).params = { contractId };
      return getContract(req as any, res as any);
    } else {
      return getUserContracts(req as any, res as any);
    }
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
