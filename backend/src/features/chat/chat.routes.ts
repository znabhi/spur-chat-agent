import { Router } from 'express';
import { chatController } from './chat.controller';
import { validate } from '../../middleware/validate.middleware';
import { SendMessageSchema, GetHistorySchema } from './chat.types';

const router = Router();

// POST /chat/message — send a message, get AI reply
router.post(
  '/message',
  validate(SendMessageSchema),
  chatController.sendMessage.bind(chatController)
);

// GET /chat/:sessionId/history — paginated message history
router.get(
  '/:sessionId/history',
  validate(GetHistorySchema),
  chatController.getHistory.bind(chatController)
);

export default router;
