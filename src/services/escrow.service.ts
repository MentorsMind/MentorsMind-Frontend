import {
  Contract,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  nativeToScVal,
  Address,
  scValToNative,
  rpc as SorobanRpc,
} from '@stellar/stellar-sdk';
import { Horizon } from '@stellar/stellar-sdk';

const NETWORK = import.meta.env.VITE_STELLAR_NETWORK === 'mainnet'
  ? Networks.PUBLIC
  : Networks.TESTNET;

const HORIZON_URL = import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const CONTRACT_ID = import.meta.env.VITE_ESCROW_CONTRACT_ID || '';

const horizonServer = new Horizon.Server(HORIZON_URL);

function getRpcServer(): SorobanRpc.Server {
  return new SorobanRpc.Server(SOROBAN_RPC_URL);
}

export interface EscrowDetails {
  id: number;
  mentor: string;
  learner: string;
  amount: bigint;
  sessionId: string;
  status: 'Active' | 'Released' | 'Disputed' | 'Refunded';
  createdAt: number;
}

/**
 * Build and submit a Soroban contract transaction.
 * The caller signs the XDR with their Stellar wallet (e.g. Freighter).
 */
async function invokeContract(
  method: string,
  args: Parameters<typeof nativeToScVal>[0][],
  signerPublicKey: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<unknown> {
  if (!CONTRACT_ID) throw new Error('VITE_ESCROW_CONTRACT_ID is not set');

  const rpc = getRpcServer();
  const account = await horizonServer.loadAccount(signerPublicKey);
  const contract = new Contract(CONTRACT_ID);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK,
  })
    .addOperation(contract.call(method, ...args.map((a) => nativeToScVal(a))))
    .setTimeout(30)
    .build();

  const prepared = await rpc.prepareTransaction(tx);
  const signedXdr = await signTransaction(prepared.toXDR());

  const { TransactionBuilder: TB } = await import('@stellar/stellar-sdk');
  const signedTx = TB.fromXDR(signedXdr, NETWORK);
  const result = await rpc.sendTransaction(signedTx);

  if (result.status === 'ERROR') throw new Error(`Contract call failed: ${result.errorResult}`);

  // Poll for confirmation
  let getResult = await rpc.getTransaction(result.hash);
  let attempts = 0;
  while (getResult.status === 'NOT_FOUND' && attempts < 10) {
    await new Promise((r) => setTimeout(r, 2000));
    getResult = await rpc.getTransaction(result.hash);
    attempts++;
  }

  if (getResult.status === 'SUCCESS') {
    return getResult.returnValue ? scValToNative(getResult.returnValue) : null;
  }
  throw new Error('Transaction failed or timed out');
}

export async function createEscrow(
  mentorAddress: string,
  learnerAddress: string,
  amount: number,
  sessionId: string,
  signerPublicKey: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<number> {
  const escrowId = await invokeContract(
    'create_escrow',
    [
      new Address(mentorAddress),
      new Address(learnerAddress),
      BigInt(amount),
      sessionId,
    ],
    signerPublicKey,
    signTransaction
  );
  return Number(escrowId);
}

export async function releaseFunds(
  escrowId: number,
  signerPublicKey: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<void> {
  await invokeContract('release_funds', [escrowId], signerPublicKey, signTransaction);
}

export async function disputeEscrow(
  escrowId: number,
  signerPublicKey: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<void> {
  await invokeContract('dispute', [escrowId], signerPublicKey, signTransaction);
}

export async function refundEscrow(
  escrowId: number,
  signerPublicKey: string,
  signTransaction: (xdr: string) => Promise<string>
): Promise<void> {
  await invokeContract('refund', [escrowId], signerPublicKey, signTransaction);
}

export async function getEscrow(escrowId: number): Promise<EscrowDetails> {
  if (!CONTRACT_ID) throw new Error('VITE_ESCROW_CONTRACT_ID is not set');
  const rpc = getRpcServer();
  const contract = new Contract(CONTRACT_ID);

  const account = await horizonServer.loadAccount(
    'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN' // read-only placeholder
  );

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK,
  })
    .addOperation(contract.call('get_escrow', nativeToScVal(escrowId)))
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if ('error' in sim) throw new Error(`Simulation failed: ${sim.error}`);

  const result = (sim as SorobanRpc.Api.SimulateTransactionSuccessResponse).result;
  if (!result) throw new Error('No result from simulation');

  return scValToNative(result.retval) as EscrowDetails;
}
