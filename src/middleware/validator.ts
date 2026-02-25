import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateIdentifyRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { email, phoneNumber } = req.body;

  // At least one of email or phoneNumber must be provided
  if (!email && !phoneNumber) {
    throw new AppError('Either email or phoneNumber must be provided', 400);
  }

  // Validate email format if provided
  if (email && typeof email !== 'string') {
    throw new AppError('Email must be a string', 400);
  }

  // Validate phoneNumber format if provided
  if (phoneNumber && typeof phoneNumber !== 'string' && typeof phoneNumber !== 'number') {
    throw new AppError('Phone number must be a string or number', 400);
  }

  next();
};
