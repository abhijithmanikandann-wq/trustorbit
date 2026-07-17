# TrustOrbit Backend

## Setup

1. Copy `.env.example` to `.env` and set a strong JWT secret.
2. Start PostgreSQL with Docker: `docker compose up -d`.
3. Install packages: `npm.cmd install`
4. Start development server: `npm.cmd run dev`
5. Check `http://localhost:5000/api/health`.

PostgreSQL is available at `localhost:5433`. The initial schema is executed automatically the first time its Docker volume is created. To reset local database data, run `docker compose down -v`, then `docker compose up -d`.

## Structure

- `database/init`: PostgreSQL schema created by Docker
- `models`: query/model helpers
- `controllers`: request logic
- `routes`: API endpoints
- `middleware`: authentication, role checks, error handling
- `services`: Stellar/payment and notification integrations
- `validators`: request validation

## First API requests

`POST /api/auth/register` creates either a `client` or `freelancer` account. Required JSON fields are `name`, `username`, `email`, `password`, and `role`; role must be `client` or `freelancer`.

`POST /api/auth/login` accepts `username` and `password`, and returns a JWT token plus the appropriate frontend redirect path. For protected endpoints, include `Authorization: Bearer <token>`.

`POST /api/auth/forgot-password` accepts an email and creates a 15-minute reset token. In development it returns `resetToken` for Postman testing. `POST /api/auth/reset-password` accepts `resetToken` and `newPassword`.

- `GET/PATCH/DELETE /api/profile`, `POST /api/profile/portfolio`
- `POST/GET /api/projects`, `POST /api/projects/:projectId/proposals`
- `GET /api/contracts`, `PATCH /api/contracts/:contractId/accept`
- `GET /api/dashboard`, `GET /api/notifications`

## Soroban escrow payments

Install dependencies after pulling these changes with `npm.cmd install`, then configure `SOROBAN_RPC_URL`, `SOROBAN_NETWORK`, and `SOROBAN_ESCROW_CONTRACT_ID` in `.env`. The backend never accepts or stores a wallet private key.

The authenticated client creates a deposit with `POST /api/payments/contracts/:contractId/prepare`. The response contains `prepared.preparedTransactionXdr`, which the frontend signs with Freighter and submits to Soroban RPC. Call `POST /api/payments/:paymentId/sync` with `{ "transactionHash": "..." }` to persist its RPC status. A held payment can be prepared for release or refund by the client with `POST /api/payments/:paymentId/prepare-action` and `{ "action": "release" }` or `{ "action": "refund" }`. `GET /api/payments/contracts/:contractId` lists payments for either contract participant.

The default ABI assumptions are `deposit(payer: Address, payee: Address, amount: i128, contract_id: String)`, `release(payee: Address, amount: i128, contract_id: String)`, and `refund(payer: Address, amount: i128, contract_id: String)`. They are only defaults: set `SOROBAN_*_METHOD` and `SOROBAN_*_ARGUMENTS` to match the deployed contract exactly. Argument settings are JSON arrays containing mapping names (`payer`, `payee`, `amount_stroops`, `contract_id`, `payment_id`) or descriptors such as `{ "name": "amount_stroops", "type": "i128" }`. Amounts are converted from XLM to 7-decimal stroops before invocation.
