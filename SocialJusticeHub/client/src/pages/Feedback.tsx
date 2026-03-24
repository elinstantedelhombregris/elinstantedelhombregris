import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/App';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { MessageSquareHeart, Send, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

const feedbackSchema = z.object({
  type: z.enum(['critica', 'sugerencia', 'bug', 'otro'], {
    required_error: 'Seleccioná un tipo de feedback',
  }),
  content: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

const typeLabels: Record<string, string> = {
  critica: 'Crítica',
  sugerencia: 'Sugerencia',
  bug: 'Error / Bug',
  otro: 'Otro',
};

export default function Feedback() {
  const userContext = useContext(UserContext);
  const { toast } = useToast();

  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: undefined,
      content: '',
      email: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FeedbackValues) => {
      const response = await apiRequest('POST', '/api/feedback', {
        type: data.type,
        content: data.content,
        email: data.email || null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Gracias por tu feedback', description: 'Tu mensaje fue enviado correctamente.' });
      form.reset();
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo enviar el feedback. Intentá de nuevo.', variant: 'destructive' });
    },
  });

  const onSubmit = (values: FeedbackValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-16 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/">
          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <MessageSquareHeart className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Tu voz importa</h1>
          </div>
          <p className="text-slate-400 text-sm mb-8">
            Contanos qué pensás, qué mejorarías o qué no funciona. Cada mensaje nos ayuda a construir algo mejor.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Tipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Seleccioná un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Mensaje</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escribí tu feedback acá..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[140px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!userContext?.isLoggedIn && (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Email (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Para que podamos responderte"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Enviar feedback
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
