import jwt from 'jsonwebtoken';
import { apiError } from '../utils/asyncHandler.js';

export function authenticate(request, _response, next) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return next(apiError('Authentication token is required.', 401));

  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(apiError('Invalid or expired authentication token.', 401));
  }
}

export const allowRoles = (...roles) => (request, _response, next) => {
  if (!roles.includes(request.user.role)) return next(apiError('You do not have permission for this action.', 403));
  next();
};
