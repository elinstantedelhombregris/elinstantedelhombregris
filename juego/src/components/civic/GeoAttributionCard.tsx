import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import type {
  AttributionMode,
  CivicRecordContextDraft,
  LocationPrecision,
} from '@/civic/types';
import { sharedPrecisionLabel, validGeoPoint } from '@/civic/record-context';
import { obtenerUbicacion } from '@/lib/capturar-gps';

import { GlassCard } from '../ui/GlassCard';
import { Pressable97 } from '../ui/Pressable97';
import PlacePinMap from './PlacePinMap';

const PRECISIONS: readonly {
  key: Exclude<LocationPrecision, 'exact'>;
  label: string;
  detail: string;
}[] = [
  { key: '100m', label: '100 m', detail: 'infraestructura' },
  { key: '500m', label: '500 m', detail: 'cuadra amplia' },
  { key: 'neighborhood', label: 'Barrio', detail: 'protege hogares' },
  { key: 'city', label: 'Ciudad', detail: 'ideas generales' },
];

const ATTRIBUTIONS: readonly {
  key: AttributionMode;
  label: string;
  detail: string;
  icon: string;
}[] = [
  { key: 'anonymous', label: 'Sin firma visible', detail: 'La red conserva sólo un responsable interno.', icon: 'eye-off-outline' },
  { key: 'alias', label: 'Con alias', detail: 'Una identidad comunitaria elegida por vos.', icon: 'person-circle-outline' },
  { key: 'named', label: 'Con mi nombre', detail: 'Firma declarada; no equivale a identidad verificada.', icon: 'ribbon-outline' },
];

const sourceLabel = (value: CivicRecordContextDraft['locationSource']): string => {
  if (value === 'gps_current') return 'GPS actual';
  if (value === 'map_pin') return 'Pin confirmado';
  if (value === 'manual') return 'Referencia manual';
  return 'Sin fuente';
};

interface Props {
  value: CivicRecordContextDraft;
  onChange: (value: CivicRecordContextDraft) => void;
  title?: string;
  description?: string;
  accent?: string;
  requireLocation?: boolean;
  showAttribution?: boolean;
  /** Explica un punto que permanece local y no promete una divulgación. */
  privateOnly?: boolean;
}

