import { query } from '../config/db.js';

export async function getContractForUser(contractId, userId) {
  const result = await query(
    'SELECT * FROM contracts WHERE id=$1 AND ($2=client_id OR $2=freelancer_id)',
    [contractId, userId]
  );

  return result.rows[0];
}

export function getChatRecipient(contract, senderId) {
  return contract.client_id === senderId ? contract.freelancer_id : contract.client_id;
}

export async function createContractMessage(contractId, senderId, body) {
  const result = await query(
    `INSERT INTO messages (contract_id, sender_id, body)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [contractId, senderId, body.trim()]
  );

  return result.rows[0];
}

export async function createChatNotification(recipientId) {
  const result = await query(
    `INSERT INTO notifications (recipient_id, type, message)
     VALUES ($1,$2,$3)
     RETURNING *`,
    [recipientId, 'chat', 'You received a new contract message.']
  );

  return result.rows[0];
}

