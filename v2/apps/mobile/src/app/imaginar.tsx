import { TemaIdeal } from '@/components/civic/TemaIdeal';
import { GestionAporteIdeal } from '@/components/civic/GestionAporteIdeal';
import { CabeceraIdeal } from '@/components/civic/CabeceraIdeal';
import { Eleccion } from '@/components/civic/EleccionIdeal';
import {
  CONTRATO_SENAL,
  TEXTO_CESION_LICENCIA,
  TEXTO_CONSENTIMIENTO_ACTOR,
  TEXTO_PUBLICACION_IRREVOCABLE,
  contribucionSchema,
} from '@v2/shared';
import * as Crypto from 'expo-crypto';
import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotonTinta, GranoPapel, PapelCard, TituloAnton } from '@/components/papel';
import {
  IDEAL_API,
  borradoresIdeales,
  borrarIdeal,
  cuentaIdealActual,
  guardarIdeal,
  leerCampanaIdeal,
  mensajeDeRed,
  publicarIdeal,
  rechazoEditable,
  type BorradorIdeal,
} from '@/civic/ideal';
import {
  borradorNuevo,
  borradorParaCambiarEnvio,
  borradorParaOtroAporte,
  campanaALeer,
  destinoDelEnvio,
  lecturaCoincide,
  lineaDeDestino,
  motivoSinPublicar,
  resolverDestino,
  type LecturaCampana,
} from '@/civic/ideal-aporte';
import { bloqueDeExito, esCampanaNacional, leyendaDelContador } from '@/civic/ideal-textos';
import { TINTA_50 } from '@/theme/tokens';

const CARGANDO: LecturaCampana = { tipo: 'cargando' };

