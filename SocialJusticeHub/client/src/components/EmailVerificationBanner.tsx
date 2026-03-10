import React, { useState, useContext } from 'react';
import { UserContext } from '@/App';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Mail, X, Check, Send } from 'lucide-react';

interface Props {
  variant?: 'dark' | 'light';
}

const DISMISS_KEY = 'email-verification-banner-dismissed';

const EmailVerificationBanner: React.FC<Props> = ({ variant = 'dark' }) => {
  const userContext = useContext(UserContext);
  const { toast } = useToast();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === 'true');
  const [sent, setSent] = useState(false);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/send-verification');
      if (!response.ok) throw new Error('Failed');
      return response.json();
    },
    onSuccess: () => {
      setSent(true);
      toast({ title: 'Email enviado', description: 'Revisá tu casilla de correo' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo enviar el email', variant: 'destructive' });
    },
  });

  if (!userContext?.user || userContext.user.emailVerified !== false || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setDismissed(true);
  };

  const isDark = variant === 'dark';

  return (
    <div className={`relative px-4 py-3 flex items-center justify-between gap-4 ${
      isDark
        ? 'bg-amber-500/10 border-b border-amber-500/20'
        : 'bg-amber-50 border-b border-amber-200'
    }`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Mail className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
        <p className={`text-sm truncate ${isDark ? 'text-amber-200/90' : 'text-amber-800'}`}>
          Tu email no está verificado. Verificalo para proteger tu cuenta.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {sent ? (
          <span className={`text-sm flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <Check className="h-4 w-4" /> Enviado
          </span>
        ) : (
          <Button
            size="sm"
            onClick={() => sendMutation.mutate()}
            disabled={sendMutation.isPending}
            className={`h-7 text-xs ${
              isDark
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
            }`}
          >
            <Send className="h-3 w-3 mr-1" />
            {sendMutation.isPending ? 'Enviando...' : 'Verificar email'}
          </Button>
        )}
        <button
          onClick={handleDismiss}
          className={`p-1 rounded-md transition-colors ${
            isDark ? 'text-amber-400/50 hover:text-amber-300 hover:bg-white/5' : 'text-amber-400 hover:text-amber-600 hover:bg-amber-100'
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
