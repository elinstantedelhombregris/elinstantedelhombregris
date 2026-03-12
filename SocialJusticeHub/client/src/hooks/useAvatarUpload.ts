import React, { useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserContext } from '@/App';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

export function useAvatarUpload(fileInputRef: React.RefObject<HTMLInputElement>) {
  const userContext = useContext(UserContext);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('La imagen es demasiado grande. Máximo 2MB.');
      }
      if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
        throw new Error('Formato no soportado. Usá PNG, JPEG, WebP o GIF.');
      }
      return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const response = await apiRequest('POST', '/api/auth/avatar', { image: reader.result });
            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.message || 'Error al subir el avatar');
            }
            resolve(await response.json());
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
      });
    },
    onSuccess: (data) => {
      if (userContext) userContext.setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({ title: 'Avatar actualizado', description: 'Tu imagen de perfil fue actualizada.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/auth/avatar');
      if (!response.ok) throw new Error('Error al eliminar el avatar');
      return response.json();
    },
    onSuccess: (data) => {
      if (userContext) userContext.setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({ title: 'Avatar eliminado', description: 'Se restauró el avatar por defecto.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo eliminar el avatar', variant: 'destructive' });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return {
    uploadMutation,
    deleteMutation,
    handleFileChange,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
