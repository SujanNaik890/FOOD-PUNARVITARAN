import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { queryOperationsAssistant, executeAITool } from '../ai/assistant.js';

export const aiRouter = express.Router();

// ADMIN ONLY - Query Operations Assistant
aiRouter.post(
  '/chat',
  authenticate,
  requireRole(['ADMIN']),
  async (req, res, next) => {
    try {
      const { prompt, conversationHistory } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, message: 'Prompt is required' });
      }

      const response = await queryOperationsAssistant(prompt, conversationHistory);
      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  }
);

// ADMIN ONLY - Direct Tool Inspection
aiRouter.post(
  '/tools/execute',
  authenticate,
  requireRole(['ADMIN']),
  async (req, res, next) => {
    try {
      const { toolName, args } = req.body;
      const result = await executeAITool(toolName, args || {});
      res.status(200).json({
        success: true,
        data: { toolName, output: result }
      });
    } catch (error) {
      next(error);
    }
  }
);
