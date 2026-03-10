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
import { Building2Icon, ArrowLeft, Calendar, Clock, MapPinIcon } from 'lucide-react';

// Esquema para validación del formulario
const projectFormSchema = z.object({
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres' }),
  organizer: z.string().min(2, { message: 'Organizador requerido' }),
  location: z.string().min(2, { message: 'Ubicación requerida' }),
  projectType: z.string(),
  description: z.string().min(20, { message: 'La descripción debe tener al menos 20 caracteres' }),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  needsVolunteers: z.boolean().default(false),
  contactEmail: z.string().email({ message: 'Email inválido' }),
  contactPhone: z.string().optional(),
  goals: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const CreateProject = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Configurar formulario con validación
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: '',
      organizer: '',
      location: '',
      projectType: 'community',
      description: '',
      startDate: '',
      endDate: '',
      needsVolunteers: true,
      contactEmail: '',
      contactPhone: '',
      goals: '',
    },
  });
  
  // Mutación para crear un proyecto
  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/community', {
        ...data,
        type: 'project',
        participants: 0,
      });
      return response.json();
    },
    onSuccess: () => {
      // Actualizar cache de consulta
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      
      // Mostrar mensaje de éxito
      toast({
        title: "¡Proyecto creado!",
        description: "Tu proyecto ha sido publicado exitosamente.",
      });
      
      // Redirigir a la página de comunidad
      navigate('/community');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Manejar envío del formulario
  const onSubmit = (values: ProjectFormValues) => {
    createProjectMutation.mutate(values);
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
          <div className="p-3 bg-amber-100 rounded-lg mr-4">
            <Building2Icon className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Crear un proyecto local</h1>
            <p className="text-gray-600">Inicia un proyecto para tu comunidad</p>
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
                    <FormLabel>Nombre del proyecto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Huerta Comunitaria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="organizer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organizador</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Vecinos Unidos" {...field} />
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
                      <Input placeholder="Ej: Rosario, Santa Fe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de proyecto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="community">Comunitario</SelectItem>
                        <SelectItem value="education">Educativo</SelectItem>
                        <SelectItem value="environment">Ambiental</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="health">Salud</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="sports">Deportivo</SelectItem>
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
                  <FormLabel>Descripción del proyecto</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el proyecto, sus objetivos y cómo participar" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de inicio (opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de finalización (opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input type="date" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivos del proyecto (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explica qué quiere lograr este proyecto" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="needsVolunteers"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Necesita voluntarios</FormLabel>
                    <FormDescription>
                      Marca esta opción si necesitas ayuda de voluntarios
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
                      <Input type="email" placeholder="contacto@ejemplo.com" {...field} />
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
                      <Input placeholder="+54 9 11 1234-5678" {...field} />
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
                className="bg-amber-600 hover:bg-amber-700"
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? "Creando..." : "Crear proyecto"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateProject;