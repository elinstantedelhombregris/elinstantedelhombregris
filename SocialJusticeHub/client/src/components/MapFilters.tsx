import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X, Search, MapPin } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Dream } from "@shared/schema";

interface MapFiltersProps {
  dreams: Dream[];
  onFilterChange: (filtered: Dream[]) => void;
  activeTab: 'dream' | 'value' | 'need' | 'basta';
  className?: string;
  defaultExpanded?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
}

const ARGENTINA_PROVINCES = [
  'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza',
  'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'
];

const ARGENTINA_REGIONS = [
  { value: 'norte', label: 'Norte', provinces: ['Jujuy', 'Salta', 'Tucumán', 'Catamarca', 'La Rioja', 'Santiago del Estero', 'Formosa', 'Chaco', 'Misiones', 'Corrientes'] },
  { value: 'centro', label: 'Centro', provinces: ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Entre Ríos', 'La Pampa'] },
  { value: 'cuyo', label: 'Cuyo', provinces: ['Mendoza', 'San Juan', 'San Luis'] },
  { value: 'patagonia', label: 'Patagonia', provinces: ['Neuquén', 'Río Negro', 'Chubut', 'Santa Cruz', 'Tierra del Fuego'] }
];

const MapFilters = ({
  dreams,
  onFilterChange,
  activeTab,
  className,
  defaultExpanded = false,
  showSearch = true,
  searchValue,
  onSearchValueChange
}: MapFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState(searchValue ?? '');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(defaultExpanded);

  useEffect(() => {
    if (searchValue !== undefined && searchValue !== searchQuery) {
      setSearchQuery(searchValue);
    }
  }, [searchValue]);

  // Filter dreams based on active tab
  const filteredByTab = dreams.filter((dream: Dream) => dream.type === activeTab);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...filteredByTab];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((dream: Dream) => {
        const content = (dream.dream || dream.value || dream.need || dream.basta || '').toLowerCase();
        const location = (dream.location || '').toLowerCase();
        return content.includes(query) || location.includes(query);
      });
    }

    // Filter by province
    if (selectedProvince !== 'all') {
      filtered = filtered.filter((dream: Dream) => {
        const location = (dream.location || '').toLowerCase();
        return location.includes(selectedProvince.toLowerCase());
      });
    }

    // Filter by region
    if (selectedRegion !== 'all') {
      const region = ARGENTINA_REGIONS.find(r => r.value === selectedRegion);
      if (region) {
        filtered = filtered.filter((dream: Dream) => {
          const location = (dream.location || '').toLowerCase();
          return region.provinces.some(province => 
            location.includes(province.toLowerCase())
          );
        });
      }
    }

    onFilterChange(filtered);
  };

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedProvince, selectedRegion, activeTab, dreams]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchValueChange?.(value);
  };

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    onSearchValueChange?.('');
    setSelectedProvince('all');
    setSelectedRegion('all');
    onFilterChange(filteredByTab);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedProvince !== 'all' || selectedRegion !== 'all';

  return (
    <div className={cn("bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800 text-sm">Filtros</h3>
        </div>
        <div className="flex items-center gap-1">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs h-7 px-2"
            >
              <X className="w-3 h-3 mr-1" />
              Limpiar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-7 px-2 text-xs"
          >
            {showFilters ? '−' : '+'}
          </Button>
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
      )}

      {showFilters && (
        <div className="space-y-2">
          {/* Region Filter */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1 block">
              Región
            </Label>
            <Select value={selectedRegion} onValueChange={handleRegionChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las regiones</SelectItem>
                {ARGENTINA_REGIONS.map(region => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Province Filter */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-1 block">
              Provincia
            </Label>
            <Select value={selectedProvince} onValueChange={handleProvinceChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las provincias</SelectItem>
                {ARGENTINA_PROVINCES.map(province => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapFilters;

