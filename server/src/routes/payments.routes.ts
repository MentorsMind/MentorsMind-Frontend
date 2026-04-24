import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { Horizon, TransactionBuilder, Operation, Asset, Networks } from '@stellar/stellar-sdk';
import { z } from 'zod';
import type { Request, Response } from 'express';

const router = Router();

// Stellar configuration (should match frontend)
const STELLAR_CONFIG = {
  network: Networks.TESTNET,
  horizonUrl: 'https://horizon-testnet.stellar.org',
  contractId: process.env.STELLAR_CONTRACT_ID || 'CA...',
  platformFeeAccount: process.env.PLATFORM_FEE_ACCOUNT || 'GA...',
  escrowTimeout: 30 * 1000,
};

const getHorizonServer = () => new Horizon.Server(STELLAR_CONFIG.horizonUrl);

// Validation schemas
const createPaymentSchema = z.object({
  sessionId: z.string().min(1),
  mentorId: z.string().min(1),
  amount: z.number().positive(),
  assetCode: z.enum(['XLM', 'USDC', 'PYUSD']),
  transactionHash: z.string().min(64),
  escrowId: z.string().optional(),
});

const paymentIdSchema = z.object({
  paymentId: z.string().min(1),
});

// In-memory storage (replace with database in production)
const payments = new Map<string, any>();

// Create payment endpoint
router.post('/', [
  body('sessionId').isString().notEmpty(),
  body('mentorId').isString().notEmpty(),
  body('amount').isNumeric().isFloat({ min: 0 }),
  body('assetCode').isIn(['XLM', 'USDC', 'PYUSD']),
  body('transactionHash').isString().isLength({ min: 64 }),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const paymentData = createPaymentSchema.parse(req.body);
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Verify transaction on Stellar network
    const server = getHorizonServer();
    let transaction;
    try {
      transaction = await server.transactions().transaction(paymentData.transactionHash).call();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Transaction not found on Stellar network',
      });
    }

    if (!transaction.successful) {
      return res.status(400).json({
        success: false,
        error: 'Transaction failed on Stellar network',
      });
    }

    // Create escrow (simplified - in production, use Soroban contract)
    const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = {
      id: paymentId,
      ...paymentData,
      escrowId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      transaction,
    };

    payments.set(paymentId, payment);

    // Start escrow monitoring (in production, this would be handled by the contract)
    setTimeout(() => {
      const payment = payments.get(paymentId);
      if (payment && payment.status === 'pending') {
        payment.status = 'confirmed';
        payment.confirmedAt = new Date().toISOString();
        payments.set(paymentId, payment);
      }
    }, STELLAR_CONFIG.escrowTimeout);

    res.json({
      success: true,
      paymentId,
      escrowId,
      status: 'pending',
      transactionHash: paymentData.transactionHash,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

// Get payment status endpoint
router.get('/:paymentId/status', [
  param('paymentId').isString().notEmpty(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { paymentId } = req.params;
    const payment = payments.get(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
    }

    res.json({
      paymentId: payment.id,
      status: payment.status,
      transactionHash: payment.transactionHash,
      escrowId: payment.escrowId,
      confirmedAt: payment.confirmedAt,
    });

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;