import { Request, Response, NextFunction } from 'express';
import { chatService } from './chat.service';
import { SendMessageInput, GetHistoryInput } from './chat.types';

export class ChatController {
  // POST /chat/message
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, sessionId } = req.validated as SendMessageInput;
      const result = await chatService.sendMessage(sessionId, message);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  // GET /chat/:sessionId/history
  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, limit, before } = req.validated as GetHistoryInput;
      const result = await chatService.getHistory(sessionId, limit, before);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const chatController = new ChatController();
