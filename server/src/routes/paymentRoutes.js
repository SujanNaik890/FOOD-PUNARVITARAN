import express from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPaymentOrder, verifyPaymentSignature } from '../services/paymentService.js';

export const paymentRouter = express.Router();

const CreateOrderSchema = z.object({
  amount: z.number().positive().min(10, 'Minimum contribution is ₹10'),
  panNumber: z.string().optional()
});

const VerifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(5),
  razorpayPaymentId: z.string().min(5),
  razorpaySignature: z.string().min(10)
});

paymentRouter.post('/create-order', authenticate, validate(CreateOrderSchema), async (req, res, next) => {
  try {
    const { amount, panNumber } = req.validatedBody;
    const order = await createPaymentOrder(req.user._id, amount, panNumber);
    res.status(201).json({
      success: true,
      message: 'Razorpay order created',
      data: order
    });
  } catch (error) {
    next(error);
  }
});

paymentRouter.post('/verify', authenticate, validate(VerifyPaymentSchema), async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.validatedBody;
    const payment = await verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    res.status(200).json({
      success: true,
      message: 'Payment captured and 80G tax receipt recorded',
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
});
