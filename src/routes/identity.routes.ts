import { Router } from 'express';
import identityController from '../controllers/identity.controller';
import { validateIdentifyRequest } from '../middleware/validator';

const router = Router();

/**
 * POST /identify
 * Identify and reconcile customer identity
 */
router.post(
  '/identify',
  validateIdentifyRequest,
  (req, res, next) => identityController.identify(req, res, next)
);

export default router;
