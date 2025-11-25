import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { authRouter } from './auth-routes';
import { uploadRouter } from './upload-routes';
import { chatRoutes } from './chat-routes';
import { loanRouter, servicesRouter, marketplaceRouter } from './routes';
import { registerAdminRoutes } from "./admin-routes";
import { storage } from "./storage"; // Import storage
import { InsertMessage } from "@shared/schema"; // Import message type

const app = express();
const httpServer = createServer(app);

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));
app.use(express.static("dist/public"));

app.use('/api/auth', authRouter);
app.use('/api', uploadRouter);
app.use('/api', chatRoutes);
app.use('/api', loanRouter);
app.use('/api', servicesRouter);
app.use('/api', marketplaceRouter);

registerAdminRoutes(app);

app.get("*", (req, res) => {
  res.sendFile("index.html", { root: "dist/public" });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error Handler:", err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// REWRITTEN SOCKET.IO LOGIC
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Event to join a specific chat room (for private chats)
  socket.on("join_chat", (chatId) => {
    console.log(`Socket ${socket.id} joining chat room: ${chatId}`);
    socket.join(chatId);
  });

  // Event to send a message to a specific chat room
  socket.on("send_message", async (data: { chatId: string; senderId: string; content: string }) => {
    try {
      // 1. Persist the message to the database
      const messageToSave: InsertMessage = {
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
      };
      // This method will be created in the next steps
      // const newMessage = await storage.createChatMessage(messageToSave);

      // For now, we'll just broadcast the received data
      const newMessage = { ...messageToSave, id: `msg_${Date.now()}`, createdAt: new Date() };

      // 2. Broadcast the new message to all clients in the room
      io.to(data.chatId).emit("receive_message", newMessage);
    } catch (error) {
      console.error(`[Socket Error] Failed to send message in chat ${data.chatId}:`, error);
      // Optional: notify sender of the failure
      socket.emit("message_error", { error: "Failed to send message." });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

export default httpServer;
export { io };
