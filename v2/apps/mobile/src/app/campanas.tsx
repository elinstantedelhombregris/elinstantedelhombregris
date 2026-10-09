import { type CampanaPublica } from '@v2/shared';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotonTinta, Kicker, PapelCard, TituloAnton } from '@/components/papel';
import {
  IDEAL_API,
  borrarIdeal,
  borradoresIdeales,
  leerIdeal,
  type BorradorIdeal,
} from '@/civic/ideal';

export default function CampanasIdeales() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [campanas, setCampanas] = useState<CampanaPublica[]>([]);
  const [borradores, setBorradores] = useState<BorradorIdeal[]>([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const cargar = useCallback(() => {
    let vivo = true;
    setCargando(true);
    setError('');
    void Promise.allSettled([
      leerIdeal<CampanaPublica[]>('/api/v1/campanas'),
      borradoresIdeales(),
    ]).then(([cs, bs]) => {
      if (!vivo) return;
      if (cs.status === 'fulfilled') setCampanas(cs.value);
      else
        setError(cs.reason instanceof Error ? cs.reason.message : 'No pudimos leer las campañas.');
      if (bs.status === 'fulfilled') setBorradores(bs.value);
      else setError('No pudimos leer los borradores locales.');
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, []);
  useFocusEffect(cargar);
  const borrar = (id: string) =>
    Alert.alert(
      'Borrar esta copia local',
      'Si el aporte ya se compartió, borrar la copia no retira la publicación. El recibo conserva ese recorrido.',
      [
        { text: 'Conservar', style: 'cancel' },
        {
          text: 'Borrar copia',
          style: 'destructive',
          onPress: () => {
            void borrarIdeal(id)
              .then(() => borradoresIdeales())
              .then(setBorradores)
              .catch(() => setError('No pudimos borrar la copia.'));
          },
        },
      ],
    );
  return (
    <ScrollView
      className="bg-papel flex-1"
      contentContainerStyle={{
        padding: 20,
        paddingTop: insets.top + 20,
        paddingBottom: insets.bottom + 40,
      }}
    >
      <BotonTinta etiqueta="Volver" variante="fantasma" onPress={() => router.back()} />
      <Kicker className="mt-7">Una pregunta nos reúne</Kicker>
      <TituloAnton tamano="lg" className="mt-3">
        Campañas.
      </TituloAnton>
      <Text className="font-archivo text-tinta-75 mt-4 text-base leading-7">
        Una zona, un tema y una devolución. La vida que imaginás puede encontrarse con otras sin
        perder su voz.
      </Text>
      {cargando && <Text className="font-archivo text-tinta mt-5 text-sm">Buscando campañas…</Text>}
      {!!error && (
        <View className="mt-5 gap-3">
          <Text accessibilityRole="alert" className="font-archivo text-sello text-sm">
            {error}
          </Text>
          <BotonTinta
            etiqueta="Volver a buscar"
            variante="fantasma"
            onPress={() => {
              cargar();
            }}
          />
        </View>
      )}
      {!cargando && !error && !campanas.length && (
        <Text className="font-archivo text-tinta mt-5 text-sm">
          Todavía no hay campañas publicadas. Podés comenzar una reflexión nacional.
        </Text>
      )}
      <View className="mt-6 gap-4">
        {campanas.map((c) => (
          <PapelCard key={c.id} className="gap-4 p-5">
            <Kicker>{c.estado === 'abierta' ? 'Recibe aportes' : 'Proceso en otra fase'}</Kicker>
            <TituloAnton tamano="md">{c.contrato.titulo}</TituloAnton>
            <Text className="font-archivo text-tinta text-sm leading-6">{c.contrato.pregunta}</Text>
            <Text className="font-archivo text-tinta-50 text-xs">
              Devolución: {c.contrato.fechaDevolucion} · {c.contrato.responsable}
            </Text>
            {c.estado === 'abierta' && (
              <BotonTinta
                etiqueta="Imaginar en esta campaña"
                onPress={() => router.push({ pathname: '/imaginar', params: { campana: c.id } })}
              />
            )}
            <BotonTinta
              etiqueta="Leer contrato y seguir en la web"
              variante="fantasma"
              onPress={() => {
                if (IDEAL_API) void WebBrowser.openBrowserAsync(IDEAL_API + '/campanas/' + c.slug);
              }}
            />
          </PapelCard>
        ))}
      </View>
      <View className="mt-7">
        <BotonTinta etiqueta="Imaginar mi Argentina" onPress={() => router.push('/imaginar')} />
      </View>
      <TituloAnton tamano="md" className="mt-9">
        Lo que guardaste acá.
      </TituloAnton>
      <Text className="font-archivo text-tinta-75 mt-3 text-sm">
        Los borradores permanecen en este dispositivo. No son una cola de publicación automática.
      </Text>
      <View className="mt-5 gap-4">
        {borradores.map((b) => (
          <PapelCard key={b.id} className="gap-3 p-5">
            <Text className="font-archivo text-tinta text-sm leading-6">
              {b.texto.slice(0, 180)}
            </Text>
            <Text className="font-archivo text-tinta-50 text-xs">
              {b.recibo
                ? 'Compartido con recibo'
                : b.envio
                  ? 'Envío conservado para reintentar'
                  : 'Todavía privado'}
            </Text>
            <BotonTinta
              etiqueta="Retomar"
              variante="fantasma"
              onPress={() => router.push({ pathname: '/imaginar', params: { borrador: b.id } })}
            />
            <BotonTinta
              etiqueta="Borrar copia local"
              variante="fantasma"
              onPress={() => borrar(b.id)}
            />
          </PapelCard>
        ))}
      </View>
      {IDEAL_API && (
        <View className="mt-8">
          <BotonTinta
            etiqueta="Abrir Mi espacio"
            variante="fantasma"
            onPress={() => {
              router.push('/espacio-ideal');
            }}
          />
          <Text className="font-archivo text-tinta-50 mt-3 text-xs leading-5">
            Ingresá en Mi espacio para continuar con tu cuenta de v2. La sesión histórica de la app
            conserva su recorrido propio.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