export default function ImaginarIdeal() {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const params = useLocalSearchParams<{ campana?: string; borrador?: string }>();
  const [b, setB] = useState<BorradorIdeal>(() =>
    borradorNuevo(Crypto.randomUUID(), new Date(), {
      campanaId: params.campana ?? null,
      edicion: null,
    }),
  );
  // Qué campaña se leyó y qué se supo de ella. `pedida` es lo que se pidió (id o slug).
  const [leida, setLeida] = useState<{ pedida: string | null; lectura: LecturaCampana }>({
    pedida: null,
    lectura: CARGANDO,
  });
  const [intento, setIntento] = useState(0);
  const [revisado, setRevisado] = useState(false);
  const [licencia, setLicencia] = useState(false);
  const [autor, setAutor] = useState(false);
  const [publico, setPublico] = useState(false);
  const [error, setError] = useState('');
  const [rechazado, setRechazado] = useState(false);
  const [guardado, setGuardado] = useState<{ texto: string; falla: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let vivo = true;
    if (params.borrador)
      void borradoresIdeales()
        .then((lista) => {
          const x = lista.find((v) => v.id === params.borrador);
          if (x && vivo) setB(x);
        })
        .catch(() => {
          if (vivo) setError('No pudimos recuperar el borrador de este teléfono.');
        });
    return () => {
      vivo = false;
    };
  }, [params.borrador]);

  // La campaña que corresponde a este borrador: la elegida, la del envío ya confirmado, o la nacional.
  const aLeer = campanaALeer(b);
  useEffect(() => {
    if (aLeer === null) return;
    let vivo = true;
    void leerCampanaIdeal(aLeer).then((resultado) => {
      if (!vivo) return;
      setLeida({ pedida: aLeer, lectura: resultado });
      // Una campaña elegida a mano recuerda la edición con la que se empezó a escribir. La nacional
      // no: su edición se lee siempre de la campaña al publicar y nunca se guarda en el teléfono.
      if (resultado.tipo === 'ok' && !esCampanaNacional(resultado.campana))
        setB((x) =>
          x.envio || x.edicion !== null ? x : { ...x, edicion: resultado.campana.revision },
        );
    });
    return () => {
      vivo = false;
    };
  }, [aLeer, intento]);
  const lectura =
    aLeer !== null && (leida.pedida === aLeer || lecturaCoincide(aLeer, leida.lectura))
      ? leida.lectura
      : CARGANDO;
  const recargarCampana = () => {
    setLeida({ pedida: null, lectura: CARGANDO });
    setIntento((n) => n + 1);
  };

  const destino = resolverDestino({
    porDefecto: !b.envio && !b.campanaId,
    sinCampana: aLeer === null,
    edicion: b.edicion,
    lectura,
  });
  const campanaVisible =
    destino.tipo === 'campana' || destino.tipo === 'bloqueado' ? destino.campana : null;
  const motivo = b.envio
    ? null
    : motivoSinPublicar({
        texto: b.texto,
        asistido: b.modo === 'asistido',
        autor,
        revisado,
        publico,
        destino,
      });

  // Al publicar, el bloque de éxito queda arriba: se sube a verlo.
  useEffect(() => {
    if (b.recibo) scroll.current?.scrollTo({ y: 0, animated: true });
  }, [b.recibo]);

  const guardar = async () => {
    try {
      await guardarIdeal(b);
      setGuardado({
        texto: 'Guardado solo en este teléfono. Todavía no se publicó.',
        falla: false,
      });
    } catch {
      setGuardado({
        texto: 'No pudimos guardar en este teléfono. Copiá tu texto antes de salir.',
        falla: true,
      });
    }
  };
  const enviar = async () => {
    if (busy) return;
    const salida = b.envio ? null : destinoDelEnvio(destino);
    if (!b.envio && !salida) return;
    setBusy(true);
    setError('');
    setRechazado(false);
    try {
      await guardarIdeal(b);
      const cuenta = b.envio ? b.cuentaAlConfirmar : await cuentaIdealActual();
      const envio =
        b.envio ??
        contribucionSchema.parse({
          senal: {
            contrato: CONTRATO_SENAL,
            idLocal: b.id,
            tipo: 'sueño',
            texto: b.texto,
            tema: b.tema || null,
            casa: 'sinRespuesta',
            cedeLicencia: licencia,
          },
          campanaId: salida?.campanaId ?? null,
          edicion: salida?.edicion ?? null,
          modo: b.modo,
          autorConfirmo: autor,
          fragmentos: [],
          interpretacionConfirmada: true,
          aceptaPublicar: true,
        });
      const pendiente = {
        ...b,
        envio,
        cuentaAlConfirmar: cuenta,
      };
      await guardarIdeal(pendiente);
      setB(pendiente);
      const publicado = await publicarIdeal(pendiente);
      setB(publicado);
    } catch (e) {
      setError(mensajeDeRed(e));
      setRechazado(rechazoEditable(e));
    } finally {
      setBusy(false);
    }
  };
  // El servidor rechazó el envío: se descarta, con su identificador, y se vuelve a leer la campaña.
  // La copia anterior se borra del teléfono sólo después de guardar la nueva.
  const cambiarEnvio = async () => {
    const nuevo = borradorParaCambiarEnvio(b, Crypto.randomUUID());
    try {
      await guardarIdeal(nuevo);
      await borrarIdeal(b.id);
    } catch {
      setError('No pudimos guardar en este teléfono. Copiá tu texto antes de salir.');
      return;
    }
    setB(nuevo);
    setError('');
    setRechazado(false);
    recargarCampana();
  };
  const sumarOtro = () => {
    setB(borradorParaOtroAporte(b, Crypto.randomUUID(), new Date()));
    setRevisado(false);
    setLicencia(false);
    setAutor(false);
    setPublico(false);
    setError('');
    setRechazado(false);
    setGuardado(null);
    scroll.current?.scrollTo({ y: 0, animated: true });
  };

  const retirado = b.retirado === true;
  const linea = lineaDeDestino(destino);
  const exito = b.recibo
    ? bloqueDeExito({
        retirado,
        campanaId: b.envio?.campanaId ?? null,
        campana: lectura.tipo === 'ok' ? lectura.campana : null,
        leyendo: lectura.tipo === 'cargando',
      })
    : null;
  return (
    <View className="bg-papel flex-1">
      <GranoPapel />
      <CabeceraIdeal kicker="La ciudadanía diseña" titulo="Mi Argentina ideal." />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scroll}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
        >
          {exito && (
            <PapelCard className="mb-6 gap-4 p-5" accessibilityLiveRegion="polite">
              <TituloAnton tamano="md">{exito.titulo}</TituloAnton>
              <Text className="font-archivo text-tinta text-base leading-7">{exito.lead}</Text>
              {!!exito.campana && (
                <Text className="font-archivo text-tinta-75 text-sm leading-6">
                  {exito.campana}
                </Text>
              )}
              {!retirado && (
                <BotonTinta
                  etiqueta="Ver y gestionar mi aporte"
                  onPress={() => {
                    if (IDEAL_API && b.recibo)
                      void WebBrowser.openBrowserAsync(IDEAL_API + '/senal/' + b.recibo);
                  }}
                />
              )}
              <BotonTinta etiqueta="Sumar otro aporte" variante="fantasma" onPress={sumarOtro} />
            </PapelCard>
          )}
          {!b.recibo && (
            <>
              <Text className="font-archivo text-tinta-75 text-base leading-7">
                Empecemos por la vida que querrías poder vivir. Qué sería posible, por qué te
                importa y qué tendría que funcionar.
              </Text>
              {!!linea && (
                <Text className="font-archivo text-tinta mt-5 text-sm leading-5">{linea}</Text>
              )}
              {!b.envio && destino.tipo === 'bloqueado' && (
                <View className="mt-3 gap-3">
                  <Text
                    accessibilityRole="alert"
                    className="font-archivo text-sello text-sm leading-5"
                  >
                    {destino.mensaje}
                  </Text>
                  {destino.motivo === 'error' && (
                    <BotonTinta
                      etiqueta="Reintentar"
                      variante="fantasma"
                      onPress={recargarCampana}
                    />
                  )}
                  {destino.motivo === 'edicion' && (
                    <BotonTinta
                      etiqueta="Seguir con la edición actual"
                      variante="fantasma"
                      onPress={() => setB((x) => ({ ...x, edicion: null }))}
                    />
                  )}
                </View>
              )}
            </>
          )}
          <PapelCard className="mt-6 gap-4 p-5">
            <Text className="font-archivo-bold text-tinta text-lg">
              {campanaVisible?.contrato.pregunta ??
                'En tu Argentina ideal, ¿qué sería posible en tu vida?'}
            </Text>
            <TextInput
              accessibilityLabel="La vida que imagino"
              multiline
              maxLength={2000}
              editable={!b.envio}
              value={b.texto}
              onChangeText={(texto) => {
                setB((x) => ({ ...x, texto }));
                setRevisado(false);
              }}
              placeholder="En mi Argentina ideal…"
              placeholderTextColor={TINTA_50}
              className="border-tinta font-archivo text-tinta min-h-40 border p-3"
              textAlignVertical="top"
            />
            <Text className="font-archivo text-tinta-50 text-xs">
              {leyendaDelContador(b.texto.length, b)}
            </Text>
            {!b.envio && (
              <TemaIdeal valor={b.tema} cambiar={(tema) => setB((x) => ({ ...x, tema }))} />
            )}
            {!b.envio && (
              <>
                <Eleccion
                  texto="Estoy ayudando a otra persona a aportar"
                  valor={b.modo === 'asistido'}
                  cambiar={(x) => setB((v) => ({ ...v, modo: x ? 'asistido' : 'personal' }))}
                />
                {b.modo === 'asistido' && (
                  <Eleccion
                    texto="La persona revisó el texto y autorizó publicarlo"
                    valor={autor}
                    cambiar={setAutor}
                  />
                )}
                <Eleccion
                  texto="Este texto refleja lo que quiero expresar"
                  valor={revisado}
                  cambiar={setRevisado}
                />
                <Text className="font-archivo text-tinta-75 text-xs leading-5">
                  {TEXTO_CONSENTIMIENTO_ACTOR}
                </Text>
                <Eleccion
                  texto="Quiero publicar este aporte"
                  detalle={TEXTO_PUBLICACION_IRREVOCABLE}
                  valor={publico}
                  cambiar={setPublico}
                />
                <Eleccion
                  texto="Además, cedo el texto para que se pueda citar (opcional)"
                  detalle={TEXTO_CESION_LICENCIA}
                  valor={licencia}
                  cambiar={setLicencia}
                />
                {!licencia && (
                  <Text className="font-archivo text-tinta-75 text-xs leading-5">
                    Tu aporte cuenta igual; el texto queda reservado.
                  </Text>
                )}
              </>
            )}
            <Text className="font-archivo text-tinta-50 text-xs leading-5">
              Cuando publicás, guardamos una copia en este teléfono para recuperar el envío si se
              corta la conexión. Podés borrarla desde Mis borradores, en Campañas.
            </Text>
            {!b.recibo && (
              <BotonTinta
                etiqueta={b.envio ? 'Reintentar el mismo envío' : 'Publicar mi aporte'}
                accessibilityHint={motivo ?? undefined}
                disabled={busy || !!motivo}
                cargando={busy}
                onPress={() => {
                  void enviar();
                }}
              />
            )}
            {!b.recibo && !!motivo && (
              <Text
                accessibilityLiveRegion="polite"
                className="font-archivo text-tinta-75 text-xs leading-5"
              >
                {motivo}
              </Text>
            )}
            {!!error && (
              <Text accessibilityRole="alert" className="font-archivo text-sello text-sm leading-5">
                {error}
              </Text>
            )}
            {b.envio && !b.recibo && (
              <Text className="font-archivo text-tinta-75 text-sm leading-6">
                Guardamos este envío tal cual. Si no llegó la confirmación, reintentá: es el mismo
                envío, no se duplica. La app no lo reintenta sola.
              </Text>
            )}
            {b.envio && !b.recibo && rechazado && !busy && (
              <BotonTinta
                etiqueta="Cambiar el texto o el tema"
                variante="fantasma"
                onPress={() => {
                  void cambiarEnvio();
                }}
              />
            )}
          </PapelCard>
          {b.recibo && !retirado && (
            <GestionAporteIdeal
              id={b.recibo}
              alRetirar={() => {
                const retiro = { ...b, retirado: true };
                setB(retiro);
                void guardarIdeal(retiro).catch(() => undefined);
              }}
            />
          )}
          {!b.recibo && (
            <View className="mt-6 gap-4">
              <BotonTinta
                etiqueta="Guardar en este teléfono"
                variante="fantasma"
                onPress={() => {
                  void guardar();
                }}
              />
              {!!guardado && (
                <Text
                  accessibilityRole={guardado.falla ? 'alert' : undefined}
                  accessibilityLiveRegion="polite"
                  className={`font-archivo text-sm ${guardado.falla ? 'text-sello' : 'text-tinta'}`}
                >
                  {guardado.texto}
                </Text>
              )}
            </View>
          )}
          <Text className="font-archivo text-tinta-50 mt-6 text-xs leading-5">
            Los borradores no tienen cifrado propio. Si compartís el teléfono, revisá Mis borradores
            en Campañas y borrá lo que no quieras conservar. Ingresar en la web no los publica.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
