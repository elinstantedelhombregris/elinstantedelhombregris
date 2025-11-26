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
import { BriefcaseIcon, ArrowLeft, Clock, MapPinIcon, Mail, Link } from 'lucide-react';

// Esquema para validación del formulario
const jobFormSchema = z.object({
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres' }),
  organization: z.string().min(2, { message: 'Organización requerida' }),
  location: z.string().min(2, { message: 'Ubicación requerida' }),
  jobType: z.string(),
  workModality: z.string(),
  description: z.string().min(20, { message: 'La descripción debe tener al menos 20 caracteres' }),
  requirements: z.string().optional(),
  salary: z.string().optional(),
  contactEmail: z.string().email({ message: 'Email inválido' }),
  contactPhone: z.string().optional(),
  website: z.string().url({ message: 'URL inválida' }).optional().or(z.literal('')),
  isRemote: z.boolean().default(false),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

const CreateJob = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Configurar formulario con validación
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      organization: '',
      location: '',
      jobType: 'full-time',
      workModality: 'presencial',
      description: '',
      requirements: '',
      salary: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      isRemote: false,
    },
  });
  
  // Mutación para crear un empleo
  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/community', {
        ...data,
        type: 'job',
        participants: 0,
      });
      return response.json();
    },
    onSuccess: () => {
      // Actualizar cache de consulta
      queryClient.invalidateQueries({ queryKey: ['/api/community'] });
      
      // Mostrar mensaje de éxito
      toast({
        title: "¡Oferta publicada!",
        description: "Tu oferta de empleo ha sido publicada exitosamente.",
      });
      
      // Redirigir a la página de comunidad
      navigate('/community');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo publicar la oferta. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
      console.error(error);
    }
  });
  
  // Manejar envío del formulario
  const onSubmit = (values: JobFormValues) => {
    createJobMutation.mutate(values);
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
          <div className="p-3 bg-blue-100 rounded-lg mr-4">
            <BriefcaseIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Publicar oferta laboral</h1>
            <p className="text-gray-600">Comparte una oferta de trabajo, pasantía o servicio profesional</p>
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
                    <FormLabel>Título del puesto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Diseñador Web Senior" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa u organización</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Empresa S.A." {...field} />
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
                      <Input placeholder="Ej: Buenos Aires, Argentina" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de empleo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full-time">Tiempo completo</SelectItem>
                        <SelectItem value="part-time">Medio tiempo</SelectItem>
                        <SelectItem value="contract">Contrato</SelectItem>
                        <SelectItem value="internship">Pasantía</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="volunteer">Voluntariado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="workModality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidad de trabajo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona modalidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="remoto">Remoto</SelectItem>
                        <SelectItem value="hibrido">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: $150,000 - $200,000" {...field} />
                    </FormControl>
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
                  <FormLabel>Descripción del puesto</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe las responsabilidades, beneficios y cualquier otra información relevante" 
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
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requisitos (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Experiencia, habilidades, estudios requeridos" 
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
              name="isRemote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Trabajo remoto disponible</FormLabel>
                    <FormDescription>
                      Marca esta opción si la posición puede ser completamente remota
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
                        <Input type="email" placeholder="rrhh@empresa.com" className="pl-10" {...field} />
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
                      <Input placeholder="+54 9 11 1234-5678" {...field} />
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
                    <FormLabel>Sitio web o enlace para aplicar (opcional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input placeholder="https://www.empresa.com/empleos" className="pl-10" {...field} />
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
                className="bg-blue-600 hover:bg-blue-700"
                disabled={createJobMutation.isPending}
              >
                {createJobMutation.isPending ? "Publicando..." : "Publicar oferta"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateJob;