import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { authRouter } from './auth-routes';
import { uploadRouter } from './upload-routes';
import { chatRoutes } from './chat-routes';
import { loanRouter, servicesRouter, marketplaceRouter } from './routes';
import { registerAdminRoutes } from "./admin-routes";
import { publicRouter } from './public-routes'; // Import the new public router
import { storage } from "./storage";
import { InsertMessage } from "@shared/schema";

const app = express();
const httpServer = createServer(app);

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));
app.use(express.static("dist/public"));

// Register Routers
app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter); // Use the new public router
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

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join_chat", (chatId) => {
    console.log(`Socket ${socket.id} joining chat room: ${chatId}`);
    socket.join(chatId);
  });

  socket.on("send_message", async (data: { chatId: string; senderId: string; content: string }) => {
    try {
      const messageToSave: InsertMessage = {
        chatId: data.chatId,
        senderId: data.senderId,
        content: data.content,
      };
      // const newMessage = await storage.createChatMessage(messageToSave);
      const newMessage = { ...messageToSave, id: `msg_${Date.now()}`, createdAt: new Date() };
      io.to(data.chatId).emit("receive_message", newMessage);
    } catch (error) {
      console.error(`[Socket Error] Failed to send message in chat ${data.chatId}:`, error);
      socket.emit("message_error", { error: "Failed to send message." });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

export default httpServer;
export { io };
