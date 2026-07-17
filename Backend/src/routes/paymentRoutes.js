import { Router } from 'express';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { amountToStroops, getTransactionStatus, prepareContractInvocation } from '../services/sorobanService.js';
import { apiError, asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(authenticate);

async function getContractForPayment(contractId, userId) {
  const result = await query(
    `SELECT c.*, client.stellar_public_key AS client_public_key, freelancer.stellar_public_key AS freelancer_public_key
     FROM contracts c JOIN users client ON client.id=c.client_id JOIN users freelancer ON freelancer.id=c.freelancer_id
     WHERE c.id=$1 AND (c.client_id=$2 OR c.freelancer_id=$2)`,
    [contractId, userId]
  );
  return result.rows[0];
}

async function preparePaymentAction(payment, contract, action) {
  const prepared = await prepareContractInvocation({
    action,
    sourcePublicKey: contract.client_public_key,
    payerPublicKey: contract.client_public_key,
    payeePublicKey: contract.freelancer_public_key,
    amountStroops: amountToStroops(payment.amount),
    contractId: contract.id,
    paymentId: payment.id
  });
  const result = await query(
    `UPDATE payments SET soroban_contract_id=$1, soroban_network=$2, soroban_action=$3, prepared_transaction_xdr=$4,
     stellar_transaction_hash=$5, status='pending', updated_at=NOW() WHERE id=$6 RETURNING *`,
    [prepared.sorobanContractId, prepared.sorobanNetwork, action, prepared.preparedTransactionXdr, prepared.transactionHash, payment.id]
  );
  return { payment: result.rows[0], prepared };
}

router.post('/contracts/:contractId/prepare', asyncHandler(async (request, response) => {
  const action = request.body.action || 'deposit';
  if (action !== 'deposit') throw apiError('New payments can only prepare a deposit.', 400);
  const contract = await getContractForPayment(request.params.contractId, request.user.id);
  if (!contract) throw apiError('Contract not found.', 404);
  if (contract.client_id !== request.user.id) throw apiError('Only the client can fund a contract.', 403);
  if (contract.status !== 'active') throw apiError('Only active contracts can be funded.', 400);

  const existing = await query(`SELECT * FROM payments WHERE contract_id=$1 AND status IN ('pending','held') ORDER BY created_at DESC LIMIT 1`, [contract.id]);
  if (existing.rows[0]) throw apiError('This contract already has a pending or held payment.', 409);
  const created = await query(
    `INSERT INTO payments (contract_id, payer_id, payee_id, amount, currency, soroban_action) VALUES ($1,$2,$3,$4,'XLM','deposit') RETURNING *`,
    [contract.id, contract.client_id, contract.freelancer_id, contract.agreed_price]
  );
  const result = await preparePaymentAction(created.rows[0], contract, action);
  response.status(201).json(result);
}));

router.post('/:paymentId/prepare-action', asyncHandler(async (request, response) => {
  const { action } = request.body;
  if (!['release', 'refund'].includes(action)) throw apiError('action must be release or refund.', 400);
  const paymentResult = await query('SELECT * FROM payments WHERE id=$1', [request.params.paymentId]);
  const payment = paymentResult.rows[0];
  if (!payment) throw apiError('Payment not found.', 404);
  const contract = await getContractForPayment(payment.contract_id, request.user.id);
  if (!contract) throw apiError('Payment not found.', 404);
  if (contract.client_id !== request.user.id) throw apiError('Only the client can prepare release or refund.', 403);
  if (payment.status !== 'held') throw apiError('Only a held payment can be released or refunded.', 409);
  response.json(await preparePaymentAction(payment, contract, action));
}));

router.post('/:paymentId/sync', asyncHandler(async (request, response) => {
  const paymentResult = await query('SELECT * FROM payments WHERE id=$1', [request.params.paymentId]);
  const payment = paymentResult.rows[0];
  if (!payment) throw apiError('Payment not found.', 404);
  const contract = await getContractForPayment(payment.contract_id, request.user.id);
  if (!contract) throw apiError('Payment not found.', 404);
  const transactionHash = request.body.transactionHash || payment.stellar_transaction_hash;
  if (!transactionHash) throw apiError('transactionHash is required.', 400);
  const { status: rpcStatus } = await getTransactionStatus(transactionHash);
  let status = payment.status;
  if (rpcStatus === 'SUCCESS') status = payment.soroban_action === 'deposit' ? 'held' : payment.soroban_action === 'release' ? 'released' : 'refunded';
  if (['FAILED', 'ERROR'].includes(rpcStatus)) status = 'failed';
  const updated = await query(
    `UPDATE payments SET stellar_transaction_hash=$1, status=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
    [transactionHash, status, payment.id]
  );
  response.json({ payment: updated.rows[0], sorobanStatus: rpcStatus });
}));

router.get('/contracts/:contractId', asyncHandler(async (request, response) => {
  const contract = await getContractForPayment(request.params.contractId, request.user.id);
  if (!contract) throw apiError('Contract not found.', 404);
  const result = await query('SELECT * FROM payments WHERE contract_id=$1 ORDER BY created_at DESC', [contract.id]);
  response.json({ payments: result.rows });
}));

export default router;
