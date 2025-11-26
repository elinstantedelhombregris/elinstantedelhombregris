import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  MessageSquare, 
  UserPlus, 
  Target, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Message {
  id: number;
  content: string;
  type: 'message' | 'system' | 'milestone' | 'member_join' | 'member_leave';
  createdAt: string;
  user: {
    id: number;
    name: string;
    username: string;
  };
}

interface InitiativeChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  canSendMessages?: boolean;
  currentUserId?: number;
  className?: string;
}

export default function InitiativeChat({
  messages,
  onSendMessage,
  isLoading = false,
  canSendMessages = false,
  currentUserId,
  className = ""
}: InitiativeChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() && canSendMessages) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case 'milestone':
        return <Target className="w-4 h-4 text-purple-600" />;
      case 'member_join':
        return <UserPlus className="w-4 h-4 text-green-600" />;
      case 'member_leave':
        return <UserPlus className="w-4 h-4 text-red-600 rotate-45" />;
      default:
        return null;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-blue-50 border-blue-200';
      case 'milestone':
        return 'bg-purple-50 border-purple-200';
      case 'member_join':
        return 'bg-green-50 border-green-200';
      case 'member_leave':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Ahora';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours}h`;
    } else {
      return time.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isSystemMessage = (message: Message) => {
    return message.type !== 'message';
  };

  const getSystemMessageContent = (message: Message) => {
    switch (message.type) {
      case 'member_join':
        return `${message.user.name} se unió a la iniciativa`;
      case 'member_leave':
        return `${message.user.name} abandonó la iniciativa`;
      case 'milestone':
        return `${message.user.name} completó un hito: ${message.content}`;
      case 'system':
        return message.content;
      default:
        return message.content;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Chat de la Iniciativa
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Messages */}
          <ScrollArea className="h-96" ref={scrollAreaRef}>
            <div className="space-y-3 pr-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Cargando mensajes...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No hay mensajes aún</p>
                  <p className="text-gray-500 text-sm">
                    Sé el primero en enviar un mensaje a la iniciativa
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.user.id === currentUserId ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    {!isSystemMessage(message) && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-sm">
                          {getInitials(message.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Message Content */}
                    <div className={`flex-1 ${message.user.id === currentUserId ? 'text-right' : ''}`}>
                      {!isSystemMessage(message) && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {message.user.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(message.createdAt)}
                          </span>
                          {message.user.id === currentUserId && (
                            <Badge variant="outline" className="text-xs">
                              Tú
                            </Badge>
                          )}
                        </div>
                      )}

                      <div
                        className={`inline-block max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          isSystemMessage(message)
                            ? `${getMessageTypeColor(message.type)} border text-sm`
                            : message.user.id === currentUserId
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getMessageIcon(message.type)}
                          <span>
                            {isSystemMessage(message) 
                              ? getSystemMessageContent(message)
                              : message.content
                            }
                          </span>
                        </div>
                      </div>

                      {isSystemMessage(message) && (
                        <div className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(message.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Message Input */}
          {canSendMessages ? (
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1"
                maxLength={500}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">
                Debes ser miembro de la iniciativa para enviar mensajes
              </p>
            </div>
          )}

          {/* Character count */}
          {canSendMessages && newMessage.length > 400 && (
            <div className="text-xs text-gray-500 text-right">
              {newMessage.length}/500 caracteres
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
