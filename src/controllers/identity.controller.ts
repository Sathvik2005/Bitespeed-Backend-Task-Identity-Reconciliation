import { Request, Response, NextFunction } from 'express';
import identityService from '../services/identity.service';
import { IdentifyRequest } from '../types';

export class IdentityController {
  /**
   * Handle POST /identify request
   */
  async identify(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const requestData: IdentifyRequest = {
        email: req.body.email || undefined,
        phoneNumber: req.body.phoneNumber || undefined,
      };

      const result = await identityService.identify(requestData);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new IdentityController();
