import { Dream } from "@shared/schema";

interface EnhancedPopupProps {
  dream: Dream;
  onViewDetails?: (dream: Dream) => void;
  onShare?: (dream: Dream) => void;
}

const EnhancedPopup = ({ dream, onViewDetails, onShare }: EnhancedPopupProps): string => {
  const getContent = () => {
    if (dream.type === 'dream' && dream.dream) return dream.dream;
    if (dream.type === 'value' && dream.value) return dream.value;
    if (dream.type === 'need' && dream.need) return dream.need;
    if (dream.type === 'basta' && dream.basta) return dream.basta;
    return '';
  };

  const getTypeLabel = () => {
    switch (dream.type) {
      case 'dream': return 'Sueño';
      case 'value': return 'Valor';
      case 'need': return 'Necesidad';
      case 'basta': return '¡BASTA!';
      default: return 'Contribución';
    }
  };

  const getTypeColor = () => {
    switch (dream.type) {
      case 'dream': return 'text-blue-600 bg-blue-50';
      case 'value': return 'text-pink-600 bg-pink-50';
      case 'need': return 'text-amber-600 bg-amber-50';
      case 'basta': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Fecha no disponible';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffMs = now.getTime() - dateObj.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'hace un momento';
      if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
      if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
      return `hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    } catch {
      return 'Fecha no disponible';
    }
  };

  const content = getContent();
  const truncatedContent = content.length > 150 ? content.substring(0, 150) + '...' : content;

  return `
    <div class="p-4 min-w-[280px] max-w-[320px]">
      <div class="flex items-center justify-between mb-3">
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor()}">
          ${getTypeLabel()}
        </span>
        ${dream.createdAt ? `
          <div class="flex items-center gap-1 text-xs text-gray-500">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            ${formatDate(dream.createdAt)}
          </div>
        ` : ''}
      </div>
      
      <p class="text-gray-800 text-sm leading-relaxed mb-4 line-clamp-4">
        "${truncatedContent}"
      </p>
      
      <div class="flex items-center gap-2 text-xs text-gray-500 mb-4 pb-3 border-b">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span>${dream.location || 'Argentina'}</span>
      </div>
      
      <div class="flex gap-2">
        ${onViewDetails ? `
          <button 
            class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
            onclick="window.dispatchEvent(new CustomEvent('viewDreamDetails', { detail: ${JSON.stringify(dream)} }))"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            Ver más
          </button>
        ` : ''}
        ${onShare ? `
          <button 
            class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
            onclick="window.dispatchEvent(new CustomEvent('shareDream', { detail: ${JSON.stringify(dream)} }))"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
          </button>
        ` : ''}
      </div>
    </div>
  `;
};

export default EnhancedPopup;

