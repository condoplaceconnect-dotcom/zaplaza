import { useState, useEffect, useRef, useCallback } from 'react';
import { useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, AlertCircle, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}

export default function ChatPage() {
  const [, params] = useRoute("/chat/:id");
  const chatId = params?.id;
  const { token, user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!chatId || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Falha ao carregar mensagens ou acesso negado.');
      }
      const data = await response.json();
      setMessages(data.reverse()); // Reverse to show latest at the bottom
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Setup and teardown socket connection
  useEffect(() => {
    if (!chatId || !user) return;

    const newSocket = io({ auth: { token } });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected!');
      newSocket.emit('join_chat', chatId);
    });

    newSocket.on('receive_message', (message: Message) => {
      if (message.chatId === chatId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    newSocket.on('connect_error', (err) => {
      setError(`Connection failed: ${err.message}`);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [chatId, token, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && socket && user) {
      const messageData = {
        chatId: chatId!,
        senderId: user.id,
        content: newMessage.trim(),
      };
      socket.emit('send_message', messageData);
      setNewMessage('');
    }
  };
  
  if (isLoading) return <div className="flex justify-center items-center h-48"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (error) return <div className="text-center p-8"><AlertCircle className="h-10 w-10 mx-auto text-red-500 mb-2" /><p className="text-red-500">{error}</p></div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl h-[calc(100vh-80px)] flex flex-col">
        <div className="flex items-center mb-4">
            <Button variant='ghost' size='icon' onClick={() => window.history.back()}><ArrowLeft /></Button>
            <h1 className="text-xl font-bold ml-2">Chat</h1>
        </div>
        <div className="flex-grow bg-muted/40 rounded-lg p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.senderId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-card shadow-sm'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
            <Input 
                value={newMessage} 
                onChange={(e) => setNewMessage(e.target.value)} 
                placeholder="Digite sua mensagem..." 
                className="flex-grow" 
            />
            <Button type="submit" disabled={!newMessage.trim()}><Send className="h-5 w-5" /></Button>
        </form>
    </div>
  );
}
