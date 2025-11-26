import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  User, 
  Mail,
  Phone,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';

type CommunityMessage = {
  id: number;
  senderId: number;
  receiverId: number;
  postId?: number;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
};

type MessageCenterProps = {
  onClose: () => void;
};

const MessageCenter = ({ onClose }: MessageCenterProps) => {
  const [selectedMessage, setSelectedMessage] = useState<CommunityMessage | null>(null);
  const [composeMode, setComposeMode] = useState(false);
  const [newMessage, setNewMessage] = useState({
    receiverId: '',
    subject: '',
    content: '',
    postId: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/community/messages'],
    staleTime: 30000,
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['/api/community/messages/unread/count'],
    staleTime: 30000,
  });
  
  const unreadCount = (unreadCountData as { count: number }) || { count: 0 };

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest('PATCH', `/api/community/messages/${messageId}/read`);
      if (!response.ok) {
        throw new Error('Error al marcar mensaje como leído');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/community/messages/unread/count'] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: typeof newMessage) => {
      const response = await apiRequest('POST', '/api/community/messages', {
        receiverId: parseInt(data.receiverId),
        subject: data.subject,
        content: data.content,
        postId: data.postId ? parseInt(data.postId) : null,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar mensaje');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Mensaje enviado',
        description: 'Tu mensaje ha sido enviado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community/messages'] });
      setComposeMode(false);
      setNewMessage({ receiverId: '', subject: '', content: '', postId: '' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleMessageClick = (message: CommunityMessage) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.receiverId || !newMessage.subject || !newMessage.content) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos.',
        variant: 'destructive',
      });
      return;
    }

    sendMessageMutation.mutate(newMessage);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando mensajes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold">Centro de Mensajes</h2>
            {unreadCount.count > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount.count} sin leer
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedMessage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedMessage(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComposeMode(!composeMode)}
            >
              {composeMode ? 'Cancelar' : 'Nuevo Mensaje'}
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Message List */}
          {!selectedMessage && !composeMode && (
            <div className="w-1/3 border-r overflow-y-auto">
              {(messages as CommunityMessage[]).length > 0 ? (
                <div className="p-4 space-y-3">
                  {(messages as CommunityMessage[]).map((message: CommunityMessage) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors",
                        !message.read && "border-blue-200 bg-blue-50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm truncate">
                          {message.subject}
                        </h3>
                        {message.read ? (
                          <CheckCheck className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Check className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {message.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>Usuario #{message.senderId}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes mensajes</h3>
                  <p className="text-gray-500">Cuando alguien te envíe un mensaje, aparecerá aquí.</p>
                </div>
              )}
            </div>
          )}

          {/* Message Detail */}
          {selectedMessage && !composeMode && (
            <div className="flex-1 p-6">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                  {selectedMessage.read ? (
                    <CheckCheck className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Check className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>De: Usuario #{selectedMessage.senderId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                {selectedMessage.postId && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      📝 Relacionado con publicación #{selectedMessage.postId}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
            </div>
          )}

          {/* Compose Message */}
          {composeMode && (
            <div className="flex-1 p-6">
              <h2 className="text-xl font-bold mb-6">Nuevo Mensaje</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID del Destinatario *
                  </label>
                  <Input
                    type="number"
                    value={newMessage.receiverId}
                    onChange={(e) => setNewMessage({ ...newMessage, receiverId: e.target.value })}
                    placeholder="Ingresa el ID del usuario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Publicación (opcional)
                  </label>
                  <Input
                    type="number"
                    value={newMessage.postId}
                    onChange={(e) => setNewMessage({ ...newMessage, postId: e.target.value })}
                    placeholder="Si el mensaje es sobre una publicación específica"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <Input
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    placeholder="Asunto del mensaje"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <Textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={6}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendMessageMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setComposeMode(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageCenter;
