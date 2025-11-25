import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Loader2, MessageSquareText, AlertCircle } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  block: string;
  unit: string;
}

interface Chat {
  chatId: string;
  loanId: string;
  loanTitle: string;
  createdAt: string;
  otherParticipant: Participant;
}

export default function ChatListPage() {
  const { token, user } = useAuth();
  const [, setLocation] = useLocation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchChats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/chats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Não foi possível carregar suas conversas.');
        }
        const data = await response.json();
        setChats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [token]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-10 w-10 mx-auto text-red-500 mb-2" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Minhas Conversas</h1>
      <div className="space-y-4">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <div 
              key={chat.chatId}
              onClick={() => setLocation(`/chat/${chat.chatId}`)}
              className="bg-card p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-lg">{chat.otherParticipant.name}</p>
                <p className="text-sm text-muted-foreground">Item: {chat.loanTitle || 'Conversa geral'}</p>
                <p className="text-xs text-muted-foreground">Bloco {chat.otherParticipant.block} Unidade {chat.otherParticipant.unit}</p>
              </div>
              <MessageSquareText className="h-6 w-6 text-primary" />
            </div>
          ))
        ) : (
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <MessageSquareText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Você ainda não tem nenhuma conversa.</p>
            <p className="text-sm text-muted-foreground">As conversas sobre empréstimos aparecerão aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}
