import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { apiError, asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(async (request, response) => {
  const user = await query('SELECT id, name, username, email, phone, date_of_birth, country, role, stellar_public_key, profile_image_url, bio, wallet_details, created_at FROM users WHERE id=$1', [request.user.id]);
  const portfolio = await query('SELECT id, title, file_url, created_at FROM portfolio_items WHERE user_id=$1 ORDER BY created_at DESC', [request.user.id]);
  response.json({ profile: user.rows[0], portfolio: portfolio.rows });
}));

router.patch('/', asyncHandler(async (request, response) => {
  const { phone, country, profileImageUrl, bio, walletDetails } = request.body;
  const result = await query(
    `UPDATE users SET phone=COALESCE($1, phone), country=COALESCE($2, country), profile_image_url=COALESCE($3, profile_image_url), bio=COALESCE($4, bio), wallet_details=COALESCE($5, wallet_details), updated_at=NOW()
     WHERE id=$6 RETURNING id, name, username, email, phone, date_of_birth, country, role, stellar_public_key, profile_image_url, bio, wallet_details`,
    [phone ?? null, country ?? null, profileImageUrl ?? null, bio ?? null, walletDetails ?? null, request.user.id]
  );
  response.json({ profile: result.rows[0] });
}));

router.post('/portfolio', asyncHandler(async (request, response) => {
  const { title, fileUrl } = request.body;
  if (!title || !fileUrl) throw apiError('title and fileUrl are required.');
  const result = await query('INSERT INTO portfolio_items (user_id, title, file_url) VALUES ($1,$2,$3) RETURNING *', [request.user.id, title, fileUrl]);
  response.status(201).json({ portfolioItem: result.rows[0] });
}));

router.delete('/', asyncHandler(async (request, response) => {
  const { password } = request.body;
  if (!password) throw apiError('Current password is required to delete an account.');

  const userResult = await query('SELECT password_hash FROM users WHERE id=$1', [request.user.id]);
  const user = userResult.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw apiError('Current password is incorrect.', 401);
  }

  const activeContracts = await query(
    `SELECT id FROM contracts WHERE (client_id=$1 OR freelancer_id=$1) AND status IN ('pending', 'active', 'disputed') LIMIT 1`,
    [request.user.id]
  );
  if (activeContracts.rows[0]) {
    throw apiError('Close or cancel active contracts before deleting this account.', 409);
  }

  try {
    await query('DELETE FROM users WHERE id=$1', [request.user.id]);
    response.json({ message: 'Profile and associated data were deleted.' });
  } catch (error) {
    if (error.code === '23503') throw apiError('This account has historical contract or payment records and cannot be deleted.', 409);
    throw error;
  }
}));

export default router;
