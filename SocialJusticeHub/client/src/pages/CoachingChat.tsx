import { useState, useContext, useRef, useEffect } from 'react';
import { UserContext } from '@/App';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Loader2, MessageCircle, Target, Calendar, Sparkles, Compass, Flag } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import {
  ACCENT_BUTTON,
  DISPLAY_GRADIENT,
  GLASS_CARD,
  GLASS_CARD_HOVER,
} from '@/lib/design-tokens';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SESSION_TYPES = [
  { value: 'ad_hoc', label: 'Charla libre', icon: MessageCircle, description: 'Hablemos sobre lo que quieras' },
  { value: 'weekly_reflection', label: 'Reflexión semanal', icon: Calendar, description: 'Repasemos tu semana' },
  { value: 'goal_review', label: 'Revisión de metas', icon: Target, description: 'Cómo van tus objetivos' },
  { value: 'growth_prompt', label: 'Impulso de crecimiento', icon: Sparkles, description: 'Desafiate a crecer' },
  { value: 'assessment_debrief', label: 'Análisis de evaluación', icon: Compass, description: 'Profundicemos en tu perfil' },
  { value: 'mission_active', label: 'Misión Activa', icon: Flag, description: 'Guía para tu acción cívica del día' },
];

const CoachingChat = () => {
  const userContext = useContext(UserContext);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!userContext?.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Button className={ACCENT_BUTTON} onClick={() => window.location.href = '/login'}>Iniciar sesión</Button>
        </div>
      </div>
    );
  }

  const startSession = async (sessionType: string) => {
    setIsStarting(true);
    try {
      const res = await apiRequest('POST', '/api/coaching/start', { sessionType });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Error starting session:', e);
    } finally {
      setIsStarting(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Optimistic update
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }]);

    setIsLoading(true);
    try {
      const res = await apiRequest('POST', `/api/coaching/${sessionId}/message`, {
        message: userMessage,
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Session type selection screen
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-10">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className={cn('text-3xl font-serif font-bold', DISPLAY_GRADIENT)}>Coaching Cívico</h1>
              <p className="text-slate-500 text-sm mt-1">Elegí el tipo de sesión que necesitás</p>
            </div>
          </div>

          <div className="space-y-3">
            {SESSION_TYPES.map(type => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={type.value}
                  onClick={() => startSession(type.value)}
                  disabled={isStarting}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'w-full flex items-center gap-4 p-5 rounded-xl border transition-all duration-300 text-left group disabled:opacity-50',
                    GLASS_CARD,
                    'hover:border-white/25 hover:bg-white/[0.06]'
                  )}
                >
                  {/* icon chip = neutral (rule 8) */}
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors duration-300">
                    <Icon className="h-6 w-6 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors duration-300">{type.label}</h3>
                    <p className="text-sm text-slate-500">{type.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {isStarting && (
            <div className="flex items-center justify-center gap-2 mt-8" style={{ color: '#9D85E8' }}>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Preparando tu sesión...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 flex flex-col">
      <Header />

      {/* Chat header */}
      <div className="border-b border-white/5 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => { setSessionId(null); setMessages([]); }} className="text-slate-400 hover:text-white transition-colors duration-300">
            <ArrowLeft className="h-5 w-5" />
          </button>
          {/* icon chip = neutral (rule 8) */}
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-slate-300" />
          </div>
          <span className="text-sm font-bold text-slate-200">Coach Cívico</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={cn(
                  'max-w-[85%] rounded-2xl px-5 py-3.5',
                  msg.role === 'user'
                    /* user bubble = violet accent (CTA/action) */
                    ? 'bg-[#7D5BDE] text-white rounded-br-md'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-md'
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span className={cn(
                    'text-[10px] mt-1 block',
                    msg.role === 'user' ? 'text-violet-200' : 'text-slate-600'
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-5 py-3.5">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 px-4 py-4 bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Escribí tu mensaje..."
            className="bg-white/5 border-white/10 text-white flex-1 focus:border-violet-500/50"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={cn('px-4', ACCENT_BUTTON)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoachingChat;
