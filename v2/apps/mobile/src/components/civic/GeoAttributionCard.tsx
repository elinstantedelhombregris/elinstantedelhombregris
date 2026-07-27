/**
 * GeoAttributionCard — el pin, la referencia pública, la precisión y la
 * firma de un registro cívico. El punto exacto queda en el dispositivo;
 * la red recibe una proyección reducida.
 *
 * Registro papel del sistema Papel y Tinta (spec §8): formulario canónico
 * sobre PapelCard — chips cuadrados, foco violeta, recibo con borde verde.
 * El color de señal (`accent`) marca la selección; la acción es tinta.
 */

import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import type {
  AttributionMode,
  CivicRecordContextDraft,
  LocationPrecision,
} from '@/civic/types';
import { sharedPrecisionLabel, validGeoPoint } from '@/civic/record-context';
import { obtenerUbicacion } from '@/lib/capturar-gps';
import { TINTA, TINTA_50, VIOLETA } from '@/theme/tokens';

import { BotonTinta, PapelCard } from '../papel';
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
}[] = [
  { key: 'anonymous', label: 'Sin firma visible', detail: 'La red conserva sólo un responsable interno.' },
  { key: 'alias', label: 'Con alias', detail: 'Una identidad comunitaria elegida por vos.' },
  { key: 'named', label: 'Con mi nombre', detail: 'Firma declarada; no equivale a identidad verificada.' },
];

const sourceLabel = (value: CivicRecordContextDraft['locationSource']): string => {
  if (value === 'gps_current') return 'GPS actual';
  if (value === 'map_pin') return 'Pin confirmado';
  if (value === 'manual') return 'Referencia manual';
  return 'Sin fuente';
};

