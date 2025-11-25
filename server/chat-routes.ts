import { Router } from 'express';
import { authenticateToken, AuthenticatedRequest } from './auth';
import { storage } from './storage';
import { z } from 'zod';

const router = Router();

const createChatSchema = z.object({
  participantIds: z.array(z.string()).min(2, "São necessários pelo menos 2 participantes."),
  loanId: z.string().optional(), // Associate chat with a loan
});

// POST /api/chats - Start a new conversation
router.post('/chats', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validation = createChatSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.flatten() });
    }

    const { participantIds, loanId } = validation.data;
    const requesterId = req.user!.userId;

    // Ensure the requester is one of the participants
    if (!participantIds.includes(requesterId)) {
      return res.status(403).json({ error: 'Você não pode iniciar um chat sem ser um participante.' });
    }

    const chat = await storage.createChat(participantIds, loanId);
    res.status(201).json(chat);
  } catch (error) {
    next(error);
  }
});

// GET /api/chats - Get all chats for the current user
router.get('/chats', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const chats = await storage.getUserChats(req.user!.userId);
    res.json(chats);
  } catch (error) {
    next(error);
  }
});

// GET /api/chats/:id/messages - Get messages for a specific chat
router.get('/chats/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const chatId = req.params.id;
    const isParticipant = await storage.isUserParticipantInChat(chatId, req.user!.userId);
    if (!isParticipant) {
      return res.status(403).json({ error: 'Acesso negado a este chat.' });
    }
    const messages = await storage.getChatMessages(chatId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

export const chatRoutes = router;
