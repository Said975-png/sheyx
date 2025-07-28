import { VercelRequest, VercelResponse } from '@vercel/node';
import { getContract } from '../../server/routes/contracts';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Добавляем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { contractId } = req.query;
    (req as any).params = { contractId };
    return getContract(req as any, res as any);
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
