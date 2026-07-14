import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { apiError, asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (request, response) => {
  const result = await query('SELECT * FROM notifications WHERE recipient_id=$1 ORDER BY created_at DESC', [request.user.id]);
  response.json({ notifications: result.rows });
}));

router.patch('/:notificationId/read', asyncHandler(async (request, response) => {
  const result = await query('UPDATE notifications SET is_read=true WHERE id=$1 AND recipient_id=$2 RETURNING *', [request.params.notificationId, request.user.id]);
  if (!result.rows[0]) throw apiError('Notification not found.', 404);
  response.json({ notification: result.rows[0] });
}));

export default router;
