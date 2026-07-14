import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (request, response) => {
  if (request.user.role === 'client') {
    const [projects, contracts, unreadNotifications] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM projects WHERE client_id=$1', [request.user.id]),
      query(`SELECT COUNT(*)::int AS count FROM contracts WHERE client_id=$1 AND status IN ('pending','active')`, [request.user.id]),
      query('SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_id=$1 AND is_read=false', [request.user.id])
    ]);
    return response.json({ role: 'client', projects: projects.rows[0].count, activeContracts: contracts.rows[0].count, unreadNotifications: unreadNotifications.rows[0].count });
  }

  const [contracts, earnings, pendingPayments, unreadNotifications] = await Promise.all([
    query(`SELECT COUNT(*)::int AS count FROM contracts WHERE freelancer_id=$1 AND status IN ('pending','active')`, [request.user.id]),
    query(`SELECT COALESCE(SUM(amount),0)::numeric AS total FROM payments WHERE payee_id=$1 AND status='released'`, [request.user.id]),
    query(`SELECT COALESCE(SUM(amount),0)::numeric AS total FROM payments WHERE payee_id=$1 AND status IN ('pending','held')`, [request.user.id]),
    query('SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_id=$1 AND is_read=false', [request.user.id])
  ]);
  response.json({ role: 'freelancer', activeContracts: contracts.rows[0].count, totalEarnings: earnings.rows[0].total, amountToReceive: pendingPayments.rows[0].total, unreadNotifications: unreadNotifications.rows[0].count });
}));

export default router;
