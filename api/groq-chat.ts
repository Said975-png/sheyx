import { VercelRequest, VercelResponse } from '@vercel/node';
import { handleGroqChat } from '../server/routes/groq-chat';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Добавляем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    return handleGroqChat(req as any, res as any);
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
