import { type CampanaPublica } from '@v2/shared';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CabeceraIdeal } from '@/components/civic/CabeceraIdeal';
import { BotonTinta, GranoPapel, Kicker, PapelCard, TituloAnton } from '@/components/papel';
import {
  IDEAL_API,
  borrarIdeal,
  borradoresIdeales,
  leerIdeal,
  mensajeDeRed,
  type BorradorIdeal,
} from '@/civic/ideal';
import {
  estadoDelBorrador,
  esCampanaEjemplo,
  fechaLarga,
  ordenarCampanas,
  rotuloEtapa,
} from '@/civic/ideal-textos';

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
      else setError(mensajeDeRed(cs.reason));
      if (bs.status === 'fulfilled') setBorradores(bs.value);
      else setError('No pudimos leer los borradores de este teléfono.');
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, []);
  useFocusEffect(cargar);
  const borrar = (id: string) =>
    Alert.alert(
      'Borrar del teléfono',
      'Si ya lo publicaste, sigue publicado. Si borrás esta copia, no vas a poder corregirlo ni retirarlo desde esta app.',
      [
        { text: 'Conservar', style: 'cancel' },
        {
          text: 'Borrar del teléfono',
          style: 'destructive',
          onPress: () => {
            void borrarIdeal(id)
              .then(() => borradoresIdeales())
              .then(setBorradores)
              .catch(() => setError('No pudimos borrar la copia de este teléfono.'));
          },
        },
      ],
    );
  return (
    <View className="bg-papel flex-1">
      <GranoPapel />
      <CabeceraIdeal kicker="Una pregunta nos reúne" titulo="Campañas." />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
      >
        <Text className="font-archivo text-tinta-75 text-base leading-7">
          Cada campaña plantea una pregunta, dice quién la coordina y cuándo devuelve lo que se
          leyó. Elegí una y sumá tu aporte.
        </Text>
        {cargando && (
          <Text className="font-archivo text-tinta mt-5 text-sm">Buscando campañas…</Text>
        )}
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
            Todavía no hay campañas publicadas. Podés sumar tu aporte igual: por ahora quedaría sin
            campaña.
          </Text>
        )}
        <View className="mt-6 gap-4">
          {ordenarCampanas(campanas).map((c) => {
            const ejemplo = esCampanaEjemplo(c);
            return (
              <PapelCard key={c.id} className={`gap-4 p-5 ${ejemplo ? 'border-dashed' : ''}`}>
                <Kicker>
                  {ejemplo ? 'Ejemplo local · sin convocatoria' : rotuloEtapa(c.estado)}
                </Kicker>
                <TituloAnton tamano="md">{c.contrato.titulo}</TituloAnton>
                <Text className="font-archivo text-tinta text-sm leading-6">
                  {c.contrato.pregunta}
                </Text>
                <Text className="font-archivo text-tinta-50 text-xs">
                  {ejemplo ? 'Fecha ilustrativa' : 'Devolución'}:{' '}
                  {fechaLarga(c.contrato.fechaDevolucion)} · {c.contrato.responsable}
                </Text>
                {ejemplo && (
                  <Text className="font-archivo text-tinta-75 text-xs leading-5">
                    Es un ejemplo para conocer cómo funciona una campaña: no tiene equipo operativo
                    ni recibe aportes.
                  </Text>
                )}
                {c.estado === 'abierta' && !ejemplo && (
                  <BotonTinta
                    etiqueta="Sumar mi aporte"
                    onPress={() =>
                      router.push({ pathname: '/imaginar', params: { campana: c.id } })
                    }
                  />
                )}
                <BotonTinta
                  etiqueta={ejemplo ? 'Explorar el ejemplo' : 'Leer las reglas de la campaña'}
                  variante="fantasma"
                  onPress={() => {
                    if (IDEAL_API)
                      void WebBrowser.openBrowserAsync(IDEAL_API + '/campanas/' + c.slug);
                  }}
                />
              </PapelCard>
            );
          })}
        </View>
        <View className="mt-7">
          <BotonTinta etiqueta="Imaginar mi Argentina" onPress={() => router.push('/imaginar')} />
        </View>
        <TituloAnton tamano="md" className="mt-9">
          Mis borradores.
        </TituloAnton>
        <Text className="font-archivo text-tinta-75 mt-3 text-sm leading-6">
          Estos textos están solo en este teléfono. Nada se publica sin que lo mandes vos.
        </Text>
        {!cargando && !borradores.length && (
          <Text className="font-archivo text-tinta mt-5 text-sm">
            No tenés borradores en este teléfono.
          </Text>
        )}
        <View className="mt-5 gap-4">
          {borradores.map((b) => (
            <PapelCard key={b.id} className="gap-3 p-5">
              <Text className="font-archivo text-tinta text-sm leading-6">
                {b.texto.trim() ? b.texto.slice(0, 180) : 'Borrador sin texto'}
              </Text>
              <Text className="font-archivo text-tinta-50 text-xs">{estadoDelBorrador(b)}</Text>
              <BotonTinta
                etiqueta="Retomar"
                variante="fantasma"
                onPress={() => router.push({ pathname: '/imaginar', params: { borrador: b.id } })}
              />
              <BotonTinta
                etiqueta="Borrar del teléfono"
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
              Ingresá en Mi espacio para ver tus aportes con tu cuenta. Los borradores siguen solo
              en este teléfono.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