/** Foco visible: borde violeta 2px (spec §3.5/§10) — nada de halo aparte. */
const estiloInput = (enfocado: boolean): object => ({
  borderWidth: enfocado ? 2 : 1,
  borderColor: enfocado ? VIOLETA : TINTA,
  outlineColor: VIOLETA,
  outlineStyle: 'solid' as const,
  outlineWidth: enfocado ? 2 : 0,
  outlineOffset: 2,
});

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
  accent = VIOLETA,
  requireLocation = true,
  showAttribution = true,
  privateOnly = false,
}: Props) {
  const [mapOpen, setMapOpen] = useState(value.point != null);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [enfocadoLugar, setEnfocadoLugar] = useState(false);
  const [enfocadoFirma, setEnfocadoFirma] = useState(false);
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
    <PapelCard className="p-0">
      <View className="p-5">
        <Text className="font-archivo-bold text-base text-tinta">{title}</Text>
        <Text className="mt-2 font-archivo text-xs leading-5 text-tinta-75">{description}</Text>

        <View className="mt-5 flex-row gap-2">
          <BotonTinta
            etiqueta={locating ? 'Ubicando…' : 'Usar GPS'}
            tamano="compacto"
            accessibilityLabel="Usar mi ubicación actual y luego confirmarla"
            onPress={useGps}
            disabled={locating}
            cargando={locating}
            className="flex-1"
          />
          <BotonTinta
            etiqueta={mapOpen ? 'Cerrar mapa' : 'Marcar pin'}
            variante="fantasma"
            tamano="compacto"
            accessibilityLabel="Marcar o corregir el lugar en el mapa"
            onPress={() => setMapOpen((current) => !current)}
            className="flex-1"
          />
        </View>

        {note && <Text accessibilityLiveRegion="polite" className="mt-3 font-archivo text-xs leading-5 text-ambar">{note}</Text>}
      </View>

      {mapOpen && (
        <View className="border-y border-tinta">
          <PlacePinMap value={value.point} onChange={setPin} height={230} />
          <View style={{ pointerEvents: 'none' }} className="absolute bottom-3 left-3 right-3 items-center">
            <View className="bg-tinta px-4 py-2">
              <Text className="font-space text-[11px] text-papel">
                {hasPlace ? 'Tocá otro lugar para corregir el pin' : 'Tocá el lugar del hecho o recurso'}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View className="p-5">
        <Text className="font-archivo-bold text-xs text-tinta">
          {privateOnly ? 'Referencia local del lugar' : 'Referencia pública del lugar'}
        </Text>
        <TextInput
          value={value.locationLabel}
          onChangeText={(locationLabel) => onChange({ ...value, locationLabel })}
          onFocus={() => setEnfocadoLugar(true)}
          onBlur={() => setEnfocadoLugar(false)}
          maxLength={120}
          placeholder={coarseLabel ? 'Ej. Barrio La Favorita · Godoy Cruz' : 'Ej. Plaza San Martín · parada frente al hospital'}
          placeholderTextColor={TINTA_50}
          accessibilityLabel="Nombre o referencia del lugar"
          className="mt-2 min-h-12 bg-papel-crudo px-4 font-archivo text-sm text-tinta"
          style={estiloInput(enfocadoLugar)}
        />
        <Text className="mt-2 font-archivo text-[10px] leading-4 text-tinta-50">
          {privateOnly
            ? 'Esta referencia queda en el dispositivo. Usá un punto seguro de encuentro o un hito, nunca un domicilio ni el nombre de una persona.'
            : coarseLabel
            ? 'La red verá esta referencia: escribí sólo barrio o localidad, nunca calles, domicilios ni nombres de personas.'
            : 'La red verá esta referencia: usá un hito público y nunca un domicilio particular ni el nombre de una persona.'}
        </Text>
        {requireLocation && (!hasPlace || !labelOk) && (
          <Text className="mt-3 font-archivo text-[11px] leading-5 text-ambar">
            Para que el dato pueda usarse, confirmá un pin y una referencia de al menos 3 caracteres.
          </Text>
        )}

        <Text className="mt-6 font-archivo-bold text-xs text-tinta">
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
                className="min-h-12 bg-papel-crudo px-4 py-2.5"
                style={{
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? accent : TINTA,
                }}
              >
                <Text className="font-archivo-bold text-xs text-tinta">{item.label}</Text>
                <Text className="mt-0.5 font-space text-[9px] text-tinta-50">{item.detail}</Text>
              </Pressable97>
            );
          })}
        </View>
        <Text className="mt-3 font-archivo text-[11px] leading-5 text-tinta-50">
          {privateOnly
            ? 'Nada se publica ahora. El punto queda local y esta precisión limita lo que podría autorizarse más adelante.'
            : 'El punto exacto queda en este dispositivo. El mapa común recibe una proyección reducida según esta elección.'}
        </Text>

        {showAttribution && (
          <>
            <Text className="mt-7 font-archivo-bold text-xs text-tinta">¿Cómo querés firmarlo?</Text>
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
                    className="min-h-16 justify-center bg-papel-crudo p-4"
                    style={{
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? accent : TINTA,
                    }}
                  >
                    <Text className="font-archivo-bold text-xs text-tinta">{item.label}</Text>
                    <Text className="mt-1 font-archivo text-[10px] leading-4 text-tinta-50">{item.detail}</Text>
                  </Pressable97>
                );
              })}
            </View>
            {value.attributionMode !== 'anonymous' && (
              <TextInput
                value={value.attributionName}
                onChangeText={(attributionName) => onChange({ ...value, attributionName })}
                onFocus={() => setEnfocadoFirma(true)}
                onBlur={() => setEnfocadoFirma(false)}
                maxLength={80}
                placeholder={value.attributionMode === 'alias' ? 'Tu alias comunitario' : 'Nombre que querés mostrar'}
                placeholderTextColor={TINTA_50}
                accessibilityLabel={value.attributionMode === 'alias' ? 'Alias visible' : 'Nombre visible'}
                className="mt-3 min-h-12 bg-papel-crudo px-4 font-archivo text-sm text-tinta"
                style={estiloInput(enfocadoFirma)}
              />
            )}
          </>
        )}

        <View className="mt-7 border border-verde bg-papel-crudo p-4">
          <Text className="font-space text-[10px] uppercase tracking-[2px] text-verde">
            {privateOnly ? 'Comprobante antes de guardar' : 'Recibo antes de publicar'}
          </Text>
          <View className="mt-3 gap-2">
            <Text className="font-archivo text-xs leading-5 text-tinta-90">
              {privateOnly ? 'Referencia local' : 'Referencia pública'}: {hasPlace ? `${value.locationLabel.trim() || 'sin nombre'} · ${sourceLabel(value.locationSource)}` : 'sin confirmar'}
            </Text>
            <Text className="font-archivo text-xs leading-5 text-tinta-90">Mapa: {sharedPrecisionLabel(value.sharedPrecision)}</Text>
            <Text className="font-archivo text-xs leading-5 text-tinta-90">
              Firma: {value.attributionMode === 'anonymous' ? 'sin firma visible' : value.attributionName.trim() || 'falta completar'}
            </Text>
          </View>
        </View>
      </View>
    </PapelCard>
  );
}

export const isGeoAttributionReady = (value: CivicRecordContextDraft): boolean =>
  validGeoPoint(value.point) != null
  && value.locationLabel.trim().length >= 3
  && (value.attributionMode === 'anonymous' || value.attributionName.trim().length >= 2);
