import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Cargando...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Error al cargar datos",
  message = "No se pudieron cargar los datos. Por favor, intenta recargar la página.",
  onRetry,
  showBackButton = false,
  onBack
}) => {
  const handleRetry = onRetry || (() => window.location.reload());
  const handleBack = onBack || (() => window.history.back());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 mb-4">
          <Target className="h-12 w-12 mx-auto mb-2" />
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-gray-600 mt-2">{message}</p>
        </div>
        <div className="flex space-x-2 justify-center">
          <Button onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recargar página
          </Button>
          {showBackButton && (
            <Button variant="outline" onClick={handleBack}>
              Volver
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title = "No hay datos disponibles",
  message = "No se encontraron elementos para mostrar.",
  action
}) => {
  return (
    <div className="text-center py-12">
      {icon && (
        <div className="text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {action && action}
    </div>
  );
};
