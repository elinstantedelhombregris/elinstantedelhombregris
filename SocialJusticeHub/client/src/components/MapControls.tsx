import { Button } from "@/components/ui/button";
import { MapPin, ZoomIn, Layers, Compass } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MapControlsProps {
  onCenterArgentina?: () => void;
  onFitBounds?: () => void;
  onToggleViewMode?: () => void;
  viewMode?: 'markers' | 'heatmap';
  onMyLocation?: () => void;
  className?: string;
}

const MapControls = ({
  onCenterArgentina,
  onFitBounds,
  onToggleViewMode,
  viewMode = 'markers',
  onMyLocation,
  className
}: MapControlsProps) => {
  const baseButtonClasses =
    "bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white h-14 text-xs font-semibold flex items-center justify-center gap-2";

  return (
    <div
      className={cn(
        "absolute z-[1000] w-full max-w-[220px]",
        className ?? "top-4 right-4"
      )}
    >
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-2xl">
        <div className="grid grid-cols-2 gap-2">
          {onToggleViewMode && (
            <Button
              onClick={onToggleViewMode}
              variant="outline"
              className={cn(baseButtonClasses, "col-span-2")}
              title={viewMode === 'markers' ? 'Ver heatmap' : 'Ver marcadores'}
            >
              <Layers className="w-4 h-4" />
              {viewMode === 'markers' ? 'Heatmap' : 'Marcadores'}
            </Button>
          )}

          {onCenterArgentina && (
            <Button
              onClick={onCenterArgentina}
              variant="outline"
              className={baseButtonClasses}
              title="Centrar en Argentina"
            >
              <Compass className="w-4 h-4" />
              Argentina
            </Button>
          )}

          {onFitBounds && (
            <Button
              onClick={onFitBounds}
              variant="outline"
              className={baseButtonClasses}
              title="Ajustar vista a todas las contribuciones"
            >
              <ZoomIn className="w-4 h-4" />
              Ver todas
            </Button>
          )}

          {onMyLocation && (
            <Button
              onClick={onMyLocation}
              variant="outline"
              className={cn(baseButtonClasses, "col-span-2")}
              title="Ver mi región"
            >
              <MapPin className="w-4 h-4" />
              Mi región
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapControls;

