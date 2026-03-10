import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Share2Icon, ArrowLeft, Calendar, Clock, Phone, Mail, Link } from 'lucide-react';

// Esquema para validación del formulario
const resourceFormSchema = z.object({
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres' }),
  provider: z.string().min(2, { message: 'Nombre del proveedor requerido' }),
  location: z.string().min(2, { message: 'Ubicación requerida' }),
  resourceType: z.string(),
  description: z.string().min(20, { message: 'La descripción debe tener al menos 20 caracteres' }),
  availability: z.string().optional(),
  contactEmail: z.string().email({ message: 'Email inválido' }),
  contactPhone: z.string().optional(),
  website: z.string().url({ message: 'URL inválida' }).optional().or(z.literal('')),
  isFree: z.boolean().default(false),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

const CreateResource = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Configurar formulario con validación
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: '',
      provider: '',
      location: '',
      resourceType: 'knowledge',
      description: '',
      availability: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      isFree: true,
    },
  });
  
  // Mutación para crear un recurso
  const createResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/community', {
        ...data,
        type: 'resource',
        participants: 0,
      });
      return response.json();
    },
    onSuccess: () => {
      // Actualizar cache de consulta
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      
      // Mostrar mensaje de éxito
      toast({
        title: "¡Recurso compartido!",
        description: "Tu recurso ha sido publicado exitosamente.",
      });
      
      // Redirigir a la página de comunidad
      navigate('/community');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo compartir el recurso. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Manejar envío del formulario
  const onSubmit = (values: ResourceFormValues) => {
    createResourceMutation.mutate(values);
  };
  
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/community')} 
        className="mb-6 text-gray-600"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Volver a Comunidad
      </Button>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-pink-100 rounded-lg mr-4">
            <Share2Icon className="h-6 w-6 text-pink-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Compartir un recurso</h1>
            <p className="text-gray-600">Ofrece tus conocimientos, servicios o bienes para ayudar a otros</p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del recurso</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Clases de Guitarra" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ofrecido por</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Tu nombre o institución" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: La Plata, Online" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="resourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de recurso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="knowledge">Conocimientos/Enseñanza</SelectItem>
                        <SelectItem value="service">Servicio</SelectItem>
                        <SelectItem value="goods">Bienes/Materiales</SelectItem>
                        <SelectItem value="space">Espacio físico</SelectItem>
                        <SelectItem value="equipment">Equipamiento</SelectItem>
                        <SelectItem value="mentoring">Mentoría/Asesoría</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del recurso</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe qué ofreces, para quién es útil y cómo pueden aprovecharlo" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Disponibilidad (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ej: Disponible los sábados de 10 a 12hs, o durante todo mayo" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Es gratuito</FormLabel>
                    <FormDescription>
                      Marca esta opción si ofreces este recurso sin costo
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contacto</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input type="email" placeholder="contacto@ejemplo.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono (opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input placeholder="+54 9 11 1234-5678" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Sitio web (opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input placeholder="https://www.ejemplo.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/community')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-pink-600 hover:bg-pink-700"
                disabled={createResourceMutation.isPending}
              >
                {createResourceMutation.isPending ? "Compartiendo..." : "Compartir recurso"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateResource;