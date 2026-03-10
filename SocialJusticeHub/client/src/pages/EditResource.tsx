import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Share2Icon, MapPinIcon, User, Save } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { UserContext } from '@/App';
import { useContext } from 'react';
import { apiRequest } from '@/lib/queryClient';

const resourceSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es muy largo'),
  provider: z.string().min(1, 'El proveedor es requerido').max(100, 'El proveedor es muy largo'),
  location: z.string().min(1, 'La ubicación es requerida').max(100, 'La ubicación es muy larga'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').max(1000, 'La descripción es muy larga'),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  contactPhone: z.string().min(10, 'Teléfono inválido').optional().or(z.literal('')),
  expiresAt: z.string().optional(),
  status: z.enum(['active', 'paused', 'closed']).default('active'),
});

type ResourceFormData = z.infer<typeof resourceSchema>;

const EditResource = () => {
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
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      status: 'active',
    },
  });

  // Fetch the existing resource post
  const { data: resourcePost, isLoading, isError, error } = useQuery({
    queryKey: [`/api/community/${id}`],
    enabled: !!id,
    staleTime: 60000,
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (resourcePost && typeof resourcePost === 'object' && resourcePost !== null) {
      const post = resourcePost as any;
      setValue('title', post.title || '');
      setValue('provider', post.provider || '');
      setValue('location', post.location || '');
      setValue('description', post.description || '');
      setValue('contactEmail', post.contactEmail || '');
      setValue('contactPhone', post.contactPhone || '');
      setValue('expiresAt', post.expiresAt || '');
      setValue('status', post.status || 'active');
    }
  }, [resourcePost, setValue]);

  // Update mutation
  const updateResourceMutation = useMutation({
    mutationFn: async (data: ResourceFormData) => {
      const response = await apiRequest('PUT', `/api/community/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: '¡Recurso actualizado!',
        description: 'Tu publicación de recurso ha sido actualizada exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
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

  const onSubmit = async (data: ResourceFormData) => {
    setIsSubmitting(true);
    updateResourceMutation.mutate(data);
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
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando recurso...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar</h1>
            <p className="text-gray-600 mb-6">{error?.message || 'Ocurrió un error al cargar el recurso.'}</p>
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

  if (!resourcePost) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Recurso no encontrado</h1>
            <p className="text-gray-600 mb-6">El recurso que buscas no existe o no tienes permisos para editarlo.</p>
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
            <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <Share2Icon className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Recurso</h1>
              <p className="text-gray-600">Actualiza la información del recurso que compartes</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Información del Recurso
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
                  Título del Recurso *
                </label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Ej: Computadoras para estudiantes"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              {/* Provider */}
              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="provider"
                    {...register('provider')}
                    placeholder="Tu nombre o nombre de la organización"
                    className={`pl-10 ${errors.provider ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.provider && (
                  <p className="mt-1 text-sm text-red-600">{errors.provider.message}</p>
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
                  placeholder="Describe el recurso, condiciones de uso, disponibilidad, etc..."
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
                    placeholder="contacto@recurso.com"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                  <option value="closed">Cerrado</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Activo: Visible para todos | Pausado: Temporalmente oculto | Cerrado: No disponible
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Actualizar Recurso
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

export default EditResource;
