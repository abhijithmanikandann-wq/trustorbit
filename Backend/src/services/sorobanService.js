import {
  Address,
  BASE_FEE,
  Contract,
  Networks,
  StrKey,
  TimeoutInfinite,
  TransactionBuilder,
  nativeToScVal,
  rpc
} from '@stellar/stellar-sdk';

const STROOPS_PER_XLM = 10_000_000n;
const DEFAULT_ARGUMENTS = {
  deposit: ['payer', 'payee', 'amount_stroops', 'contract_id'],
  release: ['payee', 'amount_stroops', 'contract_id'],
  refund: ['payer', 'amount_stroops', 'contract_id']
};

const DEFAULT_METHODS = { deposit: 'deposit', release: 'release', refund: 'refund' };
const ACTIONS = new Set(Object.keys(DEFAULT_METHODS));

function getNetworkPassphrase() {
  const network = (process.env.SOROBAN_NETWORK || process.env.STELLAR_NETWORK || 'testnet').toLowerCase();
  if (network === 'testnet') return Networks.TESTNET;
  if (network === 'mainnet' || network === 'public') return Networks.PUBLIC;
  if (network === 'futurenet') return Networks.FUTURENET;
  return process.env.SOROBAN_NETWORK_PASSPHRASE || process.env.SOROBAN_NETWORK;
}

function getContractId() {
  const contractId = process.env.SOROBAN_ESCROW_CONTRACT_ID;
  if (!contractId) throw new Error('SOROBAN_ESCROW_CONTRACT_ID is missing.');
  if (!StrKey.isValidContract(contractId)) throw new Error('SOROBAN_ESCROW_CONTRACT_ID is not a valid Soroban contract ID.');
  return contractId;
}

function getRpcServer() {
  if (!process.env.SOROBAN_RPC_URL) throw new Error('SOROBAN_RPC_URL is missing.');
  return new rpc.Server(process.env.SOROBAN_RPC_URL);
}

function getActionMethod(action) {
  if (!ACTIONS.has(action)) throw new Error('Unsupported Soroban action.');
  return process.env[`SOROBAN_${action.toUpperCase()}_METHOD`] || DEFAULT_METHODS[action];
}

function getArgumentDefinitions(action) {
  const configured = process.env[`SOROBAN_${action.toUpperCase()}_ARGUMENTS`];
  if (!configured) return DEFAULT_ARGUMENTS[action];
  try {
    const definitions = JSON.parse(configured);
    if (!Array.isArray(definitions)) throw new Error();
    return definitions;
  } catch {
    throw new Error(`SOROBAN_${action.toUpperCase()}_ARGUMENTS must be a JSON array.`);
  }
}

function resolveValue(name, context) {
  const values = {
    payer: context.payerPublicKey,
    client: context.payerPublicKey,
    payee: context.payeePublicKey,
    freelancer: context.payeePublicKey,
    amount_stroops: context.amountStroops,
    amount: context.amountStroops,
    contract_id: context.contractId,
    payment_id: context.paymentId
  };
  if (!(name in values)) throw new Error(`Unsupported Soroban argument value: ${name}`);
  return values[name];
}

function toScVal(definition, context) {
  const descriptor = typeof definition === 'string' ? { name: definition } : definition;
  if (!descriptor || typeof descriptor !== 'object') throw new Error('Invalid Soroban argument definition.');
  const value = descriptor.value === undefined ? resolveValue(descriptor.name, context) : descriptor.value;
  const type = descriptor.type || (
    ['payer', 'client', 'payee', 'freelancer'].includes(descriptor.name) ? 'address'
      : ['amount', 'amount_stroops'].includes(descriptor.name) ? 'i128'
        : undefined
  );

  if (type === 'address') {
    if (!isValidStellarPublicKey(value)) throw new Error(`Invalid Stellar public key for argument ${descriptor.name}.`);
    return Address.fromString(value).toScVal();
  }
  if (['i128', 'u128', 'i256', 'u256', 'i64', 'u64', 'i32', 'u32'].includes(type)) return nativeToScVal(BigInt(value), { type });
  if (type === 'bytes') return nativeToScVal(Buffer.from(String(value), 'utf8'), { type });
  if (type) return nativeToScVal(value, { type });
  return nativeToScVal(value);
}

export function isValidStellarPublicKey(publicKey) {
  return typeof publicKey === 'string' && StrKey.isValidEd25519PublicKey(publicKey);
}

export function isValidSorobanContractId(contractId) {
  return typeof contractId === 'string' && StrKey.isValidContract(contractId);
}

export function amountToStroops(amount) {
  const value = String(amount ?? '').trim();
  if (!/^\d+(?:\.\d{1,7})?$/.test(value)) throw new Error('Payment amount must be a non-negative XLM amount with up to 7 decimal places.');
  const [whole, fraction = ''] = value.split('.');
  return (BigInt(whole) * STROOPS_PER_XLM + BigInt((fraction + '0000000').slice(0, 7))).toString();
}

export async function prepareContractInvocation({ action, sourcePublicKey, ...context }) {
  if (!isValidStellarPublicKey(sourcePublicKey)) throw new Error('Invalid Stellar source public key.');
  if (!isValidStellarPublicKey(context.payerPublicKey) || !isValidStellarPublicKey(context.payeePublicKey)) throw new Error('Both payment participants need valid Stellar public keys.');

  const server = getRpcServer();
  const contract = new Contract(getContractId());
  const account = await server.getAccount(sourcePublicKey);
  const transaction = new TransactionBuilder(account, {
    fee: process.env.SOROBAN_BASE_FEE || BASE_FEE,
    networkPassphrase: getNetworkPassphrase()
  })
    .addOperation(contract.call(getActionMethod(action), ...getArgumentDefinitions(action).map((argument) => toScVal(argument, context))))
    .setTimeout(TimeoutInfinite)
    .build();
  const preparedTransaction = await server.prepareTransaction(transaction);

  return {
    preparedTransactionXdr: preparedTransaction.toXDR(),
    transactionHash: preparedTransaction.hash().toString('hex'),
    sorobanContractId: getContractId(),
    sorobanNetwork: process.env.SOROBAN_NETWORK || process.env.STELLAR_NETWORK || 'testnet',
    method: getActionMethod(action)
  };
}

export async function getTransactionStatus(transactionHash) {
  if (!/^[a-fA-F0-9]{64}$/.test(transactionHash || '')) throw new Error('Invalid Stellar transaction hash.');
  const result = await getRpcServer().getTransaction(transactionHash);
  return { status: result.status, result };
}