export function GeoAttributionCard({
  value,
  onChange,
  title = 'Ubicá lo que estás registrando',
  description = 'El pin representa al problema o recurso, no necesariamente dónde estás vos. Podés usar GPS y después corregirlo.',
  accent = '#A78BFA',
  requireLocation = true,
  showAttribution = true,
  privateOnly = false,
}: Props) {
  const [mapOpen, setMapOpen] = useState(value.point != null);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const latestValue = useRef(value);
  useEffect(() => {
    latestValue.current = value;
  }, [value]);

  const useGps = async () => {
    if (locating) return;
    setLocating(true);
    setNote(null);
    const captured = await obtenerUbicacion();
    // Se valida al capturar: el recibo nunca muestra un punto que después
    // validGeoPoint anularía al persistir.
    const capturedPoint = captured ? validGeoPoint(captured.point) : null;
    if (captured && capturedPoint) {
      onChange({
        ...latestValue.current,
        point: capturedPoint,
        locationSource: captured.source,
        horizontalAccuracyM: captured.horizontalAccuracyM,
        capturedAt: captured.capturedAt,
      });
      setMapOpen(true);
    } else {
      setNote('No pudimos leer el GPS. Marcá el punto en el mapa; el aporte no tiene que ocurrir donde está tu teléfono.');
      setMapOpen(true);
    }
    setLocating(false);
  };

  const setPin = (point: NonNullable<CivicRecordContextDraft['point']>) => {
    const validPoint = validGeoPoint(point);
    if (!validPoint) {
      setNote('Ese punto no tiene coordenadas válidas. Tocá el mapa de nuevo para marcarlo.');
      return;
    }
    setNote(null);
    onChange({
      ...latestValue.current,
      point: validPoint,
      locationSource: 'map_pin',
      horizontalAccuracyM: null,
      capturedAt: new Date().toISOString(),
    });
  };

  const hasPlace = validGeoPoint(value.point) != null;
  const labelOk = value.locationLabel.trim().length >= 3;
  const coarseLabel = value.sharedPrecision === 'neighborhood' || value.sharedPrecision === 'city';

  return (
    <GlassCard className="overflow-hidden p-0">
      <View className="p-5">
        <View className="flex-row items-start gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${accent}18` }}>
            <Ionicons name="location" size={21} color={accent} />
          </View>
          <View className="flex-1">
            <Text className="font-serif text-[22px] leading-7 text-plata">{title}</Text>
            <Text className="mt-2 font-sans text-xs leading-5 text-slate-400">{description}</Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-2">
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Usar mi ubicación actual y luego confirmarla"
            onPress={useGps}
            disabled={locating}
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full border px-4"
            style={{ borderColor: `${accent}55`, backgroundColor: `${accent}14` }}
          >
            <Ionicons name={locating ? 'hourglass-outline' : 'navigate-outline'} size={16} color={accent} />
            <Text className="font-sans-semibold text-xs" style={{ color: accent }}>{locating ? 'Ubicando…' : 'Usar GPS'}</Text>
          </Pressable97>
          <Pressable97
            accessibilityRole="button"
            accessibilityLabel="Marcar o corregir el lugar en el mapa"
            onPress={() => setMapOpen((current) => !current)}
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4"
          >
            <Ionicons name="map-outline" size={16} color="#CBD5E1" />
            <Text className="font-sans-semibold text-xs text-slate-200">{mapOpen ? 'Cerrar mapa' : 'Marcar pin'}</Text>
          </Pressable97>
        </View>

        {note && <Text accessibilityLiveRegion="polite" className="mt-3 font-sans text-xs leading-5 text-amber-200">{note}</Text>}
      </View>

      {mapOpen && (
        <View className="border-y border-white/10">
          <PlacePinMap value={value.point} onChange={setPin} height={230} />
          <View style={{ pointerEvents: 'none' }} className="absolute bottom-3 left-3 right-3 items-center">
            <View className="rounded-full border border-white/10 bg-black/75 px-4 py-2">
              <Text className="font-sans-medium text-[11px] text-plata">
                {hasPlace ? 'Tocá otro lugar para corregir el pin' : 'Tocá el lugar del hecho o recurso'}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className="p-5">
        <Text className="font-sans-medium text-xs text-slate-300">
          {privateOnly ? 'Referencia local del lugar' : 'Referencia pública del lugar'}
        </Text>
        <TextInput
          value={value.locationLabel}
          onChangeText={(locationLabel) => onChange({ ...value, locationLabel })}
          maxLength={120}
          placeholder={coarseLabel ? 'Ej. Barrio La Favorita · Godoy Cruz' : 'Ej. Plaza San Martín · parada frente al hospital'}
          placeholderTextColor="#64748B"
          accessibilityLabel="Nombre o referencia del lugar"
          className="mt-2 min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 font-sans text-sm text-plata"
        />
        <Text className="mt-2 font-sans text-[10px] leading-4 text-slate-500">
          {privateOnly
            ? 'Esta referencia queda en el dispositivo. Usá un punto seguro de encuentro o un hito, nunca un domicilio ni el nombre de una persona.'
            : coarseLabel
            ? 'La red verá esta referencia: escribí sólo barrio o localidad, nunca calles, domicilios ni nombres de personas.'
            : 'La red verá esta referencia: usá un hito público y nunca un domicilio particular ni el nombre de una persona.'}
        </Text>
        {requireLocation && (!hasPlace || !labelOk) && (
          <View className="mt-3 flex-row items-center gap-2">
            <Ionicons name="alert-circle-outline" size={15} color="#FCD34D" />
            <Text className="flex-1 font-sans text-[11px] leading-5 text-amber-200">
              Para que el dato pueda usarse, confirmá un pin y una referencia de al menos 3 caracteres.
            </Text>
          </View>
        )}

        <Text className="mt-6 font-sans-medium text-xs text-slate-300">
          {privateOnly ? 'Precisión preparada para una futura derivación' : 'Precisión que verá la red'}
        </Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          {PRECISIONS.map((item) => {
            const selected = value.sharedPrecision === item.key;
            return (
              <Pressable97
                key={item.key}
                accessibilityRole="radio"
                accessibilityLabel={`${item.label}, ${item.detail}`}
                accessibilityState={{ selected }}
                onPress={() => onChange({ ...value, sharedPrecision: item.key })}
                className="min-h-12 rounded-2xl border px-4 py-2.5"
                style={{ borderColor: selected ? `${accent}66` : '#FFFFFF18', backgroundColor: selected ? `${accent}18` : '#FFFFFF08' }}
              >
                <Text className="font-sans-semibold text-xs" style={{ color: selected ? accent : '#CBD5E1' }}>{item.label}</Text>
                <Text className="mt-0.5 font-sans text-[9px] text-slate-500">{item.detail}</Text>
              </Pressable97>
            );
          })}
        </View>
        <Text className="mt-3 font-sans text-[11px] leading-5 text-slate-500">
          {privateOnly
            ? 'Nada se publica ahora. El punto queda local y esta precisión limita lo que podría autorizarse más adelante.'
            : 'El punto exacto queda en este dispositivo. El mapa común recibe una proyección reducida según esta elección.'}
        </Text>

        {showAttribution && (
          <>
            <Text className="mt-7 font-sans-medium text-xs text-slate-300">¿Cómo querés firmarlo?</Text>
            <View className="mt-3 gap-2">
              {ATTRIBUTIONS.map((item) => {
                const selected = value.attributionMode === item.key;
                return (
                  <Pressable97
                    key={item.key}
                    accessibilityRole="radio"
                    accessibilityLabel={`${item.label}. ${item.detail}`}
                    accessibilityState={{ selected }}
                    onPress={() => onChange({
                      ...value,
                      attributionMode: item.key,
                      attributionName: item.key === value.attributionMode ? value.attributionName : '',
                    })}
                    className="min-h-16 flex-row items-center rounded-2xl border p-4"
                    style={{ borderColor: selected ? `${accent}55` : '#FFFFFF14', backgroundColor: selected ? `${accent}12` : '#FFFFFF05' }}
                  >
                    <Ionicons name={item.icon as never} size={19} color={selected ? accent : '#64748B'} />
                    <View className="ml-3 flex-1">
                      <Text className="font-sans-semibold text-xs" style={{ color: selected ? '#F5F7FA' : '#CBD5E1' }}>{item.label}</Text>
                      <Text className="mt-1 font-sans text-[10px] leading-4 text-slate-500">{item.detail}</Text>
                    </View>
                    {selected && <Ionicons name="checkmark-circle" size={18} color={accent} />}
                  </Pressable97>
                );
              })}
            </View>
            {value.attributionMode !== 'anonymous' && (
              <TextInput
                value={value.attributionName}
                onChangeText={(attributionName) => onChange({ ...value, attributionName })}
                maxLength={80}
                placeholder={value.attributionMode === 'alias' ? 'Tu alias comunitario' : 'Nombre que querés mostrar'}
                placeholderTextColor="#64748B"
                accessibilityLabel={value.attributionMode === 'alias' ? 'Alias visible' : 'Nombre visible'}
                className="mt-3 min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 font-sans text-sm text-plata"
              />
            )}
          </>
        )}

        <View className="mt-7 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
          <Text className="font-sans text-[10px] uppercase tracking-[2px] text-emerald-300">
            {privateOnly ? 'Comprobante antes de guardar' : 'Recibo antes de publicar'}
          </Text>
          <View className="mt-3 gap-2">
            <Text className="font-sans text-xs leading-5 text-slate-300">
              {privateOnly ? 'Referencia local' : 'Referencia pública'}: {hasPlace ? `${value.locationLabel.trim() || 'sin nombre'} · ${sourceLabel(value.locationSource)}` : 'sin confirmar'}
            </Text>
            <Text className="font-sans text-xs leading-5 text-slate-300">Mapa: {sharedPrecisionLabel(value.sharedPrecision)}</Text>
            <Text className="font-sans text-xs leading-5 text-slate-300">
              Firma: {value.attributionMode === 'anonymous' ? 'sin firma visible' : value.attributionName.trim() || 'falta completar'}
            </Text>
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

export const isGeoAttributionReady = (value: CivicRecordContextDraft): boolean =>
  validGeoPoint(value.point) != null
  && value.locationLabel.trim().length >= 3
  && (value.attributionMode === 'anonymous' || value.attributionName.trim().length >= 2);
