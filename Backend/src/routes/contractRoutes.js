import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { broadcastToContractChat, isUserActiveInContractChat, notifyUserSockets } from '../realtime/chatSocket.js';
import {
  createChatNotification,
  createContractMessage,
  getChatRecipient,
  getContractForUser
} from '../services/chatService.js';
import { apiError, asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);

router.post('/from-proposal/:proposalId', asyncHandler(async (request, response) => {
  if (request.user.role !== 'client') throw apiError('Only clients can accept a proposal.', 403);
  const proposal = await query('SELECT pr.*, p.client_id, p.title FROM proposals pr JOIN projects p ON p.id=pr.project_id WHERE pr.id=$1', [request.params.proposalId]);
  const item = proposal.rows[0];
  if (!item || item.client_id !== request.user.id) throw apiError('Proposal not found.', 404);
  const result = await query(
    `INSERT INTO contracts (project_id, client_id, freelancer_id, agreed_price, client_accepted_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
    [item.project_id, item.client_id, item.freelancer_id, item.proposed_price]
  );
  await query(`UPDATE projects SET status='assigned', updated_at=NOW() WHERE id=$1`, [item.project_id]);
  await query(`UPDATE proposals SET status=CASE WHEN id=$1 THEN 'accepted' ELSE 'rejected' END WHERE project_id=$2`, [item.id, item.project_id]);
  await query('INSERT INTO notifications (recipient_id, type, message) VALUES ($1,$2,$3)', [item.freelancer_id, 'contract', `Your proposal for ${item.title} was accepted. Please accept the contract.`]);
  response.status(201).json({ contract: result.rows[0] });
}));

router.get('/', asyncHandler(async (request, response) => {
  const result = await query(
    `SELECT c.*, p.title, p.description, p.deadline, p.budget, client.username AS client_username, freelancer.username AS freelancer_username
     FROM contracts c JOIN projects p ON p.id=c.project_id JOIN users client ON client.id=c.client_id JOIN users freelancer ON freelancer.id=c.freelancer_id
     WHERE c.client_id=$1 OR c.freelancer_id=$1 ORDER BY c.created_at DESC`, [request.user.id]
  );
  response.json({ contracts: result.rows });
}));

router.patch('/:contractId/accept', asyncHandler(async (request, response) => {
  const result = await query(
    `UPDATE contracts SET freelancer_accepted_at=NOW(), status='active', updated_at=NOW()
     WHERE id=$1 AND freelancer_id=$2 AND status='pending' RETURNING *`, [request.params.contractId, request.user.id]
  );
  if (!result.rows[0]) throw apiError('Pending contract not found.', 404);
  await query('INSERT INTO notifications (recipient_id, type, message) VALUES ($1,$2,$3)', [result.rows[0].client_id, 'contract_accepted', 'The freelancer accepted your contract.']);
  response.json({ contract: result.rows[0] });
}));

router.patch('/:contractId/reject', asyncHandler(async (request, response) => {
  const result = await query(`UPDATE contracts SET status='cancelled', updated_at=NOW() WHERE id=$1 AND freelancer_id=$2 AND status='pending' RETURNING *`, [request.params.contractId, request.user.id]);
  if (!result.rows[0]) throw apiError('Pending contract not found.', 404);
  await query(`UPDATE projects SET status='open', updated_at=NOW() WHERE id=$1`, [result.rows[0].project_id]);
  response.json({ contract: result.rows[0] });
}));

router.get('/:contractId/messages', asyncHandler(async (request, response) => {
  const result = await query(`SELECT m.*, u.username, u.profile_image_url FROM messages m JOIN contracts c ON c.id=m.contract_id JOIN users u ON u.id=m.sender_id WHERE m.contract_id=$1 AND ($2=c.client_id OR $2=c.freelancer_id) ORDER BY m.created_at`, [request.params.contractId, request.user.id]);
  response.json({ messages: result.rows });
}));

router.post('/:contractId/messages', asyncHandler(async (request, response) => {
  const { body } = request.body;
  if (!body?.trim()) throw apiError('Message body is required.');
  const contract = await getContractForUser(request.params.contractId, request.user.id);
  if (!contract) throw apiError('Contract not found.', 404);

  const message = await createContractMessage(request.params.contractId, request.user.id, body);
  const recipient = getChatRecipient(contract, request.user.id);

  broadcastToContractChat(request.params.contractId, { type: 'message_created', message });

  if (!isUserActiveInContractChat(request.params.contractId, recipient)) {
    const notification = await createChatNotification(recipient);
    notifyUserSockets(recipient, { type: 'notification_created', notification }, request.params.contractId);
  }

  response.status(201).json({ message });
}));

export default router;
