import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { apiError, asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
const publicUserColumns = 'id, name, username, email, phone, date_of_birth, country, role, stellar_public_key, profile_image_url, bio, wallet_details, created_at';
const createToken = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

router.post('/register', asyncHandler(async (request, response) => {
  const { name, username, email, phone, dateOfBirth, country, password, role, stellarPublicKey, profileImageUrl, walletDetails } = request.body;
  if (!name || !username || !email || !password || !role) throw apiError('name, username, email, password and role are required.');
  if (!['client', 'freelancer'].includes(role)) throw apiError('role must be client or freelancer.');
  if (password.length < 8) throw apiError('Password must contain at least 8 characters.');

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const result = await query(
      `INSERT INTO users (name, username, email, phone, date_of_birth, country, password_hash, role, stellar_public_key, profile_image_url, wallet_details)
       VALUES ($1,$2,LOWER($3),$4,$5,$6,$7,$8,$9,$10,$11) RETURNING ${publicUserColumns}`,
      [name.trim(), username.trim(), email.trim(), phone || null, dateOfBirth || null, country || null, passwordHash, role, stellarPublicKey || null, profileImageUrl || null, walletDetails || {}]
    );
    const user = result.rows[0];
    response.status(201).json({ token: createToken(user), user });
  } catch (error) {
    if (error.code === '23505') throw apiError('Email, username, or Stellar account already exists.', 409);
    throw error;
  }
}));

router.post('/login', asyncHandler(async (request, response) => {
  const { username, password } = request.body;
  if (!username || !password) throw apiError('username and password are required.');
  const result = await query(`SELECT ${publicUserColumns}, password_hash FROM users WHERE LOWER(username) = LOWER($1)`, [username.trim()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) throw apiError('Incorrect username or password.', 401);
  delete user.password_hash;
  response.json({ token: createToken(user), user, redirectTo: user.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard' });
}));

// In production, send the resetToken by email and never include it in this response.
router.post('/forgot-password', asyncHandler(async (request, response) => {
  const { email } = request.body;
  if (!email) throw apiError('email is required.');
  const userResult = await query('SELECT id FROM users WHERE LOWER(email)=LOWER($1)', [email.trim()]);
  const user = userResult.rows[0];
  const safeResponse = { message: 'If that email is registered, a password reset token has been created.' };
  if (!user) return response.json(safeResponse);

  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  await query('DELETE FROM password_reset_tokens WHERE user_id=$1', [user.id]);
  await query('INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,NOW() + INTERVAL \'15 minutes\')', [user.id, tokenHash]);

  if (process.env.NODE_ENV !== 'production') safeResponse.resetToken = resetToken;
  response.json(safeResponse);
}));

router.post('/reset-password', asyncHandler(async (request, response) => {
  const { resetToken, newPassword } = request.body;
  if (!resetToken || !newPassword) throw apiError('resetToken and newPassword are required.');
  if (newPassword.length < 8) throw apiError('New password must contain at least 8 characters.');
  const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const tokenResult = await query(
    'SELECT id, user_id FROM password_reset_tokens WHERE token_hash=$1 AND used_at IS NULL AND expires_at > NOW()', [tokenHash]
  );
  const token = tokenResult.rows[0];
  if (!token) throw apiError('Reset token is invalid or has expired.', 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [passwordHash, token.user_id]);
  await query('UPDATE password_reset_tokens SET used_at=NOW() WHERE id=$1', [token.id]);
  response.json({ message: 'Password updated. You can now log in with your new password.' });
}));

router.get('/me', authenticate, asyncHandler(async (request, response) => {
  const result = await query(`SELECT ${publicUserColumns} FROM users WHERE id = $1`, [request.user.id]);
  if (!result.rows[0]) throw apiError('User not found.', 404);
  response.json({ user: result.rows[0] });
}));

export default router;
