import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BriefcaseIcon, MapPinIcon, Building2Icon, Save, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/App';
import { useContext } from 'react';
import { apiRequest } from '@/lib/queryClient';

const jobSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo'),
  organization: z.string().min(1, 'La organización es requerida').max(100, 'La organización es muy larga'),
  location: z.string().min(1, 'La ubicación es requerida').max(100, 'La ubicación es muy larga'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000, 'La descripción es muy larga'),
  participants: z.number().min(1, 'Debe haber al menos 1 participante').optional(),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  contactPhone: z.string().min(10, 'Teléfono inválido').optional().or(z.literal('')),
  expiresAt: z.string().optional(),
  status: z.enum(['active', 'paused', 'closed']).default('active'),
});

type JobFormData = z.infer<typeof jobSchema>;

interface EditableJobPost {
  id: number;
  title?: string | null;
  organization?: string | null;
  location?: string | null;
  description?: string | null;
  participants?: number | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  expiresAt?: string | null;
  status?: 'active' | 'paused' | 'closed' | null;
}

const EditJob = () => {
  const [_, setLocation] = useLocation();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userContext = useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      status: 'active',
    },
  });

  // Fetch the existing job post
  const { data: jobPost, isLoading } = useQuery<EditableJobPost>({
    queryKey: [`/api/community/${id}`],
    enabled: !!id,
    staleTime: 60000,
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (jobPost) {
      setValue('title', jobPost.title || '');
      setValue('organization', jobPost.organization || '');
      setValue('location', jobPost.location || '');
      setValue('description', jobPost.description || '');
      setValue('participants', jobPost.participants || 1);
      setValue('contactEmail', jobPost.contactEmail || '');
      setValue('contactPhone', jobPost.contactPhone || '');
      setValue('expiresAt', jobPost.expiresAt || '');
      setValue('status', jobPost.status || 'active');
    }
  }, [jobPost, setValue]);

  // Update mutation
  const updateJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const response = await apiRequest('PUT', `/api/community/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '¡Empleo actualizado!',
        description: 'Tu publicación de empleo ha sido actualizada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/community'] });
      queryClient.invalidateQueries({ queryKey: [`/api/community/${id}`] });
      setLocation('/community');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);
    updateJobMutation.mutate(data);
  };

  const handleCancel = () => {
    setLocation('/community');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando empleo...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!jobPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Empleo no encontrado</h1>
            <p className="text-gray-600 mb-6">El empleo que buscas no existe o no tienes permisos para editarlo.</p>
            <Button onClick={() => setLocation('/community')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la Comunidad
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BriefcaseIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Empleo</h1>
              <p className="text-gray-600">Actualiza la información de tu oferta laboral</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Información del Empleo
            </CardTitle>
            <CardDescription>
              Completa todos los campos para actualizar tu publicación
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título del Empleo *
                </label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Ej: Desarrollador Frontend"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Organization */}
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
                  Organización *
                </label>
                <div className="relative">
                  <Building2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="organization"
                    {...register('organization')}
                    placeholder="Nombre de la empresa u organización"
                    className={`pl-10 ${errors.organization ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.organization && (
                  <p className="mt-1 text-sm text-red-600">{errors.organization.message}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación *
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    {...register('location')}
                    placeholder="Ciudad, Provincia"
                    className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe las responsabilidades, requisitos y beneficios del empleo..."
                  rows={6}
                  className={errors.description ? 'border-red-500' : ''}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {watch('description')?.length || 0}/1000 caracteres
                </p>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Contacto
                  </label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...register('contactEmail')}
                    placeholder="contacto@empresa.com"
                    className={errors.contactEmail ? 'border-red-500' : ''}
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de Contacto
                  </label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    {...register('contactPhone')}
                    placeholder="+54 11 1234-5678"
                    className={errors.contactPhone ? 'border-red-500' : ''}
                  />
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                  )}
                </div>
              </div>

              {/* Expiration Date */}
              <div>
                <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <Input
                  id="expiresAt"
                  type="date"
                  {...register('expiresAt')}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Deja vacío si no tiene fecha de vencimiento
                </p>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de la Publicación
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="closed">Cerrado</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Activo: Visible para todos | Pausado: Temporalmente oculto | Cerrado: No acepta más aplicaciones
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Actualizar Empleo
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default EditJob;
