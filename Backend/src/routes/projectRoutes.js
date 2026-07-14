import { Router } from 'express';
import { query } from '../config/db.js';
import { allowRoles, authenticate } from '../middleware/authMiddleware.js';
import { apiError, asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.post('/', allowRoles('client'), asyncHandler(async (request, response) => {
  const { title, category, description, deadline, budget, requestedFreelancerId } = request.body;
  if (!title || !category || !description || budget === undefined) throw apiError('title, category, description and budget are required.');
  const result = await query(
    `INSERT INTO projects (client_id, requested_freelancer_id, title, category, description, deadline, budget)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [request.user.id, requestedFreelancerId || null, title, category, description, deadline || null, budget]
  );
  if (requestedFreelancerId) await query('INSERT INTO notifications (recipient_id, type, message) VALUES ($1,$2,$3)', [requestedFreelancerId, 'project_request', `You have a new request for: ${title}`]);
  response.status(201).json({ project: result.rows[0] });
}));

router.get('/', asyncHandler(async (request, response) => {
  const { search = '', category } = request.query;
  const conditions = [`p.status = 'open'`, `(p.requested_freelancer_id IS NULL OR p.requested_freelancer_id = $1)`];
  const parameters = [request.user.id];
  if (search) { parameters.push(`%${search}%`); conditions.push(`(p.title ILIKE $${parameters.length} OR p.description ILIKE $${parameters.length})`); }
  if (category) { parameters.push(category); conditions.push(`p.category = $${parameters.length}`); }
  const result = await query(
    `SELECT p.*, u.name AS client_name, u.username AS client_username FROM projects p JOIN users u ON u.id=p.client_id WHERE ${conditions.join(' AND ')} ORDER BY p.created_at DESC`,
    parameters
  );
  response.json({ projects: result.rows });
}));

router.get('/mine', allowRoles('client'), asyncHandler(async (request, response) => {
  const result = await query('SELECT * FROM projects WHERE client_id=$1 ORDER BY created_at DESC', [request.user.id]);
  response.json({ projects: result.rows });
}));

router.post('/:projectId/proposals', allowRoles('freelancer'), asyncHandler(async (request, response) => {
  const { coverLetter, proposedPrice } = request.body;
  if (proposedPrice === undefined) throw apiError('proposedPrice is required.');
  const project = await query('SELECT * FROM projects WHERE id=$1 AND status=$2', [request.params.projectId, 'open']);
  if (!project.rows[0]) throw apiError('Open project not found.', 404);
  if (project.rows[0].requested_freelancer_id && project.rows[0].requested_freelancer_id !== request.user.id) throw apiError('This project was requested for another freelancer.', 403);
  try {
    const result = await query('INSERT INTO proposals (project_id, freelancer_id, cover_letter, proposed_price) VALUES ($1,$2,$3,$4) RETURNING *', [request.params.projectId, request.user.id, coverLetter || null, proposedPrice]);
    await query('INSERT INTO notifications (recipient_id, type, message) VALUES ($1,$2,$3)', [project.rows[0].client_id, 'proposal', `A freelancer responded to: ${project.rows[0].title}`]);
    response.status(201).json({ proposal: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') throw apiError('You have already submitted a proposal for this project.', 409);
    throw error;
  }
}));

router.get('/:projectId/proposals', allowRoles('client'), asyncHandler(async (request, response) => {
  const result = await query(
    `SELECT pr.*, u.name, u.username, u.profile_image_url, u.bio FROM proposals pr JOIN users u ON u.id=pr.freelancer_id JOIN projects p ON p.id=pr.project_id WHERE pr.project_id=$1 AND p.client_id=$2 ORDER BY pr.created_at DESC`,
    [request.params.projectId, request.user.id]
  );
  response.json({ proposals: result.rows });
}));

export default router;
