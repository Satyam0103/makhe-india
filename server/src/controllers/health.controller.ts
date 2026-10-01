import { Request, Response } from 'express';

export function getHealth(_req: Request, res: Response) {
  // Do not expose secrets, credentials, or internal strings
  return res.status(200).json({
    success: true,
    message: 'Makhé India API is running',
  });
}

export default getHealth;
