// /api/links/* — invite codes and links. Each route states which role may use it.
import { Router } from 'express';
import * as linkController from '../controllers/link.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { redeemSchema, linkParamsSchema } from '../validators/link.schemas.js';

export const linkRouter = Router();
const withLinkId = validate({ params: linkParamsSchema });

linkRouter.use(requireAuth); // everything here needs a login

// Student
linkRouter.post('/invite', requireRole('student'), linkController.createInvite);
linkRouter.get('/', requireRole('student'), linkController.listMine);
linkRouter.post('/:linkId/accept', requireRole('student'), withLinkId, linkController.accept);
linkRouter.post('/:linkId/decline', requireRole('student'), withLinkId, linkController.decline);

// Supporter
linkRouter.post('/redeem', requireRole('supporter'), validate({ body: redeemSchema }), linkController.redeem);

// Either role — the service checks the user is actually part of this link.
linkRouter.post('/:linkId/dismiss-notice', withLinkId, linkController.dismissNotice);
linkRouter.delete('/:linkId', withLinkId, linkController.end);
